// Checa a cidade do Lula sem abrir o navegador: ids, distritos, sobreposições e acessos.
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
  VEHICLES,
  buildingRect,
  citySolids,
  districtById,
  doorPoint,
  stalls,
} from "../src/world/cidade";
import { PLACES } from "../src/world/cidade/places";
import { LOOKS } from "../src/world/looks";
import type { Point, Rect } from "../src/world/types";

const problems: string[] = [];
const warn = (where: string, msg: string) => problems.push(`${where}: ${msg}`);
const overlap = (a: Rect, b: Rect) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const inside = (p: Point, r: Rect) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;

// ---------- ids estáveis e únicos ----------
const groups: [string, { id: string }[]][] = [
  ["prédio", BUILDINGS],
  ["objeto", PROPS],
  ["lugar", POIS],
  ["morador", [...NPCS, ...INTERIORS.flatMap((i) => i.npcs)]],
  ["veículo", VEHICLES],
  ["estacionamento", PARKING],
  ["cachaça", CACHACA],
  ["interior", INTERIORS],
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
  if (b.interior && !INTERIORS.some((i) => i.id === b.interior && i.building === b.id)) warn(b.id, `interior "${b.interior}" não aponta de volta para o prédio`);
}
for (const i of INTERIORS) if (!BUILDINGS.some((b) => b.id === i.building && b.interior === i.id)) warn(i.id, "interior sem prédio com porta");
for (const n of [...NPCS, ...INTERIORS.flatMap((i) => i.npcs)]) if (!(n.look in LOOKS)) warn(n.id, `aparência desconhecida "${n.look}"`);

// ---------- acessos (busca em grade) ----------
const solids = citySolids();
const CELL = 10;
const GW = Math.ceil(CITY.w / CELL);
const GH = Math.ceil(4600 / CELL);

function blockedGrid(r: number): Uint8Array {
  const g = new Uint8Array(GW * GH);
  for (const s of solids) {
    const x0 = Math.max(0, Math.floor((s.x - r) / CELL));
    const x1 = Math.min(GW - 1, Math.ceil((s.x + s.w + r) / CELL));
    const y0 = Math.max(0, Math.floor((s.y - r) / CELL));
    const y1 = Math.min(GH - 1, Math.ceil((s.y + s.h + r) / CELL));
    for (let gy = y0; gy <= y1; gy++) {
      for (let gx = x0; gx <= x1; gx++) {
        const cx = gx * CELL + CELL / 2;
        const cy = gy * CELL + CELL / 2;
        const nx = Math.max(s.x, Math.min(cx, s.x + s.w));
        const ny = Math.max(s.y, Math.min(cy, s.y + s.h));
        if ((cx - nx) ** 2 + (cy - ny) ** 2 < r * r) g[gy * GW + gx] = 1;
      }
    }
  }
  return g;
}

function flood(g: Uint8Array, start: Point): Uint8Array {
  const seen = new Uint8Array(GW * GH);
  const sx = Math.floor(start.x / CELL);
  const sy = Math.floor(start.y / CELL);
  const q: number[] = [sy * GW + sx];
  if (g[q[0]]) return seen;
  seen[q[0]] = 1;
  while (q.length) {
    const c = q.pop()!;
    const x = c % GW;
    const y = (c - x) / GW;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
      const n = ny * GW + nx;
      if (!seen[n] && !g[n]) {
        seen[n] = 1;
        q.push(n);
      }
    }
  }
  return seen;
}

/** Alguma célula alcançada a até `radius` px do ponto? */
function reached(seen: Uint8Array, p: Point, radius: number): boolean {
  const r = Math.ceil(radius / CELL);
  const cx = Math.floor(p.x / CELL);
  const cy = Math.floor(p.y / CELL);
  for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) if (x >= 0 && y >= 0 && x < GW && y < GH && seen[y * GW + x]) return true;
  return false;
}

const walkGrid = blockedGrid(10);
const walk = flood(walkGrid, SPAWN.hero);
if (!reached(walk, SPAWN.hero, 0)) warn("início", "o Lula começa dentro de algo sólido");
for (const p of POIS) if (!reached(walk, p, 60)) warn(`lugar ${p.id}`, "inalcançável a pé");
for (const b of BUILDINGS) if (!reached(walk, doorPoint(b), 20)) warn(`porta de ${b.id}`, "inalcançável a pé");
for (const c of CACHACA.filter((c) => c.y < CITY.h)) if (!reached(walk, c, 40)) warn(`cachaça ${c.id}`, "inalcançável a pé");
for (const n of NPCS) if (!reached(walk, n, 50)) warn(`morador ${n.id}`, "inalcançável a pé");
for (const v of VEHICLES) if (!reached(walk, v, 60)) warn(`veículo ${v.id}`, "não dá para chegar a pé");
for (const d of DISTRICTS) {
  const c = { x: d.area.x + d.area.w / 2, y: d.area.y + d.area.h / 2 };
  if (!reached(walk, c, 300)) warn(`distrito ${d.id}`, "centro inalcançável a pé");
}

// interiores: da entrada até a saída, o balcão e os moradores
for (const i of INTERIORS) {
  const seen = flood(walkGrid, i.entry);
  if (!reached(seen, i.entry, 0)) warn(i.id, "a entrada fica dentro de algo sólido");
  if (!reached(seen, i.exit, 30)) warn(i.id, "não dá para chegar à saída");
  if (i.cachaca && !reached(seen, i.cachaca, 40)) warn(i.id, "balcão de cachaça inalcançável");
  for (const n of i.npcs) if (!reached(seen, n, 60)) warn(`${i.id}/${n.id}`, "morador inalcançável");
}

// carro: do carro oficial até todos os estacionamentos e veículos
const carGrid = blockedGrid(17);
const official = VEHICLES.find((v) => v.id === "car-oficial")!;
const drive = flood(carGrid, official);
if (!reached(drive, official, 0)) warn("carro oficial", "começa dentro de algo sólido");
for (const v of VEHICLES) {
  if (carGrid[Math.floor(v.y / CELL) * GW + Math.floor(v.x / CELL)]) warn(`veículo ${v.id}`, "estacionado dentro de algo sólido");
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

const reachableArea = walk.reduce((a, v) => a + v, 0) * CELL * CELL;
console.log(
  `cidade: ${CITY.w}×${CITY.h}, ${DISTRICTS.length} distritos, ${ROADS.length} ruas, ${BUILDINGS.length} prédios, ${PROPS.length} objetos, ` +
    `${POIS.length} lugares, ${VEHICLES.length} carros, ${PARKING.length} estacionamentos, ${INTERIORS.length} interiores; ` +
    `área caminhável ≈ ${(reachableArea / 1e6).toFixed(1)} Mpx²`,
);

if (problems.length) {
  console.error(`\n${problems.length} problema(s):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("Cidade OK.");
