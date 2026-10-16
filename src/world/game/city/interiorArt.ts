import type { CityPropKind, FloorKind } from "../../cidade/types";
import { esc, INK, shade, type Art, type PropArt } from "../art";

/**
 * Móveis e objetos dos interiores, no mesmo traço da rua: cores chapadas, tampo claro,
 * frente mais escura e contorno escuro. Cada desenho tem o ponto de apoio no chão
 * em `originY` (fração da altura).
 */

/** Caixa vista em 3/4: tampo (profundidade `d`) e frente (altura `h`). */
function box(x: number, y: number, w: number, d: number, h: number, color: string, rx = 2) {
  return `<rect x="${x}" y="${y + d}" width="${w}" height="${h}" rx="${rx}" fill="${shade(color, -0.12)}"/><rect x="${x}" y="${y}" width="${w}" height="${d}" rx="${rx}" fill="${shade(color, 0.12)}"/>`;
}
function legs(x0: number, x1: number, y: number, h: number, color = "#6b4a2a") {
  return `<rect x="${x0}" y="${y}" width="4" height="${h}" fill="${color}"/><rect x="${x1 - 4}" y="${y}" width="4" height="${h}" fill="${color}"/>`;
}
function txt(x: number, y: number, size: number, text: string, color = INK, anchor = "middle") {
  return `<text x="${x}" y="${y}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${size}" text-anchor="${anchor}" fill="${color}">${esc(text)}</text>`;
}

const SOFA: Record<string, string> = { vermelho: "#c94a4a", verde: "#4f9a6a", marrom: "#9a6a4a", azul: "#4a78c9" };
const BED: Record<string, string> = { azul: "#6fa8dc", rosa: "#f4a6c0", verde: "#93c47d", amarelo: "#f6d36b" };
const FRIDGE: Record<string, string> = { branca: "#f4f1ea", vermelha: "#d9534f", azul: "#7fb3d5" };
const RUG: Record<string, string> = { vermelho: "#c95b4a", azul: "#5b7fc9", verde: "#5ba370", amarelo: "#e3b74a" };
const PRODUCTS: Record<string, string[]> = {
  frutas: ["#f28c28", "#ffd23f", "#e63946", "#79b84a"],
  enlatados: ["#c94a4a", "#d9d4c8", "#4a78c9", "#e3b74a"],
  limpeza: ["#4ab3c9", "#79b84a", "#f4f1ea", "#c77dff"],
  biscoitos: ["#e3a54a", "#c94a4a", "#ffd23f", "#9a6a4a"],
  remedios: ["#f4f1ea", "#4ab3c9", "#e63946", "#79b84a"],
  livros: ["#c94a4a", "#4a78c9", "#79b84a", "#e3b74a", "#7b4bd1"],
  fitas: ["#2a2a35", "#55555c", "#e63946", "#ffd23f"],
  jornais: ["#f4f1ea", "#e9e2d0", "#d9d4c8", "#c9c2b0"],
};

export function interiorPropArt(kind: CityPropKind, variant?: string): PropArt | null {
  switch (kind) {
    case "sofa": {
      const c = SOFA[variant ?? "vermelho"] ?? SOFA.vermelho;
      // visto de costas: encosto alto voltado para a câmera
      return { w: 116, h: 58, originY: 0.95, outline: 1.2, body: `<rect x="4" y="10" width="108" height="22" rx="8" fill="${shade(c, 0.15)}"/><rect x="2" y="22" width="112" height="32" rx="6" fill="${c}"/><rect x="2" y="16" width="16" height="36" rx="6" fill="${shade(c, -0.1)}"/><rect x="98" y="16" width="16" height="36" rx="6" fill="${shade(c, -0.1)}"/><path d="M40 26 V50 M76 26 V50" stroke="${shade(c, -0.25)}" stroke-width="2"/>` };
    }
    case "poltrona":
      return { w: 50, h: 54, originY: 0.95, outline: 1.1, body: `<rect x="4" y="8" width="42" height="26" rx="8" fill="#b5784a"/><rect x="2" y="26" width="46" height="24" rx="6" fill="#9a6a4a"/>` };
    case "tv": {
      if (variant === "parede")
        return { w: 80, h: 70, originY: 0.96, outline: 1.2, body: `<rect x="36" y="44" width="8" height="24" fill="#55555c"/><rect x="4" y="4" width="72" height="44" rx="4" fill="#2a2a35"/><rect x="9" y="9" width="62" height="34" fill="#3d4a5a"/>` };
      return {
        w: 82,
        h: 78,
        originY: 0.96,
        outline: 1.2,
        body: box(4, 48, 74, 8, 20, "#9a6a4a") + `<rect x="12" y="6" width="58" height="44" rx="6" fill="#55505c"/><rect x="17" y="11" width="40" height="34" rx="4" fill="#3d4a5a"/><circle cx="63" cy="20" r="3" fill="#ffd23f"/><circle cx="63" cy="32" r="3" fill="#e63946"/><path d="M30 6 L22 -2 M44 6 L54 -4" stroke="#55555c" stroke-width="2"/>`,
      };
    }
    case "radio":
      return { w: 40, h: 30, originY: 0.95, outline: 1, body: `<rect x="3" y="8" width="34" height="20" rx="4" fill="#c98a4b"/><circle cx="13" cy="18" r="6" fill="#55505c"/><rect x="22" y="12" width="12" height="6" rx="1" fill="#fff3a0"/><path d="M8 8 L4 0" stroke="#55555c" stroke-width="1.6"/>` };
    case "geladeira": {
      const c = FRIDGE[variant ?? "branca"] ?? FRIDGE.branca;
      return { w: 50, h: 100, originY: 0.97, outline: 1.2, body: box(3, 4, 44, 10, 82, c, 5) + `<path d="M3 44 H47" stroke="${shade(c, -0.3)}" stroke-width="2"/><rect x="38" y="20" width="4" height="16" rx="2" fill="${shade(c, -0.4)}"/><rect x="38" y="52" width="4" height="22" rx="2" fill="${shade(c, -0.4)}"/><rect x="12" y="24" width="10" height="8" fill="#ffd23f"/>` };
    }
    case "fogao":
      return { w: 52, h: 62, originY: 0.96, outline: 1.1, body: box(3, 8, 46, 14, 36, variant === "industrial" ? "#b9bec6" : "#f4f1ea") + `<circle cx="15" cy="15" r="4" fill="#3a3640"/><circle cx="37" cy="15" r="4" fill="#3a3640"/><rect x="9" y="28" width="34" height="18" rx="2" fill="#55505c"/><rect x="14" y="0" width="24" height="12" rx="3" fill="#55555c"/><rect x="12" y="2" width="28" height="4" rx="2" fill="#7a7480"/>` };
    case "pia":
      return { w: 78, h: 62, originY: 0.96, outline: 1.1, body: box(3, 20, 72, 12, 26, "#e9e2d0") + `<rect x="12" y="22" width="30" height="8" rx="3" fill="#a8c4d4"/><path d="M27 22 V12 H36" stroke="#9aa0a8" stroke-width="3" fill="none"/><path d="M14 36 V56 M40 36 V56 M64 36 V56" stroke="#c9c2b0" stroke-width="1.5"/><rect x="50" y="10" width="16" height="12" rx="2" fill="#f4f1ea"/>` };
    case "mesa": {
      if (variant === "mesinha") return { w: 46, h: 34, originY: 0.94, outline: 1, body: box(3, 8, 40, 10, 6, "#b9814a") + legs(6, 40, 22, 10) };
      if (variant === "comprida") return { w: 210, h: 50, originY: 0.94, outline: 1.2, body: box(3, 8, 204, 20, 8, "#d6a66b") + legs(8, 202, 34, 12) + legs(100, 110, 34, 12) };
      if (variant === "professor") return { w: 80, h: 50, originY: 0.94, outline: 1.1, body: box(3, 10, 74, 16, 18, "#9a6a4a") + `<rect x="10" y="4" width="16" height="8" fill="#f4f1ea"/><circle cx="60" cy="8" r="5" fill="#e63946"/>` };
      if (variant === "volantes") return { w: 90, h: 50, originY: 0.94, outline: 1.1, body: box(3, 10, 84, 16, 8, "#e9e2d0") + legs(8, 82, 34, 14) + `<rect x="12" y="12" width="14" height="10" fill="#fffaf0"/><rect x="30" y="13" width="14" height="10" fill="#fffaf0"/><rect x="50" y="12" width="14" height="10" fill="#fffaf0"/>` };
      const top = variant === "toalha-xadrez" ? "#e8e2d4" : variant === "toalha-florida" ? "#f4c6d0" : variant === "praca" ? "#f4f1ea" : "#c8955a";
      const extra = variant === "toalha-xadrez" ? Array.from({ length: 5 }, (_, i) => `<rect x="${6 + i * 16}" y="10" width="8" height="18" fill="#d9534f" opacity="0.7"/>`).join("") : variant === "toalha-florida" ? `<circle cx="20" cy="18" r="4" fill="#e63946"/><circle cx="46" cy="14" r="4" fill="#ffd23f"/><circle cx="68" cy="20" r="4" fill="#3a86ff"/>` : "";
      return { w: 90, h: 52, originY: 0.94, outline: 1.1, body: box(3, 8, 84, 20, 8, top) + extra + legs(8, 82, 36, 14) + `<rect x="36" y="2" width="16" height="10" rx="3" fill="#f4f1ea"/>` };
    }
    case "cadeira":
      if (variant === "escritorio") return { w: 30, h: 44, originY: 0.94, outline: 1, body: `<rect x="6" y="4" width="18" height="18" rx="4" fill="#3a3a45"/><rect x="4" y="20" width="22" height="8" rx="3" fill="#55555c"/><rect x="13" y="28" width="4" height="8" fill="#55555c"/><path d="M5 40 L15 34 L25 40" stroke="#55555c" stroke-width="3" fill="none"/>` };
      return { w: 24, h: 40, originY: 0.94, outline: 1, body: `<rect x="4" y="2" width="16" height="18" rx="2" fill="#a8734a"/><rect x="3" y="18" width="18" height="7" rx="2" fill="#c8955a"/><rect x="4" y="25" width="3" height="12" fill="#6b4a2a"/><rect x="17" y="25" width="3" height="12" fill="#6b4a2a"/>` };
    case "cama": {
      const c = BED[variant ?? "azul"] ?? BED.azul;
      return { w: 92, h: 82, originY: 0.96, outline: 1.2, body: `<rect x="2" y="2" width="88" height="24" rx="4" fill="#8a5a3a"/>` + box(4, 18, 84, 46, 12, "#f4f1ea") + `<rect x="10" y="22" width="30" height="14" rx="5" fill="#ffffff"/><rect x="4" y="40" width="84" height="36" rx="3" fill="${c}"/><path d="M4 48 H88" stroke="${shade(c, -0.2)}" stroke-width="2"/>` };
    }
    case "rede": {
      const stripes = variant === "colorida" ? ["#e63946", "#ffd23f", "#3a86ff", "#2e7d32"] : ["#f28c28", "#fff4d3", "#f28c28", "#fff4d3"];
      return { w: 112, h: 66, originY: 0.94, outline: 1.1, body: `<rect x="2" y="4" width="6" height="60" fill="#7a4e2d"/><rect x="104" y="4" width="6" height="60" fill="#7a4e2d"/><path d="M8 12 Q56 64 104 12" stroke="#c9b28a" stroke-width="1.5" fill="none"/>` + stripes.map((c, i) => `<path d="M${16 + i * 4} ${22 + i * 4} Q56 ${58 - i * 3} ${96 - i * 4} ${22 + i * 4}" stroke="${c}" stroke-width="5" fill="none"/>`).join("") };
    }
    case "armario": {
      const c = variant === "branco" ? "#f4f1ea" : "#a8734a";
      return { w: 76, h: 104, originY: 0.97, outline: 1.2, body: box(3, 4, 70, 10, 86, c) + `<path d="M38 14 V100" stroke="${shade(c, -0.35)}" stroke-width="2"/><circle cx="33" cy="56" r="2.5" fill="#f2c230"/><circle cx="43" cy="56" r="2.5" fill="#f2c230"/>` };
    }
    case "estante": {
      const cs = PRODUCTS[variant ?? "livros"] ?? PRODUCTS.livros;
      let items = "";
      for (let s = 0; s < 3; s++) for (let i = 0; i < 9; i++) items += `<rect x="${8 + i * 9}" y="${18 + s * 26}" width="${6 + ((i + s) % 2)}" height="${variant === "remedios" ? 12 : 18}" rx="1" fill="${cs[(i + s * 2) % cs.length]}"/>`;
      return { w: 96, h: 100, originY: 0.97, outline: 1.2, body: box(3, 4, 90, 8, 86, "#9a6a4a") + `<rect x="7" y="14" width="82" height="76" fill="#6b4a2a"/>` + items + [36, 62].map((y) => `<rect x="7" y="${y + 2}" width="82" height="4" fill="#b9814a"/>`).join("") };
    }
    case "planta":
      return { w: 36, h: 60, originY: 0.96, outline: 1, body: `<path d="M10 40 H26 L24 56 H12 Z" fill="#c9552f"/><path d="M18 40 Q4 26 8 10 M18 40 Q20 18 18 4 M18 40 Q32 26 30 12" stroke="#3f9b4a" stroke-width="6" fill="none" stroke-linecap="round"/>` };
    case "tapete": {
      const c = RUG[variant ?? "vermelho"] ?? RUG.vermelho;
      return { w: 130, h: 54, originY: 0.5, outline: 0, body: `<ellipse cx="65" cy="27" rx="62" ry="24" fill="${c}"/><ellipse cx="65" cy="27" rx="48" ry="17" fill="none" stroke="${shade(c, 0.35)}" stroke-width="3"/><ellipse cx="65" cy="27" rx="20" ry="7" fill="${shade(c, 0.25)}"/>` };
    }
    case "colchao": {
      const c = variant === "rosa" ? "#f4a6c0" : "#8fb8e8";
      return { w: 92, h: 44, originY: 0.6, outline: 1, body: `<rect x="2" y="6" width="88" height="34" rx="6" fill="${c}"/><rect x="6" y="10" width="24" height="12" rx="4" fill="#ffffff"/>` };
    }
    case "quadro": {
      const inner =
        variant === "retrato"
          ? `<circle cx="27" cy="20" r="8" fill="#f1c7a3"/><rect x="15" y="28" width="24" height="10" fill="#c62835"/><path d="M15 30 L39 36" stroke="#ffd23f" stroke-width="3"/>`
          : variant === "brasao"
            ? `<rect x="8" y="8" width="38" height="30" fill="#1f6e44"/><path d="M27 11 L41 16 V26 Q41 34 27 38 Q13 34 13 26 V16 Z" fill="#ffd23f" stroke="#7a5a10" stroke-width="1.5"/><polygon points="27,16 29.5,23 36,23 31,27 33,34 27,30 21,34 23,27 18,23 24.5,23" fill="#c62835"/>`
            : variant === "decreto"
              ? `<rect x="8" y="8" width="38" height="30" fill="#fff8e1"/><path d="M12 14 H42 M12 19 H42 M12 24 H36" stroke="#7a6a50" stroke-width="2"/><circle cx="36" cy="31" r="5.5" fill="#b62f3e"/><path d="M33 31 H39 M36 28 V34" stroke="#fff4ce" stroke-width="1.6"/>`
              : variant === "revogado"
                ? `<rect x="8" y="8" width="38" height="30" fill="#fff8e1"/><path d="M12 14 H42 M12 19 H42 M12 24 H36" stroke="#b9ad92" stroke-width="2"/><path d="M10 34 L44 12" stroke="#1f8a4c" stroke-width="3.5"/><circle cx="37" cy="31" r="5.5" fill="#1f8a4c"/><path d="M34.5 31 L36.2 33 L39.6 29" stroke="#fffaf0" stroke-width="1.8" fill="none"/>`
                : variant === "mapa"
            ? `<rect x="8" y="8" width="38" height="30" fill="#b5e48c"/><circle cx="18" cy="18" r="3" fill="#e63946"/><circle cx="30" cy="26" r="3" fill="#e63946"/><circle cx="38" cy="14" r="3" fill="#e63946"/>`
            : variant === "bandeira"
              ? `<rect x="8" y="8" width="38" height="30" fill="#c62835"/><polygon points="27,12 30,20 38,20 31,25 34,33 27,28 20,33 23,25 16,20 24,20" fill="#ffd23f"/>`
              : variant === "festa"
                ? `<rect x="8" y="8" width="38" height="30" fill="#7b4bd1"/><circle cx="20" cy="22" r="6" fill="#ffd23f"/><circle cx="34" cy="20" r="5" fill="#3a86ff"/>`
                : `<rect x="8" y="8" width="38" height="30" fill="#8ec5e8"/><path d="M8 32 L20 20 L30 30 L38 22 L46 30 V38 H8 Z" fill="#4cae55"/><circle cx="38" cy="16" r="4" fill="#ffd23f"/>`;
      return { w: 54, h: 46, originY: 1, outline: 1, body: `<rect x="2" y="2" width="50" height="42" rx="2" fill="#a8734a"/><rect x="6" y="6" width="42" height="34" fill="#fffaf0"/>${inner}` };
    }
    case "janela":
      return { w: 76, h: 60, originY: 1, outline: 1.1, body: `<rect x="4" y="4" width="68" height="48" rx="3" fill="#fffaf0"/><rect x="9" y="9" width="58" height="38" fill="#8ec5e8"/><path d="M38 9 V47 M9 28 H67" stroke="#fffaf0" stroke-width="3"/><path d="M12 22 L24 10" stroke="#d4ecff" stroke-width="3"/><rect x="0" y="50" width="76" height="6" rx="2" fill="#e9e2d0"/>` };
    case "relogio":
      if (variant === "ponto") return { w: 40, h: 56, originY: 1, outline: 1, body: `<rect x="4" y="4" width="32" height="46" rx="4" fill="#c9c2b0"/><circle cx="20" cy="18" r="10" fill="#fffaf0"/><path d="M20 18 V11 M20 18 H26" stroke="${INK}" stroke-width="2"/><rect x="10" y="34" width="20" height="10" fill="#55505c"/>` };
      return { w: 34, h: 40, originY: 1, outline: 1, body: `<circle cx="17" cy="17" r="14" fill="#fffaf0"/><circle cx="17" cy="17" r="14" fill="none" stroke="#c62835" stroke-width="3"/><path d="M17 17 V8 M17 17 H24" stroke="${INK}" stroke-width="2.4"/>` };
    case "mesaEscritorio": {
      const top =
        variant === "computador"
          ? `<rect x="30" y="0" width="32" height="22" rx="2" fill="#3a3a45"/><rect x="33" y="3" width="26" height="15" fill="#5d8fb0"/><rect x="42" y="22" width="8" height="5" fill="#55555c"/><rect x="28" y="24" width="30" height="5" rx="1" fill="#d9d4c8"/>`
          : variant === "telefone"
            ? `<rect x="14" y="14" width="22" height="10" rx="3" fill="#c62835"/><rect x="12" y="10" width="26" height="6" rx="3" fill="#a81f2b"/><rect x="50" y="12" width="28" height="12" fill="#fffaf0"/>`
            : variant === "maquina"
              ? `<rect x="26" y="8" width="40" height="18" rx="3" fill="#3a5a4a"/><rect x="30" y="2" width="32" height="10" fill="#fffaf0"/><path d="M30 20 H62" stroke="#c9c2b0" stroke-width="2" stroke-dasharray="3 2"/>`
              : `<rect x="16" y="14" width="18" height="10" rx="2" fill="#7a4e2d"/><rect x="22" y="6" width="6" height="10" fill="#5a3a20"/><rect x="44" y="14" width="34" height="10" fill="#fffaf0"/><rect x="48" y="10" width="26" height="6" fill="#efe6d2"/>`;
      return { w: 96, h: 64, originY: 0.95, outline: 1.2, body: box(3, 24, 90, 16, 20, "#9a6a4a") + top };
    }
    case "arquivo":
      return { w: 44, h: 76, originY: 0.96, outline: 1.1, body: box(2, 4, 40, 8, 62, "#8a929c") + [18, 36, 54].map((y) => `<rect x="6" y="${y}" width="32" height="14" rx="1" fill="#9aa2ac"/><rect x="16" y="${y + 5}" width="12" height="3" rx="1" fill="#55555c"/>`).join("") };
    case "mesaReuniao":
      return { w: 210, h: 66, originY: 0.95, outline: 1.3, body: box(3, 10, 204, 36, 12, "#7a4e2d") + legs(10, 200, 56, 8, "#4a2e1a") + `<rect x="30" y="18" width="20" height="14" fill="#fffaf0"/><rect x="90" y="16" width="20" height="14" fill="#fffaf0"/><rect x="150" y="18" width="20" height="14" fill="#fffaf0"/><circle cx="125" cy="26" r="5" fill="#8ec5e8"/>` };
    case "bebedouro":
      return { w: 30, h: 60, originY: 0.96, outline: 1, body: `<rect x="5" y="2" width="20" height="18" rx="6" fill="#8ec5e8"/>` + box(4, 18, 22, 6, 34, "#d9d4c8") + `<rect x="10" y="26" width="10" height="4" fill="#55555c"/>` };
    case "bancoIgreja": {
      const c = variant === "claro" ? "#d6a66b" : "#8a5a3a";
      return { w: 148, h: 44, originY: 0.94, outline: 1.1, body: `<rect x="4" y="4" width="140" height="16" rx="2" fill="${shade(c, 0.1)}"/>` + box(2, 18, 144, 8, 12, c) + legs(6, 142, 36, 6, shade(c, -0.4)) };
    }
    case "altar":
      return { w: 150, h: 76, originY: 0.95, outline: 1.3, body: box(4, 26, 142, 18, 26, "#f4ead4") + `<rect x="4" y="44" width="142" height="10" fill="#c62835"/><rect x="70" y="2" width="10" height="26" fill="#f2c230"/><rect x="62" y="8" width="26" height="6" fill="#f2c230"/><rect x="30" y="14" width="6" height="14" fill="#fffaf0"/><path d="M33 14 Q30 8 33 4 Q36 8 33 14" fill="#ffb02e"/><rect x="114" y="14" width="6" height="14" fill="#fffaf0"/><path d="M117 14 Q114 8 117 4 Q120 8 117 14" fill="#ffb02e"/>` };
    case "pulpito":
      return { w: 46, h: 66, originY: 0.96, outline: 1.1, body: `<path d="M4 8 H42 L38 18 H8 Z" fill="#a8734a"/>` + box(8, 16, 30, 6, 40, "#8a5a3a") + `<rect x="18" y="28" width="10" height="10" fill="#f2c230"/>` };
    case "sino":
      return { w: 58, h: 92, originY: 0.96, outline: 1.2, body: `<path d="M6 88 L14 8 H44 L52 88" stroke="#7a4e2d" stroke-width="6" fill="none"/><rect x="10" y="4" width="38" height="8" fill="#5a3a20"/><path d="M18 50 Q18 20 29 20 Q40 20 40 50 L44 58 H14 Z" fill="#f2c230"/><circle cx="29" cy="60" r="4" fill="#b8860b"/>` };
    case "orgao":
      return { w: 88, h: 74, originY: 0.96, outline: 1.2, body: Array.from({ length: 9 }, (_, i) => `<rect x="${8 + i * 8}" y="${4 + Math.abs(4 - i) * 4}" width="6" height="${36 - Math.abs(4 - i) * 4}" fill="#d9c27a"/>`).join("") + box(4, 38, 80, 10, 22, "#7a4e2d") + `<rect x="10" y="40" width="68" height="6" fill="#fffaf0"/><path d="M14 40 V46 M22 40 V46 M30 40 V46 M38 40 V46 M46 40 V46 M54 40 V46 M62 40 V46 M70 40 V46" stroke="${INK}" stroke-width="1"/>` };
    case "carteira":
      return { w: 40, h: 46, originY: 0.94, outline: 1, body: `<rect x="6" y="2" width="28" height="12" rx="2" fill="#4a78c9"/><rect x="8" y="12" width="3" height="10" fill="#55555c"/><rect x="29" y="12" width="3" height="10" fill="#55555c"/>` + box(3, 20, 34, 10, 6, "#d6a66b") + legs(6, 34, 36, 8, "#55555c") };
    case "lousa":
      return { w: 210, h: 84, originY: 1, outline: 1.3, body: `<rect x="2" y="2" width="206" height="72" rx="3" fill="#8a5a3a"/><rect x="8" y="8" width="194" height="60" fill="#2f5a46"/><rect x="40" y="72" width="130" height="6" fill="#b9814a"/><rect x="60" y="70" width="10" height="4" fill="#fffaf0"/>` };
    case "gondola": {
      const cs = PRODUCTS[variant ?? "frutas"] ?? PRODUCTS.frutas;
      let items = "";
      for (let s = 0; s < 2; s++) for (let i = 0; i < 12; i++) items += `<rect x="${8 + i * 11}" y="${14 + s * 24}" width="8" height="${s ? 14 : 16}" rx="2" fill="${cs[(i + s) % cs.length]}"/>`;
      return { w: 150, h: 82, originY: 0.96, outline: 1.2, body: box(3, 6, 144, 8, 70, "#d9d4c8") + `<rect x="5" y="10" width="140" height="62" fill="#efeae0"/>` + items + `<rect x="5" y="32" width="140" height="4" fill="#9aa0a8"/><rect x="5" y="56" width="140" height="4" fill="#9aa0a8"/><rect x="14" y="62" width="24" height="8" fill="#ffd23f"/>` + txt(26, 69, 6, "R$ ?") };
    }
    case "caixaRegistradora":
      return { w: 96, h: 70, originY: 0.95, outline: 1.2, body: box(3, 26, 90, 16, 24, "#c9c2b0") + `<rect x="54" y="6" width="32" height="24" rx="3" fill="#55505c"/><rect x="58" y="10" width="24" height="8" fill="#9be7a0"/><rect x="58" y="20" width="24" height="8" fill="#7a7480"/><rect x="10" y="28" width="36" height="10" fill="#3a3640"/>` };
    case "freezer":
      return { w: 96, h: 60, originY: 0.96, outline: 1.2, body: box(3, 8, 90, 20, 28, "#f4f1ea") + `<rect x="7" y="11" width="82" height="14" fill="#a8d8ff" opacity="0.8"/><rect x="12" y="13" width="10" height="8" fill="#ffd23f"/><rect x="26" y="13" width="10" height="8" fill="#e63946"/><rect x="40" y="13" width="10" height="8" fill="#3a86ff"/>` + txt(48, 48, 8, "GELADO DO POVO") };
    case "vitrinePao":
      return { w: 156, h: 70, originY: 0.95, outline: 1.2, body: box(3, 30, 150, 12, 24, "#c98a4b") + `<rect x="6" y="4" width="144" height="28" rx="4" fill="#d8f0ff" opacity="0.85"/>` + Array.from({ length: 8 }, (_, i) => `<ellipse cx="${20 + i * 17}" cy="22" rx="7" ry="5" fill="${i % 3 === 2 ? "#f6d36b" : "#d9944a"}"/>`).join("") };
    case "forno":
      return { w: 78, h: 84, originY: 0.96, outline: 1.2, body: `<path d="M8 82 V36 Q39 0 70 36 V82 Z" fill="#c9552f"/><path d="M22 82 V52 Q39 34 56 52 V82 Z" fill="#3a2a2a"/><path d="M28 80 Q39 64 50 80" fill="#ff7a1a"/><rect x="34" y="4" width="10" height="16" fill="#8a8494"/>` };
    case "maquina": {
      const c = variant === "embaladora" ? "#3a86c8" : "#e07a3a";
      return { w: 100, h: 104, originY: 0.96, outline: 1.3, body: box(4, 30, 92, 18, 52, c) + `<rect x="30" y="6" width="40" height="30" fill="${shade(c, -0.2)}"/><rect x="40" y="0" width="20" height="10" fill="#55555c"/><circle cx="76" cy="62" r="8" fill="#ffd23f"/><circle cx="24" cy="62" r="6" fill="#e63946"/><rect x="14" y="80" width="72" height="4" fill="#ffd23f"/>` + txt(50, 76, 7, variant === "embaladora" ? "EMBALA O POVO" : "PRENSA DO POVO", "#fffaf0") };
    }
    case "empilhadeira":
      return { w: 60, h: 78, originY: 0.95, outline: 1.2, body: `<rect x="40" y="4" width="4" height="56" fill="#55555c"/><rect x="46" y="4" width="4" height="56" fill="#55555c"/><rect x="36" y="56" width="22" height="4" fill="#3a3640"/>` + box(4, 28, 36, 10, 30, "#f2c230") + `<rect x="8" y="12" width="26" height="18" fill="none" stroke="#3a3640" stroke-width="3"/><circle cx="12" cy="70" r="6" fill="#25222b"/><circle cx="34" cy="70" r="6" fill="#25222b"/>` };
    case "caixaPapelao":
      return { w: 44, h: 52, originY: 0.95, outline: 1, body: box(2, 22, 40, 10, 18, "#c9915a") + box(6, 4, 30, 8, 14, "#d9a066") + `<path d="M21 4 V12 M22 22 V32" stroke="#a8734a" stroke-width="2"/>` };
    case "painelFerramentas":
      return { w: 124, h: 74, originY: 1, outline: 1.2, body: `<rect x="2" y="2" width="120" height="64" rx="2" fill="#c9b28a"/>` + Array.from({ length: 24 }, (_, i) => `<circle cx="${10 + (i % 8) * 15}" cy="${12 + Math.floor(i / 8) * 20}" r="1.4" fill="#8a7a5a"/>`).join("") + `<path d="M16 14 V44 M30 14 L40 44 M56 12 V40 M76 14 Q86 20 76 30 M100 12 V46" stroke="#55555c" stroke-width="4" stroke-linecap="round"/><rect x="92" y="10" width="16" height="8" fill="#e63946"/>` };
    case "caixaEletronico":
      return { w: 46, h: 84, originY: 0.96, outline: 1.1, body: box(3, 6, 40, 8, 68, "#1f6e44") + `<rect x="9" y="18" width="28" height="18" fill="#9be7a0"/><rect x="11" y="42" width="24" height="14" fill="#d9d4c8"/><rect x="13" y="62" width="20" height="4" fill="#3a3640"/>` + txt(23, 13, 5, "PIX", "#fffaf0") };
    case "cofre":
      return { w: 78, h: 92, originY: 0.96, outline: 1.3, body: box(3, 6, 72, 10, 72, "#55555c") + `<circle cx="39" cy="48" r="16" fill="#8a8494"/><circle cx="39" cy="48" r="10" fill="#3a3640"/><path d="M39 38 V58 M29 48 H49" stroke="#ffd23f" stroke-width="2"/>` + txt(39, 80, 7, "DO POVO", "#ffd23f") };
    case "painelLoteria":
      return { w: 164, h: 76, originY: 1, outline: 1.2, body: `<rect x="2" y="2" width="160" height="66" rx="4" fill="#2a6fdb"/>` + txt(82, 18, 10, "MEGA-BOATO", "#ffd23f") + [0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${22 + i * 24}" cy="44" r="10" fill="#fffaf0"/>` + txt(22 + i * 24, 48, 9, "13")).join("") };
    case "rotativa":
      return { w: 212, h: 112, originY: 0.96, outline: 1.3, body: box(4, 40, 204, 20, 46, "#55606b") + [40, 90, 140].map((x) => `<circle cx="${x}" cy="44" r="18" fill="#8a929c"/><circle cx="${x}" cy="44" r="7" fill="#3a3640"/>`).join("") + `<path d="M20 40 Q100 -10 190 40" stroke="#fffaf0" stroke-width="8" fill="none"/>` + txt(106, 80, 9, "IMPRENSA OFICIAL", "#ffd23f") };
    case "mesaPingPong":
      return { w: 120, h: 72, originY: 0.94, outline: 1.2, body: box(4, 8, 112, 44, 8, "#2e7d6b") + `<path d="M60 8 V52" stroke="#fffaf0" stroke-width="2"/><rect x="4" y="26" width="112" height="6" fill="#fffaf0" opacity="0.8"/>` + legs(10, 110, 60, 10, "#55555c") + `<circle cx="34" cy="20" r="3" fill="#ff7a1a"/>` };
    case "beliche":
      return { w: 98, h: 114, originY: 0.97, outline: 1.2, body: `<rect x="4" y="4" width="6" height="106" fill="#8a5a3a"/><rect x="88" y="4" width="6" height="106" fill="#8a5a3a"/>` + box(8, 24, 82, 14, 8, "#7fb3d5") + box(8, 74, 82, 14, 8, "#f4a6c0") + `<rect x="14" y="20" width="22" height="8" rx="3" fill="#ffffff"/><rect x="14" y="70" width="22" height="8" rx="3" fill="#ffffff"/>` };
    case "maquinaLavar":
      return { w: 46, h: 58, originY: 0.96, outline: 1, body: box(3, 4, 40, 8, 44, "#f4f1ea") + `<circle cx="23" cy="34" r="12" fill="#8ec5e8"/><circle cx="23" cy="34" r="12" fill="none" stroke="#9aa0a8" stroke-width="3"/>` };
    case "elevador":
      return { w: 90, h: 106, originY: 0.96, outline: 1.2, body: `<rect x="4" y="4" width="82" height="98" fill="#c9c2b0"/><rect x="12" y="18" width="32" height="82" fill="#9aa2ac"/><rect x="46" y="18" width="32" height="82" fill="#9aa2ac"/><rect x="34" y="6" width="22" height="10" rx="2" fill="#1e1424"/>` + txt(45, 14, 7, "13", "#ff4d4d") + `<rect x="20" y="40" width="50" height="18" fill="#fffaf0"/>` + txt(45, 52, 6, "EM MANUTENÇÃO") };
    case "caixasCorreio":
      return { w: 114, h: 66, originY: 0.96, outline: 1.1, body: `<rect x="2" y="2" width="110" height="56" rx="2" fill="#b9814a"/>` + Array.from({ length: 10 }, (_, i) => `<rect x="${7 + (i % 5) * 21}" y="${7 + Math.floor(i / 5) * 25}" width="18" height="20" fill="#d6a66b"/><rect x="${11 + (i % 5) * 21}" y="${11 + Math.floor(i / 5) * 25}" width="10" height="3" fill="#55555c"/>`).join("") };
    case "filtro":
      return { w: 28, h: 46, originY: 0.95, outline: 1, body: `<ellipse cx="14" cy="12" rx="10" ry="9" fill="#c9734a"/><ellipse cx="14" cy="30" rx="11" ry="12" fill="#b5653f"/><rect x="18" y="32" width="8" height="3" fill="#8a8494"/>` };
    case "ventilador":
      return { w: 34, h: 68, originY: 0.96, outline: 1, body: `<rect x="15" y="28" width="4" height="36" fill="#9aa0a8"/><ellipse cx="17" cy="64" rx="12" ry="3" fill="#55555c"/><circle cx="17" cy="18" r="15" fill="#d9eaf5"/><circle cx="17" cy="18" r="15" fill="none" stroke="#9aa0a8" stroke-width="2"/><path d="M17 18 L10 8 M17 18 L28 16 M17 18 L14 30" stroke="#6fa8dc" stroke-width="5" stroke-linecap="round"/>` };
    case "raioX":
      return { w: 136, h: 84, originY: 0.95, outline: 1.3, body: box(4, 40, 128, 16, 22, "#3a3640") + `<rect x="34" y="6" width="68" height="44" rx="4" fill="#c9c2b0"/><rect x="40" y="18" width="56" height="26" fill="#2a2a35"/><path d="M4 50 H132" stroke="#55555c" stroke-width="3" stroke-dasharray="6 4"/>` + txt(68, 15, 7, "RAIO-X DO PAÍS") };
    case "painelControle":
      return { w: 190, h: 84, originY: 0.95, outline: 1.3, body: [20, 70, 120].map((x, i) => `<rect x="${x}" y="4" width="46" height="30" rx="2" fill="#2a2a35"/><rect x="${x + 4}" y="8" width="38" height="22" fill="${["#5d8fb0", "#3a7a5a", "#7a4a5a"][i]}"/>`).join("") + box(4, 34, 182, 18, 26, "#8a929c") + Array.from({ length: 10 }, (_, i) => `<circle cx="${18 + i * 17}" cy="44" r="3.5" fill="${["#ffd23f", "#e63946", "#3aa655"][i % 3]}"/>`).join("") };
    case "portaPaletes": {
      const caixas = variant === "pecas" ? ["#9aa2ac", "#c9b28a", "#7fb3d5"] : ["#c9915a", "#d9a066", "#b5732f"];
      let items = "";
      for (let s = 0; s < 3; s++) for (let i = 0; i < 6; i++) items += `<rect x="${12 + i * 48}" y="${14 + s * 34}" width="40" height="${variant === "pecas" ? 16 : 24}" rx="1" fill="${caixas[(i + s) % 3]}"/>`;
      return { w: 304, h: 124, originY: 0.97, outline: 1.3, body: `<rect x="4" y="4" width="6" height="116" fill="#e07a3a"/><rect x="294" y="4" width="6" height="116" fill="#e07a3a"/><rect x="150" y="4" width="6" height="116" fill="#e07a3a"/>` + [40, 74, 108].map((y) => `<rect x="4" y="${y}" width="296" height="5" fill="#3a6bc8"/>`).join("") + items };
    }
    case "mesaTelefones":
      return { w: 164, h: 66, originY: 0.95, outline: 1.2, body: box(3, 22, 158, 18, 20, "#55606b") + [16, 56, 96, 136].map((x, i) => `<rect x="${x}" y="${12 + (i % 2) * 2}" width="22" height="12" rx="3" fill="${["#c62835", "#ffd23f", "#3a86ff", "#3aa655"][i]}"/><rect x="${x - 2}" y="${8 + (i % 2) * 2}" width="26" height="6" rx="3" fill="${shade(["#c62835", "#ffd23f", "#3a86ff", "#3aa655"][i], -0.25)}"/>`).join("") };
    case "telao":
      return { w: 224, h: 104, originY: 1, outline: 1.3, body: `<rect x="2" y="2" width="220" height="92" rx="4" fill="#2a2a35"/><rect x="10" y="10" width="204" height="70" fill="#3d4a5a"/><circle cx="24" cy="88" r="3" fill="#e63946"/>` };
    case "violao":
      return { w: 26, h: 56, originY: 0.95, outline: 1, body: `<rect x="11" y="2" width="4" height="26" fill="#5a3a20"/><ellipse cx="13" cy="34" rx="9" ry="8" fill="#c98a4b"/><ellipse cx="13" cy="46" rx="11" ry="9" fill="#c98a4b"/><circle cx="13" cy="40" r="3" fill="#3a2a2a"/>` };
    case "fritadeira":
      return { w: 68, h: 64, originY: 0.96, outline: 1.1, body: box(3, 18, 62, 14, 28, "#b9bec6") + `<rect x="10" y="20" width="22" height="10" fill="#d9a24a"/><rect x="36" y="20" width="22" height="10" fill="#d9a24a"/><path d="M14 18 V6 H28 M40 18 V6 H54" stroke="#55555c" stroke-width="2" fill="none"/>` };
    case "compressor":
      return { w: 46, h: 54, originY: 0.95, outline: 1, body: `<ellipse cx="23" cy="40" rx="20" ry="10" fill="#c62835"/><rect x="3" y="26" width="40" height="14" fill="#c62835"/><ellipse cx="23" cy="26" rx="20" ry="8" fill="#e05a5a"/><rect x="16" y="6" width="14" height="14" rx="2" fill="#55555c"/><circle cx="23" cy="12" r="4" fill="#fffaf0"/>` };
    case "carroOficina": {
      const c = { azul: "#3a78c9", verde: "#4f9a6a", amarelo: "#e3b74a" }[variant ?? "azul"] ?? "#3a78c9";
      return { w: 164, h: 100, originY: 0.95, outline: 1.3, body: `<rect x="4" y="80" width="156" height="12" fill="#f2c230"/><rect x="20" y="70" width="10" height="14" fill="#55555c"/><rect x="134" y="70" width="10" height="14" fill="#55555c"/>` + `<path d="M14 66 V44 L40 40 L56 20 H112 L132 40 L152 44 V66 Z" fill="${c}"/><path d="M60 24 H84 V40 H48 Z M88 24 H108 L124 40 H88 Z" fill="#a8e0ff"/><path d="M118 40 L152 44 V30 L132 32 Z" fill="${shade(c, 0.3)}"/><circle cx="44" cy="68" r="12" fill="#25222b"/><circle cx="122" cy="68" r="12" fill="#25222b"/><circle cx="44" cy="68" r="5" fill="#9aa0a8"/><circle cx="122" cy="68" r="5" fill="#9aa0a8"/>` };
    }
    case "lojinha": {
      const c = { rosa: "#f28dc0", azul: "#6fa8dc", amarelo: "#f6d36b" }[variant ?? "rosa"] ?? "#f28dc0";
      return { w: 170, h: 114, originY: 0.96, outline: 1.3, body: `<rect x="4" y="8" width="162" height="24" rx="3" fill="${shade(c, -0.15)}"/>` + box(4, 30, 162, 10, 66, c) + `<rect x="14" y="44" width="70" height="44" fill="#d8f0ff" opacity="0.9"/><rect x="92" y="44" width="62" height="52" fill="#fffaf0"/>` + [22, 40, 58].map((x, i) => `<rect x="${x}" y="${56 + (i % 2) * 6}" width="12" height="${24 - (i % 2) * 6}" fill="${["#e63946", "#3a86ff", "#ffd23f"][i]}"/>`).join("") };
    }
    case "escadaRolante":
      return { w: 82, h: 166, originY: 0.97, outline: 1.3, body: `<path d="M6 160 L56 10 H76 L26 160 Z" fill="#9aa2ac"/>` + Array.from({ length: 12 }, (_, i) => `<path d="M${14 + i * 4.2} ${150 - i * 12.5} H${32 + i * 4.2}" stroke="#55555c" stroke-width="2"/>`).join("") + `<path d="M4 158 L54 8 M28 158 L78 8" stroke="#3a3640" stroke-width="4"/>` + txt(41, 100, 7, "PARADA", "#e63946") };
    case "vaso":
      return { w: 28, h: 42, originY: 0.95, outline: 1, body: `<path d="M6 18 H22 L20 38 H8 Z" fill="#3a86c8"/><circle cx="10" cy="12" r="6" fill="#e63946"/><circle cx="18" cy="10" r="6" fill="#ffd23f"/><circle cx="14" cy="5" r="5" fill="#f28dc0"/>` };
    case "quadroAvisos":
      return { w: 108, h: 70, originY: 0.96, outline: 1.1, body: `<rect x="10" y="50" width="4" height="18" fill="#7a4e2d"/><rect x="94" y="50" width="4" height="18" fill="#7a4e2d"/><rect x="2" y="2" width="104" height="52" rx="2" fill="#a8734a"/><rect x="6" y="6" width="96" height="44" fill="#c9a777"/><rect x="74" y="8" width="20" height="16" fill="#fff3a0" transform="rotate(6 84 16)"/>` };
    case "vitral": {
      const glass = ["#c62835", "#3a86ff", "#ffd23f", "#2f9e5a", "#7b4bd1"];
      return {
        w: 56,
        h: 100,
        originY: 1,
        outline: 1.1,
        body:
          `<path d="M3 98 V38 Q3 4 28 4 Q53 4 53 38 V98 Z" fill="#e9dcc5"/>` +
          `<path d="M9 94 V38 Q9 11 28 11 Q47 11 47 38 V94 Z" fill="#35507a"/>` +
          [0, 1, 2, 3, 4, 5].map((i) => `<rect x="${11 + (i % 2) * 18}" y="${30 + Math.floor(i / 2) * 22}" width="16" height="20" rx="2" fill="${glass[i % 5]}" opacity="0.9"/>`).join("") +
          `<path d="M28 11 V94 M9 52 H47" stroke="#e9dcc5" stroke-width="2.5"/><circle cx="28" cy="26" r="7" fill="#ffd23f" stroke="#e9dcc5" stroke-width="2"/>`,
      };
    }
    case "castical": {
      const lit = variant !== "apagado";
      const flame = (x: number, y: number) => (lit ? `<path d="M${x} ${y} Q${x - 4} ${y - 6} ${x} ${y - 12} Q${x + 4} ${y - 6} ${x} ${y} Z" fill="#ffb02e"/><path d="M${x} ${y - 1} Q${x - 1.6} ${y - 4} ${x} ${y - 7} Q${x + 1.6} ${y - 4} ${x} ${y - 1} Z" fill="#fff3a0"/>` : "");
      return {
        w: 40,
        h: 78,
        originY: 0.96,
        outline: 1,
        body:
          `<ellipse cx="20" cy="73" rx="12" ry="4" fill="#b8860b"/><rect x="18" y="30" width="4" height="42" fill="#d9a520"/>` +
          `<path d="M6 26 Q6 36 20 36 Q34 36 34 26" stroke="#d9a520" stroke-width="3" fill="none"/>` +
          [6, 20, 34].map((x) => `<rect x="${x - 3}" y="16" width="6" height="12" rx="1" fill="#fffaf0"/>` + flame(x, 15)).join(""),
      };
    }
    case "cavalete":
      return {
        w: 60,
        h: 46,
        originY: 0.95,
        outline: 1,
        body:
          `<path d="M8 44 L14 12 M52 44 L46 12" stroke="#55555c" stroke-width="4" stroke-linecap="round"/>` +
          `<rect x="4" y="6" width="52" height="16" rx="2" fill="#ffd23f"/>` +
          Array.from({ length: 7 }, (_, i) => `<path d="M${8 + i * 8} 22 L${14 + i * 8} 6 H${18 + i * 8} L${12 + i * 8} 22 Z" fill="#1e1424"/>`).join("") +
          `<rect x="4" y="22" width="52" height="3" fill="#b62f3e"/>`,
      };
    case "tapeteCorredor": {
      const [cor, tam] = (variant ?? "vermelho-medio").split("-");
      const c = ({ vermelho: "#b8323b", verde: "#2f7a52", azul: "#3b5fa8" } as Record<string, string>)[cor] ?? "#b8323b";
      const h = ({ curto: 150, medio: 250, longo: 340 } as Record<string, number>)[tam] ?? 250;
      return {
        w: 64,
        h,
        originY: 0.5,
        outline: 0,
        body:
          `<rect x="2" y="2" width="60" height="${h - 4}" rx="3" fill="${c}"/>` +
          `<rect x="6" y="6" width="52" height="${h - 12}" fill="none" stroke="#e8c15a" stroke-width="3"/>` +
          `<rect x="12" y="12" width="40" height="${h - 24}" fill="none" stroke="${shade(c, 0.3)}" stroke-width="1.6"/>` +
          Array.from({ length: Math.floor((h - 40) / 34) }, (_, i) => `<path d="M32 ${26 + i * 34} l7 8 l-7 8 l-7 -8 Z" fill="#e8c15a"/>`).join(""),
      };
    }
    case "balizaFila": {
      const fita = variant === "fita";
      return {
        w: fita ? 62 : 16,
        h: 40,
        originY: 0.96,
        outline: 1,
        body:
          `<ellipse cx="8" cy="37" rx="7" ry="3" fill="#55555c"/><rect x="6.5" y="10" width="3" height="27" fill="#9da8bd"/><circle cx="8" cy="8" r="4.5" fill="#c62835"/>` +
          (fita ? `<path d="M9 14 H62 V19 H9 Z" fill="#c62835"/><path d="M9 14 H62" stroke="#fffaf0" stroke-width="1.4"/>` : ""),
      };
    }
    case "totemSenha":
      return {
        w: 36,
        h: 62,
        originY: 0.95,
        outline: 1.1,
        body: box(3, 14, 30, 8, 40, "#c62835", 4) + `<rect x="7" y="4" width="22" height="14" rx="3" fill="#1e1424"/>` + txt(18, 15, 7, "SENHA", "#ff4d4d") + `<rect x="9" y="34" width="18" height="12" rx="2" fill="#fffaf0"/><rect x="12" y="46" width="12" height="5" rx="1" fill="#1e1424"/>`,
      };
    case "cadeadao":
      return {
        w: 64,
        h: 84,
        originY: 0.95,
        outline: 1.3,
        body:
          `<path d="M16 40 V26 C16 4 48 4 48 26 V40" fill="none" stroke="#9da8bd" stroke-width="10"/>` +
          box(6, 36, 52, 10, 36, "#f5bf39", 7) +
          `<circle cx="32" cy="62" r="7" fill="#362838"/><rect x="29" y="64" width="6" height="12" rx="2" fill="#362838"/>` +
          txt(32, 53, 7, "3 TON", "#7a5a10"),
      };
    case "ferramenta": {
      const v = variant ?? "martelo";
      if (v === "pincel")
        return { w: 44, h: 36, originY: 0.9, outline: 1, body: `<rect x="6" y="20" width="28" height="7" rx="3" fill="#a8734a"/><path d="M32 17 H42 L44 30 H32 Z" fill="#e63946"/><path d="M32 17 L26 14 V32 L32 30 Z" fill="#c9c2b0"/>` };
      if (v === "chave-inglesa")
        return { w: 48, h: 36, originY: 0.9, outline: 1, body: `<rect x="6" y="20" width="30" height="7" rx="3" fill="#9da8bd"/><path d="M34 12 H46 V32 H34 L38 22 Z" fill="#9da8bd"/><circle cx="12" cy="23" r="3" fill="#55555c"/>` };
      return { w: 44, h: 36, originY: 0.9, outline: 1, body: `<rect x="18" y="14" width="7" height="22" rx="2" fill="#a8734a"/><rect x="8" y="6" width="26" height="12" rx="3" fill="#9da8bd"/><rect x="8" y="6" width="26" height="4" fill="#c9c2d0"/>` };
    }
    case "caixaBrasil":
      return {
        w: 72,
        h: 60,
        originY: 0.94,
        outline: 1.2,
        body:
          box(4, 12, 64, 12, 36, "#d9a86a", 3) +
          `<path d="M20 34 L28 26 L38 28 L46 24 L54 32 L50 44 L40 52 L28 48 Z" fill="#3aa655" stroke="#1e1424" stroke-width="1.5"/><circle cx="38" cy="38" r="5" fill="#ffd23f"/>` +
          txt(36, 22, 8, "BRASIL", "#7a4e2d"),
      };
    case "etiquetadora":
      return {
        w: 44,
        h: 46,
        originY: 0.94,
        outline: 1.1,
        body: box(4, 14, 36, 10, 24, "#55555c", 4) + `<rect x="9" y="8" width="26" height="10" rx="2" fill="#fffaf0"/>` + txt(22, 16, 6, "ETIQ.", "#c62835") + `<rect x="12" y="32" width="20" height="5" rx="1" fill="#fff4ce"/>`,
      };
    case "alavanca": {
      const on = variant !== "vermelha";
      const c = on ? "#2f9e5a" : "#c62835";
      return {
        w: 44,
        h: 56,
        originY: 0.95,
        outline: 1.1,
        body:
          box(4, 30, 36, 8, 18, "#55555c", 3) +
          `<rect x="9" y="26" width="26" height="6" rx="2" fill="#2a2a35"/>` +
          `<path d="M22 28 L${on ? 12 : 32} 8" stroke="#b8b8c0" stroke-width="5" stroke-linecap="round"/>` +
          `<circle cx="${on ? 12 : 32}" cy="7" r="6" fill="${c}" stroke="#1e1424" stroke-width="1.5"/>` +
          `<circle cx="22" cy="44" r="4" fill="${c}"/>`,
      };
    }
    case "cafezinho":
      return {
        w: 60,
        h: 54,
        originY: 0.95,
        outline: 1.1,
        body:
          box(3, 26, 54, 8, 8, "#a8734a") + legs(6, 54, 42, 10) +
          `<rect x="10" y="6" width="14" height="24" rx="4" fill="#c62835"/><rect x="12" y="2" width="10" height="6" rx="2" fill="#55555c"/>` +
          `<rect x="32" y="20" width="8" height="8" rx="1.5" fill="#fffaf0"/><rect x="44" y="20" width="8" height="8" rx="1.5" fill="#fffaf0"/>`,
      };
    // ---------- rua ----------
    case "canteiro":
      return { w: 76, h: 34, originY: 0.9, outline: 1, body: box(3, 14, 70, 10, 8, "#c9c2b0") + Array.from({ length: 7 }, (_, i) => `<circle cx="${10 + i * 9.5}" cy="${12 + (i % 2) * 3}" r="5" fill="${["#e63946", "#ffd23f", "#f28dc0", "#ffffff", "#c77dff"][i % 5]}"/><path d="M${10 + i * 9.5} ${16 + (i % 2) * 3} V22" stroke="#3f9b4a" stroke-width="2"/>`).join("") };
    case "horta":
      return { w: 86, h: 40, originY: 0.9, outline: 1, body: box(3, 10, 80, 22, 6, "#7a4e2d") + Array.from({ length: 8 }, (_, i) => `<path d="M${10 + i * 9.5} ${24} Q${8 + i * 9.5} ${12} ${12 + i * 9.5} ${8}" stroke="#4cae55" stroke-width="4" fill="none"/>`).join("") + `<rect x="58" y="0" width="20" height="9" fill="#fffaf0"/>` + txt(68, 7, 4.6, "HORTA DO POVO") };
    case "cachorro":
      return { w: 34, h: 30, originY: 0.9, outline: 1, body: `<ellipse cx="16" cy="18" rx="11" ry="7" fill="#c98a4b"/><circle cx="26" cy="11" r="6" fill="#c98a4b"/><path d="M29 6 L32 2 L31 9 Z" fill="#8a5a3a"/><circle cx="28" cy="10" r="1.3" fill="${INK}"/><path d="M5 16 Q0 10 3 6" stroke="#c98a4b" stroke-width="3" fill="none"/><rect x="9" y="22" width="3" height="6" fill="#8a5a3a"/><rect x="20" y="22" width="3" height="6" fill="#8a5a3a"/><rect x="20" y="13" width="9" height="3" fill="#c62835"/>` };
    case "bicicleta":
      return { w: 46, h: 32, originY: 0.9, outline: 0.9, body: `<circle cx="10" cy="22" r="8" fill="none" stroke="#2a2a35" stroke-width="2.4"/><circle cx="36" cy="22" r="8" fill="none" stroke="#2a2a35" stroke-width="2.4"/><path d="M10 22 L20 10 H32 L36 22 M20 10 L24 22 L32 10" stroke="${variant === "azul" ? "#3a86ff" : "#e63946"}" stroke-width="2.6" fill="none"/><rect x="16" y="6" width="9" height="3" fill="#2a2a35"/>` };
    case "bandeirolas": {
      const flags = Array.from({ length: 14 }, (_, i) => `<path d="M${8 + i * 14} ${16 + Math.sin(i / 2) * 4} l6 12 l6 -12 Z" fill="${["#e63946", "#ffd23f", "#3a86ff", "#2e7d32", "#f28dc0"][i % 5]}"/>`).join("");
      return { w: 210, h: 120, originY: 0.97, outline: 0.9, body: `<rect x="2" y="10" width="4" height="108" fill="#7a4e2d"/><rect x="204" y="10" width="4" height="108" fill="#7a4e2d"/><path d="M4 14 Q105 34 206 14" stroke="#55555c" stroke-width="1.2" fill="none"/>${flags}` };
    }
    case "carrinhoPipoca":
      return { w: 50, h: 66, originY: 0.94, outline: 1.1, body: `<rect x="6" y="6" width="38" height="28" rx="3" fill="#fff4d3"/><rect x="6" y="6" width="38" height="8" fill="#e63946"/>` + Array.from({ length: 8 }, (_, i) => `<circle cx="${12 + (i % 4) * 8}" cy="${22 + Math.floor(i / 4) * 6}" r="3" fill="#fffaf0" stroke="#e3b74a"/>`).join("") + box(4, 34, 42, 8, 14, "#c62835") + `<circle cx="12" cy="60" r="5" fill="#2a2a35"/><circle cx="38" cy="60" r="5" fill="#2a2a35"/>` + txt(25, 13, 6, "PIPOCA", "#fffaf0") };
    case "bicicletario":
      return { w: 96, h: 34, originY: 0.9, outline: 1, body: Array.from({ length: 5 }, (_, i) => `<path d="M${10 + i * 19} 30 V12 Q${19 + i * 19} 2 ${28 + i * 19} 12 V30" stroke="#9aa0a8" stroke-width="3" fill="none"/>`).join("") + `<rect x="2" y="28" width="92" height="4" fill="#7a7480"/>` };
    case "muroBaixo": {
      const c = variant === "amarelo" ? "#f2d06b" : variant === "azul" ? "#8fb8e8" : "#e9a8a0";
      return { w: 124, h: 40, originY: 0.9, outline: 1, body: box(2, 8, 120, 8, 22, c) + `<path d="M12 22 Q20 14 30 22 T48 22" stroke="#7b4bd1" stroke-width="3" fill="none"/>` + txt(86, 30, 7, "É DO POVO", "#c62835") };
    }
    default:
      return null;
  }
}

/** Pisos claros e neutros; cada interior tinge com a própria cor. */
export function floorTile(kind: FloorKind): Art {
  switch (kind) {
    case "taco":
      return { w: 48, h: 48, body: `<rect width="48" height="48" fill="#ffffff"/>` + [0, 12, 24, 36].map((y, i) => `<rect x="${i % 2 ? -12 : 0}" y="${y}" width="60" height="12" fill="none" stroke="#000" stroke-opacity="0.12" stroke-width="1"/><path d="M${i % 2 ? 12 : 24} ${y} V${y + 12}" stroke="#000" stroke-opacity="0.12"/>`).join("") };
    case "ceramica":
      return { w: 40, h: 40, body: `<rect width="40" height="40" fill="#ffffff"/><path d="M0 0.5 H40 M0.5 0 V40" stroke="#000" stroke-opacity="0.13" stroke-width="1.2"/>` };
    case "ladrilho":
      return { w: 40, h: 40, body: `<rect width="40" height="40" fill="#ffffff"/><path d="M20 4 L36 20 L20 36 L4 20 Z" fill="#000" fill-opacity="0.1"/><circle cx="20" cy="20" r="4" fill="#000" fill-opacity="0.12"/><path d="M0 0.5 H40 M0.5 0 V40" stroke="#000" stroke-opacity="0.1"/>` };
    case "piso-bar":
      return { w: 32, h: 32, body: `<rect width="32" height="32" fill="#f4efe4"/><rect width="16" height="16" fill="#c94a3a"/><rect x="16" y="16" width="16" height="16" fill="#c94a3a"/>` };
    case "piso-reparticao":
      return { w: 32, h: 32, body: `<rect width="32" height="32" fill="#ffffff"/><path d="M0 0.5 H32 M0.5 0 V32" stroke="#000" stroke-opacity="0.12" stroke-width="1"/>` };
    case "concreto":
      return { w: 64, h: 64, body: `<rect width="64" height="64" fill="#ffffff"/><path d="M0 0.5 H64 M0.5 0 V64" stroke="#000" stroke-opacity="0.1" stroke-width="1.2"/><circle cx="20" cy="40" r="1.4" fill="#000" fill-opacity="0.12"/><circle cx="48" cy="14" r="1.2" fill="#000" fill-opacity="0.12"/>` };
    case "carpete":
      return { w: 24, h: 24, body: `<rect width="24" height="24" fill="#ffffff"/><circle cx="6" cy="6" r="1.2" fill="#000" fill-opacity="0.1"/><circle cx="18" cy="18" r="1.2" fill="#000" fill-opacity="0.1"/>` };
    case "marmore":
      return { w: 64, h: 64, body: `<rect width="64" height="64" fill="#ffffff"/><path d="M0 0.5 H64 M0.5 0 V64" stroke="#000" stroke-opacity="0.1"/><path d="M10 44 L22 36 L30 40" stroke="#000" stroke-opacity="0.05" stroke-width="1.5" fill="none"/>` };
    case "azulejo":
      return { w: 24, h: 24, body: `<rect width="24" height="24" fill="#ffffff"/><path d="M0 0.5 H24 M0.5 0 V24" stroke="#000" stroke-opacity="0.14"/>` };
  }
}
