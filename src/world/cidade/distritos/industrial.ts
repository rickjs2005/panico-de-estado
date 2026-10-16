import { parked } from "../helpers";
import { lot } from "../layout";
import type { DistrictContent, ParkingDef } from "../types";

/** Polo Industrial: fábrica estatal, galpões, depósitos e pátio de carga. */
const D = "industrial" as const;

const FABRICA: ParkingDef = { id: "ind-estacionamento", name: "Estacionamento da Fábrica", district: D, rect: { x: 300, y: 2300, w: 300, h: 160 }, rows: "h" };

export const INDUSTRIAL: DistrictContent = {
  grounds: [
    { rect: lot(250, 1890, 860, 2520), kind: "concreto" },
    { rect: { x: 300, y: 2300, w: 300, h: 160 }, kind: "patio" },
    { rect: lot(970, 1890, 1510, 2520), kind: "concreto" },
    { rect: lot(250, 2630, 860, 3270), kind: "concreto" },
    { rect: lot(970, 2630, 1510, 3270), kind: "patio" },
  ],
  buildings: [
    { id: "ind-fabrica", district: D, kind: "fabrica", x: 285, y: 2110, w: 540, d: 110, h: 140, top: 90, wall: "#b5523b", roof: "laje", sign: "FÁBRICA ESTATAL Nº 1" },
    { id: "ind-galpao-1", district: D, kind: "galpao", x: 1015, y: 2070, w: 220, d: 140, h: 120, wall: "#9aa0a8", roof: "laje", sign: "GALPÃO COLETIVO 1" },
    { id: "ind-galpao-2", district: D, kind: "galpao", x: 1250, y: 2070, w: 215, d: 140, h: 120, wall: "#b8a07a", roof: "laje", sign: "GALPÃO COLETIVO 2" },
    { id: "ind-deposito", district: D, kind: "galpao", x: 300, y: 2790, w: 240, d: 120, h: 110, wall: "#8ecae6", roof: "laje", sign: "DEPÓSITO CENTRAL DO POVO" },
    { id: "ind-almoxarifado", district: D, kind: "galpao", x: 570, y: 2790, w: 245, d: 120, h: 110, wall: "#e0b15a", roof: "laje", sign: "ALMOXARIFADO DO BOATO" },
  ],
  props: [
    { id: "ind-tambor-1", kind: "tambor", x: 690, y: 2310, react: "wobble" },
    { id: "ind-tambor-2", kind: "tambor", x: 722, y: 2328, react: "wobble" },
    { kind: "palete", x: 760, y: 2440 },
    { id: "ind-cone-1", kind: "cone", x: 650, y: 2460, react: "tip" },
    { kind: "outdoor", x: 1240, y: 2480, text: "PRODUÇÃO DO POVO, PELO POVO, PARA A CHINA" },
    { kind: "caminhao", x: 1080, y: 2800 },
    { kind: "caminhao", x: 1240, y: 2800, variant: "azul" },
    { kind: "caminhao", x: 1400, y: 2800 },
    { kind: "conteiner", x: 1100, y: 3110, variant: "azul" },
    { kind: "conteiner", x: 1310, y: 3130, variant: "verde" },
    { id: "ind-cone-2", kind: "cone", x: 1200, y: 2960, react: "tip" },
    { id: "ind-cone-3", kind: "cone", x: 1240, y: 2960, react: "tip" },
    { kind: "palete", x: 420, y: 3060 },
    { kind: "palete", x: 470, y: 3070 },
    { id: "ind-tambor-3", kind: "tambor", x: 700, y: 3050, react: "wobble" },
    { kind: "conteiner", x: 620, y: 3200, variant: "vermelho" },
    { kind: "bandeira", x: 300, y: 2250 },
    { id: "ind-cachorro", kind: "cachorro", x: 1460, y: 2440, react: "wobble" },
    { kind: "muroBaixo", x: 420, y: 2700, variant: "amarelo" },
    { kind: "quiosque", x: 1440, y: 2330, variant: "fabrica" },
  ],
  pois: [
    { id: "ind-fabrica", name: "Fábrica Estatal Nº 1", district: D, x: 555, y: 2250, kind: "industria", landmark: true },
    { id: "ind-galpoes", name: "Galpões Coletivos", district: D, x: 1240, y: 2240, kind: "industria" },
    { id: "ind-deposito", name: "Depósito Central do Povo", district: D, x: 420, y: 2940, kind: "industria" },
    { id: "ind-almoxarifado", name: "Almoxarifado do Boato", district: D, x: 690, y: 2940, kind: "industria" },
    { id: "ind-patio", name: "Pátio de Carga", district: D, x: 1240, y: 2950, kind: "industria" },
    { id: "ind-estacionamento", name: "Estacionamento da Fábrica", district: D, x: 450, y: 2380, kind: "estacionamento" },
  ],
  parking: [FABRICA],
  vehicles: [parked("car-fabrica", FABRICA, 1, "#8a8f98")],
  npcs: [
    {
      id: "operario",
      district: D,
      name: "Operária Jô",
      look: "func1",
      x: 300,
      y: 2255,
      facing: "side",
      route: [
        { x: 300, y: 2255 },
        { x: 800, y: 2255 },
      ],
      lines: ["O crachá agora tem estrela!", "Mandaram estatizar a impressora. Ela já não funcionava!"],
    },
    { id: "encarregada", district: D, name: "Encarregada Rose", look: "func4", x: 1130, y: 2245, facing: "front", lines: ["Galpão 1 é do povo. O galpão 2 também, mas está trancado."] },
  ],
  cachaca: [{ id: "cachaca-fabrica", name: "Cantina da Fábrica", district: D, x: 1440, y: 2356 }],
};
