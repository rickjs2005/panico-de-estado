"use client";

import Disclaimer from "./Disclaimer";

export default function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-7 px-4 pb-10 pt-20">
      <div className="anim-rise">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-muted">
          Encaminhado com frequência
        </p>
        <h1 className="title-glitch text-6xl font-black uppercase leading-[0.9] sm:text-7xl">
          Pânico
          <br />
          de Estado
        </h1>
        <p className="mt-4 text-lg leading-snug text-bone/90">
          Um jogo curto de sátira política e terror psicológico. Dois Brasis hipotéticos, uma máquina de medo e um
          grupo da família que nunca dorme.
        </p>
      </div>

      <Disclaimer />

      <section aria-label="As duas rotas" className="grid gap-3">
        <div className="rounded-xl border border-siren/50 bg-siren/10 p-4">
          <p className="font-bold text-siren">Brasil: Governo Lula</p>
          <p className="mt-1 text-sm text-bone/85">Alguém jura que o churrasco de domingo vai ser estatizado.</p>
        </div>
        <div className="rounded-xl border border-acid/50 bg-acid/10 p-4">
          <p className="font-bold text-acid">Brasil: Governo Flávio</p>
          <p className="mt-1 text-sm text-bone/85">Alguém jura que o pão francês vai ser proibido.</p>
        </div>
        <p className="text-sm text-muted">
          Nenhum dos dois boatos é verdade. Isso nunca impediu ninguém.
        </p>
      </section>

      <button
        type="button"
        onClick={onStart}
        className="h-16 rounded-2xl bg-bone text-xl font-black uppercase tracking-wide text-ink transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-alarm"
      >
        Começar
      </button>
      <p className="text-center text-xs text-muted">
        Cerca de 5 minutos · Funciona melhor no celular · Sem sustos repentinos
      </p>
    </main>
  );
}
