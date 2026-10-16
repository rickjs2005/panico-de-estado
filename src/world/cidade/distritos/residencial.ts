import { casa, loja, parked } from "../helpers";
import { lot } from "../layout";
import type { DistrictContent, ParkingDef } from "../types";

/** Vila do Mutirão: casas, conjuntos habitacionais, varais e placas de coletivização. */
const D = "residencial" as const;

const VAGAS: ParkingDef = { id: "res-vagas", name: "Vagas da Rua do Mutirão", district: D, rect: { x: 420, y: 764, w: 352, h: 42 }, rows: "v" };

export const RESIDENCIAL: DistrictContent = {
  grounds: [
    { rect: lot(250, 270, 840, 760), kind: "grama" },
    { rect: lot(950, 270, 1510, 760), kind: "grama" },
    { rect: { x: 982, y: 600, w: 496, h: 128 }, kind: "concreto" },
    { rect: lot(250, 870, 840, 1230), kind: "grama" },
    { rect: lot(950, 870, 1510, 1230), kind: "grama" },
    { rect: lot(250, 1340, 840, 1710), kind: "grama" },
    { rect: { x: 330, y: 1400, w: 430, h: 250 }, kind: "terra" },
    { rect: lot(950, 1340, 1510, 1710), kind: "grama" },
  ],
  buildings: [
    casa(D, "res-casa-01", 300, 400, 150, "#f2a7b8"),
    casa(D, "res-casa-02", 470, 400, 150, "#7fb3d5", "laje"),
    casa(D, "res-casa-03", 640, 400, 150, "#b5e48c"),
    { id: "res-conjunto-13", district: D, kind: "conjunto", x: 1000, y: 480, w: 460, d: 120, h: 190, wall: "#f4d58d", roof: "laje", sign: "CONJUNTO HABITACIONAL COLETIVO Nº 13" },
    casa(D, "res-casa-04", 300, 1000, 160, "#ffd6a5"),
    casa(D, "res-casa-05", 480, 1000, 150, "#cdb4db", "laje"),
    casa(D, "res-casa-06", 650, 1000, 150, "#99e2b4"),
    { id: "res-conjunto-07", district: D, kind: "conjunto", x: 1000, y: 1030, w: 270, d: 110, h: 160, wall: "#a2d2ff", roof: "laje", sign: "CONJUNTO Nº 7" },
    { ...casa(D, "res-casa-07", 1300, 1040, 160, "#ff8fa3"), d: 90 },
    loja(D, "res-associacao", 1000, 1470, 230, "#e9c46a", "ASSOCIAÇÃO DO POVO", ["#c62835", "#fff4e0"], { h: 105, d: 100 }),
    casa(D, "res-casa-08", 1260, 1470, 200, "#f4e1c1", "laje"),
  ],
  props: [
    { kind: "varal", x: 375, y: 575 },
    { kind: "varal", x: 715, y: 575 },
    { kind: "placaColetiva", x: 300, y: 530, text: "PROPRIEDADE COLETIVA" },
    { kind: "placaColetiva", x: 600, y: 530, text: "ESTE PORTÃO É DO POVO" },
    { kind: "arvore", x: 320, y: 700 },
    { id: "res-lixeira-1", kind: "lixeira", x: 790, y: 712, react: "tip" },
    { kind: "banco", x: 1050, y: 690 },
    { kind: "banco", x: 1390, y: 690 },
    { kind: "mesaPiquenique", x: 1225, y: 700 },
    { kind: "bandeira", x: 1012, y: 660 },
    { kind: "arvore", x: 1455, y: 712 },
    { kind: "varal", x: 410, y: 1170 },
    { kind: "placaColetiva", x: 580, y: 1165, text: "PROPRIEDADE COLETIVA" },
    { kind: "arvore", x: 780, y: 1185 },
    { kind: "varal", x: 1335, y: 1190 },
    { kind: "bandeira", x: 1285, y: 1188 },
    { kind: "trave", x: 545, y: 1430 },
    { kind: "trave", x: 545, y: 1648, variant: "baixo" },
    { kind: "arvore", x: 300, y: 1420 },
    { kind: "arvore", x: 795, y: 1420 },
    { kind: "banco", x: 305, y: 1670 },
    { kind: "outdoor", x: 1200, y: 1668, text: "TUDO É DE TODOS · ATÉ O SEU PORTÃO" },
    { kind: "placaColetiva", x: 1360, y: 1640, text: "QUINTAL COLETIVO" },
    { kind: "arvore", x: 1460, y: 1670 },
    { kind: "quiosque", x: 760, y: 1665, variant: "birosca" },
    { kind: "horta", x: 480, y: 650 },
    { id: "res-cachorro-1", kind: "cachorro", x: 700, y: 610, react: "wobble" },
    { kind: "muroBaixo", x: 560, y: 712, variant: "azul" },
    { kind: "canteiro", x: 680, y: 1180 },
    { id: "res-bicicleta-1", kind: "bicicleta", x: 1470, y: 1180, react: "tip" },
    { kind: "horta", x: 700, y: 1500 },
  ],
  pois: [
    { id: "res-conjunto-13", name: "Conjunto Habitacional Nº 13", district: D, x: 1230, y: 620, kind: "marco", landmark: true },
    { id: "res-pracinha", name: "Pracinha do Mutirão", district: D, x: 545, y: 1540, kind: "praca" },
    { id: "res-associacao", name: "Associação do Povo", district: D, x: 1115, y: 1590, kind: "servico" },
    { id: "res-vagas", name: "Vagas da Rua do Mutirão", district: D, x: 600, y: 790, kind: "estacionamento" },
  ],
  parking: [VAGAS],
  vehicles: [parked("car-vila", VAGAS, 2, "#3aa655")],
  npcs: [
    {
      id: "osvaldo",
      district: D,
      name: "Tio Osvaldo",
      look: "osvaldo",
      x: 290,
      y: 744,
      facing: "side",
      route: [
        { x: 290, y: 744 },
        { x: 1490, y: 744 },
      ],
      lines: ["Meu portão virou patrimônio da revolução!", "O coreto era comunista desde o começo!"],
    },
    { id: "didi", district: D, name: "Vô Didi", look: "didi", x: 1150, y: 650, facing: "front", lines: ["Hein? Estatizaram meu rádio também?", "No meu tempo, boato vinha por carta!"] },
  ],
  cachaca: [{ id: "cachaca-birosca", name: "Birosca do Mutirão", district: D, x: 760, y: 1690 }],
};
