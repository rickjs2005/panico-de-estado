import type { Atividade } from "./definicao";
import { BUILDINGS, CIDADE, DISTRICTS } from "./index";
import { normaliza } from "./relogio";
import type { CityNpc, DistrictId } from "./types";

/**
 * Rotina diária dos moradores da rua: dormem em casa, saem de manhã para o seu ponto na rua,
 * almoçam num estabelecimento, voltam ao ponto e, de noite, uns passam no bar e todos voltam
 * para casa. Tudo é determinístico a partir do id do morador: o mesmo morador tem sempre a mesma
 * casa e o mesmo horário, e quem faz parte do mesmo grupo (conversa, fila) sai junto.
 *
 * Casas, almoço e bar vêm da cidade ativa; `reiniciaRotinas` refaz o cálculo quando ela troca.
 */

export type Alvo = { tipo: "dentro"; predio: string } | { tipo: "ponto" };

export interface Agenda {
  casa: string;
  almoco: string;
  bar: boolean;
  /** Atraso (em minutos) que escalona os horários: ninguém sai na mesma hora. */
  folga: number;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

const DISTRITOS: DistrictId[] = ["residencial", "civico", "comercial", "educacional", "industrial", "terminal"];

/** Cada distrito mora nas casas mais próximas dele: quem trabalha longe da vila não passa metade do dia a pé. */
function moradiaDe(d: DistrictId): string[] {
  const casas = BUILDINGS.filter((b) => b.kind === "casa" || b.kind === "conjunto");
  const area = DISTRICTS.find((x) => x.id === d)!.area;
  const cx = area.x + area.w / 2;
  const cy = area.y + area.h / 2;
  const dist = (b: (typeof casas)[number]) => Math.hypot(b.x + b.w / 2 - cx, b.y - cy);
  return [...casas].sort((a, b) => dist(a) - dist(b)).slice(0, 6).map((b) => b.id);
}

let moradia: Record<DistrictId, string[]> | null = null;
function moradias(): Record<DistrictId, string[]> {
  moradia ??= Object.fromEntries(DISTRITOS.map((d) => [d, moradiaDe(d)])) as Record<DistrictId, string[]>;
  return moradia;
}

/** A cidade ativa mudou: as casas de cada distrito são recalculadas na próxima consulta. */
export function reiniciaRotinas() {
  moradia = null;
}

export function agendaDe(npc: Pick<CityNpc, "id" | "district" | "group">): Agenda {
  const chave = npc.group ?? npc.id;
  const h = hash(chave);
  const pool = moradias()[npc.district];
  return {
    casa: pool[h % pool.length],
    almoco: CIDADE.almoco[npc.district],
    bar: (h >>> 8) % 4 === 0,
    folga: (h >>> 4) % 40,
  };
}

const hm = (h: number, m = 0) => h * 60 + m;

/** Onde o morador deve estar a esta hora. */
export function alvoEm(a: Agenda, min: number): Alvo {
  const m = normaliza(min);
  const f = a.folga;
  const casa: Alvo = { tipo: "dentro", predio: a.casa };
  if (m < hm(6, 30) + f || m >= hm(21, 30) + f / 2) return casa;
  if (m < hm(12) + f / 2) return { tipo: "ponto" };
  if (m < hm(13, 30) + f / 2) return { tipo: "dentro", predio: a.almoco };
  if (m < hm(18, 30)) return { tipo: "ponto" };
  if (a.bar) return m < hm(19) + f / 2 ? { tipo: "ponto" } : { tipo: "dentro", predio: CIDADE.bar };
  return m < hm(19, 30) + f ? { tipo: "ponto" } : casa;
}

export type { Atividade };

/** Uma fala que combina com o que o morador está fazendo e com a hora. */
export function falaDe(atividade: Atividade, min: number, n: number): string {
  const m = normaliza(min);
  const f = CIDADE.falasRotina[atividade];
  const lista = atividade === "ponto" ? (m >= hm(18) ? (f.noite ?? []) : []) : (f.sempre ?? (m < hm(12) ? f.manha : f.tarde) ?? []);
  return lista.length ? lista[n % lista.length] : "";
}
