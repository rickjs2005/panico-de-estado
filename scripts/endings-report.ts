// Percorre todos os caminhos possíveis de cada rota e conta quantos levam a cada final.
// Decisões contam cada opção (e o tempo esgotado, se houver); minijogos contam bom, médio e ruim.
// Uso: pnpm endings
import { applyEffects, INITIAL_METERS, pickEnding } from "../src/game/engine";
import { ROUTES } from "../src/game/routes";
import type { EndingId, Meters, Outcome, Round, RouteDef } from "../src/game/types";

function outcomesOf(round: Round): Outcome[] {
  if (round.mode === "choice") return round.timeout ? [...round.choices, round.timeout] : round.choices;
  return [round.outcomes.good, round.outcomes.mid, round.outcomes.bad];
}

function walk(route: RouteDef, i: number, m: Meters, ignores: number, out: Record<string, number>) {
  if (i === route.rounds.length) {
    const e: EndingId = pickEnding(m, ignores);
    out[e] = (out[e] ?? 0) + 1;
    return;
  }
  for (const o of outcomesOf(route.rounds[i])) walk(route, i + 1, applyEffects(m, o.effects), ignores + (o.ignore ? 1 : 0), out);
}

for (const route of Object.values(ROUTES)) {
  const out: Record<string, number> = {};
  walk(route, 0, INITIAL_METERS, 0, out);
  const total = Object.values(out).reduce((a, b) => a + b, 0);
  console.log(route.name, `(${total} caminhos)`, out);
}
