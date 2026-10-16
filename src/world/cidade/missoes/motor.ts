/**
 * Motor das missões da cidade do Lula: tipos, estado e a máquina que transforma eventos do mundo
 * (falar com alguém, usar um objeto, mudar um lugar) em avanço de etapa, itens, falas, escolhas e recompensa.
 *
 * É puro (sem Phaser nem React): a cena emite eventos e executa as "saídas" que o motor devolve.
 * As missões em si são dados (`campanha.ts`). O estado salvo tem uma só fonte de verdade, o progresso
 * da cidade (`progress.ts`): este arquivo define o formato e a leitura segura dele, inclusive a
 * recuperação de saves antigos ou incoerentes (nunca apaga conquistas válidas).
 */

export type Valor = string | number | boolean;

export type Cond =
  | { flag: string; igual?: Valor; min?: number }
  /** Item que o jogador está carregando; "" quer dizer "nenhum". */
  | { item: string }
  | { lugar: string; estado: string }
  /** Missão já concluída (para falas e consequências). */
  | { concluida: string }
  | { nao: Cond }
  /** Vale se qualquer uma das condições valer. */
  | { ou: Cond[] };

export interface Opcao {
  id: string;
  rotulo: string;
  /** A opção só aparece se estas condições valerem na hora da escolha. */
  se?: Cond[];
  faz: Efeito[];
}

export type Efeito =
  | { avancar: true }
  | { concluir: true }
  /** Marca uma flag (uma só vez) e, se for a primeira, soma 1 ao contador. */
  | { marca: string; conta?: string }
  | { flag: string; valor: Valor }
  /** Flag numérica que gira 0 → max-1 → 0 (botões de ajuste). */
  | { cicla: string; max: number }
  /** Soma 1 a uma flag numérica. */
  | { soma: string }
  | { pegar: string }
  | { soltar: true }
  /** Balão curto do protagonista. */
  | { ler: string }
  /** Diálogo com avanço; `quem` é o nome de quem fala. */
  | { dialogo: string[]; quem?: string }
  | { toast: string }
  | { lugar: [string, string] }
  /** Anota uma pista ou conversa importante no diário (uma vez por id). */
  | { nota: string; texto: string }
  /** Efeito sonoro nomeado ("grave:2", "acerto", "erro"…); a cena decide o timbre. */
  | { som: string }
  /** Pede à cena que apresente a cerimônia final. */
  | { cerimonia: true }
  /** Escolha com consequências: a cena mostra as opções e devolve a escolhida. Vai sempre por último. */
  | { escolha: { titulo: string; quem?: string; opcoes: Opcao[] } }
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

export interface ItemLista {
  rotulo: string;
  /** Quando valem, o item aparece como feito. */
  feito: Cond[];
}

export interface Indicador {
  rotulo: string;
  flag: string;
  /** Maior valor possível: o indicador mostra esse tanto de marcas e preenche tantas quanto o valor. */
  max: number;
}

export interface EtapaDef {
  id: string;
  /** Texto curto; `{chave}` vira o valor da flag. */
  objetivo: string;
  /** Destino padrão da etapa. */
  alvo?: Alvo;
  /** Destinos contextuais: valem todos os que casarem (o primeiro é o principal); sem nenhum, vale `alvo`. */
  alvos?: { se: Cond[]; alvo: Alvo }[];
  /** Checklist mostrado no HUD (por exemplo, uma ferramenta por posto). */
  lista?: ItemLista[];
  /** Indicadores numéricos sempre visíveis (níveis da mesa de som, etiquetas certas…). */
  painel?: Indicador[];
  /** Condições que precisam valer para estar nesta etapa; se não valerem, o jogo volta para `volta`. */
  exige?: Cond[];
  volta?: string;
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

export interface Nota {
  id: string;
  texto: string;
}

export interface Estado {
  ativa: string | null;
  etapa: number;
  /** Id da etapa atual: é ele que manda ao ler um save (o índice só serve a saves antigos). */
  etapaId: string | null;
  concluidas: string[];
  selos: string[];
  carregando: string | null;
  flags: Record<string, Valor>;
  /** Pistas e conversas importantes, da mais antiga para a mais nova. */
  diario: Nota[];
}

export type Saida =
  | { tipo: "iniciou"; missao: string }
  | { tipo: "etapa"; missao: string; etapa: number }
  | { tipo: "concluiu"; missao: string; selo: string; completa: boolean }
  | { tipo: "ler"; texto: string }
  | { tipo: "dialogo"; linhas: string[]; quem?: string }
  | { tipo: "toast"; texto: string }
  | { tipo: "lugar"; place: string; estado: string }
  | { tipo: "item"; id: string | null }
  | { tipo: "som"; id: string }
  | { tipo: "cerimonia" }
  /** A etapa em que a escolha foi aberta vai junto: se o jogo mudou de etapa, a escolha caduca. */
  | { tipo: "escolha"; missao: string; etapaId: string; titulo: string; quem?: string; opcoes: Opcao[] };

export const MAX_DIARIO = 40;

export const estadoVazio = (): Estado => ({ ativa: null, etapa: 0, etapaId: null, concluidas: [], selos: [], carregando: null, flags: {}, diario: [] });

export interface Campanha {
  /** As seis missões do Passaporte, em ordem. */
  missoes: MissaoDef[];
  /** Missão extra que começa depois da sexta (a cerimônia final); não vale selo do Passaporte. */
  epilogo?: MissaoDef;
  falas: FalaPorEstado[];
  itens: Record<string, string>;
  /** Ids das etapas de cada missão como eram quando o save só guardava o índice. */
  legado?: Record<string, string[]>;
}

export const todasMissoes = (c: Campanha): MissaoDef[] => (c.epilogo ? [...c.missoes, c.epilogo] : c.missoes);
export const missaoDe = (c: Campanha, id: string | null) => (id ? (todasMissoes(c).find((x) => x.id === id) ?? null) : null);

const dedupe = (xs: string[]) => [...new Set(xs)];

/**
 * Lê um estado salvo qualquer e devolve um estado válido e coerente. Saves antigos (sem `etapaId` nem
 * diário) são migrados, itens e etapas que não combinam são corrigidos, repetições somem. Conquistas
 * válidas (missões concluídas e selos) sempre ficam; nada é apagado por precaução.
 */
export function sanear(raw: unknown, c: Campanha): Estado {
  const out = estadoVazio();
  if (!raw || typeof raw !== "object") return out;
  const r = raw as Partial<Estado>;
  const todas = todasMissoes(c);
  const ids = new Set(todas.map((m) => m.id));
  const selos = new Set(todas.map((m) => m.selo.id));
  if (Array.isArray(r.concluidas)) out.concluidas = dedupe(r.concluidas.filter((x): x is string => typeof x === "string" && ids.has(x)));
  if (Array.isArray(r.selos)) out.selos = dedupe(r.selos.filter((x): x is string => typeof x === "string" && selos.has(x)));
  if (typeof r.carregando === "string" && r.carregando in c.itens) out.carregando = r.carregando;
  if (r.flags && typeof r.flags === "object") {
    for (const [k, v] of Object.entries(r.flags)) if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") out.flags[k] = v;
  }
  if (Array.isArray(r.diario)) {
    const vistos = new Set<string>();
    for (const n of r.diario) {
      if (n && typeof n === "object" && typeof (n as Nota).id === "string" && typeof (n as Nota).texto === "string" && !vistos.has((n as Nota).id)) {
        vistos.add((n as Nota).id);
        out.diario.push({ id: (n as Nota).id, texto: (n as Nota).texto.slice(0, 280) });
      }
    }
    out.diario = out.diario.slice(-MAX_DIARIO);
  }
  // só a primeira missão da lista que não foi concluída pode estar ativa, e ela precisa existir
  if (typeof r.ativa === "string" && ids.has(r.ativa) && !out.concluidas.includes(r.ativa)) {
    const m = missaoDe(c, r.ativa)!;
    let idx = -1;
    if (typeof r.etapaId === "string") idx = m.etapas.findIndex((e) => e.id === r.etapaId);
    if (idx < 0 && typeof r.etapa === "number" && Number.isFinite(r.etapa)) {
      const antigo = c.legado?.[m.id]?.[Math.floor(r.etapa)];
      if (antigo) idx = m.etapas.findIndex((e) => e.id === antigo);
      if (idx < 0) idx = Math.max(0, Math.min(m.etapas.length - 1, Math.floor(r.etapa)));
    }
    out.ativa = m.id;
    out.etapa = Math.max(0, idx);
    out.etapaId = m.etapas[out.etapa].id;
  }
  // um item sem missão que o use não fica "carregado" para sempre
  if (out.carregando && !out.ativa) out.carregando = null;
  // coerência: uma missão concluída sempre tem o seu selo
  for (const id of out.concluidas) {
    const s = missaoDe(c, id)!.selo.id;
    if (!out.selos.includes(s)) out.selos.push(s);
  }
  return recupera(c, out, {});
}

/**
 * Se a etapa exige algo que o save não tem (item, flag), volta à etapa indicada (repete até valer).
 * `lugares` é opcional: condições de lugar só são checadas quando ele é informado.
 */
export function recupera(c: Campanha, e: Estado, lugares: Record<string, string>): Estado {
  const m = missaoDe(c, e.ativa);
  if (!m) return e;
  let est = e;
  for (let i = 0; i < m.etapas.length; i++) {
    const et = m.etapas[est.etapa];
    if (!et?.exige || todas(et.exige, est, lugares, true)) break;
    const volta = et.volta ? m.etapas.findIndex((x) => x.id === et.volta) : Math.max(0, est.etapa - 1);
    if (volta < 0 || volta === est.etapa) break;
    est = { ...est, etapa: volta, etapaId: m.etapas[volta].id };
  }
  return est;
}

/** Próxima missão da campanha, se nenhuma estiver ativa (as seis vêm em ordem, depois a cerimônia). */
export function disponivel(c: Campanha, e: Estado): MissaoDef | null {
  if (e.ativa) return null;
  const m = c.missoes.find((x) => !e.concluidas.includes(x.id));
  if (m) return m;
  return c.epilogo && !e.concluidas.includes(c.epilogo.id) ? c.epilogo : null;
}

export const completa = (c: Campanha, e: Estado) => c.missoes.every((m) => e.concluidas.includes(m.id));

/** `lugares` vazio (leitura de save) faz as condições de lugar valerem: só item e flag mandam na recuperação. */
function vale(cond: Cond, e: Estado, lugares: Record<string, string>, ignoraLugar = false): boolean {
  if ("nao" in cond) return !vale(cond.nao, e, lugares, ignoraLugar);
  if ("ou" in cond) return cond.ou.some((x) => vale(x, e, lugares, ignoraLugar));
  if ("item" in cond) return (e.carregando ?? "") === cond.item;
  if ("lugar" in cond) return ignoraLugar || lugares[cond.lugar] === cond.estado;
  if ("concluida" in cond) return e.concluidas.includes(cond.concluida);
  // flag numérica que nunca foi tocada vale 0
  const v = e.flags[cond.flag] ?? (typeof cond.igual === "number" ? 0 : undefined);
  if (cond.min !== undefined) return typeof v === "number" && v >= cond.min;
  if (cond.igual !== undefined) return v === cond.igual;
  return !!v;
}

const todas = (conds: Cond[] | undefined, e: Estado, lugares: Record<string, string>, ignoraLugar = false) => (conds ?? []).every((x) => vale(x, e, lugares, ignoraLugar));

/** Avalia condições contra o estado (para a cena e para os testes). */
export const condicoesValem = (conds: Cond[] | undefined, e: Estado, lugares: Record<string, string>) => todas(conds, e, lugares);

/** Texto do objetivo com os contadores preenchidos. */
export function interpola(texto: string, e: Estado): string {
  return texto.replace(/\{([^}]+)\}/g, (_, k: string) => {
    const v = e.flags[k];
    if (v === undefined || v === false || v === "") return k.endsWith(".doc") ? "nenhum" : "0";
    return String(v);
  });
}

const comEtapa = (m: MissaoDef, e: Estado, idx: number): Estado => ({ ...e, etapa: idx, etapaId: m.etapas[idx].id });

/** Começa a missão: zera só os dados dela e conta como "falou com quem deu a missão". */
export function iniciar(c: Campanha, e: Estado, id: string, lugares: Record<string, string>): { estado: Estado; saidas: Saida[] } {
  const m = missaoDe(c, id);
  if (!m || e.ativa || e.concluidas.includes(id)) return { estado: e, saidas: [] };
  const flags = Object.fromEntries(Object.entries(e.flags).filter(([k]) => !k.startsWith(`${m.id}.`)));
  const novo: Estado = comEtapa(m, { ...e, ativa: id, flags, carregando: null }, 0);
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
  return roda(c, m, e, regra.faz, lugares);
}

/** Aplica os efeitos de uma opção escolhida. Se a etapa mudou desde que a escolha abriu, ela caduca. */
export function escolher(c: Campanha, e: Estado, missao: string, etapaId: string, opcao: Opcao, lugares: Record<string, string>): { estado: Estado; saidas: Saida[] } {
  const m = missaoDe(c, e.ativa);
  if (!m || m.id !== missao || m.etapas[e.etapa]?.id !== etapaId) return { estado: e, saidas: [] };
  return roda(c, m, e, opcao.faz, lugares);
}

function roda(c: Campanha, m: MissaoDef, e: Estado, faz: Efeito[], lugares: Record<string, string>): { estado: Estado; saidas: Saida[] } {
  const ctx = { e: { ...e, flags: { ...e.flags }, diario: [...e.diario] }, saidas: [] as Saida[], avancou: false, concluiu: false, missao: m.id };
  executa(c, m, faz, ctx, lugares);
  let est = ctx.e;
  if (ctx.concluiu) {
    est = concluir(c, m, est, ctx.saidas);
  } else if (ctx.avancou) {
    const prox = est.etapa + 1;
    if (prox >= m.etapas.length) est = concluir(c, m, est, ctx.saidas);
    else {
      est = comEtapa(m, est, prox);
      ctx.saidas.push({ tipo: "etapa", missao: m.id, etapa: prox });
    }
  }
  return { estado: est.ativa ? recupera(c, est, lugares) : est, saidas: ctx.saidas };
}

function concluir(c: Campanha, m: MissaoDef, e: Estado, saidas: Saida[]): Estado {
  if (e.concluidas.includes(m.id)) return { ...e, ativa: null, etapa: 0, etapaId: null };
  const concluidas = [...e.concluidas, m.id];
  const selos = e.selos.includes(m.selo.id) ? e.selos : [...e.selos, m.selo.id];
  const est: Estado = { ...e, ativa: null, etapa: 0, etapaId: null, concluidas, selos, carregando: null };
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
  missao: string;
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
    else if ("soma" in f) ctx.e.flags[f.soma] = (Number(ctx.e.flags[f.soma]) || 0) + 1;
    else if ("pegar" in f) {
      ctx.e.carregando = f.pegar;
      ctx.saidas.push({ tipo: "item", id: f.pegar });
    } else if ("soltar" in f) {
      ctx.e.carregando = null;
      ctx.saidas.push({ tipo: "item", id: null });
    } else if ("ler" in f) ctx.saidas.push({ tipo: "ler", texto: interpola(f.ler, ctx.e) });
    else if ("dialogo" in f) ctx.saidas.push({ tipo: "dialogo", linhas: f.dialogo.map((l) => interpola(l, ctx.e)), quem: f.quem });
    else if ("toast" in f) ctx.saidas.push({ tipo: "toast", texto: interpola(f.toast, ctx.e) });
    else if ("nota" in f) {
      if (!ctx.e.diario.some((n) => n.id === f.nota)) ctx.e.diario = [...ctx.e.diario, { id: f.nota, texto: interpola(f.texto, ctx.e) }].slice(-MAX_DIARIO);
    } else if ("som" in f) ctx.saidas.push({ tipo: "som", id: interpola(f.som, ctx.e) });
    else if ("cerimonia" in f) ctx.saidas.push({ tipo: "cerimonia" });
    else if ("lugar" in f) {
      ctx.saidas.push({ tipo: "lugar", place: f.lugar[0], estado: f.lugar[1] });
      lugares = { ...lugares, [f.lugar[0]]: f.lugar[1] };
    } else if ("escolha" in f) {
      const opcoes = f.escolha.opcoes.filter((o) => todas(o.se, ctx.e, lugares));
      ctx.saidas.push({ tipo: "escolha", missao: ctx.missao, etapaId: m.etapas[ctx.e.etapa]?.id ?? "", titulo: interpola(f.escolha.titulo, ctx.e), quem: f.escolha.quem, opcoes });
    } else if ("se" in f) executa(c, m, todas(f.se, ctx.e, lugares) ? f.entao : (f.senao ?? []), ctx, lugares);
  }
}

/** O que o HUD e o mapa precisam: título, objetivo atual, progresso, checklist, indicadores e destinos. */
export function situacao(c: Campanha, e: Estado, lugares: Record<string, string> = {}) {
  const m = missaoDe(c, e.ativa);
  if (!m) return null;
  const etapa = m.etapas[e.etapa];
  const alvos = alvosDe(etapa, e, lugares);
  return {
    missao: m,
    etapa,
    numero: e.etapa + 1,
    total: m.etapas.length,
    objetivo: interpola(etapa.objetivo, e),
    alvos,
    lista: (etapa.lista ?? []).map((i) => ({ rotulo: interpola(i.rotulo, e), feito: todas(i.feito, e, lugares) })),
    painel: (etapa.painel ?? []).map((p) => ({ rotulo: p.rotulo, valor: Number(e.flags[p.flag]) || 0, max: p.max })),
  };
}

/** Destinos da etapa: os contextuais que casam (o primeiro é o principal) ou o padrão. */
export function alvosDe(etapa: EtapaDef, e: Estado, lugares: Record<string, string>): Alvo[] {
  const ctx = (etapa.alvos ?? []).filter((a) => todas(a.se, e, lugares)).map((a) => a.alvo);
  if (ctx.length) return ctx;
  return etapa.alvo ? [etapa.alvo] : [];
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
 * ponto:<id> (sim se visível) e flag:<chave> (sim se verdadeira ou o valor dela).
 */
export function contexto(c: Campanha, e: Estado, lugares: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = { item: e.carregando ?? "" };
  for (const m of todasMissoes(c)) {
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
  for (const m of todasMissoes(c)) for (const et of m.etapas) for (const r of et.regras) out.add(r.evento);
  return out;
}
