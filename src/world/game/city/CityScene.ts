import * as Phaser from "phaser";
import { sound } from "@/lib/sound";
import { bus, touchInput, worldState } from "../../bridge";
import {
  BUILDINGS,
  CITY,
  DECALS,
  GROUNDS,
  INTERIORS,
  LIMITS,
  NPCS,
  PARKING,
  POIS,
  PROPS,
  ROADS,
  SPAWN,
  STREET_CACHACA,
  VEHICLES,
  buildingById,
  citySolids,
  districtAt,
  doorPoint,
  entryLabel,
  interiorById,
  interiorSpots,
  sideDoorFrac,
  stalls,
  type Solid,
} from "../../cidade";
import { WORLD_H } from "../../cidade/layout";
import { isPlace, PLACES, type PlaceId } from "../../cidade/places";
import { discover, readCity, saveHora, saveWaypoint, setPlaceState, visit, type CityProgress } from "../../cidade/progress";
import { escuridao, formataHora, HORA_INICIAL, periodoDe } from "../../cidade/relogio";
import type { CachacaStop, CityBuilding, CityNpc, CityProp, DistrictDef, InteractionSpot, InteriorDef } from "../../cidade/types";
import { AMBIENT, CHATTER } from "../../cidade/vida";
import { drainStamina, MAX_STAMINA } from "../../stamina";
import type { HeroId, HudState, Point, Rect } from "../../types";
import { INK, toInt } from "../art";
import { CITY_TEX, RES, tex } from "../bake";
import { Bubble } from "../Bubble";
import { Car, type CarControls } from "../Car";
import { isFree, pushOut, wrapAngle, type Circle } from "../collide";
import { Npc } from "../Npc";
import { Walker } from "../Walker";
import { cityPropArt } from "./cityArt";
import { Culler } from "./culler";
import { InteriorView } from "./interior";
import { restoreToggles, runSpot, type SpotContext } from "./interactions";
import { Rotinas } from "./Rotinas";
import { Traffic, type Obstacle } from "./traffic";

export interface CityData {
  hero: HeroId;
  debug?: boolean;
}

const WALK = 118;
const RUN = 200;
const PLAYER_R = 10;
const TALK_DIST = 60;
const CAR_DIST = 64;
const DOOR_DIST = 50;
const SPOT_DIST = 40;
const CHUNK = 800;
const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

const DODGE_LINES = ["Olha o carro!", "Ê, motorista!", "Calma, presidente!", "Isso é calçada!"];
const SPILL_LINES: Record<string, string[]> = {
  laranja: ["Minhas laranjas!", "Laranja por comitê, não por atropelo!"],
  banana: ["Minhas bananas!", "Até a banana ganhou plano quinquenal!"],
  abacaxi: ["Meu abacaxi!", "Quem vai descascar esse abacaxi?"],
};
const DRINK_LINES = ["Um gole de cachaça e mais cem decretos!", "Cachaça presidencial: energia do povo!", "Esse gole foi coletivizado."];

interface Candidate {
  label: string;
  priority: number;
  dist: number;
  run: () => void;
  /** Onde fica o indicador do que vai receber a ação. */
  focus: Point | null;
}

type Keys = Record<"W" | "A" | "S" | "D" | "UP" | "DOWN" | "LEFT" | "RIGHT" | "SHIFT" | "E" | "ENTER" | "SPACE" | "H", Phaser.Input.Keyboard.Key>;

/** Objeto do cenário com a imagem e a definição. */
interface PropView {
  def: CityProp & { id: string };
  img: Phaser.GameObjects.Image;
  busyUntil: number;
}

export class CityScene extends Phaser.Scene {
  private hero: HeroId = "lula";
  private debug = false;
  private baseSolids: Solid[] = [];
  private placeSolids = new Map<PlaceId, Solid[]>();
  private solids: Solid[] = [];
  private player!: Walker;
  private cars: Car[] = [];
  private carIds = new Map<Car, string>();
  private car: Car | null = null;
  private mode: "pe" | "carro" = "pe";
  private npcs: Npc[] = [];
  private inside: InteriorDef | null = null;
  private interior: InteriorView | null = null;
  /** Porta usada para entrar (a lateral, nas igrejas interditadas). */
  private enteredAt: Point | null = null;
  private seated: { spot: InteractionSpot; pose: "sentado" | "deitado" } | null = null;
  private toggles = new Map<string, boolean>();
  private counters = new Map<string, number>();
  private traffic!: Traffic;
  private tallProps: { img: Phaser.GameObjects.Image; x: number; y: number; top: number; halfW: number }[] = [];
  private focus!: Phaser.GameObjects.Container;
  private focusText!: Phaser.GameObjects.Text;
  private nextChat = 0;
  private rotinas!: Rotinas;
  private noite!: Phaser.GameObjects.Rectangle;
  private horaSalvaEm = 0;
  private keys!: Keys;
  private culler = new Culler();
  private buildings: { def: CityBuilding; img: Phaser.GameObjects.Image; top: number }[] = [];
  private props = new Map<string, PropView>();
  private placeViews = new Map<PlaceId, Phaser.GameObjects.GameObject[]>();
  private placeTweens = new Map<PlaceId, Phaser.Tweens.Tween[]>();
  private progress!: CityProgress;
  private district: DistrictDef | null = null;
  private stamina = MAX_STAMINA;
  private lastDrinkAt = -Infinity;
  private paused = false;
  private bubbles = new Map<string, Bubble>();
  private marker!: Phaser.GameObjects.Image;
  private ring!: Phaser.GameObjects.Graphics;
  private edgeArrow!: Phaser.GameObjects.Image;
  private water: Phaser.GameObjects.TileSprite[] = [];
  private fruits: Phaser.GameObjects.Image[] = [];
  private hudKey = "";
  private candidate: Candidate | null = null;
  private actionQueued = false;
  private lastActionAt = 0;
  private busyUntil = 0;
  private pendingExit = false;
  private camTarget = { x: 0, y: 0 };
  private zoom = 1;
  private zoomTarget = 1;
  private dpr = 1;
  private nextCull = 0;
  private nextScan = 0;
  private lastToastAt = 0;
  private transition = false;
  private unsubs: (() => void)[] = [];

  constructor() {
    super("city");
  }

  init(data: CityData) {
    this.hero = data.hero;
    this.debug = !!data.debug;
    this.dpr = (this.registry.get("dpr") as number) ?? 1;
  }

  create() {
    this.mode = "pe";
    this.inside = null;
    this.paused = false;
    this.stamina = MAX_STAMINA;
    this.progress = readCity();

    this.drawGround();
    this.drawLimits();
    this.placeBuildings();
    this.placeProps(PROPS);
    this.placeCachacaSigns();
    this.placeDoorSigns();

    this.baseSolids = citySolids();
    for (const id of Object.keys(PLACES) as PlaceId[]) this.applyPlace(id, this.progress.places[id], false);
    this.rebuildSolids();

    for (const def of [...NPCS, ...AMBIENT]) this.npcs.push(new Npc(this, def));
    // moradores da rua vivem uma rotina diária (casa, ponto, almoço, bar); a luz da rua acompanha a hora
    this.rotinas = new Rotinas(this, this.npcs.slice(NPCS.length), this.progress.hora ?? HORA_INICIAL);
    this.noite = this.add.rectangle(0, 0, 7000, 5000, 0x0b1236, 1).setAlpha(0).setDepth(900000);
    this.traffic = new Traffic(this, this.rotinas.minuto, SPAWN.hero);
    for (const v of VEHICLES) {
      const car = new Car(this, v.x, v.y, v.angle, v.color);
      this.cars.push(car);
      this.carIds.set(car, v.id);
    }
    this.player = new Walker(this, this.hero, SPAWN.hero.x, SPAWN.hero.y);
    this.player.setFacing("back");

    this.marker = this.add.image(0, 0, "marker").setScale(1 / RES.small).setDepth(90000).setVisible(false);
    this.ring = this.add.graphics().setDepth(5).setVisible(false);
    this.edgeArrow = this.add.image(0, 0, "marker").setScale(1 / RES.small).setDepth(95000).setVisible(false).setTint(0x9be7ff);
    // indicador do objeto que vai receber a ação (porta, carro, móvel, morador)
    const arrow = this.add.graphics();
    arrow.fillStyle(0xffd23f, 1);
    arrow.lineStyle(3, 0x1e1424, 1);
    arrow.fillTriangle(-10, -14, 10, -14, 0, 0);
    arrow.strokeTriangle(-10, -14, 10, -14, 0, 0);
    this.focusText = this.add
      .text(0, -20, "", { fontFamily: FONT, fontSize: "12px", fontStyle: "900", color: "#1e1424", backgroundColor: "#ffd23f", padding: { x: 6, y: 3 }, resolution: 3 })
      .setOrigin(0.5, 1);
    this.focus = this.add.container(0, 0, [arrow, this.focusText]).setDepth(96000).setVisible(false);
    worldState.waypoint = this.progress.waypoint;

    const kb = this.input.keyboard!;
    this.keys = kb.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT,E,ENTER,SPACE,H") as Keys;
    this.keys.E.on("down", () => this.queueAction());
    this.keys.ENTER.on("down", () => this.queueAction());
    this.keys.H.on("down", () => this.horn());
    this.unsubs.push(bus.on("action", () => this.queueAction()));
    this.unsubs.push(bus.on("horn", () => this.horn()));
    this.unsubs.push(
      bus.on("pause", (paused) => {
        this.paused = paused;
        this.actionQueued = false;
        this.time.paused = paused;
        if (paused) this.tweens.pauseAll();
        else this.tweens.resumeAll();
      }),
    );
    this.unsubs.push(
      bus.on("waypoint", (w) => {
        worldState.waypoint = w;
        saveWaypoint(w);
        this.emitHud(true);
      }),
    );
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.cleanup());

    const cam = this.cameras.main;
    this.setCityBounds();
    cam.setBackgroundColor("#3f8fd2");
    this.computeZoom();
    this.zoom = this.zoomTarget;
    cam.setZoom(this.zoom);
    this.camTarget = { x: this.player.x, y: this.player.y - 30 };
    cam.centerOn(this.camTarget.x, this.camTarget.y);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.computeZoom, this);

    this.updateCulling(true);
    if (this.debug) this.exposeDebug();
    this.updateDistrict(true);
    this.emitHud(true);
    bus.emit("ready");
  }

  private cleanup() {
    if (this.debug) delete (window as unknown as Record<string, unknown>).__pde;
    this.unsubs.forEach((u) => u());
    this.unsubs = [];
    this.scale.off(Phaser.Scale.Events.RESIZE, this.computeZoom, this);
  }

  // ------------------------------------------------------------------ chão e ruas

  private drawGround() {
    const ts = 1 / RES.tile;
    this.add.tileSprite(0, 0, CITY.w, CITY.h, "tile:calcada").setOrigin(0).setTileScale(ts).setDepth(-100);
    for (const g of GROUNDS) {
      if (g.kind === "calcada") continue;
      const key = g.kind === "ondas" ? "tile:ondas-cidade" : `tile:${g.kind}`;
      const t = this.add.tileSprite(g.rect.x, g.rect.y, g.rect.w, g.rect.h, key).setOrigin(0).setTileScale(ts).setDepth(-90);
      this.culler.add(t, g.rect);
    }
    this.drawDecals();
    // ruas desenhadas em blocos: só os blocos perto da câmera custam desenho
    for (let cy = 0; cy < CITY.h; cy += CHUNK) {
      for (let cx = 0; cx < CITY.w; cx += CHUNK) {
        const chunk = { x: cx, y: cy, w: CHUNK, h: CHUNK };
        const g = this.add.graphics().setDepth(-80);
        this.drawRoads(g, chunk);
        this.culler.add(g, chunk);
      }
    }
  }

  /** Tapetes, degraus e setas pintadas no chão, em frente às portas e nas filas. */
  private drawDecals() {
    for (const d of DECALS) {
      const { x, y, w, h } = d.rect;
      const g = this.add.graphics().setDepth(-74);
      if (d.kind === "tapete") {
        const c = toInt(d.color ?? "#b8323b");
        g.fillStyle(0x1e1424, 0.22);
        g.fillRoundedRect(x + 2, y + 3, w, h, 4);
        g.fillStyle(c, 1);
        g.fillRoundedRect(x, y, w, h, 4);
        g.lineStyle(2.5, 0xe8c15a, 1);
        g.strokeRoundedRect(x + 4, y + 4, w - 8, h - 8, 3);
        g.fillStyle(0xe8c15a, 1);
        for (let py = y + 16; py < y + h - 10; py += 22) g.fillTriangle(x + w / 2, py - 5, x + w / 2 + 5, py, x + w / 2, py + 5);
      } else if (d.kind === "degraus") {
        const n = 3;
        const stone = toInt(d.color ?? "#d9d0bd");
        for (let i = 0; i < n; i++) {
          const inset = i * 6;
          const sy = y + (h / n) * i;
          g.fillStyle(0x1e1424, 0.18);
          g.fillRect(x + inset, sy + h / n - 3, w - inset * 2, 3);
          g.fillStyle(Phaser.Display.Color.ValueToColor(stone).lighten(i * 5).color, 1);
          g.fillRect(x + inset, sy, w - inset * 2, h / n - 3);
          g.fillStyle(0xffffff, 0.35);
          g.fillRect(x + inset, sy, w - inset * 2, 2);
        }
      } else {
        // setas de fila apontando para cima (para a porta)
        g.fillStyle(toInt(d.color ?? "#f2c230"), 0.9);
        for (let py = y + 4; py + 14 <= y + h; py += 26) {
          const cx = x + w / 2;
          g.fillTriangle(cx, py, cx - 14, py + 14, cx - 7, py + 14);
          g.fillTriangle(cx, py, cx + 14, py + 14, cx + 7, py + 14);
          g.fillTriangle(cx - 7, py + 14, cx + 7, py + 14, cx, py + 6);
        }
      }
      this.culler.add(g, { x: x - 10, y: y - 10, w: w + 20, h: h + 20 });
    }
  }

  private drawRoads(g: Phaser.GameObjects.Graphics, chunk: Rect) {
    const clip = (r: Rect): Rect | null => {
      const x0 = Math.max(r.x, chunk.x);
      const y0 = Math.max(r.y, chunk.y);
      const x1 = Math.min(r.x + r.w, chunk.x + chunk.w);
      const y1 = Math.min(r.y + r.h, chunk.y + chunk.h);
      return x1 > x0 && y1 > y0 ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
    };
    const fill = (r: Rect, color: number, alpha = 1) => {
      const c = clip(r);
      if (!c) return;
      g.fillStyle(color, alpha);
      g.fillRect(c.x, c.y, c.w, c.h);
    };
    const inChunk = (x: number, y: number) => x >= chunk.x && x < chunk.x + chunk.w && y >= chunk.y && y < chunk.y + chunk.h;
    // meio-fio
    for (const r of ROADS) {
      const { x, y, w, h } = r.rect;
      fill({ x: x - 4, y: y - 4, w: w + 8, h: h + 8 }, 0xeae5d9);
    }
    // asfalto
    for (const r of ROADS) fill(r.rect, r.kind === "avenida" ? 0x45454f : 0x4f4f5a);
    const crossings: Rect[] = [];
    for (let i = 0; i < ROADS.length; i++) {
      for (let j = i + 1; j < ROADS.length; j++) {
        const a = ROADS[i].rect;
        const b = ROADS[j].rect;
        const x0 = Math.max(a.x, b.x);
        const y0 = Math.max(a.y, b.y);
        const x1 = Math.min(a.x + a.w, b.x + b.w);
        const y1 = Math.min(a.y + a.h, b.y + b.h);
        if (x1 > x0 && y1 > y0) crossings.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 });
      }
    }
    const nearCross = (x: number, y: number, m: number) => crossings.some((c) => x > c.x - m && x < c.x + c.w + m && y > c.y - m && y < c.y + c.h + m);
    // faixas centrais
    for (const r of ROADS) {
      const { x, y, w, h } = r.rect;
      const horiz = w > h;
      if (r.kind === "avenida") {
        g.fillStyle(0xf2c230, 1);
        if (horiz) {
          for (let px = x; px < x + w; px += 24) if (!nearCross(px + 12, y + h / 2, 20) && inChunk(px, y + h / 2)) {
            g.fillRect(px, y + h / 2 - 5, 24, 3);
            g.fillRect(px, y + h / 2 + 2, 24, 3);
          }
          g.fillStyle(0xffffff, 0.75);
          for (let px = x + 10; px < x + w; px += 52) if (!nearCross(px + 13, y + h / 2, 20) && inChunk(px, y)) {
            g.fillRect(px, y + h / 4 - 2, 26, 3);
            g.fillRect(px, y + (3 * h) / 4 - 1, 26, 3);
          }
        } else {
          for (let py = y; py < y + h; py += 24) if (!nearCross(x + w / 2, py + 12, 20) && inChunk(x + w / 2, py)) {
            g.fillRect(x + w / 2 - 5, py, 3, 24);
            g.fillRect(x + w / 2 + 2, py, 3, 24);
          }
          g.fillStyle(0xffffff, 0.75);
          for (let py = y + 10; py < y + h; py += 52) if (!nearCross(x + w / 2, py + 13, 20) && inChunk(x, py)) {
            g.fillRect(x + w / 4 - 2, py, 3, 26);
            g.fillRect(x + (3 * w) / 4 - 1, py, 3, 26);
          }
        }
      } else {
        g.fillStyle(0xffffff, 0.85);
        if (horiz) {
          for (let px = x + 8; px < x + w; px += 46) if (!nearCross(px + 12, y + h / 2, 24) && inChunk(px, y + h / 2)) g.fillRect(px, y + h / 2 - 2, 24, 4);
        } else {
          for (let py = y + 8; py < y + h; py += 46) if (!nearCross(x + w / 2, py + 12, 24) && inChunk(x + w / 2, py)) g.fillRect(x + w / 2 - 2, py, 4, 24);
        }
      }
    }
    // faixas de pedestre nas entradas de cada cruzamento
    g.fillStyle(0xffffff, 0.92);
    for (const c of crossings) {
      for (const r of ROADS) {
        const rr = r.rect;
        const horiz = rr.w > rr.h;
        if (horiz && c.y >= rr.y - 1 && c.y + c.h <= rr.y + rr.h + 1) {
          for (const sx of [c.x - 36, c.x + c.w + 8]) {
            if (sx < rr.x || sx + 28 > rr.x + rr.w) continue;
            for (let py = rr.y + 8; py < rr.y + rr.h - 8; py += 16) if (inChunk(sx, py)) g.fillRect(sx, py, 28, 9);
          }
        } else if (!horiz && c.x >= rr.x - 1 && c.x + c.w <= rr.x + rr.w + 1) {
          for (const sy of [c.y - 36, c.y + c.h + 8]) {
            if (sy < rr.y || sy + 28 > rr.y + rr.h) continue;
            for (let px = rr.x + 8; px < rr.x + rr.w - 8; px += 16) if (inChunk(px, sy)) g.fillRect(px, sy, 9, 28);
          }
        }
      }
    }
    // vagas pintadas
    g.lineStyle(2, 0xffffff, 0.85);
    for (const p of PARKING) {
      for (const s of stalls(p)) {
        if (!inChunk(s.x, s.y)) continue;
        const vertical = Math.abs(Math.sin(s.angle)) > 0.5;
        const hw = vertical ? 22 : 38;
        const hh = vertical ? 38 : 22;
        g.strokeRect(s.x - hw, s.y - hh, hw * 2, hh * 2);
      }
    }
    // linhas da quadra
    for (const gr of GROUNDS.filter((q) => q.kind === "quadra")) {
      const r = gr.rect;
      if (!clip(r)) continue;
      g.lineStyle(3, 0xffffff, 0.9);
      g.strokeRect(r.x + 10, r.y + 10, r.w - 20, r.h - 20);
      g.lineBetween(r.x + 10, r.y + r.h / 2, r.x + r.w - 10, r.y + r.h / 2);
      g.strokeCircle(r.x + r.w / 2, r.y + r.h / 2, 34);
    }
  }

  /** Morro com casinhas e letreiro ao norte, canal a oeste, baía com navio ao sul, muro a leste. */
  private drawLimits() {
    const ts = 1 / RES.tile;
    const canal = this.add.tileSprite(LIMITS.canal.x, LIMITS.canal.y, LIMITS.canal.w, LIMITS.canal.h, "tile:agua").setOrigin(0).setTileScale(ts).setDepth(-95);
    const baia = this.add.tileSprite(LIMITS.baia.x, LIMITS.baia.y, LIMITS.baia.w, LIMITS.baia.h, "tile:agua").setOrigin(0).setTileScale(ts).setDepth(-95);
    this.water.push(canal, baia);
    this.culler.add(canal, LIMITS.canal);
    this.culler.add(baia, LIMITS.baia);

    const rail = this.add.graphics().setDepth(-70);
    rail.lineStyle(3, 0xeae5d9, 1);
    rail.lineBetween(LIMITS.canal.w + 2, 150, LIMITS.canal.w + 2, LIMITS.baia.y);
    rail.lineBetween(LIMITS.canal.w, LIMITS.baia.y - 2, LIMITS.muro.x, LIMITS.baia.y - 2);
    rail.lineStyle(1.5, 0x8a8494, 1);
    for (let y = 170; y < LIMITS.baia.y; y += 18) rail.lineBetween(LIMITS.canal.w - 2, y, LIMITS.canal.w + 6, y);

    // morro
    for (let x0 = 0; x0 < CITY.w; x0 += 1200) {
      const g = this.add.graphics().setDepth(-60);
      for (let x = x0 - 60; x < x0 + 1260; x += 120) {
        const h = 70 + Math.abs(Math.sin(x * 0.013)) * 60;
        g.fillStyle(0x3f9b4a, 1);
        g.fillCircle(x, 150 - h * 0.3, h);
        g.fillStyle(0x4cae55, 1);
        g.fillCircle(x + 30, 150 - h * 0.15, h * 0.6);
      }
      g.fillStyle(0x6a5a4a, 1);
      g.fillRect(x0, 140, 1200, 12);
      this.culler.add(g, { x: x0 - 200, y: -200, w: 1600, h: 360 });
    }
    for (let i = 0; i < 70; i++) {
      const x = 60 + ((i * 137) % 4680);
      const y = 40 + ((i * 53) % 90);
      const img = this.add.image(x, y, `casinha:${i % 6}`).setScale(1 / RES.prop).setDepth(-55 + y / 1000);
      this.culler.add(img, { x: x - 20, y: y - 20, w: 40, h: 40 });
    }
    const letreiro = this.add
      .text(2400, 70, "BRASIL HIPOTÉTICO", { fontFamily: FONT, fontSize: "64px", fontStyle: "900", color: "#fffaf0", stroke: INK, strokeThickness: 8, resolution: 1.5 })
      .setOrigin(0.5)
      .setDepth(-50);
    this.culler.add(letreiro, { x: 2000, y: 20, w: 800, h: 110 });
    const fic = this.add
      .text(2400, 122, "ficção satírica · aqui os boatos viraram verdade", { fontFamily: FONT, fontSize: "18px", fontStyle: "700", color: "#fffaf0", stroke: INK, strokeThickness: 5, resolution: 1.5 })
      .setOrigin(0.5)
      .setDepth(-50);
    this.culler.add(fic, { x: 2100, y: 100, w: 600, h: 40 });

    // muro leste
    const muro = this.add.graphics().setDepth(-70);
    muro.fillStyle(0xc9b8a0, 1);
    muro.fillRect(LIMITS.muro.x, 0, LIMITS.muro.w, LIMITS.baia.y);
    muro.fillStyle(0xb5a48c, 1);
    for (let y = 0; y < LIMITS.baia.y; y += 40) muro.fillRect(LIMITS.muro.x, y, LIMITS.muro.w, 3);
    muro.fillStyle(0xeae5d9, 1);
    muro.fillRect(LIMITS.muro.x, 0, 6, LIMITS.baia.y);
    this.culler.add(muro, { x: LIMITS.muro.x, y: 0, w: LIMITS.muro.w, h: LIMITS.baia.y });
    for (const [y, t] of [
      [700, "FIM DO MAPA"],
      [1800, "O RESTO É BOATO"],
      [2900, "FRONTEIRA IMAGINÁRIA"],
    ] as const) {
      const txt = this.add
        .text(LIMITS.muro.x + 66, y, t, { fontFamily: FONT, fontSize: "20px", fontStyle: "900", color: "#c62835", resolution: 1.5 })
        .setOrigin(0.5)
        .setAngle(90)
        .setDepth(-69);
      this.culler.add(txt, { x: LIMITS.muro.x, y: y - 160, w: 130, h: 320 });
    }

    const navio = this.add.image(3960, 3600, "navio").setOrigin(0.5, 1).setScale(1 / RES.big).setDepth(-60);
    this.culler.add(navio, { x: 3580, y: 3400, w: 760, h: 200 });
    this.tweens.add({ targets: navio, y: 3604, duration: 1800, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
  }

  // ------------------------------------------------------------------ prédios e objetos

  /** Sombra no chão: uma faixa de contato embaixo da fachada e a sombra lançada à direita do prédio. */
  private buildingShadow(b: CityBuilding) {
    const g = this.add.graphics().setDepth(-76);
    const base = b.y + b.d;
    g.fillStyle(0x1e1424, 0.2);
    g.fillRect(b.x - 2, base, b.w + 4, 7);
    g.fillStyle(0x1e1424, 0.1);
    g.fillRect(b.x - 2, base + 7, b.w + 4, 5);
    g.fillStyle(0x1e1424, 0.13);
    g.fillTriangle(b.x + b.w, b.y, b.x + b.w + 30, b.y + 16, b.x + b.w + 30, base + 16);
    g.fillTriangle(b.x + b.w, b.y, b.x + b.w + 30, base + 16, b.x + b.w, base);
    this.culler.add(g, { x: b.x - 10, y: b.y - 10, w: b.w + 50, h: b.d + 50 });
  }

  private placeBuildings() {
    for (const def of BUILDINGS) {
      this.buildingShadow(def);
      const top = def.y - def.h - (def.top ?? 0);
      const img = this.add
        .image(def.x, top, CITY_TEX.get(def.id) ?? "shadow")
        .setOrigin(0, 0)
        .setScale(1 / RES.cityBuilding)
        .setDepth(def.y + def.d);
      this.buildings.push({ def, img, top });
      this.culler.add(img, { x: def.x, y: top, w: def.w, h: def.y + def.d - top });
    }
  }

  private placeProps(list: (CityProp & { id: string })[]) {
    for (const p of list) {
      const art = cityPropArt(p.kind, p.variant);
      const img = this.add
        .image(p.x, p.y, tex.prop(p.kind, p.variant))
        .setOrigin(0.5, art.originY)
        .setScale(1 / RES.cityProp)
        .setDepth(p.y);
      const top = p.y - art.h * art.originY;
      const bounds = { x: p.x - art.w / 2, y: top, w: art.w, h: art.h };
      this.culler.add(img, bounds);
      if (art.h > 70) this.tallProps.push({ img, x: p.x, y: p.y, top, halfW: art.w / 2 - 8 });
      if (p.react) this.props.set(p.id, { def: p, img, busyUntil: 0 });
      if (p.text) this.propText(p, top, bounds);
    }
  }

  private propText(p: CityProp, top: number, bounds: Rect) {
    const style = (size: number, color: string, wrap: number): Phaser.Types.GameObjects.Text.TextStyle => ({
      fontFamily: FONT,
      fontSize: `${size}px`,
      fontStyle: "900",
      color,
      align: "center",
      wordWrap: { width: wrap, useAdvancedWrap: true },
      resolution: 2.5,
    });
    let t: Phaser.GameObjects.Text | null = null;
    if (p.kind === "outdoor") t = this.add.text(p.x, top + 42, p.text!, style(13, "#1e1424", 168));
    else if (p.kind === "placaColetiva") t = this.add.text(p.x, top + 18, p.text!, style(8, "#fff4ce", 82));
    else if (p.kind === "placaRua") t = this.add.text(p.x, top + 12, p.text!, style(9, "#ffffff", 96));
    else if (p.kind === "painelSenha") t = this.add.text(p.x, top + 23, p.text!, { ...style(18, "#ff4d4d", 120), fontFamily: "ui-monospace, Menlo, monospace" });
    else if (p.kind === "faixaCampus") t = this.add.text(p.x, top + 23, p.text!, style(12, "#7b4bd1", 200));
    if (!t) return;
    t.setOrigin(0.5).setDepth((p.kind === "painelSenha" ? p.y - 200 : p.y) + 0.5);
    this.culler.add(t, bounds);
  }

  private sign(x: number, y: number, text: string, bg: string, color: string, size: number, depth: number) {
    const t = this.add
      .text(x, y, text, { fontFamily: FONT, fontSize: `${size}px`, fontStyle: "900", backgroundColor: bg, color, padding: { x: 6, y: 3 }, resolution: 2.5 })
      .setOrigin(0.5)
      .setDepth(depth);
    this.culler.add(t, { x: x - 140, y: y - 20, w: 280, h: 40 });
    return t;
  }

  /** Placa "CACHAÇA · ENERGIA" com a garrafa balançando em cada parada. */
  private placeCachacaSigns() {
    for (const c of STREET_CACHACA) {
      const bottle = this.add.image(c.x, c.y - 70, "cachaca").setScale(0.8 / RES.small).setDepth(c.y + 300);
      this.tweens.add({ targets: bottle, angle: { from: -10, to: 10 }, duration: 700, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      this.culler.add(bottle, { x: c.x - 30, y: c.y - 110, w: 60, h: 80 });
      this.sign(c.x, c.y - 100, "CACHAÇA · ENERGIA", "#592b36", "#ffdf7d", 10, c.y + 300);
    }
  }

  /** Toda edificação tem porta: tapete na calçada e, nas igrejas, a placa da entrada lateral. */
  private placeDoorSigns() {
    for (const b of BUILDINGS) {
      const doors = [doorPoint(b)];
      if (sideDoorFrac(b) !== null) doors.push(doorPoint(b, true));
      doors.forEach((d, k) => {
        const mat = this.add.graphics().setDepth(-70);
        mat.fillStyle(k ? 0x3a86c8 : 0xc62835, 1);
        mat.fillRoundedRect(d.x - 20, d.y - 14, 40, 14, 4);
        mat.fillStyle(0xffd23f, 1);
        mat.fillRect(d.x - 14, d.y - 8, 28, 3);
        this.culler.add(mat, { x: d.x - 30, y: d.y - 20, w: 60, h: 30 });
        if (k) {
          const t = this.sign(d.x, b.y + b.d - 70, "ENTRADA LATERAL", "#3a86c8", "#fffaf0", 9, b.y + b.d + 2);
          t.setData("place", b.place);
          const door = this.add.graphics().setDepth(b.y + b.d + 1);
          door.fillStyle(0x7a3e1d, 1);
          door.fillRoundedRect(d.x - 11, b.y + b.d - 44, 22, 44, { tl: 10, tr: 10, bl: 0, br: 0 });
          door.lineStyle(2, 0x1e1424, 1);
          door.strokeRoundedRect(d.x - 11, b.y + b.d - 44, 22, 44, { tl: 10, tr: 10, bl: 0, br: 0 });
          door.fillStyle(0xf2c230, 1);
          door.fillCircle(d.x + 5, b.y + b.d - 22, 2);
          this.culler.add(door, { x: d.x - 20, y: b.y + b.d - 60, w: 40, h: 60 });
        }
      });
    }
  }

  // ------------------------------------------------------------------ interiores

  /** Porta pela qual o jogador entra agora: a lateral, se a igreja estiver interditada. */
  private entranceOf(b: CityBuilding): { point: Point; side: boolean } {
    const locked = b.place && isPlace(b.place) && this.progress.places[b.place] === "interditada";
    if (locked && sideDoorFrac(b) !== null) return { point: doorPoint(b, true), side: true };
    return { point: doorPoint(b), side: false };
  }

  private enterInterior(b: CityBuilding, via?: Point) {
    const room = b.interior ? interiorById(b.interior) : undefined;
    if (!room || this.transition) return;
    this.transition = true;
    this.enteredAt = via ?? this.entranceOf(b).point;
    sound.porta();
    this.cameras.main.fadeOut(160, 20, 16, 30);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.inside = room;
      this.interior = new InteriorView(this, room, this.progress.places);
      this.chamaVisitantes(room);
      restoreToggles(this.spotContext());
      this.rebuildSolids();
      this.player.setPosition(room.entry.x, room.entry.y);
      this.player.setFacing("back");
      this.camTarget = { x: room.entry.x, y: room.entry.y - 30 };
      this.computeZoom();
      this.zoom = this.zoomTarget;
      this.setRoomBounds(room);
      this.updateCulling(true);
      this.cameras.main.fadeIn(200, 20, 16, 30);
      this.transition = false;
      this.discoverPoi(b.id);
      if (visit(b.id)) this.progress.visited.push(b.id);
      worldState.insideBuilding = b.id;
      this.toast(room.name);
      this.emitHud(true);
    });
  }

  private leaveInterior() {
    const room = this.inside;
    if (!room || this.transition) return;
    const b = buildingById(room.building);
    if (!b) return;
    this.standUp();
    this.transition = true;
    sound.porta();
    this.cameras.main.fadeOut(160, 20, 16, 30);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.interior?.destroy();
      this.interior = null;
      this.inside = null;
      worldState.insideBuilding = null;
      this.bubbles.forEach((bb) => bb.destroy());
      this.bubbles.clear();
      this.rebuildSolids();
      const d = this.enteredAt ?? doorPoint(b);
      const spot = this.freeSpotNear(d.x, d.y + 8);
      this.player.setPosition(spot.x, spot.y);
      this.player.setFacing("front");
      this.camTarget = { x: spot.x, y: spot.y - 30 };
      this.setCityBounds();
      this.computeZoom();
      this.zoom = this.zoomTarget;
      this.updateCulling(true);
      this.cameras.main.fadeIn(200, 20, 16, 30);
      this.transition = false;
      this.updateDistrict(true);
      this.emitHud(true);
    });
  }

  /** Ponto livre perto da porta (um carro ou morador pode estar parado ali). */
  private freeSpotNear(x: number, y: number): Point {
    const blockers = [...this.cars, ...this.traffic.cars.map((t) => t.car)].flatMap((c) => c.circles().map((k) => ({ ...k, r: k.r + 2 })));
    for (const [dx, dy] of [
      [0, 0],
      [0, 14],
      [-26, 8],
      [26, 8],
      [0, 34],
      [-46, 14],
      [46, 14],
      [-30, 40],
      [30, 40],
    ]) {
      if (isFree(x + dx, y + dy, PLAYER_R + 1, this.solids, blockers)) return { x: x + dx, y: y + dy };
    }
    return { x, y };
  }

  private spotContext(): SpotContext {
    return {
      scene: this,
      view: this.interior!,
      player: this.player,
      say: (text, ms = 2400) => this.say("hero", text, ms),
      npcSay: (n, text) => this.sayNpc(n, text),
      toggles: this.toggles,
      counters: this.counters,
      seat: (spot, pose) => this.sit(spot, pose),
      changePlace: (place, state) => this.changePlace(place, state),
    };
  }

  /** Interação que muda um lugar: salva, redesenha a rua e refaz o interior com o novo estado. */
  private changePlace(place: string, state: string) {
    if (!isPlace(place) || this.progress.places[place] === state) return;
    this.setPlace(place, state);
    this.refreshInterior();
    sound.porta();
    this.cameras.main.flash(220, 255, 244, 206);
    const name = PLACES[place].name;
    this.toast(`${name}: ${(PLACES[place].states as Record<string, string>)[state] ?? state}`);
  }

  /** Refaz o interior atual no lugar, para refletir um estado que mudou enquanto o jogador está dentro. */
  private refreshInterior() {
    if (!this.inside || !this.interior) return;
    const room = this.inside;
    this.interior.destroy();
    this.bubbles.forEach((bb) => bb.destroy());
    this.bubbles.clear();
    this.interior = new InteriorView(this, room, this.progress.places);
    this.chamaVisitantes(room);
    restoreToggles(this.spotContext());
    this.rebuildSolids();
    this.updateCulling(true);
  }

  /** Moradores que, pela rotina, estão dentro deste prédio agora aparecem no interior. */
  private chamaVisitantes(room: InteriorDef) {
    if (!this.interior) return;
    for (const def of this.rotinas.visitantes(room, this.interior.solids)) this.interior.npcs.push(new Npc(this, def));
  }

  private useSpot(spot: InteractionSpot) {
    if (!this.interior) return;
    const ms = runSpot(this.spotContext(), spot);
    this.busyUntil = this.time.now + ms;
  }

  private sit(spot: InteractionSpot, pose: "sentado" | "deitado") {
    if (!spot.seat) return;
    this.seated = { spot, pose };
    this.player.setPosition(spot.seat.x, spot.seat.y);
    this.player.setFacing(spot.seat.facing, spot.seat.flip);
    this.player.setPose(pose);
    this.emitHud(true);
  }

  private standUp() {
    if (!this.seated) return;
    const spot = this.seated.spot;
    this.seated = null;
    this.player.setPose(null);
    this.player.setPosition(spot.x, spot.y);
    this.player.setFacing("front");
    this.busyUntil = this.time.now + 150;
  }

  private setCityBounds() {
    this.cameras.main.setBounds(0, 0, CITY.w, CITY.h);
    this.cameras.main.setBackgroundColor("#3f8fd2");
  }

  /** Limites da câmera no interior; se a tela for maior que o cômodo, o interior fica centralizado. */
  private setRoomBounds(room: InteriorDef) {
    const r = room.room;
    const pad = 80;
    const viewW = this.scale.width / this.zoomTarget;
    const viewH = this.scale.height / this.zoomTarget;
    const w = Math.max(r.w + pad * 2, viewW);
    // margem curta embaixo (só a placa de saída): em telas baixas, sobra mais cômodo à frente do personagem
    const top = 50;
    const bottom = 64;
    const h = Math.max(r.h + top + bottom, viewH);
    this.cameras.main.setBounds(r.x + r.w / 2 - w / 2, r.y - top - (h - (r.h + top + bottom)) / 2, w, h);
    this.cameras.main.setBackgroundColor("#140f1c");
  }

  // ------------------------------------------------------------------ estados dos lugares

  /** Redesenha um lugar conforme o estado salvo. Histórias futuras chamam isto. */
  private applyPlace(id: PlaceId, state: string, animated: boolean) {
    for (const o of this.placeViews.get(id) ?? []) o.destroy();
    for (const t of this.placeTweens.get(id) ?? []) t.remove();
    this.placeViews.set(id, []);
    this.placeTweens.set(id, []);
    this.placeSolids.set(id, []);
    const objs = this.placeViews.get(id)!;
    const tweens = this.placeTweens.get(id)!;
    const solids = this.placeSolids.get(id)!;
    const b = BUILDINGS.find((x) => x.place === id);
    if (!b) return;
    const d = doorPoint(b);
    const facadeBottom = b.y + b.d;
    const depth = facadeBottom + 1;
    const keep = <T extends Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Visible>(o: T, bounds: Rect) => {
      objs.push(o);
      this.culler.add(o, bounds);
      return o;
    };
    const signAt = (x: number, y: number, text: string, bg: string, color: string, size = 11) => {
      const t = this.add
        .text(x, y, text, { fontFamily: FONT, fontSize: `${size}px`, fontStyle: "900", backgroundColor: bg, color, padding: { x: 6, y: 3 }, resolution: 2.5 })
        .setOrigin(0.5)
        .setDepth(depth + 1);
      return keep(t, { x: x - 150, y: y - 20, w: 300, h: 40 });
    };
    const propImg = (kind: CityProp["kind"], x: number, y: number, variant?: string, solid = true) => {
      const art = cityPropArt(kind, variant);
      const img = this.add.image(x, y, tex.prop(kind, variant)).setOrigin(0.5, art.originY).setScale(1 / RES.cityProp).setDepth(y);
      keep(img, { x: x - art.w / 2, y: y - art.h, w: art.w, h: art.h });
      if (solid) {
        const sz = { caixasKits: [50, 26], barracaCamping: [50, 24], caixaSom: [22, 14] }[kind as string];
        if (sz) solids.push({ x: x - sz[0] / 2, y: y - sz[1], w: sz[0], h: sz[1], tag: `${id}-${kind}-${x}` });
      }
      return img;
    };

    if (id === "igreja-matriz" || id === "assembleia") {
      if (state === "interditada") {
        const big = id === "igreja-matriz";
        const lock = this.add.image(d.x, facadeBottom - 2, "interdicao").setOrigin(0.5, 1).setScale((big ? 1.15 : 0.85) / RES.small).setDepth(depth);
        keep(lock, { x: d.x - 80, y: facadeBottom - 120, w: 160, h: 130 });
        const tape = this.add.graphics().setDepth(depth);
        const y0 = facadeBottom - (big ? 70 : 55);
        tape.fillStyle(0xffd23f, 1);
        tape.fillRect(b.x + 6, y0, b.w - 12, 10);
        tape.fillStyle(0x1e1424, 1);
        for (let x = b.x + 8; x < b.x + b.w - 14; x += 18) tape.fillTriangle(x, y0 + 10, x + 8, y0, x + 14, y0 + 10);
        keep(tape, { x: b.x, y: y0 - 10, w: b.w, h: 30 });
        signAt(d.x, facadeBottom - (big ? 128 : 96), big ? "INTERDITADA POR DECRETO" : "LACRADA PELO MINISTÉRIO", "#b62f3e", "#fff4ce");
        if (animated) tweens.push(this.tweens.add({ targets: lock, y: { from: lock.y - 120, to: lock.y }, duration: 650, ease: "Bounce.easeOut" }));
      } else {
        // porta da frente aberta: luz quente saindo, folhas da porta abertas e o aviso verde
        const big = id === "igreja-matriz";
        const glow = this.add.graphics().setDepth(depth);
        const dw = big ? 30 : 24;
        glow.fillStyle(0xffd88a, 0.9);
        glow.fillRoundedRect(d.x - dw, facadeBottom - 62, dw * 2, 62, { tl: dw, tr: dw, bl: 0, br: 0 });
        glow.fillStyle(0xfff3c4, 0.9);
        glow.fillRoundedRect(d.x - dw * 0.55, facadeBottom - 52, dw * 1.1, 52, { tl: dw * 0.55, tr: dw * 0.55, bl: 0, br: 0 });
        glow.fillStyle(0x7a3e1d, 1);
        glow.fillRect(d.x - dw - 12, facadeBottom - 58, 12, 58);
        glow.fillRect(d.x + dw, facadeBottom - 58, 12, 58);
        glow.lineStyle(2, 0x1e1424, 1);
        glow.strokeRect(d.x - dw - 12, facadeBottom - 58, 12, 58);
        glow.strokeRect(d.x + dw, facadeBottom - 58, 12, 58);
        keep(glow, { x: d.x - 60, y: facadeBottom - 80, w: 120, h: 90 });
        const ray = this.add.graphics().setDepth(-73);
        ray.fillStyle(0xffe9a8, 0.3);
        ray.fillTriangle(d.x - dw, facadeBottom, d.x + dw, facadeBottom, d.x + dw + 22, facadeBottom + 70);
        ray.fillTriangle(d.x - dw, facadeBottom, d.x + dw + 22, facadeBottom + 70, d.x - dw - 22, facadeBottom + 70);
        keep(ray, { x: d.x - 60, y: facadeBottom, w: 120, h: 80 });
        signAt(d.x, facadeBottom - (big ? 90 : 76), big ? "IGREJA ABERTA" : "CULTO ÀS 19H", "#1f8a4c", "#fffaf0");
        if (animated) tweens.push(this.tweens.add({ targets: glow, alpha: { from: 0, to: 1 }, duration: 600 }));
      }
    } else if (id === "deposito-kits") {
      if (state === "abastecido") {
        for (const [x, y] of [
          [3722, 1325],
          [3790, 1338],
          [3846, 1316],
          [3760, 1380],
        ]) {
          const img = propImg("caixasKits", x, y);
          this.props.set(`kits-${x}`, { def: { id: `kits-${x}`, kind: "caixasKits", x, y, react: "spill", variant: "kits" }, img, busyUntil: 0 });
        }
        signAt(b.x + b.w / 2, facadeBottom - b.h - 14, "ESTOQUE: CHEIO DE KITS", "#6746a0", "#fff4ce", 10);
      } else {
        signAt(b.x + b.w / 2, facadeBottom - b.h - 14, "ESTOQUE: ZERADO", "#55555c", "#fff4ce", 10);
      }
    } else if (id === "terminal-china") {
      const belt = PROPS.find((p) => p.kind === "esteira")!;
      if (state === "em-operacao") {
        for (let k = 0; k < 4; k++) {
          const box = this.add.image(belt.x - 140, belt.y - 30, "brasil-caixa").setScale(0.7 / RES.small).setDepth(belt.y + 1);
          keep(box, { x: belt.x - 170, y: belt.y - 80, w: 340, h: 90 });
          tweens.push(this.tweens.add({ targets: box, x: belt.x + 140, duration: 4000, delay: k * 1000, repeat: -1 }));
        }
        signAt(belt.x, belt.y - 92, "DESPACHO: BRASIL → CHINA · EM OPERAÇÃO", "#b62f3e", "#fff4ce", 10);
        const crane = PROPS.find((p) => p.kind === "guindaste")!;
        const hook = this.add.graphics().setDepth(crane.y + 1);
        hook.lineStyle(2, 0x55555c, 1);
        hook.lineBetween(0, 0, 0, 70);
        hook.fillStyle(0xd1453b, 1);
        hook.fillRect(-26, 70, 52, 22);
        hook.setPosition(crane.x + 80, crane.y - 175);
        keep(hook, { x: crane.x - 40, y: crane.y - 200, w: 200, h: 140 });
        tweens.push(this.tweens.add({ targets: hook, angle: { from: -8, to: 8 }, duration: 1400, yoyo: true, repeat: -1, ease: "Sine.easeInOut" }));
      } else {
        signAt(belt.x, belt.y - 92, "OPERAÇÃO SUSPENSA", "#55555c", "#fff4ce", 11);
      }
    } else if (id === "universidade") {
      if (state === "liberou-geral") {
        propImg("barracaCamping", 3560, 700, "laranja");
        propImg("barracaCamping", 3650, 760, "azul");
        propImg("barracaCamping", 3920, 700, "verde");
        for (const [x, y] of [
          [3870, 772],
          [3720, 772],
        ]) {
          const spk = propImg("caixaSom", x, y);
          tweens.push(this.tweens.add({ targets: spk, scaleY: spk.scaleY * 1.12, duration: 240, yoyo: true, repeat: -1 }));
        }
        propImg("faixaCampus", 3800, 868, undefined, false);
        const t = this.add
          .text(3800, 868 - 90 * 0.97 + 23, "CAMPUS LIBERADO · LIBEROU GERAL", { fontFamily: FONT, fontSize: "12px", fontStyle: "900", color: "#7b4bd1", resolution: 2.5 })
          .setOrigin(0.5)
          .setDepth(869);
        keep(t, { x: 3680, y: 760, w: 240, h: 120 });
        for (let k = 0; k < 6; k++) {
          const note = this.add.text(3700 + k * 40, 740, k % 2 ? "♪" : "♫", { fontFamily: FONT, fontSize: "22px", color: ["#e63946", "#3a86ff", "#ffd23f"][k % 3], stroke: INK, strokeThickness: 3, resolution: 2 }).setDepth(900);
          keep(note, { x: 3650, y: 600, w: 320, h: 200 });
          tweens.push(this.tweens.add({ targets: note, y: 660, alpha: { from: 1, to: 0 }, duration: 1600, delay: k * 260, repeat: -1 }));
        }
      } else {
        signAt(3800, 650, "EXPEDIENTE NORMAL", "#3a86c8", "#fffaf0");
      }
    }
  }

  private rebuildSolids() {
    this.solids = this.interior ? this.interior.solids : [...this.baseSolids, ...[...this.placeSolids.values()].flat()];
  }

  /** Muda o estado de um lugar, salva e redesenha. */
  setPlace(id: PlaceId, state: string) {
    if (!(state in PLACES[id].states)) return;
    setPlaceState(id, state);
    this.progress.places[id] = state;
    for (const key of [...this.props.keys()]) if (key.startsWith("kits-")) this.props.delete(key);
    this.applyPlace(id, state, !this.inside);
    this.culler.prune();
    this.rebuildSolids();
    this.updateCulling(true);
  }

  // ------------------------------------------------------------------ câmera

  private computeZoom() {
    this.dpr = (this.registry.get("dpr") as number) ?? 1;
    const cssW = this.scale.width / this.dpr;
    const cssH = this.scale.height / this.dpr;
    const base = Phaser.Math.Clamp(Math.min(cssW, cssH) / 470, 0.75, 1.6);
    let factor = this.mode === "carro" ? 0.74 : 1;
    if (this.inside) {
      // o interior cabe quase inteiro na tela, sem deixar o personagem pequeno demais
      const r = this.inside.room;
      const fit = Math.min(cssW / (r.w + 60), cssH / (r.h + 140)) / base;
      factor = Phaser.Math.Clamp(fit, 0.78, 1.05);
    }
    this.zoomTarget = base * this.dpr * factor;
    if (this.inside && this.cameras?.main) this.setRoomBounds(this.inside);
  }

  private uiScale() {
    return this.dpr / this.cameras.main.zoom;
  }

  private activePos(): Point {
    return this.mode === "carro" && this.car ? { x: this.car.x, y: this.car.y } : { x: this.player.x, y: this.player.y };
  }

  private updateCamera(dt: number) {
    let tx: number;
    let ty: number;
    if (this.mode === "carro" && this.car) {
      const look = Phaser.Math.Clamp(this.car.speed * 0.38, -60, 160);
      tx = this.car.x + Math.cos(this.car.angle) * look;
      ty = this.car.y - 10 + Math.sin(this.car.angle) * look;
    } else {
      tx = this.player.x;
      ty = this.player.y - 30;
      // dentro do prédio o cômodo se abre para cima: a câmera olha um pouco à frente do personagem
      if (this.inside) ty -= Math.min(90, (this.scale.height / this.zoomTarget) * 0.14);
    }
    const k = 1 - Math.exp(-dt * 7);
    this.camTarget.x += (tx - this.camTarget.x) * k;
    this.camTarget.y += (ty - this.camTarget.y) * k;
    this.zoom += (this.zoomTarget - this.zoom) * (1 - Math.exp(-dt * 4));
    const cam = this.cameras.main;
    cam.setZoom(this.zoom);
    cam.centerOn(this.camTarget.x, this.camTarget.y);
  }

  private updateCulling(force = false) {
    const now = this.time.now;
    if (!force && now < this.nextCull) return;
    this.nextCull = now + 120;
    const v = this.cameras.main.worldView;
    // a área visível usa o zoom de destino para não "piscar" durante a transição de zoom
    const w = this.scale.width / this.zoomTarget;
    const h = this.scale.height / this.zoomTarget;
    const view = { x: this.camTarget.x - w / 2, y: this.camTarget.y - h / 2, w, h };
    const merged = {
      x: Math.min(v.x, view.x),
      y: Math.min(v.y, view.y),
      w: Math.max(v.right, view.x + view.w) - Math.min(v.x, view.x),
      h: Math.max(v.bottom, view.y + view.h) - Math.min(v.y, view.y),
    };
    this.culler.update(merged, 260);
    // personagens e carros longe ficam escondidos
    const far = (x: number, y: number) => x < merged.x - 300 || x > merged.x + merged.w + 300 || y < merged.y - 300 || y > merged.y + merged.h + 300;
    for (const n of this.npcs) n.walker.root.setVisible(!far(n.x, n.y));
    for (const c of this.cars) c.root.setVisible(!far(c.x, c.y));
  }

  // ------------------------------------------------------------------ laço principal

  update(_time: number, deltaMs: number) {
    if (this.paused) return;
    const frame = Math.min(deltaMs / 1000, 0.1);
    const steps = Math.max(1, Math.ceil(frame / (1 / 60)));
    const dt = frame / steps;
    const now = this.time.now;
    const k = this.keys;
    const kx = (k.D.isDown || k.RIGHT.isDown ? 1 : 0) - (k.A.isDown || k.LEFT.isDown ? 1 : 0);
    const ky = (k.S.isDown || k.DOWN.isDown ? 1 : 0) - (k.W.isDown || k.UP.isDown ? 1 : 0);

    if (!this.transition) {
      for (let i = 0; i < steps; i++) {
        if (this.seated) {
          // qualquer direção levanta
          if (kx !== 0 || ky !== 0 || Math.hypot(touchInput.x, touchInput.y) > 0.4) this.standUp();
          else this.player.animate(dt, 0, false);
        } else if (this.mode === "pe" || !this.car) this.updateWalking(dt, kx, ky);
        else {
          const car = this.car;
          const before = car.speed;
          car.drive(dt, this.carControls(car, kx, ky));
          this.collideCar(car, before);
          this.player.setPosition(car.x, car.y);
          if (this.pendingExit && Math.abs(car.speed) < 25) {
            this.pendingExit = false;
            this.exitCar();
          }
        }
      }
    }
    if (this.car) this.car.render(frame);

    const pos = this.activePos();
    worldState.x = pos.x;
    worldState.y = pos.y;
    worldState.angle = this.car && this.mode === "carro" ? this.car.angle : 0;
    worldState.inside = this.inside?.name ?? null;

    const cam = this.cameras.main.worldView;
    const near = this.mode === "pe" ? pos : null;
    // moradores da rua continuam vivos enquanto o jogador está num interior, mas só os próximos da câmera gastam processamento
    const streetView = this.inside ? null : cam;
    for (const n of this.npcs) {
      if (n.controlado || !streetView || n.x < cam.x - 500 || n.x > cam.right + 500 || n.y < cam.y - 500 || n.y > cam.bottom + 500) continue;
      n.update(frame, now, near);
    }
    this.rotinas.update(frame, (n) => !this.inside && n.x > cam.x - 300 && n.x < cam.right + 300 && n.y > cam.y - 300 && n.y < cam.bottom + 300);
    this.atualizaNoite();
    if (now - this.horaSalvaEm > 6000) {
      this.horaSalvaEm = now;
      saveHora(this.rotinas.minuto);
    }
    if (this.interior) {
      for (const n of this.interior.npcs) n.update(frame, now, near);
      this.interior.update(this.player.x, this.player.y, frame);
    }
    this.traffic.update(frame, now, this.trafficObstacles(), cam, this.inside ? null : pos, this.rotinas.minuto);
    this.checkDodges();
    if (!this.inside && now > this.nextChat) this.ambientChat(now);
    for (const w of this.water) w.tilePositionX += frame * 6;

    this.updateCandidate();
    if (this.actionQueued) {
      this.actionQueued = false;
      if (!this.transition && now >= this.busyUntil) this.candidate?.run();
    }
    if (now > this.nextScan) {
      this.nextScan = now + 300;
      this.updateDistrict();
      this.scanDiscoveries();
      this.checkWaypointArrival();
    }
    this.updateCamera(frame);
    this.updateCulling();
    this.updateBuildingsAlpha(frame);
    this.updateTallProps(frame);
    this.updateFocus(now);
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
    if (this.stamina <= 0) running = false;
    if (this.time.now < this.busyUntil) mag = 0;
    let speed = 0;
    if (mag > 0) {
      const len = Math.hypot(mx, my);
      const dirX = mx / len;
      const dirY = my / len;
      speed = (running ? RUN : WALK) * Math.min(1, mag);
      const res = pushOut(this.player.x + dirX * speed * dt, this.player.y + dirY * speed * dt, PLAYER_R, this.solids, this.walkObstacles());
      this.player.setPosition(res.x, res.y);
      this.player.faceToward(dirX, dirY);
    }
    this.stamina = drainStamina(this.stamina, dt, running && speed > WALK);
    this.player.animate(dt, speed, running);
  }

  private walkObstacles(): Circle[] {
    const list: Circle[] = [];
    const p = this.player;
    if (this.interior) {
      for (const n of this.interior.npcs) if (Math.abs(n.x - p.x) < 60 && Math.abs(n.y - p.y) < 60) list.push({ x: n.x, y: n.y, r: 9 });
      return list;
    }
    for (const c of [...this.cars, ...this.traffic.cars.map((t) => t.car)]) {
      if (Math.abs(c.x - p.x) > 120 || Math.abs(c.y - p.y) > 120) continue;
      for (const cc of c.circles()) list.push({ ...cc, r: cc.r + 2 });
    }
    for (const n of this.npcs) if (Math.abs(n.x - p.x) < 60 && Math.abs(n.y - p.y) < 60) list.push({ x: n.x, y: n.y, r: 9 });
    return list;
  }

  private carControls(car: Car, kx: number, ky: number): CarControls {
    const handbrake = this.keys.SPACE.isDown || this.pendingExit;
    if (this.pendingExit) return { throttle: 0, steer: 0, handbrake: true };
    if (kx !== 0 || ky !== 0) return { throttle: -ky, steer: kx, handbrake };
    if (touchInput.reverse) return { throttle: -1, steer: touchInput.x, handbrake: false };
    const m = Math.min(1, Math.hypot(touchInput.x, touchInput.y));
    if (m < 0.15) return { throttle: 0, steer: 0, handbrake };
    const desired = Math.atan2(touchInput.y, touchInput.x);
    const diff = wrapAngle(desired - car.angle);
    const v = car.speed;
    const ahead = Math.abs(diff) < (v < -20 ? 1.6 : 2.3);
    if (ahead || v > 60) return { throttle: m * (Math.abs(diff) > 1.3 ? 0.45 : 1), steer: Phaser.Math.Clamp(diff * 1.8, -1, 1), handbrake: false };
    const back = wrapAngle(desired - (car.angle + Math.PI));
    return { throttle: -m, steer: Phaser.Math.Clamp(-back * 1.8, -1, 1), handbrake: false };
  }

  private otherCarCircles(car: Car): Circle[] {
    const list: Circle[] = [];
    for (const c of [...this.cars, ...this.traffic.cars.map((t) => t.car)]) {
      if (c === car || Math.abs(c.x - car.x) > 140 || Math.abs(c.y - car.y) > 140) continue;
      list.push(...c.circles());
    }
    return list;
  }

  private collideCar(car: Car, speedBefore: number) {
    let hitTag: string | undefined;
    let bumped = false;
    const others = this.otherCarCircles(car);
    const near = this.solids.filter((s) => s.x < car.x + 80 && s.x + s.w > car.x - 80 && s.y < car.y + 80 && s.y + s.h > car.y - 80);
    for (let i = 0; i < 2; i++) {
      for (const c of car.circles()) {
        const res = pushOut(c.x, c.y, c.r, near, others);
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
    if (hitTag && impact > 55) this.react(hitTag, car);
    if (impact > 120) {
      this.cameras.main.shake(110, 0.003 * Math.min(2, impact / 200));
      sound.carimbo();
      car.setDriverFace("susto", 700);
    }
  }

  private checkDodges() {
    const car = this.mode === "carro" ? this.car : null;
    if (!car || Math.abs(car.speed) < 60) return;
    const circles = car.circles();
    for (const n of this.npcs) {
      if (Math.abs(n.x - car.x) > 80 || Math.abs(n.y - car.y) > 80) continue;
      for (const c of circles) {
        const dx = n.x - c.x;
        const dy = n.y - c.y;
        if (dx * dx + dy * dy < 34 * 34) {
          const side = Math.sign(-Math.sin(car.angle) * dx + Math.cos(car.angle) * dy) || 1;
          if (n.dodge(-Math.sin(car.angle) * side, Math.cos(car.angle) * side, (x, y) => isFree(x, y, 8, this.solids))) {
            this.say(n.id, Phaser.Utils.Array.GetRandom(DODGE_LINES), 1400, "grito");
          }
          break;
        }
      }
    }
  }

  // ------------------------------------------------------------------ objetos que reagem

  private react(tag: string, car: Car) {
    const view = this.props.get(tag);
    if (!view) return;
    const now = this.time.now;
    if (now < view.busyUntil) return;
    view.busyUntil = now + 2500;
    const p = view.def;
    if (p.react === "spill") this.spill(view, car);
    else if (p.react === "tip") {
      view.busyUntil = now + 21000;
      const dir = Math.cos(car.angle) >= 0 ? 1 : -1;
      this.tweens.add({ targets: view.img, angle: 84 * dir, x: p.x + 10 * dir, duration: 260, ease: "Quad.easeOut" });
      this.tweens.add({ targets: view.img, angle: 0, x: p.x, delay: 20000, duration: 500, ease: "Back.easeOut" });
      sound.tick();
      if (p.kind === "lixeira") this.debris(p.x, p.y, 0xfffaf0, 6);
    } else {
      this.tweens.add({ targets: view.img, angle: { from: -9, to: 9 }, duration: 90, yoyo: true, repeat: 3, onComplete: () => view.img.setAngle(0) });
      sound.tick();
    }
  }

  private debris(x: number, y: number, color: number, n: number) {
    for (let i = 0; i < n; i++) {
      const r = this.add.rectangle(x, y - 10, 7, 5, color).setStrokeStyle(1, 0x1e1424).setDepth(y + 1);
      const tx = x + (Math.random() - 0.5) * 90;
      const ty = y + Math.random() * 30;
      this.tweens.add({ targets: r, x: tx, y: ty, angle: 360 * Math.random(), duration: 420, ease: "Quad.easeOut" });
      this.tweens.add({ targets: r, alpha: 0, delay: 9000, duration: 800, onComplete: () => r.destroy() });
    }
  }

  private spill(view: PropView, car: Car) {
    const p = view.def;
    const kind = p.variant ?? "laranja";
    const texKey = kind === "kits" ? "kits" : `fruit:${kind}`;
    const scale = kind === "kits" ? 0.45 / RES.small : 1.7 / RES.small;
    const dirX = Math.cos(car.angle);
    const dirY = Math.sin(car.angle);
    for (let i = 0; i < 10; i++) {
      const fx = p.x + (Math.random() - 0.5) * 70;
      const fy = p.y - 18;
      const img = this.add.image(fx, fy, texKey).setScale(scale).setDepth(fy);
      const ang = Math.atan2(dirY, dirX) + (Math.random() - 0.5) * 2.2;
      const dist = 50 + Math.random() * 90;
      const tx = fx + Math.cos(ang) * dist;
      const ty = fy + Math.abs(Math.sin(ang)) * dist * 0.6 + 26;
      const arc = { p: 0 };
      this.tweens.add({
        targets: arc,
        p: 1,
        duration: 520 + Math.random() * 260,
        ease: "Quad.easeOut",
        onUpdate: () => {
          img.setPosition(fx + (tx - fx) * arc.p, fy + (ty - fy) * arc.p - Math.sin(arc.p * Math.PI) * 26);
          img.setDepth(img.y);
          img.setRotation(arc.p * 8);
        },
      });
      this.fruits.push(img);
    }
    while (this.fruits.length > 80) this.fruits.shift()?.destroy();
    this.cameras.main.shake(140, 0.004);
    sound.tick();
    sound.pop();
    this.tweens.add({ targets: view.img, angle: { from: -6, to: 6 }, duration: 80, yoyo: true, repeat: 2, onComplete: () => view.img.setAngle(0) });
    // quem estiver perto reclama
    const witness = this.npcs
      .filter((n) => Math.hypot(n.x - p.x, n.y - p.y) < 260)
      .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
    if (witness) {
      const lines = kind === "kits" ? ["Os kits! Eram do almoxarifado!", "Agora o boato espalhou de verdade!"] : SPILL_LINES[kind] ?? SPILL_LINES.laranja;
      this.time.delayedCall(250, () => this.say(witness.id, Phaser.Utils.Array.GetRandom(lines), 1800, "grito"));
      witness.walker.hop(14);
      witness.walker.setFace("susto", 1500);
    }
  }

  // ------------------------------------------------------------------ interação

  private queueAction() {
    if (this.paused) return;
    const now = this.time.now;
    if (now - this.lastActionAt < 280) return;
    this.lastActionAt = now;
    this.actionQueued = true;
  }

  /** Escurece a rua à noite (dentro dos prédios a luz é sempre a mesma). */
  private atualizaNoite() {
    const cam = this.cameras.main;
    const alvo = this.inside ? 0 : 0.4 * escuridao(this.rotinas.minuto);
    this.noite.setPosition(cam.midPoint.x, cam.midPoint.y);
    if (Math.abs(this.noite.alpha - alvo) > 0.002) this.noite.setAlpha(this.noite.alpha + (alvo - this.noite.alpha) * 0.08);
  }

  private updateCandidate() {
    if (this.transition) {
      this.candidate = null;
      return;
    }
    if (this.mode === "carro") {
      this.candidate = { label: "Sair do carro", priority: 0, dist: 0, run: () => this.requestExit(), focus: null };
      return;
    }
    if (this.seated) {
      this.candidate = { label: this.seated.pose === "deitado" ? "Levantar" : "Levantar", priority: 0, dist: 0, run: () => this.standUp(), focus: null };
      return;
    }
    const px = this.player.x;
    const py = this.player.y;
    const cands: Candidate[] = [];
    if (this.inside && this.interior) {
      const room = this.inside;
      const d = Math.hypot(room.exit.x - px, room.exit.y - py);
      if (d < 60) cands.push({ label: "Sair para a rua", priority: 1, dist: d - 12, run: () => this.leaveInterior(), focus: null });
      for (const spot of interiorSpots(room, this.progress.places)) {
        const ds = Math.hypot(spot.x - px, spot.y - py);
        if (ds >= SPOT_DIST) continue;
        const prop = spot.prop ? this.interior.props.get(spot.prop) : undefined;
        const fy = prop ? prop.top - 4 : spot.y - 70;
        const on = this.toggles.get(spot.prop ?? spot.id);
        const label = on && (spot.kind === "tv" || spot.kind === "radio" || spot.kind === "jukebox") ? spot.label.replace(/^(Ligar|Escolher|Mudar)/, "Desligar").replace(/^Desligar uma música/, "Desligar a música") : spot.label;
        cands.push({ label, priority: 1, dist: ds, run: () => this.useSpot(spot), focus: { x: prop?.def.x ?? spot.x, y: fy } });
      }
      for (const n of this.interior.npcs) {
        const dn = Math.hypot(n.x - px, n.y - py);
        if (dn < TALK_DIST) cands.push({ label: `Falar com ${n.def.name}`, priority: 1, dist: dn + 6, run: () => this.talk(n), focus: { x: n.x, y: n.y - 86 } });
      }
    } else {
      for (const c of this.cars) {
        const d = Math.hypot(c.x - px, c.y - py);
        if (d < CAR_DIST) cands.push({ label: "Entrar no carro", priority: 1, dist: d + 8, run: () => this.enterCar(c), focus: { x: c.x, y: c.y - 30 } });
      }
      for (const b of BUILDINGS) {
        const main = doorPoint(b);
        const dm = Math.hypot(main.x - px, main.y - py);
        const locked = !!b.place && isPlace(b.place) && this.progress.places[b.place] === "interditada";
        if (dm < DOOR_DIST) {
          if (locked) cands.push({ label: "Ler o decreto na porta", priority: 1, dist: dm, run: () => this.readDecree(b), focus: { x: main.x, y: b.y + b.d - 142 } });
          else cands.push({ label: entryLabel(b), priority: 1, dist: dm, run: () => this.enterInterior(b, main), focus: { x: main.x, y: b.y + b.d - 60 } });
        }
        if (sideDoorFrac(b) !== null) {
          const side = doorPoint(b, true);
          const ds = Math.hypot(side.x - px, side.y - py);
          if (ds < DOOR_DIST) cands.push({ label: "Entrar pela porta lateral", priority: 1, dist: ds, run: () => this.enterInterior(b, side), focus: { x: side.x, y: b.y + b.d - 84 } });
        }
      }
      for (const n of this.npcs) {
        const d = Math.hypot(n.x - px, n.y - py);
        if (d < TALK_DIST) cands.push({ label: `Falar com ${n.def.name}`, priority: 2, dist: d, run: () => this.talk(n), focus: { x: n.x, y: n.y - 86 } });
      }
    }
    if (this.stamina < MAX_STAMINA - 1 && this.time.now - this.lastDrinkAt > 1500) {
      const stops: CachacaStop[] = this.inside ? (this.inside.cachaca ? [this.inside.cachaca] : []) : STREET_CACHACA;
      for (const c of stops) {
        const d = Math.hypot(c.x - px, c.y - py);
        if (d < 56) cands.push({ label: "Beber cachaça", priority: 0, dist: d, run: () => this.drink(), focus: { x: c.x, y: c.y - 110 } });
      }
    }
    cands.sort((a, b) => a.priority - b.priority || a.dist - b.dist);
    this.candidate = cands[0] ?? null;
  }

  /** A porta da frente da igreja continua lacrada: só a piada, e a dica da lateral. */
  private readDecree(b: CityBuilding) {
    sound.carimbo();
    this.cameras.main.shake(80, 0.002);
    const side = sideDoorFrac(b) !== null;
    this.say("hero", side ? "\u201cINTERDITADA POR DECRETO.\u201d O decreto não fala nada da porta lateral…" : "\u201cINTERDITADA POR DECRETO.\u201d", 2800);
    this.toast(side ? "Dica: a porta lateral (tapete azul) continua aberta." : "Interditada.");
  }

  private enterCar(car: Car) {
    this.car = car;
    this.mode = "carro";
    this.pendingExit = false;
    this.player.setVisible(false);
    car.setDriver(this.hero);
    this.computeZoom();
    this.busyUntil = this.time.now + 250;
    sound.porta();
    this.emitHud(true);
  }

  private requestExit() {
    if (!this.car) return;
    if (Math.abs(this.car.speed) > 40) {
      this.pendingExit = true;
      return;
    }
    this.exitCar();
  }

  /** Procura um lugar livre ao lado do carro: nunca deixa o personagem preso. */
  private exitSpot(car: Car): Point | null {
    const c = Math.cos(car.angle);
    const s = Math.sin(car.angle);
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
      [0, -80],
      [0, 80],
    ];
    const blockers = [...this.cars.flatMap((cc) => cc.circles().map((k) => ({ ...k, r: k.r + 2 }))), ...this.npcs.map((n) => ({ x: n.x, y: n.y, r: 9 }))];
    for (const [lx, ly] of offsets) {
      const x = car.x + c * lx - s * ly;
      const y = car.y + s * lx + c * ly;
      if (x < 140 || y < 160 || x > CITY.w - 140 || y > CITY.h - 180) continue;
      if (isFree(x, y, PLAYER_R + 1, this.solids, blockers)) return { x, y };
    }
    return null;
  }

  private exitCar() {
    const car = this.car;
    if (!car) return;
    const spot = this.exitSpot(car);
    if (!spot) {
      this.toast("Sem espaço para sair aqui. Ande um pouco com o carro.");
      return;
    }
    this.mode = "pe";
    car.speed = 0;
    car.setDriver(null);
    car.render(0);
    this.car = null;
    this.player.setPosition(spot.x, spot.y);
    this.player.setVisible(true);
    this.player.faceToward(spot.x - car.x, spot.y - car.y);
    this.computeZoom();
    this.busyUntil = this.time.now + 200;
    sound.porta();
    // estacionou numa vaga pintada?
    for (const p of PARKING) {
      if (stalls(p).some((s) => Math.hypot(s.x - car.x, s.y - car.y) < 26)) {
        this.toast(`Estacionado: ${p.name}`);
        break;
      }
    }
    this.emitHud(true);
  }

  private drink() {
    this.stamina = MAX_STAMINA;
    this.lastDrinkAt = this.time.now;
    this.busyUntil = this.time.now + 950;
    this.player.setFace("comemora", 1000);
    this.player.drink();
    this.player.hop(5);
    sound.ping();
    this.say("hero", Phaser.Utils.Array.GetRandom(DRINK_LINES), 1800);
    this.toast("Cachaça presidencial · energia de corrida +100");
    this.emitHud(true);
  }

  private talk(n: Npc) {
    n.attend(this.player.x, this.player.y);
    this.player.faceToward(n.x - this.player.x, n.y - this.player.y);
    const lines = n.def.lines;
    // moradores com rotina comentam o que estão fazendo agora (de vez em quando)
    const doMomento = n.lineIdx % 2 === 0 ? this.rotinas.fala(n.id, Math.floor(n.lineIdx / 2)) : null;
    this.say(n.id, doMomento ?? lines[n.lineIdx % lines.length], 2600);
    n.lineIdx++;
    sound.pop();
  }

  private horn() {
    if (this.mode !== "carro" || !this.car) return;
    sound.buzina();
    for (const n of this.npcs) {
      if (Math.hypot(n.x - this.car.x, n.y - this.car.y) < 170) {
        n.walker.hop(12);
        n.walker.setFace("susto", 900);
      }
    }
  }

  // ------------------------------------------------------------------ orientação

  private updateDistrict(force = false) {
    if (this.inside) return;
    const p = this.activePos();
    const d = districtAt(p.x, p.y);
    if (!d || (d === this.district && !force)) return;
    this.district = d;
    bus.emit("district", { name: d.name, tagline: d.tagline, color: d.color });
    this.emitHud(true);
  }

  private discoverPoi(id: string) {
    const poi = POIS.find((p) => p.id === id);
    if (!poi || !discover(poi.id)) return;
    this.progress.discovered.push(poi.id);
    this.toast(`Descoberto: ${poi.name}`);
  }

  private scanDiscoveries() {
    if (this.inside) return;
    const p = this.activePos();
    for (const poi of POIS) {
      if (this.progress.discovered.includes(poi.id)) continue;
      if (Math.abs(poi.x - p.x) < 170 && Math.abs(poi.y - p.y) < 150) {
        this.discoverPoi(poi.id);
        break;
      }
    }
  }

  private checkWaypointArrival() {
    const w = worldState.waypoint;
    if (!w || this.inside) return;
    const p = this.activePos();
    if (Math.hypot(w.x - p.x, w.y - p.y) < 90) {
      this.toast(`Você chegou: ${w.label}`);
      sound.success();
      worldState.waypoint = null;
      saveWaypoint(null);
      this.emitHud(true);
    }
  }

  private toast(msg: string) {
    const now = this.time.now;
    if (now - this.lastToastAt < 900 && !msg.startsWith("Sem espaço")) {
      this.time.delayedCall(900, () => bus.emit("toast", msg));
    } else bus.emit("toast", msg);
    this.lastToastAt = now;
  }

  private speakerPos(id: string): Point {
    if (id === "hero") return this.mode === "carro" && this.car ? { x: this.car.x, y: this.car.y - 30 } : { x: this.player.x, y: this.player.y - (this.seated ? 64 : 78) };
    const n = this.npcs.find((m) => m.id === id) ?? this.interior?.npcs.find((m) => m.id === id);
    return n ? { x: n.x, y: n.y - 78 } : { x: 0, y: 0 };
  }

  private sayNpc(n: Npc, text: string) {
    this.say(n.id, text, 2600);
  }

  /** Pedestres, jogador e carros parados que o trânsito precisa respeitar. */
  private trafficObstacles(): Obstacle[] {
    const list: Obstacle[] = [];
    if (!this.inside) {
      if (this.mode === "carro" && this.car) list.push({ x: this.car.x, y: this.car.y, r: 20, still: Math.abs(this.car.speed) < 5 });
      else list.push({ x: this.player.x, y: this.player.y, r: 12, still: false });
    }
    for (const n of this.npcs) list.push({ x: n.x, y: n.y, r: 10, still: !n.def.route });
    for (const c of this.cars) if (c !== this.car || this.inside) list.push({ x: c.x, y: c.y, r: 20, still: true });
    return list;
  }

  /** Duplas conversando e filas reclamando, só perto do jogador. */
  private ambientChat(now: number) {
    this.nextChat = now + 2600 + Math.random() * 2600;
    const p = this.activePos();
    const groups = new Map<string, Npc[]>();
    for (const n of this.npcs) {
      const g = (n.def as CityNpc).group;
      if (!g || Math.abs(n.x - p.x) > 360 || Math.abs(n.y - p.y) > 260) continue;
      groups.set(g, [...(groups.get(g) ?? []), n]);
    }
    const list = [...groups.values()];
    if (!list.length) return;
    const g = list[Math.floor(Math.random() * list.length)];
    const speaker = g[Math.floor(Math.random() * g.length)];
    if (this.bubbles.has(speaker.id)) return;
    const pool = CHATTER[(speaker.def as CityNpc).district];
    const other = g.find((m) => m !== speaker);
    if (other) {
      speaker.attend(other.x, other.y, 2400);
      other.attend(speaker.x, speaker.y, 2400);
    }
    this.say(speaker.id, pool[Math.floor(Math.random() * pool.length)], 2300);
  }

  /** Árvores, postes e placas altas ficam transparentes quando o jogador passa atrás. */
  private updateTallProps(dt: number) {
    if (this.inside) return;
    const p = this.activePos();
    const k = Math.min(1, dt * 8);
    for (const t of this.tallProps) {
      if (Math.abs(t.x - p.x) > 160 || Math.abs(t.y - p.y) > 220) {
        if (t.img.alpha !== 1) t.img.alpha = Math.min(1, t.img.alpha + dt * 4);
        continue;
      }
      const behind = Math.abs(p.x - t.x) < t.halfW && p.y < t.y - 2 && p.y > t.top + 24;
      const a = behind ? 0.4 : 1;
      t.img.alpha += (a - t.img.alpha) * k;
    }
  }

  /** Seta amarela sobre o que vai receber a ação, com o texto curto da ação. */
  private updateFocus(now: number) {
    const f = this.candidate?.focus;
    if (!f || this.transition) {
      this.focus.setVisible(false);
      return;
    }
    const s = this.uiScale();
    this.focus.setVisible(true).setPosition(f.x, f.y - Math.abs(Math.sin(now / 200)) * 5 * s).setScale(s);
    const text = this.candidate!.label;
    if (this.focusText.text !== text) this.focusText.setText(text);
  }

  private say(id: string, text: string, ms: number, tone: "fala" | "grito" = "fala") {
    this.bubbles.get(id)?.destroy();
    const res = Math.min(4, Math.max(2, this.dpr * 1.5));
    const b = new Bubble(this, text, () => this.speakerPos(id), ms, res, tone);
    this.bubbles.set(id, b);
    b.update(this.time.now, this.uiScale());
  }

  private updateBubbles(now: number) {
    const s = this.uiScale();
    for (const [id, b] of this.bubbles) if (!b.update(now, s)) this.bubbles.delete(id);
  }

  private updateMarker(now: number) {
    const t = this.inside ? null : worldState.waypoint;
    this.marker.setVisible(!!t);
    this.ring.setVisible(!!t);
    this.edgeArrow.setVisible(false);
    if (!t) return;
    const s = this.uiScale();
    const bob = Math.sin(now / 180) * 5 * s;
    this.marker.setPosition(t.x, t.y - 96 - bob).setScale((1 / RES.small) * s * 1.2);
    const pulse = 1 + Math.sin(now / 250) * 0.12;
    this.ring.clear();
    this.ring.lineStyle(4, 0xffd23f, 0.95);
    this.ring.strokeEllipse(t.x, t.y, 70 * pulse, 28 * pulse);
    this.ring.setDepth(t.y - 1);
    const view = this.cameras.main.worldView;
    if (t.x < view.x || t.x > view.right || t.y - 60 < view.y || t.y > view.bottom) {
      // a seta fica dentro de uma área que não encosta no HUD (cartão em cima, botões embaixo)
      const area = { x: view.x + 70 * s, y: view.y + 150 * s, r: view.right - 70 * s, b: view.bottom - 140 * s };
      const cx = (area.x + area.r) / 2;
      const cy = (area.y + area.b) / 2;
      const dx = t.x - cx;
      const dy = t.y - 40 - cy;
      const kx = dx !== 0 ? (area.r - area.x) / 2 / Math.abs(dx) : Infinity;
      const ky = dy !== 0 ? (area.b - area.y) / 2 / Math.abs(dy) : Infinity;
      const k = Math.min(kx, ky);
      this.edgeArrow
        .setVisible(true)
        .setPosition(cx + dx * k, cy + dy * k)
        .setRotation(Math.atan2(dy, dx) - Math.PI / 2)
        .setScale((1 / RES.small) * s * 1.35);
    }
  }

  private updateBuildingsAlpha(dt: number) {
    if (this.inside) return;
    const p = this.activePos();
    for (const { def, img, top } of this.buildings) {
      if (Math.abs(def.x + def.w / 2 - p.x) > def.w / 2 + 60 || p.y < top - 40 || p.y > def.y + def.d + 40) {
        if (img.alpha !== 1) img.alpha = Math.min(1, img.alpha + dt * 4);
        continue;
      }
      const behind = p.x > def.x - 10 && p.x < def.x + def.w + 10 && p.y - 30 > top && p.y < def.y + def.d - 4;
      const target = behind ? 0.42 : 1;
      img.alpha += (target - img.alpha) * Math.min(1, dt * 8);
    }
  }

  // ------------------------------------------------------------------ HUD e depuração

  private emitHud(force = false) {
    const w = worldState.waypoint;
    let objective = "Explore a cidade e entre em qualquer prédio. M (ou o botão Mapa) mostra onde você está.";
    const room = this.inside ? this.currentRoom() : null;
    if (this.inside) objective = this.seated ? "Mexa-se para levantar." : "Saída: o tapete vermelho, embaixo.";
    else if (w) {
      const p = this.activePos();
      const meters = Math.round(Math.hypot(w.x - p.x, w.y - p.y) / 4 / 10) * 10;
      objective = `Destino: ${w.label} · ${meters} m`;
    }
    const state: HudState = {
      mode: this.mode,
      action: this.candidate?.label ?? null,
      missionTitle: null,
      objective,
      done: false,
      stamina: Math.ceil(this.stamina),
      completed: 0,
      total: 0,
      place: this.inside ? `${this.inside.name}${room ? ` · ${room}` : ""}` : (this.district?.name ?? null),
      hora: formataHora(this.rotinas.minuto),
      periodo: periodoDe(this.rotinas.minuto),
      map: true,
      inside: this.inside ? { building: this.inside.building, name: this.inside.name, room } : null,
    };
    const key = JSON.stringify(state);
    if (!force && key === this.hudKey) return;
    this.hudKey = key;
    bus.emit("hud", state);
  }

  /** Cômodo em que o jogador está. */
  private currentRoom(): string | null {
    if (!this.inside) return null;
    const { x, y } = this.player;
    // o cômodo menor que contém o ponto (cômodos pequenos ficam por cima do principal)
    const hit = this.inside.rooms
      .filter((r) => x >= r.rect.x && x <= r.rect.x + r.rect.w && y >= r.rect.y - 20 && y <= r.rect.y + r.rect.h)
      .sort((a, b) => a.rect.w * a.rect.h - b.rect.w * b.rect.h)[0];
    return (hit ?? [...this.inside.rooms].sort((a, b) => b.rect.w * b.rect.h - a.rect.w * a.rect.h)[0])?.name ?? null;
  }

  private exposeDebug() {
    const w = window as unknown as Record<string, unknown>;
    w.__pde = {
      state: () => ({
        hero: this.hero,
        mode: this.mode,
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
        car: this.car ? { id: this.carIds.get(this.car), x: Math.round(this.car.x), y: Math.round(this.car.y), angle: +this.car.angle.toFixed(2), speed: Math.round(this.car.speed) } : null,
        district: this.district?.id ?? null,
        inside: this.inside?.id ?? null,
        room: this.currentRoom(),
        exit: this.inside ? this.inside.exit : null,
        cars: [...this.carIds.entries()].map(([c, id]) => ({ id, x: Math.round(c.x), y: Math.round(c.y) })),
        seated: this.seated?.pose ?? null,
        interiorObjects: this.interior?.objs.length ?? 0,
        traffic: this.traffic.cars.filter((t) => t.ativo).map((t) => ({ id: t.id, x: Math.round(t.car.x), y: Math.round(t.car.y), speed: Math.round(t.speedNow) })),
        action: this.candidate?.label ?? null,
        stamina: Math.round(this.stamina),
        places: { ...this.progress.places },
        discovered: this.progress.discovered.length,
        waypoint: worldState.waypoint,
        zoom: +this.cameras.main.zoom.toFixed(2),
        fps: Math.round(this.game.loop.actualFps),
        visible: this.culler.visibleCount,
        culled: this.culler.size,
      }),
      teleport: (x: number, y: number) => {
        if (this.mode === "carro" && this.car) {
          this.car.x = x;
          this.car.y = y;
          this.car.speed = 0;
        } else this.player.setPosition(x, y);
        this.camTarget = { x, y };
        this.updateCulling(true);
      },
      carTo: (id: string, x: number, y: number, angle = 0) => {
        const car = [...this.carIds.entries()].find(([, v]) => v === id)?.[0];
        if (!car) return false;
        car.x = x;
        car.y = y;
        car.angle = angle;
        car.speed = 0;
        car.render(0);
        return true;
      },
      setPlace: (id: string, state: string) => (isPlace(id) ? (this.setPlace(id, state), true) : false),
      setStamina: (v: number) => (this.stamina = v),
      act: () => this.queueAction(),
      worldH: WORLD_H,
      /** Entra direto num prédio (testes). */
      enter: (id: string) => {
        const b = buildingById(id);
        if (!b) return false;
        if (this.inside) {
          this.interior?.destroy();
          this.interior = null;
          this.inside = null;
        }
        this.enterInterior(b);
        return true;
      },
      leave: () => this.leaveInterior(),
      /** Teleporta para uma interação do interior atual e devolve o rótulo. */
      gotoSpot: (index: number) => {
        const spot = this.inside ? interiorSpots(this.inside, this.progress.places)[index] : undefined;
        if (!spot) return null;
        this.standUp();
        this.player.setPosition(spot.x, spot.y);
        this.camTarget = { x: spot.x, y: spot.y };
        return spot.label;
      },
      spots: () => (this.inside ? interiorSpots(this.inside, this.progress.places) : []).map((sp) => ({ id: sp.id, kind: sp.kind, label: sp.label, x: sp.x, y: sp.y })) ?? [],
      interiors: () => INTERIORS.map((i) => ({ id: i.id, building: i.building, template: i.template, name: i.name, spots: i.spots.length, rooms: i.rooms.length })),
      candidate: () => this.candidate?.label ?? null,
      toggles: () => Object.fromEntries(this.toggles),
      trafegoDebug: () => this.traffic.cars.filter((c) => c.ativo && c.speedNow < 5).map((c) => c.debug()),
      /** Muda a hora da cidade (em horas, por exemplo 21.5) e ajeita os moradores na hora. */
      setHora: (h: number) => this.rotinas.ajustar(h * 60),
      hora: () => formataHora(this.rotinas.minuto, 1),
      rotinas: () => ({ ...this.rotinas.resumo(), ocupacao: this.rotinas.ocupacao() }),
    };
  }
}
