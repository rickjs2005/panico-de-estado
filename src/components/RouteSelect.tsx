"use client";

import { ROUTE_ORDER, ROUTES } from "@/game/routes";
import type { RouteId } from "@/game/types";

const STYLE: Record<RouteId, { card: string; label: string }> = {
  lula: { card: "border-siren/60 bg-siren/10 hover:bg-siren/20 focus-visible:ring-siren", label: "text-siren" },
  flavio: { card: "border-acid/60 bg-acid/10 hover:bg-acid/20 focus-visible:ring-acid", label: "text-acid" },
};

export default function RouteSelect({ onPick, onBack }: { onPick: (id: RouteId) => void; onBack: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-4 pb-10 pt-20">
      <div className="anim-rise">
        <h1 className="text-3xl font-black uppercase leading-tight">Escolha o seu Brasil</h1>
        <p className="mt-2 text-bone/85">
          Os dois são hipotéticos. Os dois estão em pânico. Os dois têm o mesmo grupo da família.
        </p>
      </div>

      {ROUTE_ORDER.map((id, i) => {
        const r = ROUTES[id];
        return (
          <button
            key={id}
            type="button"
            onClick={() => onPick(id)}
            style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            className={`anim-rise rounded-2xl border-2 p-5 text-left transition focus:outline-none focus-visible:ring-4 ${STYLE[id].card}`}
          >
            <span className={`block text-2xl font-black ${STYLE[id].label}`}>{r.name}</span>
            <span className="mt-2 block text-base leading-snug text-bone/90">{r.tagline}</span>
            <span className="mt-3 block text-sm text-muted">Você trabalha no {r.ministry}.</span>
            <span className={`mt-4 inline-block font-bold uppercase tracking-wide ${STYLE[id].label}`}>
              Entrar neste Brasil →
            </span>
          </button>
        );
      })}

      <p className="text-sm text-muted">
        Universo fictício. Os presidentes aparecem como versões caricatas e hipotéticas, sem falas inventadas.
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
