import { casa, loja, parked } from "../helpers";
import { lot } from "../layout";
import type { DistrictContent, ParkingDef } from "../types";

/** Largo da Feira: feira livre, comércio de rua, Bar do Tião e cachaça presidencial. */
const D = "comercial" as const;

const FRUTAS = ["laranja", "banana", "abacaxi"];
const FEIRA: ParkingDef = { id: "com-estacionamento", name: "Estacionamento da Feira", district: D, rect: { x: 1740, y: 2900, w: 360, h: 320 }, rows: "h" };

export const COMERCIAL: DistrictContent = {
  grounds: [
    { rect: lot(1690, 2580, 2150, 3270), kind: "calcada" },
    { rect: { x: 1740, y: 2900, w: 360, h: 320 }, kind: "patio" },
  ],
  buildings: [
    loja(D, "com-mercadinho", 1735, 2040, 200, "#ff9f80", "MERCADINHO KI-PREÇO", ["#e63946", "#ffd23f"], { h: 115 }),
    loja(D, "com-padaria", 1950, 2040, 160, "#f6bd60", "PADARIA DO POVO", ["#9c4a1a", "#fff4e0"]),
    loja(D, "com-bar-tiao", 2305, 2040, 270, "#f4d35e", "BAR DO TIÃO", ["#d62839", "#fff4e0"], { h: 115, door: 0.3, interior: "bar", hooks: { characters: ["tiao"] } }),
    loja(D, "com-farmacia", 2775, 2040, 140, "#9ed9c4", "FARMÁCIA", ["#1f8a4c", "#ffffff"], { h: 105 }),
    loja(D, "com-oficina", 2930, 2040, 140, "#8ecae6", "OFICINA DO ZÉ", ["#1d3557", "#f1faee"], { h: 105 }),
    loja(D, "com-borracharia", 1735, 2730, 180, "#8ecae6", "BORRACHARIA 24H", ["#1d3557", "#f1faee"], { d: 100, h: 100 }),
    loja(D, "com-shopping", 2305, 2730, 270, "#cdb4db", "SHOPPING POPULAR", ["#7b4bd1", "#ffd23f"], { h: 115 }),
    loja(D, "com-loterica", 2305, 3010, 160, "#ffe066", "LOTÉRICA", ["#2a6fdb", "#ffffff"], { d: 100, h: 100 }),
    loja(D, "com-pastelaria", 2775, 2730, 145, "#ffd6a5", "PASTEL DO POVO", ["#e85d04", "#ffffff"], { d: 100, h: 100 }),
    casa(D, "com-casa-01", 2935, 2730, 135, "#b5e48c"),
    casa(D, "com-casa-02", 2775, 3010, 150, "#a2d2ff", "laje"),
    casa(D, "com-casa-03", 2945, 3010, 125, "#ffc8dd"),
  ],
  props: [
    // feira na pista de cima da Rua da Feira
    ...[1780, 1900, 2020, 2330, 2450, 2800, 2920].map((x, i) => ({
      id: `com-barraca-${i + 1}`,
      kind: "barraca" as const,
      x,
      y: 2512,
      variant: FRUTAS[i % 3],
      react: "spill" as const,
    })),
    { kind: "mesaBar", x: 2330, y: 2232 },
    { kind: "mesaBar", x: 2470, y: 2240 },
    { kind: "mesaBar", x: 2540, y: 2228 },
    { kind: "orelhao", x: 2134, y: 2300 },
    { kind: "banca", x: 2830, y: 2320 },
    { kind: "pneus", x: 1955, y: 2800 },
    { kind: "pneus", x: 1990, y: 2790 },
    { id: "com-lixeira-1", kind: "lixeira", x: 2280, y: 2440, react: "tip" },
    { id: "com-lixeira-2", kind: "lixeira", x: 2745, y: 2440, react: "tip" },
    { kind: "outdoor", x: 2950, y: 2432, text: "CACHAÇA PRESIDENCIAL · ENERGIA DO POVO" },
    { kind: "quiosque", x: 2510, y: 3090, variant: "boteco" },
    { kind: "mesaBar", x: 2440, y: 3180 },
    { kind: "mesaBar", x: 2550, y: 3190 },
    { kind: "arvore", x: 2580, y: 2640 },
    { kind: "arvore", x: 3060, y: 3220 },
    { kind: "bandeira", x: 1760, y: 2200 },
    { kind: "pontoOnibus", x: 2900, y: 1905 },
    { kind: "bandeirolas", x: 2000, y: 2468 },
    { kind: "bandeirolas", x: 2470, y: 2468 },
    { id: "com-pipoca", kind: "carrinhoPipoca", x: 2560, y: 2320, react: "wobble" },
    { id: "com-cachorro", kind: "cachorro", x: 2100, y: 2440, react: "wobble" },
  ],
  pois: [
    { id: "com-feira", name: "Feira do Largo", district: D, x: 2350, y: 2525, kind: "comercio", landmark: true },
    { id: "com-bar-tiao", name: "Bar do Tião", district: D, x: 2386, y: 2170, kind: "comercio", landmark: true, hooks: { characters: ["tiao"] } },
    { id: "com-mercadinho", name: "Mercadinho Ki-Preço", district: D, x: 1835, y: 2170, kind: "comercio" },
    { id: "com-padaria", name: "Padaria do Povo", district: D, x: 2030, y: 2170, kind: "comercio" },
    { id: "com-farmacia", name: "Farmácia", district: D, x: 2845, y: 2170, kind: "servico" },
    { id: "com-oficina", name: "Oficina do Zé", district: D, x: 3000, y: 2170, kind: "servico" },
    { id: "com-borracharia", name: "Borracharia 24h", district: D, x: 1825, y: 2850, kind: "servico" },
    { id: "com-shopping", name: "Shopping Popular", district: D, x: 2440, y: 2860, kind: "comercio" },
    { id: "com-loterica", name: "Lotérica", district: D, x: 2385, y: 3130, kind: "servico" },
    { id: "com-pastelaria", name: "Pastel do Povo", district: D, x: 2845, y: 2850, kind: "comercio" },
    { id: "com-estacionamento", name: "Estacionamento da Feira", district: D, x: 1920, y: 3060, kind: "estacionamento" },
  ],
  parking: [FEIRA],
  vehicles: [
    parked("car-feira-1", FEIRA, 0, "#2f6fd6"),
    parked("car-feira-2", FEIRA, 12, "#f2c230"),
  ],
  npcs: [
    { id: "feirante", district: D, name: "Seu Nonato da feira", look: "feirante", x: 1900, y: 2458, facing: "front", lines: ["Laranja por unidade ou por comitê?", "Até a banana ganhou plano quinquenal!"] },
    {
      id: "cida",
      district: D,
      name: "Dona Cida",
      look: "cida",
      x: 1700,
      y: 2597,
      facing: "side",
      route: [
        { x: 1700, y: 2597 },
        { x: 3095, y: 2597 },
      ],
      lines: ["Fecharam a minha igreja e abriram mais um bar. Só neste Brasil impossível!", "Os boatos acordaram cedo hoje."],
    },
    { id: "camelo", district: D, name: "Camelô Dinho", look: "func2", x: 2440, y: 2885, facing: "front", lines: ["Kit de sobrevivência ao boato: três por dez!", "Aceito pix coletivo."] },
  ],
  cachaca: [{ id: "cachaca-boteco", name: "Boteco da Feira", district: D, x: 2510, y: 3115 }],
};
