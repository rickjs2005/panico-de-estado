import type * as Phaser from "phaser";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PuppetHead, type Face } from "@/components/Puppet";
import { LOOKS, type LookId } from "../looks";
import { BUILDINGS as CITY_BUILDINGS, PROPS as CITY_PROPS, INTERIOR_PROPS, VEHICLES } from "../cidade";
import { BUILDINGS, PROPS } from "../map";
import type { HeroId } from "../types";
import { casinhaArt, cityBuildingArt, cityPropArt, cityTile, interdicaoArt, navioArt, waterTile } from "./city/cityArt";
import { lulaItemArt } from "./lulaArt";
import {
  arm,
  boxArt,
  buildingArt,
  carLayer,
  chicoteArt,
  emoteArt,
  fruitArt,
  gearArt,
  headArt,
  headBack,
  headSide,
  leg,
  markerArt,
  propArt,
  puffArt,
  shadowArt,
  svgDoc,
  tileArt,
  torso,
  type Art,
  type CarLayer,
} from "./art";

/**
 * Transforma os desenhos SVG em texturas do Phaser, numa resolução maior que a do
 * mundo para continuar nítido com zoom e em telas de alta densidade.
 */

export const FACES: Face[] = ["neutro", "fala", "comemora", "susto", "deboche"];
export const CAR_BODY = "#e2533b";

export const tex = {
  head: (look: LookId, view: "f" | "s" | "b", face: Face = "neutro") => (view === "f" ? `h:${look}:f:${face}` : `h:${look}:${view}`),
  torso: (look: LookId, view: "f" | "s" | "b") => `t:${look}:${view}`,
  arm: (look: LookId) => `a:${LOOKS[look].shirt}:${LOOKS[look].skin}`,
  leg: (look: LookId, view: "f" | "s") => `l:${LOOKS[look].pants}:${view}`,
  prop: (kind: string, variant?: string) => `p:${kind}:${variant ?? ""}`,
  building: (id: string) => `b:${id}`,
  car: (layer: CarLayer, color: string = CAR_BODY) => (color === CAR_BODY || layer === "sombra" || layer === "base" || layer === "parabrisa" ? `car:${layer}` : `car:${layer}:${color}`),
};

/** Textura de cada prédio da cidade (prédios com o mesmo desenho dividem a textura). */
export const CITY_TEX = new Map<string, string>();

/** Resolução das texturas em relação aos pixels do mundo. */
export const RES = { char: 3, small: 3, car: 3, prop: 2, building: 2, tile: 2, cityBuilding: 1.6, cityProp: 1.8, big: 1.4 };

interface Job {
  key: string;
  art: Art;
  scale: number;
}

function frontHead(look: LookId, face: Face): Art {
  const body = renderToStaticMarkup(createElement(PuppetHead, { look: LOOKS[look], face, eyesFace: face === "fala" ? "neutro" : face }));
  return headArt(body);
}

function hash(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}

function jobs(hero: HeroId): Job[] {
  const list: Job[] = [];
  const seen = new Set<string>();
  const add = (key: string, art: Art, scale: number) => {
    if (seen.has(key)) return;
    seen.add(key);
    list.push({ key, art, scale });
  };

  for (const id of Object.keys(LOOKS) as LookId[]) {
    const look = LOOKS[id];
    for (const face of FACES) add(tex.head(id, "f", face), frontHead(id, face), RES.char);
    add(tex.head(id, "s"), headArt(headSide(look)), RES.char);
    add(tex.head(id, "b"), headArt(headBack(look)), RES.char);
    for (const v of ["f", "s", "b"] as const) add(tex.torso(id, v), torso(look, v), RES.char);
    add(tex.arm(id), arm(look.shirt, look.skin), RES.char);
    add(tex.leg(id, "f"), leg(look.pants, "f"), RES.char);
    add(tex.leg(id, "s"), leg(look.pants, "s"), RES.char);
  }

  add("shadow", shadowArt(28, 10), RES.small);
  for (const layer of ["sombra", "base", "lateral", "topo", "parabrisa"] as const) add(tex.car(layer), carLayer(layer, CAR_BODY), RES.car);
  add("chicote", chicoteArt(), RES.small);
  for (const id of ["cadeado", "kits", "brasil-caixa", "cachaca"] as const) add(id, lulaItemArt(id), RES.small);
  for (const f of ["laranja", "banana", "abacaxi"]) add(`fruit:${f}`, fruitArt(f), RES.small);
  add("gear", gearArt(), RES.small);
  add("box", boxArt(), RES.small);
  add("puff", puffArt(), RES.small);
  add("marker", markerArt(), RES.small);
  add("emote", emoteArt(), RES.small);
  for (const t of ["calcada", "ondas", "grama", "terra"] as const) add(`tile:${t}`, tileArt(t), RES.tile);

  if (hero === "flavio") {
    for (const p of PROPS) add(tex.prop(p.kind, p.variant), propArt(p.kind, p.variant), RES.prop);
    BUILDINGS.forEach((b, i) => add(tex.building(b.id), buildingArt(b, i), RES.building));
    return list;
  }

  // cidade do Lula
  for (const color of new Set(VEHICLES.map((v) => v.color))) {
    for (const layer of ["lateral", "topo"] as const) add(tex.car(layer, color), carLayer(layer, color), RES.car);
  }
  for (const p of [...CITY_PROPS, ...INTERIOR_PROPS]) add(tex.prop(p.kind, p.variant), cityPropArt(p.kind, p.variant), RES.cityProp);
  for (const [kind, variant] of [["caixasKits", undefined], ["barracaCamping", "laranja"], ["barracaCamping", "azul"], ["barracaCamping", "verde"], ["caixaSom", undefined], ["faixaCampus", undefined], ["outdoor", undefined]] as const) {
    add(tex.prop(kind, variant), cityPropArt(kind, variant), RES.cityProp);
  }
  CITY_BUILDINGS.forEach((b) => {
    const art = cityBuildingArt(b, b.id.length);
    const key = `cb:${hash(art.body)}:${art.w}x${art.h}`;
    CITY_TEX.set(b.id, key);
    add(key, art, RES.cityBuilding);
  });
  for (const t of ["concreto", "patio", "quadra", "piso-bar", "piso-reparticao"] as const) add(`tile:${t}`, cityTile(t), RES.tile);
  add("tile:agua", waterTile(), RES.tile);
  ["#f2a7b8", "#7fb3d5", "#ffd23f", "#b5e48c", "#ff9f80", "#cdb4db"].forEach((c, i) => add(`casinha:${i}`, casinhaArt(c), RES.prop));
  add("navio", navioArt(), RES.big);
  add("interdicao", interdicaoArt(), RES.small);
  return list;
}

function rasterize(job: Job): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(job.art.w * job.scale);
      canvas.height = Math.ceil(job.art.h * job.scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("sem canvas 2d"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas);
    };
    img.onerror = () => reject(new Error(`falha ao desenhar ${job.key}`));
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgDoc(job.art, job.scale));
  });
}

/** Gera todas as texturas do bairro. Chamado uma vez, antes da cena do mundo. */
export async function bakeTextures(scene: Phaser.Scene, hero: HeroId, onProgress?: (done: number, total: number) => void): Promise<void> {
  const list = jobs(hero).filter((j) => !scene.textures.exists(j.key));
  let done = 0;
  const batch = 16;
  for (let i = 0; i < list.length; i += batch) {
    const slice = list.slice(i, i + batch);
    const canvases = await Promise.all(slice.map(rasterize));
    canvases.forEach((c, k) => scene.textures.addCanvas(slice[k].key, c));
    done += slice.length;
    onProgress?.(done, list.length);
  }
}
