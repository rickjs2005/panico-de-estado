"use client";

import { useEffect, useRef } from "react";
import { RESULT_LABEL } from "@/game/engine";
import type { EpisodeResult, Reward, RouteDef } from "@/game/types";
import { PropIcon } from "./Props";

/** Tela entre episódios: resultado, objeto ganho e o que vem a seguir. */
export default function Interlude({
  route,
  index,
  results,
  rewards,
  onNext,
}: {
  route: RouteDef;
  index: number;
  results: EpisodeResult[];
  rewards: Reward[];
  onNext: () => void;
}) {
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => btn.current?.focus({ preventScroll: true }), []);
  const done = route.episodes[index];
  const next = index + 1 < route.episodes.length ? route.episodes[index + 1] : route.finale;
  const last = rewards[rewards.length - 1];
  const result = results[results.length - 1];

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-4 pb-10 pt-20">
      <ol className="flex gap-2" aria-label="Progresso">
        {[...route.episodes, route.finale].map((e, i) => (
          <li
            key={e.id}
            className={`h-2 flex-1 rounded-full ${i < results.length ? "bg-accent" : "bg-line"}`}
            aria-label={`${e.title}${i < results.length ? " (concluído)" : ""}`}
          />
        ))}
      </ol>
      <p className="text-xs font-bold uppercase tracking-widest text-muted">{done.title}</p>
      <h1 className="accent text-3xl font-black uppercase leading-tight">{RESULT_LABEL[result]}</h1>

      {last && (
        <section className="anim-pop flex items-center gap-4 rounded-2xl border-2 border-alarm/60 bg-alarm/10 p-4" aria-label="Objeto ganho">
          <PropIcon id={last.prop} size={72} label={last.name} />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-alarm">Objeto desbloqueado</p>
            <p className="text-lg font-black leading-tight">{last.name}</p>
            <p className="mt-1 text-sm text-bone/85">{last.blurb}</p>
          </div>
        </section>
      )}

      <section aria-label="Coleção desta partida" className="flex gap-2">
        {rewards.map((r) => (
          <PropIcon key={r.name} id={r.prop} size={44} label={r.name} />
        ))}
      </section>

      <div className="rounded-xl border border-line bg-panel p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">A seguir</p>
        <p className="text-lg font-black">{next.title}</p>
        <p className="text-bone/85">{next.objective}</p>
      </div>

      <button
        ref={btn}
        type="button"
        onClick={onNext}
        className="bg-accent h-16 rounded-2xl text-xl font-black uppercase tracking-wide text-ink transition hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-bone"
      >
        Seguir o dia →
      </button>
    </main>
  );
}
