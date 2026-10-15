// Checa o roteiro das duas rotas sem abrir o navegador.
// Uso: pnpm check:content
import { CHARACTERS } from "../src/game/characters";
import { ROUTES } from "../src/game/routes";
import type { Beat, Episode, Task } from "../src/game/types";
import { isFree } from "../src/world/game/collide";
import { LOOKS } from "../src/world/looks";
import { buildingsFor, CACHACA_STOPS, ITEMS, npcsFor, PLACES, SPAWN, buildingRect, solidRects } from "../src/world/map";
import { missionsFor } from "../src/world/mission";

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

// ---------- Mundo 2D: mapa e missão ----------
for (const hero of ["lula", "flavio"] as const) {
  const BUILDINGS = buildingsFor(hero);
  const NPCS = npcsFor(hero);
  const solids = solidRects(hero);
  const npcIds = new Set<string>();
  for (const n of NPCS) {
    if (npcIds.has(n.id)) warn("mundo", `morador repetido "${n.id}"`);
    npcIds.add(n.id);
    if (!(n.look in LOOKS)) warn(`mundo/${n.id}`, `aparência desconhecida "${n.look}"`);
    if (!isFree(n.x, n.y, 6, solids)) warn(`mundo/${n.id}`, "começa dentro de algo sólido");
    for (const p of n.route ?? [])
      if (BUILDINGS.some((b) => { const r = buildingRect(b); return p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h; }))
        warn(`mundo/${n.id}`, `percurso atravessa um prédio em (${p.x}, ${p.y})`);
  }
  if (!isFree(SPAWN.hero.x, SPAWN.hero.y, 11, solids)) warn("mundo", "protagonista começa dentro de algo sólido");
  if (!isFree(SPAWN.car.x, SPAWN.car.y, 15, solids)) warn("mundo", "carro começa dentro de algo sólido");

  if (hero === "lula") for (const p of CACHACA_STOPS)
    if (!isFree(p.x, p.y, 11, solids)) warn("mundo/cachaça", `${p.name} está dentro de algo sólido`);

  for (const m of missionsFor(hero)) {
  const steps = new Set(m.steps.map((s) => s.id));
  if (!steps.has(m.finalStep)) warn(m.id, `etapa final "${m.finalStep}" não existe`);
  for (const st of m.steps) {
    if (st.objective.length > 70) warn(`${m.id}/${st.id}`, "objetivo longo demais para o HUD");
    if (st.target?.kind === "npc" && !npcIds.has(st.target.id)) warn(`${m.id}/${st.id}`, `alvo "${st.target.id}" não existe`);
    if (st.target?.kind === "item" && !(st.target.id in ITEMS)) warn(`${m.id}/${st.id}`, `item "${st.target.id}" não existe`);
    if (st.target?.kind === "place" && !(st.target.id in PLACES)) warn(`${m.id}/${st.id}`, `lugar "${st.target.id}" não existe`);
    if (st.target?.kind === "place" && PLACES[st.target.id] && !isFree(PLACES[st.target.id].x, PLACES[st.target.id].y, 11, solids)) warn(`${m.id}/${st.id}`, "interação dentro de algo sólido");
    if (st.target?.kind === "item" && ITEMS[st.target.id]) {
      const item = ITEMS[st.target.id];
      if (item.hero !== hero) warn(`${m.id}/${st.id}`, "item pertence ao outro Brasil");
      if (!isFree(item.x, item.y + 42, 11, solids)) warn(`${m.id}/${st.id}`, "objeto não tem acesso livre pela frente");
    }
  }
  for (const t of m.transitions) {
    if (!steps.has(t.from) || !steps.has(t.to)) warn(m.id, `transição ${t.from} → ${t.to} com etapa inexistente`);
    for (const l of t.lines) {
      if (l.who !== "hero" && !npcIds.has(l.who)) warn(`${m.id}/${t.from}`, `fala de morador desconhecido "${l.who}"`);
      if (l.text.length > 90) warn(`${m.id}/${t.from}`, `fala longa demais para o balão: "${l.text.slice(0, 40)}…"`);
    }
  }
  for (const [step, byNpc] of Object.entries(m.talk)) {
    if (!steps.has(step)) warn(m.id, `falas para etapa inexistente "${step}"`);
    for (const id of Object.keys(byNpc)) if (!npcIds.has(id)) warn(`${m.id}/${step}`, `falas para morador desconhecido "${id}"`);
  }
  // a missão precisa terminar: a partir da primeira etapa, as transições chegam à final
  let cur = m.steps[0].id;
  for (let i = 0; i < m.steps.length && cur !== m.finalStep; i++) cur = m.transitions.find((t) => t.from === cur)?.to ?? cur;
  if (cur !== m.finalStep) warn(m.id, "a missão não chega à etapa final");
  console.log(`mundo: ${NPCS.length} moradores, ${BUILDINGS.length} prédios, missão ${m.title} com ${m.steps.length} etapas`);
  }
}

if (problems.length) {
  console.error(`\n${problems.length} problema(s):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("\nRoteiro OK.");
