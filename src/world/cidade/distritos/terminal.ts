import { parked, row } from "../helpers";
import { lot } from "../layout";
import type { CityProp, DistrictContent, ParkingDef } from "../types";

/** Terminal Brasil–China: alfândega, armazéns, contêineres, esteira de despacho e o cais. */
const D = "terminal" as const;

const CORES = ["vermelho", "azul", "verde", "amarelo"];
const PATIO: ParkingDef = { id: "ter-estacionamento", name: "Estacionamento do Terminal", district: D, rect: { x: 3340, y: 2300, w: 470, h: 210 }, rows: "h" };

function conteineres(): CityProp[] {
  const list: CityProp[] = [];
  const cols = [3390, 3480, 3640, 3730];
  [2790, 2920, 3060, 3190].forEach((y, r) => cols.forEach((x, c) => list.push({ kind: "conteiner", x, y, variant: CORES[(r + c) % 4] })));
  return list;
}

export const TERMINAL: DistrictContent = {
  grounds: [
    { rect: lot(3290, 1890, 3860, 2560), kind: "concreto" },
    { rect: { x: 3340, y: 2300, w: 470, h: 210 }, kind: "patio" },
    { rect: lot(3970, 1890, 4550, 2560), kind: "concreto" },
    { rect: lot(3290, 2670, 3860, 3270), kind: "patio" },
    { rect: lot(3970, 2670, 4550, 3270), kind: "concreto" },
    { rect: { x: 3290, y: 3270, w: 1260, h: 160 }, kind: "concreto" },
  ],
  decals: [
    { kind: "degraus", rect: { x: 3440, y: 2170, w: 100, h: 18 } },
    { kind: "tapete", rect: { x: 3466, y: 2188, w: 48, h: 50 }, color: "#c62835" },
    { kind: "setas", rect: { x: 4117, y: 2236, w: 36, h: 52 } },
    { kind: "setas", rect: { x: 4372, y: 2236, w: 36, h: 52 } },
    { kind: "setas", rect: { x: 4097, y: 2906, w: 36, h: 50 } },
  ],
  buildings: [
    { id: "ter-alfandega", district: D, kind: "alfandega", x: 3340, y: 2050, w: 300, d: 120, h: 120, wall: "#f2c230", roof: "laje", sign: "ALFÂNDEGA DO IMPOSSÍVEL", hooks: { characters: ["despachante"] } },
    { id: "ter-armazem-1", district: D, kind: "armazem", x: 4015, y: 2070, w: 240, d: 150, h: 130, wall: "#d1453b", roof: "laje", sign: "ARMAZÉM BRASIL→CHINA 1" },
    { id: "ter-armazem-2", district: D, kind: "armazem", x: 4270, y: 2070, w: 240, d: 150, h: 130, wall: "#e0763b", roof: "laje", sign: "ARMAZÉM BRASIL→CHINA 2" },
    {
      id: "ter-despacho",
      district: D,
      kind: "galpao",
      x: 4020,
      y: 2790,
      w: 190,
      d: 100,
      h: 100,
      wall: "#f4efe4",
      roof: "laje",
      sign: "CONTROLE DE DESPACHO",
      place: "terminal-china",
      hooks: { missions: ["brasil-para-china"] },
    },
  ],
  props: [
    { kind: "cancela", x: 3700, y: 2190 },
    { kind: "quiosque", x: 3740, y: 2260, variant: "exportacao" },
    { kind: "bandeira", x: 3360, y: 2250, variant: "china" },
    { kind: "bandeira", x: 3620, y: 2250 },
    { kind: "outdoor", x: 4260, y: 2510, text: "EXPORTE O BRASIL · FRETE GRÁTIS PARA A CHINA" },
    ...conteineres(),
    { kind: "esteira", x: 4320, y: 3000 },
    { id: "ter-cone-1", kind: "cone", x: 4060, y: 3100, react: "tip" },
    { id: "ter-cone-2", kind: "cone", x: 4100, y: 3110, react: "tip" },
    { kind: "guindaste", x: 4420, y: 3330 },
    ...row("cabeco", 3330, 4500, 3424, 130),
    { kind: "palete", x: 4480, y: 2760 },
    { id: "ter-tambor-1", kind: "tambor", x: 4500, y: 2820, react: "wobble" },
    { id: "ter-bicicleta", kind: "bicicleta", x: 3560, y: 2280, react: "tip" },
  ],
  pois: [
    { id: "ter-terminal", name: "Terminal Brasil–China", district: D, x: 4260, y: 3000, kind: "terminal", landmark: true, hooks: { missions: ["brasil-para-china"] } },
    { id: "ter-alfandega", name: "Alfândega do Impossível", district: D, x: 3490, y: 2190, kind: "terminal", landmark: true },
    { id: "ter-navio", name: "Navio Destino China", district: D, x: 3900, y: 3400, kind: "marco", landmark: true },
    { id: "ter-armazens", name: "Armazéns Brasil→China", district: D, x: 4260, y: 2240, kind: "terminal" },
    { id: "ter-conteineres", name: "Pátio de Contêineres", district: D, x: 3560, y: 2990, kind: "terminal" },
    { id: "ter-estacionamento", name: "Estacionamento do Terminal", district: D, x: 3575, y: 2400, kind: "estacionamento" },
  ],
  parking: [PATIO],
  vehicles: [
    parked("car-terminal-1", PATIO, 0, "#e2533b"),
    parked("car-terminal-2", PATIO, 19, "#3aa655"),
  ],
  npcs: [
    { id: "despachante", district: D, name: "Despachante do Impossível", look: "despachante", x: 3490, y: 2215, facing: "front", lines: ["Pra China? Trouxe o Brasil bem embalado?", "Frete internacional. O país inteiro paga excesso de bagagem."] },
    {
      id: "estivador",
      district: D,
      name: "Estivador Beto",
      look: "func3",
      x: 3300,
      y: 2686,
      facing: "side",
      route: [
        { x: 3300, y: 2686 },
        { x: 4530, y: 2686 },
      ],
      lines: ["Já embarquei a Amazônia. Agora falta o Nordeste.", "Contêiner cheio de saudade. Destino: China."],
    },
  ],
  cachaca: [{ id: "cachaca-exportacao", name: "Quiosque da Exportação", district: D, x: 3740, y: 2285 }],
};
