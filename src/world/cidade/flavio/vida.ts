import type { LookId } from "../../looks";
import type { Point } from "../../types";
import type { FalasRotina } from "../definicao";
import type { AmbientBehavior, CityNpc, DistrictId } from "../types";

/**
 * Vida nas ruas do Brasil do Flávio: moradores genéricos que passeiam, atravessam, conversam e
 * esperam em fila, cada um com a sua rotina (casa, ponto, almoço, choperia). Mesmo motor da cidade
 * do Lula (`cidade/vida.ts`), outro universo.
 */

const LOOKS: LookId[] = ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "func1", "func2", "func3", "func4", "zeca", "feirante"];
const NAMES = ["Morador", "Moradora", "Vizinho", "Vizinha", "Passante", "Cidadão de bem", "Cidadã", "Trabalhador", "Trabalhadora"];

export const CONVERSAS_FLAVIO: Record<DistrictId, string[]> = {
  residencial: ["A taxa extra do condomínio agora tem taxa extra.", "Instalaram catraca no balanço da pracinha.", "Meu cachorro tem crachá e eu não tenho.", "A reunião de condomínio votou a reunião de condomínio."],
  civico: ["Pedi autorização para pedir autorização. Indeferido, mas com carimbo bonito.", "O Ministério desmentiu o desmentido de ontem.", "A urna está num cofre dentro de outro cofre. Seguríssima.", "O desfile de hoje é para ensaiar o desfile de amanhã."],
  comercial: ["Olhar a vitrine agora custa R$ 2.", "O posto tem camarote VIP. O cliente é um pombo.", "A farmácia popular só vende a caixa vazia.", "O benefício virou bingo: este mês sorteou a pracinha."],
  educacional: ["Hoje a aula de matemática foi em ordem unida.", "Recreio em posição de sentido.", "O livro aprovado só tem a capa.", "Continência no corredor, continência no rancho."],
  industrial: ["A meta é 300%. Amanhã, 400%.", "Dezembro sumiu do calendário do RH.", "O patrão da Fábrica Feliz trata a gente bem. Dizem que é crime agora.", "Bati o ponto e o ponto pediu hora extra."],
  terminal: ["Leiloaram um barril de petróleo. O único lance foi de um pinguim.", "O mapa do Brasil chegou com adesivo “made in” que não descola.", "A floresta está para alugar. As árvores não concordaram.", "Frete pago pelo próprio país despachado."],
};

export const FALAS_ROTINA_FLAVIO: FalasRotina = {
  "indo-ponto": { manha: ["Bati o ponto antes do galo. A meta acordou antes de mim.", "Passei na guarita e pediram três crachás."], tarde: ["Voltando pro meu posto. O almoço tinha taxa de serviço.", "Cheguei a tempo do desfile da tarde."] },
  "indo-casa": { sempre: ["Vou pra casa. A cancela do condomínio fecha às 21h.", "Hoje a meta foi batida. A gente também."] },
  "indo-almoco": { sempre: ["Hora do almoço! A marmita vem com pedágio.", "Vou ali comer antes que privatizem o almoço."] },
  "indo-bar": { sempre: ["Choperia Livre Iniciativa: o couvert é obrigatório.", "Só um chope. Ou três taxas de serviço."] },
  dentro: { sempre: ["Estou em casa. A taxa do condomínio veio maior que a casa."] },
  ponto: { noite: ["Já está escurecendo. A cancela fecha daqui a pouco.", "A noite chegou e a guarita acendeu o holofote."] },
};

let n = 0;
function npc(district: DistrictId, behavior: AmbientBehavior, x: number, y: number, extra: Partial<CityNpc> = {}): CityNpc {
  n++;
  const look = LOOKS[(n * 5 + district.length) % LOOKS.length];
  const name = NAMES[(n * 3) % NAMES.length];
  const falas = CONVERSAS_FLAVIO[district];
  return {
    id: `fl-amb-${district.slice(0, 3)}-${n}`,
    district,
    name,
    look,
    x,
    y,
    facing: "front",
    behavior,
    lines: [falas[n % falas.length], falas[(n + 1) % falas.length]],
    ...extra,
  };
}

/** Caminho de ida e volta. */
const walk = (district: DistrictId, behavior: AmbientBehavior, route: Point[]) => npc(district, behavior, route[0].x, route[0].y, { route, facing: "side" });
/** Dupla conversando: um de frente para o outro. */
const pair = (district: DistrictId, x: number, y: number, gap = 42): CityNpc[] => {
  const group = `fl-conversa-${district}-${x}-${y}`;
  return [npc(district, "conversa", x, y, { facing: "side", group }), npc(district, "conversa", x + gap, y, { facing: "side", flip: true, group })];
};
/** Fila olhando para um balcão, porta ou guichê. */
const queue = (district: DistrictId, pts: Point[], facing: CityNpc["facing"], flip = false): CityNpc[] => {
  const group = `fl-fila-${district}-${pts[0].x}-${pts[0].y}`;
  return pts.map((q) => npc(district, "fila", q.x, q.y, { facing, flip, group }));
};

export const AMBIENT_FLAVIO: CityNpc[] = [
  // Condomínio Pátria Amada
  walk("residencial", "passeio", [
    { x: 300, y: 684 },
    { x: 930, y: 684 },
  ]),
  walk("residencial", "travessia", [
    { x: 700, y: 684 },
    { x: 938, y: 684 },
    { x: 938, y: 826 },
    { x: 700, y: 826 },
  ]),
  ...pair("residencial", 400, 1164),
  walk("residencial", "passeio", [
    { x: 1780, y: 1164 },
    { x: 2290, y: 1164 },
  ]),
  ...queue(
    "residencial",
    [
      { x: 1205, y: 1112 },
      { x: 1205, y: 1142 },
    ],
    "back",
  ),
  // Esplanada da Ordem
  walk("civico", "passeio", [
    { x: 320, y: 1944 },
    { x: 1080, y: 1944 },
  ]),
  walk("civico", "travessia", [
    { x: 1500, y: 1944 },
    { x: 1500, y: 2086 },
  ]),
  ...pair("civico", 1150, 2086),
  ...queue(
    "civico",
    [
      { x: 870, y: 1758 },
      { x: 870, y: 1788 },
    ],
    "back",
  ),
  walk("civico", "passeio", [
    { x: 1250, y: 1376 },
    { x: 2290, y: 1376 },
  ]),
  // Livre Mercado
  walk("comercial", "passeio", [
    { x: 2506, y: 1376 },
    { x: 3484, y: 1376 },
  ]),
  ...pair("comercial", 3050, 1824),
  ...queue(
    "comercial",
    [
      { x: 2671, y: 1658 },
      { x: 2671, y: 1688 },
    ],
    "back",
  ),
  walk("comercial", "travessia", [
    { x: 3478, y: 1824 },
    { x: 3478, y: 1966 },
  ]),
  npc("comercial", "parado", 3700, 2384, { facing: "front" }),
  ...pair("comercial", 4290, 1966),
  // Colégio Cívico-Militar
  walk("educacional", "passeio", [
    { x: 2506, y: 1164 },
    { x: 3384, y: 1164 },
  ]),
  ...pair("educacional", 3560, 644),
  walk("educacional", "travessia", [
    { x: 3800, y: 644 },
    { x: 3800, y: 786 },
  ]),
  npc("educacional", "parado", 4100, 786, { facing: "front" }),
  // Distrito do Chicote
  walk("industrial", "passeio", [
    { x: 306, y: 3076 },
    { x: 1234, y: 3076 },
  ]),
  ...pair("industrial", 1500, 2934),
  ...queue(
    "industrial",
    [
      { x: 1790, y: 2898 },
      { x: 1790, y: 2928 },
    ],
    "back",
  ),
  walk("industrial", "travessia", [
    { x: 1228, y: 2934 },
    { x: 1228, y: 3076 },
  ]),
  // Porto Brasil–EUA
  walk("terminal", "passeio", [
    { x: 2506, y: 2974 },
    { x: 3584, y: 2974 },
  ]),
  ...pair("terminal", 3000, 3116),
  ...queue(
    "terminal",
    [
      { x: 2680, y: 3334 },
      { x: 2680, y: 3362 },
    ],
    "back",
  ),
  walk("terminal", "travessia", [
    { x: 3700, y: 2974 },
    { x: 3700, y: 3116 },
  ]),
  npc("terminal", "parado", 4000, 3380, { facing: "front" }),
];
