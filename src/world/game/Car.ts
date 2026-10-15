import * as Phaser from "phaser";
import type { Face } from "@/components/Puppet";
import type { LookId } from "../looks";
import type { Circle } from "./collide";
import { HEAD_NECK } from "./art";
import { RES, tex } from "./bake";

/**
 * Carro feito de fatias empilhadas: cada camada é a mesma vista de cima, girada junto
 * e deslocada alguns pixels para cima. Em qualquer ângulo ele mostra lateral e altura,
 * como as fachadas do bairro.
 */

const SLICES: { layer: "base" | "lateral" | "topo" | "parabrisa"; h: number }[] = [
  { layer: "base", h: 0 },
  { layer: "base", h: 1.3 },
  { layer: "lateral", h: 2.6 },
  { layer: "lateral", h: 3.9 },
  { layer: "lateral", h: 5.2 },
  { layer: "lateral", h: 6.5 },
  { layer: "lateral", h: 7.8 },
  { layer: "topo", h: 9.1 },
  { layer: "parabrisa", h: 10.4 },
  { layer: "parabrisa", h: 11.7 },
  { layer: "parabrisa", h: 13 },
];

export const CAR = {
  accel: 310,
  brake: 640,
  max: 390,
  reverseMax: 150,
  steer: 2.8,
  radius: 15,
  /** Distância dos dois círculos de colisão ao centro. */
  axle: 18,
};

export interface CarControls {
  /** 1 acelera, -1 freia e depois dá ré. */
  throttle: number;
  /** -1 esquerda, 1 direita. */
  steer: number;
  handbrake: boolean;
}

export class Car {
  readonly root: Phaser.GameObjects.Container;
  private slices: { img: Phaser.GameObjects.Image; h: number }[] = [];
  private shadow: Phaser.GameObjects.Image;
  private driver: Phaser.GameObjects.Image;
  private whip: Phaser.GameObjects.Image;
  private driverLook: LookId | null = null;
  private driverFace: Face = "neutro";
  private faceUntil = 0;
  speed = 0;
  cargo = false;
  private t = 0;

  constructor(
    private scene: Phaser.Scene,
    public x: number,
    public y: number,
    public angle: number,
  ) {
    const s = 1 / RES.car;
    this.shadow = scene.add.image(3, 4, tex.car("sombra")).setScale(s);
    const parts: Phaser.GameObjects.GameObject[] = [this.shadow];
    for (const sl of SLICES) {
      const img = scene.add.image(0, -sl.h, tex.car(sl.layer)).setScale(s);
      this.slices.push({ img, h: sl.h });
      parts.push(img);
    }
    this.whip = scene.add.image(0, 0, "chicote").setScale(1 / RES.small).setOrigin(0.13, 0.87).setVisible(false);
    this.driver = scene.add.image(0, 0, "shadow").setScale((1 / RES.char) * 0.68).setOrigin(0.5, HEAD_NECK).setVisible(false);
    parts.push(this.whip, this.driver);
    this.root = scene.add.container(x, y, parts);
    this.render(0);
  }

  circles(): Circle[] {
    const c = Math.cos(this.angle);
    const s = Math.sin(this.angle);
    return [
      { x: this.x + c * CAR.axle, y: this.y + s * CAR.axle, r: CAR.radius },
      { x: this.x - c * CAR.axle, y: this.y - s * CAR.axle, r: CAR.radius },
    ];
  }

  setDriver(look: LookId | null) {
    this.driverLook = look;
    this.driver.setVisible(!!look);
  }

  setDriverFace(face: Face, ms = 800) {
    this.driverFace = face;
    this.faceUntil = this.scene.time.now + ms;
  }

  setCargo(on: boolean) {
    this.cargo = on;
    this.whip.setVisible(on);
  }

  /** Atualiza velocidade e direção. A colisão é resolvida pela cena. */
  drive(dt: number, ctl: CarControls) {
    let v = this.speed;
    if (ctl.throttle > 0) {
      if (v < 0) v = Math.min(0, v + CAR.brake * dt);
      else v += CAR.accel * ctl.throttle * dt * (1 - (v / CAR.max) * 0.45);
    } else if (ctl.throttle < 0) {
      if (v > 0) v = Math.max(0, v - CAR.brake * -ctl.throttle * dt);
      else v -= CAR.accel * 0.7 * -ctl.throttle * dt;
    } else {
      const drag = (110 + Math.abs(v) * 0.7) * dt;
      v = Math.abs(v) <= drag ? 0 : v - Math.sign(v) * drag;
    }
    if (ctl.handbrake) {
      const b = 950 * dt;
      v = Math.abs(v) <= b ? 0 : v - Math.sign(v) * b;
    }
    this.speed = Math.max(-CAR.reverseMax, Math.min(CAR.max, v));
    const grip = Math.min(1, Math.abs(this.speed) / 120);
    this.angle += ctl.steer * CAR.steer * grip * Math.sign(this.speed) * dt;
    this.x += Math.cos(this.angle) * this.speed * dt;
    this.y += Math.sin(this.angle) * this.speed * dt;
  }

  render(dt: number) {
    this.t += dt;
    this.root.setPosition(this.x, this.y).setDepth(this.y + 14);
    this.shadow.setRotation(this.angle);
    for (const s of this.slices) s.img.setPosition(0, -s.h).setRotation(this.angle);
    const c = Math.cos(this.angle);
    const s = Math.sin(this.angle);
    const local = (lx: number, ly: number) => ({ x: c * lx - s * ly, y: s * lx + c * ly });

    if (this.driverLook) {
      if (this.faceUntil && this.scene.time.now > this.faceUntil) {
        this.faceUntil = 0;
        this.driverFace = "neutro";
      }
      const p = local(4, -6);
      const view = Math.abs(c) > Math.abs(s) * 1.1 ? "s" : s > 0 ? "f" : "b";
      this.driver.setTexture(tex.head(this.driverLook, view, this.driverFace));
      this.driver.setScale((view === "s" && c < 0 ? -1 : 1) * (1 / RES.char) * 0.68, (1 / RES.char) * 0.68);
      this.driver.setPosition(p.x, p.y - 9.1 + 2 + Math.sin(this.t * 18) * Math.min(1, Math.abs(this.speed) / 200) * 0.6);
    }
    if (this.cargo) {
      const p = local(-12, 5);
      const wobble = Math.sin(this.t * 13) * 0.35 * Math.min(1, Math.abs(this.speed) / 120) + Math.sin(this.t * 2.5) * 0.12;
      this.whip.setPosition(p.x, p.y - 12).setRotation(this.angle + Math.PI + Math.PI / 4 + wobble);
      // o chicote fica atrás do motorista quando o carro sobe na tela
      this.root.moveTo(this.whip, s < 0 ? this.root.length - 1 : this.root.length - 2);
    }
  }
}
