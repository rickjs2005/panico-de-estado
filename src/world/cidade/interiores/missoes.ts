import { QUADROS } from "../missoes/campanha";
import type { PlaceCondition } from "../types";
import { back } from "./kits";
import type { Plan } from "./plan";

/**
 * Objetos e interações de missão dentro dos prédios (campanha do Lula). Cada interação de missão é um
 * `spot` do tipo "missao" com `evento`: usá-la emite "usou:<evento>" para a campanha, que decide o que
 * acontece. As condições `when` usam chaves do contexto da campanha (`ponto:<id>`, `flag:<chave>`,
 * `missao:<id>`), calculadas pelo motor, então nada aqui sabe em que etapa a missão está.
 *
 * Toda interação de missão só aparece quando o ponto está ativo, para não ficar um botão sem resposta
 * quando a missão não está nessa etapa. As consequências das decisões (cartazes, objetos) dependem de
 * `flag:d.<missão>`, que guarda o que o jogador escolheu.
 */

/** Visível só quando a campanha diz que o ponto está ativo (etapa certa, item certo). */
const ponto = (id: string): PlaceCondition => ({ place: `ponto:${id}`, state: "sim" });
const flag = (chave: string): PlaceCondition => ({ place: `flag:${chave}`, state: "sim" });
/** O jogador decidiu assim naquela missão. */
const d = (missao: string, valor: string): PlaceCondition => ({ place: `flag:d.${missao}`, state: valor });

export const MISSOES_PREDIO: Record<string, (p: Plan) => void> = {
  // 1 · Protocolo do Áudio: o guichê onde se entrega o formulário e o cartaz da credencial
  "civ-reparticao"(p) {
    const vx = p.w - 170;
    for (const [i, cor] of (["amarelo", "azul", "verde"] as const).entries()) p.prop("pilhaPapel", 530 + i * 44, 300, { variant: cor });
    p.spot("missao", vx / 2 + 60, back(p) + 82, "Entregar o formulário no guichê", { evento: "guiche", when: ponto("guiche") });
    p.poster("CREDENCIAL PRESIDENCIAL RECONHECIDA · CARIMBO AMARELO · ASS.: SEU REPASSA", 520, "#fffaf0", "#c62835", 84, d("protocolo", "carimbo"));
    p.poster("CREDENCIAL POR RECURSO · AVISOS EM CONTRADIÇÃO · DEFERIDO", 520, "#fffaf0", "#3a6b5a", 84, d("protocolo", "recurso"));
  },

  // 2 · Operação Cadeado: o cadeado grande do Tião e o quadro que registra o que foi decidido na porta
  "com-bar-tiao"(p) {
    const vx = p.w - 180;
    const cad = p.prop("cadeadao", vx / 2 + 140, back(p) + 110, { when: ponto("cadeado-tiao") });
    p.spot("missao", vx / 2 + 140, back(p) + 136, "Retirar o cadeado grande do Tião", { evento: "cadeado-tiao", prop: cad, when: ponto("cadeado-tiao") });
  },

  "civ-igreja-matriz"(p) {
    const texto = {
      cumpriu: "SEGUNDA VIA: CADEADO PRESIDENCIAL Nº 2 (COM COMPROVANTE)",
      sabotou: "AVISO: O CADEADO DA PORTA É DE PAPELÃO. NÃO CONTAR AO MINISTÉRIO.",
      brecha: "PORTARIA 7: PORTA LATERAL REGULAMENTADA, DE ACORDO COM O DECRETO",
    };
    for (const [k, t] of Object.entries(texto)) p.prop("quadroAvisos", 110, p.h - 70, { text: t, when: d("cadeado", k) });
  },

  // 3 · Carga Extraviada: três caixas com etiqueta trocada no mercadinho
  "com-mercadinho"(p) {
    for (const [i, l] of (["a", "b", "c"] as const).entries()) {
      const x = 270 + i * 90;
      const prop = p.prop("caixaPapelao", x, 160, { variant: l });
      p.spot("missao", x - 16, 188, `Ler etiqueta e romaneio da caixa ${l.toUpperCase()}`, { evento: `caixa-${l}`, prop, when: ponto(`caixa-${l}`) });
      p.spot("missao", x + 16, 188, `Carregar a caixa ${l.toUpperCase()}`, { evento: `levar-${l}`, prop, when: ponto(`levar-${l}`) });
    }
  },

  "edu-deposito"(p) {
    p.spot("missao", 330, 372, "Entregar a caixa do Zap no depósito", { evento: "entregar-zap", when: ponto("entregar-zap") });
    p.spot("missao", 430, 372, "Decidir o destino dos kits no mural", { evento: "decidir-zap", when: ponto("decidir-zap") });
    p.prop("caixaPapelao", 330, 400, { variant: "zap", when: flag("zap.entregue") });
    p.poster("KITS LACRADOS: PROIBIDO ABRIR (ORDEM DO ÁUDIO) · CARIMBO DA DIRETORA", 380, "#fffaf0", "#6746a0", 80, d("zap", "lacrado"));
    p.poster("ROMANEIO PÚBLICO: 300 LÁPIS DE COR, 120 COLAS, 1 CARTILHA", 380, "#fffaf0", "#2f7a52", 80, d("zap", "desmentiu"));
    p.poster("KIT DO ZAP: NINGUÉM SABE O QUE É, MAS TEM FILA", 380, "#1e1424", "#ffd23f", 80, d("zap", "boato"));
  },

  // 4 · Campus Sem Freio: mesa de som do DCE, alvará na parede, teste de som, homologação na reitoria
  "edu-universidade"(p) {
    const xs = [0, Math.round(p.w * 0.25), Math.round(p.w * 0.58), Math.round(p.w * 0.8), p.w];
    const dce = (xs[2] + xs[3]) / 2;
    for (const [i, [id, nome]] of (
      [
        ["som-grave", "grave"],
        ["som-medio", "médio"],
        ["som-agudo", "agudo"],
      ] as const
    ).entries()) {
      const x = dce - 51 + i * 51;
      const prop = p.prop("caixaSom", x, back(p) + 4);
      p.spot("missao", x, back(p) + 36, `Ajustar o som ${nome}`, { evento: id, prop, when: ponto(id) });
    }
    p.prop("quadroAvisos", dce, back(p) + 82, { text: QUADROS.alvara });
    p.spot("missao", dce - 84, back(p) + 104, "Ler o alvará sonoro", { evento: "ler-alvara", when: ponto("ler-alvara") });
    p.spot("missao", dce + 102, back(p) + 36, "Testar o som no auditório", { evento: "testar-som", when: ponto("testar-som") });
    const rm = (xs[3] + xs[4]) / 2;
    p.spot("missao", rm + 74, back(p) + 70, "Decidir o campus na portaria", { evento: "homologar", when: ponto("homologar") });
    p.poster("PORTARIA Nº 1: ASSEMBLEIA AUTORIZADA (FESTA INCLUÍDA)", rm, "#fffaf0", "#7b4bd1", 72, d("campus", "autorizou"));
    p.poster("PORTARIA Nº 2: ASSEMBLEIA ÀS 18H, FESTA ATÉ AS 22H", rm, "#fffaf0", "#3a6b5a", 72, d("campus", "negociou"));
    p.poster("ORDEM IGNORADA: SÓ ASSEMBLEIA, SEM FESTA", rm, "#1e1424", "#ffd23f", 72, d("campus", "ignorou"));
  },

  // 5 · Coletivizou Até a Chave: o armário, o gancho e os três postos
  "res-associacao"(p) {
    const { h } = p;
    const arm = p.prop("armario", 500, 160, { variant: "madeira" });
    p.spot("missao", 500, 192, "Abrir o armário de ferramentas", { evento: "armario-ferramentas", prop: arm, when: ponto("armario-ferramentas") });
    p.spot("missao", 420, 192, "Decidir o destino da chave no gancho", { evento: "gancho-chave", when: ponto("gancho-chave") });
    p.prop("quadroAvisos", 420, 160, { text: "A CHAVE: NO GANCHO COLETIVO (LIVRO DE EMPRÉSTIMO)", when: d("chave", "coletivo") });
    p.prop("quadroAvisos", 420, 160, { text: "A CHAVE: NO BOLSO DO VÔ DIDI (COM RECIBO)", when: d("chave", "devolveu") });
    p.prop("quadroAvisos", 420, 160, { text: "ARMÁRIO SEM TRANCA: SE SERVIR E SE LEMBRAR", when: d("chave", "quebrou") });
    p.spot("missao", 210, h - 32, "Examinar o pedido do muro do mutirão (nº 9)", { evento: "ver-muro", when: ponto("ver-muro") });
    p.spot("missao", 140, h - 32, "Pintar o muro do mutirão (nº 9)", { evento: "posto-muro", when: ponto("posto-muro") });
    p.prop("ferramenta", 140, h - 64, { variant: "pincel", when: flag("chave.muro") });
    p.poster("MURO DO MUTIRÃO: PINTADO PELO POVO (E PELO VIZINHO)", 330, "#fffaf0", "#2f7a52", 78, flag("chave.muro"));
  },

  "res-conjunto-13"(p) {
    const { w, h } = p;
    p.spot("missao", w - 72, h - 36, "Consertar o elevador (nº 7)", { evento: "posto-elevador", when: ponto("posto-elevador") });
    p.spot("missao", w - 150, h - 36, "Examinar o pedido do elevador (nº 7)", { evento: "ver-elevador", when: ponto("ver-elevador") });
    p.prop("ferramenta", w - 72, h - 68, { variant: "martelo", when: flag("chave.elevador") });
    p.poster("ELEVADOR: FUNCIONANDO (ÀS VEZES, COM RECIBO)", w - 160, "#fffaf0", "#2f7a52", 84, flag("chave.elevador"));
  },

  "ind-fabrica"(p) {
    p.spot("missao", 196, back(p) + 62, "Destravar a prensa (nº 11)", { evento: "posto-prensa", when: ponto("posto-prensa") });
    p.spot("missao", 196, back(p) + 112, "Examinar o pedido da prensa (nº 11)", { evento: "ver-prensa", when: ponto("ver-prensa") });
    p.prop("ferramenta", 206, back(p) + 36, { variant: "chave-inglesa", when: flag("chave.prensa") });
    p.poster("PRENSA DESTRAVADA: PRODUÇÃO DO POVO EM ORDEM DE CHEGADA", 560, "#fffaf0", "#b5523b", 80, flag("chave.prensa"));
  },

  // 6 · Brasil, Destino China: caixa no depósito, etiquetas no almoxarifado, painel e esteira no despacho
  "ind-deposito"(p) {
    const caixa = p.prop("caixaBrasil", 480, p.h - 130, { when: ponto("retirar-brasil") });
    p.spot("missao", 480, p.h - 100, "Retirar a caixa com o mapa do Brasil", { evento: "retirar-brasil", prop: caixa, when: ponto("retirar-brasil") });
  },

  "ind-almoxarifado"(p) {
    const { h } = p;
    for (const [i, [id, nome]] of (
      [
        ["etq-peso", "peso"],
        ["etq-destino", "destino"],
        ["etq-conteudo", "conteúdo"],
      ] as const
    ).entries()) {
      const x = 120 + i * 90;
      const prop = p.prop("etiquetadora", x, h - 150);
      p.spot("missao", x, h - 124, `Etiquetar o ${nome}`, { evento: id, prop, when: ponto(id) });
    }
    p.poster("FRETE DO POVO: O REGULAMENTO ESTÁ NA CABEÇA DE QUEM TRABALHA", 100, "#fffaf0", "#2f6fd6", 74);
    p.poster("ETIQUETA ERRADA É ETIQUETA ENFEITE", 545, "#fffaf0", "#c62835", 74);
  },

  "ter-despacho"(p) {
    const { w, h } = p;
    const caixa = p.prop("caixaBrasil", 190, back(p) + 130, { when: flag("brasil.carga") });
    p.spot("missao", 190, back(p) + 158, "Colocar a caixa do Brasil na esteira", { evento: "colocar-carga", prop: caixa, when: ponto("colocar-carga") });
    p.spot("missao", w / 2 - 70, back(p) + 160, "Conferir o manifesto no painel", { evento: "conferir-despacho", when: ponto("conferir-despacho") });
    p.spot("missao", w / 2 + 70, back(p) + 160, "Decidir o destino da carga na esteira", { evento: "acionar-esteira", when: ponto("acionar-esteira") });
    p.prop("quadroAvisos", w - 120, h - 110, { text: "RASTREIO: BRASIL · EM ALTO-MAR · CHEGADA EM 400 ANOS ÚTEIS", when: d("brasil", "despachou") });
    p.prop("quadroAvisos", w - 120, h - 110, { text: "RASTREIO: CACHAÇA EMBARCADA · BRASIL RETIDO NO CAIS", when: d("brasil", "trocou") });
    p.prop("quadroAvisos", w - 120, h - 110, { text: "RASTREIO: ESTEIRA PAUSADA · FRETE CANCELADO", when: d("brasil", "sabotou") });
  },
};
