"use client";

import { useEffect, useRef } from "react";
import { RESULT_LABEL, type Progress } from "@/game/engine";
import { otherRoute, ROUTES } from "@/game/routes";
import type { EpisodeResult, Reward, RouteDef } from "@/game/types";
import Disclaimer from "./Disclaimer";
import { PropIcon } from "./Props";
import Stage from "./Stage";

export default function EndingScreen({
  route,
  endingId,
  results,
  rewards,
  progress,
  onOther,
  onReplay,
  onTitle,
}: {
  route: RouteDef;
  endingId: string;
  results: EpisodeResult[];
  rewards: Reward[];
  progress: Progress;
  onOther: () => void;
  onReplay: () => void;
  onTitle: () => void;
}) {
  const ending = route.endings[endingId];
  const heading = useRef<HTMLHeadingElement>(null);
  const other = ROUTES[otherRoute(route.id)];
  const all = Object.keys(route.endings);
  const found = all.filter((id) => progress.endings.includes(`${route.id}:${id}`));

  useEffect(() => heading.current?.focus({ preventScroll: true }), []);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-5 pb-10 pt-14">
      <Stage
        backdrop={ending.backdrop}
        scene={endingId === "sair" ? { portal: "OUTRO BRASIL", cartaz: "FECHADO PARA MEDO" } : { cartaz: "VOLTE SEMPRE (VOCÊ VAI VOLTAR)" }}
        actors={ending.tableau.map((t) => ({ id: t.who, x: t.x, mood: t.mood, holding: t.holding ?? null }))}
      />

      <section className="flex flex-col gap-4 px-4 sm:px-0" aria-labelledby="ending-title">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
          Final · {route.name} · {found.length}/{all.length} descobertos
        </p>
        <h1
          id="ending-title"
          ref={heading}
          tabIndex={-1}
          className="title-glitch accent text-5xl font-black uppercase leading-[0.95] focus:outline-none"
        >
          {ending.title}
        </h1>
        <div className="space-y-3">
          {ending.lines.map((l, i) => (
            <p key={i} className="anim-rise text-lg leading-snug" style={{ animationDelay: `${0.2 + i * 0.45}s` }}>
              {l}
            </p>
          ))}
        </div>

        <section aria-label="Seu dia" className="rounded-xl border border-line bg-panel p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Seu dia neste Brasil</p>
          <ul className="mt-2 space-y-2">
            {route.episodes.map((e, i) => (
              <li key={e.id} className="flex items-center gap-3">
                {rewards[i] && <PropIcon id={rewards[i].prop} size={40} label={rewards[i].name} />}
                <span className="min-w-0">
                  <span className="block text-sm font-bold leading-tight">{e.title.replace(/^Episódio \d — /, "")}</span>
                  <span className="block text-xs text-muted">{results[i] ? RESULT_LABEL[results[i]] : "—"}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onOther}
            className="bg-accent h-16 rounded-2xl text-lg font-black uppercase tracking-wide text-ink transition hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-bone"
          >
            Jogar o outro Brasil: {other.name.replace("Brasil: ", "")} →
          </button>
          <button
            type="button"
            onClick={onReplay}
            className="min-h-12 rounded-xl border border-line px-4 text-bone/90 hover:border-bone/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-bone"
          >
            Jogar este Brasil de novo (outros finais)
          </button>
          <button
            type="button"
            onClick={onTitle}
            className="min-h-12 rounded-xl border border-line px-4 text-bone/90 hover:border-bone/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-bone"
          >
            Voltar ao início
          </button>
        </div>
        <Disclaimer />
      </section>
    </main>
  );
}
