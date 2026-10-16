/**
 * Motor das missões da cidade do Lula: tipos, estado e a máquina que transforma eventos do mundo
 * (falar com alguém, usar um objeto, mudar um lugar) em avanço de etapa, itens, falas e recompensa.
 *
 * É puro (sem Phaser nem React): a cena emite eventos e executa as "saídas" que o motor devolve.
 * As missões em si são dados (`campanha.ts`). O estado salvo tem uma só fonte de verdade, o progresso
 * da cidade (`progress.ts`): este arquivo define o formato e a leitura segura dele.
 */

export type Valor = string | number | boolean;

export type Cond =
  | { flag: string; igual?: Valor; min?: number }
  /** Item que o jogador está carregando; "" quer dizer "nenhum". */
  | { item: string }
  | { lugar: string; estado: string }
  /** Missão já concluída (para falas e consequências). */
  | { concluida: string }
  | { nao: Cond };

export type Efeito =
  | { avancar: true }
  | { concluir: true }
  /** Marca uma flag (uma só vez) e, se for a primeira, soma 1 ao contador. */
  | { marca: string; conta?: string }
  | { flag: string; valor: Valor }
  /** Flag numérica que gira 0 → max-1 → 0 (botões de ajuste). */
  | { cicla: string; max: number }
  | { pegar: string }
  | { soltar: true }
  /** Balão curto do protagonista. */
  | { ler: string }
  /** Diálogo com avanço; `quem` é o nome de quem fala. */
  | { dialogo: string[]; quem?: string }
  | { toast: string }
  | { lugar: [string, string] }
  | { se: Cond[]; entao: Efeito[]; senao?: Efeito[] };

export interface Regra {
  /** "falou:boato", "usou:aviso-1", "lugar:deposito-kits:vazio"… */
  evento: string;
  se?: Cond[];
  faz: Efeito[];
}

export interface Alvo {
  /** Prédio (vai até a porta) ou ponto solto. */
  predio?: string;
  x?: number;
  y?: number;
  label: string;
}

export interface EtapaDef {
  id: string;
  /** Texto curto; \`{chave}\` vira o valor da flag. */
  objetivo: string;
  alvo?: Alvo;
  regras: Regra[];
}

/** Ponto de interação de missão: só aparece nas etapas e condições indicadas. */
export interface PontoDef {
  id: string;
  etapas?: string[];
  se?: Cond[];
  /** Interação ao ar livre (os de dentro dos prédios são `spots` do interior). */
  fora?: { x: number; y: number; label: string };
}

export interface SeloDef {
  id: string;
  nome: string;
  cor: string;
  icone: string;
}

export interface MissaoDef {
  id: string;
  numero: number;
  titulo: string;
  local: string;
  /** Quem dá a missão e o que diz. */
  inicio: { npc: string; quem: string; alvo: Alvo; dialogo: string[] };
  etapas: EtapaDef[];
  pontos: PontoDef[];
  /** Fala ao concluir (curta). */
  conclusao: string[];
  selo: SeloDef;
}

export interface FalaPorEstado {
  npc: string;
  quando: Cond[];
  linhas: string[];
}

export interface Estado {
  ativa: string | null;
  etapa: number;
  concluidas: string[];
  selos: string[];
  carregando: string | null;
  flags: Record<string, Valor>;
}

export type Saida =
  | { tipo: "iniciou"; missao: string }
  | { tipo: "etapa"; missao: string; etapa: number }
  | { tipo: "concluiu"; missao: string; selo: string; completa: boolean }
  | { tipo: "ler"; texto: string }
  | { tipo: "dialogo"; linhas: string[]; quem?: string }
  | { tipo: "toast"; texto: string }
  | { tipo: "lugar"; place: string; estado: string }
  | { tipo: "item"; id: string | null };

export const estadoVazio = (): Estado => ({ ativa: null, etapa: 0, concluidas: [], selos: [], carregando: null, flags: {} });

export interface Campanha {
  missoes: MissaoDef[];
  falas: FalaPorEstado[];
  itens: Record<string, string>;
}

/** Lê um estado salvo qualquer e devolve um estado válido (saves antigos ou corrompidos viram vazio). */
export function sanear(raw: unknown, c: Campanha): Estado {
  const out = estadoVazio();
  if (!raw || typeof raw !== "object") return out;
  const r = raw as Partial<Estado>;
  const ids = new Set(c.missoes.map((m) => m.id));
  const selos = new Set(c.missoes.map((m) => m.selo.id));
  if (Array.isArray(r.concluidas)) out.concluidas = r.concluidas.filter((x): x is string => typeof x === "string" && ids.has(x));
  if (Array.isArray(r.selos)) out.selos = r.selos.filter((x): x is string => typeof x === "string" && selos.has(x));
  if (typeof r.carregando === "string" && r.carregando in c.itens) out.carregando = r.carregando;
  if (r.flags && typeof r.flags === "object") {
    for (const [k, v] of Object.entries(r.flags)) if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") out.flags[k] = v;
  }
  if (typeof r.ativa === "string" && ids.has(r.ativa) && !out.concluidas.includes(r.ativa)) {
    const m = c.missoes.find((x) => x.id === r.ativa)!;
    out.ativa = r.ativa;
    out.etapa = typeof r.etapa === "number" && r.etapa >= 0 && r.etapa < m.etapas.length ? Math.floor(r.etapa) : 0;
  }
  // coerência: uma missão concluída sempre tem o seu selo
  for (const id of out.concluidas) {
    const s = c.missoes.find((m) => m.id === id)!.selo.id;
    if (!out.selos.includes(s)) out.selos.push(s);
  }
  return out;
}

export const missaoDe = (c: Campanha, id: string | null) => (id ? c.missoes.find((m) => m.id === id) ?? null : null);

/** Próxima missão da campanha, se nenhuma estiver ativa (as seis vêm em ordem). */
export function disponivel(c: Campanha, e: Estado): MissaoDef | null {
  if (e.ativa) return null;
  return c.missoes.find((m) => !e.concluidas.includes(m.id)) ?? null;
}

export const completa = (c: Campanha, e: Estado) => c.missoes.every((m) => e.concluidas.includes(m.id));

function vale(cond: Cond, e: Estado, lugares: Record<string, string>): boolean {
  if ("nao" in cond) return !vale(cond.nao, e, lugares);
  if ("item" in cond) return (e.carregando ?? "") === cond.item;
  if ("lugar" in cond) return lugares[cond.lugar] === cond.estado;
  if ("concluida" in cond) return e.concluidas.includes(cond.concluida);
  // flag numérica que nunca foi tocada vale 0
  const v = e.flags[cond.flag] ?? (typeof cond.igual === "number" ? 0 : undefined);
  if (cond.min !== undefined) return typeof v === "number" && v >= cond.min;
  if (cond.igual !== undefined) return v === cond.igual;
  return !!v;
}

const todas = (conds: Cond[] | undefined, e: Estado, lugares: Record<string, string>) => (conds ?? []).every((x) => vale(x, e, lugares));

/** Texto do objetivo com os contadores preenchidos. */
export function interpola(texto: string, e: Estado): string {
  return texto.replace(/\{([^}]+)\}/g, (_, k: string) => {
    const v = e.flags[k];
    if (v === undefined || v === false || v === "") return k.endsWith(".doc") ? "nenhum" : "0";
    return String(v);
  });
}

/** Começa a missão: zera só os dados dela e conta como "falou com quem deu a missão". */
export function iniciar(c: Campanha, e: Estado, id: string, lugares: Record<string, string>): { estado: Estado; saidas: Saida[] } {
  const m = missaoDe(c, id);
  if (!m || e.ativa || e.concluidas.includes(id)) return { estado: e, saidas: [] };
  const flags = Object.fromEntries(Object.entries(e.flags).filter(([k]) => !k.startsWith(`${m.id}.`)));
  const novo: Estado = { ...e, ativa: id, etapa: 0, flags, carregando: null };
  const saidas: Saida[] = [{ tipo: "iniciou", missao: id }, { tipo: "dialogo", linhas: m.inicio.dialogo, quem: undefined }];
  if (e.carregando) saidas.push({ tipo: "item", id: null });
  const r = evento(c, novo, `falou:${m.inicio.npc}`, lugares);
  return { estado: r.estado, saidas: [...saidas, ...r.saidas] };
}

/** Aplica um evento do mundo. Eventos que a etapa atual não conhece são ignorados (nunca travam a campanha). */
export function evento(c: Campanha, e: Estado, ev: string, lugares: Record<string, string>): { estado: Estado; saidas: Saida[] } {
  const m = missaoDe(c, e.ativa);
  if (!m) return { estado: e, saidas: [] };
  const etapa = m.etapas[e.etapa];
  if (!etapa) return { estado: e, saidas: [] };
  const regra = etapa.regras.find((r) => r.evento === ev && todas(r.se, e, lugares));
  if (!regra) return { estado: e, saidas: [] };
  const ctx = { e: { ...e, flags: { ...e.flags } }, saidas: [] as Saida[], avancou: false, concluiu: false };
  executa(c, m, regra.faz, ctx, lugares);
  let est = ctx.e;
  if (ctx.concluiu) {
    est = concluir(c, m, est, ctx.saidas);
  } else if (ctx.avancou) {
    const prox = est.etapa + 1;
    if (prox >= m.etapas.length) est = concluir(c, m, est, ctx.saidas);
    else {
      est = { ...est, etapa: prox };
      ctx.saidas.push({ tipo: "etapa", missao: m.id, etapa: prox });
    }
  }
  return { estado: est, saidas: ctx.saidas };
}

function concluir(c: Campanha, m: MissaoDef, e: Estado, saidas: Saida[]): Estado {
  if (e.concluidas.includes(m.id)) return { ...e, ativa: null, etapa: 0 };
  const concluidas = [...e.concluidas, m.id];
  const selos = e.selos.includes(m.selo.id) ? e.selos : [...e.selos, m.selo.id];
  const est: Estado = { ...e, ativa: null, etapa: 0, concluidas, selos, carregando: null };
  saidas.push({ tipo: "dialogo", linhas: m.conclusao });
  saidas.push({ tipo: "concluiu", missao: m.id, selo: m.selo.id, completa: completa(c, est) });
  if (e.carregando) saidas.push({ tipo: "item", id: null });
  return est;
}

interface Ctx {
  e: Estado;
  saidas: Saida[];
  avancou: boolean;
  concluiu: boolean;
}

function executa(c: Campanha, m: MissaoDef, efeitos: Efeito[], ctx: Ctx, lugares: Record<string, string>) {
  for (const f of efeitos) {
    if ("avancar" in f) ctx.avancou = true;
    else if ("concluir" in f) ctx.concluiu = true;
    else if ("marca" in f) {
      if (!ctx.e.flags[f.marca]) {
        ctx.e.flags[f.marca] = true;
        if (f.conta) ctx.e.flags[f.conta] = (Number(ctx.e.flags[f.conta]) || 0) + 1;
      }
    } else if ("flag" in f && "valor" in f) ctx.e.flags[f.flag] = f.valor;
    else if ("cicla" in f) ctx.e.flags[f.cicla] = ((Number(ctx.e.flags[f.cicla]) || 0) + 1) % f.max;
    else if ("pegar" in f) {
      ctx.e.carregando = f.pegar;
      ctx.saidas.push({ tipo: "item", id: f.pegar });
    } else if ("soltar" in f) {
      ctx.e.carregando = null;
      ctx.saidas.push({ tipo: "item", id: null });
    } else if ("ler" in f) ctx.saidas.push({ tipo: "ler", texto: interpola(f.ler, ctx.e) });
    else if ("dialogo" in f) ctx.saidas.push({ tipo: "dialogo", linhas: f.dialogo.map((l) => interpola(l, ctx.e)), quem: f.quem });
    else if ("toast" in f) ctx.saidas.push({ tipo: "toast", texto: interpola(f.toast, ctx.e) });
    else if ("lugar" in f) {
      ctx.saidas.push({ tipo: "lugar", place: f.lugar[0], estado: f.lugar[1] });
      lugares = { ...lugares, [f.lugar[0]]: f.lugar[1] };
    } else if ("se" in f) executa(c, m, todas(f.se, ctx.e, lugares) ? f.entao : (f.senao ?? []), ctx, lugares);
  }
}

/** O que o HUD e o mapa precisam: título, objetivo atual, progresso e destino. */
export function situacao(c: Campanha, e: Estado) {
  const m = missaoDe(c, e.ativa);
  if (!m) return null;
  const etapa = m.etapas[e.etapa];
  return {
    missao: m,
    etapa,
    numero: e.etapa + 1,
    total: m.etapas.length,
    objetivo: interpola(etapa.objetivo, e),
  };
}

/** Pontos de missão visíveis agora (por etapa e condições). */
export function pontosVisiveis(c: Campanha, e: Estado, lugares: Record<string, string>): Set<string> {
  const out = new Set<string>();
  const m = missaoDe(c, e.ativa);
  if (!m) return out;
  const etapa = m.etapas[e.etapa];
  for (const p of m.pontos) {
    if (p.etapas && !p.etapas.includes(etapa.id)) continue;
    if (!todas(p.se, e, lugares)) continue;
    out.add(p.id);
  }
  return out;
}

/**
 * Chaves de estado que o resto do jogo usa em condições `when` dos interiores:
 * missao:<id> (ativa|concluida), etapa:<id> (id da etapa), item (o que carrega),
 * ponto:<id> (sim se visível) e flag:<chave> (sim se verdadeira).
 */
export function contexto(c: Campanha, e: Estado, lugares: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = { item: e.carregando ?? "" };
  for (const m of c.missoes) {
    out[`missao:${m.id}`] = e.concluidas.includes(m.id) ? "concluida" : e.ativa === m.id ? "ativa" : "";
    if (e.ativa === m.id) out[`etapa:${m.id}`] = m.etapas[e.etapa].id;
  }
  for (const id of pontosVisiveis(c, e, lugares)) out[`ponto:${id}`] = "sim";
  for (const [k, v] of Object.entries(e.flags)) if (v) out[`flag:${k}`] = typeof v === "boolean" ? "sim" : String(v);
  return out;
}

/** Fala de um morador conforme o estado da campanha (a primeira que valer). */
export function falaDoEstado(c: Campanha, e: Estado, lugares: Record<string, string>, npc: string): string[] | null {
  for (const f of c.falas) if (f.npc === npc && todas(f.quando, e, lugares)) return f.linhas;
  return null;
}

/** Conjunto de eventos citados nas regras (para as checagens de consistência). */
export function eventosCitados(c: Campanha): Set<string> {
  const out = new Set<string>();
  for (const m of c.missoes) for (const et of m.etapas) for (const r of et.regras) out.add(r.evento);
  return out;
}
