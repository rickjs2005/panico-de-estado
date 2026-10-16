import type { LookId } from "./looks";
import type { ActionLabel, Facing, HeroId, Point, Rect } from "./types";

/**
 * O bairro: ruas, quarteirões, prédios, objetos e moradores.
 * Só dados, sem Phaser. Coordenadas em pixels do mundo, com y crescendo para baixo.
 *
 * Vista 3/4: cada prédio tem uma "pegada" no chão (x, y, w, d) e uma fachada de
 * altura h desenhada para cima a partir da borda da frente (y + d). Só a pegada colide.
 */

export const WORLD = { w: 2560, h: 1920 };

/** Asfalto. As calçadas são o espaço entre o asfalto e os quarteirões. */
export const ROADS = {
  h: [
    { y0: 545, y1: 695 },
    { y0: 1225, y1: 1375 },
  ],
  v: [
    { x0: 745, x1: 895 },
    { x0: 1685, x1: 1835 },
  ],
};

export type Surface = "grama" | "calcada" | "terra" | "ondas";

export interface Lot extends Rect {
  surface: Surface;
}

/** Miolo dos quarteirões. O que sobra fora deles e do asfalto é calçada. */
export const LOTS: Lot[] = [
  { x: 0, y: 0, w: 709, h: 509, surface: "grama" },
  { x: 931, y: 0, w: 718, h: 350, surface: "grama" },
  { x: 931, y: 350, w: 718, h: 159, surface: "ondas" },
  { x: 1871, y: 0, w: 689, h: 420, surface: "grama" },
  { x: 1871, y: 420, w: 689, h: 89, surface: "calcada" },
  { x: 0, y: 731, w: 709, h: 458, surface: "calcada" },
  { x: 931, y: 731, w: 718, h: 458, surface: "calcada" },
  { x: 1871, y: 731, w: 689, h: 458, surface: "grama" },
  { x: 0, y: 1411, w: 709, h: 509, surface: "grama" },
  { x: 460, y: 1450, w: 230, h: 430, surface: "terra" },
  { x: 931, y: 1411, w: 718, h: 509, surface: "grama" },
  { x: 931, y: 1720, w: 360, h: 60, surface: "calcada" },
  { x: 1871, y: 1411, w: 689, h: 509, surface: "grama" },
];

/** Os quarteirões têm a mesma geometria, mas cada Brasil tem seus próprios usos. */
const LULA_REPLACEMENTS: Record<string, Partial<BuildingDef>> = {
  "casa-azul": { id: "ministerio", kind: "loja", sign: "MINISTÉRIO DO BOATO", wall: "#d95859" },
  "casa-lilas": { id: "universidade", kind: "escola", sign: "UNIVERSIDADE DO PÂNICO", wall: "#a2c7c0" },
  "casa-areia": { id: "terminal-china", kind: "loja", sign: "BRASIL: FRETE PARA CHINA", wall: "#df8b62" },
};

export function buildingsFor(hero: HeroId): BuildingDef[] {
  return hero === "lula" ? LULA_BUILDINGS : BUILDINGS;
}

export type BuildingKind = "casa" | "loja" | "igreja" | "fabrica" | "escola";

export interface BuildingDef {
  id: string;
  kind: BuildingKind;
  /** Pegada no chão. */
  x: number;
  y: number;
  w: number;
  d: number;
  /** Altura da fachada. */
  h: number;
  /** Espaço extra acima do telhado (torres, chaminé). */
  top?: number;
  wall: string;
  roof: "telha" | "laje";
  sign?: string;
  awning?: [string, string];
}

export const BUILDINGS: BuildingDef[] = [
  // Quarteirão noroeste: casas e o bar
  { id: "casa-azul", kind: "casa", x: 30, y: 300, w: 190, d: 110, h: 100, wall: "#7fb3d5", roof: "telha" },
  { id: "casa-rosa", kind: "casa", x: 245, y: 310, w: 170, d: 100, h: 95, wall: "#f2a7b8", roof: "laje" },
  { id: "bar", kind: "loja", x: 440, y: 300, w: 240, d: 110, h: 105, wall: "#f4d35e", roof: "telha", sign: "BAR DO TIÃO", awning: ["#d62839", "#fff4e0"] },
  // Praça e igreja matriz
  { id: "igreja", kind: "igreja", x: 1160, y: 230, w: 240, d: 110, h: 150, top: 80, wall: "#fff8ec", roof: "telha" },
  // Nordeste: a selaria
  { id: "selaria", kind: "loja", x: 1930, y: 300, w: 250, d: 110, h: 110, wall: "#c98a4b", roof: "telha", sign: "SELARIA DO ZECA", awning: ["#6b3e1f", "#f3e1c0"] },
  { id: "farmacia", kind: "loja", x: 2210, y: 310, w: 180, d: 100, h: 100, wall: "#9ed9c4", roof: "laje", sign: "FARMÁCIA", awning: ["#1f8a4c", "#ffffff"] },
  { id: "casa-amarela", kind: "casa", x: 2420, y: 300, w: 120, d: 110, h: 95, wall: "#e9c46a", roof: "telha" },
  // Oeste: a fábrica
  { id: "fabrica", kind: "fabrica", x: 50, y: 860, w: 560, d: 110, h: 140, top: 90, wall: "#b5523b", roof: "laje", sign: "FÁBRICA FELIZ" },
  // Centro: pequenos comércios
  { id: "padaria", kind: "loja", x: 960, y: 900, w: 200, d: 110, h: 110, wall: "#f6bd60", roof: "telha", sign: "PADARIA PÃO QUENTE", awning: ["#9c4a1a", "#fff4e0"] },
  { id: "borracharia", kind: "loja", x: 1185, y: 910, w: 190, d: 100, h: 100, wall: "#8ecae6", roof: "laje", sign: "BORRACHARIA 24H", awning: ["#1d3557", "#f1faee"] },
  { id: "mercadinho", kind: "loja", x: 1400, y: 900, w: 230, d: 110, h: 115, wall: "#ff9f80", roof: "telha", sign: "MERCADINHO KI-PREÇO", awning: ["#e63946", "#ffd23f"] },
  // Leste: casas
  { id: "casa-verde", kind: "casa", x: 1900, y: 900, w: 180, d: 110, h: 100, wall: "#b5e48c", roof: "telha" },
  { id: "casa-lilas", kind: "casa", x: 2110, y: 890, w: 200, d: 120, h: 105, wall: "#cdb4db", roof: "laje" },
  { id: "casa-pessego", kind: "casa", x: 2340, y: 900, w: 190, d: 110, h: 100, wall: "#ffd6a5", roof: "telha" },
  // Sul
  { id: "casa-celeste", kind: "casa", x: 40, y: 1580, w: 200, d: 110, h: 100, wall: "#a2d2ff", roof: "telha" },
  { id: "casa-chiclete", kind: "casa", x: 270, y: 1590, w: 170, d: 100, h: 95, wall: "#ffc8dd", roof: "laje" },
  { id: "escola", kind: "escola", x: 960, y: 1600, w: 330, d: 120, h: 120, wall: "#f1faee", roof: "telha", sign: "ESCOLA ESTADUAL" },
  { id: "loterica", kind: "loja", x: 1320, y: 1590, w: 180, d: 110, h: 100, wall: "#ffe066", roof: "laje", sign: "LOTÉRICA", awning: ["#2a6fdb", "#ffffff"] },
  { id: "casa-tijolo", kind: "casa", x: 1520, y: 1600, w: 110, d: 100, h: 95, wall: "#e07a5f", roof: "laje" },
  { id: "casa-menta", kind: "casa", x: 1900, y: 1590, w: 190, d: 110, h: 100, wall: "#99e2b4", roof: "telha" },
  { id: "casa-areia", kind: "casa", x: 2120, y: 1600, w: 180, d: 100, h: 95, wall: "#f4e1c1", roof: "laje" },
  { id: "casa-coral", kind: "casa", x: 2340, y: 1590, w: 190, d: 110, h: 100, wall: "#ff8fa3", roof: "telha" },
];


export const LULA_BUILDINGS = BUILDINGS.map((b) => ({ ...b, ...LULA_REPLACEMENTS[b.id] }));

export type PropKind =
  | "arvore"
  | "poste"
  | "banco"
  | "coreto"
  | "orelhao"
  | "banca"
  | "mesaBar"
  | "barraca"
  | "churrasqueira"
  | "mesaFesta"
  | "faixa"
  | "expositor"
  | "pneus"
  | "lixeira"
  | "trave";

export interface PropDef {
  id?: string;
  kind: PropKind;
  /** Ponto de apoio no chão (base do objeto). */
  x: number;
  y: number;
  variant?: string;
}

/** Área de colisão de cada objeto: retângulo centrado em x, com a base em y. */
export const PROP_COLLIDERS: Record<PropKind, { w: number; h: number } | null> = {
  arvore: { w: 16, h: 10 },
  poste: { w: 8, h: 8 },
  banco: { w: 44, h: 12 },
  coreto: { w: 100, h: 50 },
  orelhao: { w: 16, h: 10 },
  banca: { w: 64, h: 30 },
  mesaBar: { w: 26, h: 16 },
  barraca: { w: 92, h: 30 },
  churrasqueira: { w: 30, h: 14 },
  mesaFesta: { w: 120, h: 24 },
  faixa: null,
  expositor: { w: 40, h: 12 },
  pneus: { w: 32, h: 16 },
  lixeira: { w: 12, h: 10 },
  trave: null,
};

export function propCollider(p: PropDef): Rect | null {
  const c = PROP_COLLIDERS[p.kind];
  if (!c) return null;
  return { x: p.x - c.w / 2, y: p.y - c.h, w: c.w, h: c.h };
}

const POSTES_Y = [515, 1195];
const POSTES_X = [140, 400, 660, 1110, 1400, 1620, 1950, 2250, 2500];

const EDGE_TREES: PropDef[] = [80, 260, 1000, 1200, 1430, 1960, 2200, 2460].map((x) => ({ kind: "arvore" as const, x, y: 1900 }));

export const PROPS: PropDef[] = [
  ...POSTES_Y.flatMap((y) => POSTES_X.map((x) => ({ kind: "poste" as const, x, y }))),
  // Praça
  { kind: "coreto", x: 1290, y: 455 },
  { kind: "banco", x: 1030, y: 440 },
  { kind: "banco", x: 1550, y: 440 },
  { kind: "banco", x: 1150, y: 500 },
  { kind: "arvore", x: 960, y: 385 },
  { kind: "arvore", x: 1620, y: 385 },
  { kind: "arvore", x: 990, y: 250 },
  { kind: "arvore", x: 1070, y: 140 },
  { kind: "arvore", x: 1500, y: 150 },
  { kind: "arvore", x: 1600, y: 270 },
  { kind: "lixeira", x: 1440, y: 500 },
  // Feira livre na pista de cima da avenida
  { id: "barraca-laranja", kind: "barraca", x: 1230, y: 592, variant: "laranja" },
  { id: "barraca-banana", kind: "barraca", x: 1360, y: 592, variant: "banana" },
  { id: "barraca-abacaxi", kind: "barraca", x: 1490, y: 592, variant: "abacaxi" },
  // Bar do Tião
  { kind: "mesaBar", x: 500, y: 470 },
  { kind: "mesaBar", x: 570, y: 482 },
  { kind: "mesaBar", x: 640, y: 470 },
  { kind: "arvore", x: 90, y: 480 },
  { kind: "arvore", x: 360, y: 485 },
  { kind: "arvore", x: 160, y: 150 },
  { kind: "arvore", x: 520, y: 140 },
  // Selaria
  { id: "expositor", kind: "expositor", x: 2060, y: 474 },
  { kind: "arvore", x: 2470, y: 480 },
  { kind: "arvore", x: 2050, y: 160 },
  { kind: "arvore", x: 2350, y: 170 },
  // Fábrica e a confraternização
  { id: "faixa", kind: "faixa", x: 290, y: 1010 },
  { id: "mesa-festa", kind: "mesaFesta", x: 280, y: 1088 },
  { id: "churrasqueira", kind: "churrasqueira", x: 475, y: 1075 },
  { kind: "arvore", x: 640, y: 1010 },
  { kind: "arvore", x: 30, y: 1160 },
  // Comércio do centro
  { kind: "mesaBar", x: 1010, y: 1080 },
  { kind: "mesaBar", x: 1070, y: 1095 },
  { kind: "orelhao", x: 1180, y: 1110 },
  { kind: "pneus", x: 1330, y: 1060 },
  { kind: "lixeira", x: 1395, y: 1080 },
  { kind: "banca", x: 1520, y: 1130 },
  // Leste
  { kind: "arvore", x: 2090, y: 1120 },
  { kind: "arvore", x: 2330, y: 1125 },
  { kind: "arvore", x: 2520, y: 800 },
  // Sul
  { kind: "trave", x: 575, y: 1475 },
  { kind: "trave", x: 575, y: 1875, variant: "baixo" },
  { kind: "arvore", x: 380, y: 1450 },
  { kind: "arvore", x: 120, y: 1760 },
  { kind: "arvore", x: 1380, y: 1790 },
  { kind: "banco", x: 1500, y: 1790 },
  { kind: "arvore", x: 2050, y: 1780 },
  { kind: "arvore", x: 2300, y: 1470 },
  ...EDGE_TREES,
];

/** Linhas de fiação entre postes da mesma calçada. */
export const WIRES: [Point, Point][] = POSTES_Y.flatMap((y) =>
  POSTES_X.slice(1).map((x, i) => [
    { x: POSTES_X[i], y },
    { x, y },
  ] as [Point, Point]),
);

export interface NpcDef {
  id: string;
  name: string;
  look: LookId;
  x: number;
  y: number;
  facing: Facing;
  /** Vira para a esquerda quando a vista é lateral. */
  flip?: boolean;
  /** Percurso de ida e volta pelas calçadas. */
  route?: Point[];
  loop?: boolean;
  /** Falas soltas ao conversar. */
  lines: string[];
  /** Falas soltas só para o Lula (no Brasil dele, as coisas são outras). */
  linesLula?: string[];
}

export const NPCS: NpcDef[] = [
  {
    id: "boato",
    name: "Seu Boato",
    look: "boato",
    x: 590,
    y: 1145,
    facing: "front",
    lines: ["Neste bairro, boato vira verdade em cinco minutos."],
    linesLula: ["Os áudios do zap viraram um plano de governo!", "Aqui o comunismo veio até com manual de instruções."],
  },
  {
    id: "patrao",
    name: "Seu Arlindo, o patrão",
    look: "patrao",
    x: 470,
    y: 1112,
    facing: "front",
    lines: ["Hoje é dia de picanha pra todo mundo!", "Funcionário feliz, fábrica feliz!"],
    linesLula: ["Presidente! Aceita uma picanha?", "Aqui todo mundo tem folga no aniversário!"],
  },
  { id: "func1", name: "Jô", look: "func1", x: 200, y: 1055, facing: "side", lines: ["Picanha por conta do patrão!"] },
  { id: "func2", name: "Dani", look: "func2", x: 365, y: 1050, facing: "side", flip: true, lines: ["Melhor emprego do bairro!"] },
  { id: "func3", name: "Beto", look: "func3", x: 225, y: 1130, facing: "front", lines: ["O patrão lembrou do meu aniversário!"] },
  { id: "func4", name: "Rose", look: "func4", x: 340, y: 1135, facing: "front", lines: ["Hoje tem confraternização até as seis!"] },
  {
    id: "zeca",
    name: "Zeca da Selaria",
    look: "zeca",
    x: 1995,
    y: 476,
    facing: "front",
    lines: ["Selaria do Zeca: couro, sela e coisa esquisita.", "Freguês, aqui não tem boato. Só fivela."],
  },
  {
    id: "feirante",
    name: "Seu Nonato da feira",
    look: "feirante",
    x: 1360,
    y: 540,
    facing: "front",
    lines: ["Olha a laranja! Três é cinco!", "Laranja fresquinha, sem boato nenhum!"],
  },
  {
    id: "nilza",
    name: "Tia Nilza",
    look: "nilza",
    x: 913,
    y: 713,
    facing: "side",
    route: [
      { x: 913, y: 713 },
      { x: 1667, y: 713 },
      { x: 1667, y: 1213 },
      { x: 913, y: 1213 },
    ],
    loop: true,
    lines: ["Já encaminhei isso pra 47 grupos.", "Não li, mas compartilhei!", "Fonte? A fonte sou eu."],
  },
  {
    id: "osvaldo",
    name: "Tio Osvaldo",
    look: "osvaldo",
    x: 1880,
    y: 535,
    facing: "side",
    route: [
      { x: 1880, y: 535 },
      { x: 2520, y: 535 },
    ],
    lines: ["Minha fonte disse que o coreto é 5G.", "Neste bairro, até boato tem CNPJ."],
  },
  {
    id: "cida",
    name: "Dona Cida",
    look: "cida",
    x: 990,
    y: 472,
    facing: "side",
    route: [
      { x: 990, y: 472 },
      { x: 1590, y: 472 },
    ],
    lines: ["Que dia estranho, meu filho.", "Os boatos acordaram cedo hoje."],
  },
  { id: "didi", name: "Vô Didi", look: "didi", x: 1375, y: 488, facing: "front", lines: ["Hein? Fala mais alto!", "No meu tempo, boato vinha por carta!"] },
];

export const SPAWN = {
  hero: { x: 1010, y: 532 },
  car: { x: 985, y: 655, angle: 0 },
};

export const LULA_NPCS: NpcDef[] = [
  ...NPCS.map((n) => n.id === "boato" ? { ...n, x: 1115, y: 385 } : n),
  { id: "tiao", name: "Tião do bar", look: "tiao", x: 680, y: 475, facing: "front", lines: ["Cachaça presidencial: combustível exclusivo deste desenho!", "Abasteceu a caneta? Então vai trabalhar, presidente!"] },
  { id: "pastor", name: "Pastor Josué Aleluia", look: "pastor", x: 1350, y: 375, facing: "front", lines: ["Esse cadeado é maior que a porta da igreja!", "Hoje o sermão é sobre burocracia."] },
  { id: "diretora", name: "Diretora Clarice", look: "diretora", x: 1195, y: 1760, facing: "front", lines: ["Tem entrega presidencial até na escola!", "O almoxarifado não estava preparado para esse boato."] },
  { id: "reitora", name: "Reitora Vera", look: "reitora", x: 2250, y: 1060, facing: "front", lines: ["Aqui até o absurdo precisa de assinatura.", "Universidade do Pânico: formada nos grupos de família."] },
  { id: "despachante", name: "Despachante do Impossível", look: "despachante", x: 2310, y: 1760, facing: "front", lines: ["Pra China? Trouxe o Brasil bem embalado?", "Frete internacional. País inteiro paga excesso de bagagem."] },
];

export function npcsFor(hero: HeroId): NpcDef[] {
  return hero === "lula" ? LULA_NPCS : NPCS;
}

/** Objetos que podem ser pegos. */
export const ITEMS: Record<string, Point & { hero: HeroId; texture: string }> = {
  chicote: { x: 2060, y: 452, hero: "flavio", texture: "chicote" },
  cadeado: { x: 585, y: 515, hero: "lula", texture: "cadeado" },
  kits: { x: 1500, y: 1030, hero: "lula", texture: "kits" },
  "brasil-caixa": { x: 1510, y: 470, hero: "lula", texture: "brasil-caixa" },
};

export const PLACES: Record<string, Point & { label: ActionLabel }> = {
  igreja: { x: 1280, y: 367, label: "Fechar" },
  campus: { x: 2210, y: 1055, label: "Assinar" },
  terminal: { x: 2210, y: 1760, label: "Despachar" },
};

/** Paradas acessíveis mesmo com a energia zerada: andar e dirigir continuam livres. */
export const CACHACA_STOPS = [
  { x: 460, y: 515, name: "Bar do Tião" },
  { x: 1010, y: 1040, name: "Padaria" },
  { x: 2400, y: 1755, name: "Terminal" },
];

/** Pontos de referência da fábrica, usados pela consequência da missão. */
export const FACTORY = {
  chimney: { x: 535, y: 650 },
  gears: [
    { x: 150, y: 905 },
    { x: 330, y: 905 },
  ],
  /** Os funcionários correm de um lado a outro entre estes pontos. */
  rushLanes: [
    { from: { x: 110, y: 1040 }, to: { x: 430, y: 1040 } },
    { from: { x: 560, y: 1150 }, to: { x: 120, y: 1150 } },
    { from: { x: 150, y: 1180 }, to: { x: 600, y: 1180 } },
    { from: { x: 600, y: 1020 }, to: { x: 140, y: 1020 } },
  ],
};

/** Paredes nas bordas do mundo. */
export const WORLD_WALLS: Rect[] = [
  { x: -100, y: -100, w: WORLD.w + 200, h: 100 },
  { x: -100, y: WORLD.h, w: WORLD.w + 200, h: 100 },
  { x: -100, y: 0, w: 100, h: WORLD.h },
  { x: WORLD.w, y: 0, w: 100, h: WORLD.h },
];

export function buildingRect(b: BuildingDef): Rect {
  return { x: b.x, y: b.y, w: b.w, h: b.d };
}

/** Todos os retângulos sólidos do bairro. */
export function solidRects(hero: HeroId = "flavio"): (Rect & { tag?: string })[] {
  const rects: (Rect & { tag?: string })[] = [...WORLD_WALLS];
  for (const b of buildingsFor(hero)) rects.push({ ...buildingRect(b), tag: b.id });
  for (const p of PROPS) {
    const r = propCollider(p);
    if (r) rects.push({ ...r, tag: p.id });
  }
  return rects;
}
