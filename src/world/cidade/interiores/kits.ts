import type { LookId } from "../../looks";
import type { Plan } from "./plan";

/**
 * Conjuntos de móveis reaproveitados pelos modelos. Coordenadas locais: x da esquerda,
 * y do topo do interior; `y` de um móvel é a base dele no chão. Móveis encostados na
 * parede do fundo usam `back(p)`.
 */

/** Base de um móvel encostado na parede do fundo (ou numa parede interna em `wallY`). */
export const back = (p: Plan, wallY?: number, depth = 30) => (wallY ?? p.wallH) + depth + 2;

export const PAREDES = ["#f4e1c1", "#cfe8d5", "#f7d6e0", "#d6e4f0", "#fbe7a1", "#e6d5f2", "#f2c6a0", "#d9ead3", "#fde2c8", "#c9e4de"];
export const MADEIRA = ["#c8955a", "#b9814a", "#d6a66b", "#a8734a"];
export const CERAMICA = ["#e8e2d4", "#d9e6ea", "#f0dcc8", "#e4e8d2"];
export const LADRILHO = ["#d98b6a", "#7fa7c9", "#9cc79a", "#e3b866"];

export const MORADORES: LookId[] = ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8"];
export const NOMES = ["Dona Lurdes", "Seu Dirceu", "Dona Penha", "Seu Jurandir", "Dona Socorro", "Seu Valdomiro", "Dona Graça", "Seu Arnaldo", "Dona Fátima", "Seu Bené", "Dona Zuleide", "Seu Tonho"];

/** Cozinha encostada na parede do fundo: geladeira, fogão, pia, filtro e mesa. */
export function cozinha(p: Plan, x0: number, x1: number, wallY: number, bottomY: number, opts: { mesa?: boolean; filtro?: boolean } = {}) {
  const y = back(p, wallY);
  const geladeira = p.prop("geladeira", x0 + 34, y, { variant: p.r.pick(["branca", "vermelha", "azul"]) });
  p.spot("geladeira", x0 + 34, y + 30, "Abrir a geladeira", {
    prop: geladeira,
    lines: p.r.pick([
      ["Só tem picanha coletiva e um pote de margarina com feijão.", "Geladeira cheia: o áudio da picanha virou verdade."],
      ["Uma garrafa d'água, três limões e um decreto congelado.", "Gelo do povo, para o povo."],
    ]),
  });
  const fogao = p.prop("fogao", x0 + 94, y);
  p.spot("fogao", x0 + 94, y + 30, "Mexer a panela", { prop: fogao, lines: ["Feijão no fogo. Cheiro de domingo coletivo.", "A panela de pressão apitou um hino."] });
  if (x1 - x0 > 230) {
    const pia = p.prop("pia", x0 + 172, y);
    p.spot("torneira", x0 + 172, y + 30, "Abrir a torneira", { prop: pia, lines: ["Água encanada estatal: sai com sotaque.", "Pinga, pinga… a torneira também é do povo."] });
  }
  if (opts.filtro !== false && x1 - x0 > 290) p.prop("filtro", x1 - 30, y - 6);
  if (opts.mesa !== false) {
    const mx = (x0 + x1) / 2 + 10;
    const my = Math.min(bottomY - 36, y + 96);
    p.prop("mesa", mx, my, { variant: p.r.pick(["toalha-xadrez", "toalha-florida", "madeira"]) });
    p.prop("cadeira", mx - 40, my - 4);
    p.prop("cadeira", mx + 40, my - 4);
  }
}

/** Sala com sofá de costas para a câmera, TV, tapete e um rádio. */
export function sala(p: Plan, x0: number, x1: number, wallY: number, bottomY: number, opts: { radio?: boolean; tv?: boolean } = {}) {
  const sx = x0 + (x1 - x0) * 0.38;
  const tvY = back(p, wallY, 20);
  if (opts.tv !== false) {
    const tv = p.prop("tv", sx, tvY);
    p.spot("tv", sx + 60, tvY + 26, "Ligar a TV", {
      prop: tv,
      lines: ["Jornal do Áudio: hoje choveu decreto.", "Novela das nove: “O Ministério do Áudio”.", "Futebol: Comunistas 3 × 3 Capitalistas. Empate coletivo."],
    });
  }
  const sofaY = Math.min(bottomY - 40, tvY + 120);
  p.prop("tapete", sx, sofaY - 40, { variant: p.r.pick(["vermelho", "azul", "verde", "amarelo"]) });
  p.prop("sofa", sx, sofaY, { variant: p.r.pick(["vermelho", "verde", "marrom", "azul"]) });
  p.spot("sentar", sx, sofaY + 24, "Sentar no sofá", { seat: { x: sx - 18, y: sofaY - 8, facing: "back" } });
  if (opts.radio !== false && x1 - x0 > 300) {
    const rx = x1 - 50;
    p.prop("mesa", rx, tvY + 14, { variant: "mesinha" });
    const radio = p.prop("radio", rx, tvY + 4);
    p.spot("radio", rx, tvY + 40, "Ligar o rádio", { prop: radio, lines: ["Rádio Coletiva FM: só toca música que todo mundo pediu.", "“A voz do Brasil hipotético”, agora 24 horas."] });
  }
  if (x1 - x0 > 260) p.prop("planta", x0 + 22, tvY);
}

/** Área de descanso: cama ou rede, armário e um abajur. */
export function descanso(p: Plan, x0: number, x1: number, wallY: number, bottomY: number) {
  const y = back(p, wallY);
  const arm = p.prop("armario", x1 - 46, y - 2, { variant: p.r.pick(["madeira", "branco"]) });
  p.spot("armario", x1 - 46, y + 28, "Abrir o armário", { prop: arm, lines: ["Roupas, um terno de casamento e 14 sacolas de sacolas.", "Achei um decreto antigo dobrado no fundo da gaveta."] });
  const cx = x0 + (x1 - x0) * 0.42;
  if (p.r.chance(0.45)) {
    const ry = Math.min(bottomY - 30, y + 80);
    p.prop("rede", cx, ry, { variant: p.r.pick(["listrada", "colorida"]) });
    p.spot("deitar", cx, ry + 24, "Deitar na rede", { seat: { x: cx, y: ry - 4, facing: "front" } });
  } else {
    const cy = Math.min(bottomY - 26, y + 92);
    p.prop("cama", cx, cy, { variant: p.r.pick(["azul", "rosa", "verde", "amarelo"]) });
    p.spot("deitar", cx + 56, cy - 18, "Deitar na cama", { seat: { x: cx, y: cy - 22, facing: "front" } });
  }
  p.prop("planta", x0 + 24, y - 6);
}

/** Fileira de cadeiras de espera. */
export function cadeiras(p: Plan, x0: number, n: number, y: number, step = 34, kind: "cadeiraFila" | "cadeira" = "cadeiraFila") {
  for (let i = 0; i < n; i++) p.prop(kind, x0 + i * step, y);
}

/** Mesa de escritório com cadeira atrás. */
export function mesaTrabalho(p: Plan, x: number, y: number, variant: "computador" | "telefone" | "maquina" | "carimbo" = "computador") {
  p.prop("cadeira", x, y - 26, { variant: "escritorio" });
  return p.prop("mesaEscritorio", x, y, { variant });
}

/** Fileira de móveis iguais encostados numa parede. */
export function fileira(p: Plan, kind: Parameters<Plan["prop"]>[0], x0: number, x1: number, y: number, step: number, variant?: (i: number) => string | undefined) {
  const ids: string[] = [];
  let i = 0;
  for (let x = x0; x <= x1; x += step) ids.push(p.prop(kind, x, y, { variant: variant?.(i++) }));
  return ids;
}

/** Morador genérico parado num ponto. */
export function morador(p: Plan, x: number, y: number, lines: string[], name?: string) {
  p.npc(p.r.pick(MORADORES), name ?? p.r.pick(NOMES), x, y, lines, { facing: "front" });
}
