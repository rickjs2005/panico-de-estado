import type { HudState, Point } from "./types";

/**
 * Ponte entre o mundo (Phaser) e a interface (React).
 * O mundo publica o estado do HUD; a interface envia ações e o direcional virtual.
 */

interface Events {
  hud: HudState;
  toast: string;
  action: undefined;
  horn: undefined;
  pause: boolean;
  /** Entrou num distrito (só na cidade). */
  district: { name: string; tagline: string; color: string };
  /** Diálogo da campanha (mundo → React); null fecha. */
  dialogo: { quem: string | null; texto: string; i: number; total: number } | null;
  /** O jogador avançou ou pulou o diálogo (React → mundo). */
  "dialogo-acao": "avancar" | "pular";
  /** Selo do Passaporte do Absurdo conquistado. */
  selo: { id: string; nome: string; cor: string; icone: string; n: number; completa: boolean };
  /** Destino marcado no mapa (React → mundo); null limpa. */
  waypoint: (Point & { label: string }) | null;
  ready: undefined;
}

type Listener<K extends keyof Events> = (payload: Events[K]) => void;

class Bus {
  private listeners = new Map<keyof Events, Set<(payload: unknown) => void>>();

  on<K extends keyof Events>(event: K, fn: Listener<K>): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    const wrapped = fn as (payload: unknown) => void;
    set.add(wrapped);
    return () => {
      set.delete(wrapped);
    };
  }

  emit<K extends keyof Events>(event: K, ...payload: Events[K] extends undefined ? [] : [Events[K]]) {
    this.listeners.get(event)?.forEach((fn) => fn(payload[0]));
  }
}

export const bus = new Bus();

/** Entrada vinda da tela de toque. O teclado é lido direto pelo Phaser. */
export const touchInput = {
  /** Direcional virtual, de -1 a 1. */
  x: 0,
  y: 0,
  /** Botão "Ré" segurado (só no carro). */
  reverse: false,
};

export function resetTouchInput() {
  touchInput.x = 0;
  touchInput.y = 0;
  touchInput.reverse = false;
}

/**
 * Posição atual do protagonista, lida pelo mapa quando ele abre.
 * Fica fora do React para não redesenhar a interface a cada quadro.
 */
export const worldState = {
  x: 0,
  y: 0,
  angle: 0,
  inside: null as string | null,
  /** Prédio em que o jogador está (id), para o mapa marcar a porta. */
  insideBuilding: null as string | null,
  waypoint: null as (Point & { label: string }) | null,
  /** Destino da missão ativa (diferente do que o jogador marcou no mapa). */
  missaoAlvo: null as (Point & { label: string }) | null,
};
