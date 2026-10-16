import type { Point } from "../types";

/**
 * Os cães da cidade do Lula e as bolas soltas nas quadras: só dados (onde moram, como se chamam,
 * a cor da pelagem). Quem faz eles andarem, latirem, seguirem o protagonista e correrem atrás da bola
 * é a cena (`game/city/Caes.ts` e `game/city/Bolas.ts`). `check:city` confere que cada um começa
 * num lugar caminhável.
 */

export type Pelagem = "caramelo" | "preto" | "malhado" | "cinza" | "branco";

export interface CaoDef extends Point {
  id: string;
  nome: string;
  pelagem: Pelagem;
  /** Cor da coleira. */
  coleira: string;
  /** De 0 a 1: chance de seguir o protagonista quando ele passa por perto. */
  sociavel: number;
}

const c = (id: string, nome: string, x: number, y: number, pelagem: Pelagem, coleira: string, sociavel = 0.25): CaoDef => ({ id, nome, x, y, pelagem, coleira, sociavel });

export const CAES: CaoDef[] = [
  // Centro Cívico
  c("cao-caramelo", "Caramelo", 2440, 1215, "caramelo", "#c62835", 0.7),
  c("cao-carimbo", "Carimbo", 2130, 1300, "preto", "#ffd23f"),
  c("cao-decreto", "Decreto", 1960, 700, "malhado", "#3a86ff"),
  // Largo da Feira
  c("cao-fiado", "Fiado", 2200, 2460, "caramelo", "#2f9e5a", 0.4),
  c("cao-pastel", "Pastel", 2700, 2470, "branco", "#e85d04"),
  c("cao-pix", "Pix", 2050, 2880, "cinza", "#c77dff"),
  // Vila do Mutirão
  c("cao-mutirao", "Mutirão", 600, 820, "caramelo", "#c62835", 0.4),
  c("cao-varal", "Varal", 1250, 800, "malhado", "#ffd23f"),
  c("cao-pitoco", "Pitoco", 545, 1480, "preto", "#3a86ff", 0.35),
  c("cao-pacoca", "Paçoca", 1200, 1300, "caramelo", "#2f9e5a"),
  // Cidade Universitária
  c("cao-calouro", "Calouro", 3700, 820, "branco", "#7b4bd1", 0.4),
  c("cao-merenda", "Merenda", 3480, 1340, "malhado", "#e63946"),
  c("cao-estagiario", "Estagiário", 4150, 1350, "cinza", "#ffd23f"),
  // Polo Industrial
  c("cao-parafuso", "Parafuso", 640, 2290, "preto", "#e85d04"),
  c("cao-empilha", "Empilha", 1300, 2300, "caramelo", "#3a86ff"),
  // Terminal Brasil–China
  c("cao-conteiner", "Contêiner", 3700, 2500, "malhado", "#c62835"),
  c("cao-marujo", "Marujo", 3350, 2800, "branco", "#1d3557", 0.3),
];

export interface BolaDef extends Point {
  id: string;
  cor: string;
}

/** Bolas soltas: chuta-se andando contra elas ou com a ação "Chutar a bola"; os cães correm atrás. */
export const BOLAS: BolaDef[] = [
  { id: "bola-campinho", x: 545, y: 1525, cor: "#ffd23f" },
  { id: "bola-quadra", x: 3515, y: 1515, cor: "#ffffff" },
  { id: "bola-praca", x: 2560, y: 1290, cor: "#e63946" },
];
