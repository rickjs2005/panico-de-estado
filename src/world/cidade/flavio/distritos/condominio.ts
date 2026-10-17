import { casa, loja, parked } from "../../helpers";
import { lot } from "../../layout";
import type { DistrictContent, ParkingDef } from "../../types";

/** Condomínio Pátria Amada: casas atrás de cancela, a guarita, o Edifício Patriota, o motoclube e a pracinha com catraca. */
const D = "residencial" as const;

const VAGAS: ParkingDef = { id: "fl-res-vagas", name: "Vagas do Condomínio", district: D, rect: { x: 720, y: 900, w: 184, h: 200 }, rows: "h" };

export const CONDOMINIO: DistrictContent = {
  grounds: [
    { rect: lot(290, 270, 960, 700), kind: "grama" },
    { rect: lot(1070, 270, 1640, 700), kind: "grama" },
    { rect: { x: 1134, y: 590, w: 442, h: 72 }, kind: "concreto" },
    { rect: lot(1750, 270, 2310, 700), kind: "grama" },
    { rect: { x: 1800, y: 590, w: 300, h: 72 }, kind: "concreto" },
    { rect: lot(290, 810, 960, 1180), kind: "grama" },
    { rect: VAGAS.rect, kind: "patio" },
    { rect: lot(1070, 810, 1640, 1180), kind: "grama" },
    { rect: { x: 1392, y: 870, w: 200, h: 250 }, kind: "terra" },
    { rect: lot(1750, 810, 2310, 1180), kind: "grama" },
  ],
  decals: [
    // Edifício Patriota: degraus e tapete verde até a calçada
    { kind: "degraus", rect: { x: 1295, y: 560, w: 120, h: 21 } },
    { kind: "tapete", rect: { x: 1331, y: 581, w: 48, h: 62 }, color: "#2f9e5a" },
    // guarita: degrau e setas da fila do crachá
    { kind: "degraus", rect: { x: 1175, y: 1060, w: 60, h: 15 } },
    { kind: "setas", rect: { x: 1187, y: 1080, w: 36, h: 58 }, color: "#2f9e5a" },
  ],
  buildings: [
    casa(D, "fl-res-casa-01", 340, 420, 170, "#cfe8c4"),
    casa(D, "fl-res-casa-02", 530, 420, 170, "#f6e7a1", "laje"),
    casa(D, "fl-res-casa-03", 720, 420, 190, "#bcd6f0"),
    { id: "fl-res-edificio", district: D, kind: "conjunto", x: 1130, y: 440, w: 450, d: 120, h: 190, wall: "#e8e1c6", roof: "laje", sign: "EDIFÍCIO PATRIOTA · CONDOMÍNIO FECHADO" },
    loja(D, "fl-res-motoclube", 1800, 460, 280, "#3b4250", "MOTOCLUBE PÁTRIA SOBRE RODAS", ["#1f8a4c", "#ffd23f"], { h: 115 }),
    casa(D, "fl-res-casa-04", 2100, 440, 170, "#f4d0a6"),
    casa(D, "fl-res-casa-05", 340, 960, 170, "#f2d1e6"),
    casa(D, "fl-res-casa-06", 530, 960, 170, "#d4f0c0", "laje"),
    loja(D, "fl-res-guarita", 1120, 960, 230, "#e9e2cf", "ADMINISTRAÇÃO DO CONDOMÍNIO", ["#1f6f43", "#fffaf0"], { h: 105, d: 100 }),
    casa(D, "fl-res-casa-07", 1800, 960, 200, "#c8e6f5", "laje"),
    casa(D, "fl-res-casa-08", 2030, 960, 220, "#f6c8b0"),
  ],
  props: [
    // casas da quadra de cima: bandeiras, muretas e a placa do condomínio
    { kind: "bandeira", x: 345, y: 650, variant: "brasil" },
    { kind: "muroBaixo", x: 470, y: 662, variant: "verde" },
    { kind: "canteiro", x: 640, y: 655 },
    { kind: "placaColetiva", x: 865, y: 650, variant: "privada", text: "SORRIA: VOCÊ ESTÁ SENDO FILMADO" },
    { id: "fl-res-lixeira-1", kind: "lixeira", x: 780, y: 662, react: "tip" },
    // Edifício Patriota
    { kind: "canteiro", x: 1180, y: 650 },
    { kind: "canteiro", x: 1530, y: 650 },
    { kind: "banco", x: 1240, y: 655 },
    { kind: "bandeira", x: 1462, y: 655, variant: "brasil" },
    { kind: "arvore", x: 1120, y: 360 },
    // motoclube e a casa da esquina
    { kind: "placaColetiva", x: 2190, y: 650, variant: "privada", text: "VAGA EXCLUSIVA DE MOTO" },
    { kind: "bandeira", x: 2262, y: 660, variant: "brasil" },
    // quadra de baixo
    { kind: "bandeira", x: 345, y: 1132, variant: "brasil" },
    { kind: "canteiro", x: 640, y: 1132 },
    { kind: "placaColetiva", x: 845, y: 1132, variant: "privada", text: "ESTACIONAMENTO PRIVATIVO" },
    // guarita e pracinha com catraca
    { kind: "cancela", x: 1300, y: 1136 },
    { kind: "catraca", x: 1430, y: 1140 },
    { kind: "placaColetiva", x: 1545, y: 1140, variant: "privada", text: "PRACINHA EXCLUSIVA · CATRACA R$ 5" },
    { kind: "trave", x: 1492, y: 900 },
    { kind: "trave", x: 1492, y: 1102, variant: "baixo" },
    { kind: "banco", x: 1360, y: 880 },
    { kind: "arvore", x: 1600, y: 870 },
    // casas perto da avenida
    { kind: "canteiro", x: 1830, y: 1132 },
    { kind: "bandeira", x: 2262, y: 1132, variant: "brasil" },
    { id: "fl-res-bicicleta-1", kind: "bicicleta", x: 2160, y: 1132, react: "tip" },
  ],
  pois: [
    { id: "fl-res-edificio", name: "Edifício Patriota", district: D, x: 1355, y: 620, kind: "marco", landmark: true },
    { id: "fl-res-motoclube", name: "Motoclube Pátria Sobre Rodas", district: D, x: 1940, y: 630, kind: "servico", landmark: true },
    { id: "fl-res-guarita", name: "Administração do Condomínio", district: D, x: 1205, y: 1100, kind: "servico" },
    { id: "fl-res-pracinha", name: "Pracinha Exclusiva", district: D, x: 1492, y: 1000, kind: "praca" },
    { id: "fl-res-vagas", name: "Vagas do Condomínio", district: D, x: 812, y: 1000, kind: "estacionamento" },
  ],
  parking: [VAGAS],
  vehicles: [
    parked("fl-car-condominio", VAGAS, 1, "#2f9e5a"),
    { id: "fl-moto-clube-1", x: 1985, y: 640, angle: Math.PI / 2, color: "#1f2433", tipo: "moto" },
    { id: "fl-moto-clube-2", x: 2055, y: 640, angle: Math.PI / 2, color: "#c62835", tipo: "moto" },
  ],
  npcs: [
    {
      id: "fl-odete",
      district: D,
      name: "Dona Odete",
      look: "m7",
      x: 300,
      y: 832,
      facing: "side",
      route: [
        { x: 300, y: 832 },
        { x: 2290, y: 832 },
      ],
      lines: ["O condomínio aprovou catraca na pracinha. Agora o balanço tem mensalidade.", "Meu neto passou na guarita e pediram três documentos e um sorriso."],
    },
    { id: "fl-bira", district: D, name: "Bira do Motoclube", look: "motoqueiro", x: 2130, y: 610, facing: "front", lines: ["Moto é patrimônio, ronco é liberdade.", "Sobe numa moto que a turma vem atrás. É automático."] },
  ],
  cachaca: [],
};
