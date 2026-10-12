"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Beat, ChoiceOption, Episode, EpisodeResult, Reward, Task } from "@/game/types";
import { useReducedMotion } from "@/lib/hooks";
import { sound } from "@/lib/sound";
import Stage, { type Actor, type Balloon } from "./Stage";
import { AssignTaskView, FindTaskView, StepsTaskView } from "./Tasks";

/**
 * Executa os beats de um episódio em ordem.
 * Beats que "esperam" (fala, narração, pausa, tarefa, escolha) seguram a fila;
 * os demais (entrar, mudar de cara, objetos) são aplicados na hora, com um
 * pequeno intervalo para a animação ser vista.
 */

type Waiting =
  | { kind: "say"; balloon: Balloon }
  | { kind: "narrate"; text: string }
  | { kind: "task"; task: Task; branches: Record<string, Beat[]> }
  | { kind: "choice"; prompt: string; options: ChoiceOption[] }
  | { kind: "pause" }
  | null;

const ENTER_MS = 450;

export interface EpisodeReport {
  result: EpisodeResult;
  reward?: Reward;
  flags: string[];
}

export default function EpisodePlayer({
  episode,
  timeScale,
  wins,
  onFinish,
}: {
  episode: Episode;
  timeScale: number;
  /** Quantas vitórias o jogador tem até aqui (algumas opções dependem disso). */
  wins: number;
  onFinish: (report: EpisodeReport) => void;
}) {
  const reduced = useReducedMotion();
  const [actors, setActors] = useState<Actor[]>([]);
  const [scene, setScene] = useState<Record<string, string>>(episode.scene ?? {});
  const [waiting, setWaiting] = useState<Waiting>(null);
  const [phone, setPhone] = useState<{ from: string; text: string } | null>(null);
  const [skipping, setSkipping] = useState(false);
  const queue = useRef<Beat[]>([...episode.beats]);
  const report = useRef<EpisodeReport>({ result: "meio", flags: [] });
  const timers = useRef<number[]>([]);
  const finished = useRef(false);
  const [tick, setTick] = useState(0);
  const advanceRef = useRef<HTMLButtonElement>(null);
  const skipRef = useRef(false);
  skipRef.current = skipping;

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  };

  // Limpa todos os temporizadores ao trocar de episódio.
  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);

  const next = useCallback(() => setTick((t) => t + 1), []);

  const apply = useCallback(
    (b: Beat) => {
      const fast = skipRef.current || reduced;
      switch (b.t) {
        case "enter":
          setActors((list) => [
            ...list.filter((a) => a.id !== b.who),
            {
              id: b.who,
              x: b.x,
              mood: b.mood ?? "neutro",
              holding: b.holding ?? null,
              flip: b.flip,
              scale: b.scale,
              anim: b.from === "right" ? "enter-right" : b.from === "left" ? "enter-left" : null,
            },
          ]);
          later(next, fast ? 30 : ENTER_MS);
          return;
        case "exit":
          setActors((list) => list.map((a) => (a.id === b.who ? { ...a, anim: b.to === "left" ? "exit-left" : "exit-right" } : a)));
          later(() => setActors((list) => list.filter((a) => a.id !== b.who)), fast ? 30 : 400);
          later(next, fast ? 30 : 250);
          return;
        case "move":
          setActors((list) => list.map((a) => (a.id === b.who ? { ...a, x: b.x, anim: null } : a)));
          later(next, fast ? 30 : 450);
          return;
        case "mood":
          setActors((list) => list.map((a) => (a.id === b.who ? { ...a, mood: b.mood, anim: null } : a)));
          later(next, 60);
          return;
        case "react":
          setActors((list) => list.map((a) => (b.moods[a.id] ? { ...a, mood: b.moods[a.id], anim: null } : a)));
          later(next, fast ? 30 : 250);
          return;
        case "hold":
          setActors((list) => list.map((a) => (a.id === b.who ? { ...a, holding: b.item, anim: null } : a)));
          later(next, 60);
          return;
        case "set":
          setScene((s) => {
            const n = { ...s };
            if (b.value === null) delete n[b.key];
            else n[b.key] = b.value;
            return n;
          });
          later(next, 60);
          return;
        case "sfx":
          if (!skipRef.current) playSfx(b.name);
          later(next, 0);
          return;
        case "phone":
          setPhone({ from: b.from, text: b.text });
          if (!skipRef.current) sound.ping();
          later(() => setPhone((p) => (p?.text === b.text ? null : p)), 4500);
          later(next, 0);
          return;
        case "pause":
          if (fast) {
            later(next, 0);
            return;
          }
          setWaiting({ kind: "pause" });
          later(() => {
            setWaiting(null);
            next();
          }, b.ms);
          return;
        case "say":
          if (b.mood) setActors((list) => list.map((a) => (a.id === b.who ? { ...a, mood: b.mood!, anim: null } : a)));
          if (skipRef.current) {
            later(next, 0);
            return;
          }
          setWaiting({ kind: "say", balloon: { who: b.who, text: b.text } });
          return;
        case "narrate":
          if (skipRef.current) {
            later(next, 0);
            return;
          }
          setWaiting({ kind: "narrate", text: b.text });
          return;
        case "task":
          setSkipping(false);
          setWaiting({ kind: "task", task: b.task, branches: b.branches });
          return;
        case "choice": {
          setSkipping(false);
          const options = b.options.filter(
            (o) => (o.minWins === undefined || wins >= o.minWins) && (o.maxWins === undefined || wins <= o.maxWins),
          );
          setWaiting({ kind: "choice", prompt: b.prompt, options });
          return;
        }
        case "outcome":
          report.current.result = b.result;
          if (b.reward) report.current.reward = b.reward;
          later(next, 0);
          return;
      }
    },
    [next, reduced, wins],
  );

  // Motor: sempre que nada estiver esperando, executa o próximo beat.
  useEffect(() => {
    if (waiting || finished.current) return;
    const b = queue.current.shift();
    if (!b) {
      finished.current = true;
      later(() => onFinish(report.current), 300);
      return;
    }
    apply(b);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, waiting]);

  // Fala nova: o botão de seguir recebe o foco (Enter/Espaço avançam). Escolha nova: a primeira opção.
  const choiceRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (waiting?.kind === "say" || waiting?.kind === "narrate") advanceRef.current?.focus({ preventScroll: true });
    if (waiting?.kind === "choice") choiceRef.current?.querySelector("button")?.focus({ preventScroll: true });
  }, [waiting]);

  const advance = () => {
    if (waiting?.kind !== "say" && waiting?.kind !== "narrate") return;
    sound.click();
    setWaiting(null);
  };

  const resolveBranch = (key: string) => {
    if (waiting?.kind !== "task") return;
    const branch = waiting.branches[key] ?? waiting.branches.default ?? [];
    queue.current = [...branch, ...queue.current];
    setWaiting(null);
  };

  const pick = (o: ChoiceOption) => {
    sound.click();
    if (o.flag) report.current.flags.push(o.flag);
    queue.current = [...o.beats, ...queue.current];
    setWaiting(null);
  };

  const skipDialogue = () => {
    setSkipping(true);
    if (waiting?.kind === "say" || waiting?.kind === "narrate" || waiting?.kind === "pause") setWaiting(null);
  };

  const talking = waiting?.kind === "say" || waiting?.kind === "narrate";

  return (
    <div className="flex flex-col">
      <div className="px-3 pb-2 pt-1 sm:px-0">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted">{episode.title}</p>
        <p className="text-base font-black leading-tight">
          <span className="accent">Objetivo:</span> {episode.objective}
        </p>
      </div>

      <Stage
        backdrop={episode.backdrop}
        scene={scene}
        actors={actors}
        balloon={waiting?.kind === "say" ? waiting.balloon : null}
        caption={waiting?.kind === "narrate" ? waiting.text : null}
        phone={phone}
        onTap={talking ? advance : undefined}
      />

      <div className="min-h-[140px] px-3 pb-6 pt-3 sm:px-0">
        {talking && (
          <div className="flex gap-2">
            <button
              ref={advanceRef}
              type="button"
              onClick={advance}
              className="bg-accent h-14 flex-1 rounded-xl text-lg font-black uppercase tracking-wide text-ink transition hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-bone"
            >
              ▶ Continuar
            </button>
            <button
              type="button"
              onClick={skipDialogue}
              className="h-14 rounded-xl border border-line px-3 text-sm font-bold text-bone/85 hover:border-bone/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-bone"
            >
              ⏩ Pular falas
            </button>
          </div>
        )}

        {waiting?.kind === "task" && (
          <div className="anim-rise space-y-2">
            <p className="accent text-sm font-black uppercase tracking-wide">{waiting.task.objective}</p>
            {waiting.task.kind === "find" && <FindTaskView task={waiting.task} timeScale={timeScale} onDone={resolveBranch} />}
            {waiting.task.kind === "assign" && <AssignTaskView task={waiting.task} timeScale={timeScale} onDone={resolveBranch} />}
            {waiting.task.kind === "steps" && <StepsTaskView task={waiting.task} onDone={resolveBranch} />}
          </div>
        )}

        {waiting?.kind === "choice" && (
          <div ref={choiceRef} className="anim-rise space-y-2" role="group" aria-label={waiting.prompt}>
            <p className="accent text-sm font-black uppercase tracking-wide">{waiting.prompt}</p>
            {waiting.options.map((o) => (
              <button
                key={o.label}
                type="button"
                onClick={() => pick(o)}
                className="min-h-14 w-full rounded-2xl border-2 border-line bg-panel px-4 py-3 text-left text-base font-semibold leading-snug transition hover:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-bone"
              >
                {o.label}
              </button>
            ))}
          </div>
        )}

        {(waiting === null || waiting.kind === "pause") && <p className="pt-4 text-center text-sm text-muted">…</p>}
      </div>
    </div>
  );
}

function playSfx(name: string) {
  switch (name) {
    case "porta":
      sound.porta();
      break;
    case "carimbo":
      sound.carimbo();
      break;
    case "ping":
      sound.ping();
      break;
    case "sucesso":
      sound.success();
      break;
    case "falha":
      sound.fail();
      break;
    case "pop":
      sound.pop();
      break;
    case "buzina":
      sound.buzina();
      break;
    case "tique":
      sound.tick();
      break;
  }
}
