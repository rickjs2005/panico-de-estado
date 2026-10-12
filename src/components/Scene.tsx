import type { CastSlot, Meters, SceneKind } from "@/game/types";
import Puppet from "./Puppet";

/** Fundo de cada tipo de cena, só com gradientes (nada de imagem externa). */
const BACKDROP: Record<SceneKind, string> = {
  chat: "from-[#1b2a22] via-[#14171c] to-black",
  speech: "from-[#1a1f33] via-[#121423] to-black",
  live: "from-[#2b1630] via-[#1a1020] to-black",
  press: "from-[#25212a] via-[#17151b] to-black",
  home: "from-[#0d1a24] via-[#0b1016] to-black",
  feed: "from-[#1d1b2e] via-[#141320] to-black",
  call: "from-[#1c0f14] via-[#120a0d] to-black",
};

const LABEL: Record<SceneKind, string> = {
  chat: "Grupo da família",
  speech: "Rede Nacional",
  live: "Ao vivo",
  press: "Coletiva",
  home: "Sala de estar",
  feed: "Em alta",
  call: "Ligação",
};

export default function Scene({
  kind,
  cast,
  meters,
  presidentId,
  size,
  className = "mx-4 mt-3",
}: {
  kind: SceneKind;
  cast: CastSlot[];
  meters: Meters;
  presidentId?: string;
  size?: number;
  className?: string;
}) {
  const count = cast.length;
  const pupSize = size ?? (count >= 4 ? 76 : count === 3 ? 92 : 104);
  const approval = meters.popularidade;
  const showApproval = kind === "speech" || kind === "press";

  return (
    <div
      className={`relative ${className} overflow-hidden rounded-2xl border border-line bg-gradient-to-b ${BACKDROP[kind]}`}
      aria-label={`Cena: ${LABEL[kind]}`}
      role="group"
    >
      {/* elementos de cenário */}
      {kind === "speech" && (
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-10 bg-[#24242e]">
          <div className="mx-auto h-full w-24 rounded-t-md bg-[#2e2e3a]" />
        </div>
      )}
      {kind === "press" && (
        <span aria-hidden className="absolute left-3 top-3 text-base tracking-tighter">
          🎤🎤🎤🎤
        </span>
      )}
      {kind === "home" && (
        <div aria-hidden className="absolute right-3 top-3 h-14 w-20 rounded border-4 border-[#2a2a35] bg-sky-300/10">
          <div className="bg-accent absolute inset-x-1 bottom-1 h-2 opacity-80" />
        </div>
      )}
      {(kind === "speech" || kind === "live") && (
        <span className="absolute left-3 top-3 rounded bg-siren px-2 py-0.5 text-[10px] font-black uppercase text-ink">
          ● Ao vivo
        </span>
      )}
      {kind === "chat" && (
        <span className="absolute left-3 top-3 rounded bg-acid/90 px-2 py-0.5 text-[10px] font-black uppercase text-ink">
          237 membros online
        </span>
      )}
      {showApproval && (
        <span className="absolute right-3 top-3 rounded bg-black/70 px-2 py-0.5 font-mono text-[10px] text-bone">
          Aprovação (Inst. Termômetro): {approval}%
        </span>
      )}

      <div className="relative flex items-end justify-center gap-1 px-2 pb-2 pt-9">
        {cast.map((c) => (
          <Puppet key={c.id} id={c.id} mood={c.mood} size={pupSize} />
        ))}
      </div>

      {presidentId && cast.some((c) => c.id === presidentId) && (
        <p className="relative px-3 pb-2 text-center text-[10px] text-muted">
          Caricatura hipotética. Não fala no jogo; só reage.
        </p>
      )}
    </div>
  );
}

/** Humor do presidente caricato de acordo com a popularidade. */
export function presidentMood(popularidade: number) {
  if (popularidade >= 60) return "comemora" as const;
  if (popularidade <= 35) return "desespero" as const;
  return "preocupado" as const;
}
