import type { Rect } from "../types";

/** Colisão simples de círculo contra retângulos e círculos, sem motor de física. */

export interface Solid extends Rect {
  tag?: string;
}

export interface Circle {
  x: number;
  y: number;
  r: number;
}

export interface PushResult {
  x: number;
  y: number;
  /** Primeiro retângulo atingido, se houve contato. */
  hit: Solid | null;
  /** Direção média do empurrão (normal da colisão). */
  nx: number;
  ny: number;
}

export function pushOut(x: number, y: number, r: number, rects: Solid[], circles: Circle[] = []): PushResult {
  let hit: Solid | null = null;
  let nx = 0;
  let ny = 0;
  for (let pass = 0; pass < 3; pass++) {
    let moved = false;
    for (const s of rects) {
      if (x + r <= s.x || x - r >= s.x + s.w || y + r <= s.y || y - r >= s.y + s.h) continue;
      const cx = Math.max(s.x, Math.min(x, s.x + s.w));
      const cy = Math.max(s.y, Math.min(y, s.y + s.h));
      let dx = x - cx;
      let dy = y - cy;
      const d2 = dx * dx + dy * dy;
      if (d2 >= r * r) continue;
      if (d2 > 1e-6) {
        const d = Math.sqrt(d2);
        dx /= d;
        dy /= d;
        x += dx * (r - d);
        y += dy * (r - d);
      } else {
        // centro dentro do retângulo: sai pelo lado mais próximo
        const left = x - s.x;
        const right = s.x + s.w - x;
        const up = y - s.y;
        const down = s.y + s.h - y;
        const m = Math.min(left, right, up, down);
        dx = m === left ? -1 : m === right ? 1 : 0;
        dy = m === up ? -1 : m === down ? 1 : 0;
        if (dx !== 0) dy = 0;
        x += dx * (m + r);
        y += dy * (m + r);
      }
      nx += dx;
      ny += dy;
      hit ??= s;
      moved = true;
    }
    for (const c of circles) {
      const dx = x - c.x;
      const dy = y - c.y;
      const min = r + c.r;
      const d2 = dx * dx + dy * dy;
      if (d2 >= min * min || d2 < 1e-6) continue;
      const d = Math.sqrt(d2);
      x += (dx / d) * (min - d);
      y += (dy / d) * (min - d);
      nx += dx / d;
      ny += dy / d;
      moved = true;
    }
    if (!moved) break;
  }
  const len = Math.hypot(nx, ny);
  return { x, y, hit, nx: len ? nx / len : 0, ny: len ? ny / len : 0 };
}

/** O círculo cabe aqui sem encostar em nada? */
export function isFree(x: number, y: number, r: number, rects: Solid[], circles: Circle[] = []): boolean {
  for (const s of rects) {
    const cx = Math.max(s.x, Math.min(x, s.x + s.w));
    const cy = Math.max(s.y, Math.min(y, s.y + s.h));
    if ((x - cx) ** 2 + (y - cy) ** 2 < r * r) return false;
  }
  for (const c of circles) if ((x - c.x) ** 2 + (y - c.y) ** 2 < (r + c.r) ** 2) return false;
  return true;
}

export function wrapAngle(a: number): number {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}
