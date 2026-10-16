import { col, loja, parked, row } from "../helpers";
import { lot } from "../layout";
import type { DistrictContent, ParkingDef } from "../types";

/** Centro Cívico: praça, prefeitura, Ministério do Boato, igreja interditada e repartições. */
const D = "civico" as const;

const PLAZA = lot(2100, 760, 2700, 1220);
const MUNICIPAL: ParkingDef = { id: "civ-estacionamento", name: "Estacionamento Municipal", district: D, rect: { x: 2150, y: 1400, w: 290, h: 270 }, rows: "h" };

/** Frades em volta da praça: o pedestre passa entre eles, o carro não. */
function frades() {
  return [
    ...row("frade", PLAZA.x + 10, PLAZA.x + PLAZA.w - 10, PLAZA.y + 6, 36),
    ...row("frade", PLAZA.x + 10, PLAZA.x + PLAZA.w - 10, PLAZA.y + PLAZA.h, 36),
    ...col("frade", PLAZA.x + 4, PLAZA.y + 42, PLAZA.y + PLAZA.h - 36, 36),
    ...col("frade", PLAZA.x + PLAZA.w - 4, PLAZA.y + 42, PLAZA.y + PLAZA.h - 36, 36),
  ];
}

export const CIVICO: DistrictContent = {
  grounds: [
    { rect: { x: 1722, y: 560, w: 236, h: 58 }, kind: "grama" },
    { rect: { x: 2842, y: 560, w: 236, h: 58 }, kind: "grama" },
    { rect: PLAZA, kind: "ondas" },
    { rect: { x: 2150, y: 1400, w: 290, h: 270 }, kind: "patio" },
  ],
  buildings: [
    { id: "civ-secretaria", district: D, kind: "reparticao", x: 1735, y: 430, w: 210, d: 110, h: 125, wall: "#efe1c4", roof: "laje", sign: "SECRETARIA DA COLETIVIZAÇÃO" },
    { id: "civ-prefeitura", district: D, kind: "prefeitura", x: 2150, y: 455, w: 500, d: 120, h: 145, top: 40, wall: "#fff3dc", roof: "telha", sign: "PREFEITURA POPULAR" },
    loja(D, "civ-imprensa", 2855, 430, 210, "#f6bd60", "IMPRENSA OFICIAL DO BOATO", ["#c62835", "#fff4e0"], { h: 120 }),
    {
      id: "civ-igreja-matriz",
      district: D,
      kind: "igreja",
      x: 1730,
      y: 1000,
      w: 220,
      d: 110,
      h: 150,
      top: 80,
      wall: "#fff8ec",
      roof: "telha",
      place: "igreja-matriz",
      hooks: { missions: ["operacao-cadeado"], characters: ["pastor"] },
    },
    { id: "civ-ministerio", district: D, kind: "ministerio", x: 2855, y: 1010, w: 210, d: 120, h: 180, top: 110, wall: "#f4efe4", roof: "laje", sign: "MINISTÉRIO DO BOATO" },
    { id: "civ-reparticao", district: D, kind: "reparticao", x: 1735, y: 1480, w: 210, d: 110, h: 115, wall: "#d9c7a7", roof: "laje", sign: "REPARTIÇÃO DE CARIMBOS", interior: "reparticao" },
    loja(D, "civ-banco", 2470, 1480, 190, "#9ed9c4", "BANCO ESTATAL DO POVO", ["#1f6e44", "#ffffff"], { h: 115 }),
    { id: "civ-assembleia", district: D, kind: "capela", x: 2855, y: 1480, w: 210, d: 110, h: 115, wall: "#e8e4f2", roof: "laje", sign: "ASSEMBLEIA DA FÉ", place: "assembleia" },
  ],
  props: [
    { kind: "outdoor", x: 1840, y: 612, text: "O BOATO VIROU LEI" },
    { kind: "outdoor", x: 2960, y: 612, text: "MINISTÉRIO DO BOATO · SEU ÁUDIO É NOTÍCIA" },
    { kind: "bandeira", x: 2175, y: 612 },
    { kind: "bandeira", x: 2625, y: 612 },
    { kind: "bandeira", x: 2300, y: 612 },
    { kind: "bandeira", x: 2500, y: 612 },
    // praça
    { id: "civ-monumento", kind: "monumento", x: 2400, y: 965 },
    { kind: "coreto", x: 2235, y: 1125 },
    { kind: "chafariz", x: 2565, y: 1120 },
    { kind: "palmeira", x: 2160, y: 830 },
    { kind: "palmeira", x: 2640, y: 830 },
    { kind: "palmeira", x: 2160, y: 1000 },
    { kind: "palmeira", x: 2640, y: 1000 },
    { kind: "banco", x: 2290, y: 880 },
    { kind: "banco", x: 2510, y: 880 },
    { kind: "banco", x: 2400, y: 1165 },
    { kind: "bandeira", x: 2245, y: 960 },
    { kind: "bandeira", x: 2555, y: 960 },
    { id: "civ-lixeira-praca", kind: "lixeira", x: 2460, y: 1050, react: "tip" },
    ...frades(),
    // igreja e repartições
    { kind: "palmeira", x: 1745, y: 1170 },
    { kind: "palmeira", x: 1940, y: 1170 },
    { kind: "placaColetiva", x: 1780, y: 1655, text: "SENHA: RETIRE NO GUICHÊ" },
    { kind: "orelhao", x: 1985, y: 1650 },
    { kind: "outdoor", x: 2560, y: 1668, text: "PIX COLETIVO: O SEU É DE TODOS" },
    { kind: "pontoOnibus", x: 2400, y: 1705 },
    { id: "civ-cone-1", kind: "cone", x: 2460, y: 1390, react: "tip" },
    { id: "civ-cone-2", kind: "cone", x: 2140, y: 1390, react: "tip" },
  ],
  pois: [
    { id: "civ-praca", name: "Praça da Revolução Boateira", district: D, x: 2400, y: 1040, kind: "praca", landmark: true },
    { id: "civ-prefeitura", name: "Prefeitura Popular", district: D, x: 2400, y: 600, kind: "governo", landmark: true },
    { id: "civ-ministerio", name: "Ministério do Boato", district: D, x: 2960, y: 1160, kind: "governo", landmark: true },
    { id: "civ-igreja-matriz", name: "Igreja Matriz (interditada)", district: D, x: 1840, y: 1140, kind: "marco", landmark: true, hooks: { missions: ["operacao-cadeado"] } },
    { id: "civ-reparticao", name: "Repartição de Carimbos", district: D, x: 1840, y: 1620, kind: "governo", landmark: true },
    { id: "civ-secretaria", name: "Secretaria da Coletivização", district: D, x: 1840, y: 570, kind: "governo" },
    { id: "civ-imprensa", name: "Imprensa Oficial do Boato", district: D, x: 2960, y: 570, kind: "governo" },
    { id: "civ-banco", name: "Banco Estatal do Povo", district: D, x: 2565, y: 1620, kind: "servico" },
    { id: "civ-assembleia", name: "Assembleia da Fé (interditada)", district: D, x: 2960, y: 1620, kind: "marco" },
    { id: "civ-estacionamento", name: "Estacionamento Municipal", district: D, x: 2295, y: 1535, kind: "estacionamento" },
  ],
  parking: [MUNICIPAL],
  vehicles: [
    { id: "car-oficial", x: 2330, y: 1290, angle: 0, color: "#e2533b" },
    parked("car-municipal-1", MUNICIPAL, 1, "#f4efe4"),
    parked("car-municipal-2", MUNICIPAL, 10, "#2f6fd6"),
  ],
  npcs: [
    {
      id: "nilza",
      district: D,
      name: "Tia Nilza",
      look: "nilza",
      x: 2116,
      y: 776,
      facing: "side",
      route: [
        { x: 2116, y: 776 },
        { x: 2684, y: 776 },
        { x: 2684, y: 1204 },
        { x: 2116, y: 1204 },
      ],
      loop: true,
      lines: ["Eu avisei no grupo! Agora tem um ministério só de boato!", "Meu áudio de três minutos virou decreto!"],
    },
    { id: "boato", district: D, name: "Seu Boato", look: "boato", x: 2330, y: 1060, facing: "front", lines: ["Os áudios do zap viraram plano de governo!", "Aqui até a fofoca foi estatizada."] },
    {
      id: "pastor",
      district: D,
      name: "Pastor Josué Aleluia",
      look: "pastor",
      x: 1905,
      y: 1150,
      facing: "front",
      lines: ["Esse cadeado é maior que a porta da igreja!", "Hoje o sermão é sobre burocracia."],
      hooks: { missions: ["operacao-cadeado"] },
    },
  ],
  cachaca: [],
};
