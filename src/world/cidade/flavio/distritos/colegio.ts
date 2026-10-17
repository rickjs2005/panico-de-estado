import { casa, loja } from "../../helpers";
import { lot } from "../../layout";
import type { DistrictContent } from "../../types";

/** Colégio Cívico-Militar: o colégio com a quadra de desfile, a Faculdade de Ordem Unida, a biblioteca e a república dos cadetes. */
const D = "educacional" as const;

export const COLEGIO: DistrictContent = {
  grounds: [
    { rect: lot(2490, 270, 3400, 1180), kind: "grama" },
    { rect: { x: 2600, y: 660, w: 440, h: 250 }, kind: "quadra" },
    { rect: { x: 2560, y: 600, w: 520, h: 40 }, kind: "concreto" },
    { rect: lot(3510, 270, 4490, 660), kind: "grama" },
    { rect: { x: 3940, y: 556, w: 470, h: 64 }, kind: "concreto" },
    { rect: lot(3510, 770, 4490, 1180), kind: "grama" },
  ],
  decals: [
    // colégio: escadaria e tapete verde da formatura
    { kind: "degraus", rect: { x: 2760, y: 560, w: 120, h: 24 } },
    { kind: "tapete", rect: { x: 2796, y: 584, w: 48, h: 56 }, color: "#1f6f43" },
    // faculdade: degraus
    { kind: "degraus", rect: { x: 4110, y: 530, w: 120, h: 21 } },
  ],
  buildings: [
    { id: "fl-edu-colegio", district: D, kind: "escola", x: 2560, y: 420, w: 520, d: 140, h: 160, top: 40, wall: "#e6efe2", roof: "telha", sign: "COLÉGIO CÍVICO-MILITAR · ORDEM ANTES DO RECREIO" },
    loja(D, "fl-edu-cantina", 3130, 450, 210, "#f6e3a0", "CANTINA DO RANCHO", ["#3a7a4a", "#ffd23f"], { h: 110 }),
    casa(D, "fl-edu-casa-sargento", 3140, 960, 200, "#d8e2c8", "laje"),
    loja(D, "fl-edu-biblioteca", 3570, 420, 300, "#dfe8f0", "BIBLIOTECA DOS LIVROS APROVADOS", ["#1f6f43", "#fffaf0"], { h: 125 }),
    { id: "fl-edu-faculdade", district: D, kind: "universidade", x: 3920, y: 400, w: 520, d: 130, h: 150, top: 30, wall: "#eef2e6", roof: "telha", sign: "FACULDADE DE ORDEM UNIDA" },
    casa(D, "fl-edu-casa-01", 3570, 940, 170, "#f0e0c0"),
    casa(D, "fl-edu-casa-02", 3770, 940, 170, "#c6dfc0", "laje"),
    loja(D, "fl-edu-republica", 4150, 930, 280, "#e4ecf6", "REPÚBLICA DOS CADETES", ["#2f6fd6", "#fffaf0"], { h: 110 }),
  ],
  props: [
    // pátio de formatura: mastros, bancos e a tabela da quadra
    { kind: "bandeira", x: 2590, y: 960, variant: "brasil" },
    { kind: "bandeira", x: 2660, y: 960, variant: "brasil" },
    { kind: "bandeira", x: 2730, y: 960, variant: "brasil" },
    { kind: "banco", x: 2900, y: 960 },
    { kind: "banco", x: 3000, y: 960 },
    { kind: "tabela", x: 3060, y: 790 },
    { kind: "placaColetiva", x: 3270, y: 650, variant: "privada", text: "FILA EM ORDEM UNIDA" },
    { kind: "arvore", x: 3350, y: 1120 },
    { kind: "canteiro", x: 2900, y: 1120 },
    { id: "fl-edu-lixeira", kind: "lixeira", x: 3290, y: 1130, react: "tip" },
    // biblioteca e faculdade
    { kind: "canteiro", x: 3600, y: 610 },
    { kind: "placaColetiva", x: 3800, y: 612, variant: "privada", text: "SÓ LIVRO COM CARIMBO" },
    { kind: "bandeira", x: 3925, y: 620, variant: "brasil" },
    { kind: "bandeira", x: 4430, y: 620, variant: "brasil" },
    // casas e república
    { kind: "canteiro", x: 3600, y: 1120 },
    { kind: "arvore", x: 3980, y: 1100 },
    { kind: "pontoOnibus", x: 4060, y: 1150, variant: "patria" },
    { id: "fl-edu-bicicleta", kind: "bicicleta", x: 4440, y: 1132, react: "tip" },
  ],
  pois: [
    { id: "fl-edu-colegio", name: "Colégio Cívico-Militar", district: D, x: 2820, y: 640, kind: "educacao", landmark: true },
    { id: "fl-edu-quadra", name: "Quadra de Desfile", district: D, x: 2820, y: 785, kind: "praca" },
    { id: "fl-edu-faculdade", name: "Faculdade de Ordem Unida", district: D, x: 4180, y: 600, kind: "educacao", landmark: true },
    { id: "fl-edu-biblioteca", name: "Biblioteca dos Livros Aprovados", district: D, x: 3681, y: 600, kind: "educacao" },
    { id: "fl-edu-cantina", name: "Cantina do Rancho", district: D, x: 3208, y: 620, kind: "comercio" },
    { id: "fl-edu-republica", name: "República dos Cadetes", district: D, x: 4254, y: 1100, kind: "servico" },
  ],
  parking: [],
  vehicles: [{ id: "fl-car-colegio", x: 2860, y: 1085, angle: 0, color: "#3a7a4a" }],
  npcs: [
    { id: "fl-sargento", district: D, name: "Sargento Diretor Ademar", look: "sargento", x: 2700, y: 820, facing: "front", lines: ["Ordem unida antes do recreio, recreio em ordem unida.", "Aqui a merenda bate continência antes de ser servida."] },
    {
      id: "fl-cadete",
      district: D,
      name: "Cadete Júnior",
      look: "m4",
      x: 2620,
      y: 690,
      facing: "side",
      route: [
        { x: 2620, y: 690 },
        { x: 3020, y: 690 },
        { x: 3020, y: 880 },
        { x: 2620, y: 880 },
      ],
      loop: true,
      lines: ["Esquerda, volver! Volver de novo! Já não sei pra onde estou indo.", "A redação de hoje é sobre a importância da redação aprovada."],
    },
  ],
  cachaca: [],
};
