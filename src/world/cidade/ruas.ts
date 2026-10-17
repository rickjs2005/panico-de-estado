import type { Point, Rect } from "../types";
import { ROADS as ROADS_LULA } from "./layout";
import type { RoadDef } from "./types";

/**
 * Rede de ruas para o trânsito: cruzamentos (nós) e trechos de rua entre eles (arestas, uma por
 * sentido). Sai dos retângulos de `ROADS`, então a rua que o jogador vê é a rua em que os carros
 * andam. Cada sentido tem uma faixa deslocada para a direita do eixo (mão direita); nos
 * cruzamentos o carro faz uma curva (reta, direita ou esquerda) até a faixa da rua escolhida.
 */

export interface No {
  id: string;
  x: number;
  y: number;
  /** Meia largura do cruzamento: onde as faixas terminam (linha de retenção). */
  r: number;
  saidas: Aresta[];
  /** Quantas ruas se encontram aqui: com 3 ou mais, só um carro entra por vez. */
  grau: number;
  /** Cruzamentos vizinhos viram um só para a vez (evita travar entre dois cruzamentos colados). */
  grupo: Grupo;
}

export interface Grupo {
  nos: No[];
  /** Carro que está usando o grupo agora (só ele entra). */
  ocupante: { ativo: boolean } | null;
}

export interface Aresta {
  id: string;
  de: No;
  para: No;
  via: RoadDef;
  dir: Point;
  /** Faixa da direita: começa depois do cruzamento de origem e termina antes do de destino. */
  a: Point;
  b: Point;
  len: number;
  reversa: Aresta | null;
}

export interface Curva {
  p0: Point;
  c: Point;
  p2: Point;
  len: number;
}

const horizontal = (r: RoadDef) => r.rect.w > r.rect.h;
const eixo = (r: RoadDef) => (horizontal(r) ? r.rect.y + r.rect.h / 2 : r.rect.x + r.rect.w / 2);
/** Quanto a faixa fica afastada do eixo: avenida larga tem faixa mais para fora. */
const FAIXA = (r: RoadDef) => (r.kind === "avenida" ? 62 : 27);
const meia = (r: RoadDef) => (horizontal(r) ? r.rect.h : r.rect.w) / 2;
const TOL = 6;
/** Cruzamentos de ruas deslocadas por poucos pixels viram um só. */
const JUNTA = 25;
const AGRUPA = 180;

/**
 * Monta a rede a partir das ruas da cidade. `semCarro` são as ruas fechadas ao trânsito (a feira ocupa
 * a pista): os carros do jogo ainda podem passar, os da cidade não.
 */
function constroi(ROADS: RoadDef[], semCarro: Set<string>) {
  const nos: No[] = [];
  const horiz = ROADS.filter(horizontal);
  const vert = ROADS.filter((r) => !horizontal(r));
  const porRua = new Map<string, No[]>();
  const larguras = new Map<string, number>();
  /** Meia largura de cada rua que passa por cada cruzamento. */
  const meias = new Map<string, Map<string, number>>();
  for (const h of horiz) {
    for (const v of vert) {
      const x = eixo(v);
      const y = eixo(h);
      // uma rua que termina encostada em outra (sem atravessar) também se liga a ela
      const dentroH = x >= h.rect.x - meia(v) - TOL && x <= h.rect.x + h.rect.w + meia(v) + TOL;
      const dentroV = y >= v.rect.y - meia(h) - TOL && y <= v.rect.y + v.rect.h + meia(h) + TOL;
      if (!dentroH || !dentroV) continue;
      let no = nos.find((n) => Math.abs(n.x - x) < JUNTA && Math.abs(n.y - y) < JUNTA);
      if (!no) {
        no = { id: `${Math.round(x)},${Math.round(y)}`, x, y, r: 0, saidas: [], grau: 0, grupo: { nos: [], ocupante: null } };
        no.grupo.nos.push(no);
        nos.push(no);
      }
      const id = no.id;
      larguras.set(id, Math.max(larguras.get(id) ?? 0, meia(h), meia(v)));
      const m = meias.get(id) ?? new Map<string, number>();
      m.set(h.id, meia(h));
      m.set(v.id, meia(v));
      meias.set(id, m);
      for (const rua of [h, v]) {
        const lista = porRua.get(rua.id) ?? [];
        if (!lista.includes(no)) lista.push(no);
        porRua.set(rua.id, lista);
      }
    }
  }
  for (const n of nos) n.r = larguras.get(n.id) ?? 55;
  const arestas: Aresta[] = [];
  for (const rua of ROADS) {
    if (semCarro.has(rua.id)) continue;
    const lista = [...(porRua.get(rua.id) ?? [])].sort((p, q) => (horizontal(rua) ? p.x - q.x : p.y - q.y));
    for (let i = 0; i + 1 < lista.length; i++) {
      const p = lista[i];
      const q = lista[i + 1];
      const par: Aresta[] = [];
      for (const [de, para] of [
        [p, q],
        [q, p],
      ] as const) {
        const d = Math.hypot(para.x - de.x, para.y - de.y);
        const dir = { x: (para.x - de.x) / d, y: (para.y - de.y) / d };
        const n = { x: -dir.y, y: dir.x }; // direita de quem anda (y para baixo)
        const off = FAIXA(rua);
        // a faixa termina na borda da rua que cruza (não da própria): avenida larga não encolhe a rua pequena
        const recuo = (no: No) => Math.max(40, ...[...(meias.get(no.id)?.entries() ?? [])].filter(([id]) => id !== rua.id).map(([, m]) => m));
        // cruzamentos muito juntos: encurta o recuo para sobrar um pedaço de faixa entre eles
        let ra = recuo(de);
        let rb = recuo(para);
        const sobra = d - 26;
        if (ra + rb > sobra) {
          const f = Math.max(0, sobra) / (ra + rb);
          ra *= f;
          rb *= f;
        }
        const a = { x: de.x + dir.x * ra + n.x * off, y: de.y + dir.y * ra + n.y * off };
        const b = { x: para.x - dir.x * rb + n.x * off, y: para.y - dir.y * rb + n.y * off };
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        par.push({ id: `${rua.id}:${de.id}>${para.id}`, de, para, via: rua, dir, a, b, len, reversa: null });
      }
      par[0].reversa = par[1];
      par[1].reversa = par[0];
      arestas.push(...par);
      par[0].de.saidas.push(par[0]);
      par[1].de.saidas.push(par[1]);
    }
  }
  for (const n of nos) n.grau = n.saidas.length;
  // vizinhos a menos de AGRUPA px compartilham a vez
  for (const a of nos) {
    for (const b of nos) {
      if (a === b || a.grupo === b.grupo) continue;
      if (Math.hypot(a.x - b.x, a.y - b.y) > AGRUPA) continue;
      const velho = b.grupo;
      for (const n of velho.nos) {
        n.grupo = a.grupo;
        a.grupo.nos.push(n);
      }
    }
  }
  return { nos, arestas };
}

const REDE = constroi(ROADS_LULA, new Set(["rua-da-feira"]));
/** Rede da cidade ativa (começa com a do Lula; `montaRede` troca quando a cidade muda). */
export let NOS: No[] = REDE.nos;
export let ARESTAS: Aresta[] = REDE.arestas;

/** Refaz a rede para as ruas da cidade ativa. */
export function montaRede(roads: RoadDef[], semCarro: string[]) {
  const rede = constroi(roads, new Set(semCarro));
  NOS = rede.nos;
  ARESTAS = rede.arestas;
  cache.clear();
}

/** Interseção de duas retas (ponto + direção); `null` se paralelas. */
function cruza(p: Point, d: Point, q: Point, e: Point): Point | null {
  const det = d.x * e.y - d.y * e.x;
  if (Math.abs(det) < 1e-6) return null;
  const t = ((q.x - p.x) * e.y - (q.y - p.y) * e.x) / det;
  return { x: p.x + d.x * t, y: p.y + d.y * t };
}

const bezier = (c: Curva, u: number): Point => ({
  x: (1 - u) * (1 - u) * c.p0.x + 2 * u * (1 - u) * c.c.x + u * u * c.p2.x,
  y: (1 - u) * (1 - u) * c.p0.y + 2 * u * (1 - u) * c.c.y + u * u * c.p2.y,
});

export const pontoNaCurva = bezier;

export function tangenteNaCurva(c: Curva, u: number): number {
  const dx = 2 * (1 - u) * (c.c.x - c.p0.x) + 2 * u * (c.p2.x - c.c.x);
  const dy = 2 * (1 - u) * (c.c.y - c.p0.y) + 2 * u * (c.p2.y - c.c.y);
  return Math.atan2(dy, dx);
}

const cache = new Map<string, Curva>();

/** Curva dentro do cruzamento, da faixa que chega até a faixa que sai. */
export function curva(de: Aresta, para: Aresta): Curva {
  const k = `${de.id}|${para.id}`;
  const dado = cache.get(k);
  if (dado) return dado;
  const p0 = de.b;
  const p2 = para.a;
  let c = cruza(p0, de.dir, p2, para.dir);
  const reto = Math.abs(de.dir.x - para.dir.x) < 0.01 && Math.abs(de.dir.y - para.dir.y) < 0.01;
  if (reto || !c) c = { x: (p0.x + p2.x) / 2, y: (p0.y + p2.y) / 2 };
  // retorno em beco sem saída: abre a curva para os lados
  if (de.dir.x * para.dir.x + de.dir.y * para.dir.y < -0.9) c = { x: (p0.x + p2.x) / 2 + de.dir.x * 70, y: (p0.y + p2.y) / 2 + de.dir.y * 70 };
  const r: Curva = { p0, c, p2, len: 0 };
  let len = 0;
  let ant = p0;
  for (let i = 1; i <= 12; i++) {
    const p = bezier(r, i / 12);
    len += Math.hypot(p.x - ant.x, p.y - ant.y);
    ant = p;
  }
  r.len = Math.max(1, len);
  cache.set(k, r);
  return r;
}

/** Ruas sem saída ou isoladas: o trânsito precisa que todas levem a algum lugar. */
export function semSaida(): No[] {
  return NOS.filter((n) => n.saidas.length < 2);
}

/** Todo carro consegue chegar a todo trecho? (conexão forte: vai e volta). */
export function conectada(): boolean {
  if (!ARESTAS.length) return false;
  const alcanca = (inicio: No, reverso: boolean) => {
    const visto = new Set<string>([inicio.id]);
    const fila = [inicio];
    while (fila.length) {
      const n = fila.pop()!;
      const vizinhos = reverso ? ARESTAS.filter((a) => a.para === n).map((a) => a.de) : n.saidas.map((a) => a.para);
      for (const v of vizinhos) if (!visto.has(v.id)) (visto.add(v.id), fila.push(v));
    }
    return visto;
  };
  const ini = ARESTAS[0].de;
  const ida = alcanca(ini, false);
  const volta = alcanca(ini, true);
  return NOS.filter((n) => n.saidas.length || ARESTAS.some((a) => a.para === n)).every((n) => ida.has(n.id) && volta.has(n.id));
}

export type { Rect };
