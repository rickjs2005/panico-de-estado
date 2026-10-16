import { strict as assert } from "node:assert";
import { advance, BRASIL_PARA_CHINA, CAMPUS_LIBERADO, CHICOTE_EXPRESSO, KIT_DO_ZAP, OPERACAO_CADEADO } from "../src/world/mission";
import { clearSave, isDone, markDone, readSave, saveProgress } from "../src/world/save";
import { drainStamina } from "../src/world/stamina";

// Exercita ações fora de ordem, conclusão única e os eventos necessários em cada boato.
const paths = [
  { mission: OPERACAO_CADEADO, events: [{ type: "talk", npc: "boato" }, { type: "pickup", item: "cadeado" }, { type: "interact", place: "igreja" }] },
  { mission: KIT_DO_ZAP, events: [{ type: "pickup", item: "kits" }, { type: "deliver", npc: "diretora", item: "kits" }] },
  { mission: CAMPUS_LIBERADO, events: [{ type: "talk", npc: "reitora" }, { type: "interact", place: "campus" }] },
  { mission: BRASIL_PARA_CHINA, events: [{ type: "pickup", item: "brasil-caixa" }, { type: "interact", place: "terminal" }] },
  { mission: CHICOTE_EXPRESSO, events: [{ type: "talk", npc: "boato" }, { type: "pickup", item: "chicote" }, { type: "deliver", npc: "patrao", item: "chicote" }] },
] satisfies { mission: typeof OPERACAO_CADEADO; events: Parameters<typeof advance>[2][] }[];

for (const { mission, events } of paths) {
  let step = mission.steps[0].id;
  assert.equal(advance(mission, step, events[events.length - 1]), null, `${mission.id}: não pode pular ao fim`);
  for (const event of events) {
    assert.equal(advance(mission, step, { type: "pickup", item: "item-do-outro-universo" }), null);
    const result = advance(mission, step, event);
    assert.ok(result, `${mission.id}: evento válido deve avançar`);
    step = result.to;
    assert.equal(advance(mission, step, event), null, `${mission.id}: repetir ação não pode avançar`);
  }
  assert.equal(step, mission.finalStep);
}

// O save v1 existente deve sobreviver à campanha nova e ao reset de só um protagonista.
const data = new Map<string, string>();
Object.defineProperty(globalThis, "window", { configurable: true, value: {
  localStorage: { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value), removeItem: (key: string) => data.delete(key) },
} });
const key = "panico-de-estado:mundo:v1";
data.set(key, JSON.stringify({ done: ["flavio:chicote-expresso"] }));
assert.equal(isDone("flavio", CHICOTE_EXPRESSO.id), true);
assert.deepEqual(readSave().progress, {});
saveProgress("lula", OPERACAO_CADEADO.id, "fechar", "cadeado");
assert.equal(readSave().progress.lula?.holding, "cadeado");
assert.equal(isDone("flavio", CHICOTE_EXPRESSO.id), true);
markDone("lula", OPERACAO_CADEADO.id);
markDone("lula", OPERACAO_CADEADO.id);
assert.equal(readSave().done.filter((id) => id === "lula:operacao-cadeado").length, 1);
clearSave("lula");
assert.equal(isDone("lula", OPERACAO_CADEADO.id), false);
assert.equal(isDone("flavio", CHICOTE_EXPRESSO.id), true);
assert.equal(readSave().progress.lula, undefined);
for (const corrupt of ["null", "{", "[]", '{"done":17,"progress":{"lula":{"step":3}}}']) {
  data.set(key, corrupt);
  assert.deepEqual(readSave(), { done: [], progress: {} });
}
Object.defineProperty(window, "localStorage", { get: () => { throw new Error("armazenamento bloqueado"); } });
assert.deepEqual(readSave(), { done: [], progress: {} });
assert.doesNotThrow(() => { markDone("lula", OPERACAO_CADEADO.id); saveProgress("lula", "x", "y", null); clearSave("lula"); });

assert.equal(drainStamina(100, 10, true), 0, "energia não fica negativa");
assert.equal(drainStamina(0, 10, false), 0, "caminhada continua disponível sem energia");
assert.equal(drainStamina(80, 10, false), 80, "andar e dirigir não gastam energia");
assert.equal(drainStamina(100, 1, true), drainStamina(drainStamina(100, 0.5, true), 0.5, true), "dreno independente da taxa de quadros");
console.log("Mundo OK: cinco missões, ações fora de ordem, progresso, saves separados e energia.");
