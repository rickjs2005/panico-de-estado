import type { Point, Rect } from "../types";
import { BUILDINGS, ROADS, citySolids, doorPoint, type Solid } from "./index";
import { CITY } from "./layout";

/**
 * Navegação a pé da cidade: uma grade de células sobre o mapa e uma busca de caminho (A*) que
 * prefere calçada e faixa de pedestre ao asfalto. Serve aos moradores que vão de casa ao trabalho
 * e voltam; o jogador anda livre e não usa isto.
 *
 * A grade é montada uma vez, a partir das mesmas colisões do jogo (`citySolids`), então o que o
 * jogador não atravessa o morador também não atravessa.
 */

const CELULA = 12;
const FOLGA = 9; // raio do morador: afasta o caminho das quinas
const COLS = Math.ceil(CITY.w / CELULA);
const LINS = Math.ceil(CITY.h / CELULA);

let bloqueado: Uint8Array | null = null;
let custo: Float32Array | null = null;

function montar() {
  if (bloqueado && custo) return;
  const blk = new Uint8Array(COLS * LINS);
  const cst = new Float32Array(COLS * LINS).fill(1);
  const marca = (r: Rect, f: (i: number) => void, m = 0) => {
    const x0 = Math.max(0, Math.floor((r.x - m) / CELULA));
    const y0 = Math.max(0, Math.floor((r.y - m) / CELULA));
    const x1 = Math.min(COLS - 1, Math.floor((r.x + r.w + m) / CELULA));
    const y1 = Math.min(LINS - 1, Math.floor((r.y + r.h + m) / CELULA));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) f(y * COLS + x);
  };
  // asfalto custa mais: o morador só atravessa a rua perto dos cruzamentos (faixas de pedestre)
  for (const r of ROADS) marca(r.rect, (i) => (cst[i] = 4));
  for (let i = 0; i < ROADS.length; i++) {
    for (let j = i + 1; j < ROADS.length; j++) {
      const a = ROADS[i].rect;
      const b = ROADS[j].rect;
      const x0 = Math.max(a.x, b.x);
      const y0 = Math.max(a.y, b.y);
      const x1 = Math.min(a.x + a.w, b.x + b.w);
      const y1 = Math.min(a.y + a.h, b.y + b.h);
      if (x1 > x0 && y1 > y0) marca({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, (k) => (cst[k] = 1), 46);
    }
  }
  for (const s of citySolids() as Solid[]) marca(s, (i) => (blk[i] = 1), FOLGA);
  // a porta de cada prédio e o chão logo à frente sempre são livres
  for (const b of BUILDINGS) {
    const d = doorPoint(b);
    marca({ x: d.x - 10, y: d.y - 18, w: 20, h: 26 }, (i) => (blk[i] = 0));
  }
  bloqueado = blk;
  custo = cst;
}

const idx = (x: number, y: number) => Math.max(0, Math.min(LINS - 1, Math.floor(y / CELULA))) * COLS + Math.max(0, Math.min(COLS - 1, Math.floor(x / CELULA)));

export function livre(x: number, y: number): boolean {
  montar();
  return !bloqueado![idx(x, y)];
}

/** Célula livre mais próxima de um ponto (anéis crescentes). */
function celulaLivre(x: number, y: number): number | null {
  montar();
  const cx = Math.floor(x / CELULA);
  const cy = Math.floor(y / CELULA);
  for (let r = 0; r < 14; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= COLS || ny >= LINS) continue;
        if (!bloqueado![ny * COLS + nx]) return ny * COLS + nx;
      }
    }
  }
  return null;
}

const centro = (i: number): Point => ({ x: (i % COLS) * CELULA + CELULA / 2, y: Math.floor(i / COLS) * CELULA + CELULA / 2 });

/** Heap binário mínimo, para a fila de prioridade do A*. */
class Heap {
  private ids: number[] = [];
  private pri: number[] = [];
  get tamanho() {
    return this.ids.length;
  }
  push(id: number, p: number) {
    this.ids.push(id);
    this.pri.push(p);
    let i = this.ids.length - 1;
    while (i > 0) {
      const pai = (i - 1) >> 1;
      if (this.pri[pai] <= this.pri[i]) break;
      [this.ids[pai], this.ids[i]] = [this.ids[i], this.ids[pai]];
      [this.pri[pai], this.pri[i]] = [this.pri[i], this.pri[pai]];
      i = pai;
    }
  }
  pop(): number {
    const topo = this.ids[0];
    const ultimoId = this.ids.pop()!;
    const ultimoPri = this.pri.pop()!;
    if (this.ids.length) {
      this.ids[0] = ultimoId;
      this.pri[0] = ultimoPri;
      let i = 0;
      for (;;) {
        const e = i * 2 + 1;
        const d = e + 1;
        let m = i;
        if (e < this.ids.length && this.pri[e] < this.pri[m]) m = e;
        if (d < this.ids.length && this.pri[d] < this.pri[m]) m = d;
        if (m === i) break;
        [this.ids[m], this.ids[i]] = [this.ids[i], this.ids[m]];
        [this.pri[m], this.pri[i]] = [this.pri[i], this.pri[m]];
        i = m;
      }
    }
    return topo;
  }
}

/** Linha reta livre entre dois pontos (amostra a cada meia célula). */
function linhaLivre(a: Point, b: Point): boolean {
  const d = Math.hypot(b.x - a.x, b.y - a.y);
  const n = Math.ceil(d / (CELULA / 2));
  for (let i = 1; i < n; i++) {
    const t = i / n;
    if (!livre(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)) return false;
  }
  return true;
}

const VIZ = [
  [1, 0, 1],
  [-1, 0, 1],
  [0, 1, 1],
  [0, -1, 1],
  [1, 1, 1.4142],
  [1, -1, 1.4142],
  [-1, 1, 1.4142],
  [-1, -1, 1.4142],
] as const;

/**
 * Caminho a pé entre dois pontos, já simplificado em trechos retos.
 * Devolve `null` se não houver caminho.
 */
export function caminho(de: Point, para: Point): Point[] | null {
  montar();
  const s = celulaLivre(de.x, de.y);
  const t = celulaLivre(para.x, para.y);
  if (s === null || t === null) return null;
  const alvo = centro(t);
  const h = (i: number) => {
    const c = centro(i);
    return Math.hypot(c.x - alvo.x, c.y - alvo.y) / CELULA;
  };
  const g = new Float32Array(COLS * LINS).fill(Infinity);
  const pai = new Int32Array(COLS * LINS).fill(-1);
  const fechado = new Uint8Array(COLS * LINS);
  const heap = new Heap();
  g[s] = 0;
  heap.push(s, h(s));
  let achou = false;
  while (heap.tamanho) {
    const cur = heap.pop();
    if (fechado[cur]) continue;
    fechado[cur] = 1;
    if (cur === t) {
      achou = true;
      break;
    }
    const cx = cur % COLS;
    const cy = (cur / COLS) | 0;
    for (const [dx, dy, c] of VIZ) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= LINS) continue;
      const ni = ny * COLS + nx;
      if (bloqueado![ni] || fechado[ni]) continue;
      // diagonal só se as duas laterais estiverem livres (não corta quina)
      if (dx !== 0 && dy !== 0 && (bloqueado![cy * COLS + nx] || bloqueado![ny * COLS + cx])) continue;
      const ng = g[cur] + c * custo![ni];
      if (ng < g[ni]) {
        g[ni] = ng;
        pai[ni] = cur;
        heap.push(ni, ng + h(ni));
      }
    }
  }
  if (!achou) return null;
  const bruto: Point[] = [];
  for (let i = t; i !== -1; i = pai[i]) bruto.push(centro(i));
  bruto.reverse();
  // o último ponto é o destino pedido, não o centro da célula
  bruto[bruto.length - 1] = { x: para.x, y: para.y };
  // simplifica: pula pontos enquanto a linha reta continuar livre
  const out: Point[] = [bruto[0]];
  let ancora = 0;
  for (let i = 2; i < bruto.length; i++) {
    if (!linhaLivre(bruto[ancora], bruto[i])) {
      out.push(bruto[i - 1]);
      ancora = i - 1;
    }
  }
  out.push(bruto[bruto.length - 1]);
  return out;
}

export function comprimento(p: Point[]): number {
  let n = 0;
  for (let i = 1; i < p.length; i++) n += Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y);
  return n;
}
