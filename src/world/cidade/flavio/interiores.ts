import { back } from "../interiores/kits";
import type { Plan } from "../interiores/plan";
import type { PlaceCondition } from "../types";

/**
 * Interações, objetos e cartazes das missões do Brasil do Flávio dentro de prédios específicos.
 * Mesma convenção da cidade do Lula: cada interação de missão é um `spot` "missao" com `evento`, que só
 * aparece quando o ponto está ativo (`ponto:<id>`); as consequências dependem de `flag:d.<missão>`.
 * Os textos daqui já nascem no universo do Flávio.
 */

const ponto = (id: string): PlaceCondition => ({ place: `ponto:${id}`, state: "sim" });
/** O jogador decidiu assim naquela missão. */
const d = (missao: string, valor: string): PlaceCondition => ({ place: `flag:d.${missao}`, state: valor });

export const MISSOES_PREDIO_FLAVIO: Record<string, (p: Plan) => void> = {
  // 1 · Chicote Expresso: o quadro de metas da fábrica e a encomenda na selaria
  "fl-ind-fabrica"(p) {
    const { h } = p;
    const q = p.prop("quadroAvisos", 660, h - 82, { text: "QUADRO DE METAS: SAIR ÀS 17H · ALMOÇAR SENTADO · FÉRIAS PARA TODOS" });
    p.spot("missao", 660, h - 54, "Ler o quadro de metas", { evento: "quadro-metas", prop: q, when: ponto("quadro-metas") });
    p.poster("CHICOTE DE METAS · USO DECORATIVO", 780, "#fffaf0", "#7a3e1d", 84, d("chicote", "entregou"));
    p.poster("VALE-REFEIÇÃO PARA TODOS · ASS.: PRESIDENTE", 780, "#fffaf0", "#2f9e5a", 84, d("chicote", "vale"));
    p.poster("META DOCE: CHICOTE DE ALCAÇUZ NA REUNIÃO", 780, "#1e1424", "#ffd23f", 84, d("chicote", "alcacuz"));
  },

  "fl-ind-selaria"(p) {
    const { h } = p;
    p.npc("zeca", "Zeca da Selaria", 480, h - 150, ["Sela, arreio e chicote. Este último só vende para o Ministério.", "O couro é bom, mas o alcaçuz sai mais."], { id: "fl-zeca", facing: "front" });
    const enc = p.prop("quadroAvisos", 420, h - 82, { text: "ENCOMENDA DO MINISTÉRIO: 1 CHICOTE (NÃO DIZ DE QUÊ)" });
    p.spot("missao", 420, h - 54, "Pegar o chicote encomendado", { evento: "pegar-chicote", prop: enc, when: ponto("pegar-chicote") });
    p.poster("CHICOTE DE ALCAÇUZ: O MAIS VENDIDO DA SEMANA", 360, "#fffaf0", "#7a3e1d", 84, d("chicote", "alcacuz"));
  },

  // 2 · Dezembro Realocado: Dona Rosângela, o calendário oficial, o relógio de ponto e o guichê do 13º
  "fl-ind-rh"(p) {
    const vx = p.w - 170;
    p.npc("rosangela", "Dona Rosângela", vx / 2 - 190, back(p) + 12, ["Recursos Humanos, bom dia. O humano está em análise.", "Décimo terceiro? Volte em dezembro. Se ele voltar."], { id: "fl-rosangela", facing: "front" });
    // o calendário oficial (sem dezembro) fica no arquivo; se dezembro voltou à caneta, aparece a página corrigida ao lado
    const cal = p.wallProp("calendario", vx + 56);
    p.wallProp("calendario", vx + 122, { variant: "com-dezembro", when: d("dezembro", "devolveu") });
    p.spot("missao", vx + 70, back(p) + 92, "Ler o calendário oficial", { evento: "ler-calendario", prop: cal, when: ponto("ler-calendario") });
    // o relógio de ponto é o da parede, ao lado da porta do arquivo
    p.spot("missao", vx - 60, back(p) + 40, "Girar o relógio de ponto", { evento: "girar-relogio", when: ponto("girar-relogio") });
    p.spot("missao", vx - 60, back(p) + 96, "Bater o ponto do décimo terceiro", { evento: "bater-ponto-rh", when: ponto("bater-ponto-rh") });
    p.spot("missao", vx / 2 - 190, back(p) + 82, "Decidir o décimo terceiro no guichê", { evento: "decidir-dezembro", when: ponto("decidir-dezembro") });
    p.poster("13º: HOMOLOGADO COMO GRATIDÃO", vx - 130, "#fffaf0", "#b5452b", 84, d("dezembro", "aceitou"));
    p.poster("DEZEMBRO DEVOLVIDO (À CANETA) · 13º PAGO", vx - 130, "#fffaf0", "#2f9e5a", 84, d("dezembro", "devolveu"));
    p.poster("13º EM 12 PARCELAS DE NOVEMBRO", vx - 130, "#1e1424", "#ffd23f", 84, d("dezembro", "parcelou"));
  },

  // 3 · SUS com Catraca: o regulamento no consultório e a decisão na catraca
  "fl-com-posto"(p) {
    const { w, h } = p;
    const vx = w - 280;
    const hy = 300;
    const reg = p.prop("quadroAvisos", w - 66, hy + 62, { text: "REGULAMENTO DO POSTO · ART. 2º: IDOSO NÃO PAGA A CATRACA" });
    p.spot("missao", w - 66, hy + 90, "Ler o regulamento do posto", { evento: "ler-regulamento", prop: reg, when: ponto("ler-regulamento") });
    p.spot("missao", 300, h - 130, "Decidir a catraca da Vó Zuleica", { evento: "decidir-catraca", when: ponto("decidir-catraca") });
    p.poster("ART. 2º EM VIGOR: IDOSO NÃO PAGA", vx / 2, "#fffaf0", "#2f9e5a", 84, d("catraca", "artigo"));
    p.poster("COBRANÇA EM DIA · RECIBO EM LETRA GRANDE", vx / 2, "#fff4ce", "#b5452b", 84, d("catraca", "cobrou"));
    p.poster("CATRACA LIBERADA POR ORDEM DO PRESIDENTE", vx / 2, "#fffaf0", "#1f8a4c", 84, d("catraca", "liberou"));
  },

  // 4 · Leilão da Petrobras: o lote 1, a planilha e a decisão no púlpito
  "fl-ter-leilao"(p) {
    const { w } = p;
    const vx = w - 280;
    const hy = 330;
    const sx = vx / 2;
    p.spot("missao", sx + 220, back(p) + 104, "Conferir a etiqueta do lote 1", { evento: "conferir-lote", when: ponto("conferir-lote") });
    p.spot("missao", vx + 60, hy + 136, "Ler o rodapé da planilha de arremates", { evento: "planilha-leilao", when: ponto("planilha-leilao") });
    p.spot("missao", sx - 140, back(p) + 86, "Decidir o lote 1 no púlpito", { evento: "decidir-leilao", when: ponto("decidir-leilao") });
    // o resultado do pregão fica num quadro ao lado do palco, entre o barril e a parede
    p.prop("quadroAvisos", vx - 56, back(p) + 120, { text: "LOTE 1: VENDIDO AO PINGUIM · PAGAMENTO: 1 PEIXE", when: d("leilao", "vendeu") });
    p.prop("quadroAvisos", vx - 56, back(p) + 120, { text: "LEILÃO CANCELADO · BARRIL DEVOLVIDO À REFINARIA", when: d("leilao", "cancelou") });
    p.prop("quadroAvisos", vx - 56, back(p) + 120, { text: "LOTE 1 SEM LANCE · VOLTOU AO PATRIMÔNIO", when: d("leilao", "sem-lance") });
  },

  // 5 · Urna com Autorização: o Mesário Anderson no arquivo e o guichê das autorizações
  "fl-civ-cartorio"(p) {
    const vx = p.w - 170;
    p.npc("mesario", "Mesário Anderson", vx + 100, back(p) + 120, ["Nunca li as regras novas. Ninguém leu.", "Sou mesário voluntário. Voluntário mesmo: ninguém lembra de me dispensar."], { id: "fl-mesario", facing: "front" });
    p.spot("missao", vx / 2 - 190, back(p) + 82, "Decidir a autorização da Prima Kelly", { evento: "decidir-urna", when: ponto("decidir-urna") });
    p.poster("AUTORIZAÇÃO DE VOTO: 3 VIAS, FIRMA E UM CAFÉ", vx - 130, "#fffaf0", "#7b4bd1", 84, d("urna", "autorizou"));
    p.poster("EXIGÊNCIA RASGADA: PARA VOTAR, BASTA SER ELEITOR", vx - 130, "#1e1424", "#ffd23f", 84, d("urna", "rasgou"));
    p.poster("REGIMENTO ANTIGO: O TÍTULO JÁ É A AUTORIZAÇÃO", vx - 130, "#fffaf0", "#2f9e5a", 84, d("urna", "titulo"));
  },

  // 6 · Brasil, Destino EUA: a caixa no armazém, a declaração na alfândega e o manifesto no embarque
  "fl-ter-armazem-1"(p) {
    const vx = p.w - 190;
    const caixa = p.prop("caixaBrasil", vx / 2, p.h - 140, { when: ponto("retirar-eua") });
    p.spot("missao", vx / 2, p.h - 110, "Retirar a caixa do Brasil (com laço)", { evento: "retirar-eua", prop: caixa, when: ponto("retirar-eua") });
  },

  "fl-ter-alfandega"(p) {
    const vx = p.w - 200;
    p.spot("missao", vx / 2 + 120, back(p) + 88, "Declarar a carga na alfândega", { evento: "declarar-eua", when: ponto("declarar-eua") });
  },

  "fl-ter-despacho"(p) {
    const { w, h } = p;
    p.spot("missao", w / 2 - 70, back(p) + 160, "Conferir o manifesto do embarque", { evento: "manifesto-eua", when: ponto("manifesto-eua") });
    p.prop("quadroAvisos", w - 120, h - 110, { text: "RASTREIO: BRASIL · EM ALTO-MAR · COM LAÇO", when: d("eua", "embarcou") });
    p.prop("quadroAvisos", w - 120, h - 110, { text: "RASTREIO: BRASIL DEVOLVIDO AO ARMAZÉM 1", when: d("eua", "devolveu") });
    p.prop("quadroAvisos", w - 120, h - 110, { text: "RASTREIO: CAIXA VAZIA EMBARCADA · BRASIL NO CAIS", when: d("eua", "caixa-vazia") });
  },

  // Eleição no Cofre: conferir a urna oficial na sala do cofre
  "fl-civ-tribunal"(p) {
    const { w } = p;
    const vx = w - 300;
    const cx = vx + (w - vx) / 2;
    p.spot("missao", cx + 80, back(p) + 100, "Conferir a urna oficial no cofre", { evento: "conferir-cofre", when: ponto("conferir-cofre") });
  },
};
