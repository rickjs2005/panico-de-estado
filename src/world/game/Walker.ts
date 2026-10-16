import * as Phaser from "phaser";
import type { Face } from "@/components/Puppet";
import type { LookId } from "../looks";
import type { Facing } from "../types";
import { HEAD_NECK } from "./art";
import { RES, tex } from "./bake";

/**
 * Personagem montado por partes (pernas, tronco, braços e cabeça) e animado por código.
 * A origem fica nos pés: a posição no chão define a ordem de desenho.
 */

const S = 1 / RES.char;

export class Walker {
  readonly root: Phaser.GameObjects.Container;
  /** Tudo menos a sombra: sobe nos pulos sem levar a sombra junto. */
  readonly body: Phaser.GameObjects.Container;
  private shadow: Phaser.GameObjects.Image;
  private legA: Phaser.GameObjects.Image;
  private legB: Phaser.GameObjects.Image;
  private torso: Phaser.GameObjects.Image;
  private armA: Phaser.GameObjects.Image;
  private armB: Phaser.GameObjects.Image;
  private head: Phaser.GameObjects.Image;
  private held: Phaser.GameObjects.Image;

  facing: Facing = "front";
  flip = false;
  carrying: string | null = null;
  /** Como leva o objeto: acima da cabeça (caixa, chicote) ou na mão (garrafa). */
  private carryEstilo: "cabeca" | "mao" = "cabeca";
  private phase = 0;
  private t = Math.random() * 10;
  private face: Face = "neutro";
  private faceUntil = 0;
  private lean = 0;

  constructor(
    private scene: Phaser.Scene,
    readonly look: LookId,
    x: number,
    y: number,
  ) {
    const img = (key: string) => scene.add.image(0, 0, key).setScale(S);
    this.shadow = scene.add.image(0, 0, "shadow").setScale(1 / RES.small);
    this.legA = img(tex.leg(look, "f")).setOrigin(0.4, 0);
    this.legB = img(tex.leg(look, "f")).setOrigin(0.4, 0);
    this.torso = img(tex.torso(look, "f")).setOrigin(0.5, 1);
    this.armA = img(tex.arm(look)).setOrigin(0.5, 0.06);
    this.armB = img(tex.arm(look)).setOrigin(0.5, 0.06);
    this.head = img(tex.head(look, "f")).setOrigin(0.5, HEAD_NECK);
    this.held = scene.add.image(0, 0, "chicote").setScale(1 / RES.small).setVisible(false);
    this.body = scene.add.container(0, 0, [this.legA, this.legB, this.armA, this.armB, this.torso, this.head, this.held]);
    this.root = scene.add.container(x, y, [this.shadow, this.body]);
    this.root.setDepth(y);
    this.applyFacing();
  }

  get x() {
    return this.root.x;
  }
  get y() {
    return this.root.y;
  }

  setPosition(x: number, y: number) {
    this.root.setPosition(x, y);
    this.root.setDepth(y);
  }

  setVisible(v: boolean) {
    this.root.setVisible(v);
  }

  setFacing(f: Facing, flip = false) {
    if (f === this.facing && flip === this.flip) return;
    this.facing = f;
    this.flip = flip;
    this.applyFacing();
  }

  /** Vira na direção de um deslocamento. */
  faceToward(dx: number, dy: number) {
    if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return;
    if (Math.abs(dx) > Math.abs(dy) * 0.9) this.setFacing("side", dx < 0);
    else this.setFacing(dy > 0 ? "front" : "back");
  }

  /** Muda a expressão por um tempo (só aparece de frente). */
  setFace(face: Face, ms = 1200) {
    this.face = face;
    this.faceUntil = this.scene.time.now + ms;
    this.refreshHead();
  }

  setCarry(key: string | null, estilo: "cabeca" | "mao" = "cabeca") {
    this.carrying = key;
    this.carryEstilo = estilo;
    if (key) this.held.setTexture(key).setScale((estilo === "mao" ? 0.5 : 1) / RES.small);
    this.held.setVisible(!!key);
  }

  drink() {
    const bottle = this.scene.add.image(15, -46, "cachaca").setScale(0.7 / RES.small);
    this.body.add(bottle);
    this.scene.tweens.add({ targets: bottle, angle: -65, x: 7, duration: 220, hold: 450, yoyo: true, onComplete: () => bottle.destroy() });
  }

  private refreshHead() {
    const v = this.facing === "front" ? "f" : this.facing === "back" ? "b" : "s";
    this.head.setTexture(tex.head(this.look, v, this.face));
  }

  private applyFacing() {
    const side = this.facing === "side";
    const v = this.facing === "front" ? "f" : this.facing === "back" ? "b" : "s";
    this.torso.setTexture(tex.torso(this.look, v));
    this.legA.setTexture(tex.leg(this.look, side ? "s" : "f"));
    this.legB.setTexture(tex.leg(this.look, side ? "s" : "f"));
    this.refreshHead();
    this.body.setScale(side && this.flip ? -1 : 1, 1);
    const far = 0xc8c2cc;
    this.legB.setTint(side ? far : 0xffffff);
    this.armB.setTint(side ? far : 0xffffff);
    // ordem de desenho dentro do boneco
    const order = side
      ? [this.armB, this.legB, this.legA, this.torso, this.armA, this.head, this.held]
      : [this.legA, this.legB, this.armA, this.armB, this.torso, this.head, this.held];
    order.forEach((o, i) => this.body.moveTo(o, i));
    if (side) {
      this.legA.setPosition(1, -14);
      this.legB.setPosition(-1, -14);
      this.armA.setPosition(2, -35);
      this.armB.setPosition(-2, -35);
    } else {
      this.legA.setPosition(-4.5, -14);
      this.legB.setPosition(4.5, -14);
      this.armA.setPosition(-13.5, -35);
      this.armB.setPosition(13.5, -35);
    }
  }

  /** Anima a caminhada. `speed` em px/s. */
  animate(dt: number, speed: number, running: boolean) {
    this.t += dt;
    if (this.faceUntil && this.scene.time.now > this.faceUntil) {
      this.faceUntil = 0;
      this.face = "neutro";
      this.refreshHead();
    }
    const moving = speed > 8;
    if (moving) this.phase += dt * (running ? 17 : 11);
    else this.phase *= Math.pow(0.001, dt);
    const s = Math.sin(this.phase);
    const a = Math.abs(s);
    const bob = moving ? -a * (running ? 2.4 : 1.7) : Math.sin(this.t * 2.4) * 0.5;
    const side = this.facing === "side";
    const carry = !!this.carrying && this.carryEstilo === "cabeca";
    const naMao = !!this.carrying && this.carryEstilo === "mao";

    if (side) {
      this.legA.setRotation(s * 0.6).setY(-14);
      this.legB.setRotation(-s * 0.6).setY(-14);
      this.armA.setRotation(carry ? -2.7 : -s * 0.7);
      this.armB.setRotation(carry ? -2.5 : s * 0.7);
    } else {
      this.legA.setRotation(0).setY(-14 - Math.max(0, s) * 3.2);
      this.legB.setRotation(0).setY(-14 - Math.max(0, -s) * 3.2);
      this.armA.setRotation(carry ? 2.9 : s * 0.45);
      this.armB.setRotation(carry ? -2.9 : -s * 0.45);
    }
    const targetLean = side && running && moving ? 0.12 : 0;
    this.lean += (targetLean - this.lean) * Math.min(1, dt * 10);
    this.torso.setY(-11 + bob).setRotation(this.lean);
    this.head.setY(-34 + bob).setX(this.lean * 14).setRotation(moving ? s * 0.04 : 0);
    this.armA.setY(-35 + bob);
    this.armB.setY(-35 + bob);
    if (carry) this.held.setPosition(side ? 6 : 0, -84 + bob).setRotation(Math.sin(this.t * 3) * 0.12);
    // na mão: a garrafa balança junto com o braço da frente
    else if (naMao) this.held.setPosition(side ? 9 : -15, -17 + bob).setRotation(side ? -0.25 + s * 0.2 : 0.18);
  }

  /** Sentado (pernas escondidas atrás do móvel) ou deitado (boneco tombado). `null` levanta. */
  pose: "sentado" | "deitado" | null = null;
  setPose(pose: "sentado" | "deitado" | null) {
    this.pose = pose;
    this.legA.setVisible(pose !== "sentado");
    this.legB.setVisible(pose !== "sentado");
    this.shadow.setVisible(pose === null);
    this.body.setRotation(pose === "deitado" ? -Math.PI / 2 : 0);
    this.body.setPosition(pose === "deitado" ? -6 : 0, pose === "sentado" ? 10 : pose === "deitado" ? -8 : 0);
  }

  /** Pulinho de susto. */
  hop(height = 16) {
    const base = this.body.y;
    this.scene.tweens.add({ targets: this.body, y: base - height, duration: 150, yoyo: true, ease: "Quad.easeOut", onComplete: () => this.body.setY(base) });
  }

  destroy() {
    this.root.destroy();
  }
}
