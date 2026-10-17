import type { TemplateId } from "../types";
import { back, cadeiras, CERAMICA, cozinha, descanso, fileira, LADRILHO, MADEIRA, mesaTrabalho, morador, PAREDES, sala } from "./kits";
import { DETALHES } from "./detalhes";
import { MODELOS_FLAVIO } from "./modelosFlavio";
import type { Plan } from "./plan";

/**
 * Modelos de interior. Cada modelo recebe um `Plan` já com tamanho e cor sorteados e
 * monta cômodos, paredes internas, móveis, interações e moradores genéricos.
 * A variedade vem do sorteio determinístico (espelhamento, cores, móveis opcionais).
 */

export interface ModelSpec {
  /** Tamanho do interior conforme o porte do prédio. */
  size: (bw: number, r: Plan["r"]) => { w: number; h: number; wallH?: number };
  build: (p: Plan) => void;
  /** Pode ser montado espelhado. */
  flip?: boolean;
}

const clampW = (bw: number, k: number, min: number, max: number) => Math.round(Math.max(min, Math.min(max, bw * k)) / 10) * 10;

// ------------------------------------------------------------------ moradias

type VarianteCasa = "classica" | "quartao" | "vendinha";

/** Canto de passatempo de cada casa: um objeto a mais com uma ação própria. */
function hobby(p: Plan, qual: "costura" | "violao" | "ventilador") {
  const { w, h } = p;
  if (qual === "costura") {
    p.prop("cadeira", 90, h - 96, { variant: "escritorio" });
    const m = p.prop("mesaEscritorio", 90, h - 66, { variant: "maquina" });
    p.spot("maquina", 90, h - 36, "Pedalar a máquina de costura", { prop: m, lines: ["Tec-tec-tec! Uma bandeira nova, costurada em três minutos.", "A máquina costura sozinha: já foi coletivizada."] });
  } else if (qual === "violao") {
    const v = p.prop("violao", w - 30, h - 60);
    p.spot("instrumento", w - 62, h - 56, "Tocar o violão", { prop: v, lines: ["Três acordes e um refrão contra a burocracia.", "O violão desafina a favor do povo."] });
  } else {
    const v = p.prop("ventilador", w - 34, h - 60);
    p.spot("ventilador", w - 62, h - 56, "Ligar o ventilador", { prop: v, lines: ["Zzzzum! O vento é de todos, mas a hélice é minha.", "O ventilador espalha fofoca e poeira."] });
  }
}

function casa(p: Plan) {
  const { w, h } = p;
  const variante = p.r.pick<VarianteCasa>(["classica", "quartao", "vendinha"]);
  const mid = Math.round(w * (variante === "quartao" ? 0.4 : 0.5));
  const hy = 280;
  p.room("cozinha", "Cozinha", 0, p.wallH, mid, hy - p.wallH, "ceramica", p.r.pick(CERAMICA));
  p.room("descanso", variante === "quartao" ? "Quartão" : "Área de descanso", mid, p.wallH, w - mid, hy - p.wallH, "taco", p.r.pick(MADEIRA));
  p.room("sala", variante === "vendinha" ? "Sala e vendinha" : "Sala", 0, hy + 14, w, h - hy - 14, p.r.chance(0.5) ? "ladrilho" : "taco", p.r.chance(0.5) ? p.r.pick(LADRILHO) : p.r.pick(MADEIRA));
  p.hwall(hy, 0, w, [
    [96, 84],
    [w - 186, 84],
  ]);
  p.vwall(mid, p.wallH, hy);
  cozinha(p, 0, mid - 8, p.wallH, hy, {});
  descanso(p, mid + 8, w, p.wallH, hy);
  sala(p, 0, w, hy + 14, h);
  p.wallProp("janela", mid / 2 + 30);
  p.wallProp("janela", mid + (w - mid) / 2);
  p.prop("vaso", 30, h - 40);
  if (variante === "quartao") {
    p.wallProp("quadro", w - 110, { variant: "festa" });
    p.prop("planta", w - 24, hy - 30);
    hobby(p, "costura");
    morador(p, Math.round(w * 0.72), hy + 90, ["O quarto é grande porque a família é maior que a casa.", "Costuro bandeira de todo time. Ninguém reclama."]);
  } else if (variante === "vendinha") {
    // vendinha de bairro: prateleira baixa e caixa na sala, atendida pela moradora
    p.prop("gondola", w - 118, hy + 64, { variant: "enlatados" });
    const cx = p.prop("caixaRegistradora", w - 148, hy + 134);
    p.spot("registradora", w - 148, hy + 164, "Atender na vendinha", { prop: cx, lines: ["Fiado só até o decreto de amanhã. Plim!", "Cada lata tem preço coletivo: o mesmo que ontem."] });
    hobby(p, p.r.pick(["violao", "ventilador"] as const));
    morador(p, w - 214, hy + 112, ["Vendinha da casa: pão, pilha e fofoca fresquinha.", "Pode olhar à vontade. Comprar, só com carimbo."], "Dona da vendinha");
  } else {
    hobby(p, p.r.pick(["violao", "ventilador", "costura"] as const));
    morador(p, Math.round(w * 0.72), hy + 90, [
      "Fica à vontade! Aqui a casa é sua… e de todo mundo, por decreto.",
      "Coletivizaram meu sofá. Agora quem senta primeiro é o dono.",
      "Cuidado com o cachorro: ele também é patrimônio do povo.",
    ]);
  }
}

function republica(p: Plan) {
  const { w, h } = p;
  const mid = Math.round(w / 2);
  const hy = 270;
  p.room("cozinha", "Cozinha coletiva", 0, p.wallH, mid, hy - p.wallH, "ceramica", p.r.pick(CERAMICA));
  p.room("quarto", "Quarto de todo mundo", mid, p.wallH, w - mid, hy - p.wallH, "taco", p.r.pick(MADEIRA));
  p.room("sala", "Sala da assembleia", 0, hy + 14, w, h - hy - 14, "taco", p.r.pick(MADEIRA));
  p.hwall(hy, 0, w, [
    [90, 84],
    [w - 190, 84],
  ]);
  p.vwall(mid, p.wallH, hy);
  cozinha(p, 0, mid - 8, p.wallH, hy, { mesa: false });
  p.cachaca("Geladeira da República", 34, back(p) + 30);
  p.prop("beliche", mid + 70, back(p) + 4);
  p.prop("colchao", mid + 190, back(p) + 70, { variant: "azul" });
  p.prop("colchao", mid + 190, back(p) + 120, { variant: "rosa" });
  p.spot("deitar", mid + 150, back(p) + 140, "Deitar no colchão", { seat: { x: mid + 190, y: back(p) + 104, facing: "front" } });
  const mesa = p.prop("mesaPingPong", w * 0.36, hy + 120);
  p.spot("examinar", w * 0.36, hy + 160, "Jogar pingue-pongue", { prop: mesa, lines: ["Placar: 21 a 21. Na república, ninguém perde.", "A bolinha foi coletivizada e sumiu."] });
  const som = p.prop("caixaSom", w - 60, hy + 70);
  p.spot("radio", w - 60, hy + 100, "Ligar a caixa de som", { prop: som, lines: ["Toca o hino do DCE em versão pagode.", "O vizinho bateu na parede. É do povo também."] });
  p.prop("sofa", w * 0.72, h - 60, { variant: "verde" });
  p.spot("sentar", w * 0.72, h - 36, "Sentar no sofá", { seat: { x: w * 0.72 - 18, y: h - 68, facing: "back" } });
  p.wallProp("quadro", mid / 2, { variant: "festa" });
  p.poster("ASSEMBLEIA HOJE · FESTA DEPOIS · ASSEMBLEIA DA FESTA", mid + (w - mid) / 2, "#fffaf0", "#7b4bd1", 40);
  morador(p, w * 0.2, hy + 110, ["Aqui a louça é coletiva. Ninguém lava, mas é de todos.", "A prova foi coletivizada: todo mundo tirou 7."], "Estudante morador");
}

function conjunto(p: Plan) {
  const { w, h } = p;
  const aptY = 316;
  const corY = 456;
  p.room("apto", "Apartamento 13-B", 0, p.wallH, w, aptY - p.wallH, "taco", p.r.pick(MADEIRA));
  p.room("corredor", "Corredor coletivo", 0, aptY + 14, w, corY - aptY - 14, "ladrilho", p.r.pick(LADRILHO));
  p.room("portaria", "Portaria", 0, corY + 14, w, h - corY - 14, "ceramica", p.r.pick(CERAMICA));
  p.vwall(420, p.wallH, aptY, [[150, 80]]);
  p.hwall(aptY, 0, w, [[610, 84]]);
  p.hwall(corY, 0, w, [[70, 100]]);
  cozinha(p, 0, 412, p.wallH, aptY, {});
  sala(p, 428, w, p.wallH, aptY, { radio: false });
  p.wallProp("janela", 210);
  p.wallProp("janela", 640);
  // corredor
  const camp = p.prop("quadroAvisos", 320, aptY + 46, { text: "REUNIÃO DE CONDOMÍNIO COLETIVO: TODO DIA" });
  p.spot("examinar", 320, aptY + 76, "Ler o quadro de avisos", { prop: camp, lines: ["“Proibido ter vaga própria. Todas as vagas são de todos.”", "“A piscina coletiva é o balde do 4º andar.”"] });
  p.spot("campainha", 650, aptY + 46, "Tocar a campainha do 13-B", { lines: ["Ding-dong coletivo!", "Uma voz grita lá de dentro: “Tá aberta, é do povo!”"] });
  p.prop("vaso", 40, corY - 10);
  p.prop("vaso", w - 40, corY - 10);
  // portaria
  const elev = p.prop("elevador", w - 140, corY + 48);
  p.spot("campainha", w - 140, corY + 76, "Chamar o elevador", { prop: elev, lines: ["Placa: “Elevador coletivo em manutenção desde 1998”.", "O elevador chegou. Já cheio de vizinhos."] });
  p.prop("caixasCorreio", 260, corY + 46);
  p.spot("armario", 260, corY + 76, "Olhar as caixas de correio", { lines: ["Correspondência: 47 boletos coletivos e uma corrente de oração registrada.", "Todo mundo recebeu a carta de todo mundo."] });
  p.prop("mesa", w / 2 + 120, h - 70, { variant: "madeira" });
  p.npc("m4", "Porteiro Seu Juca", w / 2 + 120, h - 102, ["Assina o livro de visitas? É coletivo, pode assinar por todo mundo.", "O síndico é o povo. E o povo nunca está."], { facing: "front", ...(p.b.id === "res-conjunto-13" ? { id: "juca" } : {}) });
  morador(p, 180, aptY + 100, ["Moro no 13-B, no 13-C e no 13-D. Tudo é de todos.", "O varal do prédio virou bandeira do conjunto."]);
}

function associacao(p: Plan) {
  const { w, h } = p;
  const vx = w - 220;
  p.room("salao", "Salão da Associação", 0, p.wallH, vx, h - p.wallH, "ladrilho", p.r.pick(LADRILHO));
  p.room("cozinha", "Cozinha comunitária", vx, p.wallH, w - vx, h - p.wallH - 160, "ceramica", p.r.pick(CERAMICA));
  p.vwall(vx, p.wallH, h - 150, [[200, 80]]);
  p.hwall(h - 164, vx, w);
  const mesa = p.prop("mesaReuniao", vx / 2, back(p) + 40);
  p.spot("examinar", vx / 2 + 120, back(p) + 70, "Bater o martelo da diretoria", { prop: mesa, lines: ["Aprovado por unanimidade: tudo é de todos.", "Ata da reunião: “discutimos o áudio e ele virou lei”."] });
  for (let r = 0; r < 3; r++) cadeiras(p, vx / 2 - 130, 6, back(p) + 140 + r * 60, 52, "cadeira");
  p.spot("sentar", vx / 2 - 130, back(p) + 140 + 120 + 22, "Sentar na assembleia", { seat: { x: vx / 2 - 130, y: back(p) + 140 + 120 - 4, facing: "back" } });
  p.prop("quadroAvisos", 70, h - 60, { text: "MUTIRÃO DE SÁBADO: PINTAR O MURO DO VIZINHO (QUE É SEU)" });
  p.spot("examinar", 70, h - 32, "Ler o quadro de avisos", { lines: ["“Bingo beneficente: o prêmio é para todos.”", "“Achados e perdidos: tudo foi achado por alguém.”"] });
  cozinha(p, vx + 8, w, p.wallH, h - 164, { mesa: false, filtro: false });
  p.wallProp("quadro", vx / 2 - 150, { variant: "bandeira" });
  p.wallProp("relogio", vx / 2 + 160);
  morador(p, vx / 2, back(p) + 4, ["Presidente da associação, vice-presidente e plateia: tudo eu.", "Na pauta de hoje: o portão do Seu Dirceu."], "Presidente da Associação");
}

// ------------------------------------------------------------------ governo

function prefeitura(p: Plan) {
  const { w, h } = p;
  const hy = 340;
  const a = Math.round(w / 3);
  p.room("arquivo", "Arquivo Municipal", 0, p.wallH, a, hy - p.wallH, "piso-reparticao", "#d8d2c2");
  p.room("gabinete", "Gabinete do Prefeito Popular", a, p.wallH, a, hy - p.wallH, "carpete", "#b5452b");
  p.room("reuniao", "Sala de Reuniões", 2 * a, p.wallH, w - 2 * a, hy - p.wallH, "taco", p.r.pick(MADEIRA));
  p.room("recepcao", "Recepção", 0, hy + 14, w, h - hy - 14, "marmore", "#efe6d2");
  p.hwall(hy, 0, w, [
    [a / 2 - 45, 90],
    [a + a / 2 - 45, 90],
    [2 * a + a / 2 - 45, 90],
  ]);
  p.vwall(a, p.wallH, hy);
  p.vwall(2 * a, p.wallH, hy);
  // arquivo
  const arqs = fileira(p, "arquivo", 40, a - 40, back(p), 52);
  p.spot("armario", 92, back(p) + 30, "Abrir uma gaveta do arquivo", { prop: arqs[1], lines: ["Pasta “Áudios de 1987”: ainda em análise.", "Gaveta cheia de decretos sobre gavetas."] });
  p.prop("pilhaPapel", a - 60, hy - 30);
  p.prop("pilhaPapel", 60, hy - 30);
  p.wallProp("relogio", a - 40);
  // gabinete
  const mesa = mesaTrabalho(p, a + a / 2, back(p) + 90, "carimbo");
  p.spot("carimbo", a + a / 2 + 70, back(p) + 104, "Carimbar um decreto", { prop: mesa, lines: ["DECRETADO: amanhã é feriado de ontem.", "CARIMBADO: a fofoca agora é oficial."] });
  p.spot("sentar", a + a / 2, back(p) + 120, "Sentar na cadeira do prefeito", { seat: { x: a + a / 2, y: back(p) + 62, facing: "front" } });
  p.prop("bandeira", a + 40, back(p));
  p.prop("bandeira", 2 * a - 40, back(p));
  p.wallProp("quadro", a + a / 2 - 70, { variant: "retrato" });
  p.wallProp("quadro", a + a / 2 + 70, { variant: "brasao" });
  p.prop("planta", a + 30, hy - 64);
  // reuniões
  p.prop("mesaReuniao", 2 * a + (w - 2 * a) / 2, back(p) + 100);
  cadeiras(p, 2 * a + (w - 2 * a) / 2 - 80, 5, back(p) + 50, 40, "cadeira");
  p.spot("sentar", 2 * a + (w - 2 * a) / 2, back(p) + 150, "Sentar na reunião", { seat: { x: 2 * a + (w - 2 * a) / 2 - 80, y: back(p) + 46, facing: "front" } });
  const telao = p.wallProp("telao", 2 * a + (w - 2 * a) / 2, { text: "PAUTA: TRANSFORMAR ÁUDIO EM OBRA" });
  p.spot("tv", 2 * a + 60, back(p) + 30, "Ligar o projetor", { prop: telao, lines: ["Slide 1 de 400: “O áudio de 3 minutos e você”.", "Gráfico de pizza: a pizza também foi coletivizada."] });
  const cafe = p.prop("cafezinho", w - 70, hy - 34);
  p.spot("fogao", w - 70, hy - 4, "Servir um cafezinho", { prop: cafe, lines: ["Café coletivo: sai fraco, mas sai para todos.", "A garrafa térmica tem número de protocolo."] });
  // recepção: tapete vermelho até o balcão, balcão no meio, cadeiras de espera dos dois lados
  p.prop("tapeteCorredor", w / 2, hy + 205, { variant: "vermelho-curto" });
  p.prop("balcao", w / 2, hy + 130);
  p.npc("atendente", "Recepcionista da Prefeitura", w / 2, hy + 92, ["Bom dia! Qual áudio deseja oficializar?", "O prefeito está em reunião com ele mesmo."], { facing: "front" });
  p.spot("campainha", w / 2 + 90, hy + 158, "Tocar a campainha do balcão", { lines: ["Plim! “Já vai, é só preencher 12 formulários.”", "Plim! A campainha também é patrimônio público."] });
  p.prop("bandeira", w / 2 - 190, hy + 118);
  p.prop("bandeira", w / 2 + 190, hy + 118);
  const totem = p.prop("totemSenha", 330, hy + 70);
  p.spot("senha", 330, hy + 96, "Tirar uma senha", { prop: totem, lines: ["Sua senha: 0612. Atendimento previsto para o próximo mandato.", "A senha saiu com carimbo e sem número."] });
  cadeiras(p, 90, 6, h - 70, 36);
  p.spot("sentar", 90, h - 46, "Sentar e esperar", { seat: { x: 90, y: h - 76, facing: "front" } });
  cadeiras(p, w - 280, 5, h - 70, 36);
  p.spot("sentar", w - 280, h - 46, "Sentar e esperar", { seat: { x: w - 280, y: h - 76, facing: "front" } });
  p.prop("quadroAvisos", w - 170, hy + 72, { text: "AVISO: O DECRETO DE ONTEM VALE HOJE" });
  p.prop("bebedouro", w - 60, hy + 70);
  p.spot("torneira", w - 60, hy + 98, "Beber água no bebedouro", { lines: ["Água gelada do povo.", "O bebedouro faz um barulho de protesto."] });
  p.prop("planta", w - 40, h - 40);
  p.prop("planta", 40, hy + 60);
  p.prop("vaso", 40, h - 36);
  morador(p, w - 360, h - 130, ["Vim pedir um alvará para pedir um alvará.", "Senha 0666. Estou aqui desde o decreto anterior."]);
}

function ministerio(p: Plan) {
  const { w, h } = p;
  const hy = 330;
  const a = Math.round(w * 0.34);
  const b2 = Math.round(w * 0.68);
  p.room("audios", "Arquivo de Áudios", 0, p.wallH, a, hy - p.wallH, "piso-reparticao", "#d6d0c4");
  p.room("central", "Central de Áudios", a, p.wallH, b2 - a, hy - p.wallH, "carpete", "#3a4a6b");
  p.room("reuniao", "Sala do Ministro", b2, p.wallH, w - b2, hy - p.wallH, "taco", p.r.pick(MADEIRA));
  p.room("recepcao", "Recepção do Ministério", 0, hy + 14, w, h - hy - 14, "marmore", "#ece6da");
  p.hwall(hy, 0, w, [
    [a / 2 - 45, 90],
    [(a + b2) / 2 - 50, 100],
    [(b2 + w) / 2 - 45, 90],
  ]);
  p.vwall(a, p.wallH, hy);
  p.vwall(b2, p.wallH, hy);
  // arquivo de áudios
  fileira(p, "estante", 60, a - 60, back(p, undefined, 24), 100, () => "fitas");
  const radio = p.prop("radio", a / 2, hy - 40);
  p.spot("radio", a / 2, hy - 14, "Ouvir um áudio arquivado", { prop: radio, lines: ["“Gente, urgente, repassem!” (áudio de 3 minutos)", "“Meu primo do vizinho disse que…” (arquivado como prova)"] });
  // central de áudios
  const tel = p.prop("mesaTelefones", (a + b2) / 2, back(p) + 110);
  p.spot("telefone", (a + b2) / 2, back(p) + 136, "Atender o telefone do ministério", { prop: tel, lines: ["Alô, Ministério do Áudio! Seu áudio foi promovido a notícia.", "Trim! “É verdade que a lua é estatal?” “Agora é.”"] });
  const telao = p.wallProp("telao", (a + b2) / 2, { text: "AO VIVO · ÁUDIO DO DIA" });
  p.spot("tv", (a + b2) / 2 + 130, back(p) + 30, "Mudar a manchete do telão", { prop: telao, lines: ["Nova manchete: “A picanha agora é ministério”.", "Áudio do dia: “O zap ganhou carteira assinada”."] });
  p.npc("func4", "Analista de Áudios", (a + b2) / 2 - 60, back(p) + 80, ["Recebemos 3 mil áudios por minuto. Todos verdadeiros, por decreto.", "Minha função é espalhar. Com responsabilidade."], { facing: "front" });
  // sala do ministro
  const mesa = mesaTrabalho(p, (b2 + w) / 2, back(p) + 90, "telefone");
  p.spot("carimbo", (b2 + w) / 2 + 70, back(p) + 104, "Carimbar “URGENTE”", { prop: mesa, lines: ["URGENTE: o áudio de ontem está atrasado.", "CONFIDENCIAL: todo mundo já sabe."] });
  p.prop("caixaSom", w - 40, back(p));
  p.prop("bandeira", b2 + 40, back(p));
  // recepção
  p.prop("balcao", w / 2, hy + 120);
  p.npc("atendente", "Recepcionista do Ministério", w / 2, hy + 82, ["Deseja registrar um áudio ou retirar um áudio?", "Aqui a fofoca tem protocolo."], { facing: "front" });
  p.spot("campainha", w / 2 + 90, hy + 148, "Tocar a campainha", { lines: ["Plim! Dizem que a campainha é decorativa: ninguém atende.", "Plim! “Senha 4.512, guichê do áudio.”"] });
  cadeiras(p, 80, 5, h - 70, 36);
  p.spot("sentar", 80, h - 46, "Sentar e esperar", { seat: { x: 80, y: h - 76, facing: "front" } });
  p.prop("bebedouro", w - 60, hy + 70);
  p.prop("planta", w - 40, h - 40);
  p.poster("SEU ÁUDIO É NOTÍCIA", a / 2, "#fffaf0", "#c62835");
}

function reparticao(p: Plan) {
  const { w, h } = p;
  const vx = w - 170;
  p.room("atendimento", "Atendimento", 0, p.wallH, vx, h - p.wallH, "piso-reparticao", "#d8d2c2");
  p.room("arquivo-morto", "Arquivo morto", vx, p.wallH, w - vx, h - p.wallH - 170, "piso-reparticao", "#c9c2b0");
  p.vwall(vx, p.wallH, h - 156, [[h - 260, 76]]);
  p.hwall(h - 170, vx, w);
  const painel = p.prop("painelSenha", vx / 2, p.wallH - 26, { text: "SENHA 0666" });
  p.spot("senha", vx / 2 - 150, back(p) + 110, "Tirar uma senha", { prop: painel, lines: ["Sua senha: 0667. Previsão: próximo mandato.", "A senha saiu carimbada."] });
  p.prop("totemSenha", vx / 2 - 190, back(p) + 120);
  const g1 = p.prop("guiche", vx / 2 - 190, back(p) + 50, { variant: "1" });
  p.prop("guiche", vx / 2, back(p) + 50, { variant: "2" });
  p.prop("guiche", vx / 2 + 190, back(p) + 50, { variant: "3" });
  p.spot("carimbo", vx / 2 + 190, back(p) + 82, "Carimbar o próprio protocolo", { prop: g1, lines: ["CARIMBADO! Agora falta o carimbo do carimbo.", "DEFERIDO… para daqui a 300 anos úteis."] });
  p.npc("atendente", "Atendente Dona Protocolo", vx / 2, back(p) + 12, ["Seu pedido foi protocolado. Prazo: trezentos anos úteis.", "Sem senha, sem carimbo. Sem carimbo, sem senha."], { facing: "front", id: p.def.id === "reparticao" ? "atendente" : `${p.def.id}-atendente` });
  // fila: cadeiras de espera e correntes de baliza dos dois lados, deixando o corredor do meio livre até a porta
  cadeiras(p, vx / 2 - 170, 3, back(p) + 190, 60);
  cadeiras(p, vx / 2 + 60, 3, back(p) + 190, 60);
  p.spot("sentar", vx / 2 - 110, back(p) + 214, "Sentar na fila", { seat: { x: vx / 2 - 110, y: back(p) + 184, facing: "back" } });
  p.npc("didi", "Cidadão na fila", vx / 2 - 170, back(p) + 202, ["Estou na fila desde o decreto anterior."], { facing: "back" });
  p.npc("func2", "Cidadã na fila", vx / 2 + 120, back(p) + 202, ["Vim pedir a segunda via do meu portão coletivizado."], { facing: "back" });
  for (let x = 40; x <= 250; x += 52) p.prop("balizaFila", x, h - 120, { variant: x < 240 ? "fita" : undefined });
  for (let x = vx - 250; x <= vx - 40; x += 52) p.prop("balizaFila", x, h - 120, { variant: x < vx - 80 ? "fita" : undefined });
  // arquivo morto
  fileira(p, "arquivo", vx + 40, w - 40, back(p), 50);
  p.prop("pilhaPapel", vx + 50, h - 210);
  p.spot("examinar", vx + 85, h - 200, "Mexer no arquivo morto", { lines: ["Processo nº 1: “Pedido para abolir as filas”. Na fila.", "Encontrei um carimbo que carimba sozinho."] });
  p.prop("pilhaPapel", 40, h - 50);
  p.prop("bebedouro", vx - 40, h - 60);
  p.prop("planta", 36, back(p) + 120);
  p.prop("planta", vx - 34, back(p) + 120);
  p.wallProp("relogio", vx - 18, { variant: "ponto" });
  p.poster("SEU PEDIDO FOI PROTOCOLADO", 140, "#fffaf0", "#3a6b5a");
  p.poster("AGUARDE: 300 ANOS ÚTEIS", vx - 120, "#1e1424", "#ffd23f", 32);
}

function secretaria(p: Plan) {
  const { w, h } = p;
  const hy = 280;
  p.room("sala", "Sala da Coletivização", 0, p.wallH, w, hy - p.wallH, "carpete", "#7a4a3a");
  p.room("escritorio", "Escritório aberto", 0, hy + 14, w, h - hy - 14, "piso-reparticao", "#d8d2c2");
  p.hwall(hy, 0, w, [[w / 2 - 45, 90]]);
  p.prop("mesaReuniao", w / 2, back(p) + 80);
  cadeiras(p, w / 2 - 80, 5, back(p) + 30, 40, "cadeira");
  const mapa = p.wallProp("quadro", w / 2, { variant: "mapa" });
  p.spot("examinar", w / 2 - 160, back(p) + 40, "Ver o mapa da coletivização", { prop: mapa, lines: ["Alfinetes vermelhos: portões já coletivizados.", "Próxima meta: o seu guarda-chuva."] });
  fileira(p, "arquivo", 40, 140, back(p), 50);
  const m1 = mesaTrabalho(p, 150, hy + 110, "computador");
  mesaTrabalho(p, w - 150, hy + 110, "carimbo");
  p.spot("computador", 150, hy + 136, "Usar o computador", { prop: m1, lines: ["Planilha “Bens do povo.xls”: 3 milhões de linhas.", "O computador também foi coletivizado: tem 40 abas abertas."] });
  p.spot("carimbo", w - 80, hy + 124, "Carimbar uma coletivização", { lines: ["COLETIVIZADO: um par de chinelos.", "COLETIVIZADO: o próprio carimbo."] });
  p.prop("filtro", w / 2 - 40, h - 50);
  p.spot("torneira", w / 2 - 40, h - 26, "Tomar um cafezinho", { lines: ["Café coletivo: fraco, mas é de todos.", "O açúcar acabou. Foi redistribuído."] });
  p.prop("planta", w - 40, h - 40);
  morador(p, w - 150, hy + 84, ["Hoje já coletivizei três bicicletas e um bolo.", "Preenche aqui: nome, CPF e áudio favorito."], "Servidora da Secretaria");
}

function imprensa(p: Plan) {
  const { w, h } = p;
  const hy = 290;
  p.room("grafica", "Gráfica", 0, p.wallH, w, hy - p.wallH, "concreto", "#b9b3a8");
  p.room("redacao", "Redação", 0, hy + 14, w, h - hy - 14, "taco", p.r.pick(MADEIRA));
  p.hwall(hy, 0, w, [[w - 170, 90]]);
  const rot = p.prop("rotativa", w / 2 - 40, back(p) + 90);
  p.spot("maquina", w / 2 + 110, back(p) + 120, "Ligar a rotativa", { prop: rot, lines: ["Edição extra: “ÁUDIO CONFIRMADO PELO PRÓPRIO ÁUDIO”.", "A rotativa imprime manchete sozinha. É do povo."] });
  p.prop("pilhaPapel", 60, hy - 40);
  p.prop("pilhaPapel", 100, hy - 30);
  const m1 = mesaTrabalho(p, 140, hy + 120, "maquina");
  mesaTrabalho(p, w / 2 + 40, hy + 120, "maquina");
  p.spot("computador", 140, hy + 146, "Datilografar uma manchete", { prop: m1, lines: ["Manchete: “Cidadão descobre que o áudio era verdade”.", "Tec-tec-tec… plim! Saiu um decreto sem querer."] });
  p.prop("estante", w - 80, h - 50, { variant: "jornais" });
  p.spot("livro", w - 80, h - 26, "Ler o jornal de hoje", { lines: ["Classificados: “Troco portão coletivo por portão coletivo”.", "Horóscopo oficial: todo mundo vai ganhar o mesmo."] });
  p.poster("EXTRA! EXTRA! O ÁUDIO VIROU LEI", w / 2 - 40, "#1e1424", "#f6bd60");
  morador(p, w / 2 + 40, hy + 92, ["Aqui a notícia sai antes do fato.", "Revisor? Manchete oficial não precisa de revisão."], "Jornalista oficial");
}

function banco(p: Plan) {
  const { w, h } = p;
  const vx = w - 190;
  p.room("agencia", "Agência", 0, p.wallH, vx, h - p.wallH, "marmore", "#e6efe9");
  p.room("cofre", "Cofre do Povo", vx, p.wallH, w - vx, h - p.wallH - 160, "concreto", "#a9a39a");
  p.vwall(vx, p.wallH, h - 146, [[h - 250, 76]]);
  p.hwall(h - 160, vx, w);
  p.prop("guiche", vx / 2 - 100, back(p) + 50, { variant: "CAIXA" });
  p.prop("guiche", vx / 2 + 100, back(p) + 50, { variant: "PIX" });
  p.npc("func3", "Caixa do Banco Estatal", vx / 2 - 100, back(p) + 12, ["Saque disponível: tudo o que é seu. Que é de todos.", "Seu saldo é coletivo: R$ 0,00 para cada um."], { facing: "front" });
  const atm = p.prop("caixaEletronico", 50, h - 70);
  p.prop("caixaEletronico", 110, h - 70);
  p.spot("registradora", 80, h - 40, "Usar o caixa eletrônico", { prop: atm, lines: ["Saldo: o mesmo de todo mundo.", "“Pix coletivo enviado para 210 milhões de pessoas.”"] });
  const painel = p.prop("painelSenha", vx / 2, p.wallH - 26, { text: "SENHA 0013" });
  p.spot("senha", vx / 2, back(p) + 130, "Tirar uma senha", { prop: painel, lines: ["Senha 0014. A agência só tem a senha 0013.", "Atendimento prioritário: todos."] });
  cadeiras(p, vx / 2 - 60, 4, h - 70, 36);
  const cofre = p.prop("cofre", vx + (w - vx) / 2, back(p) + 10);
  p.spot("armario", vx + (w - vx) / 2, back(p) + 40, "Abrir o cofre", { prop: cofre, lines: ["Dentro: um bilhete “volto já” e um cofrinho de porquinho.", "O cofre está aberto. Sempre esteve. É do povo."] });
  p.prop("planta", vx - 40, h - 40);
  p.poster("BANCO ESTATAL DO POVO", vx / 2, "#ffffff", "#1f6e44");
}

// ------------------------------------------------------------------ fé

function igreja(p: Plan, small: boolean) {
  const { w, h } = p;
  const vx = small ? 160 : w - 170;
  const hy = small ? h - 220 : 330;
  const naveX0 = small ? vx : 0;
  const naveX1 = small ? w : vx;
  const cx = (naveX0 + naveX1) / 2;
  p.room("nave", small ? "Salão de culto" : "Nave", naveX0, p.wallH, naveX1 - naveX0, h - p.wallH, "marmore", small ? "#e8e4f2" : "#f1e8dc");
  p.room("apoio", small ? "Sala de apoio" : "Sacristia", small ? 0 : vx, p.wallH, small ? vx : w - vx, hy - p.wallH, "taco", p.r.pick(MADEIRA));
  p.vwall(vx, p.wallH, hy, [[hy - 110, 76]]);
  p.hwall(hy, small ? 0 : vx, small ? vx : w);
  // o lugar muda de estado: interditado (cavaletes, velas apagadas) ou aberto (velas acesas e flores)
  const place = p.b.place;
  const trancada = place ? { place, state: "interditada" } : undefined;
  const aberta = place ? { place, state: "aberta" } : undefined;
  const altar = p.prop("altar", cx, back(p) + 40);
  p.spot("examinar", cx, back(p) + 70, "Olhar o altar", { prop: altar, lines: ["Uma vela acesa e um aviso: “Milagre só com protocolo”.", "O altar está empoeirado de tanto decreto."] });
  p.prop("pulpito", cx - (small ? 70 : 110), back(p) + 90);
  if (small) {
    const vio = p.prop("violao", naveX1 - 50, back(p) + 30);
    p.spot("instrumento", naveX1 - 80, back(p) + 50, "Tocar o violão", { prop: vio, lines: ["Um louvor em lá menor ecoa no salão lacrado.", "Até o violão tem cadeado: só a quinta corda funciona."] });
  } else {
    const org = p.prop("orgao", naveX1 - 90, back(p) + 10);
    p.spot("instrumento", naveX1 - 90, back(p) + 40, "Tocar o órgão", { prop: org, lines: ["Fuuum! O órgão toca um hino abafado pelo decreto.", "As notas saem com carimbo de interdição."] });
    const sino = p.prop("sino", 70, back(p) + 30);
    p.spot("sino", 70, back(p) + 60, "Tocar o sino", { prop: sino, lines: ["Blém-blém! O sino ainda não foi interditado.", "O sino ecoa pela cidade inteira."] });
  }
  // nave: tapete no corredor central, bancos em duas colunas e vitrais na parede do fundo
  const rows = small ? 3 : 4;
  const colX = small ? [cx - 120, cx + 120] : [cx - 160, cx + 160];
  const rowY0 = small ? back(p) + 160 : back(p) + 170;
  p.prop("tapeteCorredor", cx, rowY0 + (rows - 1) * 31 - 20, { variant: small ? "azul-medio" : "vermelho-longo" });
  for (let r = 0; r < rows; r++) for (const x of colX) p.prop("bancoIgreja", x, rowY0 + r * 62, { variant: small ? "claro" : "escuro" });
  const by = rowY0 + 62;
  p.spot("sentar", colX[0], by + 22, "Sentar no banco", { seat: { x: colX[0] - 30, y: by - 8, facing: "back" } });
  p.wallProp("vitral", small ? naveX0 + 34 : 32);
  p.wallProp("vitral", small ? naveX1 - 34 : 586);
  if (!small) p.wallProp("vitral", cx);
  const aisleL = cx - (small ? 52 : 56);
  const aisleR = cx + (small ? 52 : 56);
  p.prop("cavalete", aisleL, back(p) + 112, { when: trancada });
  p.prop("cavalete", aisleR, back(p) + 112, { when: trancada });
  p.prop("castical", aisleL - 36, back(p) + 112, { variant: "apagado", when: trancada });
  p.prop("castical", aisleR + 36, back(p) + 112, { variant: "apagado", when: trancada });
  p.prop("castical", aisleL - 6, back(p) + 112, { when: aberta });
  p.prop("castical", aisleR + 6, back(p) + 112, { when: aberta });
  p.prop("castical", aisleL - 36, back(p) + 112, { when: aberta });
  p.prop("castical", aisleR + 36, back(p) + 112, { when: aberta });
  p.prop("vaso", cx - 52, back(p) + 36, { when: aberta });
  p.prop("vaso", cx + 52, back(p) + 36, { when: aberta });
  // apoio / sacristia: armário e o mural onde fica o decreto de interdição
  const ax0 = small ? 0 : vx;
  const ax1 = small ? vx : w;
  const arm = p.prop("armario", ax1 - 50, back(p), { variant: "madeira" });
  p.spot("armario", ax1 - 50, back(p) + 30, small ? "Abrir o armário de apoio" : "Abrir o armário das vestes", { prop: arm, lines: ["Batinas, um cadeado reserva e um panfleto “fé sem burocracia”.", "Caixas de hóstia com selo do Ministério."] });
  p.prop("vaso", ax0 + 30, hy - 30);
  if (place) {
    const mx = ax0 + 38;
    const mural = place === "assembleia" ? "lacre do Ministério" : "decreto de interdição";
    const quadro = p.wallProp("quadro", mx, { variant: "decreto", when: trancada });
    p.spot("decreto", mx, back(p) + 8, `Arrancar o ${mural} do mural`, {
      prop: quadro,
      when: trancada,
      setPlace: aberta,
      lines: ["Arrancado! A porta da frente estava só encostada na burocracia.", "REVOGADO por quem estava lá, sem protocolo e sem carimbo."],
    });
    const quadro2 = p.wallProp("quadro", mx, { variant: "revogado", when: aberta });
    p.spot("decreto", mx, back(p) + 8, `Pregar o ${mural} de volta`, {
      prop: quadro2,
      when: aberta,
      setPlace: trancada,
      lines: ["DECRETADO de novo: a igreja volta a ser patrimônio do silêncio.", "Colado com durex e muita convicção. Interditada outra vez."],
    });
  }
  p.poster("CULTO SUSPENSO POR DECRETO", small ? naveX0 + 150 : 168, "#fff4ce", "#b62f3e", 40, trancada);
  p.poster("REZE EM SILÊNCIO (E SEM CARIMBO)", small ? naveX1 - 150 : 432, "#1e1424", "#fffaf0", 40, trancada);
  p.poster("CULTO LIBERADO · ENTRADA FRANCA", small ? naveX0 + 150 : 168, "#fffaf0", "#1f8a4c", 40, aberta);
  p.poster("FÉ SEM PROTOCOLO", small ? naveX1 - 150 : 432, "#1e1424", "#fff4ce", 40, aberta);
  p.npc(
    small ? "cida" : "pastor",
    small ? "Dona Cida" : "Pastor Josué Aleluia",
    cx + (small ? 22 : 60),
    by + 90,
    small
      ? ["Entrei pela porta lateral. O decreto não fala dela!", "Aqui a fé é coletiva e o cadeado também."]
      : ["Entraste pela lateral? O Senhor também gosta de atalho.", "Hoje o sermão é sobre burocracia.", "Aquele decreto no mural da sacristia está colado com cuspe. Quem arranca, desinterdita."],
    { facing: "front", when: trancada },
  );
  p.npc(
    small ? "cida" : "pastor",
    small ? "Dona Cida" : "Pastor Josué Aleluia",
    cx + (small ? 22 : 60),
    by + 90,
    small ? ["As portas abriram! Vou chamar a vizinhança toda.", "Fé liberada: agora só falta liberar o estacionamento."] : ["Aleluia! A porta da frente voltou a ser porta.", "Hoje o sermão é sobre o decreto que caiu da parede."],
    { facing: "front", when: aberta },
  );
}

// ------------------------------------------------------------------ comércio

function mercado(p: Plan) {
  const { w, h } = p;
  const vx = 170;
  p.room("estoque", "Estoque", 0, p.wallH, vx, 330 - p.wallH, "concreto", "#b9b3a8");
  p.room("loja", "Mercadinho", vx, p.wallH, w - vx, h - p.wallH, "ceramica", p.r.pick(CERAMICA));
  p.room("frente", "Caixa", 0, 344, vx, h - 344, "ceramica", p.r.pick(CERAMICA));
  p.vwall(vx, p.wallH, 330, [[200, 76]]);
  p.hwall(330, 0, vx);
  const cols = [vx + 130, vx + 330];
  const prods = ["frutas", "enlatados", "limpeza", "biscoitos"];
  let k = 0;
  for (const y of [back(p) + 110, back(p) + 210]) for (const x of cols) if (x + 70 < w - 20) p.prop("gondola", x, y, { variant: prods[k++ % 4] });
  p.spot("examinar", cols[0], back(p) + 140, "Ler a etiqueta de preço", { lines: ["“Arroz: preço justo, decidido em assembleia”.", "Promoção: leve 2, pague o mesmo que todo mundo."] });
  const fz = p.prop("freezer", w - 70, back(p) + 4);
  p.spot("geladeira", w - 70, back(p) + 34, "Abrir o freezer", { prop: fz, lines: ["Picolé de cachaça? Não, é de limão. Infelizmente.", "Frango congelado com selo “do povo”."] });
  const cx = p.prop("caixaRegistradora", 90, h - 60);
  p.spot("registradora", 90, h - 30, "Usar a caixa registradora", { prop: cx, lines: ["Plim! Total: R$ 0,00 — tudo foi coletivizado.", "Plim! A nota fiscal sai com um decreto impresso."] });
  for (const [x, y] of [
    [40, back(p) + 4],
    [100, back(p) + 4],
    [60, back(p) + 70],
  ]) p.prop("caixaPapelao", x, y);
  p.spot("caixa", 60, back(p) + 100, "Abrir uma caixa do estoque", { lines: ["Uma caixa de caixas. Burocracia do estoque.", "Achei 200 pacotes de biscoito, ou bolacha. A polêmica continua."] });
  p.npc("m2", "Seu Kiko do caixa", 90, h - 96, ["Leva a sacola? É coletiva, depois devolve.", "Aqui o fiado é política pública."], { facing: "front", id: "kiko" });
  morador(p, cols[1], back(p) + 160, ["Cadê o feijão? Ah, foi redistribuído pro corredor 3."]);
  // hortifruti no canto da frente e quadro de ofertas
  const fruta = p.prop("gondola", w - 100, h - 80, { variant: "frutas" });
  p.spot("examinar", w - 100, h - 50, "Escolher uma fruta", { prop: fruta, lines: ["Banana por comitê, laranja por assembleia. A maçã está em greve.", "A etiqueta diz: “fruta de hoje, preço de ontem”."] });
  p.prop("caixaPapelao", w - 200, h - 40);
  p.prop("caixaPapelao", w - 30, h - 130);
  p.prop("quadroAvisos", w - 230, h - 100, { text: "OFERTA: ÁUDIO EM LATA, 3 POR 10" });
  p.prop("planta", vx + 30, h - 40);
  p.poster("KI-PREÇO: O PREÇO É DE TODOS", w / 2 + 80, "#fffaf0", "#e63946");
}

function padaria(p: Plan) {
  const { w, h } = p;
  const vx = w - 200;
  p.room("loja", "Padaria", 0, p.wallH, vx, h - p.wallH, "azulejo", p.r.pick(["#f4ead4", "#e9f0e6"]));
  p.room("forno", "Forno", vx, p.wallH, w - vx, h - p.wallH - 150, "concreto", "#c9c0b0");
  p.vwall(vx, p.wallH, h - 136, [[h - 240, 76]]);
  p.hwall(h - 150, vx, w);
  p.prop("vitrinePao", vx / 2, back(p) + 70);
  p.npc("m6", "Padeira Dona Rosinha", vx / 2, back(p) + 26, ["Pão francês, pão de queijo e pão coletivo.", "O sonho é de todos. O recheio, de quem chegar primeiro."], { facing: "front" });
  p.spot("campainha", vx / 2 + 100, back(p) + 98, "Pedir um pão na chapa", { lines: ["Saindo um pão na chapa presidencial!", "“Com manteiga coletiva?”"] });
  p.cachaca("Balcão da Padaria", vx / 2 - 100, back(p) + 98);
  const forno = p.prop("forno", vx + (w - vx) / 2, back(p) + 10);
  p.spot("fogao", vx + (w - vx) / 2, back(p) + 40, "Espiar o forno", { prop: forno, lines: ["Cheiro de pão quentinho com decreto assando.", "O forno é a lenha, a lenha é do povo."] });
  for (const x of [80, 220]) {
    p.prop("mesaBar", x, h - 70);
    p.prop("banqueta", x - 22, h - 60);
    p.prop("banqueta", x + 22, h - 60);
  }
  p.spot("sentar", 80, h - 34, "Sentar para um café", { seat: { x: 58, y: h - 66, facing: "front" } });
  p.prop("mesaBar", 360, h - 70);
  p.prop("banqueta", 338, h - 60);
  p.prop("banqueta", 382, h - 60);
  const prat = p.prop("gondola", 90, back(p) + 140, { variant: "biscoitos" });
  p.spot("examinar", 90, back(p) + 170, "Olhar os biscoitos", { prop: prat, lines: ["Biscoito ou bolacha? A assembleia ainda não decidiu.", "Pacote com selo: “crocante por decreto”."] });
  const cafe = p.prop("cafezinho", 250, back(p) + 130);
  p.spot("fogao", 250, back(p) + 160, "Servir um cafezinho", { prop: cafe, lines: ["Café coado no pano da coletividade.", "Um cafezinho por pessoa. Sem repetição, mas com fiado."] });
  p.prop("planta", vx - 36, h - 40);
  p.wallProp("relogio", 60);
  p.poster("PÃO DO POVO · SAI DE HORA EM HORA", vx / 2, "#fff4e0", "#9c4a1a");
}

function bar(p: Plan) {
  const { w, h } = p;
  const vx = w - 180;
  p.room("salao", "Salão do bar", 0, p.wallH, vx, h - p.wallH, "piso-bar", "#ffffff");
  p.room("cozinha", "Cozinha do bar", vx, p.wallH, w - vx, h - p.wallH - 160, "ceramica", p.r.pick(CERAMICA));
  p.vwall(vx, p.wallH, h - 146, [[h - 250, 76]]);
  p.hwall(h - 160, vx, w);
  p.wallProp("prateleira", vx / 2 - 30);
  p.prop("balcao", vx / 2 - 30, back(p) + 60);
  p.npc("tiao", "Tião do bar", vx / 2 - 10, back(p) + 22, ["Cachaça presidencial: combustível exclusivo deste desenho!", "Fiado? Neste Brasil, fiado é política pública."], { facing: "front", id: "tiao" });
  p.cachaca("Balcão do Tião", vx / 2 + 40, back(p) + 90);
  for (const x of [vx / 2 - 160, vx / 2 - 100, vx / 2 - 40]) p.prop("banqueta", x, back(p) + 90);
  p.spot("sentar", vx / 2 - 100, back(p) + 116, "Sentar no balcão", { seat: { x: vx / 2 - 100, y: back(p) + 84, facing: "back" } });
  const jb = p.prop("jukebox", 40, back(p) + 30);
  p.spot("jukebox", 70, back(p) + 56, "Escolher uma música", { prop: jb, lines: ["Toca “Cachaça não é água” em versão sertanejo estatal.", "A jukebox só aceita ficha coletiva."] });
  const tv = p.prop("tv", vx - 50, back(p) - 10, { variant: "parede" });
  p.spot("tv", vx - 50, back(p) + 30, "Mudar o canal da TV", { prop: tv, lines: ["Futebol: o juiz anulou o gol por decreto.", "Programa de auditório: “Quem quer ser coletivizado?”"] });
  for (const [x, y] of [
    [80, h - 110],
    [vx / 2 + 60, h - 90],
    [vx - 70, h - 140],
  ]) p.prop("mesaBar", x, y);
  p.npc("osvaldo", "Freguês fiel", vx - 70, h - 110, ["Eu vim só pra um gole. Faz três decretos."], { facing: "side", flip: true, id: "fregues" });
  const sinuca = p.prop("mesaPingPong", vx / 2 - 20, h - 210);
  p.spot("examinar", vx / 2 - 20, h - 170, "Jogar pingue-pongue de bar", { prop: sinuca, lines: ["Aposta de rodada: quem perde paga o fiado do outro.", "A bolinha caiu na cachaça. Ponto para o Tião."] });
  p.prop("mesaBar", vx - 190, h - 90);
  p.prop("banqueta", vx - 212, h - 80);
  p.prop("planta", 36, h - 40);
  p.prop("ventilador", vx - 30, h - 50);
  cozinha(p, vx + 8, w, p.wallH, h - 160, { mesa: false, filtro: false });
  p.poster("CACHAÇA PRESIDENCIAL", 120, "#fff4ce", "#c62835");
  p.poster("FIADO SÓ AMANHÃ", vx - 110, "#1e1424", "#fffaf0");
}

function farmacia(p: Plan) {
  const { w, h } = p;
  const vx = w - 170;
  p.room("loja", "Farmácia", 0, p.wallH, vx, h - p.wallH, "azulejo", "#e6f2ec");
  p.room("estoque", "Estoque de remédios", vx, p.wallH, w - vx, h - p.wallH - 150, "concreto", "#c4c9c2");
  p.vwall(vx, p.wallH, h - 136, [[h - 240, 76]]);
  p.hwall(h - 150, vx, w);
  fileira(p, "estante", 70, vx - 70, back(p, undefined, 24), 100, () => "remedios");
  p.spot("examinar", 120, back(p) + 50, "Ler a bula", { lines: ["“Xarope Anticorrente: tomar 3 vezes ao dia, sem compartilhar áudio.”", "Efeitos colaterais: vontade de repassar mensagem."] });
  p.prop("balcao", vx / 2, back(p) + 160);
  const cx = p.prop("caixaRegistradora", 110, h - 60);
  p.spot("registradora", 110, h - 30, "Pagar no caixa", { prop: cx, lines: ["Desconto coletivo: todo mundo paga o preço médio.", "Plim! Brinde: um band-aid estatal."] });
  p.npc("m5", "Farmacêutica Drª Sueli", vx / 2, back(p) + 122, ["Remédio para áudio de 3 minutos? Só com receita do Ministério.", "Aqui tem vitamina C de Coletiva."], { facing: "front" });
  const gel = p.prop("geladeira", vx + 60, back(p), { variant: "branca" });
  p.spot("geladeira", vx + 60, back(p) + 30, "Abrir a geladeira de vacinas", { prop: gel, lines: ["Vacinas, insulina e um picolé esquecido.", "Etiqueta: “vacina contra corrente do zap, em teste”."] });
  fileira(p, "caixaPapelao", vx + 40, w - 40, h - 180, 50);
  p.prop("planta", 40, h - 40);
  // espera: cadeiras, totem de senha e bebedouro
  cadeiras(p, 180, 3, h - 70, 36);
  p.spot("sentar", 180, h - 46, "Sentar e esperar", { seat: { x: 180, y: h - 76, facing: "front" } });
  const tt = p.prop("totemSenha", vx - 70, h - 90);
  p.spot("senha", vx - 70, h - 62, "Tirar uma senha", { prop: tt, lines: ["Senha 0042. Atendimento previsto antes da próxima epidemia.", "A senha vem com um conselho: “não repasse”."] });
  p.prop("bebedouro", vx - 36, h - 70);
}

function lanchonete(p: Plan, cantina: boolean) {
  const { w, h } = p;
  const vx = w - 190;
  p.room("salao", cantina ? "Cantina" : "Lanchonete", 0, p.wallH, vx, h - p.wallH, "ceramica", p.r.pick(CERAMICA));
  p.room("cozinha", "Cozinha", vx, p.wallH, w - vx, h - p.wallH - 150, "azulejo", "#f0ebe0");
  p.vwall(vx, p.wallH, h - 136, [[h - 240, 76]]);
  p.hwall(h - 150, vx, w);
  p.prop("balcao", vx / 2, back(p) + 60);
  p.npc(cantina ? "m7" : "m3", cantina ? "Tia da cantina" : "Pasteleiro Seu Wong", vx / 2, back(p) + 22, cantina ? ["Hoje tem coxinha de assembleia.", "Merenda repetida para todos, por decreto."] : ["Pastel de vento? Aqui é de fofoca: o recheio chega antes do pastel.", "Caldo de cana coletivo: uma garapa para todos."], { facing: "front" });
  if (cantina) p.cachaca("Cantina do DCE", vx / 2 + 100, back(p) + 90);
  const fr = p.prop("fritadeira", vx + (w - vx) / 2, back(p));
  p.spot("fogao", vx + (w - vx) / 2, back(p) + 30, cantina ? "Fritar uma coxinha" : "Fritar um pastel", { prop: fr, lines: ["Chiiii… o pastel inflou de orgulho.", "Fritura saindo. O óleo também é do povo."] });
  const fz = p.prop("freezer", vx - 70, h - 50);
  p.spot("geladeira", vx - 70, h - 20, "Pegar um refrigerante", { prop: fz, lines: ["Guaraná coletivo: um gole para cada.", "Só tem refri de laranja. Laranja por comitê."] });
  for (const x of [80, 220]) {
    p.prop("mesa", x, h - 80, { variant: "toalha-xadrez" });
    p.prop("cadeira", x - 40, h - 84);
    p.prop("cadeira", x + 40, h - 84);
  }
  p.spot("sentar", 40, h - 58, "Sentar à mesa", { seat: { x: 40, y: h - 90, facing: "front" } });
  if (cantina) {
    const pp = p.prop("mesaPingPong", vx / 2 + 40, h - 170);
    p.spot("examinar", vx / 2 + 40, h - 130, "Jogar pingue-pongue", { prop: pp, lines: ["Placar coletivo: todo mundo ganhou.", "A raquete tem adesivo do DCE."] });
  }
  p.poster(cantina ? "CANTINA DO DCE · COXINHA LIVRE" : "PASTEL DO POVO · 1 PASTEL, 1 FOFOCA", vx / 2, "#ffffff", cantina ? "#3a86c8" : "#e85d04");
}

function loterica(p: Plan) {
  const { w, h } = p;
  p.room("salao", "Lotérica", 0, p.wallH, w, h - p.wallH, "ceramica", p.r.pick(CERAMICA));
  p.prop("guiche", w / 2 - 110, back(p) + 50, { variant: "APOSTAS" });
  p.prop("guiche", w / 2 + 110, back(p) + 50, { variant: "CONTAS" });
  p.npc("func3", "Atendente da Lotérica", w / 2 - 110, back(p) + 12, ["Mega-Palpite acumulado! O prêmio é dividido entre todos.", "Aposta mínima: um palpite."], { facing: "front" });
  const painel = p.wallProp("painelLoteria", w / 2);
  p.spot("examinar", w / 2, back(p) + 120, "Conferir os números", { prop: painel, lines: ["Resultado: 13, 13, 13, 13, 13, 13. Todo mundo acertou.", "Sorteio adiado: o globo foi coletivizado."] });
  p.prop("mesa", 80, h - 120, { variant: "volantes" });
  p.spot("registradora", 80, h - 90, "Preencher um volante", { lines: ["Marquei todos os números. Por solidariedade.", "“Bolão do bairro”: o bairro inteiro entrou."] });
  cadeiras(p, w - 250, 3, h - 70, 36);
  p.spot("sentar", w - 250, h - 46, "Sentar na fila", { seat: { x: w - 250, y: h - 76, facing: "back" } });
  for (let x = w / 2 - 170; x <= w / 2 - 60; x += 36) p.prop("balizaFila", x, back(p) + 150, { variant: x < w / 2 - 80 ? "fita" : undefined });
  for (let x = w / 2 + 60; x <= w / 2 + 170; x += 36) p.prop("balizaFila", x, back(p) + 150, { variant: x < w / 2 + 130 ? "fita" : undefined });
  p.prop("totemSenha", 190, h - 80);
  p.prop("planta", 36, h - 40);
  morador(p, w - 90, h - 110, ["Jogo no palpite da semana desde 1994.", "Se eu ganhar, divido com o país. Obrigatório."]);
  p.poster("MEGA-PALPITE ACUMULADO", 110, "#ffffff", "#2a6fdb");
}

function shopping(p: Plan) {
  const { w, h } = p;
  const vx = w - 200;
  p.room("corredor", "Corredor do Shopping Popular", 0, p.wallH, vx, h - p.wallH, "marmore", "#efe8f4");
  p.room("adm", "Administração", vx, p.wallH, w - vx, h - p.wallH - 180, "carpete", "#6b5a8a");
  p.vwall(vx, p.wallH, h - 166, [[h - 270, 76]]);
  p.hwall(h - 180, vx, w);
  const lojas = ["ROUPA DO POVO", "CELULAR COLETIVO", "BRINQUEDOS"];
  lojas.forEach((t, i) => {
    const x = 120 + i * ((vx - 240) / 2);
    const id = p.prop("lojinha", x, back(p) + 40, { variant: ["rosa", "azul", "amarelo"][i], text: t });
    if (i === 1) p.spot("examinar", x, back(p) + 70, "Olhar a vitrine", { prop: id, lines: ["Celular com plano coletivo: todo mundo ouve suas ligações.", "Capinha com estampa de decreto."] });
  });
  const esc = p.prop("escadaRolante", vx - 60, h - 30);
  p.spot("examinar", vx - 120, h - 60, "Subir na escada rolante", { prop: esc, lines: ["Parada desde a inauguração. Mas é rolante em espírito.", "A escada só sobe em assembleia."] });
  for (const x of [120, 260]) {
    p.prop("mesa", x, h - 90, { variant: "praca" });
    p.prop("cadeira", x - 40, h - 94);
    p.prop("cadeira", x + 40, h - 94);
  }
  p.spot("sentar", 80, h - 68, "Sentar na praça de alimentação", { seat: { x: 80, y: h - 100, facing: "front" } });
  p.prop("planta", vx / 2 + 60, h - 120);
  p.prop("banco", vx / 2 - 150, h - 250);
  p.prop("banco", vx / 2 + 110, h - 250);
  p.prop("planta", vx / 2 - 20, h - 250);
  const pipoca = p.prop("carrinhoPipoca", 150, back(p) + 190);
  p.spot("caixa", 150, back(p) + 220, "Comprar pipoca", { prop: pipoca, lines: ["Pipoca doce ou salgada? Pipoca coletiva: meio a meio.", "Cada saquinho vem com uma fofoca de brinde."] });
  const cf = p.prop("cafezinho", vx - 130, back(p) + 190);
  p.spot("fogao", vx - 130, back(p) + 220, "Servir um cafezinho", { prop: cf, lines: ["O café do shopping é o único serviço rápido da cidade.", "Cafezinho gelado: já nasceu frio, por decreto."] });
  const m = mesaTrabalho(p, vx + (w - vx) / 2, back(p) + 80, "computador");
  p.spot("computador", vx + (w - vx) / 2, back(p) + 106, "Ver as câmeras do shopping", { prop: m, lines: ["Câmera 3: um cidadão provando todas as roupas coletivas.", "Câmera 7: o camelô Dinho vendendo kit anticorrente."] });
  morador(p, vx / 2, h - 170, ["Vim só olhar. Olhar é de graça e é de todos.", "O ar-condicionado é o melhor serviço público."]);
  p.poster("SHOPPING POPULAR · LIQUIDAÇÃO COLETIVA", vx / 2, "#ffd23f", "#7b4bd1");
}

function oficina(p: Plan, borracharia: boolean) {
  const { w, h } = p;
  const vx = w - 170;
  p.room("servico", borracharia ? "Área de serviço" : "Oficina", 0, p.wallH, vx, h - p.wallH, "concreto", "#a9a39a");
  p.room("escritorio", "Escritório", vx, p.wallH, w - vx, h - p.wallH - 160, "taco", p.r.pick(MADEIRA));
  p.vwall(vx, p.wallH, h - 146, [[h - 250, 76]]);
  p.hwall(h - 160, vx, w);
  const carro = p.prop("carroOficina", vx / 2, back(p) + 130, { variant: p.r.pick(["azul", "verde", "amarelo"]) });
  p.spot("examinar", vx / 2 + 110, back(p) + 140, "Espiar o motor", { prop: carro, lines: ["O motor é a álcool. A cachaça não serve, já testaram.", "Diagnóstico: o carro está com saudade da estrada."] });
  p.wallProp("painelFerramentas", vx / 2 - 60);
  const comp = p.prop("compressor", 50, back(p) + 4);
  p.spot("maquina", 50, back(p) + 34, borracharia ? "Encher um pneu" : "Ligar o compressor", { prop: comp, lines: ["Fssss! Pneu calibrado com ar do povo.", "O compressor tosse e pega no tranco."] });
  const n = borracharia ? 4 : 2;
  for (let i = 0; i < n; i++) p.prop("pneus", 60 + i * 40, h - 60);
  const rad = p.prop("radio", vx - 50, back(p));
  p.spot("radio", vx - 50, back(p) + 28, "Ligar o rádio da oficina", { prop: rad, lines: ["Jogo do Coletivo FC no rádio de pilha.", "A rádio toca sertanejo estatal."] });
  mesaTrabalho(p, vx + (w - vx) / 2, back(p) + 80, "telefone");
  p.spot("telefone", vx + (w - vx) / 2, back(p) + 106, "Atender o telefone", { lines: ["“Oficina do Zé, pois não? O carro é seu ou é do povo?”", "“Borracharia 24h: 24 horas de fila.”"] });
  p.npc(borracharia ? "zeca" : "func1", borracharia ? "Borracheiro Seu Nego" : "Mecânico Zé", vx / 2 - 140, back(p) + 160, borracharia ? ["Remendo pneu, câmara e fofoca furada.", "Pneu careca? Aqui é coletivo, troca com o vizinho."] : ["Troquei o óleo por óleo coletivo.", "Tá vendo essa peça? Nem eu."], { facing: "front" });
  p.poster(borracharia ? "BORRACHARIA 24H" : "OFICINA DO ZÉ · CONSERTA ATÉ DECRETO", vx / 2, "#f1faee", "#1d3557");
}

// ------------------------------------------------------------------ educação

function escola(p: Plan) {
  const { w, h } = p;
  const hy = 340;
  const a = Math.round(w / 3);
  p.room("sala-1", "Sala 1 · Matemática Coletiva", 0, p.wallH, a, hy - p.wallH, "taco", p.r.pick(MADEIRA));
  p.room("sala-2", "Sala 2 · História Hipotética", a, p.wallH, a, hy - p.wallH, "taco", p.r.pick(MADEIRA));
  p.room("merenda", "Refeitório da Merenda", 2 * a, p.wallH, w - 2 * a, hy - p.wallH, "ceramica", p.r.pick(CERAMICA));
  p.room("corredor", "Corredor", 0, hy + 14, w, h - hy - 14, "ladrilho", p.r.pick(LADRILHO));
  p.hwall(hy, 0, w, [
    [a / 2 - 40, 80],
    [a + a / 2 - 40, 80],
    [2 * a + (w - 2 * a) / 2 - 40, 80],
  ]);
  p.vwall(a, p.wallH, hy);
  p.vwall(2 * a, p.wallH, hy);
  for (const [x0, text] of [
    [0, "2 + 2 = DECRETO"],
    [a, "1500: O ÁUDIO DESCOBRE O BRASIL"],
  ] as const) {
    const lousa = p.wallProp("lousa", x0 + a / 2, { text });
    p.spot("examinar", x0 + a / 2 - 120, back(p) + 30, "Ler a lousa", { prop: lousa, lines: ["Lição de casa: repassar um áudio com responsabilidade.", "Tabuada coletiva: toda conta dá o mesmo resultado."] });
    p.prop("mesa", x0 + a / 2 + 90, back(p) + 30, { variant: "professor" });
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) p.prop("carteira", x0 + 70 + c * ((a - 140) / 2), back(p) + 110 + r * 64);
  }
  p.spot("sentar", 70, back(p) + 196, "Sentar na carteira", { seat: { x: 70, y: back(p) + 168, facing: "back" } });
  p.prop("mesa", 2 * a + (w - 2 * a) / 2, back(p) + 120, { variant: "comprida" });
  const fogao = p.prop("fogao", w - 60, back(p), { variant: "industrial" });
  p.spot("fogao", w - 60, back(p) + 30, "Mexer o panelão da merenda", { prop: fogao, lines: ["Macarrão com salsicha: repetição para todos.", "A merendeira grita: “fila!”"] });
  p.npc("m6", "Merendeira Dona Ivone", w - 130, back(p) + 4, ["Merenda coletiva: quem repete, repete para todos.", "Hoje tem bolo de fubá do Ministério."], { facing: "front" });
  // corredor
  p.prop("caixasKits", w / 2 + 160, h - 60);
  p.prop("caixasKits", w / 2 + 230, h - 50);
  p.spot("caixa", w / 2 + 195, h - 24, "Abrir uma caixa colorida", { lines: ["Kit escolar: lápis de cor, cartilha e um áudio desmentido.", "Só tem massinha de modelar. O zap exagerou."] });
  p.prop("bebedouro", 60, hy + 64);
  p.spot("torneira", 60, hy + 92, "Beber água no bebedouro", { lines: ["Água gelada e um aviso: “não desperdice, é do povo”.", "O bebedouro solta um jato no seu nariz."] });
  p.prop("quadroAvisos", w - 200, hy + 60, { text: "FEIRA DE CIÊNCIAS: O ÁUDIO É SÓLIDO, LÍQUIDO OU GASOSO?" });
  p.npc("diretora", "Diretora Clarice", w - 120, h - 90, ["O almoxarifado não estava preparado para esse áudio.", "Tem caixa colorida até no corredor!"], { facing: "front" });
}

function universidade(p: Plan) {
  const { w, h } = p;
  const hy = 380;
  const xs = [0, Math.round(w * 0.25), Math.round(w * 0.58), Math.round(w * 0.8), w];
  p.room("aula", "Sala de aula", xs[0], p.wallH, xs[1], hy - p.wallH, "taco", p.r.pick(MADEIRA));
  p.room("auditorio", "Auditório da Assembleia Permanente", xs[1], p.wallH, xs[2] - xs[1], hy - p.wallH, "carpete", "#7b4bd1");
  p.room("dce", "DCE · Convivência", xs[2], p.wallH, xs[3] - xs[2], hy - p.wallH, "ladrilho", p.r.pick(LADRILHO));
  p.room("reitoria", "Reitoria", xs[3], p.wallH, xs[4] - xs[3], hy - p.wallH, "taco", p.r.pick(MADEIRA));
  p.room("corredor", "Corredor central", 0, hy + 14, w, h - hy - 14, "marmore", "#efeae0");
  p.hwall(hy, 0, w, [0, 1, 2, 3].map((i) => [(xs[i] + xs[i + 1]) / 2 - 45, 90] as [number, number]));
  for (const x of xs.slice(1, 4)) p.vwall(x, p.wallH, hy);
  // sala
  p.wallProp("lousa", xs[1] / 2, { text: "TESE: O ÁUDIO DO GRUPO COMO FONTE PRIMÁRIA" });
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) p.prop("carteira", 60 + c * ((xs[1] - 120) / 2), back(p) + 120 + r * 70);
  p.spot("sentar", 60, back(p) + 212, "Sentar na carteira", { seat: { x: 60, y: back(p) + 182, facing: "back" } });
  // auditório
  const am = (xs[1] + xs[2]) / 2;
  const pul = p.prop("pulpito", am, back(p) + 40);
  p.spot("examinar", am, back(p) + 70, "Discursar na assembleia", { prop: pul, lines: ["“Companheiros! Proponho uma assembleia sobre a assembleia!”", "Aprovado por aclamação. Ninguém sabe o quê."] });
  for (let r = 0; r < 2; r++) cadeiras(p, am - 150, 7, back(p) + 140 + r * 60, 50, "cadeira");
  // DCE
  const dm = (xs[2] + xs[3]) / 2;
  const pp = p.prop("mesaPingPong", dm, back(p) + 150);
  p.spot("examinar", dm, back(p) + 190, "Jogar pingue-pongue", { prop: pp, lines: ["Placar: DCE 21 × Reitoria 21. Empate político.", "A bolinha foi parar no auditório."] });
  p.cachaca("Geladeira do DCE", xs[2] + 40, back(p) + 30);
  p.prop("geladeira", xs[2] + 40, back(p), { variant: "vermelha" });
  const som = p.prop("caixaSom", xs[3] - 40, back(p));
  p.spot("radio", xs[3] - 40, back(p) + 30, "Ligar o som do DCE", { prop: som, lines: ["Toca o samba-enredo da greve.", "Funk acadêmico: “vai, tese, vai”."] });
  // reitoria
  const rm = (xs[3] + xs[4]) / 2;
  const mesa = mesaTrabalho(p, rm, back(p) + 90, "computador");
  p.spot("computador", rm, back(p) + 116, "Assinar um diploma digital", { prop: mesa, lines: ["Diploma emitido: “Doutor em Grupos de Família”.", "O sistema da reitoria trava por assembleia."] });
  p.prop("bandeira", xs[3] + 40, back(p));
  p.npc("reitora", "Reitora Vera", rm - 50, back(p) + 150, ["Aqui até o absurdo precisa de assinatura.", "Universidade do Pânico: formada nos grupos de família."], { facing: "front" });
  // corredor (estado do campus, quando o prédio tem um: liberou geral ou expediente normal)
  const campus = p.b.place;
  if (campus) {
    p.prop("barracaCamping", 160, h - 70, { variant: "laranja", when: { place: campus, state: "liberou-geral" } });
    p.prop("barracaCamping", 260, h - 60, { variant: "azul", when: { place: campus, state: "liberou-geral" } });
    p.prop("caixaSom", 340, h - 70, { when: { place: campus, state: "liberou-geral" } });
    p.prop("planta", 200, h - 60, { when: { place: campus, state: "normal" } });
  } else p.prop("planta", 200, h - 60);
  p.prop("quadroAvisos", w - 260, hy + 60, { text: "CALOURADA PERMANENTE · INSCRIÇÕES ABERTAS DESDE 1968" });
  p.spot("examinar", w - 260, hy + 90, "Ler os cartazes", { lines: ["“Grupo de estudos sobre o grupo de estudos.”", "“Vendo apostila usada (por todos).”"] });
  p.prop("bebedouro", w - 60, h - 70);
  p.npc("func3", "Estudante do DCE", w / 2, h - 120, ["Hoje tem assembleia, festa e assembleia da festa.", "Minha tese é sobre a fofoca do bandejão."], { facing: "side", route: [{ x: w / 2 - 260, y: h - 120 }, { x: w / 2 + 260, y: h - 120 }] });
}

function biblioteca(p: Plan) {
  const { w, h } = p;
  const vx = w - 200;
  p.room("salao", "Salão de leitura", 0, p.wallH, vx, h - p.wallH, "taco", p.r.pick(MADEIRA));
  p.room("acervo", "Acervo do Zap", vx, p.wallH, w - vx, h - p.wallH - 170, "carpete", "#3a6b5a");
  p.vwall(vx, p.wallH, h - 156, [[h - 260, 76]]);
  p.hwall(h - 170, vx, w);
  fileira(p, "estante", 70, vx - 70, back(p, undefined, 24), 104, () => "livros");
  for (const x of [vx / 2 - 140, vx / 2 + 60]) p.prop("estante", x, back(p) + 140, { variant: "livros" });
  p.spot("livro", vx / 2 - 140, back(p) + 166, "Ler um livro", { lines: ["“Dom Casmurro coletivo”: Capitu é de todos.", "“O Áudio Ilustrado”, 3ª edição revisada pelo zap."] });
  p.prop("mesa", 120, h - 80, { variant: "madeira" });
  p.prop("cadeira", 80, h - 84);
  p.prop("cadeira", 160, h - 84);
  p.spot("sentar", 80, h - 58, "Sentar para ler", { seat: { x: 80, y: h - 90, facing: "front" } });
  p.prop("balcao", vx / 2 + 60, h - 60);
  p.npc("m8", "Bibliotecária Dona Iracema", vx / 2 + 60, h - 100, ["Shhh! Aqui até o áudio do zap fala baixo.", "Empréstimo coletivo: o livro volta quando todos lerem."], { facing: "front" });
  p.spot("campainha", vx / 2 + 180, h - 34, "Tocar a sineta do balcão", { lines: ["Plim! “Shhh!” responde a sala inteira.", "A sineta toca em volume de biblioteca."] });
  fileira(p, "arquivo", vx + 40, w - 40, back(p), 50);
  p.spot("armario", vx + 60, back(p) + 30, "Abrir o fichário", { lines: ["Ficha 001: “O áudio sobre o áudio”. Emprestado.", "Ficha de leitor: todos os moradores, sem multa."] });
  p.poster("LEITURA LIVRE · LIVRO É DE TODOS", vx / 2, "#ffffff", "#3a6b5a");
}

// ------------------------------------------------------------------ indústria e terminal

function fabrica(p: Plan) {
  const { w, h } = p;
  const vx = w - 260;
  p.room("producao", "Linha de produção", 0, p.wallH, vx, h - p.wallH, "concreto", "#b3ada2");
  p.room("refeitorio", "Refeitório dos operários", vx, p.wallH, w - vx, h - p.wallH - 180, "ceramica", p.r.pick(CERAMICA));
  p.vwall(vx, p.wallH, h - 166, [[h - 270, 76]]);
  p.hwall(h - 180, vx, w);
  p.prop("esteira", vx / 2 - 30, back(p) + 120);
  const m1 = p.prop("maquina", 120, back(p) + 30, { variant: "prensa" });
  p.prop("maquina", vx - 140, back(p) + 30, { variant: "embaladora" });
  p.spot("maquina", 120, back(p) + 60, "Acionar a prensa", { prop: m1, lines: ["PLOFT! Saiu uma estrela de lata para cada cidadão.", "A prensa carimbou “FEITO PELO POVO” no ar."] });
  const ponto = p.wallProp("relogio", vx / 2 - 30, { variant: "ponto" });
  p.spot("carimbo", vx / 2 - 30, back(p) + 30, "Bater o ponto", { prop: ponto, lines: ["Ponto batido: entrada às 8h, saída coletiva.", "O relógio de ponto também tem folga no aniversário."] });
  for (const [x, y] of [
    [80, h - 80],
    [140, h - 70],
    [vx - 120, h - 90],
  ]) p.prop("caixaPapelao", x, y);
  p.prop("palete", vx / 2 - 40, h - 70);
  p.spot("caixa", 110, h - 44, "Abrir uma caixa da produção", { lines: ["Dentro: 500 bandeirinhas e um manual de felicidade.", "Produto: “Áudio enlatado”. Validade: até o próximo áudio."] });
  p.prop("mesa", vx + (w - vx) / 2, back(p) + 100, { variant: "comprida" });
  cadeiras(p, vx + (w - vx) / 2 - 60, 4, back(p) + 140, 40, "cadeira");
  p.spot("sentar", vx + (w - vx) / 2 - 60, back(p) + 164, "Sentar no refeitório", { seat: { x: vx + (w - vx) / 2 - 60, y: back(p) + 134, facing: "back" } });
  p.prop("filtro", w - 40, back(p) - 6);
  p.npc("func1", "Operário Jair", vx / 2 - 30, back(p) + 170, ["Linha de produção do povo: cada um aperta um parafuso.", "Hoje a meta é produzir orgulho."], { facing: "front" });
  p.poster("PRODUÇÃO DO POVO, PELO POVO, PARA A CHINA", vx / 2 - 30, "#fffaf0", "#b5523b");
}

function galpao(p: Plan, variante: "galpao" | "armazem" | "almoxarifado" | "deposito-kits") {
  const { w, h } = p;
  const vx = w - 190;
  const names: Record<typeof variante, string> = { galpao: "Galpão", armazem: "Armazém de exportação", almoxarifado: "Almoxarifado", "deposito-kits": "Depósito de kits" };
  p.room("deposito", names[variante], 0, p.wallH, vx, h - p.wallH, "concreto", variante === "deposito-kits" ? "#c8c0dc" : "#b0aaa0");
  p.room("escritorio", "Escritório", vx, p.wallH, w - vx, h - p.wallH - 170, "taco", p.r.pick(MADEIRA));
  p.vwall(vx, p.wallH, h - 156, [[h - 260, 76]]);
  p.hwall(h - 170, vx, w);
  if (variante === "deposito-kits") {
    const when = { place: "deposito-kits", state: "abastecido" };
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) p.prop("caixasKits", 80 + c * ((vx - 160) / 3), back(p) + 40 + r * 90, { when });
    p.prop("palete", vx / 2, back(p) + 110, { when: { place: "deposito-kits", state: "vazio" } });
    p.spot("caixa", 80, back(p) + 70, "Abrir uma caixa colorida", { lines: ["Kit completo: lápis de cor, cola e uma cartilha de boas maneiras.", "O zap prometia mais. É só material escolar."] });
    p.poster("ESTOQUE DE KITS · CORES DO POVO", vx / 2, "#fff4ce", "#6746a0");
  } else if (variante === "armazem") {
    const cores = ["vermelho", "azul", "verde", "amarelo"];
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) p.prop("conteiner", 110 + c * ((vx - 220) / 2), back(p) + 70 + r * 120, { variant: cores[(r + c) % 4] });
    p.spot("caixa", 110, back(p) + 110, "Espiar um contêiner", { lines: ["Etiqueta: “Um pedaço do Brasil · frágil”.", "Dentro: saudade embalada a vácuo."] });
    p.poster("BRASIL → CHINA · FRETE GRÁTIS", vx / 2, "#fff4ce", "#d1453b");
  } else {
    const rows = variante === "almoxarifado" ? 2 : 3;
    for (let r = 0; r < rows; r++) p.prop("portaPaletes", vx / 2, back(p) + 50 + r * 110, { variant: variante === "almoxarifado" ? "pecas" : "caixas" });
    p.spot("caixa", vx / 2 + 140, back(p) + 70, variante === "almoxarifado" ? "Requisitar uma peça" : "Abrir uma caixa", {
      lines: variante === "almoxarifado" ? ["Requisição nº 4.002: um parafuso. Prazo: 90 dias úteis.", "O almoxarife entrega o parafuso embrulhado em decreto."] : ["Caixa de caixas vazias. Estoque estratégico.", "Etiqueta: “bem do povo · não abrir · abra”."],
    });
    p.poster(variante === "almoxarifado" ? "REQUISIÇÃO SÓ COM 3 CARIMBOS" : "GALPÃO COLETIVO · TUDO TEM DONO: TODOS", vx / 2, "#fffaf0", "#55555c");
  }
  const emp = p.prop("empilhadeira", vx - 70, h - 60);
  p.spot("maquina", vx - 70, h - 30, "Buzinar a empilhadeira", { prop: emp, lines: ["Bi-bi! A empilhadeira empilha decretos.", "A empilhadeira só anda em fila indiana."] });
  const m = mesaTrabalho(p, vx + (w - vx) / 2, back(p) + 80, variante === "almoxarifado" ? "carimbo" : "computador");
  p.spot(variante === "almoxarifado" ? "carimbo" : "computador", vx + (w - vx) / 2, back(p) + 106, variante === "almoxarifado" ? "Carimbar uma requisição" : "Conferir o estoque", {
    prop: m,
    lines: ["Estoque: 1 de tudo. Para todos.", "Inventário: “desconhecido, mas coletivo”."],
  });
  p.prop("radio", 50, h - 60);
  p.spot("radio", 50, h - 32, "Ligar o rádio do galpão", { lines: ["Rádio Coletiva FM: hora do trabalhador.", "A previsão do tempo é decidida em assembleia."] });
  p.npc(variante === "deposito-kits" ? "diretora" : "func4", variante === "deposito-kits" ? "Diretora Clarice" : "Encarregada Rose", vx / 2 + 60, h - 110, variante === "deposito-kits" ? ["Caixa colorida até no teto!", "Conferi tudo: é material escolar mesmo."] : ["Galpão do povo: entra, olha, não leva.", "Organizado por ordem de carimbo."], { facing: "front" });
}

function alfandega(p: Plan) {
  const { w, h } = p;
  const vx = w - 200;
  p.room("controle", "Controle alfandegário", 0, p.wallH, vx, h - p.wallH, "piso-reparticao", "#e8e1c8");
  p.room("apreendidos", "Objetos apreendidos", vx, p.wallH, w - vx, h - p.wallH - 170, "concreto", "#b5ae9e");
  p.vwall(vx, p.wallH, h - 156, [[h - 260, 76]]);
  p.hwall(h - 170, vx, w);
  const rx = p.prop("raioX", vx / 2 - 60, back(p) + 120);
  p.spot("maquina", vx / 2 + 40, back(p) + 150, "Passar a mala no raio-x", { prop: rx, lines: ["Raio-x: uma mala com o Pantanal dobrado dentro.", "Alerta! Excesso de bagagem: o país inteiro."] });
  p.prop("guiche", vx / 2 + 120, back(p) + 50, { variant: "CARIMBO" });
  p.npc("despachante", "Despachante do Impossível", vx / 2 + 120, back(p) + 12, ["Pra China? Trouxe o Brasil bem embalado?", "Frete internacional. O país inteiro paga excesso de bagagem."], { facing: "front" });
  p.spot("carimbo", vx / 2 + 210, back(p) + 82, "Carimbar o passaporte do país", { lines: ["CARIMBADO: “Brasil — saída autorizada”.", "VISTO NEGADO: o áudio não tem passaporte."] });
  cadeiras(p, 70, 4, h - 70, 36);
  p.spot("sentar", 70, h - 46, "Sentar na espera", { seat: { x: 70, y: h - 76, facing: "front" } });
  fileira(p, "caixaPapelao", vx + 40, w - 40, back(p), 50);
  p.spot("caixa", vx + 70, back(p) + 30, "Ver os objetos apreendidos", { lines: ["Apreendido: um pandeiro sem nota fiscal.", "Apreendido: 3 toneladas de saudade."] });
  p.poster("ALFÂNDEGA DO IMPOSSÍVEL", vx / 2, "#1e1424", "#f2c230");
}

function despacho(p: Plan) {
  const { w, h } = p;
  p.room("controle", "Sala de controle", 0, p.wallH, w, h - p.wallH, "piso-reparticao", "#d9d4c8");
  const telao = p.wallProp("telao", w / 2, { text: "NAVIO DESTINO CHINA · CARGA: O BRASIL" });
  p.spot("tv", w / 2 + 150, back(p) + 30, "Trocar a câmera do cais", { prop: telao, lines: ["Câmera 2: o guindaste levando o Nordeste.", "Câmera 5: uma gaivota fiscalizando."] });
  const painel = p.prop("painelControle", w / 2, back(p) + 120);
  p.spot("computador", w / 2, back(p) + 146, "Acompanhar o despacho", { prop: painel, lines: ["Status: Brasil 37% embarcado.", "Alerta: a Amazônia não cabe no contêiner padrão."] });
  const rad = p.prop("radio", 60, back(p));
  p.spot("radio", 60, back(p) + 28, "Chamar o navio no rádio", { prop: rad, lines: ["“Navio, câmbio! Faltou embarcar o carnaval!”", "“Aqui é o despacho. O país está pronto para o frete.”"] });
  p.wallProp("janela", 120);
  p.wallProp("janela", w - 120);
  p.prop("cadeira", w / 2 - 40, back(p) + 90, { variant: "escritorio" });
  p.npc("func3", "Controlador de despacho", w / 2 + 50, back(p) + 86, ["O país inteiro numa planilha de carga.", "Cuidado: o Pão de Açúcar está escorregando."], { facing: "front", id: "controlador" });
  p.prop("filtro", w - 40, h - 50);
}

export const MODELS: Record<TemplateId, ModelSpec> = {
  casa: { size: (bw, r) => ({ w: r.pick([640, 680, 720]) + (bw > 180 ? 40 : 0), h: 480 }), build: casa, flip: true },
  republica: { size: () => ({ w: 700, h: 480 }), build: republica, flip: true },
  conjunto: { size: () => ({ w: 840, h: 640 }), build: conjunto, flip: true },
  associacao: { size: () => ({ w: 800, h: 520 }), build: associacao, flip: true },
  prefeitura: { size: () => ({ w: 1200, h: 640, wallH: 104 }), build: prefeitura },
  ministerio: { size: () => ({ w: 1080, h: 620, wallH: 104 }), build: ministerio },
  reparticao: { size: () => ({ w: 820, h: 520 }), build: reparticao },
  secretaria: { size: () => ({ w: 720, h: 500 }), build: secretaria, flip: true },
  imprensa: { size: () => ({ w: 740, h: 500 }), build: imprensa, flip: true },
  banco: { size: () => ({ w: 760, h: 500 }), build: banco, flip: true },
  igreja: { size: () => ({ w: 800, h: 660, wallH: 112 }), build: (p) => igreja(p, false) },
  capela: { size: () => ({ w: 680, h: 540, wallH: 104 }), build: (p) => igreja(p, true) },
  mercado: { size: (bw) => ({ w: clampW(bw, 3.8, 700, 820), h: 500 }), build: mercado, flip: true },
  padaria: { size: () => ({ w: 700, h: 480 }), build: padaria, flip: true },
  bar: { size: () => ({ w: 760, h: 500 }), build: bar },
  farmacia: { size: () => ({ w: 660, h: 480 }), build: farmacia, flip: true },
  lanchonete: { size: () => ({ w: 680, h: 470 }), build: (p) => lanchonete(p, false), flip: true },
  cantina: { size: () => ({ w: 720, h: 500 }), build: (p) => lanchonete(p, true), flip: true },
  loterica: { size: () => ({ w: 640, h: 450 }), build: loterica, flip: true },
  shopping: { size: () => ({ w: 1000, h: 620 }), build: shopping },
  oficina: { size: () => ({ w: 720, h: 500 }), build: (p) => oficina(p, false), flip: true },
  borracharia: { size: () => ({ w: 720, h: 500 }), build: (p) => oficina(p, true), flip: true },
  escola: { size: () => ({ w: 1020, h: 620 }), build: escola },
  universidade: { size: () => ({ w: 1320, h: 680, wallH: 104 }), build: universidade },
  biblioteca: { size: () => ({ w: 900, h: 560 }), build: biblioteca },
  fabrica: { size: () => ({ w: 1200, h: 620 }), build: fabrica },
  galpao: { size: () => ({ w: 880, h: 560 }), build: (p) => galpao(p, "galpao"), flip: true },
  armazem: { size: () => ({ w: 900, h: 580 }), build: (p) => galpao(p, "armazem"), flip: true },
  almoxarifado: { size: () => ({ w: 820, h: 540 }), build: (p) => galpao(p, "almoxarifado"), flip: true },
  "deposito-kits": { size: () => ({ w: 760, h: 520 }), build: (p) => galpao(p, "deposito-kits") },
  alfandega: { size: () => ({ w: 900, h: 560 }), build: alfandega },
  despacho: { size: () => ({ w: 680, h: 460 }), build: despacho },
  ...MODELOS_FLAVIO,
};

// detalhes por modelo (objetos e ações a mais, inclusive as que mudam o estado de um lugar)
for (const [id, extra] of Object.entries(DETALHES) as [TemplateId, (p: Plan) => void][]) {
  const base = MODELS[id].build;
  MODELS[id].build = (p) => {
    base(p);
    extra(p);
  };
}

export { PAREDES };
