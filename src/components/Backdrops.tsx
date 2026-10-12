import type { BackdropId } from "@/game/types";
import { PropArt } from "./Props";

/**
 * Cenários em SVG (400×300). Cada um lê o estado da cena (`scene`) para mudar
 * objetos: porta aberta, cadeado pendurado, carimbos, placa da urna etc.
 */

const K = "#141016";
const S = { stroke: K, strokeWidth: 2.5, strokeLinejoin: "round" as const };

type Scene = Record<string, string>;

function Sign({ x, y, w, text, fill = "#f2c230", color = K, size = 11 }: { x: number; y: number; w: number; text: string; fill?: string; color?: string; size?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={size + 9} rx="3" fill={fill} {...S} />
      <text x={x + w / 2} y={y + size + 2} textAnchor="middle" fontSize={size} fontWeight="900" fill={color} fontFamily="system-ui">
        {text}
      </text>
    </g>
  );
}

function StampMark({ x, y, text, rot = -12, color = "#c62835" }: { x: number; y: number; text: string; rot?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <g className="anim-pop" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
      <rect x={-text.length * 3.6 - 6} y="-11" width={text.length * 7.2 + 12} height="20" rx="3" fill="none" stroke={color} strokeWidth="3" />
      <text x="0" y="4" textAnchor="middle" fontSize="12" fontWeight="900" fill={color} fontFamily="system-ui">
        {text}
      </text>
      </g>
    </g>
  );
}

function Igreja({ scene }: { scene: Scene }) {
  const doorOpen = scene.porta === "aberta";
  return (
    <>
      <rect width="400" height="300" fill="#e9dcc4" />
      <rect y="225" width="400" height="75" fill="#a57a52" />
      {/* vitrais */}
      {[60, 150].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 140 V70 Q${x + 25} 40 ${x + 50} 70 V140 Z`} fill={i ? "#7cc4ff" : "#f2a33a"} {...S} />
          <path d={`M${x + 25} 50 V140 M${x} 95 H${x + 50}`} stroke={K} strokeWidth="2" />
        </g>
      ))}
      {/* cruz simples e púlpito */}
      <path d="M232 52 V108 M216 70 H248" stroke="#7a4b2a" strokeWidth="7" strokeLinecap="round" />
      <rect x="200" y="168" width="64" height="60" fill="#7a4b2a" {...S} />
      <rect x="194" y="160" width="76" height="12" fill="#8a5a32" {...S} />
      {/* bancos */}
      {[246, 272].map((y) => (
        <rect key={y} x="20" y={y} width="170" height="12" rx="2" fill="#6b4329" {...S} />
      ))}
      {/* porta */}
      <rect x="300" y="88" width="84" height="140" fill="#3b2a1a" {...S} />
      {doorOpen ? (
        <>
          <rect x="300" y="88" width="84" height="140" fill="#f7efd8" {...S} />
          <path d="M300 88 L282 96 V236 L300 228 Z" fill="#7a4b2a" {...S} />
          <path d="M384 88 L398 96 V236 L384 228 Z" fill="#7a4b2a" {...S} />
        </>
      ) : (
        <>
          <rect x="300" y="88" width="42" height="140" fill="#7a4b2a" {...S} />
          <rect x="342" y="88" width="42" height="140" fill="#7a4b2a" {...S} />
        </>
      )}
      {scene.cadeado === "porta" && (
        <g className="anim-pop">
          <PropArt id="cadeado" x={342} y={176} size={120} />
        </g>
      )}
      {scene.placa && <Sign x={150} y={8} w={244} text={scene.placa} fill="#ff3b4f" color="#fff" size={9} />}
      {scene.carimbo && <StampMark x={342} y={120} text={scene.carimbo} rot={-8} color={scene.carimbo === "ABRE-SE" ? "#1f8a4c" : scene.carimbo === "AMÉM" ? "#3b4a9b" : "#c62835"} />}
    </>
  );
}

function Cozinha({ scene }: { scene: Scene }) {
  return (
    <>
      <rect width="400" height="300" fill="#f4e7c9" />
      {/* azulejos */}
      {Array.from({ length: 10 }, (_, i) => (
        <line key={i} x1={i * 40} y1="120" x2={i * 40} y2="215" stroke="#e1cf9e" strokeWidth="2" />
      ))}
      <line x1="0" y1="160" x2="400" y2="160" stroke="#e1cf9e" strokeWidth="2" />
      <rect y="215" width="400" height="85" fill="#c89b6a" />
      {/* janela */}
      <rect x="30" y="30" width="110" height="80" fill="#9fd6f5" {...S} />
      <circle cx="110" cy="58" r="16" fill="#f2c230" />
      <path d="M85 30 V110 M30 70 H140" stroke={K} strokeWidth="2.5" />
      {/* relógio */}
      <circle cx="200" cy="50" r="22" fill="#fff" {...S} />
      <path d="M200 50 V36 M200 50 L210 56" stroke={K} strokeWidth="2.5" />
      {/* geladeira */}
      <rect x="310" y="40" width="74" height="176" rx="6" fill="#e8e4da" {...S} />
      <line x1="310" y1="104" x2="384" y2="104" stroke={K} strokeWidth="2.5" />
      <rect x="370" y="60" width="5" height="30" fill="#9a9488" />
      {/* bancada com objetos */}
      <rect x="160" y="150" width="140" height="66" fill="#8a5a32" {...S} />
      <rect x="154" y="144" width="152" height="10" fill="#a57a52" {...S} />
      {scene.cafeteira !== "sumiu" && <PropArt id="cafeteira" x={190} y={124} size={44} />}
      {scene.pao !== "sumiu" && <PropArt id="pao-queijo" x={262} y={132} size={scene.pao === "fatia" ? 10 : 30} />}
      {scene.maquina && <PropArt id="maquina" x={80} y={180} size={70} />}
      {scene.geladeira && <StampMark x={347} y={140} text={scene.geladeira} rot={-18} />}
      {scene.cafeteira === "carimbada" && <StampMark x={190} y={118} text="DO POVO" rot={10} />}
      {scene.placa && <Sign x={10} y={250} w={200} text={scene.placa} fill="#ff3b4f" color="#fff" size={10} />}
    </>
  );
}

function Correios({ scene }: { scene: Scene }) {
  return (
    <>
      <rect width="400" height="300" fill="#dfe6ee" />
      <rect y="220" width="400" height="80" fill="#7c8696" />
      <Sign x={150} y={10} w={230} text="CORREIOS UNIVERSAIS" fill="#3b4a9b" color="#fff" size={13} />
      <text x="265" y="50" textAnchor="middle" fontSize="9" fill="#3b4a9b" fontFamily="system-ui" fontWeight="700">
        Entregamos tudo. Exceto o que não cabe.
      </text>
      {/* balcão */}
      <rect x="250" y="150" width="150" height="72" fill="#c8945a" {...S} />
      <rect x="244" y="142" width="156" height="12" fill="#e8d3a8" {...S} />
      {/* esteira */}
      <rect x="10" y="182" width="230" height="20" rx="10" fill="#3a3a46" {...S} />
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={i} cx={22 + i * 26} cy="192" r="6" fill="#8a8f9c" {...S} />
      ))}
      {/* caixa gigante */}
      <path d="M40 182 V110 H190 V182 Z" fill="#c8945a" {...S} />
      <path d="M40 110 L60 92 H210 L190 110 Z" fill="#e0b47a" {...S} />
      <path d="M190 110 L210 92 V164 L190 182 Z" fill="#a8743f" {...S} />
      {scene.mapa === "dentro" && <PropArt id="mapa-brasil" x={115} y={98} size={78} />}
      {scene.mapa === "fugindo" && (
        <g>
          <PropArt id="mapa-brasil" x={70} y={80} size={46} />
          <text x="150" y="86" fontSize="22">💨</text>
        </g>
      )}
      {scene.etiqueta && (
        <g transform="rotate(-6 115 150)">
          <rect x="62" y="130" width="106" height="36" fill="#fff" {...S} />
          <text x="115" y="145" textAnchor="middle" fontSize="8" fontWeight="900" fill={K} fontFamily="system-ui">
            PARA: CHINA, RUA ??? Nº ???
          </text>
          <text x="115" y="158" textAnchor="middle" fontSize="7.5" fill="#c62835" fontWeight="700" fontFamily="system-ui">
            {scene.etiqueta}
          </text>
        </g>
      )}
      {scene.carimbo && <StampMark x={115} y={128} text={scene.carimbo} rot={-14} />}
    </>
  );
}

function Transportadora({ scene }: { scene: Scene }) {
  const peso = scene.peso ?? "∞ kg";
  return (
    <>
      <rect width="400" height="300" fill="#e6ece3" />
      <rect y="222" width="400" height="78" fill="#6b7a6a" />
      <Sign x={14} y={30} w={250} text="TRANSCONTINENTAL EXPRESS" fill="#1f6f43" color="#fff" size={13} />
      <text x="139" y="66" textAnchor="middle" fontSize="8.5" fill="#1f6f43" fontWeight="700" fontFamily="system-ui">
        Frete para qualquer lugar (exceto este)
      </text>
      {/* balança */}
      <rect x="282" y="60" width="104" height="46" rx="4" fill="#1b1b24" {...S} />
      <text x="334" y="90" textAnchor="middle" fontSize="18" fontWeight="900" fill="#ff3b4f" fontFamily="ui-monospace,monospace">
        {peso}
      </text>
      <rect x="250" y="160" width="150" height="62" fill="#3b4a9b" {...S} />
      <rect x="244" y="152" width="156" height="12" fill="#8a9bd1" {...S} />
      {/* caixa com Brasília transbordando */}
      <path d="M30 222 V140 H200 V222 Z" fill="#c8945a" {...S} />
      {scene.caixa !== "vazia" && (
        <g>
          <PropArt id="ministerio" x={60} y={124} size={44} />
          <PropArt id="ministerio" x={98} y={112} size={50} />
          <PropArt id="congresso" x={140} y={118} size={56} />
          <PropArt id="ministerio" x={178} y={124} size={42} />
          <PropArt id="cristo" x={118} y={86} size={40} />
        </g>
      )}
      {scene.caixa === "vazia" && <PropArt id="presente" x={115} y={124} size={34} />}
      <text x="115" y="196" textAnchor="middle" fontSize="11" fontWeight="900" fill={K} fontFamily="system-ui">
        DESTINO: EUA
      </text>
      {scene.carimbo && <StampMark x={115} y={170} text={scene.carimbo} rot={-10} />}
    </>
  );
}

function Secao({ scene }: { scene: Scene }) {
  const tela = scene.urna ?? "APRESENTE AUTORIZAÇÃO";
  return (
    <>
      <rect width="400" height="300" fill="#e8efe2" />
      <rect y="226" width="400" height="74" fill="#9a8a6a" />
      {/* lousa */}
      <rect x="20" y="34" width="170" height="80" fill="#2f4a3a" stroke="#7a4b2a" strokeWidth="6" />
      <text x="105" y="64" textAnchor="middle" fontSize="13" fill="#e8efe2" fontFamily="system-ui" fontWeight="700">
        SEÇÃO 0042
      </text>
      <text x="105" y="86" textAnchor="middle" fontSize="9" fill="#e8efe2" fontFamily="system-ui">
        hoje: votação + 11 carimbos
      </text>
      {/* cabine */}
      <rect x="290" y="60" width="90" height="166" fill="#c9ccd4" {...S} />
      <rect x="296" y="70" width="78" height="40" fill="#e8e4da" {...S} />
      {/* mesa com urna e telão */}
      <rect x="196" y="170" width="94" height="56" fill="#7a4b2a" {...S} />
      <PropArt id="urna" x={243} y={150} size={60} />
      <g className={scene.urnaPisca ? "anim-blink" : undefined}>
        <rect x="200" y="18" width="190" height="34" rx="4" fill="#1b1b24" {...S} />
        <text x="295" y="40" textAnchor="middle" fontSize={tela.length > 28 ? 8 : 10} fontWeight="900" fill="#3ddc84" fontFamily="ui-monospace,monospace">
          {tela}
        </text>
      </g>
      {scene.pilha && (
        <g>
          {Array.from({ length: Number(scene.pilha) }, (_, i) => (
            <PropArt key={i} id="formulario" x={40 + (i % 6) * 22} y={200 - Math.floor(i / 6) * 14} size={30} />
          ))}
        </g>
      )}
      {scene.carimbo && <StampMark x={295} y={86} text={scene.carimbo} rot={-8} color="#1f8a4c" />}
    </>
  );
}

function Refinaria({ scene }: { scene: Scene }) {
  return (
    <>
      <rect width="400" height="300" fill="#f7d9a8" />
      <circle cx="330" cy="50" r="26" fill="#ffefb0" />
      <rect y="222" width="400" height="78" fill="#8a8f9c" />
      {/* refinaria gigante */}
      <g>
        <rect x="20" y="70" width="40" height="152" fill="#e8e4da" {...S} />
        <path d="M20 100 H60 M20 130 H60" stroke="#c62835" strokeWidth="5" />
        <rect x="70" y="120" width="90" height="102" fill="#c9ccd4" {...S} />
        <ellipse cx="200" cy="180" rx="38" ry="42" fill="#e8e4da" {...S} />
        <path d="M60 140 H70 M160 170 H162" stroke={K} strokeWidth="6" />
        <path d="M40 70 Q48 40 70 46 Q86 30 100 44" fill="none" stroke="#9a9488" strokeWidth="6" strokeLinecap="round" />
      </g>
      {/* sacola minúscula */}
      <g className={scene.sacola === "cheia" ? "anim-pop" : undefined}>
        <PropArt id="sacola" x={300} y={scene.sacola === "cheia" ? 190 : 208} size={scene.sacola === "cheia" ? 70 : 28} />
      </g>
      {scene.placa && <Sign x={230} y={98} w={160} text={scene.placa} fill="#1f6f43" color="#fff" size={10} />}
      {scene.carimbo && <StampMark x={110} y={170} text={scene.carimbo} rot={-10} />}
    </>
  );
}

function Loja({ scene }: { scene: Scene }) {
  return (
    <>
      <rect width="400" height="300" fill="#2a1f33" />
      <rect y="226" width="400" height="74" fill="#3a2f44" />
      <Sign x={20} y={30} w={360} text="VALDIR KITS · SOBREVIVÊNCIA PARA TODOS OS FINS" fill="#f2c230" size={11} />
      {/* prateleiras com o mesmo kit em duas embalagens */}
      {[84, 140].map((y) => (
        <g key={y}>
          <rect x="20" y={y + 34} width="360" height="8" fill="#7a4b2a" {...S} />
          {Array.from({ length: 8 }, (_, i) => (
            <g key={i} transform={`translate(${30 + i * 44} ${y - 2})`}>
              <rect width="34" height="36" rx="3" fill="#2a2a35" {...S} />
              <rect width="34" height="10" fill={i % 2 ? "#3ddc84" : "#ff3b4f"} {...S} />
            </g>
          ))}
        </g>
      ))}
      <text x="200" y="200" textAnchor="middle" fontSize="10" fill="#f2efe8" fontFamily="system-ui" fontWeight="700">
        {scene.cartaz ?? "PROMOÇÃO: O MESMO MEDO, DUAS CORES"}
      </text>
      {scene.portal && (
        <g className="anim-pop">
          <ellipse cx="350" cy="180" rx="36" ry="58" fill="#7cc4ff" opacity="0.55" {...S} />
          <text x="350" y="186" textAnchor="middle" fontSize="8" fontWeight="900" fill={K} fontFamily="system-ui">
            {scene.portal}
          </text>
        </g>
      )}
    </>
  );
}

const MAP: Record<BackdropId, (p: { scene: Scene }) => React.ReactElement> = {
  igreja: Igreja,
  cozinha: Cozinha,
  correios: Correios,
  transportadora: Transportadora,
  secao: Secao,
  refinaria: Refinaria,
  loja: Loja,
};

export const BACKDROP_NAME: Record<BackdropId, string> = {
  igreja: "Igreja do bairro",
  cozinha: "Cozinha",
  correios: "Agência dos Correios Universais",
  transportadora: "Balcão da TransContinental Express",
  secao: "Seção eleitoral",
  refinaria: "Refinaria",
  loja: "Loja de kits de sobrevivência",
};

export default function Backdrop({ id, scene }: { id: BackdropId; scene: Scene }) {
  const Comp = MAP[id];
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <Comp scene={scene} />
    </svg>
  );
}
