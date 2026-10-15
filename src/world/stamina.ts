/** Regras de energia do caricato. A energia nunca bloqueia caminhada ou direção. */
export const MAX_STAMINA = 100;
export const RUN_DRAIN = 17;

export function drainStamina(energy: number, seconds: number, running: boolean): number {
  return Math.max(0, Math.min(MAX_STAMINA, energy - (running ? RUN_DRAIN * seconds : 0)));
}
