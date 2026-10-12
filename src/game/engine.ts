import type { Effects, EndingId, Line, MeterKey, Meters, Round } from "./types";

export const INITIAL_METERS: Meters = { panico: 20, popularidade: 50, caos: 20 };

export const METER_LABELS: Record<MeterKey, string> = {
  panico: "Pânico",
  popularidade: "Popularidade",
  caos: "Caos",
};

const clamp = (n: number) => Math.max(0, Math.min(100, n));

export function applyEffects(meters: Meters, effects: Effects): Meters {
  return {
    panico: clamp(meters.panico + (effects.panico ?? 0)),
    popularidade: clamp(meters.popularidade + (effects.popularidade ?? 0)),
    caos: clamp(meters.caos + (effects.caos ?? 0)),
  };
}

/** 0 a 3: controla as mudanças sutis (e não tão sutis) da interface. */
export function panicLevel(panico: number): 0 | 1 | 2 | 3 {
  if (panico >= 75) return 3;
  if (panico >= 55) return 2;
  if (panico >= 35) return 1;
  return 0;
}

/** Linhas da rodada + as variantes ativadas pelos indicadores atuais. */
export function linesFor(round: Round, meters: Meters): Line[] {
  const extra = (round.variants ?? [])
    .filter((v) => {
      const value = meters[v.meter];
      return (v.min === undefined || value >= v.min) && (v.max === undefined || value <= v.max);
    })
    .flatMap((v) => v.lines);
  return [...round.lines, ...extra];
}

/**
 * Ordem de prioridade dos finais. Fácil de ajustar:
 * quem ignorou o celular 3+ vezes cai no silêncio; depois pânico, caos,
 * popularidade e, se nada se destacou, o "outro Brasil".
 */
export function pickEnding(meters: Meters, ignores: number): EndingId {
  if (ignores >= 3) return "silencio";
  if (meters.panico >= 75) return "transmite";
  if (meters.caos >= 80) return "comissao";
  if (meters.popularidade >= 50) return "calma";
  return "outro";
}
