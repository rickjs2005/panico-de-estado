import * as Phaser from "phaser";
import { sound } from "@/lib/sound";
import type { TrafficLoop } from "../../cidade/vida";
import type { Point } from "../../types";
import { Car } from "../Car";
import type { Circle } from "../collide";

/**
 * Trânsito simples: carros seguem circuitos na faixa da direita, freiam diante de
 * qualquer obstáculo (pedestre, jogador, outro carro), buzinam quando ficam parados
 * e, se o bloqueio não sai do lugar, ultrapassam pela esquerda.
 */

const CRUISE = 150;
const CORNER = 70;
const ACCEL = 160;
const BRAKE = 520;

interface Seg {
  a: Point;
  b: Point;
  len: number;
  dir: Point;
  /** Lado esquerdo, para ultrapassar. */
  left: Point;
}

export interface Obstacle extends Point {
  r: number;
  /** Fica parado (carro estacionado, morador na fila): vale ultrapassar. */
  still: boolean;
}

export class TrafficCar {
  readonly car: Car;
  private segs: Seg[];
  private total: number;
  private s: number;
  private speed = CRUISE;
  private offset = 0;
  private blockedFor = 0;
  private overtaking = 0;
  private lastHorn = 0;

  constructor(
    scene: Phaser.Scene,
    loop: TrafficLoop,
    at: number,
    color: string,
    readonly id: string,
    private pass: number,
  ) {
    const pts = loop.path;
    this.segs = pts.map((a, i) => {
      const b = pts[(i + 1) % pts.length];
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      const dir = { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
      return { a, b, len, dir, left: { x: dir.y, y: -dir.x } };
    });
    this.total = this.segs.reduce((t, s) => t + s.len, 0);
    this.s = at * this.total;
    const p = this.pose(this.s);
    this.car = new Car(scene, p.x, p.y, p.angle, color);
  }

  /** Posição e direção ao longo do circuito, com curvas arredondadas (Bézier) nas esquinas. */
  private pose(s: number): Point & { angle: number; seg: Seg } {
    let rest = ((s % this.total) + this.total) % this.total;
    let i = 0;
    while (i < this.segs.length - 1 && rest > this.segs[i].len) {
      rest -= this.segs[i].len;
      i++;
    }
    const seg = this.segs[i];
    const R = 40;
    const curve = (prev: Seg, next: Seg, u: number) => {
      const c = next.a;
      const p0 = { x: c.x - prev.dir.x * R, y: c.y - prev.dir.y * R };
      const p2 = { x: c.x + next.dir.x * R, y: c.y + next.dir.y * R };
      const x = (1 - u) * (1 - u) * p0.x + 2 * u * (1 - u) * c.x + u * u * p2.x;
      const y = (1 - u) * (1 - u) * p0.y + 2 * u * (1 - u) * c.y + u * u * p2.y;
      const dx = 2 * (1 - u) * (c.x - p0.x) + 2 * u * (p2.x - c.x);
      const dy = 2 * (1 - u) * (c.y - p0.y) + 2 * u * (p2.y - c.y);
      return { x, y, angle: Math.atan2(dy, dx) };
    };
    if (seg.len - rest < R) {
      const next = this.segs[(i + 1) % this.segs.length];
      return { ...curve(seg, next, (R - (seg.len - rest)) / (2 * R)), seg };
    }
    if (rest < R) {
      const prev = this.segs[(i - 1 + this.segs.length) % this.segs.length];
      return { ...curve(prev, seg, (R + rest) / (2 * R)), seg };
    }
    return { x: seg.a.x + seg.dir.x * rest, y: seg.a.y + seg.dir.y * rest, angle: Math.atan2(seg.dir.y, seg.dir.x), seg };
  }

  private distToCorner(): number {
    let rest = ((this.s % this.total) + this.total) % this.total;
    for (const seg of this.segs) {
      if (rest <= seg.len) return seg.len - rest;
      rest -= seg.len;
    }
    return 0;
  }

  /** `obstacles`: tudo o que pode estar na frente. Devolve true se buzinou. */
  update(dt: number, now: number, obstacles: Obstacle[], others: TrafficCar[]): boolean {
    const here = this.pose(this.s);
    const dir = here.seg.dir;
    const look = 60 + this.speed * 0.45;
    let block: Obstacle | null = null;
    let blockDist = Infinity;
    const check = (o: Obstacle) => {
      const dx = o.x - this.car.x;
      const dy = o.y - this.car.y;
      const ahead = dx * dir.x + dy * dir.y;
      if (ahead < 10 || ahead > look + o.r) return;
      const side = Math.abs(dx * -dir.y + dy * dir.x);
      if (side > 20 + o.r) return;
      if (ahead < blockDist) {
        blockDist = ahead;
        block = o;
      }
    };
    for (const o of obstacles) if (Math.abs(o.x - this.car.x) < 260 && Math.abs(o.y - this.car.y) < 260) check(o);
    for (const c of others) if (c !== this && Math.abs(c.car.x - this.car.x) < 200 && Math.abs(c.car.y - this.car.y) < 200) check({ x: c.car.x, y: c.car.y, r: 16, still: c.speed < 5 });

    let target = this.distToCorner() < 70 ? CORNER : CRUISE;
    let honked = false;
    if (block) {
      const b = block as Obstacle;
      const gap = blockDist - b.r - 34;
      target = gap <= 0 ? 0 : Math.min(target, gap * 2.2);
      if (this.speed < 8) {
        this.blockedFor += dt;
        if (this.blockedFor > 1.2 && now - this.lastHorn > 3500) {
          this.lastHorn = now;
          honked = true;
        }
        // obstáculo parado: ultrapassa pela esquerda
        if (b.still && this.blockedFor > 2.4) this.overtaking = 2.6;
      }
    } else this.blockedFor = 0;
    if (this.overtaking > 0) {
      this.overtaking -= dt;
      if (!block) target = Math.max(target, 90);
    }
    const desired = this.overtaking > 0 ? this.pass : 0;
    this.offset += (desired - this.offset) * Math.min(1, dt * 2.2);
    if (this.speed < target) this.speed = Math.min(target, this.speed + ACCEL * dt);
    else this.speed = Math.max(target, this.speed - BRAKE * dt);
    this.s += this.speed * dt;

    const p = this.pose(this.s);
    this.car.x = p.x + p.seg.left.x * this.offset;
    this.car.y = p.y + p.seg.left.y * this.offset;
    this.car.angle = p.angle;
    this.car.speed = this.speed;
    return honked;
  }

  get speedNow() {
    return this.speed;
  }
  get circles(): Circle[] {
    return this.car.circles();
  }
}

export class Traffic {
  readonly cars: TrafficCar[] = [];

  constructor(scene: Phaser.Scene, loops: TrafficLoop[]) {
    for (const loop of loops) for (const c of loop.cars) this.cars.push(new TrafficCar(scene, loop, c.at, c.color, c.id, loop.pass));
  }

  update(dt: number, now: number, obstacles: Obstacle[], view: Phaser.Geom.Rectangle, hearing: Point | null) {
    for (const t of this.cars) {
      const honked = t.update(dt, now, obstacles, this.cars);
      const near = t.car.x > view.x - 200 && t.car.x < view.right + 200 && t.car.y > view.y - 200 && t.car.y < view.bottom + 200;
      t.car.root.setVisible(near);
      if (near) t.car.render(dt);
      if (honked && hearing && Math.hypot(hearing.x - t.car.x, hearing.y - t.car.y) < 420) sound.buzina();
    }
  }
}
