import * as Phaser from "phaser";
import type { BolaDef } from "../../cidade/caes";
import type { Point } from "../../types";

/**
 * Bolas soltas na cidade: rolam quando o protagonista anda contra elas, quando ele chuta (ação "Chutar a
 * bola"), quando um carro passa por cima e quando um cão corre atrás. Batem nas paredes e nos objetos
 * sólidos (a mesma grade de caminhada) e param aos poucos.
 */

const INK = 0x1e1424;
const R = 7;

export class Bola {
  readonly root: Phaser.GameObjects.Container;
  private desenho: Phaser.GameObjects.Graphics;
  vx = 0;
  vy = 0;
  x: number;
  y: number;

  constructor(
    scene: Phaser.Scene,
    readonly def: BolaDef,
  ) {
    this.x = def.x;
    this.y = def.y;
    const sombra = scene.add.graphics();
    sombra.fillStyle(0x000000, 0.2);
    sombra.fillEllipse(0, 1, 15, 5);
    this.desenho = scene.add.graphics();
    this.desenho.fillStyle(Phaser.Display.Color.HexStringToColor(def.cor).color, 1);
    this.desenho.lineStyle(1.6, INK, 1);
    this.desenho.fillCircle(0, 0, R);
    this.desenho.strokeCircle(0, 0, R);
    this.desenho.fillStyle(INK, 1);
    this.desenho.fillCircle(0, 0, 2.4);
    this.desenho.fillCircle(-4.4, -3, 1.4);
    this.desenho.fillCircle(4.4, -3, 1.4);
    this.desenho.fillCircle(0, 5, 1.4);
    this.desenho.setY(-R);
    this.root = scene.add.container(def.x, def.y, [sombra, this.desenho]).setDepth(def.y);
  }

  get v() {
    return Math.hypot(this.vx, this.vy);
  }

  empurra(dx: number, dy: number, forca: number) {
    const len = Math.hypot(dx, dy) || 1;
    this.vx = (dx / len) * forca;
    this.vy = (dy / len) * forca;
  }

  /** Parada longe de casa por muito tempo: volta para a quadra (alguém devolveu a bola). */
  private paradaDesde = 0;

  update(dt: number, livre: (x: number, y: number) => boolean, visivel: boolean, agora = 0) {
    const longe = Math.hypot(this.x - this.def.x, this.y - this.def.y) > 320;
    if (this.v <= 1 && longe) {
      if (!this.paradaDesde) this.paradaDesde = agora;
      else if (agora - this.paradaDesde > 15000 && !visivel) {
        this.x = this.def.x;
        this.y = this.def.y;
        this.paradaDesde = 0;
      }
    } else this.paradaDesde = 0;
    if (this.v > 1) {
      const nx = this.x + this.vx * dt;
      const ny = this.y + this.vy * dt;
      // quica nas paredes, nos prédios e nos objetos sólidos
      if (livre(nx, this.y)) this.x = nx;
      else this.vx = -this.vx * 0.55;
      if (livre(this.x, ny)) this.y = ny;
      else this.vy = -this.vy * 0.55;
      const atrito = Math.exp(-dt * 2.2);
      this.vx *= atrito;
      this.vy *= atrito;
      if (this.v < 4) this.vx = this.vy = 0;
      this.desenho.rotation += ((this.vx >= 0 ? 1 : -1) * this.v * dt) / R;
    }
    this.root.setVisible(visivel);
    if (visivel) this.root.setPosition(this.x, this.y).setDepth(this.y);
  }
}

export interface Empurrador extends Point {
  vx: number;
  vy: number;
  r: number;
}

export class Bolas {
  readonly lista: Bola[];

  constructor(scene: Phaser.Scene, defs: BolaDef[]) {
    this.lista = defs.map((d) => new Bola(scene, d));
  }

  /** Quem encosta numa bola (protagonista andando, carro) a empurra na direção do próprio movimento. */
  update(dt: number, livre: (x: number, y: number) => boolean, empurradores: Empurrador[], visivel: (x: number, y: number) => boolean, agora = 0) {
    for (const b of this.lista) {
      for (const e of empurradores) {
        const d = Math.hypot(b.x - e.x, b.y - e.y);
        const vel = Math.hypot(e.vx, e.vy);
        if (d < e.r + R && vel > 10) {
          // sai da frente e ganha a velocidade de quem empurrou (um pouco mais, para rolar)
          const ax = (b.x - e.x) / (d || 1);
          const ay = (b.y - e.y) / (d || 1);
          const dirx = e.vx / vel + ax * 0.6;
          const diry = e.vy / vel + ay * 0.6;
          b.empurra(dirx, diry, Math.min(260, Math.max(b.v, vel * 1.35)));
          b.x = e.x + ax * (e.r + R + 1);
          b.y = e.y + ay * (e.r + R + 1);
        }
      }
      b.update(dt, livre, visivel(b.x, b.y), agora);
    }
  }

  proxima(p: Point, raio: number): Bola | null {
    let melhor: Bola | null = null;
    let d = raio;
    for (const b of this.lista) {
      const db = Math.hypot(b.x - p.x, b.y - p.y);
      if (db < d) {
        d = db;
        melhor = b;
      }
    }
    return melhor;
  }

  porId(id: string) {
    return this.lista.find((b) => b.def.id === id);
  }

  destroy() {
    for (const b of this.lista) b.root.destroy();
  }
}
