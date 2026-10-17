import type { PlaceCondition } from "../types";
import { alternar } from "./detalhes";
import { back, cadeiras, fileira, mesaTrabalho, morador } from "./kits";
import type { ModelSpec } from "./modelos";
import type { Plan } from "./plan";

/**
 * Modelos de interior que só existem no Brasil do Flávio: o posto de saúde com catraca e camarote,
 * a Casa de Leilões (o pregão do barril usado e o pinguim) e o Tribunal Eleitoral do Cofre.
 * Já nascem no universo do Flávio: os textos daqui não passam pela tradução.
 */

const lugar = (place: string, state: string): PlaceCondition => ({ place, state });

/** Posto de Saúde Premium: recepção com fila comum e catraca, camarote VIP (cliente único: um pombo) e consultório. */
function posto(p: Plan) {
  const { w, h } = p;
  const vx = w - 280;
  const hy = 300;
  p.room("recepcao", "Recepção Premium", 0, p.wallH, vx, h - p.wallH, "marmore", "#e6f2ec");
  p.room("camarote", "Camarote VIP", vx, p.wallH, w - vx, hy - p.wallH, "carpete", "#b5452b");
  p.room("consultorio", "Consultório do Plano Ouro", vx, hy + 14, w - vx, h - hy - 14, "ceramica", "#e4e8d2");
  p.vwall(vx, p.wallH, h, [
    [170, 80],
    [400, 80],
  ]);
  p.hwall(hy, vx, w);
  // recepção: guichês VIP e comum, senha, catraca e a fila comum
  p.prop("painelSenha", 380, p.wallH - 26, { text: "SENHA VIP 001" });
  p.prop("guiche", vx / 2 - 120, back(p) + 50, { variant: "VIP" });
  p.prop("guiche", vx / 2 + 120, back(p) + 50, { variant: "COMUM" });
  p.npc("atendente", "Recepcionista Premium", vx / 2 - 120, back(p) + 12, ["Bem-vindo! Plano ouro, prata ou “boa sorte”?", "A fila VIP anda. A comum é decorativa."], { facing: "front", id: `${p.def.id}-recepcionista` });
  p.prop("catraca", 210, h - 160);
  p.prop("catraca", 270, h - 160);
  p.spot("examinar", 240, h - 130, "Passar o cartão na catraca", { lines: ["Bip! Saldo insuficiente para entrar no saguão.", "A catraca aceita cartão, pix e promessa de pagamento."] });
  cadeiras(p, 60, 5, h - 70, 36);
  p.spot("sentar", 60, h - 46, "Sentar na fila comum", { seat: { x: 60, y: h - 76, facing: "front" } });
  const tt = p.prop("totemSenha", 420, h - 120);
  p.spot("senha", 420, h - 94, "Tirar uma senha comum", { prop: tt, lines: ["Senha comum 4.812. Previsão: depois de todos os VIP.", "A senha comum vem com um anúncio do plano ouro."] });
  p.prop("quadroAvisos", vx - 130, h - 70, { text: "CONSULTA R$ 300 · PRESSÃO R$ 80 · OLHAR O MÉDICO R$ 20" });
  p.spot("examinar", vx - 130, h - 44, "Ler a tabela de preços", { lines: ["Medir a febre: R$ 40. Saber o resultado: mais R$ 40.", "Promoção: dois espirros pelo preço de um."] });
  p.prop("bebedouro", vx - 40, back(p) + 70);
  p.spot("torneira", vx - 40, back(p) + 98, "Beber água no bebedouro", { lines: ["Água premium: R$ 1 o gole.", "O bebedouro tem catraca própria."] });
  p.prop("planta", 30, back(p) + 70);
  morador(p, 340, h - 96, ["Vim só medir a pressão. Já paguei três taxas.", "Fico na fila comum. A VIP tem um pombo."], "Paciente da fila comum");
  p.poster("← COMUM · VIP →", vx - 80, "#fffaf0", "#2f8a4f");
  // camarote VIP: poltronas, tapete vermelho e o único cliente
  const cx = vx + (w - vx) / 2;
  p.prop("tapete", cx, back(p) + 100, { variant: "vermelho" });
  p.prop("poltrona", cx - 60, back(p) + 40);
  p.prop("poltrona", cx + 60, back(p) + 40);
  p.prop("pombo", cx + 60, back(p) + 28);
  p.spot("examinar", cx, hy - 40, "Espiar o camarote VIP", { lines: ["Poltrona de couro, ar-condicionado e um único cliente: um pombo.", "O pombo entrou de penetra e ninguém tem coragem de pedir a pulseira dele."] });
  p.poster("CAMAROTE VIP · SÓ PARA SÓCIOS", cx, "#fff4ce", "#b5452b");
  // consultório
  const mesa = mesaTrabalho(p, vx + 90, hy + 110, "computador");
  p.npc("func3", "Dr. Plano Ouro", vx + 90, hy + 60, ["Consulta completa só no plano ouro. Hoje temos o plano “olhar de longe”.", "O estetoscópio é por assinatura."], { facing: "front" });
  p.prop("cama", w - 70, h - 50, { variant: "verde" });
  p.spot("maquina", vx + 170, h - 70, "Medir a pressão (plano básico)", { prop: mesa, lines: ["Pressão: 12 por 8. Diagnóstico completo só no plano ouro.", "O aparelho mede a pressão e o limite do cartão."] });
  // catraca do posto: cobrando ou liberada, se o prédio tiver esse estado
  const catraca = p.b.place;
  if (catraca) {
    const alav: Record<string, string> = {};
    alav.cobrando = p.prop("alavanca", vx - 60, h - 170, { variant: "vermelha", when: lugar(catraca, "cobrando") });
    alav.liberada = p.prop("alavanca", vx - 60, h - 170, { variant: "verde", when: lugar(catraca, "liberada") });
    alternar(p, {
      place: catraca,
      de: "cobrando",
      para: "liberada",
      prop: (s) => alav[s],
      x: vx - 60,
      y: h - 144,
      label: { cobrando: "Desligar a cobrança da catraca", liberada: "Religar a cobrança da catraca" },
      lines: {
        cobrando: ["Clique! A catraca girou de graça. A fila comum entrou junto.", "Atendimento liberado: o pombo do camarote ficou ofendido."],
        liberada: ["Clique! A catraca voltou a cobrar. O pombo aplaudiu.", "Cobrança religada: a fila comum voltou a ser decorativa."],
      },
      stamp: {
        cobrando: { text: "CATRACA LIBERADA!", color: "#fffaf0", bg: "#1f8a4c" },
        liberada: { text: "COBRANÇA RELIGADA!", color: "#fffaf0", bg: "#b5452b" },
      },
    });
    p.poster("CATRACA: R$ 5 POR ENTRADA", 150, "#fff4ce", "#b5452b", 46, lugar(catraca, "cobrando"));
    p.poster("CATRACA LIBERADA", 150, "#fffaf0", "#1f8a4c", 46, lugar(catraca, "liberada"));
  }
}

/** Casa de Leilões da Pátria: palco, plateia, o lote 1 (um barril, usado) e o único arrematante, um pinguim. */
function leilao(p: Plan) {
  const { w, h } = p;
  const vx = w - 280;
  const hy = 330;
  p.room("pregao", "Salão do Pregão", 0, p.wallH, vx, h - p.wallH, "carpete", "#2a3a6b");
  p.room("deposito", "Depósito de Lotes", vx, p.wallH, w - vx, hy - p.wallH, "concreto", "#b9b3a8");
  p.room("escritorio", "Escritório do Leiloeiro", vx, hy + 14, w - vx, h - hy - 14, "taco", "#c8955a");
  p.vwall(vx, p.wallH, h, [
    [200, 80],
    [430, 80],
  ]);
  p.hwall(hy, vx, w);
  // palco
  const sx = vx / 2;
  p.wallProp("telao", sx, { text: "LOTE 1: UM BARRIL (USADO) · LANCE MÍNIMO: TUDO" });
  const pul = p.prop("pulpito", sx - 60, back(p) + 60);
  const mesa = p.prop("mesa", sx + 110, back(p) + 50, { variant: "professor" });
  const barril = p.prop("tambor", sx + 220, back(p) + 40);
  p.prop("bandeira", sx - 200, back(p) + 30);
  p.prop("bandeira", 60, back(p) + 30);
  p.npc("leiloeiro", "Leiloeiro Dr. Martelo", sx - 60, back(p) + 18, ["Dou-lhe uma! Alguém? Além do pinguim?", "Hoje vendemos de tudo. Amanhã vendemos o amanhã."], { facing: "front", id: "fl-leiloeiro" });
  p.spot("examinar", sx - 60, back(p) + 86, "Subir no púlpito do pregão", { prop: pul, lines: ["Lance de abertura: tudo. Lance de fechamento: tudo de novo.", "O microfone também está à venda. Lance mínimo: um “alô”."] });
  p.spot("examinar", sx + 110, back(p) + 78, "Bater o martelo", { prop: mesa, lines: ["Dou-lhe uma, dou-lhe duas… o pinguim é o único que levantou a plaquinha.", "Toc! Vendido: um barril, usado, com adesivo de refinaria."] });
  p.spot("examinar", sx + 220, back(p) + 70, "Examinar o lote 1", { prop: barril, lines: ["Um barril. Usado. A refinaria inteira veio de brinde no adesivo.", "Etiqueta: “Lote 1 · Petrobras (uma parte) · no estado em que se encontra”."] });
  // plateia com corredor até a porta, e o pinguim na primeira fila
  const rows = [back(p) + 200, back(p) + 262, back(p) + 324];
  for (const y of rows) {
    cadeiras(p, 90, 6, y, 54, "cadeira");
    cadeiras(p, 590, 2, y, 54, "cadeira");
  }
  const ping = p.prop("pinguim", 644, rows[0] + 2);
  p.spot("examinar", 644, rows[0] + 30, "Olhar o pinguim da primeira fila", { prop: ping, lines: ["O pinguim levanta a plaquinha: lance de um peixe.", "Único arrematante do dia. Veio de longe, com plaquinha própria."] });
  p.spot("sentar", 144, rows[1] + 24, "Sentar na plateia", { seat: { x: 144, y: rows[1] - 6, facing: "back" } });
  p.prop("estante", 50, h - 50, { variant: "jornais" });
  p.spot("livro", 50, h - 26, "Ler o catálogo de lotes", { lines: ["Lote 2: uma praça com pombo. Lote 3: o pôr do sol de quinta.", "Lote 4: a sombra do Palácio, com horário marcado."] });
  const cf = p.prop("cafezinho", vx - 60, h - 60);
  p.spot("fogao", vx - 60, h - 30, "Servir um cafezinho", { prop: cf, lines: ["Café do leilão: o primeiro gole vai a lance.", "Quem pede açúcar dá lance sem querer."] });
  p.poster("LEILÃO DA PÁTRIA · TUDO TEM PREÇO", 170, "#fff4ce", "#2a3a6b");
  // depósito de lotes
  p.prop("caixaPapelao", vx + 60, back(p) + 10);
  p.prop("caixaPapelao", vx + 110, back(p) + 22);
  p.prop("tambor", vx + 190, back(p) + 10);
  p.prop("palete", vx + 210, hy - 40);
  p.spot("caixa", vx + 90, back(p) + 50, "Conferir os lotes do depósito", { lines: ["Etiquetas: “ar do litoral”, “sombra de mangueira”, “o eco do Palácio”.", "Tudo com lance mínimo: tudo."] });
  // escritório
  const pc = mesaTrabalho(p, vx + 140, hy + 110, "computador");
  p.spot("computador", vx + 140, hy + 136, "Ver a planilha de arremates", { prop: pc, lines: ["Planilha: lote 1 · arrematante: pinguim · pagamento: peixe.", "O sistema pediu autorização para vender o próprio sistema."] });
  fileira(p, "arquivo", vx + 40, w - 40, h - 50, 60);
}

/** Tribunal Eleitoral do Cofre: o plenário, a urna de demonstração, o cofre dentro do cofre e o arquivo das senhas esquecidas. */
function tribunal(p: Plan) {
  const { w, h } = p;
  const vx = w - 300;
  const hy = 360;
  p.room("plenario", "Plenário", 0, p.wallH, vx, h - p.wallH, "marmore", "#ece8dc");
  p.room("cofre", "Sala do Cofre", vx, p.wallH, w - vx, hy - p.wallH, "concreto", "#a9a39a");
  p.room("senhas", "Arquivo das Senhas Esquecidas", vx, hy + 14, w - vx, h - hy - 14, "piso-reparticao", "#d8d2c2");
  p.vwall(vx, p.wallH, h, [
    [230, 80],
    [470, 80],
  ]);
  p.hwall(hy, vx, w);
  // plenário: bancada, martelo, urna de demonstração e a plateia
  const bx = vx / 2;
  p.prop("mesaReuniao", bx, back(p) + 74);
  cadeiras(p, bx - 80, 5, back(p) + 20, 40, "cadeira");
  p.prop("bandeira", bx - 170, back(p) + 30);
  p.prop("bandeira", bx + 170, back(p) + 30);
  p.wallProp("quadro", bx, { variant: "brasao" });
  p.spot("examinar", bx, back(p) + 104, "Bater o martelo do juiz", { lines: ["Toc! A sessão está suspensa até alguém lembrar a senha.", "Toc! Ordem no plenário. A desordem foi arquivada no cofre."] });
  p.npc("sindico", "Juiz Eleitoral", bx + 160, back(p) + 70, ["A eleição é seguríssima. Ninguém consegue abrir o cofre, nem nós.", "Senha? Estava no post-it. O post-it está no cofre."], { facing: "front" });
  p.prop("mesa", bx, back(p) + 200, { variant: "mesinha" });
  const urna = p.prop("urna", bx, back(p) + 188);
  p.spot("examinar", bx, back(p) + 226, "Examinar a urna de demonstração", { prop: urna, lines: ["A urna oficial está no cofre, dentro de outro cofre. Esta aqui é de demonstração.", "A urna de demonstração aceita votos de demonstração."] });
  for (const y of [h - 150, h - 90]) {
    cadeiras(p, 70, 5, y, 46, "cadeira");
    cadeiras(p, vx - 250, 5, y, 46, "cadeira");
  }
  p.spot("sentar", 70, h - 66, "Sentar no plenário", { seat: { x: 70, y: h - 96, facing: "back" } });
  p.prop("quadroAvisos", vx / 2, h - 40, { text: "REGIMENTO: A ELEIÇÃO É SEGURA · A SENHA É SECRETA (ATÉ PARA NÓS)" });
  p.spot("livro", vx / 2 + 80, h - 30, "Ler o regimento", { lines: ["Art. 1º: a eleição é segura. Art. 2º: ninguém sabe a senha.", "Parágrafo único: quem souber a senha precisa de autorização para lembrar."] });
  p.npc("func4", "Segurança do Segurança", vx - 60, back(p) + 130, ["Vigio o segurança que vigia o cofre.", "Quem me vigia? Um terceiro segurança, de férias."], { facing: "front" });
  p.poster("TRIBUNAL ELEITORAL DO COFRE", 160, "#fff4ce", "#1f6f43");
  // sala do cofre: o cofre dentro do cofre
  const cx = vx + (w - vx) / 2;
  const cofre = p.prop("cofre", cx, back(p) + 40, { variant: "grande-flavio" });
  p.spot("armario", cx, back(p) + 70, "Tentar a senha do cofre", { prop: cofre, lines: ["1-2-3-4? Não. 4-3-2-1? Também não. Ninguém lembra.", "A senha estava anotada num papel, que está dentro do cofre."] });
  p.prop("cone", vx + 40, hy - 30);
  p.prop("cone", w - 40, hy - 30);
  // arquivo das senhas esquecidas
  fileira(p, "arquivo", vx + 40, w - 40, back(p, hy + 14), 55);
  p.spot("armario", vx + 80, back(p, hy + 14) + 30, "Procurar a senha no arquivo", { lines: ["Pasta “Senhas”: vazia. Pasta “Senhas da pasta Senhas”: trancada.", "Achei um post-it: “a senha é aquela”."] });
  const cf = p.prop("cafezinho", w - 70, h - 60);
  p.spot("fogao", w - 70, h - 30, "Servir um cafezinho", { prop: cf, lines: ["Café do tribunal: guardado no cofre, servido frio.", "A garrafa térmica também precisa de senha."] });
}

export const MODELOS_FLAVIO: Record<"posto" | "leilao" | "tribunal", ModelSpec> = {
  posto: { size: () => ({ w: 920, h: 560 }), build: posto },
  leilao: { size: () => ({ w: 1000, h: 600, wallH: 104 }), build: leilao },
  tribunal: { size: () => ({ w: 1000, h: 620, wallH: 104 }), build: tribunal },
};
