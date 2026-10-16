/** O jogador pediu menos movimento (prefers-reduced-motion): sem tremor de câmera, clarões, confete nem balanço. */
export function movimentoReduzido(): boolean {
  try {
    return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}
