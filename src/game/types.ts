export type MeterKey = "panico" | "popularidade" | "caos";

export type Meters = Record<MeterKey, number>;

export type Effects = Partial<Meters>;

export type RouteId = "lula" | "flavio";

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
export type LineTone =
  | "msg"
  | "forward"
  | "system"
  | "aside"
  | "headline"
  | "fiction"
  | "meme"
  | "comment"
  | "dm";

export interface Line {
  from?: string;
  text: string;
  tone?: LineTone;
}

export type SceneKind = "chat" | "speech" | "live" | "press" | "home" | "feed" | "call";

export interface Choice {
  id: string;
  label: string;
  effects: Effects;
  /** Consequências, em frases curtas. */
  result: string[];
  /** Conta como "tentar ignorar o celular" (leva ao final do silêncio). */
  ignore?: boolean;
  /** Mensagem que invade a tela logo depois da escolha. */
  aftershock?: Line;
}

/** Linhas extras que só aparecem quando um indicador passa de um limite. */
export interface Variant {
  meter: MeterKey;
  min?: number;
  max?: number;
  lines: Line[];
}

export interface Round {
  id: string;
  kind: SceneKind;
  /** Nome do canal/app/grupo exibido no topo da cena. */
  channel: string;
  /** Linha pequena abaixo do canal (membros, espectadores etc.). */
  meta?: string;
  /** Hora exibida no relógio do celular. */
  time: string;
  lines: Line[];
  variants?: Variant[];
  choices: Choice[];
}

export type EndingId = "silencio" | "transmite" | "comissao" | "calma" | "outro";

export interface Ending {
  title: string;
  lines: string[];
  kicker: string;
}

export interface Notification {
  app: string;
  text: string;
}

export interface CastMember {
  name: string;
  role: string;
}

export interface RouteDef {
  id: RouteId;
  name: string;
  /** Boato central da rota (sempre apresentado como invenção). */
  rumor: string;
  tagline: string;
  ministry: string;
  intro: string[];
  cast: CastMember[];
  rounds: Round[];
  notifications: Notification[];
  ticker: string[];
  endings: Record<EndingId, Ending>;
}
