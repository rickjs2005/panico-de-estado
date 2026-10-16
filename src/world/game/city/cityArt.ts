import type { BuildingDef } from "../../map";
import type { CityBuilding, CityPropKind } from "../../cidade/types";
import { doorFrac } from "../../cidade";
import { awningSvg, buildingArt, INK, laje, propArt, shade, signSvg, telhado, windowSvg, type Art, type PropArt, type RoofColors } from "../art";
import { interiorPropArt } from "./interiorArt";

/**
 * Arte da cidade do Lula: prédios com função própria (prefeitura, ministério,
 * repartição, conjunto habitacional, galpões, armazéns, alfândega, universidade)
 * e o mobiliário de cada distrito. Mesmo traço do bairro: chapado, contorno escuro.
 */

const OLD_KINDS = new Set(["loja", "igreja", "fabrica", "escola"]);

/** Telhados em tons mais suaves que o laranja do bairro: não disputam atenção com o personagem. */
const ROOFS: RoofColors[] = [
  { back: "#d4896a", front: "#bc6f52", ridge: "#e2a084", line: "#a65d43" },
  { back: "#a9acb3", front: "#93979f", ridge: "#c0c3c8", line: "#7f838b" },
  { back: "#98ae84", front: "#82986f", ridge: "#adc39a", line: "#6f845d" },
  { back: "#b97468", front: "#a05e54", ridge: "#cc8d82", line: "#8b4f46" },
  { back: "#c99a6a", front: "#b18255", ridge: "#dbb184", line: "#966c45" },
];

function idHash(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export function roofFor(id: string): RoofColors {
  return ROOFS[idHash(id) % ROOFS.length];
}

/**
 * Casas da cidade: porta onde o jogo espera, janelas do outro lado e detalhes sorteados
 * por casa (jardim, vasos, grade, botijão, toldo, varal e caixa d'água na laje).
 */
function casaArt(b: CityBuilding): Art {
  const h = idHash(b.id);
  const top = b.top ?? 0;
  const W = b.w;
  const H = top + b.d + b.h;
  const fy = top + b.d;
  const parts: string[] = [];
  const doorX = W * doorFrac(b);
  if (b.roof === "telha") parts.push(telhado(W, top, b.d, roofFor(b.id)));
  else {
    parts.push(laje(W, top, b.d, h));
    // varal na laje
    const vy = top + b.d * 0.62;
    const clothes = ["#e63946", "#ffd23f", "#3a86ff", "#2e7d32", "#ff9f80", "#f4f1de"];
    parts.push(`<path d="M${W * 0.08} ${vy} H${W * 0.5}" stroke="#55555c" stroke-width="1.2"/>`);
    for (let i = 0; i < 4; i++) parts.push(`<rect x="${W * 0.1 + i * (W * 0.1)}" y="${vy}" width="${8 + (i % 2) * 3}" height="${9 - (i % 2) * 2}" fill="${clothes[(h + i) % 6]}"/>`);
  }
  parts.push(`<rect x="0" y="${fy}" width="${W}" height="${b.h}" fill="${b.wall}"/>`);
  parts.push(`<rect x="0" y="${fy}" width="${W}" height="7" fill="${shade(b.wall, 0.3)}"/>`);
  // barrado (meia parede pintada) em parte das casas
  if (h % 3 === 0) parts.push(`<rect x="0" y="${H - 30}" width="${W}" height="20" fill="${shade(b.wall, -0.12)}"/>`);
  parts.push(`<rect x="0" y="${H - 10}" width="${W}" height="10" fill="${shade(b.wall, -0.25)}"/>`);
  // porta com batente e número
  parts.push(`<rect x="${doorX - 16}" y="${H - 54}" width="32" height="54" fill="${shade(b.wall, -0.3)}"/>`);
  parts.push(`<rect x="${doorX - 13}" y="${H - 51}" width="26" height="51" fill="${["#8a5a3a", "#3a6b8a", "#6b8a3a", "#8a3a4a"][h % 4]}"/><circle cx="${doorX + 7}" cy="${H - 25}" r="2" fill="#f2c230"/>`);
  parts.push(`<rect x="${doorX - 8}" y="${H - 66}" width="16" height="10" rx="2" fill="#fffaf0"/><text x="${doorX}" y="${H - 58}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="7" text-anchor="middle" fill="${INK}">${(h % 97) + 3}</text>`);
  // janelas do outro lado da porta
  const ww = Math.min(40, W * 0.24);
  const wy = H - b.h * 0.64;
  const left = doorX > W / 2;
  const wx = left ? W * 0.1 : W - W * 0.1 - ww;
  parts.push(windowSvg(wx, wy, ww, 28));
  if (W > 170) parts.push(windowSvg(left ? wx + ww + 14 : wx - ww - 14, wy, ww, 28));
  if (h % 4 === 1) parts.push(awningSvg(wx - 4, wy - 10, ww + 8, ["#e63946", "#fff4e0"]));
  // grade baixa na frente, com vão na porta
  if (h % 2 === 0) {
    const g: string[] = [];
    for (let x = 4; x < W - 4; x += 8) if (Math.abs(x - doorX) > 22) g.push(`M${x} ${H - 2} V${H - 16}`);
    parts.push(`<path d="${g.join(" ")}" stroke="#55555c" stroke-width="1.6"/><path d="M2 ${H - 16} H${doorX - 22} M${doorX + 22} ${H - 16} H${W - 2}" stroke="#55555c" stroke-width="2"/>`);
  }
  // jardim ou vasos
  const gx = left ? W * 0.08 : W * 0.62;
  if (h % 5 < 2) {
    parts.push(`<rect x="${gx}" y="${H - 9}" width="${W * 0.3}" height="9" fill="#5aa04a"/>`);
    for (let i = 0; i < 4; i++) parts.push(`<circle cx="${gx + 8 + i * (W * 0.07)}" cy="${H - 8}" r="3" fill="${["#e63946", "#ffd23f", "#f28dc0", "#ffffff"][(h + i) % 4]}"/>`);
  } else {
    parts.push(`<path d="M${gx} ${H - 14} H${gx + 12} L${gx + 10} ${H} H${gx + 2} Z" fill="#c9552f"/><circle cx="${gx + 6}" cy="${H - 18}" r="6" fill="#4cae55"/>`);
  }
  // botijão de gás ou bicicleta coletiva encostada
  if (h % 7 === 3) parts.push(`<rect x="${left ? W - 26 : 10}" y="${H - 22}" width="14" height="20" rx="5" fill="#2f6fd6"/><rect x="${left ? W - 23 : 13}" y="${H - 26}" width="8" height="5" fill="#55555c"/>`);
  if (h % 7 === 5) parts.push(`<circle cx="${left ? W - 40 : 20}" cy="${H - 8}" r="7" fill="none" stroke="#2a2a35" stroke-width="2"/><circle cx="${left ? W - 18 : 42}" cy="${H - 8}" r="7" fill="none" stroke="#2a2a35" stroke-width="2"/><path d="M${left ? W - 40 : 20} ${H - 8} L${left ? W - 30 : 30} ${H - 18} L${left ? W - 18 : 42} ${H - 8}" stroke="#e63946" stroke-width="2" fill="none"/>`);
  // adesivo da coletivização em algumas portas
  if (h % 3 === 1) parts.push(`<rect x="${doorX - 11}" y="${H - 44}" width="22" height="9" rx="1" fill="#c62835"/><text x="${doorX}" y="${H - 37.5}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="4.6" text-anchor="middle" fill="#fff4ce">DO POVO</text>`);
  if (b.sign) parts.push(signSvg(b.sign, W * 0.1, fy + 10, W * 0.8, 18));
  return { w: W, h: H, body: parts.join(""), outline: 1.3 };
}

function star(cx: number, cy: number, r: number, fill: string) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(" ")}" fill="${fill}"/>`;
}

function base(b: CityBuilding, fy: number, H: number, parts: string[]) {
  parts.push(`<rect x="0" y="${fy}" width="${b.w}" height="${b.h}" fill="${b.wall}"/>`);
  parts.push(`<rect x="0" y="${fy}" width="${b.w}" height="7" fill="${shade(b.wall, 0.3)}"/>`);
  parts.push(`<rect x="0" y="${H - 10}" width="${b.w}" height="10" fill="${shade(b.wall, -0.25)}"/>`);
}

function door(x: number, bottom: number, w: number, h: number, color = "#6b4a2a") {
  return `<rect x="${x - w / 2}" y="${bottom - h}" width="${w}" height="${h}" fill="${color}"/><path d="M${x} ${bottom - h} V${bottom}" stroke="${shade(color, -0.35)}" stroke-width="2"/>`;
}

function glassDoor(x: number, bottom: number, w: number, h: number) {
  return `<rect x="${x - w / 2}" y="${bottom - h}" width="${w}" height="${h}" fill="#5d8fb0"/><path d="M${x} ${bottom - h} V${bottom} M${x - w / 2 + 4} ${bottom - h + 6} L${x - 4} ${bottom - h + 22}" stroke="#c9e7ff" stroke-width="2"/>`;
}

export function cityBuildingArt(b: CityBuilding, seed: number): Art {
  if (b.kind === "casa") return casaArt(b);
  if (OLD_KINDS.has(b.kind)) return buildingArt({ ...(b as unknown as BuildingDef), door: doorFrac(b) }, seed, roofFor(b.id));
  const top = b.top ?? 0;
  const W = b.w;
  const H = top + b.d + b.h;
  const fy = top + b.d;
  const parts: string[] = [];
  const doorX = W * doorFrac(b);

  switch (b.kind) {
    case "prefeitura": {
      parts.push(telhado(W, top, b.d, roofFor(b.id)));
      parts.push(`<path d="M${W / 2 - 74} ${fy - 6} A74 74 0 0 1 ${W / 2 + 74} ${fy - 6} Z" fill="#d94a3a"/>`);
      parts.push(`<path d="M${W / 2 - 40} ${fy - 30} Q${W / 2} ${fy - 74} ${W / 2 + 40} ${fy - 30}" stroke="#f28da0" stroke-width="5" fill="none"/>`);
      parts.push(`<rect x="${W / 2 - 9}" y="${fy - 98}" width="18" height="22" fill="#f2c230"/>` + star(W / 2, fy - 110, 13, "#ffd23f"));
      base(b, fy, H, parts);
      for (const wx of [24, 74, W - 114, W - 64]) {
        parts.push(windowSvg(wx, fy + 26, 34, 30));
        parts.push(windowSvg(wx, fy + 76, 34, 30));
      }
      parts.push(`<path d="M${W * 0.27} ${fy + 24} L${W / 2} ${fy - 14} L${W * 0.73} ${fy + 24} Z" fill="${shade(b.wall, 0.15)}"/>`);
      parts.push(star(W / 2, fy + 8, 9, "#c62835"));
      for (let i = 0; i < 6; i++) {
        const cx = W * 0.29 + i * ((W * 0.42) / 5);
        parts.push(`<rect x="${cx - 7}" y="${fy + 24}" width="14" height="${b.h - 46}" fill="#ffffff"/><rect x="${cx - 9}" y="${fy + 22}" width="18" height="6" fill="#e9dcc5"/>`);
      }
      for (const bx of [W * 0.36, W * 0.64]) parts.push(`<path d="M${bx - 12} ${fy + 30} H${bx + 12} V${fy + 86} L${bx} ${fy + 78} L${bx - 12} ${fy + 86} Z" fill="#c62835"/>` + star(bx, fy + 50, 7, "#ffd23f"));
      parts.push(door(doorX, H - 12, 46, 52, "#7a3e1d"));
      parts.push(`<rect x="${W * 0.25}" y="${H - 12}" width="${W * 0.5}" height="12" fill="#e9dcc5"/><rect x="${W * 0.22}" y="${H - 5}" width="${W * 0.56}" height="5" fill="#d9cfc0"/>`);
      if (b.sign) parts.push(signSvg(b.sign, W * 0.32, fy + 92, W * 0.36, 20, "#fff3a0"));
      break;
    }
    case "ministerio": {
      parts.push(laje(W, top, b.d, seed));
      // megafone gigante no telhado
      parts.push(`<rect x="${W * 0.3}" y="${top - 18}" width="10" height="40" fill="#55555c"/>`);
      parts.push(`<path d="M${W * 0.3 - 6} ${top - 52} L${W * 0.3 + 46} ${top - 80} L${W * 0.3 + 46} ${top - 2} L${W * 0.3 - 6} ${top - 30} Z" fill="#e63946"/>`);
      parts.push(`<rect x="${W * 0.3 - 22}" y="${top - 52}" width="18" height="22" rx="3" fill="#ffd23f"/><ellipse cx="${W * 0.3 + 46}" cy="${top - 41}" rx="8" ry="39" fill="#b8202e"/>`);
      parts.push(`<path d="M${W * 0.3 + 60} ${top - 60} Q${W * 0.3 + 74} ${top - 41} ${W * 0.3 + 60} ${top - 22} M${W * 0.3 + 72} ${top - 70} Q${W * 0.3 + 92} ${top - 41} ${W * 0.3 + 72} ${top - 12}" stroke="#ffd23f" stroke-width="4" fill="none"/>`);
      parts.push(`<rect x="${W * 0.78}" y="${top - 60}" width="4" height="70" fill="#55555c"/><circle cx="${W * 0.78 + 2}" cy="${top - 62}" r="5" fill="#e63946"/>`);
      base(b, fy, H, parts);
      parts.push(`<rect x="${W / 2 - 12}" y="${fy}" width="24" height="${b.h}" fill="#c62835"/>`);
      for (let r = 0; r < 4; r++) {
        for (const wx of [14, 54, W - 94, W - 54]) parts.push(`<rect x="${wx}" y="${fy + 44 + r * 28}" width="34" height="18" fill="#7fb3d5"/><path d="M${wx} ${fy + 50 + r * 28} H${wx + 34}" stroke="#d4ecff" stroke-width="2"/>`);
      }
      parts.push(glassDoor(W / 2, H - 10, 44, 38));
      if (b.sign) parts.push(signSvg(b.sign, 8, fy + 10, W - 16, 26, "#fffaf0"));
      parts.push(`<path d="M${W - 30} ${fy + 2} h22 v14 h-12 l-6 6 v-6 h-4 Z" fill="#ffd23f"/><text x="${W - 19}" y="${fy + 13}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="9" text-anchor="middle" fill="${INK}">!?</text>`);
      break;
    }
    case "reparticao": {
      parts.push(laje(W, top, b.d, seed));
      parts.push(`<rect x="${W * 0.15}" y="${top + 14}" width="26" height="16" rx="2" fill="#e9e4dc"/><rect x="${W * 0.15 + 34}" y="${top + 14}" width="26" height="16" rx="2" fill="#e9e4dc"/>`);
      base(b, fy, H, parts);
      for (const wx of [14, 58, W - 98, W - 54]) parts.push(windowSvg(wx, fy + 44, 30, 24));
      parts.push(glassDoor(doorX, H - 10, 40, 40));
      parts.push(`<rect x="${doorX + 26}" y="${H - 54}" width="30" height="16" rx="2" fill="#1e1424"/><text x="${doorX + 41}" y="${H - 42}" font-family="Arial, sans-serif" font-weight="900" font-size="9" text-anchor="middle" fill="#ff4d4d">0666</text>`);
      parts.push(`<rect x="${doorX - 58}" y="${H - 52}" width="30" height="20" rx="2" fill="#fffaf0"/><text x="${doorX - 43}" y="${H - 44}" font-family="Arial, sans-serif" font-weight="700" font-size="5.5" text-anchor="middle" fill="${INK}">10H ÀS</text><text x="${doorX - 43}" y="${H - 37}" font-family="Arial, sans-serif" font-weight="700" font-size="5.5" text-anchor="middle" fill="${INK}">10H15</text>`);
      if (b.sign) parts.push(signSvg(b.sign, 8, fy + 12, W - 16, 22));
      break;
    }
    case "capela": {
      parts.push(laje(W, top, b.d, seed));
      base(b, fy, H, parts);
      for (const wx of [22, 52, W - 74, W - 44]) parts.push(`<path d="M${wx} ${H - 24} V${fy + 52} Q${wx + 11} ${fy + 38} ${wx + 22} ${fy + 52} V${H - 24} Z" fill="#a9c4e8"/>`);
      parts.push(door(doorX, H - 10, 50, 48, "#5a4a7a"));
      parts.push(`<rect x="${W / 2 - 3}" y="${fy - 30}" width="6" height="30" fill="#f2c230"/><rect x="${W / 2 - 12}" y="${fy - 22}" width="24" height="6" fill="#f2c230"/>`);
      if (b.sign) parts.push(signSvg(b.sign, 16, fy + 10, W - 32, 22));
      break;
    }
    case "conjunto": {
      parts.push(laje(W, top, b.d, seed));
      parts.push(`<rect x="${W * 0.2}" y="${top + b.d * 0.25}" width="30" height="24" rx="3" fill="#2f6fd6"/><ellipse cx="${W * 0.2 + 15}" cy="${top + b.d * 0.25}" rx="15" ry="5" fill="#5d93ea"/>`);
      base(b, fy, H, parts);
      const floors = Math.floor((b.h - 50) / 38);
      const cols = Math.floor((W - 30) / 46);
      const clothes = ["#e63946", "#ffd23f", "#3a86ff", "#2e7d32", "#ff9f80", "#f4f1de"];
      for (let f = 0; f < floors; f++) {
        const y = fy + 34 + f * 38;
        parts.push(`<rect x="0" y="${y + 26}" width="${W}" height="4" fill="${shade(b.wall, -0.18)}"/>`);
        for (let c = 0; c < cols; c++) {
          const x = 18 + c * 46;
          if (Math.abs(x + 15 - W / 2) < 22) continue;
          parts.push(`<rect x="${x}" y="${y}" width="28" height="20" fill="#8ec5e8"/><path d="M${x + 9} ${y} V${y + 20} M${x + 19} ${y} V${y + 20}" stroke="#3a3a45" stroke-width="1.2"/>`);
          if ((c + f + seed) % 3 === 0) parts.push(`<path d="M${x - 2} ${y + 22} H${x + 30}" stroke="#55555c" stroke-width="1"/><rect x="${x + 2}" y="${y + 22}" width="8" height="9" fill="${clothes[(c + f) % 6]}"/><rect x="${x + 14}" y="${y + 22}" width="10" height="7" fill="${clothes[(c + f + 2) % 6]}"/>`);
        }
      }
      parts.push(`<rect x="${W / 2 - 18}" y="${fy + 30}" width="36" height="${b.h - 40}" fill="${shade(b.wall, -0.1)}"/>`);
      parts.push(door(W / 2, H - 10, 30, 40, "#6b5a4a"));
      if (b.sign) parts.push(signSvg(b.sign, W * 0.1, fy + 8, W * 0.8, 20));
      break;
    }
    case "galpao":
    case "armazem": {
      const arch = b.kind === "armazem";
      parts.push(`<rect x="0" y="${top}" width="${W}" height="${b.d}" fill="${arch ? shade(b.wall, -0.1) : "#a7adb5"}"/>`);
      if (arch) {
        for (let i = 1; i < 6; i++) parts.push(`<path d="M0 ${top + (i * b.d) / 6} Q${W / 2} ${top + (i * b.d) / 6 - 14} ${W} ${top + (i * b.d) / 6}" stroke="${shade(b.wall, -0.3)}" stroke-width="2" fill="none"/>`);
      } else {
        for (let x = 10; x < W; x += 14) parts.push(`<path d="M${x} ${top} V${top + b.d}" stroke="#8d939b" stroke-width="2"/>`);
        parts.push(`<rect x="0" y="${top + b.d * 0.46}" width="${W}" height="6" fill="#c3c8cf"/>`);
      }
      parts.push(`<rect x="0" y="${fy}" width="${W}" height="${b.h}" fill="${b.wall}"/>`);
      for (let x = 6; x < W; x += 9) parts.push(`<path d="M${x} ${fy + 4} V${H - 6}" stroke="${shade(b.wall, -0.16)}" stroke-width="1.3"/>`);
      const gw = Math.min(W * 0.46, 120);
      parts.push(`<rect x="${doorX - gw / 2}" y="${H - 66}" width="${gw}" height="66" fill="#4f5660"/>`);
      for (let y = H - 60; y < H; y += 7) parts.push(`<path d="M${doorX - gw / 2} ${y} H${doorX + gw / 2}" stroke="#727b86" stroke-width="2"/>`);
      parts.push(`<rect x="${doorX - gw / 2}" y="${H - 66}" width="${gw}" height="5" fill="#f2c230"/>`);
      if (arch) {
        parts.push(star(W - 30, fy + 50, 14, "#ffd23f"));
        parts.push(`<text x="26" y="${fy + 58}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="13" fill="#fffaf0" opacity="0.85">EXPORT</text>`);
      }
      if (b.sign) parts.push(signSvg(b.sign, W * 0.06, fy + 10, W * 0.88, 22));
      break;
    }
    case "alfandega": {
      parts.push(laje(W, top, b.d, seed));
      base(b, fy, H, parts);
      for (let x = 0; x < W; x += 20) parts.push(`<path d="M${x} ${fy + 38} l10 0 l-8 10 l-10 0 Z" fill="${INK}"/>`);
      parts.push(glassDoor(doorX, H - 10, 40, 44));
      for (const i of [0, 2]) {
        const cx = W * 0.2 + i * W * 0.3;
        parts.push(`<rect x="${cx - 26}" y="${H - 56}" width="52" height="46" rx="3" fill="#fffaf0"/><rect x="${cx - 18}" y="${H - 50}" width="36" height="18" fill="#8ec5e8"/>`);
        parts.push(`<text x="${cx}" y="${H - 18}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="8" text-anchor="middle" fill="${INK}">${["SAÍDA", "CARIMBO", "CHINA"][i]}</text>`);
      }
      parts.push(`<rect x="${W - 54}" y="${fy + 56}" width="40" height="24" rx="2" fill="#c62835"/><text x="${W - 34}" y="${fy + 72}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="8" text-anchor="middle" fill="#fffaf0">PAÍS</text>`);
      if (b.sign) parts.push(signSvg(b.sign, 10, fy + 10, W - 20, 24));
      break;
    }
    case "universidade": {
      parts.push(telhado(W, top, b.d, roofFor(b.id)));
      // torre do relógio
      const tw = 70;
      parts.push(`<rect x="${W / 2 - tw / 2}" y="${top - 70}" width="${tw}" height="${b.d + 80}" fill="${shade(b.wall, -0.04)}"/>`);
      parts.push(`<path d="M${W / 2 - tw / 2 - 6} ${top - 68} L${W / 2} ${top - 98} L${W / 2 + tw / 2 + 6} ${top - 68} Z" fill="#3a86c8"/>`);
      parts.push(`<circle cx="${W / 2}" cy="${top - 30}" r="22" fill="#fffaf0"/><path d="M${W / 2} ${top - 30} V${top - 46} M${W / 2} ${top - 30} H${W / 2 + 12}" stroke="${INK}" stroke-width="3"/>`);
      base(b, fy, H, parts);
      // murais coloridos
      const mural = ["#e63946", "#ffd23f", "#2e7d32", "#3a86ff", "#7b4bd1", "#ff9f80"];
      mural.forEach((c, i) => parts.push(`<path d="M${20 + i * 12} ${H - 12} Q${40 + i * 12} ${fy + 40} ${80 + i * 12} ${H - 12}" stroke="${c}" stroke-width="7" fill="none"/>`));
      mural.forEach((c, i) => parts.push(`<circle cx="${W - 90 + (i % 3) * 26}" cy="${fy + 50 + Math.floor(i / 3) * 26}" r="11" fill="${c}"/>`));
      for (let x = 170; x < W - 170; x += 56) if (Math.abs(x + 18 - W / 2) > 60) parts.push(windowSvg(x, fy + 46, 36, 28));
      parts.push(`<rect x="${W / 2 - 60}" y="${fy + 30}" width="120" height="${b.h - 30}" fill="${shade(b.wall, 0.4)}"/>`);
      for (let i = 0; i < 4; i++) parts.push(`<rect x="${W / 2 - 52 + i * 32}" y="${fy + 34}" width="10" height="${b.h - 46}" fill="#ffffff"/>`);
      parts.push(door(W / 2, H - 10, 40, 50, "#3a5a7a"));
      if (b.sign) parts.push(signSvg(b.sign, W / 2 - 150, fy + 6, 300, 22, "#fff3a0"));
      break;
    }
  }
  return { w: W, h: H, body: parts.join(""), outline: 1.3 };
}

// ---------- objetos ----------

const OLD_PROPS = new Set(["arvore", "poste", "banco", "coreto", "orelhao", "banca", "mesaBar", "barraca", "lixeira", "pneus", "trave"]);

const CONTAINER: Record<string, string> = { vermelho: "#d1453b", azul: "#2f6fd6", verde: "#3aa655", amarelo: "#f2c230" };
const KIOSK: Record<string, [string, string]> = {
  birosca: ["#3aa655", "#ffd23f"],
  boteco: ["#d62839", "#fff4e0"],
  dce: ["#3a86c8", "#ffd23f"],
  exportacao: ["#d1453b", "#ffd23f"],
  praca: ["#c62835", "#ffd23f"],
  fabrica: ["#8a8f98", "#ffd23f"],
};

export function cityPropArt(kind: CityPropKind, variant?: string): PropArt {
  if (OLD_PROPS.has(kind)) return propArt(kind as Parameters<typeof propArt>[0], variant);
  const inner = interiorPropArt(kind, variant);
  if (inner) return inner;
  switch (kind) {
    case "palmeira":
      return {
        w: 80,
        h: 150,
        originY: 0.97,
        outline: 1.2,
        body:
          `<path d="M37 146 Q35 80 40 30 L44 30 Q47 80 45 146 Z" fill="#a89a85"/>` +
          [-60, -25, 10, 45, 80, 120, 160].map((a) => `<path d="M42 30 Q${42 + Math.cos((a * Math.PI) / 180) * 26} ${30 + Math.sin((a * Math.PI) / 180) * 18 - 14} ${42 + Math.cos((a * Math.PI) / 180) * 40} ${30 + Math.sin((a * Math.PI) / 180) * 26}" stroke="#3f9b4a" stroke-width="7" fill="none" stroke-linecap="round"/>`).join(""),
      };
    case "ipe": {
      const c = variant === "rosa" ? ["#e85d9a", "#f28dc0"] : ["#f2c230", "#ffe066"];
      return {
        w: 70,
        h: 92,
        originY: 0.97,
        outline: 1.3,
        body: `<rect x="31" y="58" width="9" height="32" rx="3" fill="#7a4e2d"/><circle cx="20" cy="50" r="17" fill="${c[0]}"/><circle cx="50" cy="50" r="17" fill="${c[0]}"/><circle cx="35" cy="32" r="26" fill="${c[1]}"/><circle cx="27" cy="24" r="8" fill="#fffaf0" fill-opacity="0.5"/>`,
      };
    }
    case "bandeira": {
      const china = variant === "china";
      return {
        w: 64,
        h: 100,
        originY: 0.97,
        outline: 1,
        body:
          `<rect x="6" y="6" width="4" height="92" fill="#55555c"/><circle cx="8" cy="5" r="3" fill="#f2c230"/>` +
          `<path d="M10 10 Q32 4 58 12 L58 44 Q34 36 10 42 Z" fill="#cf3547"/>` +
          (china ? star(22, 22, 7, "#ffd23f") + star(36, 16, 3, "#ffd23f") + star(40, 24, 3, "#ffd23f") + star(36, 32, 3, "#ffd23f") : star(30, 26, 9, "#ffd23f")),
      };
    }
    case "outdoor":
      return {
        w: 190,
        h: 112,
        originY: 0.97,
        outline: 1.3,
        body: `<rect x="30" y="60" width="8" height="50" fill="#55555c"/><rect x="152" y="60" width="8" height="50" fill="#55555c"/><rect x="4" y="4" width="182" height="64" rx="3" fill="#fffaf0"/><rect x="4" y="4" width="182" height="10" fill="#c62835"/>` + star(20, 9, 4, "#ffd23f"),
      };
    case "placaColetiva":
      return { w: 92, h: 62, originY: 0.97, outline: 1, body: `<rect x="43" y="28" width="5" height="32" fill="#7a4e2d"/><rect x="2" y="4" width="88" height="28" rx="3" fill="#c62835"/>` };
    case "placaRua":
      return { w: 104, h: 64, originY: 0.97, outline: 1, body: `<rect x="49" y="18" width="5" height="44" fill="#55555c"/><rect x="2" y="2" width="100" height="20" rx="3" fill="#1d5fa8"/>` };
    case "frade":
      return { w: 14, h: 22, originY: 0.95, outline: 0.9, body: `<rect x="2" y="3" width="10" height="17" rx="5" fill="#e9e4dc"/><rect x="2" y="7" width="10" height="4" fill="#f2c230"/>` };
    case "cone":
      return { w: 18, h: 24, originY: 0.95, outline: 0.9, body: `<path d="M9 2 L15 20 H3 Z" fill="#ff7a1a"/><path d="M6 11 H12" stroke="#ffffff" stroke-width="2.5"/><rect x="1" y="19" width="16" height="4" rx="1" fill="#ff7a1a"/>` };
    case "tambor":
      return { w: 26, h: 34, originY: 0.95, outline: 1, body: `<rect x="3" y="4" width="20" height="28" rx="3" fill="#2f6fd6"/><ellipse cx="13" cy="5" rx="10" ry="3" fill="#5d93ea"/><path d="M3 13 H23 M3 23 H23" stroke="#1d4fa0" stroke-width="2"/><circle cx="13" cy="18" r="3" fill="#ffd23f"/>` };
    case "palete":
      return { w: 50, h: 34, originY: 0.94, outline: 1, body: `<rect x="2" y="24" width="46" height="7" fill="#b5732f"/><rect x="6" y="8" width="18" height="16" fill="#c9915a"/><rect x="26" y="4" width="18" height="20" fill="#d9a066"/><path d="M6 14 H24 M26 12 H44" stroke="#8a5a2b" stroke-width="1"/>` };
    case "caminhao": {
      const c = variant === "azul" ? "#2f6fd6" : "#e2533b";
      return {
        w: 160,
        h: 84,
        originY: 0.94,
        outline: 1.3,
        body:
          `<rect x="4" y="10" width="110" height="56" rx="3" fill="#e9e4dc"/><rect x="4" y="10" width="110" height="10" fill="#cfc8bb"/><text x="58" y="48" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="12" text-anchor="middle" fill="${INK}">CARGA DO POVO</text>` +
          `<path d="M116 24 H140 L154 42 V66 H116 Z" fill="${c}"/><path d="M122 30 H138 L148 42 H122 Z" fill="#a8e0ff"/>` +
          `<circle cx="30" cy="70" r="10" fill="#25222b"/><circle cx="90" cy="70" r="10" fill="#25222b"/><circle cx="138" cy="70" r="10" fill="#25222b"/>`,
      };
    }
    case "conteiner": {
      const c = CONTAINER[variant ?? "vermelho"] ?? CONTAINER.vermelho;
      return {
        w: 90,
        h: 58,
        originY: 0.93,
        outline: 1.2,
        body:
          `<rect x="3" y="3" width="84" height="16" fill="${shade(c, 0.25)}"/><rect x="3" y="19" width="84" height="36" fill="${c}"/>` +
          Array.from({ length: 10 }, (_, i) => `<path d="M${10 + i * 8} 21 V53" stroke="${shade(c, -0.25)}" stroke-width="1.6"/>`).join("") +
          `<text x="45" y="16" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="8" text-anchor="middle" fill="${INK}" opacity="0.7">BR→CN</text>`,
      };
    }
    case "guindaste":
      return {
        w: 220,
        h: 270,
        originY: 0.97,
        outline: 1.6,
        body:
          `<path d="M60 266 L80 120 M120 266 L100 120 M60 266 H120 M66 220 H114 M72 170 H108" stroke="#f2c230" stroke-width="8" fill="none"/>` +
          `<rect x="66" y="96" width="50" height="34" rx="3" fill="#d1453b"/><rect x="74" y="102" width="20" height="14" fill="#a8e0ff"/>` +
          `<path d="M20 92 H214 M20 92 L90 60 L214 92" stroke="#f2c230" stroke-width="7" fill="none"/><rect x="4" y="84" width="30" height="20" fill="#55555c"/>` +
          `<path d="M190 92 V150" stroke="#55555c" stroke-width="2"/><rect x="178" y="150" width="24" height="12" rx="2" fill="#55555c"/>`,
      };
    case "esteira":
      return {
        w: 310,
        h: 56,
        originY: 0.92,
        outline: 1.3,
        body:
          `<rect x="4" y="16" width="302" height="20" rx="8" fill="#3a3640"/><rect x="8" y="18" width="294" height="10" rx="5" fill="#544653"/>` +
          Array.from({ length: 13 }, (_, i) => `<circle cx="${18 + i * 23}" cy="31" r="4" fill="#b8a7a3"/>`).join("") +
          `<rect x="20" y="36" width="8" height="16" fill="#55555c"/><rect x="282" y="36" width="8" height="16" fill="#55555c"/><rect x="150" y="36" width="8" height="16" fill="#55555c"/>`,
      };
    case "monumento":
      return {
        w: 110,
        h: 170,
        originY: 0.96,
        outline: 1.6,
        body:
          `<rect x="20" y="130" width="70" height="36" rx="3" fill="#d9cfc0"/><rect x="14" y="152" width="82" height="14" rx="2" fill="#bdb5a6"/>` +
          `<text x="55" y="146" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="7" text-anchor="middle" fill="${INK}">AO ÁUDIO DE</text><text x="55" y="154" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="7" text-anchor="middle" fill="${INK}">3 MINUTOS</text>` +
          `<rect x="34" y="20" width="42" height="112" rx="8" fill="#2a2a35"/><rect x="38" y="30" width="34" height="88" rx="3" fill="#8ec5e8"/>` +
          `<path d="M42 44 h26 v18 h-16 l-6 6 v-6 h-4 Z" fill="#3ddc84"/><path d="M44 76 Q48 70 52 76 T60 76 T68 76" stroke="${INK}" stroke-width="2" fill="none"/><text x="55" y="100" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="9" text-anchor="middle" fill="${INK}">3:00</text>` +
          `<path d="M80 30 Q92 40 80 50 M86 22 Q102 40 86 58" stroke="#ffd23f" stroke-width="3" fill="none"/>`,
      };
    case "chafariz":
      return {
        w: 104,
        h: 76,
        originY: 0.92,
        outline: 1.3,
        body:
          `<ellipse cx="52" cy="58" rx="48" ry="14" fill="#d9cfc0"/><ellipse cx="52" cy="54" rx="40" ry="10" fill="#7cc4ff"/>` +
          `<rect x="47" y="24" width="10" height="30" fill="#d9cfc0"/><ellipse cx="52" cy="24" rx="16" ry="5" fill="#d9cfc0"/>` +
          `<path d="M52 20 Q40 4 30 44 M52 20 Q64 4 74 44 M52 20 V4" stroke="#bfe6ff" stroke-width="3" fill="none"/>`,
      };
    case "varal":
      return {
        w: 96,
        h: 64,
        originY: 0.95,
        outline: 0.9,
        body:
          `<rect x="4" y="10" width="4" height="52" fill="#7a4e2d"/><rect x="88" y="10" width="4" height="52" fill="#7a4e2d"/><path d="M6 14 Q48 24 90 14" stroke="#55555c" stroke-width="1.4" fill="none"/>` +
          `<rect x="16" y="16" width="14" height="18" fill="#e63946"/><rect x="36" y="19" width="12" height="22" fill="#3a86ff"/><rect x="54" y="19" width="16" height="14" fill="#ffd23f"/><rect x="74" y="16" width="10" height="16" fill="#2e7d32"/>`,
      };
    case "barracaCamping": {
      const c = variant === "azul" ? "#3a86ff" : variant === "verde" ? "#3aa655" : "#ff7a1a";
      return { w: 60, h: 44, originY: 0.92, outline: 1.1, body: `<path d="M4 40 Q30 -6 56 40 Z" fill="${c}"/><path d="M30 6 L22 40 H38 Z" fill="${shade(c, -0.3)}"/>` };
    }
    case "caixaSom":
      return { w: 28, h: 38, originY: 0.95, outline: 1, body: `<rect x="3" y="3" width="22" height="32" rx="3" fill="#2a2a35"/><circle cx="14" cy="24" r="7" fill="#55555c"/><circle cx="14" cy="24" r="3" fill="#ffd23f"/><circle cx="14" cy="10" r="3.5" fill="#55555c"/>` };
    case "mesaPiquenique":
      return { w: 64, h: 38, originY: 0.94, outline: 1, body: `<rect x="4" y="22" width="56" height="6" rx="2" fill="#b5732f"/><rect x="8" y="8" width="48" height="12" rx="2" fill="#c98a4b"/><rect x="12" y="20" width="4" height="14" fill="#7a4e2d"/><rect x="48" y="20" width="4" height="14" fill="#7a4e2d"/>` };
    case "cancela":
      return { w: 100, h: 56, originY: 0.95, outline: 1.1, body: `<rect x="4" y="18" width="22" height="34" rx="2" fill="#fffaf0"/><rect x="8" y="22" width="14" height="10" fill="#8ec5e8"/>` + Array.from({ length: 7 }, (_, i) => `<rect x="${26 + i * 10}" y="26" width="10" height="6" fill="${i % 2 ? "#ffffff" : "#e63946"}"/>`).join("") };
    case "quiosque": {
      const [a, b] = KIOSK[variant ?? "boteco"] ?? KIOSK.boteco;
      return {
        w: 76,
        h: 88,
        originY: 0.95,
        outline: 1.2,
        body:
          `<rect x="10" y="40" width="56" height="44" rx="2" fill="${shade(a, 0.5)}"/><rect x="10" y="58" width="56" height="26" fill="${a}"/>` +
          awningSvg(4, 26, 68, [a, b]) +
          `<rect x="20" y="44" width="5" height="12" rx="1" fill="#79a684"/><rect x="30" y="46" width="5" height="10" rx="1" fill="#dfad4d"/><rect x="40" y="44" width="5" height="12" rx="1" fill="#79a684"/><rect x="50" y="46" width="5" height="10" rx="1" fill="#c48a3a"/>` +
          `<path d="M6 26 L38 4 L70 26 Z" fill="${b}"/>`,
      };
    }
    case "pontoOnibus":
      return { w: 92, h: 66, originY: 0.95, outline: 1.1, body: `<rect x="6" y="12" width="4" height="50" fill="#55555c"/><rect x="82" y="12" width="4" height="50" fill="#55555c"/><rect x="2" y="6" width="88" height="10" rx="2" fill="#3a86c8"/><rect x="12" y="20" width="68" height="30" fill="#a8e0ff" fill-opacity="0.6"/><rect x="16" y="46" width="60" height="6" fill="#b5732f"/><text x="46" y="14" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="7" text-anchor="middle" fill="#fffaf0">PONTO DO POVO</text>` };
    case "tabela":
      return { w: 40, h: 100, originY: 0.97, outline: 1.1, body: `<rect x="18" y="20" width="5" height="78" fill="#55555c"/><rect x="4" y="4" width="32" height="22" rx="2" fill="#fffaf0"/><rect x="14" y="12" width="12" height="8" fill="none" stroke="#e63946" stroke-width="2"/><ellipse cx="20" cy="28" rx="8" ry="3" fill="none" stroke="#ff7a1a" stroke-width="2.5"/>` };
    case "caixasKits": {
      const cs = ["#ec5464", "#ef9b3c", "#f5df53", "#58b975", "#548bd3", "#9366bd"];
      const box = (x: number, y: number, i: number) => `<rect x="${x}" y="${y}" width="24" height="18" rx="2" fill="${cs[i % 6]}"/><rect x="${x + 9}" y="${y}" width="6" height="18" fill="#fff4d3"/>`;
      return { w: 60, h: 56, originY: 0.95, outline: 1.1, body: box(4, 34, 0) + box(30, 34, 1) + box(16, 16, 2) + box(32, 4, 3) + box(6, 4, 4) };
    }
    case "faixaCampus":
      return { w: 230, h: 90, originY: 0.97, outline: 1.2, body: `<rect x="8" y="4" width="5" height="84" fill="#7a4e2d"/><rect x="217" y="4" width="5" height="84" fill="#7a4e2d"/><rect x="13" y="8" width="204" height="30" rx="2" fill="#fffaf0"/>` + ["#e63946", "#ffd23f", "#2e7d32", "#3a86ff", "#7b4bd1"].map((c, i) => `<rect x="${13 + i * 40.8}" y="34" width="40.8" height="5" fill="${c}"/>`).join("") };
    case "cabeco":
      return { w: 16, h: 18, originY: 0.94, outline: 0.9, body: `<rect x="3" y="6" width="10" height="10" rx="2" fill="#3a3640"/><ellipse cx="8" cy="6" rx="6" ry="3" fill="#55555c"/>` };
    case "balcao":
      return { w: 310, h: 64, originY: 0.92, outline: 1.3, body: `<rect x="4" y="22" width="302" height="38" fill="#8a5a3a"/><rect x="2" y="14" width="306" height="12" rx="3" fill="#c98a4b"/>` + Array.from({ length: 7 }, (_, i) => `<rect x="${14 + i * 42}" y="30" width="30" height="22" rx="2" fill="#7a4e2d"/>`).join("") + `<rect x="230" y="2" width="8" height="14" rx="1" fill="#79a684"/><rect x="250" y="5" width="12" height="9" rx="1" fill="#fffaf0"/>` };
    case "banqueta":
      return { w: 18, h: 30, originY: 0.94, outline: 0.9, body: `<rect x="7" y="8" width="4" height="20" fill="#55555c"/><ellipse cx="9" cy="7" rx="8" ry="4" fill="#d62839"/><rect x="3" y="24" width="12" height="3" fill="#55555c"/>` };
    case "prateleira": {
      const bottles = Array.from({ length: 16 }, (_, i) => `<rect x="${12 + i * 15}" y="${i % 2 ? 12 : 44}" width="7" height="${i % 3 ? 22 : 18}" rx="2" fill="${["#79a684", "#dfad4d", "#c48a3a", "#8ec5e8"][i % 4]}"/>`).join("");
      return { w: 260, h: 84, originY: 0.98, outline: 1.1, body: `<rect x="4" y="34" width="252" height="6" fill="#7a4e2d"/><rect x="4" y="66" width="252" height="6" fill="#7a4e2d"/>${bottles}` };
    }
    case "jukebox":
      return { w: 48, h: 66, originY: 0.95, outline: 1.2, body: `<path d="M4 62 V20 Q24 -4 44 20 V62 Z" fill="#7b4bd1"/><path d="M10 40 V22 Q24 6 38 22 V40 Z" fill="#ffd23f"/><rect x="10" y="44" width="28" height="12" rx="2" fill="#2a2a35"/><circle cx="24" cy="30" r="5" fill="#e63946"/>` };
    case "guiche":
      return {
        w: 170,
        h: 78,
        originY: 0.92,
        outline: 1.3,
        body:
          `<rect x="4" y="34" width="162" height="40" fill="#b8a07a"/><rect x="2" y="28" width="166" height="10" rx="2" fill="#d9c7a7"/>` +
          `<rect x="40" y="2" width="90" height="28" fill="#a8e0ff" fill-opacity="0.7"/><path d="M40 2 H130 V30 H40 Z" fill="none" stroke="#55555c" stroke-width="2"/>` +
          `<rect x="62" y="44" width="46" height="18" rx="2" fill="#fffaf0"/><text x="85" y="57" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="10" text-anchor="middle" fill="${INK}">GUICHÊ ${variant ?? ""}</text>` +
          `<rect x="134" y="20" width="16" height="10" rx="2" fill="#c62835"/>`,
      };
    case "cadeiraFila":
      return { w: 30, h: 36, originY: 0.94, outline: 1, body: `<rect x="5" y="4" width="20" height="16" rx="3" fill="#2f6fd6"/><rect x="5" y="20" width="20" height="6" rx="2" fill="#3a86ff"/><rect x="7" y="26" width="3" height="8" fill="#55555c"/><rect x="20" y="26" width="3" height="8" fill="#55555c"/>` };
    case "painelSenha":
      return { w: 130, h: 46, originY: 0.98, outline: 1.2, body: `<rect x="4" y="4" width="122" height="38" rx="4" fill="#1e1424"/>` };
    case "pilhaPapel":
      return { w: 32, h: 40, originY: 0.94, outline: 1, body: Array.from({ length: 6 }, (_, i) => `<rect x="${3 + (i % 2) * 2}" y="${32 - i * 5}" width="24" height="5" fill="${i % 2 ? "#fffaf0" : "#efe6d2"}"/>`).join("") + `<rect x="10" y="2" width="12" height="6" rx="1" fill="#c62835"/>` };
    default:
      return propArt("lixeira");
  }
}

// ---------- itens soltos e decoração dos limites ----------

export function waterTile(): Art {
  return {
    w: 64,
    h: 32,
    body: `<rect width="64" height="32" fill="#3f8fd2"/><path d="M4 10 Q12 6 20 10 M36 22 Q44 18 52 22" stroke="#8cc8f2" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  };
}

export function cityTile(kind: "concreto" | "patio" | "quadra" | "ondas-cidade"): Art {
  switch (kind) {
    case "ondas-cidade":
      // calçadão de ondas em tons de areia: lembra Copacabana sem disputar atenção com o personagem
      return {
        w: 64,
        h: 32,
        body: `<rect width="64" height="32" fill="#e8dcc4"/><path d="M0 16 Q8 6 16 16 T32 16 T48 16 T64 16 V32 H0 Z" fill="#cdbb9a"/><path d="M0 16 Q8 6 16 16 T32 16 T48 16 T64 16" stroke="#bfae8c" stroke-width="1.2" fill="none"/>`,
      };
    case "concreto":
      return { w: 64, h: 64, body: `<rect width="64" height="64" fill="#c9c4bb"/><path d="M0 0.5 H64 M0.5 0 V64" stroke="#b3ada2" stroke-width="1.2"/><circle cx="20" cy="40" r="1.4" fill="#aaa397"/><circle cx="48" cy="14" r="1.2" fill="#aaa397"/>` };
    case "patio":
      return { w: 64, h: 64, body: `<rect width="64" height="64" fill="#5a5a66"/><circle cx="12" cy="18" r="1.2" fill="#6c6c78"/><circle cx="44" cy="40" r="1.4" fill="#6c6c78"/><circle cx="30" cy="56" r="1" fill="#6c6c78"/>` };
    case "quadra":
      return { w: 64, h: 64, body: `<rect width="64" height="64" fill="#3f9b7a"/>` };
  }
}

export function casinhaArt(color: string): Art {
  return {
    w: 30,
    h: 28,
    body: `<rect x="2" y="10" width="26" height="16" fill="${color}"/><path d="M0 11 L15 2 L30 11 Z" fill="#c9552f"/><rect x="7" y="15" width="6" height="6" fill="#8ec5e8"/><rect x="17" y="16" width="6" height="10" fill="#7a4e2d"/>`,
    outline: 0.9,
  };
}

export function navioArt(): Art {
  const boxes = ["#d1453b", "#2f6fd6", "#3aa655", "#f2c230", "#e0763b", "#7b4bd1"];
  return {
    w: 760,
    h: 190,
    body:
      `<path d="M10 110 H750 L700 180 H60 Z" fill="#c62835"/><path d="M30 140 H730 L712 166 H50 Z" fill="#2a2a35"/>` +
      `<text x="380" y="132" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="22" text-anchor="middle" fill="#fffaf0">DESTINO: CHINA · CARGA: O BRASIL</text>` +
      Array.from({ length: 16 }, (_, i) => `<rect x="${110 + (i % 8) * 60}" y="${i < 8 ? 76 : 44}" width="56" height="32" fill="${boxes[(i * 5) % 6]}"/>`).join("") +
      `<rect x="600" y="20" width="110" height="90" fill="#fffaf0"/><rect x="612" y="34" width="86" height="16" fill="#8ec5e8"/><rect x="640" y="0" width="22" height="24" fill="#c62835"/>` +
      star(380, 12, 0, "#fff"),
    outline: 1.6,
  };
}

/** Cadeado gigante e correntes de interdição, desenhados sobre portas. */
export function interdicaoArt(): Art {
  return {
    w: 120,
    h: 90,
    body:
      `<path d="M4 10 L116 80 M116 10 L4 80" stroke="#55505c" stroke-width="9" stroke-linecap="round"/>` +
      `<path d="M4 10 L116 80 M116 10 L4 80" stroke="#8a8494" stroke-width="3" stroke-dasharray="6 6" stroke-linecap="round"/>` +
      `<path d="M44 46 V36 C44 18 76 18 76 36 V46" fill="none" stroke="#9da8bd" stroke-width="9"/><rect x="34" y="44" width="52" height="40" rx="8" fill="#f5bf39"/><circle cx="60" cy="60" r="6" fill="#362838"/><path d="M58 62 H62 L64 74 H56 Z" fill="#362838"/>`,
    outline: 1.5,
  };
}
