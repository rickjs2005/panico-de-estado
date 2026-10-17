import type { BolaDef, CaoDef, Pelagem } from "../caes";

/** Os cães do Brasil do Flávio e as bolas soltas: os mesmos comportamentos da cidade do Lula, outros nomes. */

const c = (id: string, nome: string, x: number, y: number, pelagem: Pelagem, coleira: string, sociavel = 0.25): CaoDef => ({ id, nome, x, y, pelagem, coleira, sociavel });

export const CAES_FLAVIO: CaoDef[] = [
  // Condomínio Pátria Amada
  c("fl-cao-coturno", "Coturno", 1500, 1000, "preto", "#1f8a4c", 0.7),
  c("fl-cao-cracha", "Crachá", 450, 600, "caramelo", "#ffd23f"),
  c("fl-cao-cancela", "Cancela", 1260, 1100, "malhado", "#c62835"),
  c("fl-cao-progresso", "Progresso", 2150, 1100, "branco", "#2f6fd6", 0.35),
  // Esplanada da Ordem
  c("fl-cao-continencia", "Continência", 1700, 1760, "caramelo", "#1f8a4c", 0.6),
  c("fl-cao-desfile", "Desfile", 600, 2150, "cinza", "#ffd23f"),
  c("fl-cao-recruta", "Recruta", 1300, 1500, "preto", "#e85d04", 0.4),
  // Livre Mercado
  c("fl-cao-boleto", "Boleto", 2700, 1780, "caramelo", "#2f9e5a", 0.4),
  c("fl-cao-cifrao", "Cifrão", 4000, 1900, "branco", "#ffd23f"),
  c("fl-cao-pedagio", "Pedágio", 3100, 2330, "malhado", "#c77dff"),
  // Colégio Cívico-Militar
  c("fl-cao-hino", "Hino", 2700, 1050, "caramelo", "#1f6f43", 0.4),
  c("fl-cao-sentido", "Sentido", 4300, 1120, "preto", "#ffd23f"),
  // Distrito do Chicote
  c("fl-cao-marmita", "Marmita", 800, 2935, "caramelo", "#e85d04", 0.35),
  c("fl-cao-turbo", "Turbo", 1600, 3320, "cinza", "#3a86ff"),
  // Porto Brasil–EUA
  c("fl-cao-lance", "Lance", 2800, 3116, "malhado", "#2f6fd6"),
  c("fl-cao-ronco", "Ronco", 4100, 2950, "preto", "#c62835", 0.3),
  c("fl-cao-cofrinho", "Cofrinho", 3400, 3420, "branco", "#1d3557"),
];

/** Bolas soltas: a da pracinha com catraca, a da quadra de desfile e a da praça da Esplanada. */
export const BOLAS_FLAVIO: BolaDef[] = [
  { id: "fl-bola-pracinha", x: 1492, y: 1000, cor: "#ffd23f" },
  { id: "fl-bola-quadra", x: 2820, y: 785, cor: "#ffffff" },
  { id: "fl-bola-praca", x: 1560, y: 1800, cor: "#1f8a4c" },
];
