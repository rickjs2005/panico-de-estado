import type { Point, Rect } from "../types";
import { CIVICO } from "./distritos/civico";
import { COMERCIAL } from "./distritos/comercial";
import { EDUCACIONAL } from "./distritos/educacional";
import { INDUSTRIAL } from "./distritos/industrial";
import { RESIDENCIAL } from "./distritos/residencial";
import { TERMINAL } from "./distritos/terminal";
import { stalls } from "./helpers";
import { INTERIORS } from "./interiors";
import { CITY, DISTRICTS, LIMITS, ROADS, WORLD_H } from "./layout";
import type { CityBuilding, CityProp, CityPropKind, DistrictContent, DistrictDef, DistrictId, InteriorDef, Poi } from "./types";

/**
 * A cidade montada a partir dos distritos. Tudo o que a cena, o mapa e as checagens
 * precisam sai daqui.
 */

export { CITY, DISTRICTS, INTERIORS, LIMITS, ROADS, WORLD_H, stalls };

export const DISTRICT_CONTENT: Record<DistrictId, DistrictContent> = {
  residencial: RESIDENCIAL,
  civico: CIVICO,
  educacional: EDUCACIONAL,
  industrial: INDUSTRIAL,
  comercial: COMERCIAL,
  terminal: TERMINAL,
};

function all<K extends keyof DistrictContent>(k: K): DistrictContent[K] {
  const out: unknown[] = [];
  for (const c of Object.values(DISTRICT_CONTENT)) out.push(...(c[k] as unknown[]));
  return out as DistrictContent[K];
}

export const BUILDINGS: CityBuilding[] = all("buildings");
export const PARKING = all("parking");
export const VEHICLES = all("vehicles");
export const GROUNDS = all("grounds");
export const NPCS = all("npcs");

/** Paradas de cachaça (energia de corrida), na rua e dentro do bar. */
export const CACHACA = [...all("cachaca"), ...INTERIORS.flatMap((i) => (i.cachaca ? [i.cachaca] : []))];

/** Placas com o nome das ruas, perto de onde cada uma começa e no meio. */
function streetSigns(): CityProp[] {
  const out: CityProp[] = [];
  for (const r of ROADS) {
    const { x, y, w, h } = r.rect;
    if (w > h) {
      for (const sx of w > 700 ? [x + 90, x + w / 2 + 40] : [x + 90]) out.push({ id: `placa-${r.id}-${Math.round(sx)}`, kind: "placaRua", x: sx, y: y + h + 26, text: r.name });
    } else {
      for (const sy of h > 700 ? [y + 160, y + h / 2 + 60] : [y + 160]) out.push({ id: `placa-${r.id}-${Math.round(sy)}`, kind: "placaRua", x: x + w + 16, y: sy, text: r.name });
    }
  }
  return out;
}

/** Postes de luz ao longo das avenidas. */
function avenueLights(): CityProp[] {
  const out: CityProp[] = [];
  for (const r of ROADS.filter((a) => a.kind === "avenida")) {
    const { x, y, w, h } = r.rect;
    if (w > h) for (let px = x + 140; px < x + w - 80; px += 320) out.push({ kind: "poste", x: px, y: y - 10 });
    else for (let py = y + 200; py < y + h - 80; py += 320) out.push({ kind: "poste", x: x - 12, y: py });
  }
  return out;
}

function withIds(list: CityProp[]): (CityProp & { id: string })[] {
  return list.map((p) => ({ ...p, id: p.id ?? `${p.kind.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}-${Math.round(p.x)}-${Math.round(p.y)}` }));
}

export const PROPS = withIds([...all("props"), ...streetSigns(), ...avenueLights()]);
export const INTERIOR_PROPS = withIds(INTERIORS.flatMap((i) => i.props));

export const POIS: Poi[] = [
  ...all("pois"),
  ...all("cachaca").map((c) => ({ id: c.id, name: `${c.name} · cachaça`, district: c.district, x: c.x, y: c.y, kind: "cachaca" as const, landmark: true })),
  { id: "morro", name: "Morro do Boato (letreiro)", district: "residencial", x: 2400, y: 200, kind: "marco", landmark: true },
];

/** Onde o Lula começa: na calçada da praça, ao lado do carro oficial. */
export const SPAWN = { hero: { x: 2400, y: 1206 } };

/** Tamanho da área sólida de cada objeto: retângulo centrado em x, com a base em y. */
export const PROP_SOLID: Record<CityPropKind, { w: number; h: number } | null> = {
  arvore: { w: 16, h: 10 },
  palmeira: { w: 14, h: 10 },
  ipe: { w: 16, h: 10 },
  poste: { w: 8, h: 8 },
  banco: { w: 44, h: 12 },
  coreto: { w: 100, h: 50 },
  orelhao: { w: 16, h: 10 },
  banca: { w: 64, h: 30 },
  mesaBar: { w: 26, h: 16 },
  barraca: { w: 92, h: 30 },
  lixeira: { w: 12, h: 10 },
  pneus: { w: 32, h: 16 },
  trave: null,
  bandeira: { w: 6, h: 6 },
  outdoor: null,
  placaColetiva: null,
  frade: { w: 10, h: 10 },
  cone: { w: 12, h: 10 },
  tambor: { w: 22, h: 16 },
  palete: { w: 44, h: 20 },
  caminhao: { w: 150, h: 50 },
  conteiner: { w: 82, h: 36 },
  guindaste: { w: 70, h: 40 },
  esteira: { w: 300, h: 26 },
  monumento: { w: 70, h: 40 },
  chafariz: { w: 90, h: 44 },
  varal: null,
  barracaCamping: { w: 50, h: 24 },
  caixaSom: { w: 22, h: 14 },
  mesaPiquenique: { w: 56, h: 22 },
  cancela: null,
  quiosque: { w: 54, h: 28 },
  pontoOnibus: { w: 80, h: 16 },
  tabela: { w: 12, h: 10 },
  caixasKits: { w: 50, h: 26 },
  placaRua: null,
  faixaCampus: null,
  cabeco: { w: 12, h: 10 },
  balcao: { w: 300, h: 30 },
  banqueta: { w: 12, h: 10 },
  prateleira: null,
  jukebox: { w: 40, h: 24 },
  guiche: { w: 160, h: 30 },
  cadeiraFila: { w: 26, h: 14 },
  painelSenha: null,
  pilhaPapel: { w: 26, h: 16 },
};

export function propRect(p: CityProp): Rect | null {
  const s = PROP_SOLID[p.kind];
  return s ? { x: p.x - s.w / 2, y: p.y - s.h, w: s.w, h: s.h } : null;
}

export function buildingRect(b: CityBuilding): Rect {
  return { x: b.x, y: b.y, w: b.w, h: b.d };
}

/** Ponto na calçada, na frente da porta do prédio. */
export function doorPoint(b: CityBuilding): Point {
  return { x: b.x + b.w * (b.door ?? 0.5), y: b.y + b.d + 16 };
}

/** Paredes de um interior: fundo, laterais e frente (a porta é uma ação, não uma abertura). */
export function interiorWalls(i: InteriorDef): Rect[] {
  const r = i.room;
  return [
    { x: r.x - 30, y: r.y - 30, w: r.w + 60, h: i.wallH + 30 },
    { x: r.x - 30, y: r.y, w: 30, h: r.h },
    { x: r.x + r.w, y: r.y, w: 30, h: r.h },
    { x: r.x - 30, y: r.y + r.h, w: r.w + 60, h: 30 },
  ];
}

export type Solid = Rect & { tag?: string };

/** Tudo o que é sólido: limites, prédios, objetos e interiores. */
export function citySolids(extra: Solid[] = []): Solid[] {
  const out: Solid[] = [
    { ...LIMITS.morro, tag: "morro" },
    { ...LIMITS.canal, tag: "canal" },
    { ...LIMITS.baia, tag: "baia" },
    { ...LIMITS.muro, tag: "muro" },
    // a parte de baixo do mundo (entre a cidade e os interiores) também é parede
    { x: 0, y: CITY.h, w: CITY.w, h: 3900 - CITY.h - 40, tag: "vazio" },
  ];
  for (const b of BUILDINGS) out.push({ ...buildingRect(b), tag: b.id });
  for (const p of PROPS) {
    const r = propRect(p);
    if (r) out.push({ ...r, tag: p.id });
  }
  for (const i of INTERIORS) for (const w of interiorWalls(i)) out.push({ ...w, tag: `parede-${i.id}` });
  for (const p of INTERIOR_PROPS) {
    const r = propRect(p);
    if (r) out.push({ ...r, tag: p.id });
  }
  return [...out, ...extra];
}

export function districtAt(x: number, y: number): DistrictDef | null {
  return DISTRICTS.find((d) => x >= d.area.x && x <= d.area.x + d.area.w && y >= d.area.y && y <= d.area.y + d.area.h) ?? null;
}

export function districtById(id: DistrictId): DistrictDef {
  return DISTRICTS.find((d) => d.id === id)!;
}

export function interiorAt(x: number, y: number): InteriorDef | null {
  return INTERIORS.find((i) => x >= i.room.x && x <= i.room.x + i.room.w && y >= i.room.y && y <= i.room.y + i.room.h) ?? null;
}
