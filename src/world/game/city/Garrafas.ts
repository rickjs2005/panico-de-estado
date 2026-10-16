import * as Phaser from "phaser";
import type { CachacaStop } from "../../cidade/types";
import type { Point, Rect } from "../../types";
import { RES } from "../bake";

/**
 * Garrafas de cachaça de verdade nas paradas da rua: um caixote com três garrafas em cada placa
 * CACHAÇA · ENERGIA. O protagonista pega uma (ela vai para a mão), bebe quando quiser e joga a garrafa
 * vazia: ela voa, quica, rola e some depois de um tempo, ou cai direto na lixeira se houver uma por perto.
 * O caixote se reabastece sozinho, uma garrafa de cada vez.
 */

const POR_CAIXOTE = 3;
const REPOSICAO_MS = 20000;

interface Caixote {
  stop: CachacaStop;
  garrafas: Phaser.GameObjects.Image[];
  cheias: number;
  reporEm: number;
}

export class Garrafas {
  private caixotes = new Map<string, Caixote>();

  constructor(
    private scene: Phaser.Scene,
    paradas: CachacaStop[],
    registra: (o: Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Visible, bounds: Rect) => void,
    private calmo: boolean,
  ) {
    for (const stop of paradas) {
      const cx = stop.x + 34;
      const cy = stop.y - 2;
      const caixa = scene.add.graphics().setDepth(cy);
      caixa.fillStyle(0x9c6b3e, 1);
      caixa.lineStyle(1.6, 0x1e1424, 1);
      caixa.fillRect(cx - 16, cy - 12, 32, 12);
      caixa.strokeRect(cx - 16, cy - 12, 32, 12);
      caixa.lineBetween(cx - 16, cy - 6, cx + 16, cy - 6);
      registra(caixa, { x: cx - 20, y: cy - 20, w: 40, h: 24 });
      const garrafas: Phaser.GameObjects.Image[] = [];
      for (let i = 0; i < POR_CAIXOTE; i++) {
        const g = scene.add.image(cx - 10 + i * 10, cy - 10, "cachaca").setOrigin(0.5, 1).setScale(0.42 / RES.small).setDepth(cy + 1);
        registra(g, { x: cx - 20, y: cy - 40, w: 40, h: 40 });
        garrafas.push(g);
      }
      this.caixotes.set(stop.id, { stop, garrafas, cheias: POR_CAIXOTE, reporEm: 0 });
    }
  }

  /** Tem garrafa cheia no caixote desta parada? */
  tem(id: string): boolean {
    return (this.caixotes.get(id)?.cheias ?? 0) > 0;
  }

  /** Tira uma garrafa do caixote. Devolve false se acabou. */
  pega(id: string, agora: number): boolean {
    const c = this.caixotes.get(id);
    if (!c || c.cheias <= 0) return false;
    c.cheias--;
    c.garrafas[c.cheias].setAlpha(0);
    if (!c.reporEm) c.reporEm = agora + REPOSICAO_MS;
    return true;
  }

  /** Reabastece os caixotes aos poucos. */
  update(agora: number) {
    for (const c of this.caixotes.values()) {
      if (c.cheias >= POR_CAIXOTE || !c.reporEm || agora < c.reporEm) continue;
      const g = c.garrafas[c.cheias];
      g.setAlpha(1);
      if (!this.calmo) this.scene.tweens.add({ targets: g, scaleY: { from: 0, to: g.scaleY }, duration: 260, ease: "Back.easeOut" });
      c.cheias++;
      c.reporEm = c.cheias < POR_CAIXOTE ? agora + REPOSICAO_MS : 0;
    }
  }

  /**
   * Joga a garrafa vazia: se há uma lixeira perto, ela voa até lá e some (cesta!); senão cai alguns passos
   * à frente, quica, rola e desaparece depois de um tempo. Devolve true se acertou a lixeira.
   */
  joga(de: Point, dir: Point, lixeiras: Point[], livre: (x: number, y: number) => boolean, cai: () => void): boolean {
    const lixeira = lixeiras.filter((l) => Math.hypot(l.x - de.x, l.y - de.y) < 170).sort((a, b) => Math.hypot(a.x - de.x, a.y - de.y) - Math.hypot(b.x - de.x, b.y - de.y))[0];
    const len = Math.hypot(dir.x, dir.y) || 1;
    let alvo: Point = lixeira ? { x: lixeira.x, y: lixeira.y - 8 } : { x: de.x + (dir.x / len) * 80, y: de.y + (dir.y / len) * 80 + 6 };
    if (!lixeira && !livre(alvo.x, alvo.y)) alvo = { x: de.x + (dir.x / len) * 30, y: de.y + (dir.y / len) * 30 + 6 };
    const g = this.scene.add.image(de.x, de.y - 40, "cachaca").setOrigin(0.5, 0.5).setScale(0.55 / RES.small).setDepth(de.y + 50);
    const x0 = g.x;
    const y0 = g.y;
    const altura = lixeira ? 90 : 60;
    const giro = { t: 0 };
    this.scene.tweens.add({
      targets: giro,
      t: 1,
      duration: lixeira ? 620 : 520,
      ease: "Linear",
      onUpdate: () => {
        const t = giro.t;
        g.x = x0 + (alvo.x - x0) * t;
        g.y = y0 + (alvo.y - y0) * t - Math.sin(Math.PI * t) * altura;
        g.angle = t * (this.calmo ? 90 : 720);
        g.setDepth(Math.max(g.y + 30, de.y));
      },
      onComplete: () => {
        cai();
        if (lixeira) {
          this.scene.tweens.add({ targets: g, scale: 0, alpha: 0, duration: 200, onComplete: () => g.destroy() });
          return;
        }
        g.setDepth(alvo.y);
        if (this.calmo) {
          this.scene.time.delayedCall(6000, () => g.destroy());
          return;
        }
        // quica e rola um pouco antes de parar
        this.scene.tweens.add({ targets: g, y: alvo.y - 10, duration: 140, yoyo: true, ease: "Quad.easeOut" });
        this.scene.tweens.add({ targets: g, x: alvo.x + (dir.x / len) * 18, angle: g.angle + 200, delay: 280, duration: 700, ease: "Quad.easeOut" });
        this.scene.tweens.add({ targets: g, alpha: 0, delay: 9000, duration: 800, onComplete: () => g.destroy() });
      },
    });
    return !!lixeira;
  }
}
