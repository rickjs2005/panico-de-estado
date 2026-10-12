"use client";

import { ROUTE_ORDER, ROUTES } from "@/game/routes";
import type { RouteId } from "@/game/types";
import Puppet from "./Puppet";

const STYLE: Record<RouteId, { card: string; label: string }> = {
  lula: { card: "border-siren/60 bg-siren/10 hover:bg-siren/20 focus-visible:ring-siren", label: "text-siren" },
  flavio: { card: "border-acid/60 bg-acid/10 hover:bg-acid/20 focus-visible:ring-acid", label: "text-acid" },
};

export default function RouteSelect({ onPick, onBack }: { onPick: (id: RouteId) => void; onBack: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-4 pb-10 pt-20">
      <div className="anim-rise">
        <h1 className="text-3xl font-black uppercase leading-tight">Escolha o seu Brasil</h1>
        <p className="mt-2 text-bone/85">Os dois são hipotéticos. Os dois estão em pânico. Os dois têm o mesmo grupo da família.</p>
      </div>

      {ROUTE_ORDER.map((id, i) => {
        const r = ROUTES[id];
        return (
          <button
            key={id}
            type="button"
            onClick={() => onPick(id)}
            style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            className={`anim-rise flex gap-3 rounded-2xl border-2 p-4 text-left transition focus:outline-none focus-visible:ring-4 ${STYLE[id].card}`}
          >
            <Puppet id={r.roles.president} mood="preocupado" size={84} />
            <span className="min-w-0">
              <span className={`block text-xl font-black ${STYLE[id].label}`}>{r.name}</span>
              <span className="mt-1 block text-sm leading-snug text-bone/90">{r.tagline}</span>
              <span className="mt-2 block text-xs text-muted">Você trabalha no {r.ministry}.</span>
              <span className={`mt-2 inline-block text-sm font-bold uppercase tracking-wide ${STYLE[id].label}`}>
                Entrar neste Brasil →
              </span>
            </span>
          </button>
        );
      })}

      <p className="text-sm text-muted">
        Universo fictício. Os presidentes aparecem como caricaturas hipotéticas, sem falas: só reagem.
      </p>

      <button
        type="button"
        onClick={onBack}
        className="h-12 rounded-xl border border-line text-bone/80 hover:border-bone/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-bone"
      >
        ← Voltar
      </button>
    </main>
  );
}
