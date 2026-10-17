import { loja, parked } from "../../helpers";
import { lot } from "../../layout";
import type { DistrictContent, ParkingDef } from "../../types";

/** Distrito do Chicote: a Fábrica Feliz, a Selaria do Zeca, o RH do calendário sem dezembro, galpões e oficinas. */
const D = "industrial" as const;

const PATIO: ParkingDef = { id: "fl-ind-estacionamento", name: "Estacionamento da Fábrica", district: D, rect: { x: 1940, y: 3100, w: 322, h: 200 }, rows: "h" };

export const CHICOTE: DistrictContent = {
  grounds: [
    { rect: lot(290, 2580, 1250, 2950), kind: "concreto" },
    { rect: lot(1360, 2580, 2310, 2950), kind: "concreto" },
    { rect: lot(290, 3060, 1250, 3340), kind: "concreto" },
    { rect: lot(1360, 3060, 2310, 3340), kind: "concreto" },
    { rect: PATIO.rect, kind: "patio" },
  ],
  decals: [
    // fábrica: degraus e a faixa amarela do portão
    { kind: "degraus", rect: { x: 560, y: 2870, w: 120, h: 18 } },
    // RH: setas da fila do décimo terceiro
    { kind: "setas", rect: { x: 1772, y: 2878, w: 36, h: 40 }, color: "#c62835" },
  ],
  buildings: [
    { id: "fl-ind-fabrica", district: D, kind: "fabrica", x: 360, y: 2730, w: 520, d: 140, h: 150, top: 50, wall: "#e2c7a8", roof: "telha", sign: "FÁBRICA FELIZ" },
    { id: "fl-ind-galpao-metas", district: D, kind: "galpao", x: 920, y: 2740, w: 280, d: 120, h: 120, wall: "#cdd2c8", roof: "laje", sign: "GALPÃO DAS METAS" },
    loja(D, "fl-ind-selaria", 1420, 2760, 200, "#c98a4b", "SELARIA DO ZECA", ["#7a3e1d", "#fff4e0"], { h: 110 }),
    { id: "fl-ind-rh", district: D, kind: "reparticao", x: 1660, y: 2750, w: 260, d: 110, h: 125, wall: "#e6e0d2", roof: "laje", sign: "RECURSOS HUMANOS · DEZEMBRO EM ANÁLISE" },
    { id: "fl-ind-almoxarifado", district: D, kind: "galpao", x: 1960, y: 2740, w: 290, d: 120, h: 120, wall: "#d8ccb4", roof: "laje", sign: "ALMOXARIFADO DA PRODUTIVIDADE" },
    { id: "fl-ind-galpao-1", district: D, kind: "galpao", x: 360, y: 3150, w: 360, d: 120, h: 120, wall: "#c9cdd2", roof: "laje", sign: "GALPÃO TERCEIRIZADO 1" },
    { id: "fl-ind-galpao-2", district: D, kind: "galpao", x: 760, y: 3150, w: 400, d: 120, h: 120, wall: "#d5c9b0", roof: "laje", sign: "GALPÃO TERCEIRIZADO 2" },
    loja(D, "fl-ind-oficina", 1420, 3160, 220, "#8ecae6", "OFICINA DO PÉ NA TÁBUA", ["#1d3557", "#f1faee"], { h: 110 }),
    loja(D, "fl-ind-borracharia", 1680, 3160, 200, "#b8d4e0", "BORRACHARIA SEM FOLGA", ["#1d3557", "#ffd23f"], { h: 105, d: 100 }),
  ],
  props: [
    // fábrica e galpão das metas
    { kind: "tambor", x: 940, y: 2900 },
    { kind: "tambor", x: 968, y: 2910 },
    { kind: "palete", x: 1140, y: 2905 },
    { id: "fl-ind-cone-1", kind: "cone", x: 880, y: 2910, react: "tip" },
    // selaria, RH e almoxarifado
    { kind: "placaColetiva", x: 1640, y: 2905, variant: "privada", text: "13º: VOLTE EM DEZEMBRO (TERÇA, 3H)" },
    { kind: "pneus", x: 1440, y: 2908 },
    { kind: "palete", x: 2200, y: 2905 },
    // galpões, oficina e borracharia
    { kind: "pneus", x: 1910, y: 3290 },
    { kind: "pneus", x: 1900, y: 3260 },
    { id: "fl-ind-lixeira", kind: "lixeira", x: 1180, y: 3300, react: "tip" },
    { kind: "tambor", x: 330, y: 3300 },
    { kind: "palete", x: 1220, y: 3120 },
  ],
  pois: [
    { id: "fl-ind-fabrica", name: "Fábrica Feliz", district: D, x: 620, y: 2900, kind: "industria", landmark: true },
    { id: "fl-ind-selaria", name: "Selaria do Zeca", district: D, x: 1494, y: 2900, kind: "comercio", landmark: true },
    { id: "fl-ind-rh", name: "Recursos Humanos", district: D, x: 1790, y: 2900, kind: "servico", landmark: true },
    { id: "fl-ind-galpao-metas", name: "Galpão das Metas", district: D, x: 1060, y: 2900, kind: "industria" },
    { id: "fl-ind-almoxarifado", name: "Almoxarifado da Produtividade", district: D, x: 2105, y: 2900, kind: "industria" },
    { id: "fl-ind-oficina", name: "Oficina do Pé na Tábua", district: D, x: 1501, y: 3300, kind: "servico" },
    { id: "fl-ind-estacionamento", name: "Estacionamento da Fábrica", district: D, x: 2101, y: 3200, kind: "estacionamento" },
  ],
  parking: [PATIO],
  vehicles: [
    parked("fl-car-fabrica-1", PATIO, 0, "#e2533b"),
    parked("fl-car-fabrica-2", PATIO, 8, "#8a8f98"),
  ],
  npcs: [
    { id: "fl-durval", district: D, name: "Seu Durval, dono da Fábrica Feliz", look: "patrao", x: 700, y: 2920, facing: "front", lines: ["Aqui todo mundo almoça sentado e sai no horário. Dizem que isso é crime agora.", "Meta feliz é meta que deixa a gente voltar pra casa."] },
    // na fila do RH, ao lado das setas do décimo terceiro (dá a missão 2)
    { id: "fl-tonhao", district: D, name: "Tonhão, operário", look: "func1", x: 1850, y: 2935, facing: "front", lines: ["Fui buscar o décimo terceiro e me deram um calendário sem dezembro.", "Bati o ponto e o ponto bateu meta."] },
  ],
  cachaca: [],
};
