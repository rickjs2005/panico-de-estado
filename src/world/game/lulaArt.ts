import type { Art } from "./art";

/** Objetos originais da sátira, sem imagens externas. */
export function lulaItemArt(id: "cadeado" | "kits" | "brasil-caixa" | "cachaca"): Art {
  if (id === "cadeado") return { w: 56, h: 64, outline: 1.5, body: `
    <path d="M13 29 V19 C13 -1 43 -1 43 19 V29" fill="none" stroke="#9da8bd" stroke-width="10"/>
    <rect x="4" y="27" width="48" height="33" rx="8" fill="#f5bf39"/>
    <path d="M8 49 H48 V55 H8" fill="#cb7927"/><circle cx="28" cy="41" r="5" fill="#362838"/>
    <path d="M26 43 H30 L32 52 H24 Z" fill="#362838"/>` };
  if (id === "kits") return { w: 62, h: 48, outline: 1.4, body: `
    <path d="M4 10 L18 2 H48 L60 10 L47 18 H4 Z" fill="#f9e4b5"/>
    <rect x="4" y="10" width="56" height="34" rx="3" fill="#eec97e"/>
    ${["#ec5464", "#ef9b3c", "#f5df53", "#58b975", "#548bd3", "#9366bd"].map((c, i) => `<rect x="7" y="${14 + i * 4}" width="50" height="4" fill="${c}"/>`).join("")}
    <rect x="23" y="2" width="10" height="42" fill="#fff4d3"/>
    <text x="28" y="35" font-family="sans-serif" font-size="9" font-weight="900" text-anchor="middle" fill="#38283b">KIT</text>` };
  if (id === "brasil-caixa") return { w: 66, h: 55, outline: 1.4, body: `
    <path d="M3 16 L18 5 H53 L63 16 Z" fill="#f7d48c"/>
    <rect x="3" y="16" width="60" height="35" rx="3" fill="#c69451"/>
    <path d="M20 19 L31 16 L41 20 L47 18 L50 28 L43 30 L39 42 L33 47 L29 38 L25 36 L25 28 L20 26 Z" fill="#3f9e5e"/>
    <rect x="5" y="42" width="20" height="7" rx="1" fill="#fff7df"/>
    <path d="M8 44 V47 M11 43 V48 M14 44 V48 M18 43 V47 M21 43 V48" stroke="#38283b" stroke-width="1"/>` };
  return { w: 28, h: 46, outline: 1.2, body: `
    <rect x="10" y="2" width="9" height="13" rx="2" fill="#6e9d74"/>
    <rect x="9" y="0" width="11" height="5" rx="1" fill="#d24639"/>
    <path d="M10 13 L4 21 V41 Q14 48 24 41 V21 L19 13" fill="#79a684"/>
    <path d="M6 27 H22 V40 Q14 44 6 40 Z" fill="#dfad4d"/>
    <rect x="6" y="23" width="16" height="13" rx="2" fill="#fff0d2"/>
    <text x="14" y="32" font-family="sans-serif" font-weight="900" font-size="7" text-anchor="middle" fill="#953339">51?</text>` };
}
