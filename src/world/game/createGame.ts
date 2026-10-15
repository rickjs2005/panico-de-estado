import * as Phaser from "phaser";
import type { HeroId } from "../types";
import { BootScene } from "./BootScene";
import { WorldScene } from "./WorldScene";

export interface GameHandle {
  resize: (cssW: number, cssH: number) => void;
  destroy: () => void;
}

/**
 * Cria o jogo dentro de `parent`. O canvas usa a densidade de pixels da tela (até 2x)
 * e é reduzido por CSS, para o traço ficar nítido no celular.
 */
export function createGame(
  parent: HTMLElement,
  hero: HeroId,
  opts: { debug?: boolean; onProgress?: (p: number) => void; onError?: (msg: string) => void } = {},
): GameHandle {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.max(1, parent.clientWidth);
  const h = Math.max(1, parent.clientHeight);
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: "#8fcb68",
    banner: false,
    scale: { mode: Phaser.Scale.NONE, width: w * dpr, height: h * dpr, zoom: 1 / dpr },
    render: { antialias: true, roundPixels: false },
    // O mundo já limita picos de tempo e roda a física em subpassos; a suavização do
    // Phaser segurava o relógio em 16 ms sempre que a janela perdia o foco.
    fps: { smoothStep: false },
    input: { mouse: { preventDefaultWheel: false }, touch: { capture: false } },
    callbacks: {
      preBoot: (g) => {
        g.registry.set("dpr", dpr);
        g.registry.set("onProgress", opts.onProgress);
        g.registry.set("onError", opts.onError);
      },
    },
  });
  game.scene.add("boot", BootScene, false);
  game.scene.add("world", WorldScene, false);
  game.scene.start("boot", { hero, debug: opts.debug });

  return {
    resize: (cssW, cssH) => {
      if (cssW < 1 || cssH < 1) return;
      game.scale.resize(cssW * dpr, cssH * dpr);
    },
    destroy: () => game.destroy(true),
  };
}
