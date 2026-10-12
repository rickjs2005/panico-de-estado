import type { PropId } from "@/game/types";

/**
 * Objetos do jogo, todos no mesmo traço de cartum editorial: contorno escuro,
 * cores chapadas. Cada um é desenhado numa caixa de 40×40.
 */

const K = "#141016";
const S = { stroke: K, strokeWidth: 2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

function Stamp({ word, color }: { word: string; color: string }) {
  return (
    <g>
      <rect x="15" y="4" width="10" height="14" rx="3" fill="#7a4b2a" {...S} />
      <rect x="8" y="17" width="24" height="7" rx="2" fill="#5a5a66" {...S} />
      <rect x="5" y="25" width="30" height="11" rx="2" fill={color} {...S} />
      <text x="20" y="33" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#fff" fontFamily="system-ui">
        {word}
      </text>
    </g>
  );
}

function Paper({ color = "#f4f0e6", lines = 3, tag }: { color?: string; lines?: number; tag?: string }) {
  return (
    <g>
      <path d="M9 4 H27 L33 10 V36 H9 Z" fill={color} {...S} />
      <path d="M27 4 V10 H33" fill="none" {...S} />
      {Array.from({ length: lines }, (_, i) => (
        <line key={i} x1="13" x2="29" y1={15 + i * 5} y2={15 + i * 5} stroke="#9a9488" strokeWidth="1.6" />
      ))}
      {tag && (
        <text x="21" y="34" textAnchor="middle" fontSize="5.5" fontWeight="900" fill="#c62835" fontFamily="system-ui">
          {tag}
        </text>
      )}
    </g>
  );
}

const ART: Record<PropId, React.ReactNode> = {
  cadeado: (
    <g>
      <path d="M11 18 V12 Q11 3 20 3 Q29 3 29 12 V18" fill="none" stroke={K} strokeWidth="5" />
      <path d="M11 18 V12 Q11 3 20 3 Q29 3 29 12 V18" fill="none" stroke="#c9ccd4" strokeWidth="2.5" />
      <rect x="5" y="17" width="30" height="21" rx="4" fill="#e3b33a" {...S} />
      <circle cx="20" cy="26" r="3" fill={K} />
      <rect x="19" y="27" width="2" height="6" fill={K} />
    </g>
  ),
  "carimbo-fecha": <Stamp word="FECHA-SE" color="#c62835" />,
  "carimbo-abre": <Stamp word="ABRE-SE" color="#1f8a4c" />,
  "carimbo-amem": <Stamp word="AMÉM" color="#3b4a9b" />,
  "carimbo-estado": <Stamp word="DO POVO" color="#c62835" />,
  "carimbo-autorizo": <Stamp word="AUTORIZO" color="#1f8a4c" />,
  papel: <Paper />,
  formulario: <Paper lines={4} tag="FORM. 27-B" />,
  boleto: <Paper color="#fff6c9" lines={2} tag="BOLETO" />,
  senha: (
    <g>
      <rect x="8" y="8" width="24" height="26" rx="2" fill="#fff" {...S} />
      <text x="20" y="20" textAnchor="middle" fontSize="6" fontWeight="700" fill={K} fontFamily="system-ui">
        SENHA
      </text>
      <text x="20" y="30" textAnchor="middle" fontSize="9" fontWeight="900" fill="#c62835" fontFamily="system-ui">
        Nº ∞
      </text>
    </g>
  ),
  hinario: (
    <g>
      <rect x="8" y="6" width="24" height="30" rx="2" fill="#3b4a9b" {...S} />
      <line x1="12" y1="6" x2="12" y2="36" stroke={K} strokeWidth="2" />
      <path d="M20 14 V26 M15 19 H25" stroke="#e3b33a" strokeWidth="2.5" />
    </g>
  ),
  vela: (
    <g>
      <rect x="15" y="14" width="10" height="22" rx="1" fill="#f4f0e6" {...S} />
      <path d="M20 4 Q25 10 20 13 Q15 10 20 4 Z" fill="#f2a33a" {...S} />
    </g>
  ),
  caneca: (
    <g>
      <rect x="9" y="12" width="18" height="22" rx="3" fill="#d94a5a" {...S} />
      <path d="M27 17 Q34 17 34 23 Q34 29 27 29" fill="none" {...S} />
    </g>
  ),
  cafe: (
    <g>
      <path d="M8 16 H28 L26 34 H10 Z" fill="#f4f0e6" {...S} />
      <path d="M28 20 Q34 20 33 25 Q32 29 27 28" fill="none" {...S} />
      <path d="M12 10 Q14 6 12 3 M18 10 Q20 6 18 3 M24 10 Q26 6 24 3" fill="none" stroke="#9a9488" strokeWidth="1.6" />
    </g>
  ),
  cafeteira: (
    <g>
      <path d="M12 6 H28 L30 14 H10 Z" fill="#5a5a66" {...S} />
      <path d="M10 14 H30 L27 36 H13 Z" fill="#c9ccd4" {...S} />
      <path d="M30 18 Q36 20 34 28 L28 30" fill="none" {...S} />
      <rect x="15" y="22" width="10" height="9" fill="#5a3216" {...S} />
    </g>
  ),
  "pao-queijo": (
    <g>
      <ellipse cx="20" cy="24" rx="14" ry="11" fill="#e8b85a" {...S} />
      <circle cx="15" cy="21" r="1.5" fill="#b3802c" />
      <circle cx="23" cy="19" r="1.5" fill="#b3802c" />
      <circle cx="25" cy="27" r="1.5" fill="#b3802c" />
    </g>
  ),
  manteiga: (
    <g>
      <path d="M6 22 L14 14 H34 V28 H6 Z" fill="#f7e27a" {...S} />
      <path d="M6 22 H26 L34 14" fill="none" {...S} />
      <line x1="26" y1="22" x2="26" y2="28" {...S} />
    </g>
  ),
  "po-cafe": (
    <g>
      <path d="M10 8 H30 L32 36 H8 Z" fill="#5a3216" {...S} />
      <rect x="12" y="16" width="16" height="10" fill="#e3b33a" {...S} />
      <text x="20" y="24" textAnchor="middle" fontSize="6" fontWeight="900" fill={K} fontFamily="system-ui">
        CAFÉ
      </text>
    </g>
  ),
  agua: (
    <g>
      <path d="M16 4 H24 V9 Q30 12 30 18 V36 H10 V18 Q10 12 16 9 Z" fill="#9fd6f5" {...S} />
      <line x1="10" y1="22" x2="30" y2="22" stroke="#4a8fc2" strokeWidth="1.6" />
    </g>
  ),
  calculadora: (
    <g>
      <rect x="9" y="4" width="22" height="32" rx="3" fill="#3a3a46" {...S} />
      <rect x="12" y="8" width="16" height="7" fill="#b8e0a0" {...S} />
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={12.5 + c * 5.5} y={19 + r * 5.5} width="4" height="4" rx="1" fill="#c9ccd4" />),
      )}
    </g>
  ),
  caixa: (
    <g>
      <path d="M4 14 L20 7 L36 14 V32 L20 38 L4 32 Z" fill="#c8945a" {...S} />
      <path d="M4 14 L20 21 L36 14 M20 21 V38" fill="none" {...S} />
      <path d="M12 10.5 L28 17.5" stroke="#e8d3a8" strokeWidth="3" />
    </g>
  ),
  etiqueta: (
    <g>
      <path d="M6 10 H28 L36 20 L28 30 H6 Z" fill="#f4f0e6" {...S} />
      <circle cx="29" cy="20" r="2.5" fill="#fff" {...S} />
      <line x1="10" y1="16" x2="22" y2="16" stroke="#9a9488" strokeWidth="1.6" />
      <line x1="10" y1="22" x2="20" y2="22" stroke="#9a9488" strokeWidth="1.6" />
      <text x="15" y="28" fontSize="6" fontWeight="900" fill="#c62835" fontFamily="system-ui">
        ???
      </text>
    </g>
  ),
  ministerio: (
    <g>
      <path d="M4 12 L20 4 L36 12 Z" fill="#e8e4da" {...S} />
      <rect x="6" y="12" width="28" height="22" fill="#e8e4da" {...S} />
      {[10, 17, 24, 31].map((x) => (
        <line key={x} x1={x} y1="14" x2={x} y2="32" stroke="#9a9488" strokeWidth="2" />
      ))}
      <rect x="4" y="34" width="32" height="3" fill="#9a9488" {...S} />
    </g>
  ),
  congresso: (
    <g>
      <rect x="15" y="4" width="4" height="26" fill="#e8e4da" {...S} />
      <rect x="21" y="4" width="4" height="26" fill="#e8e4da" {...S} />
      <path d="M2 30 Q9 22 14 30 Z" fill="#e8e4da" {...S} />
      <path d="M26 30 Q31 38 38 30 Z" fill="#e8e4da" {...S} />
      <rect x="2" y="30" width="36" height="5" fill="#9a9488" {...S} />
    </g>
  ),
  cristo: (
    <g>
      <rect x="18" y="12" width="4" height="22" fill="#d9d6cc" {...S} />
      <rect x="4" y="13" width="32" height="4" fill="#d9d6cc" {...S} />
      <circle cx="20" cy="8" r="4" fill="#d9d6cc" {...S} />
      <path d="M12 38 L20 32 L28 38 Z" fill="#5a7a4a" {...S} />
    </g>
  ),
  arvore: (
    <g>
      <rect x="17" y="24" width="6" height="12" fill="#7a4b2a" {...S} />
      <circle cx="13" cy="18" r="8" fill="#2e8a4c" {...S} />
      <circle cx="27" cy="18" r="8" fill="#2e8a4c" {...S} />
      <circle cx="20" cy="11" r="9" fill="#38a35a" {...S} />
    </g>
  ),
  churrasqueira: (
    <g>
      <path d="M6 16 H34 Q34 28 20 28 Q6 28 6 16 Z" fill="#3a3a46" {...S} />
      <line x1="12" y1="27" x2="8" y2="37" {...S} />
      <line x1="28" y1="27" x2="32" y2="37" {...S} />
      <path d="M12 12 Q14 8 12 5 M20 12 Q22 8 20 5 M28 12 Q30 8 28 5" fill="none" stroke="#9a9488" strokeWidth="1.6" />
    </g>
  ),
  presente: (
    <g>
      <rect x="7" y="16" width="26" height="20" fill="#d94a5a" {...S} />
      <rect x="5" y="11" width="30" height="7" fill="#e86a7a" {...S} />
      <rect x="18" y="11" width="4" height="25" fill="#f2c230" />
      <path d="M20 11 Q12 2 10 9 Q12 12 20 11 Q28 2 30 9 Q28 12 20 11" fill="#f2c230" {...S} />
    </g>
  ),
  urna: (
    <g>
      <rect x="5" y="10" width="30" height="26" rx="2" fill="#e8e4da" {...S} />
      <rect x="9" y="14" width="13" height="10" fill="#9fd6f5" {...S} />
      {[0, 1, 2].map((r) =>
        [0, 1].map((c) => <rect key={`${r}${c}`} x={25 + c * 4.5} y={14 + r * 4.5} width="3.5" height="3.5" fill="#5a5a66" />),
      )}
      <rect x="9" y="28" width="22" height="4" fill="#1f8a4c" {...S} />
    </g>
  ),
  pasta: (
    <g>
      <path d="M4 10 H16 L19 14 H36 V34 H4 Z" fill="#e3b33a" {...S} />
      <path d="M4 18 H36" stroke={K} strokeWidth="1.5" />
    </g>
  ),
  certidao: <Paper lines={3} tag="CERTIDÃO" />,
  rg: (
    <g>
      <rect x="4" y="10" width="32" height="22" rx="2" fill="#a7d3a0" {...S} />
      <circle cx="13" cy="20" r="4" fill="#5a5a66" />
      <line x1="20" y1="17" x2="31" y2="17" stroke={K} strokeWidth="1.6" />
      <line x1="20" y1="22" x2="29" y2="22" stroke={K} strokeWidth="1.6" />
    </g>
  ),
  titulo: <Paper color="#f2e3c2" lines={2} tag="TÍTULO" />,
  espelho: (
    <g>
      <ellipse cx="20" cy="18" rx="12" ry="15" fill="#c9e6f5" {...S} />
      <path d="M13 12 L18 8 M14 18 L22 10" stroke="#fff" strokeWidth="2" />
      <rect x="18" y="33" width="4" height="5" fill="#7a4b2a" {...S} />
    </g>
  ),
  refinaria: (
    <g>
      <rect x="4" y="18" width="12" height="18" fill="#c9ccd4" {...S} />
      <rect x="18" y="8" width="5" height="28" fill="#e8e4da" {...S} />
      <path d="M18 14 H23 M18 20 H23" stroke="#c62835" strokeWidth="2" />
      <ellipse cx="30" cy="28" rx="7" ry="8" fill="#e8e4da" {...S} />
      <path d="M20 8 Q22 2 27 3" fill="none" stroke="#9a9488" strokeWidth="2" />
    </g>
  ),
  sacola: (
    <g>
      <path d="M8 14 H32 L30 36 H10 Z" fill="#f4f0e6" {...S} />
      <path d="M14 14 Q14 5 20 5 Q26 5 26 14" fill="none" {...S} />
      <text x="20" y="28" textAnchor="middle" fontSize="6" fontWeight="900" fill="#1f8a4c" fontFamily="system-ui">
        OBRIGADO
      </text>
    </g>
  ),
  manual: (
    <g>
      <rect x="8" y="5" width="24" height="31" rx="2" fill="#f2c230" {...S} />
      <text x="20" y="18" textAnchor="middle" fontSize="5.5" fontWeight="900" fill={K} fontFamily="system-ui">
        MANUAL
      </text>
      <text x="20" y="27" textAnchor="middle" fontSize="4.5" fill={K} fontFamily="system-ui">
        (micro-ondas)
      </text>
    </g>
  ),
  cabo: (
    <g>
      <path d="M6 30 Q12 6 20 20 Q28 34 34 10" fill="none" stroke={K} strokeWidth="4" />
      <path d="M6 30 Q12 6 20 20 Q28 34 34 10" fill="none" stroke="#5a5a66" strokeWidth="2" />
      <rect x="30" y="4" width="7" height="8" fill="#c9ccd4" {...S} />
    </g>
  ),
  extensao: (
    <g>
      <rect x="4" y="22" width="26" height="10" rx="2" fill="#f4f0e6" {...S} />
      <circle cx="11" cy="27" r="1.5" fill={K} />
      <circle cx="18" cy="27" r="1.5" fill={K} />
      <circle cx="25" cy="27" r="1.5" fill={K} />
      <path d="M30 27 Q38 27 36 14" fill="none" {...S} />
    </g>
  ),
  caminhao: (
    <g>
      <rect x="3" y="12" width="22" height="16" fill="#e8e4da" {...S} />
      <path d="M25 16 H32 L37 22 V28 H25 Z" fill="#3b4a9b" {...S} />
      <circle cx="10" cy="30" r="4" fill="#3a3a46" {...S} />
      <circle cx="30" cy="30" r="4" fill="#3a3a46" {...S} />
    </g>
  ),
  bicicleta: (
    <g>
      <circle cx="10" cy="28" r="7" fill="none" {...S} />
      <circle cx="30" cy="28" r="7" fill="none" {...S} />
      <path d="M10 28 L18 16 H28 L30 28 M18 16 L22 28 H10" fill="none" {...S} />
    </g>
  ),
  "fita-crepe": (
    <g>
      <circle cx="20" cy="20" r="14" fill="#efe1b0" {...S} />
      <circle cx="20" cy="20" r="6" fill="#0b0b0f" {...S} />
    </g>
  ),
  "nota-fiscal": <Paper color="#ffffff" lines={4} tag="NOTA" />,
  carrinho: (
    <g>
      <path d="M3 8 H9 L13 26 H32 L36 12 H11" fill="none" {...S} />
      <circle cx="15" cy="32" r="3" fill={K} />
      <circle cx="30" cy="32" r="3" fill={K} />
    </g>
  ),
  kit: (
    <g>
      <rect x="4" y="10" width="32" height="26" rx="3" fill="#2a2a35" {...S} />
      <rect x="4" y="10" width="32" height="8" fill="#ff3b4f" {...S} />
      <text x="20" y="16.5" textAnchor="middle" fontSize="5.5" fontWeight="900" fill="#fff" fontFamily="system-ui">
        KIT MEDO
      </text>
      <path d="M17 22 H23 V26 H27 V32 H23 V36 H17 V32 H13 V26 H17 Z" fill="#f2c230" transform="translate(0 -3) scale(1 0.85)" />
    </g>
  ),
  celular: (
    <g>
      <rect x="11" y="3" width="18" height="34" rx="3" fill="#1b1b24" {...S} />
      <rect x="13" y="7" width="14" height="24" fill="#3ddc84" opacity="0.6" />
      <circle cx="27" cy="7" r="3.5" fill="#ff3b4f" stroke={K} strokeWidth="1.5" />
    </g>
  ),
  maquina: (
    <g>
      <rect x="6" y="8" width="28" height="22" rx="3" fill="#8a8f9c" {...S} />
      <rect x="10" y="12" width="20" height="7" fill="#ff3b4f" {...S} />
      <circle cx="13" cy="25" r="2.5" fill="#f2c230" {...S} />
      <circle cx="20" cy="25" r="2.5" fill="#3ddc84" {...S} />
      <rect x="15" y="30" width="10" height="6" fill="#5a5a66" {...S} />
    </g>
  ),
  "mapa-brasil": (
    <g>
      <path
        d="M10 9 L19 5 L28 7 L35 13 L36 20 L31 26 L27 33 L21 37 L18 31 L14 30 L11 23 L5 18 L6 12 Z"
        fill="#3ddc84"
        {...S}
      />
    </g>
  ),
};

/** Desenha um objeto como <svg> independente (para botões, cenas e recompensas). */
export function PropIcon({ id, size = 40, label }: { id: PropId; size?: number; label?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className="shrink-0 overflow-visible"
    >
      {ART[id] ?? <circle cx="20" cy="20" r="14" fill="#5a5a66" {...S} />}
    </svg>
  );
}

/** Desenha um objeto dentro de outro SVG (ex.: na mão de um boneco). */
export function PropArt({ id, x, y, size }: { id: PropId; x: number; y: number; size: number }) {
  const k = size / 40;
  return <g transform={`translate(${x - size / 2} ${y - size / 2}) scale(${k})`}>{ART[id]}</g>;
}
