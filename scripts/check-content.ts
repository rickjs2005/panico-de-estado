// Checa o roteiro das duas rotas sem abrir o navegador.
// Uso: pnpm check:content
import { CHARACTERS } from "../src/game/characters";
import { ROUTES } from "../src/game/routes";
import type { Beat, Episode, Task } from "../src/game/types";

const problems: string[] = [];
const warn = (where: string, msg: string) => problems.push(`${where}: ${msg}`);

/** Chaves que cada tarefa pode devolver. */
function keysOf(task: Task): string[] {
  if (task.kind === "find") return [...new Set(task.start.filter((i) => i.target).map((i) => i.target!)), "desabou", "tempo"];
  if (task.kind === "assign") return ["otimo", "medio", "ruim"];
  return ["otimo", "medio", "travou"];
}

function hasOutcome(beats: Beat[]): boolean {
  return beats.some((b) => b.t === "outcome" || (b.t === "task" && Object.values(b.branches).every(hasOutcome)));
}

function walk(where: string, beats: Beat[]) {
  for (const b of beats) {
    if ("who" in b && !CHARACTERS[b.who]) warn(where, `personagem desconhecido "${b.who}"`);
    if (b.t === "say" && b.text.length > 140) warn(where, `fala longa demais (${b.text.length} caracteres): "${b.text.slice(0, 40)}…"`);
    if (b.t === "task") {
      for (const k of keysOf(b.task)) if (!b.branches[k] && !b.branches.default) warn(where, `tarefa sem ramo para "${k}"`);
      for (const [k, br] of Object.entries(b.branches)) {
        if (!hasOutcome(br)) warn(`${where} › ${k}`, "ramo sem resultado (outcome)");
        walk(`${where} › ${k}`, br);
      }
    }
    if (b.t === "choice") b.options.forEach((o) => walk(`${where} › ${o.label}`, o.beats));
  }
}

function countSays(beats: Beat[]): number {
  return beats.reduce(
    (n, b) =>
      n +
      (b.t === "say" || b.t === "narrate" ? 1 : 0) +
      (b.t === "task" ? Math.max(...Object.values(b.branches).map(countSays)) : 0),
    0,
  );
}

for (const route of Object.values(ROUTES)) {
  const eps: Episode[] = [...route.episodes, route.finale];
  for (const ep of eps) {
    walk(`${route.id}/${ep.id}`, ep.beats);
    const tasks = ep.beats.filter((b) => b.t === "task" || b.t === "choice").length;
    if (tasks === 0) warn(`${route.id}/${ep.id}`, "episódio sem interação");
    console.log(`${route.id}/${ep.id}: ${countSays(ep.beats)} falas no caminho mais longo, ${tasks} interação(ões)`);
  }
  const flags = route.finale.beats.flatMap((b) => (b.t === "choice" ? b.options.map((o) => o.flag) : []));
  for (const f of flags) if (f && !route.endings[f]) warn(route.id, `flag "${f}" sem final`);
  // Com qualquer número de vitórias, o desfecho precisa oferecer pelo menos 4 opções.
  const choice = route.finale.beats.find((b) => b.t === "choice");
  if (choice && choice.t === "choice")
    for (let w = 0; w <= 3; w++) {
      const n = choice.options.filter((o) => (o.minWins ?? 0) <= w && (o.maxWins ?? 3) >= w).length;
      if (n < 4) warn(route.id, `com ${w} vitória(s), só ${n} opções no desfecho`);
    }
}

if (problems.length) {
  console.error(`\n${problems.length} problema(s):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("\nRoteiro OK.");
