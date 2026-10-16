import type { LookId } from "../looks";
import type { Point } from "../types";
import type { AmbientBehavior, CityNpc, DistrictId } from "./types";

/**
 * Vida nas ruas: moradores genéricos (sem história própria nesta fase) e trânsito.
 *
 * Moradores: passeiam pelas calçadas, atravessam nas faixas, conversam em duplas,
 * esperam em filas ou ficam parados na frente dos estabelecimentos.
 *
 * Trânsito: circuitos no sentido horário sobre as avenidas e as ruas do anel.
 * Mão inglesa? Não: mão direita. Em circuito horário, todo carro só vira à direita,
 * então os circuitos nunca se cruzam.
 */

const LOOKS: LookId[] = ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "func1", "func2", "func3", "func4", "zeca", "feirante"];
const NAMES = ["Morador", "Moradora", "Vizinho", "Vizinha", "Passante", "Cidadão", "Cidadã", "Trabalhador", "Trabalhadora"];

export const CHATTER: Record<DistrictId, string[]> = {
  residencial: ["Coletivizaram meu portão, mas o cadeado ficou comigo.", "O varal do vizinho agora é meu também.", "Mutirão no sábado! Ninguém sabe do quê.", "O cachorro da rua virou patrimônio."],
  civico: ["Protocolei um boato e ele saiu carimbado.", "Dizem que o ministério tem um ministério só pra ele.", "A fila da repartição já tem CEP.", "O decreto de hoje proíbe decreto amanhã."],
  comercial: ["Laranja por comitê, banana por assembleia!", "Fiado agora é política pública.", "O pastel inflou de tanto boato.", "Pix coletivo: mandei pra todo mundo sem querer."],
  educacional: ["Assembleia às 10, festa às 11, assembleia da festa ao meio-dia.", "A prova foi coletivizada: todo mundo tirou 7.", "O bandejão serve boato à milanesa.", "Minha tese é sobre o grupo da família."],
  industrial: ["Hoje a meta é produzir orgulho.", "O crachá agora tem estrela.", "Bati o ponto e o ponto bateu de volta.", "O galpão 2 é do povo, mas a chave sumiu."],
  terminal: ["Já embarquei a Amazônia, falta o Nordeste.", "O navio voltou pedindo mais Brasil.", "Frete grátis, mas a saudade paga imposto.", "Carimbaram o passaporte do país inteiro."],
};

let n = 0;
function npc(district: DistrictId, behavior: AmbientBehavior, x: number, y: number, extra: Partial<CityNpc> = {}): CityNpc {
  n++;
  const look = LOOKS[(n * 5 + district.length) % LOOKS.length];
  const name = NAMES[(n * 3) % NAMES.length];
  return {
    id: `amb-${district.slice(0, 3)}-${n}`,
    district,
    name,
    look,
    x,
    y,
    facing: "front",
    behavior,
    lines: [CHATTER[district][n % CHATTER[district].length], CHATTER[district][(n + 1) % CHATTER[district].length]],
    ...extra,
  };
}

/** Caminho de ida e volta. */
const walk = (district: DistrictId, behavior: AmbientBehavior, route: Point[]) => npc(district, behavior, route[0].x, route[0].y, { route, facing: "side" });
/** Dupla conversando: um de frente para o outro. */
const pair = (district: DistrictId, x: number, y: number, gap = 42): CityNpc[] => {
  const group = `conversa-${district}-${x}-${y}`;
  return [npc(district, "conversa", x, y, { facing: "side", group }), npc(district, "conversa", x + gap, y, { facing: "side", flip: true, group })];
};
/** Fila olhando para um balcão, ponto ou barraca. */
const queue = (district: DistrictId, pts: Point[], facing: CityNpc["facing"], flip = false): CityNpc[] => {
  const group = `fila-${district}-${pts[0].x}-${pts[0].y}`;
  return pts.map((q) => npc(district, "fila", q.x, q.y, { facing, flip, group }));
};

export const AMBIENT: CityNpc[] = [
  // Vila do Mutirão
  walk("residencial", "passeio", [
    { x: 270, y: 886 },
    { x: 820, y: 886 },
  ]),
  walk("residencial", "travessia", [
    { x: 560, y: 1214 },
    { x: 818, y: 1214 },
    { x: 818, y: 1356 },
    { x: 560, y: 1356 },
  ]),
  ...pair("residencial", 515, 1540),
  npc("residencial", "parado", 712, 1690, { facing: "side" }),
  walk("residencial", "passeio", [
    { x: 980, y: 1214 },
    { x: 1490, y: 1214 },
  ]),
  ...pair("residencial", 1170, 1604),
  // Centro Cívico
  walk("civico", "passeio", [
    { x: 2120, y: 634 },
    { x: 2680, y: 634 },
  ]),
  walk("civico", "travessia", [
    { x: 2300, y: 1204 },
    { x: 2122, y: 1204 },
    { x: 2122, y: 1346 },
    { x: 2300, y: 1346 },
  ]),
  ...pair("civico", 2470, 1150),
  ...queue(
    "civico",
    [
      { x: 2456, y: 1716 },
      { x: 2486, y: 1716 },
      { x: 2516, y: 1716 },
    ],
    "side",
    true,
  ),
  // Largo da Feira
  walk("comercial", "passeio", [
    { x: 2276, y: 1906 },
    { x: 2276, y: 2454 },
  ]),
  ...pair("comercial", 2580, 2454),
  ...queue(
    "comercial",
    [
      { x: 2310, y: 2542 },
      { x: 2352, y: 2542 },
    ],
    "back",
  ),
  walk("comercial", "travessia", [
    { x: 2746, y: 2200 },
    { x: 2746, y: 2700 },
  ]),
  npc("comercial", "parado", 2880, 2862, { facing: "side", flip: true }),
  // Cidade Universitária
  walk("educacional", "passeio", [
    { x: 3306, y: 1026 },
    { x: 3884, y: 1026 },
  ]),
  ...pair("educacional", 4120, 700),
  walk("educacional", "travessia", [
    { x: 3600, y: 1030 },
    { x: 4280, y: 1030 },
  ]),
  ...queue(
    "educacional",
    [
      { x: 4352, y: 872 },
      { x: 4322, y: 872 },
    ],
    "side",
  ),
  npc("educacional", "parado", 3600, 1500, { facing: "front" }),
  // Polo Industrial
  walk("industrial", "passeio", [
    { x: 266, y: 2504 },
    { x: 824, y: 2504 },
  ]),
  ...pair("industrial", 1300, 2300),
  walk("industrial", "travessia", [
    { x: 500, y: 2500 },
    { x: 1200, y: 2500 },
  ]),
  npc("industrial", "parado", 1160, 2880, { facing: "front" }),
  // Terminal Brasil–China
  walk("terminal", "passeio", [
    { x: 3844, y: 1906 },
    { x: 3844, y: 2544 },
  ]),
  ...pair("terminal", 3420, 2262),
  ...queue(
    "terminal",
    [
      { x: 3702, y: 2296 },
      { x: 3672, y: 2296 },
    ],
    "side",
  ),
  walk("terminal", "travessia", [
    { x: 3986, y: 2300 },
    { x: 3986, y: 2760 },
  ]),
];

// ------------------------------------------------------------------ trânsito

/** Cores dos carros que circulam pelas ruas (o trânsito em si fica em `ruas.ts` e `game/city/traffic.ts`). */
export const CORES_TRANSITO = ["#2f6fd6", "#f2c230", "#3aa655", "#e07a5f", "#7b4bd1", "#f4efe4", "#8a8f98", "#e2533b", "#f2a33a", "#d1453b"];
