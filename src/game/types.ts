/**
 * Modelo de dados do jogo.
 *
 * Cada rota tem 3 episódios + um desfecho. Cada episódio é uma lista de "beats"
 * (passos de encenação) que o EpisodePlayer executa em ordem: personagens entram,
 * falam, mudam de cara, objetos mudam de estado, e em algum momento o jogador age
 * numa tarefa. O resultado da tarefa escolhe qual ramo de beats continua.
 */

export type RouteId = "lula" | "flavio";

/** Expressões e poses dos bonecos. */
export type Mood =
  | "neutro"
  | "preocupado"
  | "deboche"
  | "susto"
  | "comemora"
  | "desespero"
  | "aponta"
  | "carrega"
  | "fala";

export type CharacterId = string;

/** Objetos desenhados em `Props.tsx`. */
export type PropId = string;

/** Cenários desenhados em `Backdrops.tsx`. */
export type BackdropId = "igreja" | "cozinha" | "correios" | "transportadora" | "secao" | "refinaria" | "loja";

/** Posição horizontal no palco, de 0 (esquerda) a 100 (direita). */
export type StageX = number;

export type Beat =
  /** Personagem entra em cena (desliza de um lado). */
  | { t: "enter"; who: CharacterId; x: StageX; from?: "left" | "right"; mood?: Mood; holding?: PropId; flip?: boolean; scale?: number }
  | { t: "exit"; who: CharacterId; to?: "left" | "right" }
  | { t: "move"; who: CharacterId; x: StageX }
  | { t: "mood"; who: CharacterId; mood: Mood }
  /** Muda a cara de vários de uma vez. */
  | { t: "react"; moods: Record<CharacterId, Mood> }
  | { t: "hold"; who: CharacterId; item: PropId | null }
  /** Balão de fala. Espera o jogador tocar para seguir. */
  | { t: "say"; who: CharacterId; text: string; mood?: Mood }
  /** Legenda de narração. Espera o jogador tocar. */
  | { t: "narrate"; text: string }
  /** Liga, desliga ou troca o estado de um objeto do cenário. */
  | { t: "set"; key: string; value: string | null }
  | { t: "sfx"; name: Sfx }
  /** Pausa curta para o timing da piada (ms). */
  | { t: "pause"; ms: number }
  /** Notificação secundária no cantinho do celular. */
  | { t: "phone"; from: string; text: string }
  /** Tarefa do jogador. O resultado escolhe um ramo. */
  | { t: "task"; task: Task; branches: Record<string, Beat[]> }
  /** Reação curta. Cada opção tem seu ramo e pode marcar um flag. */
  | { t: "choice"; prompt: string; options: ChoiceOption[] }
  /** Registra o resultado do episódio (para o desfecho) e o objeto ganho. */
  | { t: "outcome"; result: EpisodeResult; reward?: Reward };

export interface ChoiceOption {
  label: string;
  flag?: string;
  beats: Beat[];
  /** Só aparece com pelo menos N vitórias nos episódios. */
  minWins?: number;
  /** Só aparece com no máximo N vitórias. */
  maxWins?: number;
}

export type Sfx = "porta" | "carimbo" | "ping" | "sucesso" | "falha" | "pop" | "buzina" | "tique";

export type EpisodeResult = "vitoria" | "meio" | "desastre";

export interface Reward {
  prop: PropId;
  name: string;
  /** Uma linha engraçada sobre o objeto. */
  blurb: string;
}

/* ------------------------------------------------------------------ */
/* Tarefas: três mecânicas reutilizáveis                               */
/* ------------------------------------------------------------------ */

/** Tocar em objetos: achar os alvos numa pilha que cresce. */
export interface FindTask {
  kind: "find";
  objective: string;
  /** Objetos que já começam na mesa. */
  start: FindItem[];
  /** Objetos que vão sendo despejados na mesa com o tempo. */
  incoming: FindItem[];
  /** Intervalo de despejo (ms). */
  every: number;
  /** Segundos. Sem timer, não há pressa. */
  timer?: number;
  /** Quantos alvos o jogador precisa achar para encerrar. */
  need: number;
  /** Com mais de N itens, a mesa desaba (resultado "desabou"). */
  collapseAt: number;
}

export interface FindItem {
  id: string;
  prop: PropId;
  label: string;
  /** Se for um alvo, devolve esta chave de resultado ao ser escolhido. */
  target?: string;
  /** Piada curta ao tocar num objeto errado. */
  quip?: string;
}

/**
 * Levar objetos a destinos (arrastar, ou tocar no objeto e depois no destino).
 * Serve para montar o café, encaixar estados no mapa, esvaziar a caixa etc.
 */
export interface AssignTask {
  kind: "assign";
  objective: string;
  items: AssignItem[];
  slots: AssignSlot[];
  timer?: number;
  /**
   * Opcional: objetos "estragam" com o tempo (ex.: a máquina carimba um por vez).
   * Item estragado não pode mais ser movido.
   */
  spoil?: { every: number; label: string };
  /** Visual do tabuleiro. */
  layout?: "grid" | "mapa";
  /** Erros tolerados para ainda contar como resultado "otimo" (padrão 1). */
  forgive?: number;
}

export interface AssignItem {
  id: string;
  prop: PropId;
  label: string;
  /** Destino certo. Sem `goal`, qualquer destino aceita. */
  goal?: string;
  /** Piada quando cai no destino errado. */
  wrong?: string;
  /** Piada quando cai no destino certo. */
  right?: string;
  /** Peso (para a caixa com limite). */
  weight?: number;
}

export interface AssignSlot {
  id: string;
  label: string;
  /** Capacidade de peso; mostra uma régua e encerra quando ficar no limite. */
  capacity?: number;
  /** Posição no layout "mapa" (porcentagens). */
  at?: { x: number; y: number };
}

/**
 * Sequência de exigências: a cada passo, escolha um "documento" (resposta) para
 * apresentar. Respostas espertas avançam; respostas burocráticas geram mais exigências.
 */
export interface StepsTask {
  kind: "steps";
  objective: string;
  /** Quem "pede" (aparece no visor). */
  asker: string;
  steps: {
    demand: string;
    options: { label: string; prop?: PropId; good: boolean; reply: string }[];
  }[];
  /** Erros tolerados antes do sistema travar de vez. */
  maxErrors: number;
}

export type Task = FindTask | AssignTask | StepsTask;

/* ------------------------------------------------------------------ */
/* Episódios e rotas                                                   */
/* ------------------------------------------------------------------ */

export interface Episode {
  id: string;
  title: string;
  /** Objetivo em uma frase, mostrado no topo. */
  objective: string;
  backdrop: BackdropId;
  /** Estado inicial dos objetos de cenário (ex.: porta fechada). */
  scene?: Record<string, string>;
  beats: Beat[];
}

export interface Ending {
  id: string;
  title: string;
  lines: string[];
  /** Imagem final: quem fica em cena e com que cara. */
  tableau: { who: CharacterId; mood: Mood; holding?: PropId; x: StageX }[];
  backdrop: BackdropId;
}

export interface RouteDef {
  id: RouteId;
  name: string;
  /** Frase curta do cartão de escolha. */
  tagline: string;
  /** A lista de tarefas banais do dia. */
  errands: string[];
  president: CharacterId;
  episodes: Episode[];
  finale: Episode;
  /** Finais, escolhidos por `pickEnding` a partir dos resultados e da escolha final. */
  endings: Record<string, Ending>;
}
