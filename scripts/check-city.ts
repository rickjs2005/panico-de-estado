// Checa a cidade do Lula sem abrir o navegador: ids, distritos, sobreposições, portas,
// interiores (um por prédio), interações, trânsito e acessos.
// Uso: pnpm check:city
import {
  BUILDINGS,
  CACHACA,
  CITY,
  DISTRICTS,
  INTERIORS,
  NPCS,
  PARKING,
  POIS,
  PROPS,
  ROADS,
  SPAWN,
  STREET_CACHACA,
  VEHICLES,
  buildingRect,
  citySolids,
  districtById,
  doorPoint,
  interiorById,
  interiorNpcs,
  interiorProps,
  interiorSolids,
  interiorSpots,
  propRect,
  sideDoorFrac,
  stalls,
  type Solid,
} from "../src/world/cidade";
import { initialPlaces, PLACES } from "../src/world/cidade/places";
import { CAMPANHA, ITENS } from "../src/world/cidade/missoes/campanha";
import type { Efeito } from "../src/world/cidade/missoes/motor";
import { AMBIENT, CORES_TRANSITO } from "../src/world/cidade/vida";
import { ARESTAS, NOS, conectada, curva, semSaida } from "../src/world/cidade/ruas";
import { caminho, comprimento } from "../src/world/cidade/navegacao";
import { MIN_POR_DIA } from "../src/world/cidade/relogio";
import { agendaDe, alvoEm, BAR } from "../src/world/cidade/rotinas";
import { cityPropArt } from "../src/world/game/city/cityArt";
import { LOOKS } from "../src/world/looks";
import type { Point, Rect } from "../src/world/types";

const problems: string[] = [];
const warn = (where: string, msg: string) => problems.push(`${where}: ${msg}`);
const overlap = (a: Rect, b: Rect) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const inside = (p: Point, r: Rect) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;

// ---------- ids estáveis e únicos ----------
const allNpcs = [...NPCS, ...AMBIENT, ...INTERIORS.flatMap((i) => i.npcs)];
const groups: [string, { id: string }[]][] = [
  ["prédio", BUILDINGS],
  ["objeto", [...PROPS, ...INTERIORS.flatMap((i) => i.props)]],
  ["lugar", POIS],
  ["morador", allNpcs],
  ["veículo", VEHICLES],
  ["estacionamento", PARKING],
  ["cachaça", CACHACA],
  ["interior", INTERIORS],
  ["interação", INTERIORS.flatMap((i) => i.spots)],
  ["parede", INTERIORS.flatMap((i) => i.walls)],
  ["cômodo", INTERIORS.flatMap((i) => i.rooms)],
];
for (const [name, list] of groups) {
  const seen = new Set<string>();
  for (const item of list) {
    if (!/^[a-z0-9-]+$/.test(item.id)) warn(name, `id "${item.id}" precisa ser minúsculo, sem acento e sem espaço`);
    if (seen.has(item.id)) warn(name, `id repetido "${item.id}"`);
    seen.add(item.id);
  }
}

// ---------- prédios ----------
for (const b of BUILDINGS) {
  const r = buildingRect(b);
  const d = districtById(b.district);
  if (!inside({ x: r.x, y: r.y }, d.area) || !inside({ x: r.x + r.w, y: r.y + r.h }, d.area)) warn(b.id, `fora do distrito ${d.name}`);
  for (const road of ROADS) if (overlap(r, road.rect)) warn(b.id, `em cima da ${road.name}`);
  for (const o of BUILDINGS) if (o !== b && overlap(r, buildingRect(o))) warn(b.id, `encosta em ${o.id}`);
  const visualTop = b.y - b.h - (b.top ?? 0);
  for (const road of ROADS) {
    const covered = road.rect.y + road.rect.h - visualTop;
    if (r.x < road.rect.x + road.rect.w && r.x + r.w > road.rect.x && road.rect.w > road.rect.h && covered > 75 && road.rect.y < b.y) warn(b.id, `telhado cobre ${Math.round(covered)} px da ${road.name}`);
  }
  if (b.place && !(b.place in PLACES)) warn(b.id, `estado de lugar desconhecido "${b.place}"`);
  const i = b.interior ? interiorById(b.interior) : undefined;
  if (!i) warn(b.id, "sem interior");
  else if (i.building !== b.id) warn(b.id, `interior "${i.id}" aponta para outro prédio (${i.building})`);
}
for (const i of INTERIORS) if (!BUILDINGS.some((b) => b.id === i.building && b.interior === i.id)) warn(i.id, "interior sem prédio com porta");
for (const n of allNpcs) if (!(n.look in LOOKS)) warn(n.id, `aparência desconhecida "${n.look}"`);

// ---------- portas: nada sólido nem alto na frente ----------
for (const b of BUILDINGS) {
  const doors = [doorPoint(b)];
  if (sideDoorFrac(b) !== null) doors.push(doorPoint(b, true));
  for (const d of doors) {
    const front: Rect = { x: d.x - 22, y: b.y + b.d + 2, w: 44, h: 40 };
    const facade: Rect = { x: d.x - 18, y: b.y + b.d - 56, w: 36, h: 56 };
    for (const p of PROPS) {
      const sr = propRect(p);
      if (sr && overlap(sr, front)) warn(`porta de ${b.id}`, `bloqueada por ${p.id}`);
      if (p.y > b.y + b.d) {
        const art = cityPropArt(p.kind, p.variant);
        const vis = { x: p.x - art.w / 2 + 6, y: p.y - art.h * art.originY, w: art.w - 12, h: art.h * art.originY };
        if (art.h > 40 && overlap(vis, facade)) warn(`porta de ${b.id}`, `escondida atrás de ${p.id}`);
      }
    }
  }
}

// ---------- busca em grade ----------
const CELL = 10;
interface Grid {
  g: Uint8Array;
  x0: number;
  y0: number;
  gw: number;
  gh: number;
}

function blockedGrid(solids: Solid[], area: Rect, r: number): Grid {
  const x0 = area.x;
  const y0 = area.y;
  const gw = Math.ceil(area.w / CELL);
  const gh = Math.ceil(area.h / CELL);
  const g = new Uint8Array(gw * gh);
  for (const s of solids) {
    const gx0 = Math.max(0, Math.floor((s.x - r - x0) / CELL));
    const gx1 = Math.min(gw - 1, Math.ceil((s.x + s.w + r - x0) / CELL));
    const gy0 = Math.max(0, Math.floor((s.y - r - y0) / CELL));
    const gy1 = Math.min(gh - 1, Math.ceil((s.y + s.h + r - y0) / CELL));
    for (let gy = gy0; gy <= gy1; gy++) {
      for (let gx = gx0; gx <= gx1; gx++) {
        const cx = x0 + gx * CELL + CELL / 2;
        const cy = y0 + gy * CELL + CELL / 2;
        const nx = Math.max(s.x, Math.min(cx, s.x + s.w));
        const ny = Math.max(s.y, Math.min(cy, s.y + s.h));
        if ((cx - nx) ** 2 + (cy - ny) ** 2 < r * r) g[gy * gw + gx] = 1;
      }
    }
  }
  return { g, x0, y0, gw, gh };
}

function flood(grid: Grid, start: Point): Grid {
  const { gw, gh } = grid;
  const seen = new Uint8Array(gw * gh);
  const sx = Math.floor((start.x - grid.x0) / CELL);
  const sy = Math.floor((start.y - grid.y0) / CELL);
  const out = { ...grid, g: seen };
  if (sx < 0 || sy < 0 || sx >= gw || sy >= gh) return out;
  const q: number[] = [sy * gw + sx];
  if (grid.g[q[0]]) return out;
  seen[q[0]] = 1;
  while (q.length) {
    const c = q.pop()!;
    const x = c % gw;
    const y = (c - x) / gw;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) continue;
      const n = ny * gw + nx;
      if (!seen[n] && !grid.g[n]) {
        seen[n] = 1;
        q.push(n);
      }
    }
  }
  return out;
}

/** Alguma célula alcançada a até `radius` px do ponto? */
function reached(seen: Grid, p: Point, radius: number): boolean {
  const r = Math.ceil(radius / CELL);
  const cx = Math.floor((p.x - seen.x0) / CELL);
  const cy = Math.floor((p.y - seen.y0) / CELL);
  for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) if (x >= 0 && y >= 0 && x < seen.gw && y < seen.gh && seen.g[y * seen.gw + x]) return true;
  return false;
}

const solids = citySolids();
const CITY_AREA = { x: 0, y: 0, w: CITY.w, h: CITY.h };
const walkGrid = blockedGrid(solids, CITY_AREA, 10);
const walk = flood(walkGrid, SPAWN.hero);
if (!reached(walk, SPAWN.hero, 0)) warn("início", "o Lula começa dentro de algo sólido");
for (const p of POIS) if (!reached(walk, p, 60)) warn(`lugar ${p.id}`, "inalcançável a pé");
for (const b of BUILDINGS) {
  if (!reached(walk, doorPoint(b), 12)) warn(`porta de ${b.id}`, "inalcançável a pé");
  if (sideDoorFrac(b) !== null && !reached(walk, doorPoint(b, true), 12)) warn(`porta lateral de ${b.id}`, "inalcançável a pé");
}
for (const c of STREET_CACHACA) if (!reached(walk, c, 40)) warn(`cachaça ${c.id}`, "inalcançável a pé");
for (const n of [...NPCS, ...AMBIENT]) {
  if (!reached(walk, n, 30)) warn(`morador ${n.id}`, "inalcançável a pé");
  for (const q of n.route ?? []) if (!reached(walk, q, 14)) warn(`morador ${n.id}`, `percurso passa por (${q.x}, ${q.y}), que não é caminhável`);
}
for (const v of VEHICLES) if (!reached(walk, v, 60)) warn(`veículo ${v.id}`, "não dá para chegar a pé");
for (const d of DISTRICTS) {
  const c = { x: d.area.x + d.area.w / 2, y: d.area.y + d.area.h / 2 };
  if (!reached(walk, c, 300)) warn(`distrito ${d.id}`, "centro inalcançável a pé");
}

// ---------- interiores: um por prédio, com entrada livre, saída e interações alcançáveis ----------
// chaves de campanha que as condições `when` dos interiores podem citar: pontos, flags e missões da campanha
const flagsDaCampanha = new Set<string>();
const pontosDaCampanha = new Set<string>();
const etapasDaCampanha = new Map<string, Set<string>>();
{
  const colhe = (fs: Efeito[]) => {
    for (const f of fs) {
      if ("marca" in f) {
        flagsDaCampanha.add(f.marca);
        if (f.conta) flagsDaCampanha.add(f.conta);
      } else if ("flag" in f && "valor" in f) flagsDaCampanha.add(f.flag);
      else if ("cicla" in f) flagsDaCampanha.add(f.cicla);
      else if ("se" in f) {
        colhe(f.entao);
        colhe(f.senao ?? []);
      }
    }
  };
  for (const m of CAMPANHA.missoes) {
    etapasDaCampanha.set(m.id, new Set(m.etapas.map((e) => e.id)));
    for (const p of m.pontos) pontosDaCampanha.add(p.id);
    for (const e of m.etapas) for (const r of e.regras) colhe(r.faz);
  }
}
/** A condição cita algo que existe? (lugares de places.ts ou chaves da campanha). */
function chaveValida(place: string, state: string): string | null {
  const [tipo, resto] = place.split(":");
  if (tipo === "ponto") return pontosDaCampanha.has(resto) && state === "sim" ? null : `ponto de missão inexistente: ${place}`;
  if (tipo === "flag") return flagsDaCampanha.has(place.slice(5)) && state === "sim" ? null : `flag de missão que nenhuma regra define: ${place}`;
  if (tipo === "missao") return CAMPANHA.missoes.some((m) => m.id === resto) && (state === "concluida" || state === "ativa") ? null : `missão inexistente: ${place}=${state}`;
  if (tipo === "etapa") return etapasDaCampanha.get(resto)?.has(state) ? null : `etapa inexistente: ${place}=${state}`;
  if (place === "item") return state === "" || state in ITENS ? null : `item inexistente: ${state}`;
  const def = (PLACES as Record<string, { states: Record<string, string> }>)[place];
  if (!def) return `cita um lugar inexistente: ${place}`;
  return state in def.states ? null : `cita um estado inexistente: ${place}=${state}`;
}
const stateSets: Record<string, string>[] = [initialPlaces()];
for (const [id, def] of Object.entries(PLACES)) for (const st of Object.keys(def.states)) if (st !== def.initial) stateSets.push({ ...initialPlaces(), [id]: st });
// cenários da campanha: tudo o que depende de missão aparecendo (pontos ativos) e depois de concluída (flags e missões)
stateSets.push({ ...initialPlaces(), ...Object.fromEntries([...pontosDaCampanha].map((p) => [`ponto:${p}`, "sim"])), item: "" });
stateSets.push({ ...initialPlaces(), ...Object.fromEntries([...flagsDaCampanha].map((f) => [`flag:${f}`, "sim"])), ...Object.fromEntries(CAMPANHA.missoes.map((m) => [`missao:${m.id}`, "concluida"])) });
let spotCount = 0;
for (const i of INTERIORS) {
  const area = { x: i.room.x - 40, y: i.room.y - 40, w: i.room.w + 80, h: i.room.h + 80 };
  if (i.spots.length < 2) warn(i.id, `só ${i.spots.length} interação(ões); o mínimo é 2`);
  if (!i.rooms.length) warn(i.id, "sem cômodos");
  for (const room of i.rooms) if (!overlap(room.rect, i.room) || room.rect.x < i.room.x - 1 || room.rect.x + room.rect.w > i.room.x + i.room.w + 1) warn(room.id, "cômodo fora do interior");
  if (i.exit.y < i.room.y + i.room.h - 30) warn(i.id, "a saída precisa ficar junto à parede de baixo");
  const propIds = new Set(i.props.map((p) => p.id));
  for (const s of i.spots) if (s.prop && !propIds.has(s.prop)) warn(s.id, `aponta para objeto inexistente ${s.prop}`);
  // estados citados por objetos, interações, cartazes e moradores precisam existir em places.ts
  const conds = [
    ...i.props.map((p) => ({ id: p.id, c: p.when })),
    ...i.spots.flatMap((s) => [{ id: s.id, c: s.when }, { id: s.id, c: s.setPlace }]),
    ...i.posters.map((p) => ({ id: `${i.id}/cartaz "${p.text}"`, c: p.when })),
    ...i.npcs.map((n) => ({ id: n.id, c: n.when })),
  ];
  for (const { id, c } of conds) {
    if (!c) continue;
    const erro = chaveValida(c.place, c.state);
    if (erro) warn(id, erro);
  }
  // quem muda um lugar precisa poder desfazer: em cada estado do lugar tem de existir a interação de volta
  for (const s of i.spots) {
    if (!s.setPlace) continue;
    const def = (PLACES as Record<string, { states: Record<string, string> }>)[s.setPlace.place];
    if (!def) continue;
    for (const st of Object.keys(def.states)) {
      const places = { ...initialPlaces(), [s.setPlace.place]: st } as Record<string, string>;
      const here = interiorSpots(i, places).filter((x) => x.setPlace);
      if (!here.length) warn(s.id, `com ${s.setPlace.place}=${st} não existe interação para mudar o estado de novo`);
    }
  }
  for (const p of i.props) {
    if (!inside(p, { x: i.room.x - 1, y: i.room.y - 1, w: i.room.w + 2, h: i.room.h + 2 })) warn(p.id, "objeto fora do interior");
    const r = propRect(p);
    if (!r) continue;
    for (const w of i.walls) if (overlap(r, w)) warn(p.id, `atravessa a parede ${w.id}`);
    if (r.y < i.room.y + i.wallH - 2) warn(p.id, "entra na parede do fundo");
    if (r.x < i.room.x || r.x + r.w > i.room.x + i.room.w || r.y + r.h > i.room.y + i.room.h) warn(p.id, "sai pelas paredes externas");
  }
  for (const places of stateSets) {
    const sol = interiorSolids(i, places);
    const tag = places === stateSets[0] ? "" : ` (com ${Object.entries(places).filter(([k, v]) => v !== initialPlaces()[k as keyof ReturnType<typeof initialPlaces>]).map(([k, v]) => `${k}=${v}`).join(",")})`;
    if (places !== stateSets[0] && !interiorProps(i, places).some((p) => p.when) && !i.props.some((p) => p.when)) continue;
    const grid = blockedGrid(sol, area, 10);
    const seen = flood(grid, i.entry);
    if (!reached(seen, i.entry, 0)) warn(i.id, `a entrada fica dentro de algo sólido${tag}`);
    if (!reached(seen, i.exit, 20)) warn(i.id, `não dá para chegar à saída${tag}`);
    if (i.cachaca && !reached(seen, i.cachaca, 30)) warn(i.id, `balcão de cachaça inalcançável${tag}`);
    for (const s of interiorSpots(i, places)) if (!reached(seen, s, 16)) warn(s.id, `interação "${s.label}" inalcançável${tag}`);
    for (const n of interiorNpcs(i, places)) if (!reached(seen, n, 50)) warn(`${i.id}/${n.id}`, `morador inalcançável${tag}`);
    // cada cômodo precisa ser visitável
    for (const room of i.rooms) {
      const c = { x: room.rect.x + room.rect.w / 2, y: room.rect.y + room.rect.h / 2 };
      let ok = false;
      for (let dy = -room.rect.h / 2 + 12; dy <= room.rect.h / 2 - 12 && !ok; dy += 10) for (let dx = -room.rect.w / 2 + 12; dx <= room.rect.w / 2 - 12 && !ok; dx += 10) ok = reached(seen, { x: c.x + dx, y: c.y + dy }, 0);
      if (!ok) warn(room.id, `cômodo "${room.name}" sem acesso${tag}`);
    }
  }
  spotCount += i.spots.length;
}

// ---------- campanha: toda missão aponta para coisas que existem e podem ser alcançadas ----------
{
  const spotsPorEvento = new Map<string, string[]>();
  for (const i of INTERIORS) for (const s of i.spots) if (s.evento) spotsPorEvento.set(s.evento, [...(spotsPorEvento.get(s.evento) ?? []), i.id]);
  const pontosFora = new Map(CAMPANHA.missoes.flatMap((m) => m.pontos.filter((p) => p.fora).map((p) => [p.id, p.fora!] as const)));
  const npcIds = new Set([...NPCS.map((n) => n.id), ...INTERIORS.flatMap((i) => i.npcs.map((n) => n.id))]);
  const ambIds = new Set(AMBIENT.map((n) => n.id));
  const usados = new Set<string>();
  const citaLugar = (place: string, estado: string, onde: string) => {
    const def = (PLACES as Record<string, { states: Record<string, string> }>)[place];
    if (!def) warn(onde, `lugar inexistente: ${place}`);
    else if (!(estado in def.states)) warn(onde, `estado inexistente: ${place}=${estado}`);
  };
  const confereEfeitos = (fs: Efeito[], onde: string) => {
    for (const f of fs) {
      if ("lugar" in f) citaLugar(f.lugar[0], f.lugar[1], onde);
      else if ("pegar" in f && !(f.pegar in ITENS)) warn(onde, `item inexistente: ${f.pegar}`);
      else if ("se" in f) {
        for (const c of f.se) if ("lugar" in c) citaLugar(c.lugar, c.estado, onde);
        confereEfeitos(f.entao, onde);
        confereEfeitos(f.senao ?? [], onde);
      }
    }
  };
  for (const m of CAMPANHA.missoes) {
    if (!npcIds.has(m.inicio.npc)) warn(`missão ${m.id}`, `quem dá a missão não existe: ${m.inicio.npc}`);
    if (ambIds.has(m.inicio.npc)) warn(`missão ${m.id}`, "quem dá a missão não pode ser morador de rotina");
    const alvos = [m.inicio.alvo, ...m.etapas.map((e) => e.alvo)];
    for (const a of alvos) {
      if (!a) continue;
      if (a.predio && !BUILDINGS.some((b) => b.id === a.predio)) warn(`missão ${m.id}`, `prédio de destino inexistente: ${a.predio}`);
      if (!a.predio && (a.x === undefined || a.y === undefined)) warn(`missão ${m.id}`, `destino sem posição: ${a.label}`);
      if (!a.predio && a.x !== undefined && a.y !== undefined && !reached(walk, { x: a.x, y: a.y }, 40)) warn(`missão ${m.id}`, `destino inalcançável a pé: ${a.label}`);
    }
    for (const et of m.etapas) {
      for (const r of et.regras) {
        const [tipo, resto] = r.evento.split(/:(.*)/s);
        if (tipo === "falou") {
          usados.add(r.evento);
          if (!npcIds.has(resto)) warn(`missão ${m.id}/${et.id}`, `fala com morador inexistente: ${resto}`);
          else if (ambIds.has(resto)) warn(`missão ${m.id}/${et.id}`, `fala com morador de rotina (ele some de casa): ${resto}`);
        } else if (tipo === "usou") {
          usados.add(r.evento);
          if (!spotsPorEvento.has(resto) && !pontosFora.has(resto)) warn(`missão ${m.id}/${et.id}`, `ninguém emite o evento ${r.evento} (sem interação nem ponto)`);
        } else if (tipo === "lugar") {
          const [place, estado] = resto.split(":");
          citaLugar(place, estado, `missão ${m.id}/${et.id}`);
        } else warn(`missão ${m.id}/${et.id}`, `evento desconhecido: ${r.evento}`);
        for (const c of r.se ?? []) if ("lugar" in c) citaLugar(c.lugar, c.estado, `missão ${m.id}/${et.id}`);
        confereEfeitos(r.faz, `missão ${m.id}/${et.id}`);
      }
    }
    for (const p of m.pontos) {
      const dentro = spotsPorEvento.has(p.id);
      if (!dentro && !p.fora) warn(`missão ${m.id}`, `ponto ${p.id} sem interação em nenhum interior nem posição na rua`);
      for (const e of p.etapas ?? []) if (!m.etapas.some((x) => x.id === e)) warn(`missão ${m.id}`, `ponto ${p.id} cita etapa inexistente: ${e}`);
      if (p.fora) {
        if (!reached(walk, p.fora, 30)) warn(`missão ${m.id}`, `ponto ${p.id} inalcançável a pé`);
        const hit = solids.find((s) => p.fora!.x > s.x && p.fora!.x < s.x + s.w && p.fora!.y > s.y && p.fora!.y < s.y + s.h);
        if (hit) warn(`missão ${m.id}`, `ponto ${p.id} dentro de ${hit.tag}`);
      }
    }
  }
  for (const f of CAMPANHA.falas) if (!npcIds.has(f.npc)) warn("campanha", `fala por estado de morador inexistente: ${f.npc}`);
  // interação de missão que nenhuma regra usa é código morto
  for (const [ev, onde] of spotsPorEvento) if (!usados.has(`usou:${ev}`)) warn(onde[0], `interação de missão "${ev}" não é usada por nenhuma regra`);
  // avisos da praça: a placa desenhada fica onde o ponto está
  for (const p of CAMPANHA.missoes[0].pontos.filter((x) => x.fora)) {
    const placa = PROPS.find((x) => x.id === `msn-${p.id}`);
    if (!placa || Math.hypot(placa.x - p.fora!.x, placa.y - p.fora!.y) > 60) warn(`ponto ${p.id}`, "não há placa desenhada perto do ponto");
  }
  // as interações de missão dentro dos prédios ficam alcançáveis nos cenários da campanha (já cobertos pelos conjuntos de estado acima)
}

// ---------- trânsito: rede de ruas conectada, faixas sobre o asfalto e longe de prédios e objetos ----------
if (!conectada()) warn("trânsito", "a rede de ruas não é conectada (um carro não consegue ir de qualquer trecho a qualquer outro)");
for (const n of semSaida()) warn(`trânsito ${n.id}`, "cruzamento sem saída");
if (CORES_TRANSITO.length < 6) warn("trânsito", "poucas cores de carro");
const amostra = (a: Point, b: Point, f: (p: Point) => void) => {
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  for (let t = 0; t <= len; t += 20) f({ x: a.x + ((b.x - a.x) * t) / (len || 1), y: a.y + ((b.y - a.y) * t) / (len || 1) });
};
const confere = (nome: string, p: Point) => {
  if (!ROADS.some((r) => inside(p, r.rect))) return `sai do asfalto em (${Math.round(p.x)}, ${Math.round(p.y)})`;
  const hit = solids.find((s) => p.x > s.x - 18 && p.x < s.x + s.w + 18 && p.y > s.y - 18 && p.y < s.y + s.h + 18);
  if (hit) return `passa colado em ${hit.tag} em (${Math.round(p.x)}, ${Math.round(p.y)})`;
  void nome;
  return null;
};
for (const e of ARESTAS) {
  if (e.len < 20) warn(`trânsito ${e.id}`, `faixa curta demais (${Math.round(e.len)} px)`);
  let erro: string | null = null;
  amostra(e.a, e.b, (p) => (erro ??= confere(e.id, p)));
  if (erro) warn(`trânsito ${e.id}`, erro);
  // curvas até cada saída do cruzamento
  for (const s of e.para.saidas) {
    if (s === e.reversa && e.para.saidas.length > 1) continue;
    const c = curva(e, s);
    let erroCurva: string | null = null;
    for (let i = 0; i <= 12; i++) {
      const u = i / 12;
      const p = { x: (1 - u) * (1 - u) * c.p0.x + 2 * u * (1 - u) * c.c.x + u * u * c.p2.x, y: (1 - u) * (1 - u) * c.p0.y + 2 * u * (1 - u) * c.c.y + u * u * c.p2.y };
      erroCurva ??= confere(e.id, p);
    }
    if (erroCurva) warn(`trânsito curva ${e.id} → ${s.id}`, erroCurva);
  }
}
void NOS;

// ---------- carro: do carro oficial até todos os estacionamentos e veículos ----------
const carGrid = blockedGrid(solids, CITY_AREA, 17);
const official = VEHICLES.find((v) => v.id === "car-oficial")!;
const drive = flood(carGrid, official);
if (!reached(drive, official, 0)) warn("carro oficial", "começa dentro de algo sólido");
for (const v of VEHICLES) {
  if (carGrid.g[Math.floor(v.y / CELL) * carGrid.gw + Math.floor(v.x / CELL)]) warn(`veículo ${v.id}`, "estacionado dentro de algo sólido");
  if (!reached(drive, v, 40)) warn(`veículo ${v.id}`, "preso: não consegue sair de onde está");
}
for (const p of PARKING) {
  const s = stalls(p);
  if (!s.length) warn(p.id, "estacionamento sem vagas");
  const free = s.filter((st) => reached(drive, st, 30)).length;
  if (free < s.length) warn(p.id, `${s.length - free} de ${s.length} vagas sem acesso de carro`);
}
for (const d of DISTRICTS) {
  const ok = ROADS.some((r) => overlap(r.rect, d.area) && reached(drive, { x: r.rect.x + r.rect.w / 2, y: r.rect.y + r.rect.h / 2 }, 60));
  if (!ok) warn(`distrito ${d.id}`, "sem rua acessível de carro");
}

// ---------- rotinas: todo morador da rua sai de casa, chega ao ponto, almoça e volta ----------
let maiorCaminho = 0;
const dentroAs = (id: string, h: number) => AMBIENT.filter((n) => { const a = alvoEm(agendaDe(n), h * 60); return a.tipo === "dentro"; }).length;
for (const n of AMBIENT) {
  const ag = agendaDe(n);
  const casa = BUILDINGS.find((b) => b.id === ag.casa);
  const almoco = BUILDINGS.find((b) => b.id === ag.almoco);
  const bar = BUILDINGS.find((b) => b.id === BAR);
  if (!casa) warn(n.id, `casa inexistente: ${ag.casa}`);
  if (!almoco) warn(n.id, `local de almoço inexistente: ${ag.almoco}`);
  if (!casa || !almoco || !bar) continue;
  const ponto = { x: n.x, y: n.y };
  for (const [nome, de, para] of [
    ["casa → ponto", doorPoint(casa), ponto],
    ["ponto → almoço", ponto, doorPoint(almoco)],
    ["almoço → ponto", doorPoint(almoco), ponto],
    ["ponto → bar", ponto, doorPoint(bar)],
    ["bar → casa", doorPoint(bar), doorPoint(casa)],
    ["ponto → casa", ponto, doorPoint(casa)],
  ] as const) {
    const c = caminho(de, para);
    if (!c) warn(`rotina ${n.id}`, `sem caminho a pé: ${nome}`);
    else maiorCaminho = Math.max(maiorCaminho, comprimento(c));
  }
  // o dia fecha: de madrugada em casa, no meio do dia na rua ou no almoço
  if (alvoEm(ag, 3 * 60).tipo !== "dentro") warn(`rotina ${n.id}`, "de madrugada não está em casa");
  if (alvoEm(ag, 10 * 60).tipo !== "ponto") warn(`rotina ${n.id}`, "de manhã não está no ponto");
  const dia = Array.from({ length: MIN_POR_DIA / 10 }, (_, i) => alvoEm(ag, i * 10));
  let trocas = 0;
  for (let i = 1; i < dia.length; i++) if (JSON.stringify(dia[i]) !== JSON.stringify(dia[i - 1])) trocas++;
  if (trocas > 10) warn(`rotina ${n.id}`, `${trocas} trocas de lugar num dia (esperado até 10)`);
}
void dentroAs;
console.log(`rotinas: ${AMBIENT.length} moradores com agenda; maior caminho a pé ≈ ${Math.round(maiorCaminho)} px`);

const reachableArea = walk.g.reduce((a, v) => a + v, 0) * CELL * CELL;
const accessible = BUILDINGS.filter((b) => b.interior && interiorById(b.interior)).length;
console.log(
  `cidade: ${CITY.w}×${CITY.h}, ${DISTRICTS.length} distritos, ${ROADS.length} ruas, ${BUILDINGS.length} edificações (${accessible} com interior), ${PROPS.length} objetos, ` +
    `${POIS.length} lugares, ${VEHICLES.length} carros estacionados, ${ARESTAS.length} trechos de rua com trânsito, ${PARKING.length} estacionamentos, ` +
    `${NPCS.length + AMBIENT.length} moradores na rua, ${INTERIORS.reduce((a, i) => a + i.npcs.length, 0)} nos interiores, ${INTERIORS.length} interiores com ${INTERIORS.reduce((a, i) => a + i.rooms.length, 0)} cômodos e ${spotCount} interações, ` +
    `${CACHACA.length} pontos de cachaça; área caminhável ≈ ${(reachableArea / 1e6).toFixed(1)} Mpx²`,
);

if (problems.length) {
  console.error(`\n${problems.length} problema(s):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("Cidade OK.");
