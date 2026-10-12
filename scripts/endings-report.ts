// Percorre todos os caminhos possíveis de cada rota e conta quantos levam a cada final.
// Uso: pnpm endings
import { applyEffects, INITIAL_METERS, pickEnding } from "../src/game/engine";
import { ROUTES } from "../src/game/routes";
import type { EndingId, Meters, RouteDef } from "../src/game/types";

function walk(route: RouteDef, i: number, m: Meters, ignores: number, out: Record<string, number>) {
  if (i === route.rounds.length) {
    const e: EndingId = pickEnding(m, ignores);
    out[e] = (out[e] ?? 0) + 1;
    return;
  }
  for (const c of route.rounds[i].choices) walk(route, i + 1, applyEffects(m, c.effects), ignores + (c.ignore ? 1 : 0), out);
}

for (const route of Object.values(ROUTES)) {
  const out: Record<string, number> = {};
  walk(route, 0, INITIAL_METERS, 0, out);
  console.log(route.name, out);
}
