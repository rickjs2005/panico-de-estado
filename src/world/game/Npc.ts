import type * as Phaser from "phaser";
import type { NpcDef } from "../map";
import type { Point } from "../types";
import { Walker } from "./Walker";

/**
 * Morador do bairro: fica parado, faz um percurso pelas calçadas ou, depois da
 * missão, corre de um lado para outro carregando caixas.
 */

export class Npc {
  readonly walker: Walker;
  private routeIdx = 1;
  private dir = 1;
  private pauseUntil = 0;
  private dodgeUntil = 0;
  lineIdx = 0;
  /** Percurso de correria (consequência da missão). */
  private rush: { from: Point; to: Point; forward: boolean } | null = null;
  /** Fica parado enquanto conversa. */
  private talkUntil = 0;
  /** A rotina diária manda neste morador (andando até um prédio ou dentro dele): o percurso próprio fica parado. */
  controlado = false;

  constructor(
    private scene: Phaser.Scene,
    readonly def: NpcDef,
  ) {
    this.walker = new Walker(scene, def.look, def.x, def.y);
    this.walker.setFacing(def.facing, def.flip);
  }

  get id() {
    return this.def.id;
  }
  get x() {
    return this.walker.x;
  }
  get y() {
    return this.walker.y;
  }

  /** Para e olha para alguém por um tempo. */
  attend(x: number, y: number, ms = 2600) {
    this.talkUntil = this.scene.time.now + ms;
    this.walker.faceToward(x - this.x, y - this.y);
  }

  startRush(from: Point, to: Point, box: boolean) {
    this.rush = { from, to, forward: true };
    this.walker.setPosition(from.x, from.y);
    this.walker.setCarry(box ? "box" : null);
  }

  /** Pula para o lado, longe do carro. Devolve false se ainda está se recuperando do último susto. */
  dodge(awayX: number, awayY: number, isFree: (x: number, y: number) => boolean): boolean {
    const now = this.scene.time.now;
    if (now < this.dodgeUntil) return false;
    this.dodgeUntil = now + 1400;
    const len = Math.hypot(awayX, awayY) || 1;
    const nx = this.x + (awayX / len) * 34;
    const ny = this.y + (awayY / len) * 34;
    this.walker.hop(18);
    this.walker.setFace("susto", 1200);
    if (isFree(nx, ny)) {
      this.scene.tweens.add({
        targets: this.walker.root,
        x: nx,
        y: ny,
        duration: 260,
        ease: "Quad.easeOut",
        onUpdate: () => this.walker.root.setDepth(this.walker.y),
      });
    }
    this.pauseUntil = now + 900;
    return true;
  }

  update(dt: number, now: number, near: Point | null) {
    let speed = 0;
    if (this.rush) {
      const target = this.rush.forward ? this.rush.to : this.rush.from;
      speed = this.moveToward(target, 150, dt);
      if (speed === 0) this.rush.forward = !this.rush.forward;
      this.walker.animate(dt, speed, true);
      return;
    }
    const route = this.def.route;
    if (route && now > this.pauseUntil && now > this.talkUntil) {
      const target = route[this.routeIdx];
      speed = this.moveToward(target, 42, dt);
      if (speed === 0) {
        this.pauseUntil = now + 500 + Math.random() * 900;
        if (this.def.loop) this.routeIdx = (this.routeIdx + 1) % route.length;
        else {
          if (this.routeIdx + this.dir >= route.length || this.routeIdx + this.dir < 0) this.dir *= -1;
          this.routeIdx += this.dir;
        }
      }
    } else if (!route && near && now > this.talkUntil) {
      // quem fica parado olha para o protagonista quando ele chega perto
      const dx = near.x - this.x;
      const dy = near.y - this.y;
      if (dx * dx + dy * dy < 110 * 110) this.walker.faceToward(dx, dy);
      else this.walker.setFacing(this.def.facing, this.def.flip);
    }
    this.walker.animate(dt, speed, false);
  }

  private moveToward(target: Point, speed: number, dt: number): number {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const d = Math.hypot(dx, dy);
    if (d < 2) return 0;
    const step = Math.min(d, speed * dt);
    this.walker.setPosition(this.x + (dx / d) * step, this.y + (dy / d) * step);
    this.walker.faceToward(dx, dy);
    return speed;
  }
}
