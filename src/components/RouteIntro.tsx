"use client";

import { character } from "@/game/characters";
import type { RouteDef } from "@/game/types";
import Disclaimer from "./Disclaimer";
import Puppet from "./Puppet";

export default function RouteIntro({ route, onBegin, onBack }: { route: RouteDef; onBegin: () => void; onBack: () => void }) {
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

      <section aria-label="Boatos desta rota" className="rounded-xl border border-dashed border-alarm/70 p-4">
        <p className="font-bold text-alarm">Boatos que vão circular (todos inventados para o jogo)</p>
        <ul className="mt-2 space-y-1 text-bone/90">
          {route.rumors.map((r) => (
            <li key={r}>• {r}</li>
          ))}
        </ul>
      </section>

      <section aria-label="Como jogar" className="rounded-xl border border-line bg-panel p-4">
        <p className="font-bold">Como jogar</p>
        <ul className="mt-2 space-y-1 text-sm text-bone/90">
          <li>⚡ <strong>Ações rápidas:</strong> silencie notificações, corte o sinal na hora certa, jogue boatos no lixo.</li>
          <li>🗳 <strong>Decisões:</strong> escolha uma reação, às vezes contra o relógio.</li>
          <li>🎭 Os bonecos reagem a tudo. O celular também.</li>
        </ul>
        <ul className="mt-3 space-y-1 text-sm text-bone/85">
          <li>
            <strong className="text-siren">Pânico</strong>: acelera as notificações e escurece a tela.
          </li>
          <li>
            <strong className="text-alarm">Popularidade</strong>: muda a cara do presidente caricato.
          </li>
          <li>
            <strong className="text-sky-300">Caos</strong>: entorta a interface e enche o rodapé de manchetes.
          </li>
        </ul>
      </section>

      <section aria-label="Elenco" className="rounded-xl border border-line bg-panel p-4">
        <p className="font-bold">Elenco (secundários inventados; presidente em caricatura hipotética)</p>
        <ul className="mt-3 grid grid-cols-3 gap-x-2 gap-y-4">
          {route.cast.map((id) => (
            <li key={id} className="flex flex-col items-center text-center">
              <Puppet id={id} size={72} showName={false} />
              <span className="accent mt-1 text-xs font-bold leading-tight">{character(id).name}</span>
              <span className="mt-0.5 text-[11px] leading-tight text-bone/70">{character(id).role}</span>
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
        Bater o ponto
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
