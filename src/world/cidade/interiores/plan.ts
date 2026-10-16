import type { LookId } from "../../looks";
import type { Point, Rect } from "../../types";
import type {
  CityBuilding,
  CityPropKind,
  CityNpc,
  FloorKind,
  InteractionSpot,
  InteriorDef,
  InteriorProp,
  InteriorWall,
  PlaceCondition,
  SpotKind,
  TemplateId,
} from "../types";

/**
 * Montagem de interiores. Cada modelo (casa, bar, igreja…) descreve cômodos, paredes,
 * móveis e interações em coordenadas locais; o `Plan` converte para a faixa de
 * interiores abaixo da cidade e gera ids estáveis a partir do id do prédio.
 *
 * Só um interior existe na cena por vez, então todos usam a mesma origem.
 */

export const INTERIOR_ORIGIN = { x: 200, y: 3950 };
/** Espessura das paredes internas. */
export const WALL_T = 14;
/** Altura visível das paredes internas. */
export const WALL_FACE = 54;

/** Gerador pseudoaleatório determinístico: o mesmo prédio sempre gera o mesmo interior. */
export function rng(seedText: string) {
  let h = 2166136261;
  for (let i = 0; i < seedText.length; i++) h = Math.imul(h ^ seedText.charCodeAt(i), 16777619);
  let s = h >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (a: number, b: number) => a + Math.floor(next() * (b - a + 1)),
    pick: <T>(list: readonly T[]): T => list[Math.floor(next() * list.length)],
    chance: (p: number) => next() < p,
  };
}
export type Rng = ReturnType<typeof rng>;

export interface PlanOptions {
  id: string;
  name: string;
  template: TemplateId;
  w: number;
  h: number;
  wallH?: number;
  wall: string;
  /** Posição da porta de saída na parede de baixo (local). */
  exitX?: number;
}

export class Plan {
  readonly def: InteriorDef;
  readonly o: Point;
  private n = 0;
  private flipX: boolean;

  constructor(
    readonly b: CityBuilding,
    opts: PlanOptions,
    readonly r: Rng,
    flip = false,
  ) {
    this.o = INTERIOR_ORIGIN;
    this.flipX = flip;
    const wallH = opts.wallH ?? 96;
    const exitX = opts.exitX ?? opts.w / 2;
    this.def = {
      id: opts.id,
      name: opts.name,
      building: b.id,
      template: opts.template,
      room: { x: this.o.x, y: this.o.y, w: opts.w, h: opts.h },
      wallH,
      wall: opts.wall,
      rooms: [],
      walls: [],
      entry: { x: 0, y: 0 },
      exit: { x: 0, y: 0 },
      props: [],
      npcs: [],
      posters: [],
      spots: [],
      hooks: b.hooks,
    };
    this.def.entry = this.pt(exitX, opts.h - 50);
    this.def.exit = this.pt(exitX, opts.h - 14);
  }

  get w() {
    return this.def.room.w;
  }
  get h() {
    return this.def.room.h;
  }
  get wallH() {
    return this.def.wallH;
  }

  /** Converte x local para o mundo, espelhando quando o modelo foi sorteado invertido. */
  private lx(x: number, exempt = false) {
    return this.o.x + (this.flipX && !exempt ? this.w - x : x);
  }
  private pt(x: number, y: number, exempt = false): Point {
    return { x: this.lx(x, exempt), y: this.o.y + y };
  }
  private rect(x: number, y: number, w: number, h: number): Rect {
    const x0 = this.flipX ? this.w - x - w : x;
    return { x: this.o.x + x0, y: this.o.y + y, w, h };
  }
  get flipped() {
    return this.flipX;
  }
  private uid(prefix: string) {
    this.n++;
    return `${this.def.id}-${prefix}-${this.n}`;
  }

  room(id: string, name: string, x: number, y: number, w: number, h: number, floor: FloorKind, tint: string) {
    this.def.rooms.push({ id: `${this.def.id}-${id}`, name, rect: this.rect(x, y, w, h), floor, tint });
  }

  /** Parede horizontal em y, de x0 a x1, com vãos [x, largura]. */
  hwall(y: number, x0: number, x1: number, gaps: [number, number][] = [], color?: string) {
    const sorted = [...gaps].sort((a, b) => a[0] - b[0]);
    let cur = x0;
    for (const [gx, gw] of [...sorted, [x1, 0] as [number, number]]) {
      if (gx > cur) this.pushWall(this.rect(cur, y, gx - cur, WALL_T), color);
      cur = gx + gw;
    }
  }

  /** Parede vertical em x, de y0 a y1, com vãos [y, altura]. */
  vwall(x: number, y0: number, y1: number, gaps: [number, number][] = [], color?: string) {
    const sorted = [...gaps].sort((a, b) => a[0] - b[0]);
    let cur = y0;
    for (const [gy, gh] of [...sorted, [y1, 0] as [number, number]]) {
      if (gy > cur) this.pushWall(this.rect(x - WALL_T / 2, cur, WALL_T, gy - cur), color);
      cur = gy + gh;
    }
  }

  private pushWall(r: Rect, color?: string) {
    const w: InteriorWall = { ...r, id: this.uid("parede"), face: WALL_FACE, color: color ?? this.def.wall };
    this.def.walls.push(w);
  }

  /** Móvel ou objeto. Devolve o id para ligar uma interação. */
  prop(kind: CityPropKind, x: number, y: number, extra: Partial<InteriorProp> = {}): string {
    const id = extra.id ?? this.uid(kind.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`));
    const p = this.pt(x, y);
    this.def.props.push({ kind, ...extra, id, x: p.x, y: p.y });
    return id;
  }

  /** Objeto pendurado na parede do fundo (quadro, lousa, janela). */
  wallProp(kind: CityPropKind, x: number, extra: Partial<InteriorProp> = {}): string {
    return this.prop(kind, x, this.wallH - 4, extra);
  }

  spot(kind: SpotKind, x: number, y: number, label: string, extra: Partial<Omit<InteractionSpot, "seat">> & { seat?: { x: number; y: number; facing: "front" | "back" | "side"; flip?: boolean } } = {}) {
    const p = this.pt(x, y);
    const seat = extra.seat ? { ...this.pt(extra.seat.x, extra.seat.y), facing: extra.seat.facing, flip: extra.seat.facing === "side" ? (this.flipX ? !extra.seat.flip : !!extra.seat.flip) : undefined } : undefined;
    this.def.spots.push({ id: this.uid(`acao-${kind}`), kind, label, ...extra, x: p.x, y: p.y, seat });
  }

  npc(look: LookId, name: string, x: number, y: number, lines: string[], extra: Partial<CityNpc> = {}) {
    const p = this.pt(x, y);
    const route = extra.route?.map((q) => this.pt(q.x, q.y));
    const flip = extra.flip !== undefined && this.flipX ? !extra.flip : extra.flip;
    this.def.npcs.push({ id: this.uid("morador"), district: this.b.district, name, look, facing: "front", lines, ...extra, flip, route, x: p.x, y: p.y });
  }

  poster(text: string, x: number, color = "#fffaf0", bg = "#c62835", y = 46, when?: PlaceCondition) {
    const p = this.pt(x, y);
    this.def.posters.push({ text, x: p.x, y: p.y, color, bg, when });
  }

  cachaca(name: string, x: number, y: number) {
    const p = this.pt(x, y);
    this.def.cachaca = { id: `cachaca-${this.def.id}`, name, district: this.b.district, x: p.x, y: p.y };
  }
}
