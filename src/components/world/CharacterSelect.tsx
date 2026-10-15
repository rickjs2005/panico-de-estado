"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Puppet from "@/components/Puppet";
import { LOOKS } from "@/world/looks";
import { CHICOTE_EXPRESSO, missionsFor } from "@/world/mission";
import { isDone } from "@/world/save";
import type { HeroId } from "@/world/types";

const HEROES: { id: HeroId; name: string; mission: string; color: string }[] = [
  { id: "lula", name: "Lula", mission: "4 missões · Brasil dos boatos", color: "#ff3b4f" },
  { id: "flavio", name: "Flávio Bolsonaro", mission: `Missão: ${CHICOTE_EXPRESSO.title}`, color: "#2fd27a" },
];

/** Escolha imediata do protagonista: um toque e o jogador já está no bairro. */
export default function CharacterSelect({ onPick }: { onPick: (hero: HeroId) => void }) {
  const [done, setDone] = useState<Record<HeroId, number>>({ lula: 0, flavio: 0 });
  useEffect(() => {
    setDone({
      lula: missionsFor("lula").filter((m) => isDone("lula", m.id)).length,
      flavio: missionsFor("flavio").filter((m) => isDone("flavio", m.id)).length,
    });
  }, []);

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-5 bg-[radial-gradient(circle_at_50%_0%,#2a2340,#0b0b0f_70%)] px-4 py-6 text-bone">
      <header className="text-center">
        <h1 className="title-glitch text-4xl font-black sm:text-5xl">Pânico de Estado</h1>
        <p className="mt-2 max-w-md text-sm text-muted sm:text-base">Um bairro fictício onde os boatos políticos viraram realidade. Escolha quem vai sair na rua.</p>
      </header>

      <div className="grid w-full max-w-xl grid-cols-2 gap-3 sm:gap-5">
        {HEROES.map((h) => (
          <button
            key={h.id}
            type="button"
            onClick={() => onPick(h.id)}
            className="group flex flex-col items-center rounded-2xl border-4 border-[#1e1424] bg-[#f4efe4] px-2 pb-3 pt-2 text-[#1e1424] shadow-[0_6px_0_#1e1424] transition active:translate-y-1 active:shadow-[0_2px_0_#1e1424] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2"
            style={{ outlineColor: h.color }}
          >
            <span className="flex h-[150px] items-end sm:h-[180px]">
              <Puppet id={h.id} look={LOOKS[h.id]} mood="comemora" size={128} showName={false} />
            </span>
            <span className="mt-1 text-lg font-black leading-tight sm:text-xl">{h.name}</span>
            <span className="mt-0.5 text-[11px] font-semibold leading-tight text-[#1e1424]/70 sm:text-xs">caricatura fictícia</span>
            <span className="mt-2 rounded-full px-2 py-1 text-[11px] font-bold leading-tight text-white sm:text-xs" style={{ background: h.color === "#2fd27a" ? "#1f8a4c" : "#c62835" }}>
              {h.mission}
              {done[h.id] > 0 ? ` · ${done[h.id]}/${missionsFor(h.id).length} ✓` : ""}
            </span>
            <span className="mt-3 rounded-xl border-4 border-[#1e1424] bg-[#ffd23f] px-4 py-1.5 text-base font-black">Jogar</span>
          </button>
        ))}
      </div>

      <section className="max-w-xl rounded-xl border border-line bg-panel/80 px-4 py-3 text-xs leading-relaxed text-muted sm:text-sm">
        <p>
          <strong className="text-bone">Universo fictício e satírico.</strong> Lula e Flávio aparecem como caricaturas inventadas, num Brasil
          onde os absurdos dos boatos viraram realidade. Nada aqui retrata fatos, falas ou intenções reais de ninguém.
        </p>
        <p className="mt-2">
          <strong className="text-bone">Controles:</strong> WASD ou setas para andar, Shift para correr e E para interagir. No celular, use o
          direcional e o botão de ação.
        </p>
      </section>

      <Link href="/episodios" className="text-xs text-muted underline underline-offset-4 hover:text-bone">
        Jogar os episódios da versão anterior
      </Link>
    </main>
  );
}
