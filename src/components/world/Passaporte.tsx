"use client";

import { useEffect, useRef } from "react";
import { bus, type DialogoState } from "@/world/bridge";
import { CAMPANHA, SELOS } from "@/world/cidade/missoes/campanha";
import type { SeloDef } from "@/world/cidade/missoes/motor";
import { useModalFoco } from "./useModal";

/**
 * Peças da campanha na interface: o selo desenhado do Passaporte do Absurdo, o passaporte (os seis
 * selos e o estado de cada missão), o cartão que comemora um selo novo e a caixa de diálogo com
 * opção de pular.
 */

const GIRO = [-7, 5, -4, 8, -6, 4];

/** Selo desenhado em SVG: borda serrilhada, círculo colorido, ícone e nome. Cinza quando ainda não foi conquistado. */
export function SeloArte({ selo, ganho, tamanho = 96, indice = 0 }: { selo: SeloDef; ganho: boolean; tamanho?: number; indice?: number }) {
  const cor = ganho ? selo.cor : "#b9b3a8";
  const dentes = 28;
  const pontos = Array.from({ length: dentes * 2 }, (_, i) => {
    const a = (i / (dentes * 2)) * Math.PI * 2;
    const r = i % 2 ? 46 : 50;
    return `${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 100" width={tamanho} height={tamanho} role="img" aria-label={ganho ? `Selo conquistado: ${selo.nome}` : `Selo ainda não conquistado: ${selo.nome}`} style={{ transform: `rotate(${GIRO[indice % GIRO.length]}deg)` }}>
      <polygon points={pontos} fill="#fffaf0" stroke="#1e1424" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="50" cy="50" r="38" fill={cor} stroke="#1e1424" strokeWidth="3" />
      <circle cx="50" cy="50" r="31" fill="none" stroke="#fffaf0" strokeWidth="1.8" strokeDasharray="3 3" opacity="0.85" />
      <text x="50" y="58" textAnchor="middle" fontSize="30" opacity={ganho ? 1 : 0.35}>
        {selo.icone}
      </text>
      <rect x="14" y="68" width="72" height="14" rx="3" fill="#1e1424" opacity={ganho ? 1 : 0.55} />
      <text x="50" y="78.5" textAnchor="middle" fontSize="7.2" fontWeight="900" fill="#fffaf0" style={{ fontFamily: "system-ui, sans-serif" }}>
        {selo.nome.length > 22 ? `${selo.nome.slice(0, 21)}…` : selo.nome.toUpperCase()}
      </text>
    </svg>
  );
}

const LADO: Record<"obediente" | "rebelde" | "meio", { glifo: string; texto: string }> = {
  obediente: { glifo: "✔", texto: "Seguiu a ordem" },
  rebelde: { glifo: "✖", texto: "Desobedeceu" },
  meio: { glifo: "↔", texto: "Brecha ou meio-termo" },
};

/** Passaporte: os seis selos, em ordem, o que falta em cada missão, o que você decidiu e o diário de pistas. */
export function Passaporte({
  selos,
  ativaNumero,
  decisoes,
  diario,
  final,
  onClose,
}: {
  selos: string[];
  ativaNumero: number | null;
  decisoes: { missao: number; texto: string; lado: "obediente" | "rebelde" | "meio" }[];
  diario: { id: string; texto: string }[];
  final: boolean;
  onClose: () => void;
}) {
  const total = SELOS.length;
  const raiz = useRef<HTMLDivElement>(null);
  useModalFoco(raiz);
  return (
    <div ref={raiz} className="absolute inset-0 z-20 grid place-items-center bg-black/60 p-3" role="dialog" aria-modal="true" aria-label="Passaporte do Absurdo" onClick={onClose}>
      <div className="max-h-full w-full max-w-xl overflow-y-auto rounded-2xl border-4 border-[#1e1424] bg-[#fffaf0] p-3 shadow-[0_6px_0_#1e1424]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <p className="text-lg font-black">🛂 Passaporte do Absurdo</p>
          <span className="rounded-full bg-[#1e1424] px-2 py-0.5 text-xs font-black text-[#ffe9a8]">
            {selos.length}/{total}
          </span>
          <button type="button" onClick={onClose} className="hud-btn ml-auto" aria-label="Fechar passaporte" data-autofoco>
            ✕
          </button>
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CAMPANHA.missoes.map((m, i) => {
            const ganho = selos.includes(m.selo.id);
            return (
              <li key={m.id} className={`flex flex-col items-center rounded-xl border-2 border-[#1e1424] px-1.5 py-2 text-center ${m.numero === ativaNumero ? "bg-[#ffd23f]/40" : "bg-white"}`}>
                <SeloArte selo={m.selo} ganho={ganho} tamanho={84} indice={i} />
                <p className="mt-1 text-[11px] font-black leading-tight">
                  {m.numero}. {m.titulo}
                </p>
                <p className="text-[10px] font-semibold text-[#1e1424]/70">{ganho ? "✓ Concluída" : m.numero === ativaNumero ? "Em andamento" : "Pendente"}</p>
              </li>
            );
          })}
        </ul>
        {final && (
          <p className="mt-2 rounded-xl border-2 border-[#1e1424] bg-[#1e1424] px-3 py-2 text-center text-[12px] font-black text-[#ffd23f]">
            👑 Carimbo final: Ditadura do Carimbo. Dá para rever a cerimônia no palanque da praça.
          </p>
        )}
        <section className="mt-3" aria-label="O que você decidiu">
          <p className="text-[12px] font-black uppercase tracking-wide text-[#c62835]">O que você decidiu</p>
          {decisoes.length ? (
            <ul className="mt-1 space-y-1">
              {decisoes.map((d) => (
                <li key={d.missao} className="flex items-start gap-2 text-[12px] font-semibold leading-snug">
                  <span className="mt-px inline-flex h-5 min-w-5 items-center justify-center rounded bg-[#1e1424] px-1 text-[11px] font-black text-[#ffe9a8]" aria-hidden>
                    {LADO[d.lado].glifo}
                  </span>
                  <span>
                    <b>Missão {d.missao}:</b> {d.texto} <span className="text-[#1e1424]/60">({LADO[d.lado].texto})</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-[12px] font-semibold text-[#1e1424]/70">Nada decidido ainda. As escolhas das missões ficam registradas aqui e mudam o final.</p>
          )}
        </section>
        <section className="mt-3" aria-label="Diário de pistas">
          <p className="text-[12px] font-black uppercase tracking-wide text-[#c62835]">📓 Diário de pistas</p>
          {diario.length ? (
            <ol className="mt-1 space-y-1">
              {diario.map((n) => (
                <li key={n.id} className="rounded-lg bg-white px-2 py-1 text-[12px] font-semibold leading-snug shadow-[0_1px_0_#1e1424]">
                  {n.texto}
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-1 text-[12px] font-semibold text-[#1e1424]/70">As pistas e conversas importantes aparecem aqui, da mais nova para a mais antiga.</p>
          )}
        </section>
        <p className="mt-2 text-[11px] font-semibold leading-snug text-[#1e1424]/70">
          Cada missão concluída carimba um selo. Dá para explorar a cidade entre uma etapa e outra: o objetivo fica salvo. Esc fecha.
        </p>
      </div>
    </div>
  );
}

/** Cartão que aparece por alguns segundos quando um selo é conquistado. */
export function SeloCard({ selo, onFim }: { selo: { id: string; nome: string; cor: string; icone: string; n: number; completa: boolean; final?: boolean }; onFim: () => void }) {
  // o HUD re-renderiza o tempo todo: o callback vai por ref para o prazo não reiniciar a cada render
  const fim = useRef(onFim);
  fim.current = onFim;
  useEffect(() => {
    const t = window.setTimeout(() => fim.current(), selo.completa || selo.final ? 5200 : 3800);
    return () => window.clearTimeout(t);
  }, [selo]);
  const def: SeloDef = { id: selo.id, nome: selo.nome, cor: selo.cor, icone: selo.icone };
  return (
    <div className="pointer-events-none absolute left-1/2 top-[30%] z-10 -translate-x-1/2 -translate-y-1/2 text-center" role="status" aria-live="polite">
      <div className="selo-pop rounded-2xl border-4 border-[#1e1424] bg-[#fffaf0] px-5 py-3 shadow-[0_6px_0_#1e1424]">
        <p className="text-[11px] font-black uppercase tracking-wide text-[#c62835]">
          {selo.final ? "Carimbo final" : selo.completa ? "Passaporte do Absurdo completo!" : `Selo ${selo.n}/${SELOS.length} conquistado`}
        </p>
        <div className="mx-auto my-1 w-fit">
          <SeloArte selo={def} ganho tamanho={selo.completa || selo.final ? 132 : 112} indice={selo.n - 1} />
        </div>
        <p className="text-sm font-black">{selo.nome}</p>
      </div>
    </div>
  );
}

/**
 * Diálogo curto ou escolha: avança com o botão (ou E/Enter, tratados pelo mundo) e dá para pular tudo.
 * Numa escolha, cada opção é um botão grande (1 a 9 também escolhem) e "Ainda não" desiste sem mudar nada.
 * Em tela de toque ele não cobre o direcional nem o botão de ação (ver `.dialogo-wrap` em globals.css).
 */
export function Dialogo({ d }: { d: DialogoState }) {
  // "Nome: fala" vira nome + fala
  const m = /^([^:.!?]{2,34}): (.*)$/s.exec(d.texto);
  const quem = d.quem ?? (m ? m[1] : null);
  const texto = d.quem ? d.texto : m ? m[2] : d.texto;
  const raiz = useRef<HTMLDivElement>(null);
  useModalFoco(raiz);
  const opcoes = d.opcoes;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (opcoes) bus.emit("escolha-acao", null);
        else bus.emit("dialogo-acao", "pular");
        return;
      }
      if (opcoes && /^[1-9]$/.test(e.key)) {
        const o = opcoes[Number(e.key) - 1];
        if (o) {
          e.preventDefault();
          bus.emit("escolha-acao", o.id);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opcoes]);
  const ultima = d.i >= d.total - 1;
  // o jogo captura Enter e espaço; nas opções, a tecla age no botão focado e setas movem o foco
  const onTecla = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!opcoes) return;
    const botoes = [...(raiz.current?.querySelectorAll<HTMLButtonElement>("button[data-opcao]") ?? [])];
    const i = botoes.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      botoes[(i + (e.key === "ArrowDown" ? 1 : botoes.length - 1) + botoes.length) % botoes.length]?.focus();
    } else if ((e.key === "Enter" || e.key === " ") && i >= 0) {
      e.preventDefault();
      e.stopPropagation();
      bus.emit("escolha-acao", opcoes[i].id);
    }
  };
  return (
    <div ref={raiz} className="dialogo-wrap absolute inset-x-0 z-10 flex justify-center px-3" role="dialog" aria-modal="true" aria-label={opcoes ? "Escolha" : "Diálogo"} onKeyDown={onTecla}>
      <div className="pointer-events-auto w-full max-w-xl rounded-2xl border-4 border-[#1e1424] bg-[#fffaf0] p-3 shadow-[0_5px_0_#1e1424]">
        {quem && <p className="-mt-6 mb-1 inline-block rounded-lg border-[3px] border-[#1e1424] bg-[#ffd23f] px-2 py-0.5 text-xs font-black">{quem}</p>}
        <p className="text-[15px] font-bold leading-snug sm:text-base">{texto}</p>
        {opcoes ? (
          <div className="mt-2 flex max-h-[min(46vh,22rem)] flex-col gap-1.5 overflow-y-auto" role="group" aria-label="Opções">
            {opcoes.map((o, i) => (
              <button
                key={o.id}
                type="button"
                data-opcao
                data-autofoco={i === 0 ? "" : undefined}
                className="menu-btn min-h-[48px] text-left text-[14px] leading-snug"
                onClick={() => bus.emit("escolha-acao", o.id)}
              >
                <span className="mr-2 inline-flex h-5 min-w-5 items-center justify-center rounded bg-[#1e1424] px-1 text-[11px] font-black text-bone" aria-hidden>
                  {i + 1}
                </span>
                {o.rotulo}
              </button>
            ))}
            <button type="button" className="menu-btn min-h-[44px] bg-transparent text-sm opacity-80" onClick={() => bus.emit("escolha-acao", null)}>
              Ainda não <span className="ml-1 rounded bg-[#1e1424] px-1 text-[10px] text-bone">Esc</span>
            </button>
          </div>
        ) : (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px] font-black text-[#1e1424]/60">
              {d.i + 1}/{d.total}
            </span>
            <button type="button" className="menu-btn ml-auto !w-auto px-3 py-1 text-sm" onClick={() => bus.emit("dialogo-acao", "pular")}>
              Pular
            </button>
            <button type="button" className="menu-btn !w-auto bg-[#ffd23f] px-4 py-1 text-sm" onClick={() => bus.emit("dialogo-acao", "avancar")} data-autofoco>
              {ultima ? "Fechar" : "Continuar"} <span className="ml-1 rounded bg-[#1e1424] px-1 text-[10px] text-bone">E</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
