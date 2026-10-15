import { CHARACTERS, type Look } from "../game/characters";

/**
 * Aparências usadas no bairro. Lula e Flávio vêm dos bonecos do jogo original,
 * com sobrancelhas marcadas para continuarem reconhecíveis em tamanho pequeno.
 */

export interface WorldLook extends Look {
  /** Cor da calça. */
  pants: string;
  /** Avental de churrasco por cima da roupa. */
  apron?: string;
}

const PELE = { a: "#f1c7a3", b: "#d9a27a", c: "#b97d55", d: "#8d5a3b", e: "#6b4329" };

export const LOOKS = {
  lula: { ...CHARACTERS.lula.look, brows: true, pants: "#1f2433" },
  flavio: { ...CHARACTERS.flavio.look, brows: true, pants: "#1f2433" },
  patrao: {
    skin: PELE.a,
    hair: "careca",
    hairColor: "#7a6a5a",
    beard: "bigode",
    beardColor: "#5a4636",
    shirt: "#f2efe8",
    tie: "#b5452b",
    apron: "#d94a3a",
    pants: "#4a4a58",
  },
  boato: { skin: PELE.b, hair: "lateral", hairColor: "#3a2a1e", glasses: "escuro", shirt: "#ffd23f", phone: true, pants: "#3b4a6b" },
  zeca: { skin: PELE.c, hair: "bone", hairColor: "#2b1d14", capColor: "#8b5a2b", beard: "cheia", beardColor: "#3a2a1e", shirt: "#c98a4b", pants: "#3a2a1e" },
  feirante: { skin: PELE.d, hair: "bone", hairColor: "#1a1210", capColor: "#e8742a", shirt: "#f2efe8", apron: "#2e7d6b", pants: "#2a2a35" },
  func1: { skin: PELE.c, hair: "bone", hairColor: "#1d1712", capColor: "#2f6fb0", shirt: "#2f6fb0", pants: "#24476b" },
  func2: { skin: PELE.e, hair: "rabo", hairColor: "#1a1210", shirt: "#2f6fb0", pants: "#24476b" },
  func3: { skin: PELE.a, hair: "curto", hairColor: "#a0522d", shirt: "#2f6fb0", pants: "#24476b" },
  func4: { skin: PELE.d, hair: "raspado", hairColor: "#1a1210", shirt: "#2f6fb0", glasses: "grau", pants: "#24476b" },
  nilza: { ...CHARACTERS.nilza.look, pants: "#5a3d6b" },
  osvaldo: { ...CHARACTERS.osvaldo.look, pants: "#4a4a58" },
  didi: { ...CHARACTERS.didi.look, pants: "#5b4636" },
  cida: { ...CHARACTERS.fiel.look, pants: "#2a4a5a" },
  pastor: { ...CHARACTERS.pastor.look, pants: "#27233d" },
  tiao: { skin: PELE.c, hair: "careca", hairColor: "#5a4030", beard: "bigode", beardColor: "#5a4030", shirt: "#e8b04a", apron: "#7b3036", pants: "#453545" },
  diretora: { skin: PELE.d, hair: "coque", hairColor: "#35283a", glasses: "grau", shirt: "#6f51b8", pants: "#30364c" },
  reitora: { skin: PELE.b, hair: "rabo", hairColor: "#65514a", glasses: "grau", shirt: "#36978b", pants: "#273b4d" },
  despachante: { skin: PELE.d, hair: "bone", hairColor: "#38211b", capColor: "#d84236", shirt: "#e9bc48", pants: "#34425b" },
} satisfies Record<string, WorldLook>;

export type LookId = keyof typeof LOOKS;
