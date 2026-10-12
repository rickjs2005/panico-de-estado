import type { CharacterId } from "./types";

/**
 * Bonecos do jogo. Todos são desenhados em SVG por `Puppet.tsx` a partir destes traços.
 * Lula e Flávio aparecem como caricaturas hipotéticas, sem falas: só reagem.
 */

export type HairStyle =
  | "curto"
  | "coque"
  | "careca"
  | "longo"
  | "cacheado"
  | "ondulado"
  | "lateral"
  | "raspado"
  | "rabo"
  | "bone";

export interface Look {
  skin: string;
  hair: HairStyle;
  hairColor: string;
  beard?: "cheia" | "bigode";
  beardColor?: string;
  glasses?: "grau" | "escuro";
  shirt: string;
  tie?: string;
  /** Faixa presidencial. */
  sash?: boolean;
  headset?: boolean;
  badge?: boolean;
  phone?: boolean;
  scarf?: string;
  capColor?: string;
  /** Olheiras de quem não dorme. */
  bags?: boolean;
  ringLight?: boolean;
}

export interface CharacterDef {
  name: string;
  role: string;
  look: Look;
}

const PELE = { a: "#f1c7a3", b: "#d9a27a", c: "#b97d55", d: "#8d5a3b", e: "#6b4329" };

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  // ---------- Compartilhados ----------
  voce: {
    name: "Você",
    role: "Assessor(a) de comunicação. Primeiro dia. Crachá ainda com a foto errada.",
    look: { skin: PELE.c, hair: "curto", hairColor: "#2b1d14", shirt: "#3b4a6b", headset: true, badge: true },
  },
  nilza: {
    name: "Tia Nilza",
    role: "Encaminha antes de ler. Lê depois, se der.",
    look: { skin: PELE.b, hair: "coque", hairColor: "#9a9aa3", glasses: "grau", shirt: "#c2477a", phone: true },
  },
  osvaldo: {
    name: "Tio Osvaldo",
    role: "Tem uma fonte. A fonte é outro tio.",
    look: { skin: PELE.a, hair: "careca", hairColor: "#6d5a4a", beard: "bigode", beardColor: "#4a3a2e", shirt: "#2e7d6b", phone: true },
  },
  kelly: {
    name: "Prima Kelly",
    role: "A única que pergunta “fonte?”. Já foi removida 6 vezes.",
    look: { skin: PELE.d, hair: "cacheado", hairColor: "#1c1410", shirt: "#7b4bd1", phone: true },
  },
  didi: {
    name: "Vô Didi",
    role: "Ouve tudo no viva-voz. Em lugares públicos.",
    look: { skin: PELE.b, hair: "careca", hairColor: "#e6e6e6", glasses: "grau", shirt: "#8a6d4b" },
  },

  // ---------- Rota Lula ----------
  lula: {
    name: "Lula (caricatura hipotética)",
    role: "Presidente neste Brasil inventado. Não fala no jogo: só reage.",
    look: { skin: PELE.b, hair: "ondulado", hairColor: "#ececec", beard: "cheia", beardColor: "#e2e2e2", shirt: "#1f2433", tie: "#c62835", sash: true },
  },
  brisa: {
    name: "Otávio Brisa",
    role: "Ministro da Tranquilidade Pública. Não dorme desde a posse.",
    look: { skin: PELE.a, hair: "lateral", hairColor: "#3a3a3a", shirt: "#4a4f5c", tie: "#8b1e2b", bags: true },
  },
  jessica: {
    name: "Jéssica Ventania",
    role: "Assessora de Narrativas Urgentes. Sua chefe.",
    look: { skin: PELE.e, hair: "rabo", hairColor: "#1a1210", shirt: "#b3263a", badge: true },
  },
  wellington: {
    name: "Wellington Ponto",
    role: "Assessor de Desmentidos Preventivos.",
    look: { skin: PELE.c, hair: "raspado", hairColor: "#1f1a17", glasses: "grau", shirt: "#e8e4da", tie: "#30406b" },
  },
  rubens: {
    name: "Coach Rubens Muralha",
    role: "Influenciador de oposição. Vende proteção contra o que ele mesmo inventou.",
    look: { skin: PELE.a, hair: "bone", hairColor: "#5a4632", capColor: "#1f8a4c", shirt: "#f2c230", ringLight: true },
  },
  vibes: {
    name: "@CompanheiraVibes",
    role: "Influenciadora governista. Vende calma em kits.",
    look: { skin: PELE.d, hair: "longo", hairColor: "#3b2216", shirt: "#d94a5a", scarf: "#f2c230", ringLight: true },
  },

  // ---------- Rota Flávio ----------
  flavio: {
    name: "Flávio (caricatura hipotética)",
    role: "Presidente neste Brasil inventado. Não fala no jogo: só reage.",
    look: { skin: PELE.a, hair: "lateral", hairColor: "#2a211b", shirt: "#1f2433", tie: "#1f6f43", sash: true },
  },
  fortaleza: {
    name: "Heitor Fortaleza",
    role: "Ministro da Ordem Comunicacional. Não pisca desde a posse.",
    look: { skin: PELE.b, hair: "raspado", hairColor: "#8d8d8d", glasses: "escuro", shirt: "#3d4a3a", tie: "#c9a227" },
  },
  kaique: {
    name: "Kaique Trincheira",
    role: "Assessor de Estratégia Digital. Seu chefe.",
    look: { skin: PELE.c, hair: "curto", hairColor: "#1d1712", shirt: "#1f6f43", badge: true },
  },
  wanderley: {
    name: "Wanderley Coturno",
    role: "Assessor de Desmentidos Táticos.",
    look: { skin: PELE.a, hair: "lateral", hairColor: "#5b4636", beard: "bigode", beardColor: "#4a3a2e", shirt: "#e8e4da", tie: "#1f6f43" },
  },
  livia: {
    name: "Professora Lívia Resistência",
    role: "Influenciadora de oposição. Vende cursos contra tudo.",
    look: { skin: PELE.b, hair: "cacheado", hairColor: "#6a2a1a", glasses: "grau", shirt: "#5a3d8a", scarf: "#d94a5a", ringLight: true },
  },
  patriota: {
    name: "@PatriotaRaiz.Oficial",
    role: "Influenciador governista. Vende tudo com selo verde-amarelo.",
    look: { skin: PELE.c, hair: "bone", hairColor: "#2a1d14", capColor: "#1f8a4c", shirt: "#f2c230", ringLight: true },
  },
};

export function character(id: CharacterId): CharacterDef {
  return CHARACTERS[id] ?? { name: id, role: "", look: CHARACTERS.voce.look };
}
