/** Tipos compartilhados entre o mundo (Phaser) e a interface (React). */

export type HeroId = "lula" | "flavio";

/** Vista do personagem: de frente, de costas ou de lado (a lateral espelha para a esquerda). */
export type Facing = "front" | "back" | "side";

/** Ação contextual mostrada no botão e no atalho E. */
export type ActionLabel = "Falar" | "Pegar" | "Entrar" | "Sair" | "Entregar" | "Fechar" | "Assinar" | "Despachar" | "Beber";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Point {
  x: number;
  y: number;
}

/** O que a interface precisa saber do mundo. */
export interface HudState {
  mode: "pe" | "carro";
  /** Texto da ação contextual (na cidade pode ser longo: "Entrar no mercadinho"). */
  action: string | null;
  missionTitle: string | null;
  objective: string;
  done: boolean;
  stamina: number | null;
  completed: number;
  total: number;
  /** Onde o protagonista está: distrito ou interior (só na cidade). */
  place?: string | null;
  /** A cidade tem mapa. */
  map?: boolean;
  /** Dentro de uma edificação (nome do prédio e do cômodo). */
  inside?: { building: string; name: string; room: string | null } | null;
}
