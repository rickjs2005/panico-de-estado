export type MeterKey = "panico" | "popularidade" | "caos";

export type Meters = Record<MeterKey, number>;

export type Effects = Partial<Meters>;

export type RouteId = "lula" | "flavio";

/** Expressões dos bonecos. */
export type Mood = "neutro" | "preocupado" | "deboche" | "susto" | "comemora" | "desespero";

/** Identificador de um boneco em `characters.ts`. */
export type CharacterId = string;

/**
 * Como uma linha aparece na tela:
 * - msg: balão de mensagem comum
 * - forward: mensagem "encaminhada com frequência"
 * - system: aviso cinza do sistema/narração curta
 * - aside: narração em itálico (o que você vê)
 * - headline: manchete de veículo fictício
 * - fiction: selo deixando claro que o boato é inventado
 * - meme: descrição de uma imagem/meme
 * - comment: comentário de live
 * - dm: mensagem privada para você
 */
export type LineTone = "msg" | "forward" | "system" | "aside" | "headline" | "fiction" | "meme" | "comment" | "dm";

export interface Line {
  from?: string;
  text: string;
  tone?: LineTone;
}

export type SceneKind = "chat" | "speech" | "live" | "press" | "home" | "feed" | "call";

/** Quem aparece em cena e com que cara começa. */
export interface CastSlot {
  id: CharacterId;
  mood?: Mood;
}

/** Resultado de uma escolha ou de um minijogo. */
export interface Outcome {
  effects: Effects;
  /** Consequências, em frases curtas. */
  result: string[];
  /** Como cada boneco em cena reage. Quem não estiver aqui reage pelo efeito no pânico. */
  reactions?: Record<CharacterId, Mood>;
  /** Conta como "tentar ignorar o celular" (leva ao final do silêncio). */
  ignore?: boolean;
  /** Mensagem que invade a tela logo depois. */
  aftershock?: Line;
}

export interface Choice extends Outcome {
  id: string;
  label: string;
}

/** Linhas extras que só aparecem quando um indicador passa de um limite. */
export interface Variant {
  meter: MeterKey;
  min?: number;
  max?: number;
  lines: Line[];
}

interface BaseRound {
  id: string;
  kind: SceneKind;
  /** Nome do canal/app/grupo exibido no topo da cena. */
  channel: string;
  /** Linha pequena abaixo do canal (membros, espectadores etc.). */
  meta?: string;
  /** Hora exibida no relógio do celular. */
  time: string;
  /** Bonecos em cena. */
  cast: CastSlot[];
  lines: Line[];
  variants?: Variant[];
  /** Instrução curta acima da interação. */
  prompt: string;
}

/** Escolha narrativa. Com `timer`, vira escolha contra o relógio. */
export interface ChoiceRound extends BaseRound {
  mode: "choice";
  /** "cards" mostra as opções como crises para atender primeiro. */
  layout?: "list" | "cards";
  /** Segundos para escolher. Sem timer, o jogador tem todo o tempo do mundo (e o celular cobra). */
  timer?: number;
  /** O que acontece se o tempo acabar. */
  timeout?: Outcome;
  choices: Choice[];
}

/** Minijogos devolvem um de três desempenhos. */
export interface Outcomes {
  good: Outcome;
  mid: Outcome;
  bad: Outcome;
}

/** Tocar nas notificações antes que cubram a tela. */
export interface TapRound extends BaseRound {
  mode: "tap";
  /** Duração em segundos. */
  duration: number;
  /** Intervalo entre notificações (ms), antes do ajuste pelo pânico. */
  spawnEvery: number;
  /** Quantas cabem na tela antes de cobrir tudo. */
  maxOnScreen: number;
  items: { from: string; text: string }[];
  outcomes: Outcomes;
}

/**
 * Cortar o sinal antes do trecho recortável.
 * Em `script`, `|` marca a partir de onde cortar é seguro e `[...]` marca o trecho perigoso.
 */
export interface InterruptRound extends BaseRound {
  mode: "interrupt";
  speaker: string;
  script: string;
  /** Milissegundos por palavra. */
  msPerWord: number;
  /** good = corte na hora certa, mid = cedo demais, bad = tarde demais. */
  outcomes: Outcomes;
}

/** Arrastar o boato para a lixeira; cada um apagado pode virar cópias. */
export interface DragRound extends BaseRound {
  mode: "drag";
  duration: number;
  rumor: { from: string; text: string };
  /** Rótulos das cópias que surgem quando um boato vai para a lixeira. */
  copies: string[];
  outcomes: Outcomes;
}

export type Round = ChoiceRound | TapRound | InterruptRound | DragRound;

export type EndingId = "silencio" | "transmite" | "comissao" | "calma" | "outro";

export interface Ending {
  title: string;
  lines: string[];
  kicker: string;
  /** Bonecos na cena final. */
  cast: CastSlot[];
}

export interface Notification {
  app: string;
  text: string;
}

export interface RouteDef {
  id: RouteId;
  name: string;
  tagline: string;
  ministry: string;
  /** Lista curta dos boatos da rota (todos inventados). */
  rumors: string[];
  intro: string[];
  /** Personagens mostrados na apresentação da rota. */
  cast: CharacterId[];
  /** Você (assessor/a), chefe e presidente caricato desta rota. */
  roles: { player: CharacterId; boss: CharacterId; president: CharacterId };
  rounds: Round[];
  notifications: Notification[];
  ticker: string[];
  /** Manchetes extras que entram no rodapé quando o caos passa de 50. */
  chaosTicker: string[];
  endings: Record<EndingId, Ending>;
}
