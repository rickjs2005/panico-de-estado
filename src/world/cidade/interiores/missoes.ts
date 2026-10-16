import { QUADROS } from "../missoes/campanha";
import type { PlaceCondition } from "../types";
import { back } from "./kits";
import type { Plan } from "./plan";

/**
 * Objetos e interações de missão dentro dos prédios (campanha do Lula). Cada interação de missão é um
 * `spot` do tipo "missao" com `evento`: usá-la emite "usou:<evento>" para a campanha, que decide o que
 * acontece. As condições \`when\` usam chaves do contexto da campanha (\`ponto:<id>\`, \`flag:<chave>\`,
 * \`missao:<id>\`), calculadas pelo motor, então nada aqui sabe em que etapa a missão está.
 */

/** Visível só quando a campanha diz que o ponto está ativo (etapa certa, item certo). */
const ponto = (id: string): PlaceCondition => ({ place: `ponto:${id}`, state: "sim" });
const flag = (chave: string): PlaceCondition => ({ place: `flag:${chave}`, state: "sim" });
const feita = (id: string): PlaceCondition => ({ place: `missao:${id}`, state: "concluida" });

export const MISSOES_PREDIO: Record<string, (p: Plan) => void> = {
  // 1 · Protocolo do Boato: formulários na mesa e quadro que reconhece a credencial
  "civ-reparticao"(p) {
    const { h } = p;
    const vx = p.w - 170;
    void vx;
    for (const [i, cor] of (["amarelo", "azul", "verde"] as const).entries()) {
      const x = 530 + i * 44;
      const prop = p.prop("pilhaPapel", x, 300, { variant: cor });
      p.spot("missao", x, 326, `Pegar o formulário ${cor}${cor === "amarelo" ? " (cor de gema)" : ""}`, { evento: `form-${cor}`, prop, when: ponto(`form-${cor}`) });
    }
    p.poster("CREDENCIAL PRESIDENCIAL RECONHECIDA · ASS.: SEU BOATO", 520, "#fffaf0", "#c62835", 84, feita("protocolo"));
    void h;
  },

  // 2 · Operação Cadeado: o cadeado grande do Tião e o comprovante da segunda via
  "com-bar-tiao"(p) {
    const vx = p.w - 180;
    const cad = p.prop("cadeadao", vx / 2 + 140, back(p) + 110, { when: ponto("cadeado-tiao") });
    p.spot("missao", vx / 2 + 140, back(p) + 136, "Retirar o cadeado grande do Tião", { evento: "cadeado-tiao", prop: cad, when: ponto("cadeado-tiao") });
  },

  "civ-igreja-matriz"(p) {
    p.prop("quadroAvisos", 110, p.h - 70, { text: "SEGUNDA VIA: CADEADO PRESIDENCIAL Nº 2 (COM COMPROVANTE)", when: feita("cadeado") });
  },

  // 3 · Carga Extraviada: três caixas com etiqueta trocada no mercadinho
  "com-mercadinho"(p) {
    for (const [i, l] of (["a", "b", "c"] as const).entries()) {
      const x = 270 + i * 90;
      const prop = p.prop("caixaPapelao", x, 160, { variant: l });
      p.spot("missao", x - 16, 188, `Ler etiqueta e romaneio da caixa ${l.toUpperCase()}`, { evento: `caixa-${l}`, prop });
      p.spot("missao", x + 16, 188, `Carregar a caixa ${l.toUpperCase()}`, { evento: `levar-${l}`, prop, when: ponto(`levar-${l}`) });
    }
  },

  "edu-deposito"(p) {
    const h = p.h;
    p.spot("missao", 330, 372, "Entregar a caixa do Zap no depósito", { evento: "entregar-zap", when: ponto("entregar-zap") });
    p.prop("caixaPapelao", 330, 400, { variant: "zap", when: flag("zap.entregue") });
    p.poster("RECEBIDO: 1 CAIXA DO ZAP · CARIMBO DA DIRETORA", 380, "#fffaf0", "#6746a0", 80, feita("zap"));
    void h;
  },

  // 4 · Campus Sem Freio: mesa de som do DCE, alvará na parede, homologação na reitoria
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
    const rm = (xs[3] + xs[4]) / 2;
    p.spot("missao", rm + 74, back(p) + 70, "Homologar a autorização na portaria", { evento: "homologar", when: ponto("homologar") });
    p.poster("PORTARIA Nº 1: ASSEMBLEIA AUTORIZADA (FESTA INCLUÍDA)", rm, "#fffaf0", "#7b4bd1", 72, feita("campus"));
  },

  // 5 · Coletivizou Até a Chave: armário de ferramentas e os três postos
  "res-associacao"(p) {
    const { h } = p;
    const arm = p.prop("armario", 500, 160, { variant: "madeira" });
    p.spot("missao", 500, 192, "Abrir o armário de ferramentas com a chave", { evento: "armario-ferramentas", prop: arm, when: ponto("armario-ferramentas") });
    for (const [i, [id, nome]] of (
      [
        ["martelo", "o martelo"],
        ["pincel", "o pincel"],
        ["chave-inglesa", "a chave inglesa"],
      ] as const
    ).entries()) {
      p.spot("missao", 444 + i * 56, 218, `Pegar ${nome}`, { evento: `pegar-${id}`, when: ponto(`pegar-${id}`) });
    }
    p.spot("missao", 140, h - 32, "Atender o pedido do muro do mutirão (nº 9)", { evento: "posto-muro" });
    p.prop("ferramenta", 140, h - 64, { variant: "pincel", when: flag("chave.muro") });
  },

  "res-conjunto-13"(p) {
    const { w, h } = p;
    const corY = 456;
    void corY;
    p.spot("missao", w - 72, h - 36, "Atender o pedido do elevador (nº 7)", { evento: "posto-elevador" });
    p.prop("ferramenta", w - 72, h - 68, { variant: "martelo", when: flag("chave.elevador") });
  },

  "ind-fabrica"(p) {
    p.spot("missao", 196, back(p) + 62, "Atender o pedido da prensa (nº 11)", { evento: "posto-prensa" });
    p.prop("ferramenta", 206, back(p) + 36, { variant: "chave-inglesa", when: flag("chave.prensa") });
  },

  // 6 · Brasil, Destino China: caixa no depósito, etiquetas no almoxarifado, esteira no despacho
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
    p.poster("PESO DO BRASIL: 210 MILHÕES DE HABITANTES", 100, "#fffaf0", "#2f6fd6", 74);
    p.poster("DESTINO DOS FRETES DO POVO: SEMPRE A CHINA", 545, "#fffaf0", "#c62835", 74);
    p.poster("CONTEÚDO DECLARADO: O PRÓPRIO BRASIL", 315, "#1e1424", "#ffd23f", 80);
  },

  "ter-despacho"(p) {
    const { w, h } = p;
    const caixa = p.prop("caixaBrasil", 190, back(p) + 130, { when: flag("brasil.carga") });
    p.spot("missao", 190, back(p) + 158, "Colocar a caixa do Brasil na esteira", { evento: "colocar-carga", prop: caixa, when: ponto("colocar-carga") });
    p.spot("missao", w / 2 - 70, back(p) + 160, "Conferir o despacho no painel", { evento: "conferir-despacho", when: ponto("conferir-despacho") });
    p.spot("missao", w / 2 + 70, back(p) + 160, "Acionar a esteira de despacho", { evento: "acionar-esteira", when: ponto("acionar-esteira") });
    p.prop("quadroAvisos", w - 120, h - 110, { text: "RASTREIO: BRASIL · EM ALTO-MAR · CHEGADA EM 400 ANOS ÚTEIS", when: feita("brasil") });
  },
};
