import { CAMPANHA, DECISOES } from "./campanha";
import type { Valor } from "./motor";

/**
 * Roteiro da cerimônia final, "Ditadura do Carimbo". É puro: recebe as flags da campanha (as decisões
 * de cada missão) e devolve o tom da cerimônia e a lista de passos que a cena apresenta. A declaração
 * de ditadura é o acontecimento comum; o que muda é como a cidade a recebe e quanto os decretos funcionam.
 *
 * Tudo é ficção satírica: o governo inteiro é inventado, e a sátira mira a burocracia e o autoritarismo.
 */

export type Tom = "obediencia" | "ignorado" | "misto";

export interface Escolha {
  titulo: string;
  /** Opções com o que a cidade responde (falas curtas) e o que fica gravado na praça. */
  opcoes: { id: string; rotulo: string; reacao: string[]; marca: string }[];
  /** Chave da flag que guarda a opção. */
  flag: string;
}

export type Passo =
  | { tipo: "montar" }
  | { tipo: "fala"; quem?: string; linhas: string[] }
  | { tipo: "escolha"; escolha: Escolha }
  | { tipo: "carimbos" }
  | { tipo: "aplauso"; nivel: "fila" | "dividido" | "nenhum" };

export interface Apuracao {
  obediente: number;
  rebelde: number;
  meio: number;
  /** Para cada missão decidida: o texto curto da decisão e o lado. */
  itens: { missao: number; id: string; valor: string; texto: string; lado: "obediente" | "rebelde" | "meio" }[];
}

/** Conta o lado de cada decisão do jogador. Missões sem decisão (save antigo) não contam para nenhum lado. */
export function apura(flags: Record<string, Valor>): Apuracao {
  const out: Apuracao = { obediente: 0, rebelde: 0, meio: 0, itens: [] };
  for (const m of CAMPANHA.missoes) {
    const v = flags[`d.${m.id}`];
    if (typeof v !== "string") continue;
    const dec = DECISOES[m.id]?.[v];
    if (!dec) continue;
    out[dec.lado]++;
    out.itens.push({ missao: m.numero, id: m.id, valor: v, texto: dec.texto, lado: dec.lado });
  }
  return out;
}

/** Obediência exagerada, decretos ignorados ou um meio-termo que combina as consequências específicas. */
export function tomDe(a: Apuracao): Tom {
  if (a.obediente >= 4) return "obediencia";
  if (a.rebelde >= 3 && a.obediente <= 2) return "ignorado";
  return "misto";
}

/** Consequência de cada decisão no dia da cerimônia (uma linha por decisão). */
const CONSEQUENCIA: Record<string, Record<string, string>> = {
  protocolo: {
    carimbo: "A Repartição exige carimbo amarelo até para aplaudir.",
    recurso: "A Dona Protocolo aceitou o recurso do decreto, e já pediu recurso do recurso.",
  },
  cadeado: {
    cumpriu: "A Igreja Matriz cobra senha para rezar, e a fila dobra o quarteirão.",
    sabotou: "A porta de papelão segue aberta, e ninguém lembrou de cumprir o decreto.",
    brecha: "A porta lateral virou entrada oficial, com número e tudo.",
  },
  zap: {
    lacrado: "Os kits seguem lacrados, e a escola estuda a curiosidade.",
    desmentiu: "O romaneio na parede virou aula de leitura para a cidade inteira.",
    boato: "O kit do zap virou marca registrada, e a fila continua na porta.",
  },
  campus: {
    autorizou: "O campus pede autorização para o próprio barulho.",
    negociou: "A festa tem hora para acabar, e é a primeira vez que cumprem.",
    ignorou: "O campus segue em assembleia, de portas abertas, sem pedir licença.",
  },
  chave: {
    coletivo: "A chave circula em livro de empréstimo, e a fila de ferramentas dá volta no bairro.",
    devolveu: "O Vô Didi está com a chave no bolso e uma lista de quem pediu emprestada.",
    quebrou: "O armário abre empurrando, e ninguém precisa mais de decreto para pegar martelo.",
  },
  brasil: {
    despachou: "O navio parte quando o formulário assina, e ele só assina às quintas.",
    trocou: "O porto despachou cachaça com etiqueta de Brasil, e a alfândega está alegre.",
    sabotou: "A esteira parou com o Brasil em cima e a planilha pegou fogo de vergonha.",
  },
};

export const ESCOLHA_PROCLAMACAO: Escolha = {
  titulo: "Como proclamar?",
  flag: "final.proc",
  opcoes: [
    { id: "gritar", rotulo: "Gritar do palanque, com a faixa na mão", reacao: ["A faixa caiu em cima do coreto. A ordem foi dada mesmo assim."], marca: "gritou" },
    { id: "ler", rotulo: "Ler o decreto em voz alta, com firma reconhecida", reacao: ["A firma é do cartório do outro lado do mundo. Mas vale, porque eu disse que vale."], marca: "leu" },
    { id: "monumento", rotulo: "Deixar o Monumento falar (o áudio de 3 minutos)", reacao: ["O áudio de 3 minutos termina com um “pode repassar”. Todos repassaram."], marca: "monumento" },
  ],
};

export const ESCOLHA_APLAUSO: Escolha = {
  titulo: "O primeiro decreto exige aplausos. O que fazer?",
  flag: "final.aplauso",
  opcoes: [
    { id: "pedir", rotulo: "Pedir aplausos à multidão", reacao: ["Um aplauso curto, como quem não quer aparecer na ata."], marca: "pediu" },
    { id: "exigir", rotulo: "Exigir aplausos por escrito", reacao: ["Entregaram o aplauso em duas vias, assinado e carimbado."], marca: "exigiu" },
    { id: "sozinho", rotulo: "Aplaudir sozinho, com a faixa", reacao: ["O som de uma pessoa aplaudindo ecoa pela praça. O eco entrega o recibo."], marca: "sozinho" },
  ],
};

const FALA_POR_TOM: Record<Tom, { fila: string[]; firma: string[]; fechamento: string[] }> = {
  obediencia: {
    fila: ["A praça aplaude em fila, por ordem alfabética. Cada aplauso tem senha, e o Ministério confere.", "Para não aplaudir, é preciso protocolar um pedido. Para o pedido, é preciso aplaudir."],
    firma: ["O sistema rejeita o governante: “falta reconhecimento de firma”. O governante assina o próprio reconhecimento.", "A burocracia que o governo criou agora trava o governo. O decreto está pronto, mas ninguém acha o carimbo que autoriza o decreto."],
    fechamento: ["A cidade obedece até onde dá, e depois um pouco mais. O que a obediência não alcança, a fila alcança.", "Discordar exige o Formulário de Discordância, disponível somente em 30 de fevereiro."],
  },
  ignorado: {
    fila: ["A praça ouve, olha para o céu e volta ao que estava fazendo. Algumas pessoas aplaudem por educação.", "O decreto manda aplaudir. Ninguém sabe dizer onde está o decreto."],
    firma: ["O sistema rejeita o governante: “falta reconhecimento de firma”. O governante nem percebe, porque ninguém avisa.", "A burocracia foi tão sabotada que o governo não acha nem o próprio carimbo. O decreto existe, e ninguém o conhece."],
    fechamento: ["A cidade ignora a ditadura com a mesma energia com que ignora o horóscopo. Funciona, e ninguém reclama.", "Discordar exige o Formulário de Discordância, disponível somente em 30 de fevereiro. Quase ninguém tem vontade de discordar do que não leu."],
  },
  misto: {
    fila: ["Metade da praça aplaude em fila, a outra metade ri e pede carimbo. O resultado é um aplauso com intervalo.", "Os decretos funcionam às terças. Na quarta, perdem a validade, mas ninguém sabe qual quarta."],
    firma: ["O sistema rejeita o governante: “falta reconhecimento de firma”. O governante recorre a um recurso que ele mesmo escreveu.", "A burocracia criada pelo governo trava o governo, mas só no balcão errado. No balcão certo, está tudo carimbado."],
    fechamento: ["A cidade cumpre o decreto onde ele combina com o que já fazia. O resto, adia para a próxima terça.", "Discordar exige o Formulário de Discordância, disponível somente em 30 de fevereiro. Ele só existe em dias que não existem."],
  },
};

/** Texto fixo da proclamação (a declaração de ditadura é o acontecimento comum). */
export const PROCLAMACAO = "Presidente Vitalício Provisório — até segunda ordem emitida por ele mesmo.";

/** O roteiro completo da cerimônia para o estado atual das decisões. */
export function roteiro(flags: Record<string, Valor>): { tom: Tom; apuracao: Apuracao; passos: Passo[] } {
  const apuracao = apura(flags);
  const tom = tomDe(apuracao);
  const f = FALA_POR_TOM[tom];
  const consequencias = apuracao.itens.map((i) => CONSEQUENCIA[i.id]?.[i.valor]).filter((x): x is string => !!x);
  const passos: Passo[] = [
    { tipo: "montar" },
    { tipo: "fala", quem: "Seu Boato", linhas: ["Senhoras e senhores, a praça da Revolução Boateira recebe o seu presidente. Hoje, o presidente tem algo a dizer.", "Que fale. E que alguém anote, para depois dizer que não foi bem assim."] },
    { tipo: "fala", quem: "Presidente", linhas: ["Cidadãos, o Passaporte do Absurdo está completo. Os seis selos autorizam o que eu já tinha decidido.", `A partir de hoje, declaro-me ${PROCLAMACAO}`] },
    { tipo: "escolha", escolha: ESCOLHA_PROCLAMACAO },
    { tipo: "carimbos" },
    { tipo: "fala", quem: "Praça", linhas: f.fila },
    { tipo: "escolha", escolha: ESCOLHA_APLAUSO },
    { tipo: "aplauso", nivel: tom === "obediencia" ? "fila" : tom === "ignorado" ? "nenhum" : "dividido" },
    { tipo: "fala", quem: "Cartório do Ministério", linhas: f.firma },
  ];
  if (consequencias.length) passos.push({ tipo: "fala", quem: "Relatório da cidade", linhas: consequencias.slice(0, 6) });
  passos.push({ tipo: "fala", quem: "Seu Boato", linhas: f.fechamento });
  return { tom, apuracao, passos };
}

/** Falas dos moradores comuns depois da cerimônia: a cidade comenta o decreto do jeito do seu tom. */
const FALAS_GERAIS: Record<Tom, string[]> = {
  obediencia: ["Aplaudi em fila e ainda espero o recibo do aplauso.", "Minha opinião está em análise, protocolo 0667.", "Para discordar preciso do formulário, que só existe em 30 de fevereiro.", "Obedeço por escrito, em duas vias."],
  ignorado: ["Decreto? Eu estava olhando o horóscopo.", "Ouvi falar de uma ditadura, mas não achei o endereço.", "O presidente se declarou o quê? Passa o sal.", "Aqui ninguém leu decreto nenhum. A gente só cumpre o que combina."],
  misto: ["Cumpro o decreto às terças e finjo que não ouvi nas quartas.", "Metade da praça aplaudiu e a outra metade pediu carimbo.", "O decreto é bom quando combina com o meu horário.", "Dizem que na quarta ele perde a validade. Qual quarta?"],
};

/** Fala geral da cidade depois da cerimônia (ou null se ela ainda não aconteceu). */
export function falaGeral(flags: Record<string, Valor>, indice: number): string | null {
  const tom = flags["final.tom"];
  if (tom !== "obediencia" && tom !== "ignorado" && tom !== "misto") return null;
  return FALAS_GERAIS[tom][indice % FALAS_GERAIS[tom].length];
}

/** Texto da faixa e dos cartazes que ficam na praça depois da cerimônia. */
export function marcasDaPraca(flags: Record<string, Valor>): { faixa: string; formulario: string; decreto: string } | null {
  const tom = flags["final.tom"];
  if (tom !== "obediencia" && tom !== "ignorado" && tom !== "misto") return null;
  const faixa = {
    obediencia: "VIVA O PRESIDENTE VITALÍCIO PROVISÓRIO (APLAUSOS EM FILA ALFABÉTICA)",
    ignorado: "VIVA O PRESIDENTE (QUANDO NINGUÉM ESTIVER OCUPADO)",
    misto: "VIVA O PRESIDENTE VITALÍCIO PROVISÓRIO, ÀS TERÇAS",
  }[tom];
  const proc = flags["final.proc"];
  const decreto =
    proc === "ler" ? "DECRETO Nº 1: LIDO EM VOZ ALTA, FIRMA RECONHECIDA NO OUTRO LADO DO MUNDO" : proc === "monumento" ? "DECRETO Nº 1: TRANSMITIDO PELO MONUMENTO, PODE REPASSAR" : "DECRETO Nº 1: GRITADO DO PALANQUE (FAIXA CAÍDA NO CORETO)";
  return { faixa, formulario: "FORMULÁRIO DE DISCORDÂNCIA: DISPONÍVEL SOMENTE EM 30 DE FEVEREIRO", decreto };
}
