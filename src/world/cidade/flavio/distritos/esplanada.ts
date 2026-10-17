import { casa, col, loja, parked, row } from "../../helpers";
import { lot } from "../../layout";
import type { DistrictContent, ParkingDef } from "../../types";

/** Esplanada da Ordem: o Palácio, a praça do desfile, o Ministério da Ordem Comunicacional, o Cartório das Autorizações e o Tribunal do Cofre. */
const D = "civico" as const;

/** Praça do desfile, embaixo do Palácio. */
const PRACA = { x: 1262, y: 1690, w: 996, h: 232 };
const MINISTERIO: ParkingDef = { id: "fl-civ-estacionamento", name: "Estacionamento do Ministério", district: D, rect: { x: 380, y: 1756, w: 322, h: 170 }, rows: "h" };

/** Frades em volta da praça: o pedestre passa entre eles, o carro não. */
function frades() {
  return [
    ...row("frade", PRACA.x + 10, PRACA.x + PRACA.w - 10, PRACA.y + PRACA.h, 36),
    ...col("frade", PRACA.x + 4, PRACA.y + 40, PRACA.y + PRACA.h - 36, 36),
    ...col("frade", PRACA.x + PRACA.w - 4, PRACA.y + 40, PRACA.y + PRACA.h - 36, 36),
  ];
}

export const ESPLANADA: DistrictContent = {
  grounds: [
    { rect: lot(290, 1360, 1100, 1960), kind: "grama" },
    { rect: MINISTERIO.rect, kind: "patio" },
    { rect: lot(1210, 1360, 2310, 1960), kind: "grama" },
    { rect: PRACA, kind: "ondas" },
    { rect: lot(290, 2070, 2310, 2400), kind: "grama" },
  ],
  decals: [
    // palácio: escadaria e tapete até a praça
    { kind: "degraus", rect: { x: 1700, y: 1650, w: 120, h: 24 } },
    { kind: "tapete", rect: { x: 1736, y: 1674, w: 48, h: 16 } },
    // cartório: degrau e setas da fila das autorizações
    { kind: "degraus", rect: { x: 840, y: 1710, w: 60, h: 15 } },
    { kind: "setas", rect: { x: 852, y: 1730, w: 36, h: 66 }, color: "#2f9e5a" },
    // tribunal: degraus da porta
    { kind: "degraus", rect: { x: 486, y: 2335, w: 108, h: 18 } },
  ],
  buildings: [
    { id: "fl-civ-ministerio", district: D, kind: "ministerio", x: 360, y: 1580, w: 300, d: 120, h: 180, top: 110, wall: "#eef0e6", roof: "laje", sign: "MINISTÉRIO DA ORDEM COMUNICACIONAL" },
    { id: "fl-civ-cartorio", district: D, kind: "reparticao", x: 720, y: 1600, w: 300, d: 110, h: 115, wall: "#dfe6d2", roof: "laje", sign: "CARTÓRIO DAS AUTORIZAÇÕES" },
    { id: "fl-civ-palacio", district: D, kind: "prefeitura", x: 1500, y: 1520, w: 520, d: 130, h: 150, top: 40, wall: "#fbf6e6", roof: "telha", sign: "PALÁCIO DA ORDEM" },
    { id: "fl-civ-tribunal", district: D, kind: "ministerio", x: 380, y: 2215, w: 320, d: 120, h: 160, top: 60, wall: "#ecebe4", roof: "laje", sign: "TRIBUNAL ELEITORAL DO COFRE" },
    loja(D, "fl-civ-gabinete", 760, 2230, 240, "#f2e6c4", "GABINETE DO DESMENTIDO", ["#1f6f43", "#ffd23f"], { h: 120 }),
    { id: "fl-civ-secretaria", district: D, kind: "reparticao", x: 1080, y: 2230, w: 230, d: 110, h: 125, wall: "#e2ead8", roof: "laje", sign: "SECRETARIA DE PRIVATIZAÇÃO" },
    casa(D, "fl-civ-casa-01", 1420, 2240, 180, "#e9dcc0"),
    casa(D, "fl-civ-casa-02", 1630, 2240, 180, "#cfe0f2", "laje"),
  ],
  props: [
    // praça do desfile: o palanque, a Moto da Pátria, mastros, bancos e canteiros
    { id: "fl-civ-palanque", kind: "palanque", x: 1760, y: 1880 },
    { id: "fl-civ-monumento", kind: "motoEstatua", x: 1420, y: 1820 },
    { kind: "bandeira", x: 1300, y: 1740, variant: "brasil" },
    { kind: "bandeira", x: 2220, y: 1740, variant: "brasil" },
    { kind: "bandeira", x: 1640, y: 1740, variant: "brasil" },
    { kind: "bandeira", x: 1880, y: 1740, variant: "brasil" },
    { kind: "banco", x: 2050, y: 1780 },
    { kind: "banco", x: 2050, y: 1880 },
    { kind: "canteiro", x: 1560, y: 1880 },
    { kind: "canteiro", x: 1960, y: 1880 },
    { kind: "palmeira", x: 2190, y: 1880 },
    { id: "fl-civ-lixeira-praca", kind: "lixeira", x: 2140, y: 1840, react: "tip" },
    ...frades(),
    // jardins do palácio
    { kind: "palmeira", x: 1280, y: 1630 },
    { kind: "palmeira", x: 2220, y: 1520 },
    { kind: "canteiro", x: 1360, y: 1640 },
    { kind: "canteiro", x: 2160, y: 1640 },
    { kind: "outdoor", x: 1370, y: 1500, variant: "verde", text: "PALÁCIO DA ORDEM · OBEDEÇA COM ALEGRIA" },
    // ministério e cartório
    { kind: "placaColetiva", x: 940, y: 1760, variant: "privada", text: "AUTORIZAÇÃO: RETIRE A SENHA" },
    { kind: "orelhao", x: 1050, y: 1900 },
    { id: "fl-civ-cone-1", kind: "cone", x: 730, y: 1910, react: "tip" },
    { kind: "bandeira", x: 340, y: 1740, variant: "brasil" },
    // rua do desfile: tribunal, gabinete e secretaria
    { kind: "placaColetiva", x: 1900, y: 2350, variant: "privada", text: "URNA GUARDADA EM COFRE" },
    { kind: "pontoOnibus", x: 2140, y: 2390, variant: "patria" },
    { kind: "canteiro", x: 1360, y: 2350 },
    { kind: "arvore", x: 2240, y: 2140 },
    { kind: "banca", x: 2000, y: 2230 },
  ],
  pois: [
    { id: "fl-civ-praca", name: "Praça do Desfile", district: D, x: 1760, y: 1800, kind: "praca", landmark: true },
    { id: "fl-civ-palacio", name: "Palácio da Ordem", district: D, x: 1760, y: 1690, kind: "governo", landmark: true },
    { id: "fl-civ-ministerio", name: "Ministério da Ordem Comunicacional", district: D, x: 510, y: 1730, kind: "governo", landmark: true },
    { id: "fl-civ-cartorio", name: "Cartório das Autorizações", district: D, x: 830, y: 1740, kind: "governo", landmark: true },
    { id: "fl-civ-tribunal", name: "Tribunal Eleitoral do Cofre", district: D, x: 540, y: 2370, kind: "governo", landmark: true },
    { id: "fl-civ-gabinete", name: "Gabinete do Desmentido", district: D, x: 849, y: 2370, kind: "governo" },
    { id: "fl-civ-secretaria", name: "Secretaria de Privatização", district: D, x: 1195, y: 2370, kind: "governo" },
    { id: "fl-civ-estacionamento", name: "Estacionamento do Ministério", district: D, x: 541, y: 1841, kind: "estacionamento" },
  ],
  parking: [MINISTERIO],
  vehicles: [
    { id: "fl-car-oficial", x: 1560, y: 1712, angle: 0, color: "#1f2433" },
    parked("fl-car-ministerio-1", MINISTERIO, 2, "#f4efe4"),
    parked("fl-car-ministerio-2", MINISTERIO, 9, "#2f6fd6"),
    { id: "fl-moto-esplanada", x: 2150, y: 1700, angle: 0, color: "#2f9e5a", tipo: "moto" },
  ],
  npcs: [
    { id: "fl-patriota", district: D, name: "@PatriotaRaiz.Oficial", look: "patriota", x: 1680, y: 1780, facing: "front", lines: ["Gravando! Comenta “ORDEM” que eu respondo todo mundo.", "Hoje o conteúdo é sobre a Esplanada. Amanhã também."] },
    // na calçada da praça, perto do ponto de ônibus (dá a missão 5)
    { id: "fl-kelly", district: D, name: "Prima Kelly", look: "kelly", x: 2000, y: 1950, facing: "front", lines: ["Quero votar e me pedem autorização. De quem? Ninguém sabe.", "Perguntei a fonte do decreto. Me tiraram de mais um grupo."] },
    { id: "fl-wanderley", district: D, name: "Wanderley Coturno", look: "wanderley", x: 960, y: 2390, facing: "front", lines: ["Desminto antes de acontecer. É mais eficiente.", "Aquilo que você viu? Não viu. Assinado: Gabinete."] },
  ],
  cachaca: [],
};
