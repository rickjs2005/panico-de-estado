import { apuraCom, tomDe, type Apuracao, type Escolha, type Passo, type Tom } from "../missoes/final";
import type { Valor } from "../missoes/motor";
import { CAMPANHA_FLAVIO, DECISOES_FLAVIO } from "./campanha";

/**
 * Roteiro da cerimônia final do Brasil do Flávio, a "Eleição no Cofre". É puro, como o da cidade do
 * Lula: recebe as decisões das seis missões e devolve o tom e os passos que a cena apresenta. O anúncio
 * é o acontecimento comum (a urna vai para o cofre e a senha fica com o presidente); o que muda é como
 * a cidade recebe a notícia.
 *
 * Tudo é ficção satírica: o governo é inventado, e a sátira mira a burocracia e o autoritarismo imaginado.
 */

export const apuraFlavio = (flags: Record<string, Valor>): Apuracao => apuraCom(CAMPANHA_FLAVIO.missoes, DECISOES_FLAVIO, flags);

/** Consequência de cada decisão no dia da cerimônia (uma linha por decisão). */
const CONSEQUENCIA: Record<string, Record<string, string>> = {
  chicote: {
    entregou: "O chicote de couro virou ponteiro de reunião, e a reunião de metas não acaba nunca.",
    vale: "A Fábrica Feliz almoça de vale-refeição, e o Ministério ainda procura o recibo.",
    alcacuz: "A meta da fábrica ficou doce: toda reunião termina com chicote de alcaçuz.",
  },
  dezembro: {
    aceitou: "O ano tem onze meses, e o Natal foi transferido para 61 de novembro.",
    devolveu: "Dezembro voltou à caneta, e o RH emoldurou o calendário rabiscado.",
    parcelou: "O décimo terceiro chega em doze novembros, e o Tonhão já marcou na agenda.",
  },
  catraca: {
    cobrou: "A catraca do posto cobra até de quem só veio perguntar o horário.",
    liberou: "A catraca do posto gira de graça, e o pombo pediu reembolso do camarote.",
    artigo: "Idoso entra de graça pelo artigo 2º, e a fila comum estuda o regulamento.",
  },
  leilao: {
    vendeu: "O pinguim é dono de um barril da Petrobras e não sabe o que fazer com ele.",
    cancelou: "O barril voltou para a refinaria, e o martelo do leilão tirou férias.",
    "sem-lance": "O lote 1 voltou ao patrimônio sem lance, e o leiloeiro ainda procura o pinguim.",
  },
  urna: {
    autorizou: "Para votar, três vias e um café. A fila do cartório dá a volta na Esplanada.",
    rasgou: "A exigência rasgada virou confete, e o cartório tem um guichê a menos.",
    titulo: "O título de eleitor voltou a valer, e o regimento antigo ganhou moldura.",
  },
  eua: {
    embarcou: "O Brasil seguiu de laço para os EUA, e o cais ficou com saudade do próprio país.",
    devolveu: "O Brasil voltou ao armazém com etiqueta de “não está à venda”.",
    "caixa-vazia": "Embarcou só a caixa, com laço. O Brasil ficou no cais, olhando o navio ir.",
  },
};

export const ESCOLHA_ANUNCIO: Escolha = {
  titulo: "Como anunciar?",
  flag: "final.proc",
  opcoes: [
    { id: "moto", rotulo: "Da moto, com a motociata dando a volta na praça", reacao: ["A motociata deu três voltas na praça. Ninguém ouviu o anúncio, mas todo mundo ouviu o ronco."], marca: "moto" },
    { id: "ler", rotulo: "Ler o decreto em voz alta, com o hino ao fundo", reacao: ["O hino tocou duas vezes, porque o decreto era comprido. A praça cantou as duas."], marca: "leu" },
    { id: "tiro", rotulo: "Um tiro pro alto: o eco anuncia o resto", reacao: ["POW! Os pombos fugiram e o eco voltou do Palácio anunciando sozinho: “cofre, cofre, cofre”."], marca: "tiro" },
  ],
};

export const ESCOLHA_VOTO: Escolha = {
  titulo: "A praça quer votar. O que fazer?",
  flag: "final.voto",
  opcoes: [
    { id: "senha", rotulo: "Tentar abrir o cofre com a senha 1-2-3-4", reacao: ["SENHA ERRADA. O cofre pede a senha da senha, e a senha da senha está no cofre."], marca: "senha" },
    { id: "autorizacao", rotulo: "Pedir autorização por escrito para votar", reacao: ["O pedido foi em três vias. O cartório respondeu: “aguarde a próxima eleição”."], marca: "autorizacao" },
    { id: "sozinho", rotulo: "Votar sozinho, dentro do cofre", reacao: ["Você entrou no cofre, votou e a porta fechou. Resultado: um voto, unânime e trancado."], marca: "sozinho" },
  ],
};

const FALA_POR_TOM: Record<Tom, { fila: string[]; cofre: string[]; fechamento: string[] }> = {
  obediencia: {
    fila: ["A praça aplaude em fila, por ordem de crachá. Quem não tem crachá aplaude por procuração.", "Para votar, é preciso autorização. Para a autorização, é preciso ter votado. A praça aplaude o círculo."],
    cofre: ["O cofre não abre: a senha foi trocada por decreto, e o decreto está guardado dentro do cofre.", "A eleição está tão segura que nem o governo consegue alcançá-la. O Tribunal comemora em silêncio."],
    fechamento: ["A cidade obedece em fila e de crachá. A eleição segue marcada, no cofre, para quando acharem a senha.", "Nova senha, só pelo Formulário de Recuperação. O formulário está no cofre."],
  },
  ignorado: {
    fila: ["A praça olha para o palanque, olha para o celular e volta para a feira. A motociata buzina para ninguém.", "O decreto manda aplaudir. A praça aplaude o pastel."],
    cofre: ["O cofre não abre, e ninguém percebe: a cidade já votou o sabor do pastel no grupo do condomínio.", "A burocracia foi tão ignorada que o Tribunal esqueceu onde guardou o próprio cofre."],
    fechamento: ["A cidade ignora o cofre com a mesma energia com que ignora o carro de som. Funciona.", "A senha nunca foi encontrada. Também ninguém procurou."],
  },
  misto: {
    fila: ["Metade da praça aplaude em fila, a outra metade pede a senha. O resultado é um aplauso com senha.", "Dizem que o cofre abre às terças, às 3h. Ninguém sabe de qual ano."],
    cofre: ["O cofre abre pela metade: dá para ver a urna, mas não para votar nela.", "O Tribunal recorre ao Tribunal, que recorre ao cofre. O cofre não responde."],
    fechamento: ["A cidade cumpre o decreto quando combina com o horário da feira. O resto, guarda no cofre.", "A senha foi dividida em duas metades, e cada metade está num cofre diferente."],
  },
};

/** Texto fixo do anúncio (o acontecimento comum da cerimônia). */
export const ANUNCIO = "a eleição está garantida e guardada no cofre, até segunda ordem emitida por mim mesmo.";

/** O roteiro completo da cerimônia para o estado atual das decisões. */
export function roteiroFlavio(flags: Record<string, Valor>): { tom: Tom; apuracao: Apuracao; passos: Passo[] } {
  const apuracao = apuraFlavio(flags);
  const tom = tomDe(apuracao);
  const f = FALA_POR_TOM[tom];
  const consequencias = apuracao.itens.map((i) => CONSEQUENCIA[i.id]?.[i.valor]).filter((x): x is string => !!x);
  const passos: Passo[] = [
    { tipo: "montar" },
    { tipo: "fala", quem: "@PatriotaRaiz.Oficial", linhas: ["Ao vivo da Praça do Desfile! O presidente vai falar da eleição. Comenta ORDEM!", "Se a live cair, a culpa é do sinal. O sinal foi privatizado ontem."] },
    { tipo: "fala", quem: "Presidente", linhas: ["Cidadãos, o Passaporte da Ordem está completo. Os seis selos autorizam o que eu já tinha decidido.", `A partir de hoje, ${ANUNCIO} A senha fica comigo, por segurança.`] },
    { tipo: "escolha", escolha: ESCOLHA_ANUNCIO },
    { tipo: "carimbos" },
    { tipo: "fala", quem: "Praça", linhas: f.fila },
    { tipo: "escolha", escolha: ESCOLHA_VOTO },
    { tipo: "aplauso", nivel: tom === "obediencia" ? "fila" : tom === "ignorado" ? "nenhum" : "dividido" },
    { tipo: "fala", quem: "Tribunal Eleitoral do Cofre", linhas: f.cofre },
  ];
  if (consequencias.length) passos.push({ tipo: "fala", quem: "Relatório da cidade", linhas: consequencias.slice(0, 6) });
  passos.push({ tipo: "fala", quem: "@PatriotaRaiz.Oficial", linhas: f.fechamento });
  return { tom, apuracao, passos };
}

/** Falas dos moradores comuns depois da cerimônia: a cidade comenta o cofre do jeito do seu tom. */
const FALAS_GERAIS: Record<Tom, string[]> = {
  obediencia: ["Aplaudi em fila e ainda espero o crachá do aplauso.", "Pedi autorização para pedir a senha. Está em análise.", "Votar agora é no cofre. Eu levo o título e um cadeado.", "Obedeço com alegria, como manda o outdoor."],
  ignorado: ["Cofre? Eu estava na fila do pastel.", "Ouvi um anúncio, mas a motociata passou por cima.", "O presidente guardou o quê? Passa o vinagrete.", "Aqui ninguém leu o decreto. A gente vota no grupo do condomínio."],
  misto: ["Cumpro o decreto às terças, às 3h. No resto da semana, esqueço a senha.", "Metade da praça aplaudiu e a outra metade pediu a senha.", "O decreto é bom quando combina com o horário da feira.", "Dizem que o cofre abre às terças. Qual terça?"],
};

/** Fala geral da cidade depois da cerimônia (ou null se ela ainda não aconteceu). */
export function falaGeralFlavio(flags: Record<string, Valor>, indice: number): string | null {
  const tom = flags["final.tom"];
  if (tom !== "obediencia" && tom !== "ignorado" && tom !== "misto") return null;
  return FALAS_GERAIS[tom][indice % FALAS_GERAIS[tom].length];
}

/** Texto da faixa e dos cartazes que ficam na praça depois da cerimônia. */
export function marcasDaPracaFlavio(flags: Record<string, Valor>): { faixa: string; senha: string; decreto: string } | null {
  const tom = flags["final.tom"];
  if (tom !== "obediencia" && tom !== "ignorado" && tom !== "misto") return null;
  const faixa = {
    obediencia: "ELEIÇÃO GARANTIDA NO COFRE (APLAUSOS POR ORDEM DE CRACHÁ)",
    ignorado: "ELEIÇÃO NO COFRE (A PRAÇA FOI PRA FEIRA)",
    misto: "ELEIÇÃO NO COFRE · ABRE ÀS TERÇAS, ÀS 3H",
  }[tom];
  // durante a cerimônia o anúncio ainda não foi escolhido: a placa fica "ao vivo"
  const decreto =
    {
      leu: "DECRETO Nº 1: LIDO COM O HINO AO FUNDO (DUAS VEZES)",
      tiro: "DECRETO Nº 1: ANUNCIADO PELO ECO DE UM TIRO PRO ALTO",
      moto: "DECRETO Nº 1: ANUNCIADO DA MOTO (NINGUÉM OUVIU, TODO MUNDO VIU)",
    }[String(flags["final.proc"])] ?? "DECRETO Nº 1: AO VIVO, AGUARDE O ANÚNCIO";
  return { faixa, senha: "SENHA DO COFRE: SOLICITE NO COFRE", decreto };
}
