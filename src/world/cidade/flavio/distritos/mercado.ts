import { casa, loja, parked } from "../../helpers";
import { lot } from "../../layout";
import type { DistrictContent, ParkingDef } from "../../types";

/** Livre Mercado: o posto de saúde com catraca, a farmácia em versão demonstração, o banco, o shopping e a feira com pedágio. */
const D = "comercial" as const;

const FRUTAS = ["laranja", "banana", "abacaxi"];
const ESTACIONAMENTO: ParkingDef = { id: "fl-com-estacionamento", name: "Estacionamento Rotativo Premium", district: D, rect: { x: 3680, y: 2010, w: 340, h: 320 }, rows: "h" };

export const MERCADO: DistrictContent = {
  grounds: [
    { rect: lot(2490, 1950, 3500, 2400), kind: "calcada" },
    { rect: ESTACIONAMENTO.rect, kind: "patio" },
  ],
  decals: [
    // posto: setas da fila comum (a VIP entra pela catraca)
    { kind: "degraus", rect: { x: 2641, y: 1610, w: 60, h: 15 } },
    { kind: "setas", rect: { x: 2653, y: 1630, w: 36, h: 66 }, color: "#2f9e5a" },
    // shopping: degraus da entrada
    { kind: "degraus", rect: { x: 3768, y: 1620, w: 120, h: 18 } },
  ],
  buildings: [
    loja(D, "fl-com-posto", 2560, 1500, 300, "#e4f4ee", "POSTO DE SAÚDE PREMIUM", ["#2f9e5a", "#fffaf0"], { h: 120, place: "fl-catraca-posto" }),
    loja(D, "fl-com-farmacia", 2895, 1510, 205, "#dff3ea", "FARMÁCIA DEMONSTRAÇÃO", ["#1f8a4c", "#ffffff"], { d: 100, h: 105 }),
    loja(D, "fl-com-banco", 3130, 1500, 220, "#d8efe0", "BANCO DO LIVRE MERCADO", ["#1f6f43", "#ffd23f"], { h: 120 }),
    loja(D, "fl-com-shopping", 3680, 1500, 400, "#ece4d0", "SHOPPING LIVRE MERCADO", ["#e0a91f", "#1f6f43"], { d: 120, h: 130 }),
    loja(D, "fl-com-loterica", 4110, 1520, 170, "#fff1a8", "LOTÉRICA DO BENEFÍCIO", ["#2a6fdb", "#ffffff"], { d: 100, h: 100 }),
    loja(D, "fl-com-padaria", 4300, 1520, 150, "#f8e3b6", "PADARIA PREMIUM", ["#9c4a1a", "#fff4e0"], { d: 100, h: 105 }),
    loja(D, "fl-com-mercado", 2560, 2140, 260, "#ffe7cf", "SUPERMERCADO LIVRE CONCORRÊNCIA", ["#e63946", "#ffd23f"], { h: 115 }),
    loja(D, "fl-com-bar", 2850, 2140, 260, "#f4d35e", "CHOPERIA LIVRE INICIATIVA", ["#1f6f43", "#fff4e0"], { h: 115, door: 0.3 }),
    loja(D, "fl-com-lanchonete", 3140, 2150, 170, "#ffd6a5", "PASTEL COM TAXA DE SERVIÇO", ["#e85d04", "#ffffff"], { d: 100, h: 100 }),
    casa(D, "fl-com-casa-01", 3330, 2150, 130, "#c8e6c0"),
    casa(D, "fl-com-casa-02", 4070, 2150, 170, "#a2d2ff", "laje"),
    casa(D, "fl-com-casa-03", 4270, 2150, 180, "#ffc8dd"),
  ],
  props: [
    // feira na pista de cima da Rua do Pedágio
    ...[2600, 2720, 2840, 3100, 3220, 3740, 3860, 4200].map((x, i) => ({
      id: `fl-com-barraca-${i + 1}`,
      kind: "barraca" as const,
      x,
      y: 1882,
      variant: FRUTAS[i % 3],
      react: "spill" as const,
    })),
    { kind: "cancela", x: 2970, y: 1945 },
    { kind: "placaColetiva", x: 3420, y: 1800, variant: "privada", text: "PEDÁGIO DA FEIRA: R$ 2 POR BARRACA OLHADA" },
    { kind: "bandeirolas", x: 2780, y: 1836 },
    { kind: "bandeirolas", x: 3980, y: 1836 },
    // posto, farmácia e banco
    { kind: "placaColetiva", x: 2840, y: 1760, variant: "privada", text: "FILA VIP · FILA COMUM · FILA DA FILA" },
    { kind: "banco", x: 3060, y: 1700 },
    { kind: "arvore", x: 3420, y: 1660 },
    { id: "fl-com-lixeira-1", kind: "lixeira", x: 3330, y: 1780, react: "tip" },
    { kind: "outdoor", x: 3060, y: 1430, variant: "verde", text: "TUDO À VENDA · INCLUSIVE ESTE OUTDOOR" },
    // shopping, lotérica e padaria
    { kind: "canteiro", x: 3700, y: 1770 },
    { kind: "bicicletario", x: 4000, y: 1780 },
    { kind: "banco", x: 4230, y: 1760 },
    { kind: "pontoOnibus", x: 4380, y: 1795, variant: "patria" },
    // mercado, choperia e pastel
    { kind: "mesaBar", x: 3010, y: 2330 },
    { kind: "mesaBar", x: 3075, y: 2340 },
    { kind: "orelhao", x: 2530, y: 2320 },
    { id: "fl-com-lixeira-2", kind: "lixeira", x: 2830, y: 2330, react: "tip" },
    { kind: "banca", x: 3420, y: 2040 },
    { id: "fl-com-pipoca", kind: "carrinhoPipoca", x: 2560, y: 2040, react: "wobble" },
    // casas e estacionamento
    { kind: "canteiro", x: 4100, y: 2330 },
    { kind: "arvore", x: 4440, y: 2030 },
    { kind: "placaColetiva", x: 4120, y: 2040, variant: "privada", text: "ESTACIONAMENTO: R$ 30 A PRIMEIRA HORA" },
  ],
  pois: [
    { id: "fl-com-feira", name: "Feira do Pedágio", district: D, x: 3000, y: 1895, kind: "comercio", landmark: true },
    { id: "fl-com-posto", name: "Posto de Saúde Premium", district: D, x: 2671, y: 1660, kind: "servico", landmark: true },
    { id: "fl-com-farmacia", name: "Farmácia Popular · Demonstração", district: D, x: 2970, y: 1660, kind: "servico" },
    { id: "fl-com-banco", name: "Banco do Livre Mercado", district: D, x: 3211, y: 1660, kind: "servico" },
    { id: "fl-com-shopping", name: "Shopping Livre Mercado", district: D, x: 3828, y: 1670, kind: "comercio", landmark: true },
    { id: "fl-com-loterica", name: "Lotérica do Benefício", district: D, x: 4173, y: 1670, kind: "servico" },
    { id: "fl-com-padaria", name: "Padaria Premium", district: D, x: 4355, y: 1670, kind: "comercio" },
    { id: "fl-com-mercado", name: "Supermercado Livre Concorrência", district: D, x: 2656, y: 2300, kind: "comercio" },
    { id: "fl-com-bar", name: "Choperia Livre Iniciativa", district: D, x: 2928, y: 2300, kind: "comercio", landmark: true },
    { id: "fl-com-lanchonete", name: "Pastel com Taxa de Serviço", district: D, x: 3203, y: 2300, kind: "comercio" },
    { id: "fl-com-estacionamento", name: "Estacionamento Rotativo Premium", district: D, x: 3850, y: 2170, kind: "estacionamento" },
  ],
  parking: [ESTACIONAMENTO],
  vehicles: [
    parked("fl-car-shopping-1", ESTACIONAMENTO, 1, "#f2c230"),
    parked("fl-car-shopping-2", ESTACIONAMENTO, 10, "#2f6fd6"),
    { id: "fl-moto-shopping", x: 3900, y: 1730, angle: 0, color: "#f2c230", tipo: "moto" },
  ],
  npcs: [
    { id: "fl-zuleica", district: D, name: "Vó Zuleica", look: "zuleica", x: 2620, y: 1690, facing: "front", lines: ["Vim medir a pressão e me ofereceram um plano anual.", "A catraca do posto aceita cartão, pix e promessa."] },
    { id: "fl-feirante", district: D, name: "Seu Jairo da feira", look: "feirante", x: 2680, y: 1830, facing: "front", lines: ["Olhar a barraca é R$ 2. Perguntar o preço, R$ 3.", "A laranja é livre, o pedágio é que não."] },
    { id: "fl-valdir", district: D, name: "Valdir dos Kits", look: "valdir", x: 3300, y: 1720, facing: "front", lines: ["Kit sobrevivência ao Livre Mercado: só R$ 99, sem nota.", "No outro Brasil eu vendo o mesmo kit com outra etiqueta."] },
  ],
  cachaca: [],
};
