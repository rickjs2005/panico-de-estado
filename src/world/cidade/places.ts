/**
 * Estados persistentes dos lugares. Histórias futuras mudam estes estados
 * (por exemplo, reabrir a igreja ou esvaziar o depósito) e a cidade se redesenha.
 * Os ids são estáveis: não renomeie sem migrar o salvamento.
 *
 * Estes são os lugares da cidade do Lula. Os da cidade ativa (e as funções `isPlace` e
 * `initialPlaces`) saem do índice da cidade.
 */

export interface PlaceDef {
  name: string;
  states: Record<string, string>;
  initial: string;
}

export const PLACES_LULA = {
  "igreja-matriz": { name: "Igreja Matriz", states: { interditada: "Interditada por decreto", aberta: "Aberta" }, initial: "interditada" },
  assembleia: { name: "Assembleia da Fé", states: { interditada: "Lacrada", aberta: "Aberta" }, initial: "interditada" },
  "deposito-kits": { name: "Depósito de Kits", states: { abastecido: "Abastecido", vazio: "Vazio" }, initial: "abastecido" },
  "terminal-china": { name: "Terminal Brasil–China", states: { "em-operacao": "Em operação", parado: "Parado" }, initial: "em-operacao" },
  universidade: { name: "Universidade do Pânico", states: { "liberou-geral": "Liberou geral", normal: "Expediente normal" }, initial: "liberou-geral" },
} satisfies Record<string, PlaceDef>;

/** Id de um lugar com estado (os ids variam por cidade). */
export type PlaceId = string;

export function estadosIniciais(places: Record<string, PlaceDef>): Record<PlaceId, string> {
  const out: Record<PlaceId, string> = {};
  for (const id of Object.keys(places)) out[id] = places[id].initial;
  return out;
}
