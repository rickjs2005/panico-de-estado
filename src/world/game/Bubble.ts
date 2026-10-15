import * as Phaser from "phaser";
import { INK } from "./art";

/** Balão de fala que acompanha quem fala e mantém o mesmo tamanho na tela. */

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

export class Bubble {
  readonly root: Phaser.GameObjects.Container;
  private until: number;
  private pop = { v: 0.2 };

  constructor(
    scene: Phaser.Scene,
    text: string,
    readonly anchor: () => { x: number; y: number },
    ms: number,
    resolution: number,
    tone: "fala" | "grito" = "fala",
  ) {
    const label = scene.add
      .text(0, 0, text, {
        fontFamily: FONT,
        fontSize: tone === "grito" ? "17px" : "15px",
        fontStyle: "bold",
        color: tone === "grito" ? "#b3122a" : INK,
        align: "center",
        wordWrap: { width: 210, useAdvancedWrap: true },
        resolution,
      })
      .setOrigin(0.5, 1);
    const w = label.width + 18;
    const h = label.height + 12;
    const g = scene.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.lineStyle(2.5, 0x1e1424, 1);
    g.fillRoundedRect(-w / 2, -h - 8, w, h, 10);
    g.strokeRoundedRect(-w / 2, -h - 8, w, h, 10);
    g.fillTriangle(-7, -9.5, 7, -9.5, 0, 0);
    g.lineBetween(-7, -8, 0, 0);
    g.lineBetween(7, -8, 0, 0);
    label.setPosition(0, -14);
    this.root = scene.add.container(0, 0, [g, label]).setDepth(100000);
    this.until = scene.time.now + ms;
    scene.tweens.add({ targets: this.pop, v: 1, duration: 140, ease: "Back.easeOut" });
  }

  /** Reposiciona; devolve false quando o balão já deve sumir. */
  update(now: number, scale: number): boolean {
    if (now > this.until) {
      this.root.destroy();
      return false;
    }
    const a = this.anchor();
    this.root.setPosition(a.x, a.y);
    this.root.setScale(scale * this.pop.v);
    return true;
  }

  destroy() {
    this.root.destroy();
  }
}
