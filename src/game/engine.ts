import type { EpisodeResult, RouteId } from "./types";

/** Quantos episódios terminaram em vitória. */
export function countWins(results: EpisodeResult[]): number {
  return results.filter((r) => r === "vitoria").length;
}

export const RESULT_LABEL: Record<EpisodeResult, string> = {
  vitoria: "Deu certo (do jeito mais estranho)",
  meio: "Mais ou menos",
  desastre: "Desastre (com estilo)",
};

/* ------------------------------------------------------------------ */
/* Progresso salvo no navegador: finais e objetos descobertos          */
/* ------------------------------------------------------------------ */

const KEY = "panico-de-estado:progresso";

export interface Progress {
  /** "rota:final" */
  endings: string[];
  /** "rota:objeto" */
  rewards: string[];
}

export function readProgress(): Progress {
  try {
    const raw = window.localStorage.getItem(KEY);
    const p = raw ? (JSON.parse(raw) as Progress) : null;
    return { endings: p?.endings ?? [], rewards: p?.rewards ?? [] };
  } catch {
    return { endings: [], rewards: [] };
  }
}

export function remember(kind: keyof Progress, route: RouteId, id: string): Progress {
  const p = readProgress();
  const key = `${route}:${id}`;
  if (!p[kind].includes(key)) p[kind].push(key);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // sem armazenamento: o progresso vale só nesta visita
  }
  return p;
}
