import type { BuildingDef, PropKind } from "../map";
import type { WorldLook } from "../looks";

/**
 * Arte do bairro desenhada em código, como SVG. Cada função devolve um desenho em
 * pixels do mundo; `bake.ts` transforma tudo em texturas do Phaser.
 *
 * Estilo: cartum chapado, contorno escuro único (filtro de dilatação), uma sombra
 * por superfície e cabeças grandes.
 */

export const INK = "#1e1424";

export interface Art {
  /** Tamanho em pixels do mundo. */
  w: number;
  h: number;
  /** Área do desenho em unidades do SVG (padrão: 0 0 w h). */
  vb?: [number, number, number, number];
  body: string;
  /** Espessura do contorno escuro, em unidades do SVG (0 = sem contorno). */
  outline?: number;
}

/** Monta o documento SVG no tamanho final de rasterização. */
export function svgDoc(art: Art, scale: number): string {
  const [vx, vy, vw, vh] = art.vb ?? [0, 0, art.w, art.h];
  const pw = Math.ceil(art.w * scale);
  const ph = Math.ceil(art.h * scale);
  const o = art.outline ?? 0;
  const defs =
    o > 0
      ? `<defs><filter id="o" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB"><feMorphology in="SourceAlpha" operator="dilate" radius="${o}" result="d"/><feFlood flood-color="${INK}"/><feComposite in2="d" operator="in" result="k"/><feMerge><feMergeNode in="k"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`
      : "";
  const body = o > 0 ? `<g filter="url(#o)">${art.body}</g>` : art.body;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${vw} ${vh}" width="${pw}" height="${ph}">${defs}${body}</svg>`;
}

// ---------- cores ----------

function hex(c: string): [number, number, number] {
  const v = c.replace("#", "");
  const n = parseInt(v.length === 3 ? v.split("").map((x) => x + x).join("") : v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function shade(c: string, f: number): string {
  const [r, g, b] = hex(c);
  const m = (x: number) => Math.max(0, Math.min(255, Math.round(f < 0 ? x * (1 + f) : x + (255 - x) * f)));
  return `#${[m(r), m(g), m(b)].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

export function toInt(c: string): number {
  const [r, g, b] = hex(c);
  return (r << 16) | (g << 8) | b;
}

export function esc(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ---------- personagens ----------

/** Escala das cabeças: unidades do boneco original (viewBox 0 0 120 150) para pixels do mundo. */
export const HEAD_K = 0.56;
/** Recorte da cabeça no sistema do boneco original. */
export const HEAD_VB: [number, number, number, number] = [16, 6, 88, 92];
/** Fração vertical onde fica a base do pescoço dentro do recorte. */
export const HEAD_NECK = (88 - HEAD_VB[1]) / HEAD_VB[3];

export function headArt(body: string): Art {
  return { w: HEAD_VB[2] * HEAD_K, h: HEAD_VB[3] * HEAD_K, vb: HEAD_VB, body, outline: 2.6 };
}

function capSide(l: WorldLook) {
  const c = l.capColor ?? "#333";
  return `<path d="M32 46 Q32 22 58 22 Q82 22 84 46 Z" fill="${c}"/><path d="M78 44 L102 46 Q100 51 86 51 L78 50 Z" fill="${shade(c, -0.15)}"/>`;
}

/** Cabeça de perfil, olhando para a direita, no mesmo sistema de coordenadas da vista de frente. */
export function headSide(l: WorldLook): string {
  const hair = l.hairColor;
  const beard = l.beardColor ?? hair;
  const parts: string[] = [];
  // cabelo atrás da cabeça
  if (l.hair === "longo") parts.push(`<path d="M30 50 Q26 92 44 98 L58 96 Q50 70 48 50 Z" fill="${hair}"/>`);
  if (l.hair === "coque") parts.push(`<circle cx="34" cy="30" r="11" fill="${hair}"/>`);
  if (l.hair === "rabo") parts.push(`<path d="M36 40 Q14 54 22 82 Q30 64 40 54 Z" fill="${hair}"/>`);
  parts.push(`<rect x="52" y="74" width="12" height="14" fill="${l.skin}"/>`);
  parts.push(`<ellipse cx="58" cy="54" rx="26" ry="29" fill="${l.skin}"/>`);
  parts.push(`<ellipse cx="84" cy="58" rx="6" ry="5.5" fill="${shade(l.skin, -0.05)}"/>`); // nariz
  if (l.beard === "cheia") {
    parts.push(`<path d="M42 56 Q40 88 62 91 Q82 91 86 66 Q78 75 68 74 Q56 72 52 60 Z" fill="${beard}"/>`);
  }
  // cabelo
  switch (l.hair) {
    case "ondulado":
      parts.push(
        `<path d="M32 58 Q26 32 42 25 Q52 16 64 22 Q76 20 80 32 Q72 28 64 32 Q56 28 50 34 Q44 40 46 52 Q40 60 32 58 Z" fill="${hair}"/>`,
      );
      break;
    case "lateral":
      parts.push(`<path d="M32 58 Q26 26 54 21 Q80 18 86 40 Q76 30 62 32 Q50 33 47 46 Q42 56 32 58 Z" fill="${hair}"/>`);
      break;
    case "careca":
      parts.push(`<path d="M33 64 Q30 48 37 42 L46 60 Z" fill="${hair}"/>`);
      break;
    case "raspado":
      parts.push(`<path d="M33 54 Q32 28 56 25 Q78 24 82 40 Q72 32 58 33 Q46 35 45 50 Z" fill="${hair}" opacity="0.85"/>`);
      break;
    case "cacheado":
      parts.push(
        [30, 40, 52, 64, 74].map((x, i) => `<circle cx="${x}" cy="${i % 2 ? 30 : 36}" r="11" fill="${hair}"/>`).join("") +
          `<circle cx="32" cy="56" r="10" fill="${hair}"/>`,
      );
      break;
    case "bone":
      parts.push(capSide(l));
      break;
    default:
      parts.push(`<path d="M32 56 Q28 26 56 23 Q80 22 84 42 Q74 32 58 33 Q46 35 45 50 Z" fill="${hair}"/>`);
  }
  // orelha
  parts.push(`<circle cx="49" cy="57" r="5" fill="${l.skin}"/><circle cx="49" cy="57" r="2" fill="${shade(l.skin, -0.2)}"/>`);
  // olho e sobrancelha
  parts.push(`<circle cx="72" cy="53" r="2.8" fill="${INK}"/>`);
  if (l.brows) parts.push(`<path d="M65 44 Q71 40 78 44" stroke="${hair}" stroke-width="5" stroke-linecap="round" fill="none"/>`);
  if (l.glasses === "grau") parts.push(`<g stroke="${INK}" stroke-width="2" fill="rgba(255,255,255,0.15)"><circle cx="73" cy="53" r="7"/><line x1="66" y1="52" x2="50" y2="52"/></g>`);
  if (l.glasses === "escuro") parts.push(`<rect x="64" y="47" width="16" height="11" rx="4" fill="${INK}"/><line x1="64" y1="51" x2="50" y2="51" stroke="${INK}" stroke-width="2.5"/>`);
  if (l.beard === "bigode") parts.push(`<path d="M72 64 Q82 61 88 66 Q80 69 72 67 Z" fill="${beard}"/>`);
  parts.push(`<path d="M74 72 Q79 74 84 71" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`);
  return parts.join("");
}

/** Cabeça de costas. */
export function headBack(l: WorldLook): string {
  const hair = l.hairColor;
  const beard = l.beardColor ?? hair;
  const parts: string[] = [];
  parts.push(`<rect x="54" y="74" width="12" height="14" fill="${l.skin}"/>`);
  parts.push(`<circle cx="33" cy="56" r="4.5" fill="${l.skin}"/><circle cx="87" cy="56" r="4.5" fill="${l.skin}"/>`);
  parts.push(`<ellipse cx="60" cy="54" rx="27" ry="29" fill="${l.skin}"/>`);
  if (l.beard === "cheia") {
    parts.push(`<path d="M34 60 Q34 82 44 86 L46 74 Z" fill="${beard}"/><path d="M86 60 Q86 82 76 86 L74 74 Z" fill="${beard}"/>`);
  }
  switch (l.hair) {
    case "careca":
      parts.push(`<path d="M33 58 Q36 74 46 78 L74 78 Q84 74 87 58 Q84 66 60 68 Q36 66 33 58 Z" fill="${hair}"/>`);
      break;
    case "ondulado":
      parts.push(
        `<path d="M32 60 Q26 34 40 26 Q50 18 60 22 Q72 18 80 26 Q94 34 88 60 Q86 74 76 78 L44 78 Q34 74 32 60 Z" fill="${hair}"/>`,
        `<path d="M44 40 Q52 34 60 38 Q68 34 76 40" stroke="${shade(hair, -0.12)}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
      );
      break;
    case "cacheado":
      parts.push(
        [34, 46, 60, 74, 86].map((x, i) => `<circle cx="${x}" cy="${i % 2 ? 34 : 42}" r="12" fill="${hair}"/>`).join("") +
          `<circle cx="40" cy="64" r="11" fill="${hair}"/><circle cx="60" cy="68" r="11" fill="${hair}"/><circle cx="80" cy="64" r="11" fill="${hair}"/>`,
      );
      break;
    case "bone": {
      const c = l.capColor ?? "#333";
      parts.push(
        `<path d="M32 62 Q30 70 40 76 L80 76 Q90 70 88 62 Z" fill="${hair}"/>`,
        `<path d="M31 50 Q31 21 60 21 Q89 21 89 50 Z" fill="${c}"/><rect x="50" y="44" width="20" height="6" rx="2" fill="${shade(c, -0.25)}"/>`,
      );
      break;
    }
    default:
      parts.push(`<path d="M32 60 Q28 24 60 22 Q92 24 88 60 Q86 72 78 76 L42 76 Q34 72 32 60 Z" fill="${hair}"/>`);
  }
  if (l.hair === "coque") parts.push(`<circle cx="60" cy="24" r="12" fill="${hair}"/>`);
  if (l.hair === "rabo") parts.push(`<path d="M54 60 Q50 86 60 96 Q70 86 66 60 Z" fill="${hair}"/>`);
  if (l.hair === "longo") parts.push(`<path d="M30 54 Q28 94 44 98 L76 98 Q92 94 90 54 Z" fill="${hair}"/>`);
  return parts.join("");
}

const TORSO_W = 30;
const TORSO_H = 26;

function sash(path: string, inner: string) {
  return `<path d="${path}" fill="#1f8a4c"/><path d="${inner}" fill="#f2c230"/>`;
}

export function torso(l: WorldLook, view: "f" | "s" | "b"): Art {
  const parts: string[] = [];
  if (view === "f") {
    parts.push(`<path d="M3 26 Q2 6 9 3 L21 3 Q28 6 27 26 Z" fill="${l.shirt}"/>`);
    parts.push(`<path d="M12 3 L15 7.5 L18 3 Z" fill="${l.skin}"/>`);
    if (l.apron) parts.push(`<path d="M7 9 L23 9 L24 26 L6 26 Z" fill="${l.apron}"/><path d="M9 9 L12 3 M21 9 L18 3" stroke="${l.apron}" stroke-width="1.6"/>`);
    if (l.tie) parts.push(`<path d="M14 6.5 L16 6.5 L17 17 L15 19.5 L13 17 Z" fill="${l.tie}"/>`);
    if (l.sash) parts.push(sash("M5 5 L9 3 L27 21 L24.5 25 Z", "M6.8 4.4 L8.3 3.7 L26 22.2 L24.8 23.6 Z"));
    if (l.scarf) parts.push(`<path d="M9 3 Q15 9 21 3 L20 7 Q15 12 10 7 Z" fill="${l.scarf}"/>`);
    if (l.badge) parts.push(`<rect x="17" y="12" width="6" height="7" rx="1" fill="#f2efe8"/>`);
  } else if (view === "b") {
    parts.push(`<path d="M3 26 Q2 6 9 3 L21 3 Q28 6 27 26 Z" fill="${shade(l.shirt, -0.06)}"/>`);
    parts.push(`<path d="M11 3 Q15 6 19 3" stroke="${shade(l.shirt, -0.3)}" stroke-width="1.4" fill="none"/>`);
    if (l.apron) parts.push(`<path d="M5 13 L25 13" stroke="${l.apron}" stroke-width="1.8"/>`);
    if (l.sash) parts.push(sash("M21 3 L25 5 L7.5 25 L4.5 22 Z", "M22 3.7 L23.6 4.6 L7 23.8 L5.8 22.5 Z"));
  } else {
    parts.push(`<path d="M8 26 Q7 6 12 3 L18 3 Q24 6 23 26 Z" fill="${l.shirt}"/>`);
    if (l.apron) parts.push(`<path d="M17 9 L24 9 L24.5 26 L17 26 Z" fill="${l.apron}"/>`);
    if (l.tie) parts.push(`<path d="M19.5 6.5 L21.5 6.5 L22.4 16 L20.6 18 Z" fill="${l.tie}"/>`);
    if (l.sash) parts.push(sash("M10 4.5 L14 3 L23.5 21 L20.5 24.5 Z", "M11.5 4 L13 3.6 L22.6 21.6 L21.3 22.8 Z"));
  }
  return { w: TORSO_W, h: TORSO_H, body: parts.join(""), outline: 1.1 };
}

export function arm(shirt: string, skin: string): Art {
  return {
    w: 8,
    h: 17,
    body: `<path d="M1 0.5 H7 V10.5 Q7 12 5.5 12 H2.5 Q1 12 1 10.5 Z" fill="${shirt}"/><circle cx="4" cy="13.4" r="3.1" fill="${skin}"/>`,
    outline: 0.9,
  };
}

export function leg(pants: string, view: "f" | "s"): Art {
  const shoe = view === "f" ? `<ellipse cx="4" cy="13.4" rx="3.6" ry="2.4" fill="#2a2230"/>` : `<ellipse cx="5.3" cy="13.4" rx="4.2" ry="2.4" fill="#2a2230"/>`;
  return { w: 10, h: 16, body: `<rect x="1.5" y="0" width="5" height="12" fill="${pants}"/>${shoe}`, outline: 0.9 };
}

export function shadowArt(w: number, h: number, alpha = 0.26): Art {
  return { w, h, body: `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2}" ry="${h / 2}" fill="#000" fill-opacity="${alpha}"/>` };
}

// ---------- carro (fatias para empilhamento) ----------

export const CAR_W = 72;
export const CAR_H = 38;

export type CarLayer = "sombra" | "base" | "lateral" | "topo" | "parabrisa";

export function carLayer(layer: CarLayer, body: string): Art {
  const w = CAR_W;
  const h = CAR_H;
  let s = "";
  switch (layer) {
    case "sombra":
      return { w, h, body: `<rect x="2" y="3" width="68" height="33" rx="13" fill="#000" fill-opacity="0.28"/>` };
    case "base":
      s =
        `<rect x="5" y="5" width="62" height="28" rx="9" fill="#2b2433"/>` +
        [
          [12, 1],
          [48, 1],
          [12, 30],
          [48, 30],
        ]
          .map(([x, y]) => `<rect x="${x}" y="${y}" width="13" height="7" rx="2" fill="#16121b"/>`)
          .join("");
      return { w, h, body: s, outline: 0.7 };
    case "lateral":
      return { w, h, body: `<rect x="3" y="3" width="66" height="32" rx="11" fill="${shade(body, -0.32)}"/>`, outline: 0.7 };
    case "topo":
      s =
        `<rect x="3" y="3" width="66" height="32" rx="11" fill="${body}"/>` +
        `<path d="M52 6 Q60 6 64 10 L64 28 Q60 32 52 32" fill="none" stroke="${shade(body, -0.2)}" stroke-width="1.2"/>` +
        `<rect x="54" y="17" width="12" height="4" rx="1" fill="#fff8ec"/><rect x="5" y="17" width="13" height="4" rx="1" fill="#fff8ec"/>` +
        `<rect x="21" y="7" width="29" height="24" rx="6" fill="#4a2f2a"/>` +
        `<rect x="37" y="9" width="8" height="8" rx="2" fill="#a2452f"/><rect x="37" y="21" width="8" height="8" rx="2" fill="#a2452f"/>` +
        `<rect x="23" y="9" width="8" height="20" rx="2" fill="#a2452f"/>` +
        `<ellipse cx="66" cy="9" rx="2.4" ry="3" fill="#fff3a0"/><ellipse cx="66" cy="29" rx="2.4" ry="3" fill="#fff3a0"/>` +
        `<rect x="3.5" y="7" width="3" height="5" rx="1" fill="#e63946"/><rect x="3.5" y="26" width="3" height="5" rx="1" fill="#e63946"/>` +
        `<circle cx="47" cy="3" r="2" fill="${body}"/><circle cx="47" cy="35" r="2" fill="${body}"/>`;
      return { w, h, body: s, outline: 0.9 };
    case "parabrisa":
      return { w, h, body: `<rect x="49" y="6" width="4" height="26" rx="2" fill="#a8e0ff"/>`, outline: 0.8 };
  }
}

// ---------- objetos pequenos ----------

export function chicoteArt(): Art {
  return {
    w: 30,
    h: 30,
    body:
      `<path d="M14 15 Q22 2 27 8 Q30 15 20 16 Q12 17 16 25 Q18 29 24 27" stroke="#3a2414" stroke-width="2.2" fill="none" stroke-linecap="round"/>` +
      `<path d="M4 26 L13 16" stroke="#7a4a24" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="M4 26 L7.5 22" stroke="#c62835" stroke-width="5.5" stroke-linecap="round"/>`,
    outline: 1,
  };
}

export function fruitArt(kind: string): Art {
  if (kind === "banana")
    return { w: 14, h: 10, body: `<path d="M2 3 Q7 11 13 3 Q7 7 2 3 Z" fill="#ffd23f"/><rect x="1" y="2" width="2" height="2" fill="#5a3b1a"/>`, outline: 0.8 };
  if (kind === "abacaxi")
    return {
      w: 12,
      h: 16,
      body: `<ellipse cx="6" cy="10" rx="4.5" ry="5.5" fill="#f2b632"/><path d="M3 5 L6 0 L9 5 Z" fill="#3aa655"/><path d="M4 8 L8 12 M8 8 L4 12" stroke="#c48a1a" stroke-width="0.8"/>`,
      outline: 0.8,
    };
  return { w: 11, h: 11, body: `<circle cx="5.5" cy="6" r="4.4" fill="#ff8c1a"/><path d="M5.5 1.5 Q8 0 9 2" stroke="#2e8b3a" stroke-width="1.4" fill="none"/>`, outline: 0.8 };
}

export function gearArt(): Art {
  const teeth = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2;
    const x = 18 + Math.cos(a) * 14;
    const y = 18 + Math.sin(a) * 14;
    return `<rect x="${x - 3}" y="${y - 3}" width="6" height="6" transform="rotate(${(a * 180) / Math.PI} ${x} ${y})" fill="#d9d4c7"/>`;
  }).join("");
  return { w: 36, h: 36, body: `${teeth}<circle cx="18" cy="18" r="12" fill="#d9d4c7"/><circle cx="18" cy="18" r="4.5" fill="#6b5a4a"/>`, outline: 1 };
}

export function boxArt(): Art {
  return {
    w: 16,
    h: 14,
    body: `<rect x="1" y="2" width="14" height="11" rx="1" fill="#c9915a"/><path d="M1 5 H15 M8 2 V13" stroke="#8a5a2b" stroke-width="1"/>`,
    outline: 0.8,
  };
}

export function puffArt(): Art {
  return { w: 24, h: 24, body: `<circle cx="12" cy="12" r="10" fill="#e9e4dc"/><circle cx="8" cy="9" r="4" fill="#ffffff"/>`, outline: 1 };
}

export function markerArt(): Art {
  return {
    w: 30,
    h: 30,
    body: `<path d="M5 6 H25 L15 26 Z" fill="#ffd23f"/><path d="M9 8 H19 L14 18 Z" fill="#fff3a0"/>`,
    outline: 2,
  };
}

export function emoteArt(): Art {
  return {
    w: 22,
    h: 26,
    body: `<rect x="1" y="1" width="20" height="18" rx="6" fill="#fff"/><path d="M7 18 L11 25 L13 18 Z" fill="#fff"/><rect x="9.5" y="4" width="3" height="8" rx="1.5" fill="#e63946"/><circle cx="11" cy="15" r="1.8" fill="#e63946"/>`,
    outline: 1.2,
  };
}

// ---------- texturas de chão (sem contorno, repetidas) ----------

export function tileArt(kind: "calcada" | "ondas" | "grama" | "terra"): Art {
  switch (kind) {
    case "calcada":
      return {
        w: 32,
        h: 32,
        body: `<rect width="32" height="32" fill="#d9d4ca"/><path d="M0 0.5 H32 M0 16.5 H32 M0.5 0 V32 M16.5 0 V32" stroke="#c3bdb1" stroke-width="1"/>`,
      };
    case "ondas":
      return {
        w: 64,
        h: 32,
        body: `<rect width="64" height="32" fill="#f4efe4"/><path d="M0 9 Q16 -3 32 9 T64 9 L64 23 Q48 35 32 23 T0 23 Z" fill="#2b2b30"/>`,
      };
    case "grama":
      return {
        w: 64,
        h: 64,
        body:
          `<rect width="64" height="64" fill="#8fcb68"/>` +
          [
            [8, 12],
            [40, 8],
            [24, 36],
            [52, 44],
            [12, 54],
          ]
            .map(([x, y]) => `<path d="M${x} ${y} l2 -5 l2 5 l2 -4" stroke="#6fae4c" stroke-width="1.4" fill="none"/>`)
            .join("") +
          `<circle cx="34" cy="24" r="1.6" fill="#fff6a8"/><circle cx="56" cy="20" r="1.6" fill="#ffffff"/>`,
      };
    case "terra":
      return {
        w: 64,
        h: 64,
        body:
          `<rect width="64" height="64" fill="#d9a066"/>` +
          [
            [10, 14],
            [44, 10],
            [28, 40],
            [52, 50],
            [14, 52],
          ]
            .map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2.4" ry="1.5" fill="#bf8650"/>`)
            .join(""),
      };
  }
}

// ---------- objetos do cenário ----------

export interface PropArt extends Art {
  /** Ponto de apoio no chão, em fração do desenho. */
  originY: number;
}

export function propArt(kind: PropKind, variant?: string): PropArt {
  switch (kind) {
    case "arvore":
      return {
        w: 70,
        h: 92,
        originY: 0.97,
        outline: 1.3,
        body:
          `<rect x="31" y="58" width="9" height="32" rx="3" fill="#7a4e2d"/>` +
          `<circle cx="20" cy="50" r="17" fill="#3f9b4a"/><circle cx="50" cy="50" r="17" fill="#3f9b4a"/><circle cx="35" cy="32" r="26" fill="#4cae55"/>` +
          `<circle cx="27" cy="24" r="9" fill="#6ac46c"/>`,
      };
    case "poste":
      return {
        w: 24,
        h: 122,
        originY: 0.97,
        outline: 1,
        body:
          `<rect x="10" y="12" width="5" height="108" fill="#b9b6ae"/><rect x="2" y="18" width="20" height="3" fill="#8f8b82"/>` +
          `<path d="M12.5 13 Q12.5 4 20 4" stroke="#8f8b82" stroke-width="2.4" fill="none"/><rect x="17" y="3" width="6" height="5" rx="1" fill="#ffe680"/>` +
          `<rect x="7.5" y="34" width="10" height="12" rx="3" fill="#7d7a73"/>`,
      };
    case "banco":
      return {
        w: 50,
        h: 30,
        originY: 0.95,
        outline: 1,
        body:
          `<rect x="5" y="16" width="3" height="12" fill="#5a3b1a"/><rect x="42" y="16" width="3" height="12" fill="#5a3b1a"/>` +
          `<rect x="2" y="3" width="46" height="6" rx="2" fill="#b5732f"/><rect x="2" y="12" width="46" height="6" rx="2" fill="#c98a4b"/>`,
      };
    case "coreto":
      return {
        w: 124,
        h: 120,
        originY: 0.95,
        outline: 1.5,
        body:
          `<path d="M8 92 L24 80 L100 80 L116 92 L116 106 L100 114 L24 114 L8 106 Z" fill="#f4efe4"/>` +
          `<path d="M8 92 L24 100 L100 100 L116 92 L116 106 L100 114 L24 114 L8 106 Z" fill="#d9cfc0"/>` +
          [24, 50, 74, 100].map((x) => `<rect x="${x - 2.5}" y="40" width="5" height="52" fill="#ffffff"/>`).join("") +
          `<path d="M14 84 H110" stroke="#e85d75" stroke-width="3"/>` +
          `<path d="M62 2 L118 42 L6 42 Z" fill="#e85d75"/><path d="M62 2 L84 42 L40 42 Z" fill="#f28da0"/>` +
          `<rect x="4" y="40" width="116" height="6" rx="2" fill="#c43f58"/><circle cx="62" cy="3" r="3" fill="#ffd23f"/>`,
      };
    case "orelhao":
      return {
        w: 36,
        h: 62,
        originY: 0.96,
        outline: 1.2,
        body:
          `<rect x="16" y="30" width="4" height="30" fill="#6b6b6b"/>` +
          `<path d="M3 34 Q3 4 18 4 Q33 4 33 34 L28 36 Q18 28 8 36 Z" fill="#ff8c1a"/>` +
          `<path d="M8 32 Q8 12 18 12 Q28 12 28 32 Q18 27 8 32 Z" fill="#c4600f"/><rect x="14" y="17" width="8" height="10" rx="2" fill="#2a2a35"/>`,
      };
    case "banca":
      return {
        w: 76,
        h: 74,
        originY: 0.96,
        outline: 1.3,
        body:
          `<rect x="4" y="22" width="68" height="48" rx="3" fill="#2e8b57"/>` +
          `<path d="M0 22 L76 22 L70 8 L6 8 Z" fill="#1f6e44"/>` +
          [10, 22, 34, 46, 58].map((x, i) => `<rect x="${x}" y="32" width="9" height="13" fill="${["#ffd23f", "#e63946", "#3a86ff", "#ff9f80", "#f4f1de"][i]}"/>`).join("") +
          `<rect x="20" y="10" width="36" height="10" rx="2" fill="#fff8ec"/><text x="38" y="18.5" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="8" text-anchor="middle" fill="${INK}">BANCA</text>`,
      };
    case "mesaBar":
      return {
        w: 40,
        h: 34,
        originY: 0.94,
        outline: 1,
        body:
          `<rect x="2" y="14" width="8" height="16" rx="2" fill="#e8b830"/><rect x="30" y="14" width="8" height="16" rx="2" fill="#e8b830"/>` +
          `<rect x="18" y="16" width="4" height="16" fill="#b8202e"/><ellipse cx="20" cy="15" rx="13" ry="6" fill="#d62839"/>` +
          `<rect x="15" y="6" width="3.5" height="8" rx="1" fill="#7a3b1a"/><rect x="21" y="7" width="3.5" height="7" rx="1" fill="#2e7d32"/>`,
      };
    case "barraca": {
      const fruit = variant === "banana" ? "#ffd23f" : variant === "abacaxi" ? "#f2b632" : "#ff8c1a";
      const stripes = Array.from({ length: 8 }, (_, i) => `<path d="M${4 + i * 12} 10 L${16 + i * 12} 10 L${17 + i * 12} 26 L${3 + i * 12} 26 Z" fill="${i % 2 ? "#ffffff" : "#2a6fdb"}"/>`).join("");
      return {
        w: 104,
        h: 74,
        originY: 0.95,
        outline: 1.3,
        body:
          `<rect x="8" y="24" width="4" height="46" fill="#6b6b6b"/><rect x="92" y="24" width="4" height="46" fill="#6b6b6b"/>` +
          stripes +
          `<rect x="6" y="44" width="92" height="22" rx="2" fill="#a8743a"/><rect x="6" y="44" width="92" height="5" fill="#c98a4b"/>` +
          Array.from({ length: 12 }, (_, i) => `<circle cx="${14 + (i % 6) * 15}" cy="${40 + Math.floor(i / 6) * 5}" r="5" fill="${fruit}"/>`).join(""),
      };
    }
    case "churrasqueira":
      return {
        w: 40,
        h: 44,
        originY: 0.94,
        outline: 1.2,
        body:
          `<rect x="6" y="24" width="3" height="18" fill="#444"/><rect x="31" y="24" width="3" height="18" fill="#444"/>` +
          `<path d="M2 14 H38 L35 28 H5 Z" fill="#2b2b30"/><rect x="1" y="12" width="38" height="4" rx="1" fill="#55555c"/>` +
          `<rect x="7" y="6" width="9" height="6" rx="2" fill="#8b3a1e"/><rect x="20" y="5" width="12" height="6" rx="2" fill="#a0472a"/>`,
      };
    case "mesaFesta":
      return {
        w: 128,
        h: 44,
        originY: 0.93,
        outline: 1.2,
        body:
          `<rect x="10" y="24" width="4" height="18" fill="#6b4a2a"/><rect x="114" y="24" width="4" height="18" fill="#6b4a2a"/>` +
          `<rect x="2" y="8" width="124" height="22" rx="2" fill="#ffffff"/>` +
          Array.from({ length: 15 }, (_, i) => `<rect x="${2 + i * 8.3}" y="8" width="4.15" height="22" fill="#e63946" fill-opacity="0.85"/>`).join("") +
          `<ellipse cx="30" cy="12" rx="9" ry="4" fill="#f4f1de"/><ellipse cx="64" cy="12" rx="10" ry="4" fill="#f4f1de"/><ellipse cx="98" cy="12" rx="9" ry="4" fill="#f4f1de"/>` +
          `<rect x="44" y="0" width="4" height="12" rx="1" fill="#2e7d32"/><rect x="80" y="1" width="4" height="11" rx="1" fill="#e85d04"/>`,
      };
    case "faixa":
      return {
        w: 262,
        h: 86,
        originY: 0.97,
        outline: 1.3,
        body:
          `<rect x="9" y="4" width="5" height="80" fill="#7a4e2d"/><rect x="248" y="4" width="5" height="80" fill="#7a4e2d"/>` +
          `<rect x="14" y="8" width="234" height="28" rx="2" fill="#fffaf0"/><rect x="14" y="8" width="234" height="4" fill="#e63946"/><rect x="14" y="32" width="234" height="4" fill="#ffd23f"/>`,
      };
    case "expositor":
      return {
        w: 48,
        h: 62,
        originY: 0.95,
        outline: 1.2,
        body:
          `<rect x="8" y="10" width="4" height="50" fill="#7a4e2d"/><rect x="36" y="10" width="4" height="50" fill="#7a4e2d"/>` +
          `<rect x="4" y="8" width="40" height="5" rx="1" fill="#a8743a"/><rect x="6" y="38" width="36" height="14" rx="2" fill="#f3e1c0"/>` +
          `<text x="24" y="48.5" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="7.5" text-anchor="middle" fill="#6b3e1f">CHICOTE</text>`,
      };
    case "pneus":
      return {
        w: 38,
        h: 40,
        originY: 0.93,
        outline: 1.1,
        body: [28, 18, 8]
          .map((y) => `<ellipse cx="19" cy="${y + 4}" rx="16" ry="7" fill="#25222b"/><ellipse cx="19" cy="${y + 2}" rx="7" ry="3" fill="#4a4652"/>`)
          .join(""),
      };
    case "lixeira":
      return {
        w: 18,
        h: 26,
        originY: 0.94,
        outline: 1,
        body: `<rect x="7.5" y="14" width="3" height="11" fill="#6b6b6b"/><path d="M2 3 H16 L14 17 H4 Z" fill="#ff8c1a"/><rect x="1.5" y="2" width="15" height="3" rx="1" fill="#c4600f"/>`,
      };
    case "trave":
      return {
        w: 120,
        h: 46,
        originY: 0.9,
        outline: 1.1,
        body:
          `<path d="M8 40 V6 H112 V40" stroke="#ffffff" stroke-width="4" fill="none"/>` +
          Array.from({ length: 9 }, (_, i) => `<path d="M${18 + i * 11} 8 V38" stroke="#ffffff" stroke-opacity="0.55" stroke-width="1"/>`).join(""),
      };
  }
}

// ---------- prédios ----------

export function windowSvg(x: number, y: number, w: number, h: number) {
  const bars = Array.from({ length: 3 }, (_, i) => `<path d="M${x + ((i + 1) * w) / 4} ${y} V${y + h}" stroke="#3a3a45" stroke-width="1.4"/>`).join("");
  return `<rect x="${x - 2}" y="${y - 2}" width="${w + 4}" height="${h + 4}" rx="2" fill="#fffaf0"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#8ec5e8"/><path d="M${x} ${y + h * 0.35} L${x + w * 0.4} ${y}" stroke="#c9e7ff" stroke-width="3"/>${bars}`;
}

export function telhado(w: number, top: number, d: number) {
  const ridge = top + d * 0.42;
  const rows = Array.from({ length: Math.floor((top + d - ridge) / 9) }, (_, i) => `<path d="M2 ${ridge + 8 + i * 9} H${w - 2}" stroke="#a9441f" stroke-width="1.6"/>`).join("");
  const back = Array.from({ length: Math.floor((ridge - top) / 9) }, (_, i) => `<path d="M2 ${top + 6 + i * 9} H${w - 2}" stroke="#c4582e" stroke-width="1.2"/>`).join("");
  return (
    `<rect x="0" y="${top}" width="${w}" height="${d}" fill="#e07445"/>` +
    back +
    `<rect x="0" y="${ridge}" width="${w}" height="${top + d - ridge}" fill="#c9552f"/>` +
    rows +
    `<rect x="0" y="${ridge - 3}" width="${w}" height="6" fill="#ef8a5a"/>`
  );
}

export function laje(w: number, top: number, d: number, seed: number) {
  const cx = w * (0.6 + (seed % 3) * 0.1);
  return (
    `<rect x="0" y="${top}" width="${w}" height="${d}" fill="#cfc8bb"/>` +
    `<rect x="5" y="${top + 5}" width="${w - 10}" height="${d - 10}" fill="#bdb5a6"/>` +
    `<rect x="${cx - 16}" y="${top + d * 0.3}" width="32" height="26" rx="3" fill="#2f6fd6"/><ellipse cx="${cx}" cy="${top + d * 0.3}" rx="16" ry="6" fill="#5d93ea"/>` +
    `<path d="M${w * 0.22} ${top + d * 0.7} V${top + d * 0.3} M${w * 0.22 - 8} ${top + d * 0.36} H${w * 0.22 + 8}" stroke="#55555c" stroke-width="1.6"/>`
  );
}

export function signSvg(text: string, x: number, y: number, w: number, h: number, color = "#fffaf0") {
  const size = Math.min(15, (w * 0.92) / (text.length * 0.66));
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${color}"/><text x="${x + w / 2}" y="${y + h / 2 + size * 0.36}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${size.toFixed(1)}" text-anchor="middle" fill="${INK}">${esc(text)}</text>`;
}

export function awningSvg(x: number, y: number, w: number, colors: [string, string]) {
  const n = Math.max(4, Math.round(w / 14));
  const sw = w / n;
  let s = "";
  for (let i = 0; i < n; i++) {
    s += `<path d="M${x + i * sw} ${y} H${x + (i + 1) * sw} L${x + (i + 1) * sw + 2} ${y + 14} Q${x + (i + 0.5) * sw + 1} ${y + 20} ${x + i * sw + 1} ${y + 14} Z" fill="${colors[i % 2]}"/>`;
  }
  return s;
}

export function buildingArt(b: BuildingDef, seed: number): Art {
  const top = b.top ?? 0;
  const W = b.w;
  const H = top + b.d + b.h;
  const fy = top + b.d; // topo da fachada
  const bottom = H;
  const parts: string[] = [];

  if (b.kind === "igreja") {
    const tw = 54;
    parts.push(telhado(W, top, b.d));
    // corpo central
    parts.push(`<rect x="${tw - 6}" y="${fy - 20}" width="${W - 2 * tw + 12}" height="${b.h + 20}" fill="${b.wall}"/>`);
    parts.push(`<path d="M${tw - 6} ${fy - 20} L${W / 2} ${fy - 62} L${W - tw + 6} ${fy - 20} Z" fill="${b.wall}"/>`);
    parts.push(`<path d="M${tw + 6} ${fy - 24} L${W / 2} ${fy - 52} L${W - tw - 6} ${fy - 24} Z" fill="none" stroke="#f2c230" stroke-width="3"/>`);
    parts.push(`<rect x="${W / 2 - 2.5}" y="${fy - 84}" width="5" height="24" fill="#f2c230"/><rect x="${W / 2 - 9}" y="${fy - 76}" width="18" height="5" fill="#f2c230"/>`);
    parts.push(`<circle cx="${W / 2}" cy="${fy + 8}" r="13" fill="#8ec5e8"/><circle cx="${W / 2}" cy="${fy + 8}" r="13" fill="none" stroke="#f2c230" stroke-width="3"/>`);
    parts.push(`<path d="M${W / 2 - 22} ${bottom} V${bottom - 46} Q${W / 2} ${bottom - 72} ${W / 2 + 22} ${bottom - 46} V${bottom} Z" fill="#7a3e1d"/><path d="M${W / 2} ${bottom - 62} V${bottom}" stroke="#4a2410" stroke-width="2"/>`);
    // torres
    for (const tx of [0, W - tw]) {
      parts.push(`<rect x="${tx}" y="${22}" width="${tw}" height="${bottom - 22}" fill="${b.wall}"/>`);
      parts.push(`<rect x="${tx}" y="${22}" width="${tw}" height="8" fill="#f2c230"/><rect x="${tx}" y="${bottom - 10}" width="${tw}" height="10" fill="#e9dcc5"/>`);
      parts.push(`<path d="M${tx + 15} ${74} V${56} Q${tx + tw / 2} ${40} ${tx + tw - 15} ${56} V${74} Z" fill="#3a2a2a"/><circle cx="${tx + tw / 2}" cy="${62}" r="5" fill="#f2c230"/>`);
      parts.push(`<path d="M${tx - 2} ${24} Q${tx + tw / 2} ${-14} ${tx + tw + 2} ${24} Z" fill="#3a86c8"/><rect x="${tx + tw / 2 - 1.5}" y="0" width="3" height="10" fill="#f2c230"/>`);
      parts.push(windowSvg(tx + 15, fy + 30, 24, 30));
    }
    return { w: W, h: H, body: parts.join(""), outline: 1.4 };
  }

  if (b.kind === "fabrica") {
    // telhado em dente de serra
    parts.push(`<rect x="0" y="${top}" width="${W}" height="${b.d}" fill="#9aa0a8"/>`);
    const teeth = 8;
    const tw = W / teeth;
    for (let i = 0; i < teeth; i++) {
      const x = i * tw;
      parts.push(`<path d="M${x} ${top + b.d} L${x} ${top + 18} L${x + tw} ${top + b.d * 0.62} L${x + tw} ${top + b.d} Z" fill="#b8bec6"/>`);
      parts.push(`<path d="M${x} ${top + 18} L${x + 10} ${top + 22} L${x + 10} ${top + b.d * 0.55} L${x} ${top + b.d * 0.5} Z" fill="#8ec5e8"/>`);
    }
    // chaminé
    const cx = 470;
    parts.push(`<rect x="${cx}" y="4" width="30" height="${fy + 6}" fill="#a8432f"/><rect x="${cx - 3}" y="0" width="36" height="9" rx="2" fill="#7a2e20"/>`);
    parts.push(`<rect x="${cx}" y="30" width="30" height="6" fill="#f4efe4"/><rect x="${cx}" y="54" width="30" height="6" fill="#f4efe4"/>`);
    // fachada de tijolo
    parts.push(`<rect x="0" y="${fy}" width="${W}" height="${b.h}" fill="${b.wall}"/>`);
    for (let y = fy + 10; y < bottom - 4; y += 9) parts.push(`<path d="M0 ${y} H${W}" stroke="${shade(b.wall, -0.14)}" stroke-width="1"/>`);
    parts.push(`<rect x="0" y="${fy}" width="${W}" height="8" fill="${shade(b.wall, 0.25)}"/>`);
    for (const x of [30, 380, 460]) {
      parts.push(`<rect x="${x}" y="${fy + 56}" width="64" height="40" rx="2" fill="#4a5560"/>`);
      parts.push(`<path d="M${x + 16} ${fy + 56} V${fy + 96} M${x + 32} ${fy + 56} V${fy + 96} M${x + 48} ${fy + 56} V${fy + 96} M${x} ${fy + 76} H${x + 64}" stroke="#8ec5e8" stroke-width="2"/>`);
    }
    // portão
    parts.push(`<rect x="200" y="${bottom - 72}" width="150" height="72" fill="#5a6470"/>`);
    for (let y = bottom - 66; y < bottom; y += 8) parts.push(`<path d="M200 ${y} H350" stroke="#7a8590" stroke-width="2"/>`);
    parts.push(signSvg(b.sign ?? "FÁBRICA FELIZ", 150, fy + 14, 250, 30, "#fff3a0"));
    parts.push(`<circle cx="166" cy="${fy + 29}" r="9" fill="#ffd23f"/><path d="M161 ${fy + 31} Q166 ${fy + 36} 171 ${fy + 31}" stroke="${INK}" stroke-width="1.6" fill="none"/><circle cx="163" cy="${fy + 26}" r="1.3" fill="${INK}"/><circle cx="169" cy="${fy + 26}" r="1.3" fill="${INK}"/>`);
    return { w: W, h: H, body: parts.join(""), outline: 1.4 };
  }

  // casas, lojas e escola
  parts.push(b.roof === "telha" ? telhado(W, top, b.d) : laje(W, top, b.d, seed));
  parts.push(`<rect x="0" y="${fy}" width="${W}" height="${b.h}" fill="${b.wall}"/>`);
  parts.push(`<rect x="0" y="${fy}" width="${W}" height="7" fill="${shade(b.wall, 0.3)}"/>`);
  parts.push(`<rect x="0" y="${bottom - 10}" width="${W}" height="10" fill="${shade(b.wall, -0.25)}"/>`);

  if (b.kind === "loja") {
    const dx = W * 0.12;
    const dw = W * 0.5;
    const dh = Math.min(56, b.h - 34);
    // porta de enrolar meio aberta
    parts.push(`<rect x="${dx}" y="${bottom - dh}" width="${dw}" height="${dh}" fill="#3a2f2f"/>`);
    parts.push(`<rect x="${dx + 6}" y="${bottom - dh * 0.55}" width="${dw - 12}" height="4" fill="#8a6a4a"/><rect x="${dx + 6}" y="${bottom - dh * 0.3}" width="${dw - 12}" height="4" fill="#8a6a4a"/>`);
    parts.push(
      Array.from({ length: 6 }, (_, i) => `<rect x="${dx + 8 + i * ((dw - 16) / 6)}" y="${bottom - dh * 0.55 - 9}" width="7" height="9" fill="${["#e63946", "#ffd23f", "#3a86ff", "#2e7d32", "#ff9f80", "#f4f1de"][i]}"/>`).join(""),
    );
    parts.push(`<rect x="${dx}" y="${bottom - dh}" width="${dw}" height="${dh * 0.38}" fill="#a9adb3"/>`);
    for (let y = bottom - dh + 4; y < bottom - dh * 0.62; y += 4) parts.push(`<path d="M${dx} ${y} H${dx + dw}" stroke="#7d828a" stroke-width="1"/>`);
    if (b.awning) parts.push(awningSvg(dx - 8, bottom - dh - 16, dw + 16, b.awning));
    parts.push(windowSvg(W * 0.7, bottom - dh + 4, W * 0.2, 30));
    if (b.sign) parts.push(signSvg(b.sign, W * 0.06, fy + 12, W * 0.88, Math.min(26, b.h - dh - 26)));
  } else if (b.kind === "escola") {
    parts.push(`<rect x="0" y="${bottom - 34}" width="${W}" height="24" fill="#3a86c8"/>`);
    for (let x = 22; x < W - 40; x += 58) if (Math.abs(x + 18 - W / 2) > 40) parts.push(windowSvg(x, fy + 46, 36, 26));
    parts.push(`<rect x="${W / 2 - 26}" y="${bottom - 52}" width="52" height="52" fill="#2f5f8a"/><path d="M${W / 2} ${bottom - 52} V${bottom}" stroke="#f1faee" stroke-width="2"/>`);
    if (b.sign) parts.push(signSvg(b.sign, W * 0.2, fy + 12, W * 0.6, 24));
  } else {
    const doorX = W * (seed % 2 ? 0.62 : 0.4);
    parts.push(`<rect x="${doorX - 13}" y="${bottom - 50}" width="26" height="50" fill="#8a5a3a"/><circle cx="${doorX + 7}" cy="${bottom - 25}" r="2" fill="#f2c230"/>`);
    const wy = bottom - b.h * 0.62;
    const ww = Math.min(40, W * 0.2);
    if (doorX - W * 0.2 > ww * 0.8) parts.push(windowSvg(W * 0.08, wy, ww, 28));
    parts.push(windowSvg(W - W * 0.08 - ww, wy, ww, 28));
    // grade e portãozinho baixo na frente
    parts.push(`<path d="M2 ${bottom - 2} H${W - 2}" stroke="#55555c" stroke-width="2"/>`);
    parts.push(`<rect x="${W * 0.1}" y="${fy + 8}" width="14" height="10" rx="2" fill="#9be15d"/><rect x="${W * 0.1 - 2}" y="${fy + 16}" width="18" height="6" rx="2" fill="#c4600f"/>`);
  }
  return { w: W, h: H, body: parts.join(""), outline: 1.3 };
}
