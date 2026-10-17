import { loja } from "../../helpers";
import { lot } from "../../layout";
import type { CityProp, DistrictContent } from "../../types";

/** Porto Brasil–EUA: a Casa de Leilões, a Alfândega do Made In, a imobiliária da floresta, a reserva "ALUGA-SE" e o cais. */
const D = "terminal" as const;

/** Reserva florestal em fileiras com trilhas entre as árvores (à noite, as árvores se juntam para escrever "NÃO"). */
function reserva(): CityProp[] {
  const out: CityProp[] = [];
  [2690, 2780, 2870].forEach((y, r) => {
    for (let x = 3800 + (r % 2) * 40; x <= 4420; x += 90) out.push({ kind: x % 180 < 90 ? "arvore" : "ipe", x, y, ...(x % 270 === 0 ? { variant: "rosa" } : {}) });
  });
  return out;
}

export const PORTO: DistrictContent = {
  grounds: [
    { rect: lot(2490, 2580, 3600, 2990), kind: "calcada" },
    { rect: lot(3710, 2580, 4490, 2990), kind: "grama" },
    { rect: lot(2490, 3100, 4490, 3470), kind: "concreto" },
  ],
  decals: [
    // casa de leilões: degraus e tapete do pregão
    { kind: "degraus", rect: { x: 2633, y: 2860, w: 120, h: 18 } },
    { kind: "tapete", rect: { x: 2669, y: 2878, w: 48, h: 40 }, color: "#2f6fd6" },
    // controle de embarque: setas da fila da carga
    { kind: "setas", rect: { x: 2662, y: 3310, w: 36, h: 60 }, color: "#2f6fd6" },
  ],
  buildings: [
    loja(D, "fl-ter-leilao", 2560, 2740, 360, "#e8eef8", "CASA DE LEILÕES DA PÁTRIA", ["#2f6fd6", "#ffd23f"], { d: 120, h: 130 }),
    { id: "fl-ter-alfandega", district: D, kind: "alfandega", x: 2970, y: 2740, w: 300, d: 120, h: 130, wall: "#f6e3a0", roof: "laje", sign: "ALFÂNDEGA DO MADE IN" },
    loja(D, "fl-ter-imobiliaria", 3310, 2770, 230, "#e2f0d8", "IMOBILIÁRIA FLORESTA INTEIRA", ["#2f9e5a", "#ffd23f"], { h: 115 }),
    { id: "fl-ter-despacho", district: D, kind: "reparticao", x: 2560, y: 3180, w: 240, d: 110, h: 115, wall: "#ebe6dc", roof: "laje", sign: "CONTROLE DE EMBARQUE BRASIL→EUA", place: "fl-terminal-eua" },
    { id: "fl-ter-armazem-1", district: D, kind: "armazem", x: 2860, y: 3170, w: 340, d: 120, h: 120, wall: "#b9cde6", roof: "laje", sign: "ARMAZÉM BRASIL→EUA 1" },
    { id: "fl-ter-armazem-2", district: D, kind: "armazem", x: 3240, y: 3170, w: 340, d: 120, h: 120, wall: "#c9d6e8", roof: "laje", sign: "ARMAZÉM BRASIL→EUA 2" },
  ],
  props: [
    // reserva florestal
    ...reserva(),
    { id: "fl-ter-placa-aluga", kind: "placaAluga", x: 3820, y: 2950, text: "RESERVA NACIONAL · ALUGA-SE · TRATAR NA IMOBILIÁRIA" },
    // leilão, alfândega e imobiliária
    { kind: "bandeira", x: 2540, y: 2940, variant: "brasil" },
    { kind: "banco", x: 2860, y: 2935 },
    { kind: "placaColetiva", x: 3250, y: 2935, variant: "privada", text: "LANCE MÍNIMO: TUDO" },
    { kind: "outdoor", x: 4310, y: 2950, variant: "verde", text: "LEILÃO HOJE · LOTE 1: UM BARRIL (USADO)" },
    // cais: esteira, guindaste, contêineres e cabeços
    { id: "fl-ter-esteira", kind: "esteira", x: 3830, y: 3290 },
    { id: "fl-ter-guindaste", kind: "guindaste", x: 4260, y: 3270 },
    { kind: "conteiner", x: 3680, y: 3420, variant: "azul-eua" },
    { kind: "conteiner", x: 3780, y: 3420, variant: "verde-eua" },
    { kind: "conteiner", x: 3880, y: 3420, variant: "amarelo-eua" },
    { kind: "conteiner", x: 3730, y: 3180, variant: "azul-eua" },
    ...[4040, 4160, 4400].map((x) => ({ kind: "cabeco" as const, x, y: 3434 })),
    { kind: "caminhao", x: 3100, y: 3420, variant: "eua" },
    { kind: "palete", x: 2600, y: 3420 },
    { kind: "palete", x: 2650, y: 3428 },
    { id: "fl-ter-cone-1", kind: "cone", x: 3620, y: 3330, react: "tip" },
  ],
  pois: [
    { id: "fl-ter-leilao", name: "Casa de Leilões da Pátria", district: D, x: 2693, y: 2920, kind: "terminal", landmark: true },
    { id: "fl-ter-alfandega", name: "Alfândega do Made In", district: D, x: 3120, y: 2920, kind: "terminal" },
    { id: "fl-ter-imobiliaria", name: "Imobiliária Floresta Inteira", district: D, x: 3395, y: 2930, kind: "servico" },
    { id: "fl-ter-reserva", name: "Reserva Nacional (aluga-se)", district: D, x: 4100, y: 2780, kind: "marco", landmark: true },
    { id: "fl-ter-cais", name: "Cais de Embarque Brasil→EUA", district: D, x: 3830, y: 3340, kind: "terminal", landmark: true },
    { id: "fl-ter-despacho", name: "Controle de Embarque", district: D, x: 2680, y: 3340, kind: "terminal" },
  ],
  parking: [],
  vehicles: [
    { id: "fl-car-porto", x: 3560, y: 3360, angle: 0, color: "#f4efe4" },
    { id: "fl-moto-porto", x: 3480, y: 2935, angle: 0, color: "#2f6fd6", tipo: "moto" },
  ],
  npcs: [
    { id: "fl-leila", district: D, name: "Leila Farah", look: "leila", x: 2780, y: 2930, facing: "front", lines: ["Vim comprar refinaria e me ofereceram um barril. Usado.", "Eu só queria um contrato com cláusulas. Aqui tem martelo."] },
    { id: "fl-robson", district: D, name: "Robson do Despacho", look: "robson", x: 2740, y: 3340, facing: "front", lines: ["Pesei o Brasil: sobrou adesivo.", "Frete pago, carga em análise, destino em inglês."] },
  ],
  cachaca: [],
};
