import * as Phaser from "phaser";
import { sound } from "@/lib/sound";
import { bus, touchInput } from "../bridge";
import {
  BUILDINGS,
  FACTORY,
  ITEMS,
  LOTS,
  NPCS,
  PROPS,
  ROADS,
  SPAWN,
  WIRES,
  WORLD,
  solidRects,
  type BuildingDef,
} from "../map";
import { advance, CHICOTE_EXPRESSO, LULA_OBJECTIVE, stepOf, type Line, type Mission, type MissionEvent } from "../mission";
import { isDone, markDone } from "../save";
import type { ActionLabel, HeroId, HudState } from "../types";
import { INK, propArt } from "./art";
import { RES, tex } from "./bake";
import { Bubble } from "./Bubble";
import { Car, CAR, type CarControls } from "./Car";
import { isFree, pushOut, wrapAngle, type Circle, type Solid } from "./collide";
import { Npc } from "./Npc";
import { Walker } from "./Walker";

export interface WorldData {
  hero: HeroId;
  debug?: boolean;
}

const WALK = 118;
const RUN = 200;
const PLAYER_R = 10;
const TALK_DIST = 60;
const CAR_DIST = 64;
const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

const DODGE_LINES = ["Olha o carro!", "Ê, motorista!", "Calma, presidente!", "Isso é calçada!"];
const SPILL_LINES: Record<string, string[]> = {
  laranja: ["Minhas laranjas!", "Laranja não é boliche!"],
  banana: ["Minhas bananas!", "Agora é vitamina!"],
  abacaxi: ["Meu abacaxi!", "Quem vai descascar esse abacaxi?"],
};

interface Candidate {
  label: ActionLabel;
  priority: number;
  dist: number;
  run: () => void;
}

type Keys = Record<"W" | "A" | "S" | "D" | "UP" | "DOWN" | "LEFT" | "RIGHT" | "SHIFT" | "E" | "ENTER" | "SPACE" | "H", Phaser.Input.Keyboard.Key>;

export class WorldScene extends Phaser.Scene {
  private hero!: HeroId;
  private debug = false;
  private solids: Solid[] = [];
  private player!: Walker;
  private car!: Car;
  private mode: "pe" | "carro" = "pe";
  private npcs: Npc[] = [];
  private keys!: Keys;
  private mission: Mission | null = null;
  private step = "";
  private holding: string | null = null;
  private buildings: { def: BuildingDef; img: Phaser.GameObjects.Image }[] = [];
  private bubbles = new Map<string, Bubble>();
  private marker!: Phaser.GameObjects.Image;
  private ring!: Phaser.GameObjects.Graphics;
  private edgeArrow!: Phaser.GameObjects.Image;
  private chicoteItem!: Phaser.GameObjects.Image;
  private faixaText!: Phaser.GameObjects.Text;
  private factoryImg: Phaser.GameObjects.Image | null = null;
  private gears: Phaser.GameObjects.Image[] = [];
  private fruits: Phaser.GameObjects.Image[] = [];
  private emote: Phaser.GameObjects.Image | null = null;
  private emoteUntil = 0;
  private hudKey = "";
  private candidate: Candidate | null = null;
  private actionQueued = false;
  private lastActionAt = 0;
  private busyUntil = 0;
  private pendingExit = false;
  private camTarget = { x: 0, y: 0 };
  private zoom = 1;
  private zoomTarget = 1;
  private baseZoom = 1;
  private dpr = 1;
  private consequence = false;
  private nextSmoke = 0;
  private nextCrack = 0;
  private nextWorkerLine = 0;
  private convo: Phaser.Time.TimerEvent[] = [];
  private spillCooldown = new Map<string, number>();
  private unsubs: (() => void)[] = [];

  constructor() {
    super("world");
  }

  init(data: WorldData) {
    this.hero = data.hero;
    this.debug = !!data.debug;
    this.dpr = (this.registry.get("dpr") as number) ?? 1;
  }

  create() {
    this.mode = "pe";
    this.holding = null;
    this.consequence = false;
    this.bubbles.clear();
    this.npcs = [];
    this.buildings = [];
    this.fruits = [];
    this.gears = [];

    this.drawGround();
    this.placeBuildings();
    this.placeProps();
    this.drawWires();
    this.solids = solidRects();

    for (const def of NPCS) this.npcs.push(new Npc(this, def));
    this.car = new Car(this, SPAWN.car.x, SPAWN.car.y, SPAWN.car.angle);
    this.player = new Walker(this, this.hero, SPAWN.hero.x, SPAWN.hero.y);
    this.player.setFacing("front");

    this.marker = this.add.image(0, 0, "marker").setScale(1 / RES.small).setDepth(90000).setVisible(false);
    this.ring = this.add.graphics().setDepth(5).setVisible(false);
    this.edgeArrow = this.add.image(0, 0, "marker").setScale(1 / RES.small).setDepth(95000).setVisible(false);

    // missão
    if (this.hero === CHICOTE_EXPRESSO.hero) {
      this.mission = CHICOTE_EXPRESSO;
      if (isDone(this.hero, this.mission.id)) {
        this.step = this.mission.finalStep;
        this.chicoteItem.setVisible(false);
        this.applyConsequence(false);
      } else {
        this.step = this.mission.steps[0].id;
      }
    } else {
      this.mission = null;
      this.step = "";
    }

    // controles
    const kb = this.input.keyboard!;
    this.keys = kb.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT,E,ENTER,SPACE,H") as Keys;
    this.keys.E.on("down", () => this.queueAction());
    this.keys.ENTER.on("down", () => this.queueAction());
    this.keys.H.on("down", () => this.horn());
    this.unsubs.push(bus.on("action", () => this.queueAction()));
    this.unsubs.push(bus.on("horn", () => this.horn()));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.cleanup());

    // câmera
    const cam = this.cameras.main;
    cam.setBounds(0, 0, WORLD.w, WORLD.h);
    cam.setBackgroundColor("#8fcb68");
    this.computeZoom();
    this.zoom = this.zoomTarget;
    cam.setZoom(this.zoom);
    this.camTarget = { x: this.player.x, y: this.player.y - 30 };
    cam.centerOn(this.camTarget.x, this.camTarget.y);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.computeZoom, this);

    if (this.debug) this.exposeDebug();
    this.emitHud(true);
    bus.emit("ready");
  }

  private cleanup() {
    if (this.debug) delete (window as unknown as Record<string, unknown>).__pde;
    this.unsubs.forEach((u) => u());
    this.unsubs = [];
    this.scale.off(Phaser.Scale.Events.RESIZE, this.computeZoom, this);
    this.convo.forEach((t) => t.remove());
    this.convo = [];
  }

  // ---------------------------------------------------------------- cenário

  private drawGround() {
    const ts = 1 / RES.tile;
    this.add.tileSprite(0, 0, WORLD.w, WORLD.h, "tile:calcada").setOrigin(0).setTileScale(ts).setDepth(-100);
    for (const lot of LOTS) {
      if (lot.surface === "calcada") continue;
      this.add.tileSprite(lot.x, lot.y, lot.w, lot.h, `tile:${lot.surface}`).setOrigin(0).setTileScale(ts).setDepth(-90);
    }
    const g = this.add.graphics().setDepth(-80);
    const asphalt = 0x4b4b57;
    g.fillStyle(asphalt, 1);
    for (const r of ROADS.h) g.fillRect(0, r.y0, WORLD.w, r.y1 - r.y0);
    for (const r of ROADS.v) g.fillRect(r.x0, 0, r.x1 - r.x0, WORLD.h);
    // meio-fio
    g.fillStyle(0xeae5d9, 1);
    for (const r of ROADS.h) {
      g.fillRect(0, r.y0 - 3, WORLD.w, 3);
      g.fillRect(0, r.y1, WORLD.w, 3);
    }
    for (const r of ROADS.v) {
      g.fillRect(r.x0 - 3, 0, 3, WORLD.h);
      g.fillRect(r.x1, 0, 3, WORLD.h);
    }
    g.fillStyle(asphalt, 1);
    for (const h of ROADS.h) for (const v of ROADS.v) g.fillRect(v.x0, h.y0 - 3, v.x1 - v.x0, h.y1 - h.y0 + 6);
    for (const h of ROADS.h) for (const v of ROADS.v) g.fillRect(v.x0 - 3, h.y0, v.x1 - v.x0 + 6, h.y1 - h.y0);
    const inCross = (x: number, y: number) =>
      ROADS.h.some((h) => y > h.y0 - 40 && y < h.y1 + 40) && ROADS.v.some((v) => x > v.x0 - 40 && x < v.x1 + 40);
    // faixas centrais
    g.fillStyle(0xf2c230, 1);
    for (const r of ROADS.h) {
      const cy = (r.y0 + r.y1) / 2;
      for (let x = 10; x < WORLD.w; x += 48) if (!inCross(x + 13, cy)) g.fillRect(x, cy - 2, 26, 4);
    }
    g.fillStyle(0xffffff, 0.9);
    for (const r of ROADS.v) {
      const cx = (r.x0 + r.x1) / 2;
      for (let y = 10; y < WORLD.h; y += 48) if (!inCross(cx, y + 13)) g.fillRect(cx - 2, y, 4, 26);
    }
    // faixas de pedestre
    g.fillStyle(0xffffff, 0.92);
    for (const h of ROADS.h) {
      for (const v of ROADS.v) {
        for (let x = v.x0 + 8; x < v.x1 - 8; x += 16) {
          g.fillRect(x, h.y0 - 34, 9, 26);
          g.fillRect(x, h.y1 + 8, 9, 26);
        }
        for (let y = h.y0 + 8; y < h.y1 - 8; y += 16) {
          g.fillRect(v.x0 - 34, y, 26, 9);
          g.fillRect(v.x1 + 8, y, 26, 9);
        }
      }
    }
  }

  private placeBuildings() {
    for (const def of BUILDINGS) {
      const top = def.top ?? 0;
      const img = this.add
        .image(def.x, def.y - def.h - top, tex.building(def.id))
        .setOrigin(0, 0)
        .setScale(1 / RES.building)
        .setDepth(def.y + def.d);
      this.buildings.push({ def, img });
      if (def.kind === "fabrica") this.factoryImg = img;
    }
  }

  private placeProps() {
    for (const p of PROPS) {
      const art = propArt(p.kind, p.variant);
      this.add
        .image(p.x, p.y, tex.prop(p.kind, p.variant))
        .setOrigin(0.5, art.originY)
        .setScale(1 / RES.prop)
        .setDepth(p.y);
      if (p.kind === "faixa") {
        const top = p.y - art.h * art.originY;
        this.faixaText = this.add
          .text(p.x, top + 22, CHICOTE_EXPRESSO.banner.before, {
            fontFamily: FONT,
            fontSize: "17px",
            fontStyle: "900",
            color: "#c62835",
            resolution: 3,
          })
          .setOrigin(0.5)
          .setDepth(p.y + 0.5);
      }
    }
    this.chicoteItem = this.add
      .image(ITEMS.chicote.x, ITEMS.chicote.y, "chicote")
      .setScale(1 / RES.small)
      .setDepth(ITEMS.chicote.y + 30);
    this.tweens.add({ targets: this.chicoteItem, angle: { from: -8, to: 8 }, duration: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
  }

  private drawWires() {
    const g = this.add.graphics().setDepth(60000);
    g.lineStyle(1.1, 0x1e1424, 0.32);
    for (const [a, b] of WIRES) {
      for (const off of [0, 6]) {
        const y0 = a.y - 104 + off;
        const curve = new Phaser.Curves.QuadraticBezier(
          new Phaser.Math.Vector2(a.x, y0),
          new Phaser.Math.Vector2((a.x + b.x) / 2, y0 + 22),
          new Phaser.Math.Vector2(b.x, y0),
        );
        curve.draw(g, 16);
      }
    }
  }

  // ---------------------------------------------------------------- câmera

  private computeZoom() {
    this.dpr = (this.registry.get("dpr") as number) ?? 1;
    const cssW = this.scale.width / this.dpr;
    const cssH = this.scale.height / this.dpr;
    this.baseZoom = Phaser.Math.Clamp(Math.min(cssW, cssH) / 470, 0.75, 1.6);
    this.zoomTarget = this.baseZoom * this.dpr * (this.mode === "carro" ? 0.78 : 1);
  }

  /** Escala para que balões e setas tenham sempre o mesmo tamanho na tela. */
  private uiScale() {
    return this.dpr / this.cameras.main.zoom;
  }

  private updateCamera(dt: number) {
    let tx: number;
    let ty: number;
    if (this.mode === "carro") {
      const look = Phaser.Math.Clamp(this.car.speed * 0.35, -60, 140);
      tx = this.car.x + Math.cos(this.car.angle) * look;
      ty = this.car.y - 10 + Math.sin(this.car.angle) * look;
    } else {
      tx = this.player.x;
      ty = this.player.y - 30;
    }
    const k = 1 - Math.exp(-dt * 7);
    this.camTarget.x += (tx - this.camTarget.x) * k;
    this.camTarget.y += (ty - this.camTarget.y) * k;
    this.zoom += (this.zoomTarget - this.zoom) * (1 - Math.exp(-dt * 4));
    const cam = this.cameras.main;
    cam.setZoom(this.zoom);
    cam.centerOn(this.camTarget.x, this.camTarget.y);
  }

  // ---------------------------------------------------------------- laço principal

  update(_time: number, deltaMs: number) {
    // Com o FPS baixo, a física roda em subpassos para não perder velocidade nem atravessar obstáculos.
    const frame = Math.min(deltaMs / 1000, 0.1);
    const steps = Math.max(1, Math.ceil(frame / (1 / 60)));
    const dt = frame / steps;
    const now = this.time.now;
    const k = this.keys;
    const kx = (k.D.isDown || k.RIGHT.isDown ? 1 : 0) - (k.A.isDown || k.LEFT.isDown ? 1 : 0);
    const ky = (k.S.isDown || k.DOWN.isDown ? 1 : 0) - (k.W.isDown || k.UP.isDown ? 1 : 0);

    for (let i = 0; i < steps; i++) {
      if (this.mode === "pe") {
        this.updateWalking(dt, kx, ky);
        this.car.drive(dt, { throttle: 0, steer: 0, handbrake: true });
        this.collideCar(0);
      } else {
        const speedBefore = this.car.speed;
        this.car.drive(dt, this.carControls(kx, ky));
        this.collideCar(speedBefore);
        this.player.setPosition(this.car.x, this.car.y);
        if (this.pendingExit && Math.abs(this.car.speed) < 25) {
          this.pendingExit = false;
          this.exitCar();
        }
      }
    }
    this.car.render(frame);

    const playerPos = this.mode === "pe" ? { x: this.player.x, y: this.player.y } : null;
    for (const n of this.npcs) n.update(frame, now, playerPos);
    this.checkDodges();

    this.updateConsequence(frame, now);
    this.updateCandidate();
    if (this.actionQueued) {
      this.actionQueued = false;
      this.runAction();
    }
    this.updateCamera(frame);
    this.updateBuildingsAlpha(frame);
    this.updateMarker(now);
    this.updateBubbles(now);
    this.emitHud();
  }

  private updateWalking(dt: number, kx: number, ky: number) {
    let mx = kx;
    let my = ky;
    let mag = Math.hypot(mx, my);
    let running = this.keys.SHIFT.isDown;
    if (mag === 0) {
      const tm = Math.hypot(touchInput.x, touchInput.y);
      if (tm > 0.12) {
        mx = touchInput.x;
        my = touchInput.y;
        mag = Math.min(1, tm);
        running = tm > 0.85;
      }
    }
    if (this.time.now < this.busyUntil) mag = 0;
    let speed = 0;
    if (mag > 0) {
      const dirX = mx / Math.hypot(mx, my);
      const dirY = my / Math.hypot(mx, my);
      speed = (running ? RUN : WALK) * Math.min(1, mag);
      const nx = this.player.x + dirX * speed * dt;
      const ny = this.player.y + dirY * speed * dt;
      const res = pushOut(nx, ny, PLAYER_R, this.solids, this.walkObstacles());
      this.player.setPosition(res.x, res.y);
      this.player.faceToward(dirX, dirY);
    }
    this.player.animate(dt, speed, running);
  }

  private walkObstacles(): Circle[] {
    const list: Circle[] = this.car.circles().map((c) => ({ ...c, r: c.r + 2 }));
    for (const n of this.npcs) list.push({ x: n.x, y: n.y, r: 9 });
    return list;
  }

  private carControls(kx: number, ky: number): CarControls {
    const handbrake = this.keys.SPACE.isDown || this.pendingExit;
    if (this.pendingExit) return { throttle: 0, steer: 0, handbrake: true };
    if (kx !== 0 || ky !== 0) return { throttle: -ky, steer: kx, handbrake };
    if (touchInput.reverse) return { throttle: -1, steer: touchInput.x, handbrake: false };
    const m = Math.min(1, Math.hypot(touchInput.x, touchInput.y));
    if (m < 0.15) return { throttle: 0, steer: 0, handbrake };
    const desired = Math.atan2(touchInput.y, touchInput.x);
    const diff = wrapAngle(desired - this.car.angle);
    const v = this.car.speed;
    // "À frente" tem uma faixa menor quando o carro já está de ré (por exemplo, depois de quicar
    // numa batida), para ele voltar a andar para frente assim que o jogador apontar para lá.
    const ahead = Math.abs(diff) < (v < -20 ? 1.6 : 2.3);
    if (ahead || v > 60) {
      return { throttle: m * (Math.abs(diff) > 1.3 ? 0.45 : 1), steer: Phaser.Math.Clamp(diff * 1.8, -1, 1), handbrake: false };
    }
    // apontou para trás com o carro parado: dá ré girando a traseira para lá
    const back = wrapAngle(desired - (this.car.angle + Math.PI));
    return { throttle: -m, steer: Phaser.Math.Clamp(-back * 1.8, -1, 1), handbrake: false };
  }

  private collideCar(speedBefore: number) {
    const car = this.car;
    let hitTag: string | undefined;
    let bumped = false;
    for (let i = 0; i < 2; i++) {
      for (const c of car.circles()) {
        const res = pushOut(c.x, c.y, c.r, this.solids);
        const dx = res.x - c.x;
        const dy = res.y - c.y;
        if (dx !== 0 || dy !== 0) {
          car.x += dx;
          car.y += dy;
          bumped = true;
          hitTag ??= res.hit?.tag;
        }
      }
    }
    if (!bumped) return;
    const impact = Math.abs(speedBefore);
    car.speed = -car.speed * 0.25;
    if (this.mode !== "carro") return;
    if (hitTag?.startsWith("barraca") && impact > 60) this.spill(hitTag);
    if (impact > 120) {
      this.cameras.main.shake(110, 0.003 * Math.min(2, impact / 200));
      sound.carimbo();
      car.setDriverFace("susto", 700);
    }
  }

  private checkDodges() {
    if (Math.abs(this.car.speed) < 60) return;
    const [front, back] = this.car.circles();
    for (const n of this.npcs) {
      for (const c of [front, back]) {
        const dx = n.x - c.x;
        const dy = n.y - c.y;
        if (dx * dx + dy * dy < 34 * 34) {
          // foge para o lado, perpendicular ao carro
          const side = Math.sign(-Math.sin(this.car.angle) * dx + Math.cos(this.car.angle) * dy) || 1;
          const ax = -Math.sin(this.car.angle) * side;
          const ay = Math.cos(this.car.angle) * side;
          if (n.dodge(ax, ay, (x, y) => isFree(x, y, 8, this.solids))) {
            this.say(n.id, Phaser.Utils.Array.GetRandom(DODGE_LINES), 1400, "grito");
          }
          break;
        }
      }
    }
  }

  // ---------------------------------------------------------------- interação

  private queueAction() {
    const now = this.time.now;
    if (now - this.lastActionAt < 280) return;
    this.lastActionAt = now;
    this.actionQueued = true;
  }

  private updateCandidate() {
    if (this.mode === "carro") {
      this.candidate = { label: "Sair", priority: 0, dist: 0, run: () => this.requestExit() };
      return;
    }
    const px = this.player.x;
    const py = this.player.y;
    const cands: Candidate[] = [];
    const dCar = Math.hypot(this.car.x - px, this.car.y - py);
    if (dCar < CAR_DIST) cands.push({ label: "Entrar", priority: 2, dist: dCar, run: () => this.enterCar() });
    if (this.mission && this.step === "buscar" && !this.holding) {
      const d = Math.hypot(ITEMS.chicote.x - px, ITEMS.chicote.y + 20 - py);
      if (d < TALK_DIST) cands.push({ label: "Pegar", priority: 1, dist: d, run: () => this.pickChicote() });
    }
    for (const n of this.npcs) {
      const d = Math.hypot(n.x - px, n.y - py);
      if (d > TALK_DIST) continue;
      if (n.id === "patrao" && this.holding === "chicote" && this.step === "entregar") {
        cands.push({ label: "Entregar", priority: 0, dist: d, run: () => this.deliver(n) });
      } else {
        cands.push({ label: "Falar", priority: 2, dist: d, run: () => this.talk(n) });
      }
    }
    cands.sort((a, b) => a.priority - b.priority || a.dist - b.dist);
    this.candidate = cands[0] ?? null;
  }

  private runAction() {
    if (this.time.now < this.busyUntil) return;
    this.candidate?.run();
  }

  private enterCar() {
    this.mode = "carro";
    this.pendingExit = false;
    this.player.setVisible(false);
    this.car.setDriver(this.hero);
    this.car.setCargo(this.holding === "chicote");
    this.computeZoom();
    this.busyUntil = this.time.now + 250;
    sound.porta();
    this.emitHud(true);
  }

  private requestExit() {
    if (Math.abs(this.car.speed) > 40) {
      this.pendingExit = true;
      return;
    }
    this.exitCar();
  }

  /** Procura um lugar livre ao lado do carro. Nunca deixa o personagem preso. */
  private exitSpot(): { x: number; y: number } | null {
    const c = Math.cos(this.car.angle);
    const s = Math.sin(this.car.angle);
    const offsets = [
      [2, -34],
      [2, 34],
      [-52, 0],
      [52, 0],
      [0, -56],
      [0, 56],
      [-70, -30],
      [-70, 30],
      [70, -30],
      [70, 30],
    ];
    const carCircles = this.car.circles().map((cc) => ({ ...cc, r: cc.r + 2 }));
    const npcCircles = this.npcs.map((n) => ({ x: n.x, y: n.y, r: 9 }));
    for (const [lx, ly] of offsets) {
      const x = this.car.x + c * lx - s * ly;
      const y = this.car.y + s * lx + c * ly;
      if (x < 12 || y < 12 || x > WORLD.w - 12 || y > WORLD.h - 12) continue;
      if (isFree(x, y, PLAYER_R + 1, this.solids, [...carCircles, ...npcCircles])) return { x, y };
    }
    return null;
  }

  private exitCar() {
    const spot = this.exitSpot();
    if (!spot) {
      bus.emit("toast", "Sem espaço para sair aqui. Ande um pouco com o carro.");
      return;
    }
    this.mode = "pe";
    this.car.speed = 0;
    this.player.setPosition(spot.x, spot.y);
    this.player.setVisible(true);
    this.player.faceToward(spot.x - this.car.x, spot.y - this.car.y);
    this.car.setDriver(null);
    this.car.setCargo(false);
    this.player.setCarry(this.holding);
    this.computeZoom();
    this.busyUntil = this.time.now + 200;
    sound.porta();
    this.emitHud(true);
  }

  private pickChicote() {
    if (this.holding || this.step !== "buscar") return;
    this.holding = "chicote";
    this.chicoteItem.setVisible(false);
    this.player.setCarry("chicote");
    this.player.setFace("comemora", 1200);
    sound.ping();
    this.missionEvent({ type: "pickup", item: "chicote" });
  }

  private talk(n: Npc) {
    n.attend(this.player.x, this.player.y);
    this.player.faceToward(n.x - this.player.x, n.y - this.player.y);
    if (this.missionEvent({ type: "talk", npc: n.id })) return;
    const lines = this.linesFor(n);
    const line = lines[n.lineIdx % lines.length];
    n.lineIdx++;
    this.say(n.id, line, 2600);
    sound.pop();
  }

  private linesFor(n: Npc): string[] {
    const byStep = this.mission?.talk[this.step]?.[n.id];
    if (byStep) return byStep;
    if (this.hero === "lula" && n.def.linesLula) return n.def.linesLula;
    return n.def.lines;
  }

  private deliver(n: Npc) {
    if (this.holding !== "chicote" || this.step !== "entregar") return;
    n.attend(this.player.x, this.player.y, 6000);
    if (!this.missionEvent({ type: "deliver", npc: n.id, item: "chicote" })) return;
    this.holding = null;
    this.player.setCarry(null);
    n.walker.setCarry("chicote");
    this.busyUntil = this.time.now + 600;
  }

  private horn() {
    if (this.mode !== "carro") return;
    sound.buzina();
    for (const n of this.npcs) {
      if (Math.hypot(n.x - this.car.x, n.y - this.car.y) < 170) {
        n.walker.hop(12);
        n.walker.setFace("susto", 900);
      }
    }
  }

  // ---------------------------------------------------------------- missão

  private missionEvent(e: MissionEvent): boolean {
    if (!this.mission) return false;
    const t = advance(this.mission, this.step, e);
    if (!t) return false;
    this.step = t.to;
    if (this.step === this.mission.finalStep) markDone(this.hero, this.mission.id);
    this.playLines(t.lines);
    this.emitHud(true);
    return true;
  }

  private playLines(lines: Line[]) {
    this.convo.forEach((t) => t.remove());
    this.convo = [];
    let delay = 0;
    for (const line of lines) {
      const ms = line.who === "hero" ? 900 : Phaser.Math.Clamp(1100 + line.text.length * 42, 1500, 3200);
      this.convo.push(
        this.time.delayedCall(delay, () => {
          if (line.cue === "consequencia") this.applyConsequence(true);
          if (line.who === "hero") this.showEmote();
          else {
            this.say(line.who, line.text, ms + 300, line.cue ? "grito" : "fala");
            sound.pop();
          }
        }),
      );
      delay += ms;
    }
  }

  private speakerPos(id: string): { x: number; y: number } {
    if (id === "hero") return this.mode === "carro" ? { x: this.car.x, y: this.car.y - 30 } : { x: this.player.x, y: this.player.y - 78 };
    const n = this.npcs.find((m) => m.id === id);
    if (!n) return { x: 0, y: 0 };
    return { x: n.x, y: n.y - (n.walker.carrying ? 100 : 78) };
  }

  private say(id: string, text: string, ms: number, tone: "fala" | "grito" = "fala") {
    this.bubbles.get(id)?.destroy();
    const res = Math.min(4, Math.max(2, this.dpr * 1.5));
    const b = new Bubble(this, text, () => this.speakerPos(id), ms, res, tone);
    this.bubbles.set(id, b);
    b.update(this.time.now, this.uiScale());
  }

  private showEmote() {
    this.emote?.destroy();
    this.emote = this.add.image(0, 0, "emote").setScale(1 / RES.small).setDepth(100001);
    this.emoteUntil = this.time.now + 1000;
    this.player.setFace("susto", 900);
    this.car.setDriverFace("susto", 900);
    sound.ping();
  }

  private updateBubbles(now: number) {
    const s = this.uiScale();
    for (const [id, b] of this.bubbles) if (!b.update(now, s)) this.bubbles.delete(id);
    if (this.emote) {
      if (now > this.emoteUntil) {
        this.emote.destroy();
        this.emote = null;
      } else {
        const p = this.speakerPos("hero");
        this.emote.setPosition(p.x, p.y - 6).setScale((1 / RES.small) * s * 1.3);
      }
    }
  }

  private markerTarget(): { x: number; y: number } | null {
    if (!this.mission) return null;
    const step = stepOf(this.mission, this.step);
    const target = step?.target;
    if (!target) return null;
    if (target.kind === "item") return this.holding ? null : { x: ITEMS.chicote.x, y: ITEMS.chicote.y + 20 };
    const n = this.npcs.find((m) => m.id === target.id);
    return n ? { x: n.x, y: n.y } : null;
  }

  private updateMarker(now: number) {
    const t = this.markerTarget();
    const show = !!t;
    this.marker.setVisible(show);
    this.ring.setVisible(show);
    this.edgeArrow.setVisible(false);
    if (!t) return;
    const s = this.uiScale();
    const bob = Math.sin(now / 180) * 5 * s;
    this.marker.setPosition(t.x, t.y - 92 - bob).setScale((1 / RES.small) * s * 1.1);
    const pulse = 1 + Math.sin(now / 250) * 0.12;
    this.ring.clear();
    this.ring.lineStyle(3, 0xffd23f, 0.95);
    this.ring.strokeEllipse(t.x, t.y, 46 * pulse, 18 * pulse);
    this.ring.setDepth(t.y - 1);

    const view = this.cameras.main.worldView;
    const m = 34 * s;
    if (t.x < view.x || t.x > view.right || t.y - 60 < view.y || t.y > view.bottom) {
      const cx = view.centerX;
      const cy = view.centerY;
      const dx = t.x - cx;
      const dy = t.y - 40 - cy;
      const kx = dx !== 0 ? (view.width / 2 - m) / Math.abs(dx) : Infinity;
      const ky = dy !== 0 ? (view.height / 2 - m) / Math.abs(dy) : Infinity;
      const k = Math.min(kx, ky);
      this.edgeArrow
        .setVisible(true)
        .setPosition(cx + dx * k, cy + dy * k)
        .setRotation(Math.atan2(dy, dx) - Math.PI / 2)
        .setScale((1 / RES.small) * s * 1.25);
    }
  }

  private updateBuildingsAlpha(dt: number) {
    const px = this.mode === "carro" ? this.car.x : this.player.x;
    const py = this.mode === "carro" ? this.car.y : this.player.y;
    for (const { def, img } of this.buildings) {
      const top = def.y - def.h - (def.top ?? 0);
      const behind = px > def.x - 10 && px < def.x + def.w + 10 && py - 30 > top && py < def.y + def.d - 4;
      const target = behind ? 0.45 : 1;
      img.alpha += (target - img.alpha) * Math.min(1, dt * 8);
    }
  }

  // ---------------------------------------------------------------- consequências

  private spill(tag: string) {
    const now = this.time.now;
    if ((this.spillCooldown.get(tag) ?? 0) > now) return;
    this.spillCooldown.set(tag, now + 2500);
    const prop = PROPS.find((p) => p.id === tag);
    if (!prop) return;
    const kind = prop.variant ?? "laranja";
    const dirX = Math.cos(this.car.angle);
    const dirY = Math.sin(this.car.angle);
    for (let i = 0; i < 10; i++) {
      const fx = prop.x + (Math.random() - 0.5) * 70;
      const fy = prop.y - 18;
      const img = this.add
        .image(fx, fy, `fruit:${kind}`)
        .setScale(1.7 / RES.small)
        .setDepth(fy);
      const ang = Math.atan2(dirY, dirX) + (Math.random() - 0.5) * 2.2;
      const dist = 50 + Math.random() * 90;
      const tx = fx + Math.cos(ang) * dist;
      const ty = Phaser.Math.Clamp(fy + Math.abs(Math.sin(ang)) * dist * 0.7 + 30, ROADS.h[0].y0 + 6, ROADS.h[0].y1 - 4);
      const arc = { p: 0 };
      this.tweens.add({
        targets: arc,
        p: 1,
        duration: 520 + Math.random() * 260,
        ease: "Quad.easeOut",
        onUpdate: () => {
          const p = arc.p;
          img.setPosition(fx + (tx - fx) * p, fy + (ty - fy) * p - Math.sin(p * Math.PI) * 26);
          img.setDepth(img.y);
          img.setRotation(p * 8);
        },
      });
      this.fruits.push(img);
    }
    while (this.fruits.length > 60) this.fruits.shift()?.destroy();
    this.cameras.main.shake(140, 0.004);
    sound.tick();
    sound.pop();
    const lines = SPILL_LINES[kind] ?? SPILL_LINES.laranja;
    this.time.delayedCall(250, () => this.say("feirante", Phaser.Utils.Array.GetRandom(lines), 1800, "grito"));
    const feirante = this.npcs.find((n) => n.id === "feirante");
    feirante?.walker.hop(14);
    feirante?.walker.setFace("susto", 1500);
  }

  /** O boato se concretiza: o patrão vira capataz e a fábrica dispara. */
  private applyConsequence(animated: boolean) {
    if (this.consequence) return;
    this.consequence = true;
    this.faixaText.setText(CHICOTE_EXPRESSO.banner.after);
    const patrao = this.npcs.find((n) => n.id === "patrao");
    patrao?.walker.setCarry("chicote");
    patrao?.walker.setFacing("front");
    const fy = this.buildings.find((b) => b.def.kind === "fabrica")?.def;
    for (const g of FACTORY.gears) {
      this.gears.push(
        this.add
          .image(g.x, g.y, "gear")
          .setScale(1 / RES.small)
          .setDepth((fy ? fy.y + fy.d : 970) + 1),
      );
    }
    if (this.factoryImg) {
      this.tweens.add({ targets: this.factoryImg, x: this.factoryImg.x + 1.5, duration: 45, yoyo: true, repeat: -1 });
    }
    FACTORY.rushLanes.forEach((lane, i) => {
      const n = this.npcs.find((m) => m.id === `func${i + 1}`);
      n?.startRush(lane.from, lane.to, i % 2 === 0);
      n?.walker.setFace("susto", 600000);
    });
    this.nextCrack = this.time.now + (animated ? 200 : 1500);
    if (animated) {
      this.cameras.main.shake(320, 0.006);
      this.time.delayedCall(1600, () => {
        sound.success();
        bus.emit("toast", `Missão concluída: ${CHICOTE_EXPRESSO.title}`);
        this.player.setFace("deboche", 2500);
      });
    }
  }

  private updateConsequence(dt: number, now: number) {
    if (!this.consequence) return;
    for (const g of this.gears) g.rotation += dt * 9;
    if (now > this.nextSmoke) {
      this.nextSmoke = now + 380;
      this.puffSmoke();
    }
    const patrao = this.npcs.find((n) => n.id === "patrao");
    if (patrao && now > this.nextCrack) {
      this.nextCrack = now + 2600;
      this.crack(patrao);
    }
    if (now > this.nextWorkerLine) {
      this.nextWorkerLine = now + 4200;
      const id = `func${1 + Math.floor(Math.random() * 4)}`;
      const lines = CHICOTE_EXPRESSO.talk.concluida[id];
      if (lines && this.distToActive(this.npcs.find((n) => n.id === id)) < 520) this.say(id, Phaser.Utils.Array.GetRandom(lines), 1800);
    }
  }

  private distToActive(n?: Npc): number {
    if (!n) return Infinity;
    const px = this.mode === "carro" ? this.car.x : this.player.x;
    const py = this.mode === "carro" ? this.car.y : this.player.y;
    return Math.hypot(n.x - px, n.y - py);
  }

  private puffSmoke() {
    const { x, y } = FACTORY.chimney;
    const isCash = Math.random() < 0.65;
    const obj = isCash
      ? this.add
          .text(x + (Math.random() - 0.5) * 10, y, "$", {
            fontFamily: FONT,
            fontSize: "30px",
            fontStyle: "900",
            color: "#3ddc84",
            stroke: INK,
            strokeThickness: 5,
            resolution: 2,
          })
          .setOrigin(0.5)
      : this.add.image(x + (Math.random() - 0.5) * 10, y, "puff").setScale(1 / RES.small);
    obj.setDepth(70000).setAlpha(0.95);
    const startScale = obj.scale;
    this.tweens.add({
      targets: obj,
      y: y - 150 - Math.random() * 60,
      x: obj.x + 30 + Math.random() * 60,
      alpha: 0,
      scale: startScale * 1.8,
      angle: (Math.random() - 0.5) * 50,
      duration: 2400,
      ease: "Sine.easeOut",
      onComplete: () => obj.destroy(),
    });
  }

  private crack(patrao: Npc) {
    patrao.walker.hop(8);
    const near = this.distToActive(patrao) < 600;
    const label = this.add
      .text(patrao.x + 18, patrao.y - 110, "CRÁ!", {
        fontFamily: FONT,
        fontSize: "22px",
        fontStyle: "900",
        color: "#ffd23f",
        stroke: INK,
        strokeThickness: 5,
        resolution: 2,
      })
      .setOrigin(0.5)
      .setDepth(99000)
      .setScale(0.4);
    this.tweens.add({ targets: label, scale: 1.1, y: label.y - 18, duration: 220, ease: "Back.easeOut" });
    this.tweens.add({ targets: label, alpha: 0, delay: 500, duration: 300, onComplete: () => label.destroy() });
    if (near) {
      sound.carimbo();
      this.cameras.main.shake(90, 0.002);
      if (Math.random() < 0.5) this.say("patrao", Phaser.Utils.Array.GetRandom(CHICOTE_EXPRESSO.talk.concluida.patrao), 1600, "grito");
    }
  }

  // ---------------------------------------------------------------- HUD

  private emitHud(force = false) {
    const mission = this.mission;
    const step = mission ? stepOf(mission, this.step) : undefined;
    const state: HudState = {
      mode: this.mode,
      action: this.candidate?.label ?? null,
      missionTitle: mission ? mission.title : null,
      objective: mission ? (step?.objective ?? "") : LULA_OBJECTIVE,
      done: mission ? this.step === mission.finalStep : false,
    };
    const key = JSON.stringify(state);
    if (!force && key === this.hudKey) return;
    this.hudKey = key;
    bus.emit("hud", state);
  }

  private exposeDebug() {
    const w = window as unknown as Record<string, unknown>;
    w.__pde = {
      state: () => ({
        mode: this.mode,
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
        car: { x: Math.round(this.car.x), y: Math.round(this.car.y), angle: +this.car.angle.toFixed(2), speed: Math.round(this.car.speed) },
        step: this.step,
        holding: this.holding,
        action: this.candidate?.label ?? null,
        consequence: this.consequence,
        zoom: +this.cameras.main.zoom.toFixed(2),
        fps: Math.round(this.game.loop.actualFps),
        touch: { ...touchInput },
      }),
      teleport: (x: number, y: number) => {
        if (this.mode === "carro") {
          this.car.x = x;
          this.car.y = y;
          this.car.speed = 0;
        } else this.player.setPosition(x, y);
        this.camTarget = { x, y };
      },
      carTo: (x: number, y: number, angle = 0) => {
        this.car.x = x;
        this.car.y = y;
        this.car.angle = angle;
        this.car.speed = 0;
      },
      act: () => this.queueAction(),
    };
  }
}
