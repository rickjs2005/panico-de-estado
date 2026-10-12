"use client";

import Disclaimer from "./Disclaimer";
import Puppet from "./Puppet";

export default function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-4 pb-10 pt-20">
      <div className="anim-rise">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-muted">Encaminhado com frequência</p>
        <h1 className="title-glitch text-6xl font-black uppercase leading-[0.9] sm:text-7xl">
          Pânico
          <br />
          de Estado
        </h1>
        <p className="mt-4 text-lg leading-snug text-bone/90">
          Uma sátira política com terror psicológico e humor absurdo. Dois Brasis hipotéticos, uma máquina de boatos e
          um grupo da família que nunca dorme.
        </p>
      </div>

      <div
        className="anim-rise flex items-end justify-center gap-1 rounded-2xl border border-line bg-gradient-to-b from-[#1b1b26] to-black px-2 pb-2 pt-4"
        style={{ animationDelay: "0.2s" }}
        aria-label="Elenco: Lula e Flávio em caricaturas hipotéticas, Tia Nilza e Tio Osvaldo"
        role="group"
      >
        <Puppet id="lula" mood="preocupado" size={78} />
        <Puppet id="nilza" mood="susto" size={78} />
        <Puppet id="osvaldo" mood="desespero" size={78} />
        <Puppet id="flavio" mood="preocupado" size={78} />
      </div>

      <Disclaimer />

      <section aria-label="As duas rotas" className="grid gap-3">
        <div className="rounded-xl border border-siren/50 bg-siren/10 p-4">
          <p className="font-bold text-siren">Brasil: Governo Lula</p>
          <p className="mt-1 text-sm text-bone/85">Juram que vão fechar as igrejas. A tia já levou as cadeiras para casa.</p>
        </div>
        <div className="rounded-xl border border-acid/50 bg-acid/10 p-4">
          <p className="font-bold text-acid">Brasil: Governo Flávio</p>
          <p className="mt-1 text-sm text-bone/85">Juram que o país vai ser entregue aos EUA. O tio já escondeu o feijão.</p>
        </div>
        <p className="text-sm text-muted">Nenhum boato é verdade. Isso nunca impediu ninguém.</p>
      </section>

      <button
        type="button"
        onClick={onStart}
        className="h-16 rounded-2xl bg-bone text-xl font-black uppercase tracking-wide text-ink transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-alarm"
      >
        Começar
      </button>
      <p className="text-center text-xs text-muted">
        Cerca de 7 minutos · Feito para celular · Sem sustos repentinos · Tem “tempo extra” lá em cima
      </p>
    </main>
  );
}
