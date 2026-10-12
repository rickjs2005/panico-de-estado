"use client";

import type { RouteDef } from "@/game/types";
import Disclaimer from "./Disclaimer";

export default function RouteIntro({
  route,
  onBegin,
  onBack,
}: {
  route: RouteDef;
  onBegin: () => void;
  onBack: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-4 pb-10 pt-20">
      <h1 className="accent text-3xl font-black uppercase leading-tight">{route.name}</h1>

      <div className="space-y-2 text-lg leading-snug">
        {route.intro.map((t, i) => (
          <p key={i} className="anim-rise" style={{ animationDelay: `${i * 0.25}s` }}>
            {t}
          </p>
        ))}
      </div>

      <section aria-label="Como jogar" className="rounded-xl border border-line bg-panel p-4">
        <p className="font-bold">Como jogar</p>
        <p className="mt-1 text-bone/85">Leia a situação. Toque numa reação. Veja o estrago.</p>
        <ul className="mt-3 space-y-1 text-sm text-bone/85">
          <li>
            <strong className="text-siren">Pânico</strong>: o quanto o país (e você) está surtando.
          </li>
          <li>
            <strong className="text-alarm">Popularidade</strong>: o quanto gostam do governo hoje.
          </li>
          <li>
            <strong className="text-sky-300">Caos</strong>: quantas versões da mesma crise existem.
          </li>
        </ul>
      </section>

      <section aria-label="Elenco" className="rounded-xl border border-line bg-panel p-4">
        <p className="font-bold">Elenco (todos inventados)</p>
        <ul className="mt-2 space-y-2 text-sm">
          {route.cast.map((c) => (
            <li key={c.name}>
              <span className="font-semibold accent">{c.name}</span>
              <span className="text-bone/80"> — {c.role}</span>
            </li>
          ))}
        </ul>
      </section>

      <Disclaimer />

      <button
        type="button"
        onClick={onBegin}
        className="bg-accent h-16 rounded-2xl text-xl font-black uppercase tracking-wide text-ink transition hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-bone"
      >
        Desbloquear o celular
      </button>
      <button
        type="button"
        onClick={onBack}
        className="h-12 rounded-xl border border-line text-bone/80 hover:border-bone/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-bone"
      >
        ← Escolher outro Brasil
      </button>
    </main>
  );
}
