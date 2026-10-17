import type { PlaceDef } from "../places";

/**
 * Lugares com estado persistente do Brasil do Flávio. As interações dentro dos prédios mudam o estado,
 * a rua se redesenha e o progresso guarda. Os ids são estáveis: não renomeie sem migrar o salvamento.
 */
export const PLACES_FLAVIO: Record<string, PlaceDef> = {
  "fl-catraca-posto": { name: "Catraca do Posto", states: { cobrando: "Cobrando", liberada: "Liberada" }, initial: "cobrando" },
  "fl-terminal-eua": { name: "Terminal Brasil–EUA", states: { "em-operacao": "Em operação", parado: "Parado" }, initial: "em-operacao" },
};
