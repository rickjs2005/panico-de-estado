import { enter, nar, say, set } from "./script";
import type { Ending, Episode } from "./types";

/**
 * Desfecho compartilhado: Valdir dos Kits aparece nos dois universos vendendo
 * o mesmo kit de sobrevivência em embalagens diferentes.
 * As opções disponíveis dependem de quantas vitórias o jogador teve no dia.
 */

interface KitText {
  /** Nome da edição deste Brasil. */
  edition: string;
  /** O que vem dentro, em uma frase. */
  contents: string;
  /** Nome da edição do outro Brasil. */
  otherEdition: string;
  /** Horário/forma em que o medo chega. */
  delivery: string;
  /** Objeto absurdo do brinde. */
  gift: string;
  /** O medo do outro lado, para o final "Cliente perdido". */
  otherFear: string;
}

export function makeFinale(k: KitText): Episode {
  return {
    id: "kits",
    title: "Desfecho — Kit de Sobrevivência",
    objective: "Comprar um carregador de celular. Só isso.",
    backdrop: "loja",
    beats: [
      nar("Fim do dia. Você entra numa loja para comprar um carregador. Entrou na loja errada."),
      enter("voce", 18, { from: "left", mood: "preocupado" }),
      enter("valdir", 62, { from: "right", mood: "comemora", holding: "kit" }),
      say("valdir", "Boa noite! Valdir dos Kits. Você está com cara de quem teve um dia… histórico.", "fala"),
      say("valdir", `Recomendo o ${k.edition}. Vem com ${k.contents}.`, "aponta"),
      set("portal", "OUTRO BRASIL"),
      say("valdir", `Também tenho o ${k.otherEdition}. É do outro universo. Mesma caixa, outra cor.`, "deboche"),
      say("valdir", "E o lançamento: Kit Debate. Duas cadeiras vazias, uma de cada cor. Os candidatos já vêm ausentes.", "comemora"),
      say("voce", "É o mesmo kit?", "susto"),
      say("valdir", "É o mesmo medo. Só muda a embalagem.", "deboche"),
      say("valdir", "Qual versão da ameaça você prefere assinar? Mensal ou anual?", "fala"),
      {
        t: "choice",
        prompt: "O que você faz?",
        options: [
          {
            label: "Assinar a versão deste Brasil",
            flag: "assinar",
            beats: [say("valdir", `Excelente escolha! Seu primeiro medo chega ${k.delivery}.`, "comemora")],
          },
          {
            label: "Levar as duas versões (combo)",
            flag: "combo",
            beats: [say("valdir", "Combo Dois Brasis! Pague dois medos, leve dois medos.", "comemora")],
          },
          {
            label: "Perguntar o que tem dentro da caixa",
            flag: "abrir",
            beats: [say("valdir", "Dentro? Em vinte anos de loja, ninguém nunca perguntou o que tem dentro.", "susto")],
          },
          {
            label: "Ir embora sem comprar nada",
            flag: "sair",
            minWins: 2,
            beats: [
              say("valdir", "Mas… e se acontecer alguma coisa?", "desespero"),
              say("voce", "Já aconteceu tudo hoje. E eu resolvi sem kit.", "deboche"),
            ],
          },
          {
            label: "Tentar sair (a porta parece trancada)",
            flag: "preso",
            maxWins: 1,
            beats: [say("valdir", "Ah, a porta. A porta é vendida separadamente.", "deboche")],
          },
        ],
      },
    ],
  };
}

export function makeEndings(k: KitText): Record<string, Ending> {
  return {
    assinar: {
      id: "assinar",
      title: "Assinante do Medo",
      backdrop: "loja",
      lines: [
        `Você assina o ${k.edition}.`,
        `Todo dia, ${k.delivery}, chega um medo novo, embalado, com nota fiscal.`,
        `No terceiro mês vem um brinde: ${k.gift}.`,
        "O Valdir manda lembranças. Do outro Brasil também.",
      ],
      tableau: [
        { who: "voce", mood: "preocupado", holding: "kit", x: 30 },
        { who: "valdir", mood: "comemora", holding: "kit", x: 70 },
      ],
    },
    combo: {
      id: "combo",
      title: "Pacote Dois Brasis",
      backdrop: "loja",
      lines: [
        "Você leva as duas embalagens e abre as duas em casa.",
        "É a mesma caixa. O Valdir só trocou o adesivo.",
        "Na garantia está escrito: “medo não tem troca”.",
      ],
      tableau: [
        { who: "voce", mood: "susto", holding: "kit", x: 30 },
        { who: "valdir", mood: "deboche", holding: "kit", x: 70 },
      ],
    },
    abrir: {
      id: "abrir",
      title: "O Que Tem Dentro",
      backdrop: "loja",
      lines: [
        "O Valdir abre a caixa devagar, como quem abre um cofre.",
        "Dentro, só um espelho.",
        "“É o item mais vendido”, ele diz. “Cada cliente vê a ameaça que encomendou.”",
      ],
      tableau: [
        { who: "voce", mood: "susto", x: 30 },
        { who: "valdir", mood: "deboche", holding: "espelho", x: 70 },
      ],
    },
    sair: {
      id: "sair",
      title: "Cliente Perdido",
      backdrop: "loja",
      lines: [
        "Você sai sem kit. Ninguém te segue. O dia acaba, finalmente.",
        "Pela vitrine, você vê o Valdir atravessar um portal para o outro Brasil, com as caixas da outra cor.",
        `Lá, ele já está dizendo boa noite para alguém com medo de ${k.otherFear}.`,
      ],
      tableau: [
        { who: "voce", mood: "comemora", x: 26 },
        { who: "valdir", mood: "deboche", holding: "kit", x: 84 },
      ],
    },
    preso: {
      id: "preso",
      title: "Cliente Fidelizado",
      backdrop: "loja",
      lines: [
        "A porta é vendida separadamente. A janela, em 12 vezes.",
        "Você passa a noite na loja. O Valdir te ensina a embalar medo.",
        "De manhã, é você no balcão: “Boa noite! Você está com cara de quem teve um dia histórico.”",
      ],
      tableau: [
        { who: "valdir", mood: "comemora", x: 30 },
        { who: "voce", mood: "deboche", holding: "kit", x: 70 },
      ],
    },
  };
}

/** Escolhe o final pelo último flag do desfecho. */
export function pickEnding(flags: string[]): string {
  const known = ["assinar", "combo", "abrir", "sair", "preso"];
  return [...flags].reverse().find((f) => known.includes(f)) ?? "assinar";
}
