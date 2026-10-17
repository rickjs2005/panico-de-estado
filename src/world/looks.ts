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
  atendente: { skin: PELE.a, hair: "coque", hairColor: "#7a5a40", glasses: "grau", shirt: "#3a6b5a", badge: true, pants: "#2a3a38" },
  despachante: { skin: PELE.d, hair: "bone", hairColor: "#38211b", capColor: "#d84236", shirt: "#e9bc48", pants: "#34425b" },
  // moradores genéricos da cidade do Lula (sem história própria nesta fase)
  m1: { skin: PELE.b, hair: "curto", hairColor: "#2b1d14", shirt: "#e76f51", pants: "#2f3e46" },
  m2: { skin: PELE.d, hair: "careca", hairColor: "#1a1210", beard: "bigode", beardColor: "#1a1210", shirt: "#f4f1de", pants: "#5a4636" },
  m3: { skin: PELE.a, hair: "lateral", hairColor: "#8a6a4a", glasses: "grau", shirt: "#2a9d8f", pants: "#264653" },
  m4: { skin: PELE.e, hair: "raspado", hairColor: "#1a1210", shirt: "#e9c46a", pants: "#3d405b" },
  m5: { skin: PELE.c, hair: "coque", hairColor: "#35283a", shirt: "#c77dff", pants: "#2b2d42" },
  m6: { skin: PELE.b, hair: "rabo", hairColor: "#4a2c1a", shirt: "#ff8fa3", pants: "#3a3a58" },
  m7: { skin: PELE.d, hair: "coque", hairColor: "#c9c2b8", glasses: "grau", shirt: "#90be6d", pants: "#4a4e69" },
  m8: { skin: PELE.a, hair: "rabo", hairColor: "#d9a441", shirt: "#4d96ff", pants: "#22223b" },
  // elenco do Brasil do Flávio (vem dos episódios, com calça para andar pela cidade)
  patriota: { ...CHARACTERS.patriota.look, pants: "#1f6f43" },
  kelly: { ...CHARACTERS.kelly.look, pants: "#2b2d42" },
  mesario: { ...CHARACTERS.mesario.look, pants: "#3a3a48" },
  fortaleza: { ...CHARACTERS.fortaleza.look, pants: "#2a3328" },
  wanderley: { ...CHARACTERS.wanderley.look, pants: "#3a3a48" },
  leila: { ...CHARACTERS.leila.look, pants: "#26323b" },
  robson: { ...CHARACTERS.robson.look, pants: "#2a3150" },
  valdir: { ...CHARACTERS.valdir.look, pants: "#2a1f30" },
  motoqueiro: { skin: PELE.c, hair: "bone", hairColor: "#1a1210", capColor: "#1f2433", beard: "cheia", beardColor: "#2a1d14", glasses: "escuro", shirt: "#2a2a35", pants: "#1f2433" },
  sargento: { skin: PELE.b, hair: "raspado", hairColor: "#3a3a3a", beard: "bigode", beardColor: "#3a3a3a", shirt: "#4f6a3f", badge: true, pants: "#3d4a33" },
  zuleica: { skin: PELE.d, hair: "coque", hairColor: "#e6e6e6", glasses: "grau", shirt: "#d98ab0", pants: "#4a3a5a" },
  leiloeiro: { skin: PELE.a, hair: "lateral", hairColor: "#c9c2b8", beard: "bigode", beardColor: "#c9c2b8", shirt: "#2a3a6b", tie: "#f2c230", pants: "#1f2433" },
  rosangela: { skin: PELE.b, hair: "coque", hairColor: "#5a3a2a", glasses: "grau", shirt: "#7fb3a0", badge: true, pants: "#2f3a38" },
  sindico: { skin: PELE.a, hair: "careca", hairColor: "#8a7a6a", glasses: "grau", shirt: "#e9e2cf", tie: "#1f6f43", pants: "#3a3a48" },
} satisfies Record<string, WorldLook>;

export type LookId = keyof typeof LOOKS;
