/** Regras de energia do caricato. A energia nunca bloqueia caminhada ou direção. */
export const MAX_STAMINA = 100;
/** Pontos por segundo correndo: a barra cheia dura cerca de 15 s, proporcional ao tamanho da cidade. */
export const RUN_DRAIN = 6.5;

export function drainStamina(energy: number, seconds: number, running: boolean): number {
  return Math.max(0, Math.min(MAX_STAMINA, energy - (running ? RUN_DRAIN * seconds : 0)));
}
