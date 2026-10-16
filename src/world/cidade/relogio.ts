/**
 * Relógio do mundo: o dia da cidade passa sozinho (10 minutos reais por dia) e guia as rotinas
 * dos moradores e a luz da rua. Tudo em minutos desde a meia-noite (0 a 1439).
 */

export const MIN_POR_DIA = 24 * 60;
/** Minutos de jogo por segundo real: uma hora de jogo dura 25 segundos. */
export const MIN_POR_SEG = 2.4;
/** Hora em que um jogo novo começa: manhã cedo, com a vizinhança saindo de casa. */
export const HORA_INICIAL = 7 * 60 + 30;

export type Periodo = "madrugada" | "manhã" | "tarde" | "noite";

export function normaliza(min: number): number {
  return ((min % MIN_POR_DIA) + MIN_POR_DIA) % MIN_POR_DIA;
}

export function periodoDe(min: number): Periodo {
  const m = normaliza(min);
  if (m < 5 * 60 + 30) return "madrugada";
  if (m < 12 * 60) return "manhã";
  if (m < 18 * 60) return "tarde";
  if (m < 22 * 60) return "noite";
  return "madrugada";
}

/** "08:30": usado no HUD. */
export function formataHora(min: number, passo = 5): string {
  const m = Math.floor(normaliza(min) / passo) * passo;
  const hh = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

/** Quão escura está a rua: 0 de dia, 1 no auge da noite. Anoitece de 18h às 20h e amanhece de 5h às 7h. */
export function escuridao(min: number): number {
  const m = normaliza(min);
  const h = m / 60;
  if (h >= 7 && h <= 18) return 0;
  if (h > 18 && h < 20) return (h - 18) / 2;
  if (h >= 20 || h < 5) return 1;
  return 1 - (h - 5) / 2;
}
