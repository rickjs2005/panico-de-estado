import type { HeroId, Point, Rect } from "../types";
import type { CidadeDef } from "./definicao";
import { stalls } from "./helpers";
import { interiorIdEm, montaInterior, rotuloEntrada } from "./interiores";
import { WORLD_H } from "./layout";
import { LULA } from "./lula";
import { estadosIniciais, type PlaceDef, type PlaceId } from "./places";
import type {
  CachacaStop,
  CityBuilding,
  CityNpc,
  CityProp,
  CityPropKind,
  DecalDef,
  DistrictContent,
  DistrictDef,
  DistrictId,
  GroundDef,
  InteractionSpot,
  InteriorDef,
  InteriorPoster,
  InteriorProp,
  ParkingDef,
  PlaceCondition,
  Poi,
  RoadDef,
  VehicleSpawn,
} from "./types";

/**
 * A cidade ativa, montada a partir dos distritos. Tudo o que a cena, o mapa e as checagens
 * precisam sai daqui. Cada protagonista tem a sua cidade (`lula.ts`, `flavio/`); as exportações
 * abaixo são ligações vivas que `definirCidade` refaz quando a cidade troca (`ativa.ts` cuida
 * também do trânsito, da navegação a pé e das rotinas). Começa com a do Lula.
 */

export { WORLD_H, stalls };

type ComId = CityProp & { id: string };

export let CIDADE: CidadeDef = LULA;
export let CITY: CidadeDef["city"] = LULA.city;
export let LIMITS: CidadeDef["limits"] = LULA.limits;
export let ROADS: RoadDef[] = LULA.roads;
export let DISTRICTS: DistrictDef[] = LULA.districts;
export let DISTRICT_CONTENT: Record<DistrictId, DistrictContent> = LULA.content;
/** Todos os prédios, cada um com o id do seu interior. */
export let BUILDINGS: CityBuilding[] = [];
/** Um interior por prédio: toda edificação da cidade pode ser visitada. */
export let INTERIORS: InteriorDef[] = [];
export let PARKING: ParkingDef[] = [];
export let VEHICLES: VehicleSpawn[] = [];
export let GROUNDS: GroundDef[] = [];
export let DECALS: DecalDef[] = [];
export let NPCS: CityNpc[] = [];
/** Paradas de cachaça (energia de corrida) na rua. */
export let STREET_CACHACA: CachacaStop[] = [];
/** Todas as paradas: na rua e dentro de bares, padarias e afins. */
export let CACHACA: CachacaStop[] = [];
export let PROPS: ComId[] = [];
/** Objetos de todos os interiores (só para gerar as texturas; a cena monta um interior por vez). */
export let INTERIOR_PROPS: InteriorProp[] = [];
export let POIS: Poi[] = [];
/** Onde o protagonista começa. */
export let SPAWN: { hero: Point } = { hero: LULA.spawn };
/** Moradores genéricos da rua e as conversas por distrito. */
export let AMBIENT: CityNpc[] = LULA.ambient;
export let CHATTER: Record<DistrictId, string[]> = LULA.chatter;
export let CAES: CidadeDef["caes"] = LULA.caes;
export let BOLAS: CidadeDef["bolas"] = LULA.bolas;
/** Lugares com estado persistente da cidade ativa. */
export let PLACES: Record<PlaceId, PlaceDef> = LULA.places;
/** Campanha de missões da cidade ativa. */
export let CAMPANHA: CidadeDef["campanha"] = LULA.campanha;
export let ITENS: CidadeDef["itens"] = LULA.itens;
export let DECISOES: CidadeDef["decisoes"] = LULA.decisoes;
export let SELO_FINAL: CidadeDef["seloFinal"] = LULA.seloFinal;
/** Os seis selos do Passaporte, na ordem da campanha (o da cerimônia final é um extra). */
export let SELOS: CidadeDef["seloFinal"][] = [];

export type { PlaceId };

export function isPlace(id: string): id is PlaceId {
  return id in PLACES;
}

export function initialPlaces(): Record<PlaceId, string> {
  return estadosIniciais(PLACES);
}

export function interiorId(b: CityBuilding): string {
  return interiorIdEm(CIDADE.catalogo, b);
}

/** Texto da ação de entrar: "Entrar na casa", "Entrar no mercadinho". */
export function entryLabel(b: CityBuilding): string {
  return rotuloEntrada(CIDADE.catalogo, b);
}

export function interiorById(id: string): InteriorDef | undefined {
  return INTERIORS.find((i) => i.id === id);
}

export function buildingById(id: string): CityBuilding | undefined {
  return BUILDINGS.find((b) => b.id === id);
}

function all<K extends keyof DistrictContent>(k: K): NonNullable<DistrictContent[K]> {
  const out: unknown[] = [];
  for (const c of Object.values(DISTRICT_CONTENT)) out.push(...((c[k] ?? []) as unknown[]));
  return out as NonNullable<DistrictContent[K]>;
}

/** Troca a cidade ativa e refaz tudo o que sai dela. Use `ativaCidade` (ativa.ts), que refaz também trânsito, navegação e rotinas. */
export function definirCidade(def: CidadeDef) {
  CIDADE = def;
  CITY = def.city;
  LIMITS = def.limits;
  ROADS = def.roads;
  DISTRICTS = def.districts;
  DISTRICT_CONTENT = def.content;
  BUILDINGS = all("buildings").map((b) => ({ ...b, interior: interiorIdEm(def.catalogo, b) }));
  INTERIORS = BUILDINGS.map((b) => montaInterior(b, def));
  PARKING = all("parking");
  VEHICLES = all("vehicles");
  GROUNDS = all("grounds");
  DECALS = all("decals");
  NPCS = all("npcs");
  STREET_CACHACA = def.energia ? all("cachaca") : [];
  CACHACA = [...STREET_CACHACA, ...INTERIORS.flatMap((i) => (i.cachaca ? [i.cachaca] : []))];
  PROPS = withIds([...all("props"), ...streetSigns(), ...avenueLights()]);
  INTERIOR_PROPS = INTERIORS.flatMap((i) => i.props);
  POIS = [
    ...all("pois"),
    ...STREET_CACHACA.map((c) => ({ id: c.id, name: `${c.name} · cachaça`, district: c.district, x: c.x, y: c.y, kind: "cachaca" as const, landmark: true })),
    ...def.marcos,
  ];
  SPAWN = { hero: def.spawn };
  AMBIENT = def.ambient;
  CHATTER = def.chatter;
  CAES = def.caes;
  BOLAS = def.bolas;
  PLACES = def.places;
  CAMPANHA = def.campanha;
  ITENS = def.itens;
  DECISOES = def.decisoes;
  SELO_FINAL = def.seloFinal;
  SELOS = def.campanha.missoes.map((m) => m.selo);
}

/** Id da cidade ativa. */
export function cidadeAtiva(): HeroId {
  return CIDADE.id;
}

/** Placas com o nome das ruas, perto de onde cada uma começa e no meio. */
function streetSigns(): CityProp[] {
  const out: CityProp[] = [];
  // a placa não pode cair em cima de outra rua nem numa borda do mapa (água, morro, muro, mata)
  const ruim = (px: number, py: number, r: RoadDef) =>
    ROADS.some((o) => o !== r && px > o.rect.x - 20 && px < o.rect.x + o.rect.w + 20 && py > o.rect.y - 30 && py < o.rect.y + o.rect.h + 10) ||
    Object.values(LIMITS).some((l) => px > l.x - 12 && px < l.x + l.w + 12 && py > l.y - 12 && py < l.y + l.h + 12);
  const DESVIOS = [0, 160, -160, 320, -320];
  for (const r of ROADS) {
    const { x, y, w, h } = r.rect;
    if (w > h) {
      for (const sx0 of w > 700 ? [x + 90, x + w / 2 + 40] : [x + 90]) {
        const sx = DESVIOS.map((d) => sx0 + d).find((sx) => sx > x + 40 && sx < x + w - 40 && !ruim(sx, y + h + 26, r));
        if (sx !== undefined) out.push({ id: `placa-${r.id}-${Math.round(sx)}`, kind: "placaRua", x: sx, y: y + h + 26, text: r.name });
      }
    } else {
      for (const sy0 of h > 700 ? [y + 160, y + h / 2 + 60] : [y + 160]) {
        let pos: { x: number; y: number } | undefined;
        for (const px of [x + w + 16, x - 16]) {
          const sy = DESVIOS.map((d) => sy0 + d).find((sy) => sy > y + 60 && sy < y + h - 40 && !ruim(px, sy, r));
          if (sy !== undefined) {
            pos = { x: px, y: sy };
            break;
          }
        }
        if (pos) out.push({ id: `placa-${r.id}-${Math.round(pos.y)}`, kind: "placaRua", x: pos.x, y: pos.y, text: r.name });
      }
    }
  }
  return out;
}

/** Postes de luz ao longo das avenidas. */
function avenueLights(): CityProp[] {
  const out: CityProp[] = [];
  for (const r of ROADS.filter((a) => a.kind === "avenida")) {
    const { x, y, w, h } = r.rect;
    // os postes pulam a frente das portas
    const nearDoor = (px: number) => BUILDINGS.some((b) => Math.abs(doorPoint(b).x - px) < 40 && Math.abs(b.y + b.d - (y - 10)) < 130);
    // poste não fica no meio de uma rua que desemboca na avenida
    const naRua = (px: number, py: number) => ROADS.some((o) => o !== r && o.kind !== "avenida" && px > o.rect.x - 24 && px < o.rect.x + o.rect.w + 24 && py > o.rect.y - 24 && py < o.rect.y + o.rect.h + 24);
    if (w > h) {
      for (let px = x + 140; px < x + w - 80; px += 320) if (!nearDoor(px) && !naRua(px, y - 10)) out.push({ kind: "poste", x: px, y: y - 10 });
    } else {
      // na avenida vertical, o poste também pula as avenidas que cruzam (senão fica no meio do asfalto)
      const naAvenida = (py: number) => ROADS.some((o) => o !== r && o.kind === "avenida" && py > o.rect.y - 24 && py < o.rect.y + o.rect.h + 24 && x - 12 > o.rect.x - 24 && x - 12 < o.rect.x + o.rect.w + 24);
      for (let py = y + 200; py < y + h - 80; py += 320) if (!naRua(x - 12, py) && !naAvenida(py)) out.push({ kind: "poste", x: x - 12, y: py });
    }
  }
  return out;
}

function withIds(list: CityProp[]): ComId[] {
  return list.map((p) => ({ ...p, id: p.id ?? `${p.kind.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}-${Math.round(p.x)}-${Math.round(p.y)}` }));
}

/** Tamanho da área sólida de cada objeto: retângulo centrado em x, com a base em y. */
export const PROP_SOLID: Record<CityPropKind, { w: number; h: number } | null> = {
  arvore: { w: 16, h: 10 },
  palmeira: { w: 14, h: 10 },
  ipe: { w: 16, h: 10 },
  poste: { w: 8, h: 8 },
  banco: { w: 44, h: 12 },
  coreto: { w: 100, h: 50 },
  orelhao: { w: 16, h: 10 },
  banca: { w: 64, h: 30 },
  mesaBar: { w: 26, h: 16 },
  barraca: { w: 92, h: 30 },
  lixeira: { w: 12, h: 10 },
  pneus: { w: 32, h: 16 },
  trave: null,
  bandeira: { w: 6, h: 6 },
  outdoor: null,
  placaColetiva: null,
  frade: { w: 10, h: 10 },
  cone: { w: 12, h: 10 },
  tambor: { w: 22, h: 16 },
  palete: { w: 44, h: 20 },
  caminhao: { w: 150, h: 50 },
  conteiner: { w: 82, h: 36 },
  guindaste: { w: 70, h: 40 },
  esteira: { w: 300, h: 26 },
  monumento: { w: 70, h: 40 },
  chafariz: { w: 90, h: 44 },
  varal: null,
  barracaCamping: { w: 50, h: 24 },
  caixaSom: { w: 22, h: 14 },
  mesaPiquenique: { w: 56, h: 22 },
  cancela: null,
  quiosque: { w: 54, h: 28 },
  pontoOnibus: { w: 80, h: 16 },
  tabela: { w: 12, h: 10 },
  caixasKits: { w: 50, h: 26 },
  placaRua: null,
  faixaCampus: null,
  cabeco: { w: 12, h: 10 },
  balcao: { w: 300, h: 30 },
  banqueta: { w: 12, h: 10 },
  prateleira: null,
  jukebox: { w: 40, h: 24 },
  guiche: { w: 160, h: 30 },
  cadeiraFila: { w: 26, h: 14 },
  painelSenha: null,
  pilhaPapel: { w: 26, h: 16 },
  // interiores
  sofa: { w: 108, h: 26 },
  poltrona: { w: 42, h: 26 },
  tv: { w: 70, h: 18 },
  radio: null,
  geladeira: { w: 44, h: 28 },
  fogao: { w: 46, h: 28 },
  pia: { w: 72, h: 28 },
  mesa: { w: 80, h: 34 },
  cadeira: { w: 18, h: 12 },
  cama: { w: 84, h: 56 },
  rede: { w: 104, h: 10 },
  armario: { w: 70, h: 26 },
  estante: { w: 90, h: 22 },
  planta: { w: 18, h: 12 },
  tapete: null,
  quadro: null,
  janela: null,
  relogio: null,
  mesaEscritorio: { w: 90, h: 28 },
  arquivo: { w: 40, h: 24 },
  mesaReuniao: { w: 200, h: 48 },
  bebedouro: { w: 24, h: 16 },
  bancoIgreja: { w: 140, h: 18 },
  altar: { w: 140, h: 38 },
  pulpito: { w: 40, h: 22 },
  sino: { w: 44, h: 22 },
  orgao: { w: 80, h: 26 },
  carteira: { w: 34, h: 22 },
  lousa: null,
  gondola: { w: 140, h: 28 },
  caixaRegistradora: { w: 90, h: 28 },
  freezer: { w: 90, h: 30 },
  vitrinePao: { w: 150, h: 28 },
  forno: { w: 72, h: 32 },
  maquina: { w: 90, h: 48 },
  empilhadeira: { w: 50, h: 34 },
  caixaPapelao: { w: 40, h: 26 },
  painelFerramentas: null,
  elevadorCarro: null,
  caixaEletronico: { w: 40, h: 24 },
  cofre: { w: 70, h: 34 },
  painelLoteria: null,
  rotativa: { w: 200, h: 56 },
  mesaPingPong: { w: 110, h: 52 },
  colchao: null,
  beliche: { w: 92, h: 34 },
  maquinaLavar: { w: 40, h: 28 },
  elevador: { w: 84, h: 14 },
  caixasCorreio: { w: 110, h: 14 },
  filtro: { w: 22, h: 14 },
  ventilador: { w: 22, h: 14 },
  raioX: { w: 130, h: 40 },
  painelControle: { w: 180, h: 34 },
  portaPaletes: { w: 300, h: 30 },
  mesaTelefones: { w: 160, h: 34 },
  telao: null,
  violao: { w: 14, h: 10 },
  fritadeira: { w: 62, h: 28 },
  compressor: { w: 40, h: 24 },
  carroOficina: { w: 150, h: 48 },
  lojinha: { w: 160, h: 38 },
  escadaRolante: { w: 70, h: 120 },
  vaso: { w: 20, h: 12 },
  quadroAvisos: { w: 100, h: 12 },
  canteiro: { w: 70, h: 18 },
  horta: { w: 80, h: 30 },
  cachorro: { w: 22, h: 10 },
  bicicleta: { w: 40, h: 10 },
  bandeirolas: null,
  carrinhoPipoca: { w: 44, h: 22 },
  bicicletario: { w: 90, h: 14 },
  muroBaixo: { w: 120, h: 12 },
  vitral: null,
  castical: { w: 14, h: 10 },
  cavalete: { w: 44, h: 12 },
  tapeteCorredor: null,
  balizaFila: { w: 8, h: 8 },
  totemSenha: { w: 30, h: 14 },
  cafezinho: { w: 50, h: 22 },
  alavanca: { w: 26, h: 12 },
  cadeadao: { w: 40, h: 14 },
  ferramenta: null,
  caixaBrasil: { w: 52, h: 24 },
  etiquetadora: { w: 34, h: 16 },
  // Brasil do Flávio
  catraca: null,
  palanque: { w: 200, h: 46 },
  pinguim: { w: 24, h: 12 },
  pombo: null,
  urna: { w: 44, h: 22 },
  calendario: null,
  motoEstatua: { w: 96, h: 40 },
  placaAluga: null,
};

/** Objetos pendurados na parede do fundo dos interiores (desenhados logo à frente da parede). */
export const WALL_PROPS = new Set<CityPropKind>(["prateleira", "painelSenha", "quadro", "janela", "relogio", "lousa", "painelFerramentas", "painelLoteria", "telao", "vitral", "calendario"]);
/** Objetos rentes ao chão (desenhados por baixo de tudo). */
export const FLAT_PROPS = new Set<CityPropKind>(["tapete", "colchao", "tapeteCorredor"]);

export function propRect(p: CityProp): Rect | null {
  const s = PROP_SOLID[p.kind];
  return s ? { x: p.x - s.w / 2, y: p.y - s.h, w: s.w, h: s.h } : null;
}

export function buildingRect(b: CityBuilding): Rect {
  return { x: b.x, y: b.y, w: b.w, h: b.d };
}

/** Posição da porta principal na fachada, em fração da largura. A arte usa o mesmo valor. */
export function doorFrac(b: Pick<CityBuilding, "id" | "kind" | "door">): number {
  if (b.door !== undefined) return b.door;
  if (b.kind === "loja") return 0.37;
  if (b.kind === "casa") {
    let h = 0;
    for (const c of b.id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return h % 2 ? 0.66 : 0.34;
  }
  return 0.5;
}

/** Porta lateral das igrejas interditadas: o decreto lacrou a porta da frente, não esta. */
export function sideDoorFrac(b: CityBuilding): number | null {
  if (b.kind === "igreja") return 0.12;
  if (b.kind === "capela") return 0.86;
  return null;
}

/** Ponto na calçada, na frente da porta do prédio (ou da porta lateral). */
export function doorPoint(b: CityBuilding, side = false): Point {
  const f = side ? (sideDoorFrac(b) ?? doorFrac(b)) : doorFrac(b);
  return { x: b.x + b.w * f, y: b.y + b.d + 16 };
}

/** Paredes externas de um interior: fundo, laterais e frente (a porta é uma ação, não uma abertura). */
export function interiorWalls(i: InteriorDef): Rect[] {
  const r = i.room;
  return [
    { x: r.x - 30, y: r.y - 30, w: r.w + 60, h: i.wallH + 30 },
    { x: r.x - 30, y: r.y, w: 30, h: r.h },
    { x: r.x + r.w, y: r.y, w: 30, h: r.h },
    { x: r.x - 30, y: r.y + r.h, w: r.w + 60, h: 30 },
  ];
}

/** Vale se o item não depende de um lugar ou se o lugar está no estado exigido. */
export function whenHolds(when: PlaceCondition | undefined, places: Record<string, string>): boolean {
  return !when || places[when.place] === when.state;
}

/** Chaves de contexto (lugares e campanha) de que o desenho deste interior depende. Só mudanças nelas pedem refazê-lo. */
export function interiorChaves(i: InteriorDef): string[] {
  const out = new Set<string>();
  for (const x of [...i.props, ...i.npcs, ...i.posters, ...i.spots]) if (x.when) out.add(x.when.place);
  return [...out];
}

/** Objetos do interior visíveis com os estados atuais dos lugares. */
export function interiorProps(i: InteriorDef, places: Record<string, string>): InteriorProp[] {
  return i.props.filter((p) => whenHolds(p.when, places));
}

/** Interações disponíveis com os estados atuais dos lugares. */
export function interiorSpots(i: InteriorDef, places: Record<string, string>): InteractionSpot[] {
  return i.spots.filter((s) => whenHolds(s.when, places));
}

/** Cartazes visíveis com os estados atuais dos lugares. */
export function interiorPosters(i: InteriorDef, places: Record<string, string>): InteriorPoster[] {
  return i.posters.filter((p) => whenHolds(p.when, places));
}

/** Moradores de interior presentes com os estados atuais dos lugares. */
export function interiorNpcs(i: InteriorDef, places: Record<string, string>): CityNpc[] {
  return i.npcs.filter((n) => whenHolds(n.when, places));
}

/** Tudo o que é sólido dentro de um interior. */
export function interiorSolids(i: InteriorDef, places: Record<string, string>): Solid[] {
  const out: Solid[] = interiorWalls(i).map((w, k) => ({ ...w, tag: `${i.id}-borda-${k}` }));
  for (const w of i.walls) out.push({ x: w.x, y: w.y, w: w.w, h: w.h, tag: w.id });
  for (const p of interiorProps(i, places)) {
    const r = propRect(p);
    if (r) out.push({ ...r, tag: p.id });
  }
  return out;
}

export type Solid = Rect & { tag?: string };

/** Tudo o que é sólido na rua: limites, prédios e objetos. Os interiores têm `interiorSolids`. */
export function citySolids(extra: Solid[] = []): Solid[] {
  const out: Solid[] = [
    // bordas do mapa (morro, canal, baía, muro, mata…)
    ...Object.entries(LIMITS).map(([tag, r]) => ({ ...r, tag })),
    // a parte de baixo do mundo (entre a cidade e os interiores) também é parede
    { x: 0, y: CITY.h, w: CITY.w, h: 3900 - CITY.h - 40, tag: "vazio" },
  ];
  for (const b of BUILDINGS) out.push({ ...buildingRect(b), tag: b.id });
  for (const p of PROPS) {
    const r = propRect(p);
    if (r) out.push({ ...r, tag: p.id });
  }
  return [...out, ...extra];
}

export function districtAt(x: number, y: number): DistrictDef | null {
  return DISTRICTS.find((d) => x >= d.area.x && x <= d.area.x + d.area.w && y >= d.area.y && y <= d.area.y + d.area.h) ?? null;
}

export function districtById(id: DistrictId): DistrictDef {
  return DISTRICTS.find((d) => d.id === id)!;
}

// a cidade do Lula é a ativa até alguém pedir outra
definirCidade(LULA);
