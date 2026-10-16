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
  /** Campanha: missão ativa (com etapa e item carregado) ou a próxima a aceitar. */
  missao?: {
    titulo: string;
    numero: number;
    etapa: number;
    total: number;
    objetivo: string;
    carregando: string | null;
    /** Checklist da etapa (ferramenta por posto, pistas por pessoa…). */
    lista: { rotulo: string; feito: boolean }[];
    /** Indicadores sempre visíveis (níveis do som, etiquetas que batem…). */
    painel: { rotulo: string; valor: number; max: number }[];
    /** Nome do destino principal da etapa. */
    destino: string | null;
  } | null;
  /** Pistas e conversas importantes, da mais nova para a mais antiga. */
  diario?: { id: string; texto: string }[];
  /** O que o jogador decidiu em cada missão. */
  decisoes?: { missao: number; texto: string; lado: "obediente" | "rebelde" | "meio" }[];
  /** A cerimônia final já foi vista. */
  final?: boolean;
  proxima?: { titulo: string; numero: number; quem: string } | null;
  /** Ids dos selos do Passaporte do Absurdo já conquistados. */
  selos?: string[];
  completa?: boolean;
  /** Hora do dia da cidade ("08:30") e o período ("manhã"). */
  hora?: string;
  periodo?: string;
  /** Dentro de uma edificação (nome do prédio e do cômodo). */
  inside?: { building: string; name: string; room: string | null } | null;
}
