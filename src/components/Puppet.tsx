import { character, type Look } from "@/game/characters";
import type { CharacterId, Mood, PropId } from "@/game/types";
import { PropArt } from "./Props";

/**
 * Boneco caricato em SVG. Corpo, cabelo e acessórios vêm de `characters.ts`;
 * braços, olhos e boca mudam conforme o humor.
 */

const INK = "#141016";

// Pontas das mãos para cada humor, a partir dos ombros (34,100) e (86,100).
const ARMS: Record<Mood, [number, number, number, number]> = {
  neutro: [26, 142, 94, 142],
  preocupado: [52, 116, 68, 116],
  deboche: [24, 126, 112, 78],
  susto: [6, 82, 114, 82],
  comemora: [20, 42, 100, 42],
  desespero: [40, 36, 80, 36],
  aponta: [26, 142, 118, 86],
  carrega: [44, 114, 76, 114],
  fala: [26, 142, 102, 94],
};

/** Poses novas reaproveitam as caras das antigas. */
export type Face = "neutro" | "preocupado" | "deboche" | "susto" | "comemora" | "desespero" | "fala";
const FACE: Record<Mood, Face> = {
  neutro: "neutro",
  preocupado: "preocupado",
  deboche: "deboche",
  susto: "susto",
  comemora: "comemora",
  desespero: "desespero",
  aponta: "fala",
  carrega: "preocupado",
  fala: "fala",
};

/** Objetos que o boneco segura maiores que o normal (a piada é o tamanho). */
const BIG: Record<string, number> = { cadeado: 64, "mapa-brasil": 66, caixa: 54, refinaria: 66, kit: 48, calculadora: 36 };

/**
 * Só a cabeça do boneco (cabelo, rosto, barba, olhos e boca), no mesmo sistema de
 * coordenadas do Puppet (viewBox 0 0 120 150). O mundo 2D usa esta peça para gerar
 * a vista de frente dos personagens.
 */
export function PuppetHead({ look, face, eyesFace = face }: { look: Look; face: Face; eyesFace?: Face }) {
  return (
    <g>
      <HairBack look={look} />
      <rect x="54" y="74" width="12" height="14" fill={look.skin} />
      <ellipse cx="60" cy="54" rx="27" ry="29" fill={look.skin} />
      <circle cx="33" cy="56" r="4" fill={look.skin} />
      <circle cx="87" cy="56" r="4" fill={look.skin} />
      {look.beard === "cheia" && (
        <path d="M34 58 Q34 90 60 90 Q86 90 86 58 Q80 74 60 76 Q40 74 34 58 Z" fill={look.beardColor ?? look.hairColor} />
      )}
      <HairFront look={look} />
      {look.hair === "bone" && (
        <g>
          <path d="M32 46 Q32 22 60 22 Q88 22 88 46 Z" fill={look.capColor ?? "#333"} />
          <path d="M30 46 L100 46 Q96 52 84 50 L30 50 Z" fill={look.capColor ?? "#333"} opacity="0.85" />
        </g>
      )}
      <Eyes mood={eyesFace} look={look} />
      {look.beard === "bigode" && (
        <path d="M48 64 Q60 58 72 64 Q66 68 60 65 Q54 68 48 64 Z" fill={look.beardColor ?? look.hairColor} />
      )}
      <Mouth mood={face} />
      {look.headset && (
        <g stroke="#222" strokeWidth="3" fill="none">
          <path d="M32 52 Q32 22 60 22 Q88 22 88 52" />
          <path d="M34 62 Q40 74 52 72" strokeWidth="2" />
          <rect x="28" y="48" width="8" height="14" rx="3" fill="#222" />
        </g>
      )}
    </g>
  );
}

function Eyes({ mood, look }: { mood: Face; look: Look }) {
  const brows = (l: string, r: string) => (
    <g stroke={INK} strokeWidth="2.4" strokeLinecap="round" fill="none">
      <path d={l} />
      <path d={r} />
    </g>
  );
  let eyes: React.ReactNode;
  switch (mood) {
    case "susto":
      eyes = (
        <>
          <circle cx="50" cy="52" r="6" fill="#fff" stroke={INK} strokeWidth="1.5" />
          <circle cx="70" cy="52" r="6" fill="#fff" stroke={INK} strokeWidth="1.5" />
          <circle cx="50" cy="53" r="2.2" fill={INK} />
          <circle cx="70" cy="53" r="2.2" fill={INK} />
          {brows("M43 40 Q50 35 56 40", "M64 40 Q70 35 77 40")}
        </>
      );
      break;
    case "comemora":
      eyes = (
        <g stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none">
          <path d="M45 54 Q50 47 55 54" />
          <path d="M65 54 Q70 47 75 54" />
        </g>
      );
      break;
    case "deboche":
      eyes = (
        <>
          <g stroke={INK} strokeWidth="2.6" strokeLinecap="round">
            <line x1="45" y1="53" x2="55" y2="53" />
            <line x1="65" y1="53" x2="75" y2="53" />
          </g>
          {brows("M44 46 L56 46", "M64 41 Q70 37 76 42")}
        </>
      );
      break;
    case "desespero":
      eyes = (
        <>
          <circle cx="50" cy="53" r="2.8" fill={INK} />
          <circle cx="70" cy="53" r="2.8" fill={INK} />
          <path d="M47 58 Q45 64 47 66 Q50 64 47 58" fill="#7cc4ff" />
          <path d="M73 58 Q71 64 73 66 Q76 64 73 58" fill="#7cc4ff" />
          {brows("M43 48 L56 43", "M64 43 L77 48")}
        </>
      );
      break;
    case "preocupado":
      eyes = (
        <>
          <circle cx="50" cy="53" r="2.6" fill={INK} />
          <circle cx="70" cy="53" r="2.6" fill={INK} />
          {brows("M44 44 L56 47", "M64 47 L76 44")}
        </>
      );
      break;
    default:
      eyes = (
        <>
          <circle cx="50" cy="53" r="2.6" fill={INK} />
          <circle cx="70" cy="53" r="2.6" fill={INK} />
        </>
      );
  }
  const ownBrows = mood === "susto" || mood === "deboche" || mood === "desespero" || mood === "preocupado";
  return (
    <>
      {eyes}
      {look.brows && !ownBrows && (
        <g stroke={look.hairColor} strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M42 44 Q50 39 57 43" />
          <path d="M63 43 Q70 39 78 44" />
        </g>
      )}
      {look.bags && (
        <g stroke="#7a5a8a" strokeWidth="1.6" fill="none" opacity="0.8">
          <path d="M45 58 Q50 61 55 58" />
          <path d="M65 58 Q70 61 75 58" />
        </g>
      )}
      {look.glasses === "grau" && (
        <g stroke={INK} strokeWidth="2" fill="rgba(255,255,255,0.12)">
          <circle cx="50" cy="53" r="7.5" />
          <circle cx="70" cy="53" r="7.5" />
          <line x1="57.5" y1="53" x2="62.5" y2="53" />
        </g>
      )}
      {look.glasses === "escuro" && (
        <g fill={INK}>
          <rect x="41" y="47" width="17" height="11" rx="4" />
          <rect x="62" y="47" width="17" height="11" rx="4" />
          <rect x="57" y="50" width="6" height="2.5" />
        </g>
      )}
    </>
  );
}

function Mouth({ mood }: { mood: Face }) {
  switch (mood) {
    case "fala":
      return <ellipse cx="60" cy="70" rx="6" ry="4" fill={INK} />;
    case "susto":
      return <ellipse cx="60" cy="70" rx="4.5" ry="6" fill={INK} />;
    case "comemora":
      return <path d="M49 66 Q60 80 71 66 Z" fill={INK} />;
    case "deboche":
      return <path d="M52 70 Q62 72 70 64" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />;
    case "desespero":
      return <path d="M50 74 Q60 62 70 74 Z" fill={INK} />;
    case "preocupado":
      return <path d="M51 71 Q55 67 60 71 Q65 75 69 71" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />;
    default:
      return <line x1="53" y1="70" x2="67" y2="70" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />;
  }
}

function HairBack({ look }: { look: Look }) {
  const c = look.hairColor;
  switch (look.hair) {
    case "longo":
      return <path d="M30 50 Q28 92 40 98 L80 98 Q92 92 90 50 Q60 20 30 50 Z" fill={c} />;
    case "cacheado":
      return (
        <g fill={c}>
          {[34, 44, 56, 68, 80, 86].map((x, i) => (
            <circle key={i} cx={x} cy={i % 2 ? 34 : 40} r="11" />
          ))}
          <circle cx="32" cy="58" r="9" />
          <circle cx="88" cy="58" r="9" />
        </g>
      );
    case "coque":
      return <circle cx="60" cy="20" r="11" fill={c} />;
    case "rabo":
      return <path d="M84 40 Q102 56 92 82 Q88 66 80 52 Z" fill={c} />;
    default:
      return null;
  }
}

function HairFront({ look }: { look: Look }) {
  const c = look.hairColor;
  switch (look.hair) {
    case "curto":
      return <path d="M33 48 Q34 24 60 24 Q86 24 87 48 Q78 34 60 34 Q42 34 33 48 Z" fill={c} />;
    case "coque":
    case "rabo":
    case "longo":
      return <path d="M33 50 Q34 24 60 25 Q86 24 87 50 Q74 32 60 33 Q46 32 33 50 Z" fill={c} />;
    case "careca":
      return (
        <g fill={c}>
          <path d="M33 56 Q32 42 38 38 L40 56 Z" />
          <path d="M87 56 Q88 42 82 38 L80 56 Z" />
        </g>
      );
    case "ondulado":
      return (
        <path
          d="M32 52 Q28 34 40 28 Q46 18 58 22 Q68 16 78 24 Q92 28 88 52 Q84 40 76 38 Q70 32 62 36 Q54 30 46 36 Q38 38 32 52 Z"
          fill={c}
        />
      );
    case "lateral":
      return <path d="M33 50 Q32 24 58 23 Q86 22 87 46 Q80 32 64 31 L50 36 Q40 38 33 50 Z" fill={c} />;
    case "raspado":
      return <path d="M34 46 Q36 26 60 26 Q84 26 86 46 Q74 34 60 34 Q46 34 34 46 Z" fill={c} opacity="0.85" />;
    case "cacheado":
      return null;
    case "bone":
      return null;
  }
}

function Body({ look, mood }: { look: Look; mood: Mood }) {
  const [lx, ly, rx, ry] = ARMS[mood];
  return (
    <g>
      {/* braços atrás do tronco */}
      <g stroke={look.shirt} strokeWidth="11" strokeLinecap="round" fill="none">
        <path d={`M34 100 Q${(34 + lx) / 2 - 4} ${(100 + ly) / 2} ${lx} ${ly}`} />
        <path d={`M86 100 Q${(86 + rx) / 2 + 4} ${(100 + ry) / 2} ${rx} ${ry}`} />
      </g>
      <circle cx={lx} cy={ly} r="6" fill={look.skin} />
      <circle cx={rx} cy={ry} r="6" fill={look.skin} />
      {look.phone && mood !== "comemora" && mood !== "desespero" && (
        <rect x={rx - 5} y={ry - 13} width="10" height="16" rx="2" fill="#111" stroke="#666" strokeWidth="1" />
      )}
      {/* tronco */}
      <path d="M28 150 Q26 98 44 92 L76 92 Q94 98 92 150 Z" fill={look.shirt} />
      <path d="M52 92 L60 102 L68 92 Z" fill={look.skin} />
      {look.tie && <path d="M57 100 L63 100 L65 128 L60 134 L55 128 Z" fill={look.tie} />}
      {look.sash && (
        <g>
          <path d="M36 96 L46 92 L90 140 L80 146 Z" fill="#1f8a4c" />
          <path d="M41 94 L45 92.5 L86 142 L82 144 Z" fill="#f2c230" />
        </g>
      )}
      {look.scarf && <path d="M44 92 Q60 104 76 92 L74 100 Q60 110 46 100 Z" fill={look.scarf} />}
      {look.badge && (
        <g>
          <line x1="60" y1="98" x2="66" y2="118" stroke="#d0d0d0" strokeWidth="1" />
          <rect x="60" y="116" width="14" height="16" rx="2" fill="#f2efe8" />
          <rect x="62" y="119" width="10" height="5" fill="#9aa" />
        </g>
      )}
    </g>
  );
}

const MOOD_CLASS: Record<Mood, string> = {
  aponta: "pup-idle",
  carrega: "pup-idle",
  fala: "pup-idle",
  neutro: "pup-idle",
  preocupado: "pup-idle",
  deboche: "pup-idle",
  susto: "pup-susto",
  comemora: "pup-comemora",
  desespero: "pup-desespero",
};

const MOOD_LABEL: Record<Mood, string> = {
  aponta: "apontando",
  carrega: "carregando algo",
  fala: "falando",
  neutro: "neutro",
  preocupado: "preocupado",
  deboche: "debochado",
  susto: "assustado",
  comemora: "comemorando",
  desespero: "desesperado",
};

export default function Puppet({
  id,
  mood = "neutro",
  size = 96,
  showName = true,
  holding,
  flip = false,
  talking = false,
  look: lookOverride,
}: {
  id: CharacterId;
  mood?: Mood;
  size?: number;
  showName?: boolean;
  holding?: PropId | null;
  flip?: boolean;
  talking?: boolean;
  /** Aparência alternativa (o mundo 2D usa versões com sobrancelhas marcadas). */
  look?: Look;
}) {
  const face = FACE[mood];
  const [, , rx, ry] = ARMS[mood];
  const held = holding ? (mood === "carrega" ? { x: 60, y: 112, size: BIG[holding] ?? 44 } : { x: rx, y: ry - 4, size: BIG[holding] ?? 30 }) : null;
  const c = character(id);
  const look = lookOverride ?? c.look;
  const short = c.name.replace(/ \(caricatura hipotética\)/, "");
  return (
    <figure className="flex shrink-0 flex-col items-center" style={{ width: size }}>
      <svg
        viewBox="0 0 120 150"
        width={size}
        height={size * 1.25}
        role="img"
        aria-label={`${c.name}, ${MOOD_LABEL[mood]}${holding ? " e segurando um objeto" : ""}`}
        className="overflow-visible"
      >
        <g transform={flip ? "translate(120 0) scale(-1 1)" : undefined}>
        <g className={talking ? "pup-talk" : MOOD_CLASS[mood]} style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}>
          {look.ringLight && <circle cx="60" cy="58" r="50" fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="5" />}
          <Body look={look} mood={mood} />
          <PuppetHead look={look} face={talking ? "fala" : face} eyesFace={face} />
          {held && holding && <PropArt id={holding} x={held.x} y={held.y} size={held.size} />}
        </g>
        </g>
      </svg>
      {showName && (
        <figcaption className="mt-1 line-clamp-2 text-center text-[11px] font-semibold leading-tight text-bone/85">{short}</figcaption>
      )}
    </figure>
  );
}
