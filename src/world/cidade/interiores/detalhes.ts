import type { PlaceCondition, TemplateId } from "../types";
import { back, cadeiras } from "./kits";
import type { Plan } from "./plan";

/**
 * Detalhes por modelo: objetos, interações e cantinhos que enriquecem um interior depois de
 * montado pelo modelo base (`modelos.ts`). Ficam num arquivo à parte para o modelo continuar
 * descrevendo a planta e este descrever a vida do lugar. Cada função roda depois do modelo, então
 * enxerga o tamanho final do interior (`p.w`, `p.h`).
 *
 * Aqui também ficam as ações que mudam o estado de um lugar (`setPlace`): a alavanca do depósito de
 * kits, a alavanca do despacho do terminal e a portaria do expediente da universidade.
 */

const lugar = (place: string, state: string): PlaceCondition => ({ place, state });

/** Dupla de interações que se alternam: uma só existe em cada estado e leva ao outro. */
export function alternar(
  p: Plan,
  opts: {
    place: string;
    de: string;
    para: string;
    /** Objeto de cada estado (o mesmo lugar, aparência diferente). */
    prop: (state: string) => string;
    x: number;
    y: number;
    label: Record<string, string>;
    lines: Record<string, string[]>;
    stamp: Record<string, { text: string; color: string; bg: string }>;
  },
) {
  for (const [from, to] of [
    [opts.de, opts.para],
    [opts.para, opts.de],
  ] as const) {
    p.spot("decreto", opts.x, opts.y, opts.label[from], {
      prop: opts.prop(from),
      when: lugar(opts.place, from),
      setPlace: lugar(opts.place, to),
      lines: opts.lines[from],
      stamp: opts.stamp[from],
    });
  }
}

function lanchoneteExtra(p: Plan) {
  const { h } = p;
  const vx = p.w - 190;
  p.prop("mesaBar", 360, h - 80);
  p.prop("banqueta", 338, h - 70);
  p.prop("banqueta", 382, h - 70);
  const jb = p.prop("jukebox", 44, back(p) + 40);
  p.spot("jukebox", 74, back(p) + 66, "Escolher uma música", { prop: jb, lines: ["Toca pagode de boteco em volume de assembleia.", "A jukebox só aceita ficha coletiva."] });
  p.prop("planta", 28, h - 26);
  p.wallProp("relogio", vx / 2 - 150);
}

function oficinaExtra(p: Plan) {
  const { h } = p;
  const vx = p.w - 170;
  const bike = p.prop("bicicleta", vx / 2 + 170, h - 90);
  p.spot("examinar", vx / 2 + 170, h - 62, "Remendar a bicicleta", { prop: bike, lines: ["Pneu furado por um decreto pontiagudo.", "A bicicleta é do povo. O furo, também."] });
  p.prop("tambor", vx - 50, h - 80);
  p.prop("cone", vx - 100, h - 60);
  p.prop("quadroAvisos", 300, h - 60, { text: "FIADO SÓ PARA QUEM JÁ DEVE" });
  p.prop("caixaPapelao", vx - 40, h - 150);
}

function galpaoExtra(p: Plan) {
  const { h } = p;
  const vx = p.w - 190;
  p.prop("palete", 170, h - 60);
  p.prop("caixaPapelao", 170, h - 84);
  p.prop("tambor", vx - 110, h - 50);
  p.prop("cone", vx / 2 - 130, h - 40);
  p.prop("quadroAvisos", vx / 2 - 80, h - 50, { text: "0 DIAS SEM ACIDENTE (RECORDE COLETIVO)" });
}

export const DETALHES: Partial<Record<TemplateId, (p: Plan) => void>> = {
  conjunto(p) {
    const { w, h } = p;
    const corY = 456;
    p.prop("sofa", 160, h - 52, { variant: "azul" });
    p.spot("sentar", 160, h - 28, "Sentar no sofá da portaria", { seat: { x: 142, y: h - 60, facing: "back" } });
    p.prop("bebedouro", 60, h - 70);
    p.spot("torneira", 60, h - 44, "Beber água do bebedouro", { lines: ["Água do condomínio coletivo: gelada e rateada.", "O bebedouro tem fila própria."] });
    p.prop("planta", w - 40, h - 40);
    const bike = p.prop("bicicleta", 90, corY - 34);
    p.spot("examinar", 90, corY - 8, "Examinar a bicicleta coletiva", { prop: bike, lines: ["Bicicleta do prédio: quem pega primeiro, devolve depois.", "O selim é de todos. A corrente, de ninguém."] });
  },

  associacao(p) {
    const { h } = p;
    const vx = p.w - 220;
    const som = p.prop("caixaSom", 50, back(p) + 60);
    p.spot("radio", 50, back(p) + 90, "Ligar o som da festa", { prop: som, lines: ["Forró de associação: três acordes e uma ata.", "O som alto é aprovado em assembleia todo sábado."] });
    p.prop("planta", 36, back(p) + 170);
    p.prop("planta", vx - 30, back(p) + 170);
    const cf = p.prop("cafezinho", vx - 70, h - 70);
    p.spot("fogao", vx - 70, h - 40, "Servir o cafezinho da diretoria", { prop: cf, lines: ["Café com bolo de fubá: pauta permanente da reunião.", "O açúcar foi aprovado por unanimidade. A colher, não."] });
    p.prop("bandeira", vx - 34, back(p) + 30);
  },

  republica(p) {
    const { w, h } = p;
    p.prop("poltrona", 60, h - 60);
    const tv = p.prop("tv", w - 90, h - 56);
    p.spot("tv", w - 90, h - 28, "Ligar a TV da república", { prop: tv, lines: ["Reprise da final do campeonato de truco.", "A TV só pega um canal: o da assembleia."] });
    p.prop("planta", 40, h - 36);
  },

  secretaria(p) {
    const { w, h } = p;
    const hy = 280;
    const tt = p.prop("totemSenha", 60, h - 80);
    p.spot("senha", 60, h - 52, "Tirar uma senha", { prop: tt, lines: ["Senha 0301. Atendimento previsto após a coletivização do relógio.", "A senha veio carimbada em dobro."] });
    cadeiras(p, 110, 3, h - 70, 36);
    p.spot("sentar", 110, h - 46, "Sentar e esperar", { seat: { x: 110, y: h - 76, facing: "front" } });
    p.prop("bandeira", w - 30, hy + 50);
    p.prop("quadroAvisos", w / 2 + 170, h - 80, { text: "SEU PEDIDO FOI COLETIVIZADO" });
  },

  imprensa(p) {
    const { w, h } = p;
    const hy = 290;
    p.prop("planta", 36, h - 40);
    const vt = p.prop("ventilador", w - 30, hy + 50);
    p.spot("ventilador", w - 30, hy + 78, "Ligar o ventilador da redação", { prop: vt, lines: ["Zzzum! As manchetes voam da mesa.", "O vento é a única fonte confiável."] });
    const cf = p.prop("cafezinho", w - 210, h - 60);
    p.spot("fogao", w - 210, h - 30, "Servir um cafezinho", { prop: cf, lines: ["Café de redação: forte o bastante para desmentir um áudio.", "O copo vem com o último boletim impresso."] });
    p.prop("pilhaPapel", 250, hy + 130);
  },

  ministerio(p) {
    const { w, h } = p;
    const hy = 330;
    p.prop("tapeteCorredor", w / 2, hy + 210, { variant: "azul-curto" });
    const tt = p.prop("totemSenha", w / 2 - 230, hy + 90);
    p.spot("senha", w / 2 - 230, hy + 116, "Tirar uma senha", { prop: tt, lines: ["Senha 4.513. Chamada prevista para o próximo decreto.", "A senha saiu com um áudio de 3 minutos."] });
    const cf = p.prop("cafezinho", w - 170, h - 60);
    p.spot("fogao", w - 170, h - 30, "Servir um cafezinho", { prop: cf, lines: ["Café ministerial: é decidido em portaria.", "A garrafa térmica tem protocolo próprio."] });
    p.prop("bandeira", w / 2 - 200, hy + 118);
    p.prop("bandeira", w / 2 + 200, hy + 118);
  },

  banco(p) {
    const { h } = p;
    const vx = p.w - 190;
    for (let x = 90; x <= 200; x += 36) p.prop("balizaFila", x, h - 150, { variant: x < 160 ? "fita" : undefined });
    for (let x = 340; x <= 450; x += 36) p.prop("balizaFila", x, h - 150, { variant: x < 410 ? "fita" : undefined });
    p.prop("bandeira", vx - 34, back(p) + 30);
    const cf = p.prop("cafezinho", vx - 90, h - 70);
    p.spot("fogao", vx - 90, h - 40, "Servir um cafezinho", { prop: cf, lines: ["Café do banco: o único crédito liberado hoje.", "Cada xícara vale um boleto coletivo."] });
  },

  lanchonete: lanchoneteExtra,
  cantina: lanchoneteExtra,
  oficina: oficinaExtra,
  borracharia: oficinaExtra,

  escola(p) {
    const { w, h } = p;
    const hy = 340;
    p.prop("banco", w / 2 - 210, hy + 150);
    p.prop("banco", w / 2 + 140, hy + 150);
    p.prop("planta", 40, h - 40);
    p.prop("planta", w - 40, h - 40);
    p.prop("planta", w / 2 - 330, hy + 80);
    p.prop("bandeira", w / 2 - 90, h - 56);
    p.prop("bandeira", w / 2 + 90, h - 56);
    const cf = p.prop("cafezinho", 130, h - 80);
    p.spot("fogao", 130, h - 50, "Servir um cafezinho na sala dos professores", { prop: cf, lines: ["Café de professor: forte, porque a lição é fraca.", "O copo diz: “reciclável, mas só por decreto”."] });
  },

  universidade(p) {
    const { w, h } = p;
    const hy = 380;
    for (const x of [260, 520, 800, 1060]) p.prop("banco", x, hy + 150);
    p.prop("planta", 440, h - 40);
    p.prop("planta", 900, h - 40);
    const cf = p.prop("cafezinho", w - 170, h - 60);
    p.spot("fogao", w - 170, h - 30, "Servir um café do DCE", { prop: cf, lines: ["Café de assembleia: esfria antes da votação.", "Pagou? Não: o café também foi coletivizado."] });
    // portaria do expediente: troca o estado do campus (liberou geral ↔ expediente normal), se o prédio tiver um
    const campus = p.b.place;
    if (!campus) return;
    const mx = w - 50;
    const liberado = "liberou-geral";
    const normal = "normal";
    const q: Record<string, string> = {};
    q[liberado] = p.wallProp("quadro", mx, { variant: "decreto", when: lugar(campus, liberado) });
    q[normal] = p.wallProp("quadro", mx, { variant: "revogado", when: lugar(campus, normal) });
    alternar(p, {
      place: campus,
      de: liberado,
      para: normal,
      prop: (s) => q[s],
      x: mx,
      y: back(p) + 8,
      label: { [liberado]: "Assinar a portaria do expediente normal", [normal]: "Revogar a portaria e liberar geral" },
      lines: {
        [liberado]: ["Portaria assinada: o expediente normal voltou. As barracas já estão sendo recolhidas.", "O som foi desligado por decreto. A festa continua em silêncio."],
        [normal]: ["Portaria revogada: liberou geral de novo! As barracas voltam ao corredor.", "Expediente normal? Só até a próxima assembleia."],
      },
      stamp: {
        [liberado]: { text: "EXPEDIENTE!", color: "#fffaf0", bg: "#3a86c8" },
        [normal]: { text: "LIBEROU GERAL!", color: "#fffaf0", bg: "#7b4bd1" },
      },
    });
  },

  biblioteca(p) {
    const { h } = p;
    const vx = p.w - 200;
    p.prop("poltrona", 60, back(p) + 190);
    p.spot("sentar", 60, back(p) + 216, "Sentar na poltrona de leitura", { seat: { x: 60, y: back(p) + 184, facing: "front" } });
    p.prop("tapete", vx / 2, back(p) + 285, { variant: "azul" });
    p.prop("mesa", 600, h - 130, { variant: "madeira" });
    p.prop("cadeira", 560, h - 134);
    p.prop("cadeira", 640, h - 134);
    p.prop("planta", vx - 40, h - 40);
  },

  "deposito-kits"(p) {
    const { h } = p;
    const deposito = p.b.place ?? "deposito-kits";
    const ab = "abastecido";
    const vz = "vazio";
    const alav: Record<string, string> = {};
    alav[ab] = p.prop("alavanca", 130, h - 70, { variant: "verde", when: lugar(deposito, ab) });
    alav[vz] = p.prop("alavanca", 130, h - 70, { variant: "vermelha", when: lugar(deposito, vz) });
    alternar(p, {
      place: deposito,
      de: ab,
      para: vz,
      prop: (s) => alav[s],
      x: 130,
      y: h - 44,
      label: { [ab]: "Puxar a alavanca: distribuir os kits", [vz]: "Puxar a alavanca: repor o estoque" },
      lines: {
        [ab]: ["Os kits desceram pela esteira e foram direto para as escolas.", "Estoque zerado: cada criança levou um áudio desmentido."],
        [vz]: ["Estoque reposto: caixas coloridas até o teto.", "A alavanca reabasteceu o depósito. Ninguém sabe de onde veio."],
      },
      stamp: {
        [ab]: { text: "KITS ENTREGUES!", color: "#fff4ce", bg: "#6746a0" },
        [vz]: { text: "ESTOQUE REPOSTO!", color: "#fff4ce", bg: "#2f6fd6" },
      },
    });
    galpaoExtra(p);
  },

  galpao: galpaoExtra,
  armazem: galpaoExtra,
  almoxarifado: galpaoExtra,

  fabrica(p) {
    const { h } = p;
    const vx = p.w - 260;
    p.prop("esteira", 780, 420);
    const em = p.prop("empilhadeira", 260, h - 90);
    p.spot("maquina", 260, h - 60, "Buzinar a empilhadeira", { prop: em, lines: ["Bi-bi! A empilhadeira empilha metas.", "O pallet saiu cantando o hino da produção."] });
    p.prop("tambor", vx - 60, h - 60);
    p.prop("tambor", vx - 90, h - 74);
    p.prop("quadroAvisos", 200, back(p) + 190, { text: "0 DIAS SEM ACIDENTE: META BATIDA" });
  },

  alfandega(p) {
    const { h } = p;
    const vx = p.w - 200;
    for (let x = 300; x <= 390; x += 30) p.prop("balizaFila", x, h - 160, { variant: x < 360 ? "fita" : undefined });
    for (let x = 510; x <= 600; x += 30) p.prop("balizaFila", x, h - 160, { variant: x < 570 ? "fita" : undefined });
    p.prop("bandeira", vx - 50, back(p) + 20, { variant: "china" });
    p.prop("bandeira", 50, back(p) + 20);
    p.prop("totemSenha", 250, h - 90);
  },

  despacho(p) {
    const { w, h } = p;
    const cf = p.prop("cafezinho", 90, h - 60);
    p.spot("fogao", 90, h - 30, "Servir um cafezinho", { prop: cf, lines: ["Café de cais: forte como maré de fofoca.", "A garrafa térmica viaja na carga do navio."] });
    p.prop("planta", 40, back(p) + 80);
    // alavanca do terminal: para ou religa a operação do cais, se o prédio tiver esse estado
    const terminal = p.b.place;
    if (!terminal) return;
    const op = "em-operacao";
    const pr = "parado";
    const alav: Record<string, string> = {};
    alav[op] = p.prop("alavanca", w - 110, back(p) + 120, { variant: "verde", when: lugar(terminal, op) });
    alav[pr] = p.prop("alavanca", w - 110, back(p) + 120, { variant: "vermelha", when: lugar(terminal, pr) });
    alternar(p, {
      place: terminal,
      de: op,
      para: pr,
      prop: (s) => alav[s],
      x: w - 110,
      y: back(p) + 150,
      label: { [op]: "Puxar a alavanca: parar o terminal", [pr]: "Puxar a alavanca: religar o terminal" },
      lines: {
        [op]: ["Alavanca puxada! A esteira parou e o guindaste ficou pendurado.", "Operação suspensa: o Brasil esperou na fila do cais."],
        [pr]: ["Terminal religado! O guindaste voltou a embarcar o país.", "A esteira reacendeu: as caixas do Brasil seguem para a China."],
      },
      stamp: {
        [op]: { text: "OPERAÇÃO SUSPENSA!", color: "#fff4ce", bg: "#55555c" },
        [pr]: { text: "EM OPERAÇÃO!", color: "#fffaf0", bg: "#b62f3e" },
      },
    });
    p.prop("quadroAvisos", 110, h - 120, { text: "TERMINAL EM OPERAÇÃO: BRASIL EMBARCANDO", when: lugar(terminal, op) });
    p.prop("quadroAvisos", 110, h - 120, { text: "TERMINAL PARADO: GREVE DO GUINDASTE", when: lugar(terminal, pr) });
  },
};
