"use client";

import Disclaimer from "./Disclaimer";
import Puppet from "./Puppet";

export default function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-4 pb-10 pt-20">
      <div className="anim-rise">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-muted">Sátira • Universo alternativo</p>
        <h1 className="title-glitch text-6xl font-black uppercase leading-[0.9] sm:text-7xl">
          Pânico
          <br />
          de Estado
        </h1>
        <p className="mt-4 text-xl font-bold leading-snug text-bone">
          E se o Brasil fosse exatamente aquele que mandaram você temer?
        </p>
      </div>

      <div
        className="flex items-end justify-center gap-1 rounded-2xl border border-line bg-gradient-to-b from-[#1b1b26] to-black px-2 pb-2 pt-4"
        role="group"
        aria-label="Lula com um cadeado gigante e Flávio carregando uma caixa, ambos em caricatura"
      >
        <Puppet id="lula" mood="carrega" holding="cadeado" size={92} />
        <Puppet id="nilza" mood="susto" size={70} />
        <Puppet id="valdir" mood="deboche" holding="kit" size={78} />
        <Puppet id="flavio" mood="carrega" holding="caixa" size={92} />
      </div>

      <Disclaimer />

      <p className="text-bone/90">
        Você é um cidadão comum com uma lista de tarefas banais. Só que hoje é o primeiro dia de um Brasil impossível,
        onde cada boato apocalíptico virou realidade. E alguém está vendendo kit de sobrevivência.
      </p>

      <button
        type="button"
        onClick={onStart}
        className="h-16 rounded-2xl bg-bone text-xl font-black uppercase tracking-wide text-ink transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-alarm"
      >
        Começar
      </button>
      <p className="text-center text-xs text-muted">
        2 rotas · 3 episódios cada · 5 a 8 minutos por rota · Toque, mouse ou teclado
      </p>
    </main>
  );
}
