import type * as Phaser from "phaser";
import type { Rect } from "../../types";

type Visible = Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Visible;

/**
 * Só desenha o que está perto da câmera. Cada objeto estático entra com os seus limites;
 * de tempos em tempos, quem está fora da área visível (mais uma margem) fica invisível
 * e deixa de custar desenho.
 */
export class Culler {
  private items: { obj: Visible; b: Rect; hidden: boolean }[] = [];
  visibleCount = 0;

  add(obj: Visible, b: Rect) {
    this.items.push({ obj, b, hidden: false });
  }

  /** Remove objetos destruídos (estados de lugares que foram redesenhados). */
  prune() {
    this.items = this.items.filter((i) => i.obj.scene);
  }

  update(view: Rect, margin: number) {
    const x0 = view.x - margin;
    const y0 = view.y - margin;
    const x1 = view.x + view.w + margin;
    const y1 = view.y + view.h + margin;
    let count = 0;
    for (const it of this.items) {
      const show = it.b.x < x1 && it.b.x + it.b.w > x0 && it.b.y < y1 && it.b.y + it.b.h > y0;
      if (show) count++;
      if (show === !it.hidden) continue;
      it.hidden = !show;
      it.obj.setVisible(show);
    }
    this.visibleCount = count;
  }

  get size() {
    return this.items.length;
  }
}
