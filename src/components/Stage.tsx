import type { SceneKind } from "@/game/types";

/**
 * Ilustrações em silhueta, propositalmente genéricas.
 * Nenhuma imagem de pessoa real: só formas, faixas e microfones.
 */

function Figure({ x, y, s = 1, sash = false, cap = false }: { x: number; y: number; s?: number; sash?: boolean; cap?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx="0" cy="-58" r="17" fill="#1d1d26" />
      {cap && <path d="M-18 -66 Q0 -84 18 -66 L26 -64 L-18 -62 Z" fill="#2a2a35" />}
      <path d="M-38 0 Q-36 -36 0 -38 Q36 -36 38 0 Z" fill="#1d1d26" />
      {sash && <path d="M-24 -30 L-14 -36 L24 -4 L14 0 Z" fill="var(--accent)" opacity="0.9" />}
    </g>
  );
}

function Mic({ x }: { x: number }) {
  return (
    <g>
      <line x1={x} y1="128" x2={x + 6} y2="102" stroke="#3a3a46" strokeWidth="2" />
      <rect x={x + 2} y="94" width="8" height="12" rx="3" fill="#4a4a58" />
    </g>
  );
}

export default function Stage({ kind, label }: { kind: SceneKind; label?: string }) {
  if (kind === "chat" || kind === "feed") return null;

  return (
    <figure className="relative mx-4 mt-3 overflow-hidden rounded-xl border border-line bg-gradient-to-b from-[#16161e] to-black">
      <svg viewBox="0 0 320 150" className="block h-auto w-full" role="img" aria-label={label ?? "Ilustração da cena"}>
        {kind === "speech" && (
          <>
            <rect x="0" y="0" width="320" height="150" fill="url(#glow)" />
            <defs>
              <radialGradient id="glow" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#000" stopOpacity="0" />
              </radialGradient>
            </defs>
            <Figure x={160} y={112} sash />
            <rect x="122" y="104" width="76" height="46" rx="4" fill="#24242e" />
            <circle cx="160" cy="124" r="9" fill="none" stroke="var(--accent)" strokeWidth="2" />
            <rect x="10" y="10" width="62" height="16" rx="3" fill="var(--accent)" />
            <text x="41" y="22" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0b0b0f">
              AO VIVO
            </text>
          </>
        )}
        {kind === "press" && (
          <>
            <Figure x={100} y={104} s={0.8} />
            <Figure x={220} y={104} s={0.8} />
            <Figure x={160} y={116} />
            <rect x="124" y="108" width="72" height="42" rx="4" fill="#24242e" />
            <Mic x={130} />
            <Mic x={150} />
            <Mic x={170} />
            <Mic x={186} />
            <text x="104" y="40" fontSize="12" fill="#a9a6b3">
              psst
            </text>
            <text x="206" y="40" fontSize="12" fill="#a9a6b3">
              psst
            </text>
          </>
        )}
        {kind === "live" && (
          <>
            <circle cx="160" cy="70" r="58" fill="none" stroke="#f2efe8" strokeOpacity="0.25" strokeWidth="6" />
            <Figure x={160} y={150} s={1.25} cap />
            <text x="262" y="60" fontSize="18">
              ❤
            </text>
            <text x="276" y="92" fontSize="14">
              ❤
            </text>
            <text x="254" y="118" fontSize="22">
              ❤
            </text>
            <rect x="10" y="10" width="62" height="16" rx="3" fill="#ff3b4f" />
            <text x="41" y="22" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0b0b0f">
              AO VIVO
            </text>
          </>
        )}
        {kind === "home" && (
          <>
            <rect x="0" y="118" width="320" height="32" fill="#101016" />
            <rect x="92" y="22" width="136" height="84" rx="6" fill="#0d1a24" stroke="#2a2a35" strokeWidth="4" />
            <rect x="100" y="30" width="120" height="68" fill="#7dd3fc" opacity="0.12" />
            <rect x="106" y="80" width="108" height="10" fill="var(--accent)" opacity="0.8" />
            <line x1="160" y1="106" x2="160" y2="118" stroke="#2a2a35" strokeWidth="4" />
            <rect x="24" y="96" width="40" height="22" rx="3" fill="#1d1d26" />
            <rect x="34" y="112" width="18" height="4" rx="2" fill="#f2efe8" opacity="0.6" />
          </>
        )}
        {kind === "call" && (
          <>
            <circle cx="160" cy="70" r="44" fill="none" stroke="var(--accent)" strokeOpacity="0.4" strokeWidth="2" className="anim-blink" />
            <circle cx="160" cy="70" r="32" fill="#1d1d26" />
            <text x="160" y="80" textAnchor="middle" fontSize="28" fontWeight="800" fill="#f2efe8">
              ?
            </text>
            <text x="160" y="136" textAnchor="middle" fontSize="13" fill="#a9a6b3" fontFamily="monospace">
              (seu próprio número)
            </text>
          </>
        )}
      </svg>
      {kind === "speech" && (
        <figcaption className="px-3 pb-2 text-[11px] text-muted">Presidente: versão caricata e hipotética.</figcaption>
      )}
    </figure>
  );
}
