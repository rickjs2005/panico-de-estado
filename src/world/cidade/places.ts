/**
 * Estados persistentes dos lugares. Histórias futuras mudam estes estados
 * (por exemplo, reabrir a igreja ou esvaziar o depósito) e a cidade se redesenha.
 * Os ids são estáveis: não renomeie sem migrar o salvamento.
 */

export interface PlaceDef {
  name: string;
  states: Record<string, string>;
  initial: string;
}

export const PLACES = {
  "igreja-matriz": { name: "Igreja Matriz", states: { interditada: "Interditada por decreto", aberta: "Aberta" }, initial: "interditada" },
  assembleia: { name: "Assembleia da Fé", states: { interditada: "Lacrada", aberta: "Aberta" }, initial: "interditada" },
  "deposito-kits": { name: "Depósito de Kits", states: { abastecido: "Abastecido", vazio: "Vazio" }, initial: "abastecido" },
  "terminal-china": { name: "Terminal Brasil–China", states: { "em-operacao": "Em operação", parado: "Parado" }, initial: "em-operacao" },
  universidade: { name: "Universidade do Pânico", states: { "liberou-geral": "Liberou geral", normal: "Expediente normal" }, initial: "liberou-geral" },
} satisfies Record<string, PlaceDef>;

export type PlaceId = keyof typeof PLACES;

export function initialPlaces(): Record<PlaceId, string> {
  const out = {} as Record<PlaceId, string>;
  for (const id of Object.keys(PLACES) as PlaceId[]) out[id] = PLACES[id].initial;
  return out;
}

export function isPlace(id: string): id is PlaceId {
  return id in PLACES;
}
