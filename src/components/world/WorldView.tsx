"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { readPref, writePref } from "@/lib/hooks";
import { sound } from "@/lib/sound";
import { bus, resetTouchInput, touchInput } from "@/world/bridge";
import type { HeroId, HudState } from "@/world/types";
import type { GameHandle } from "@/world/game/createGame";
import Joystick from "./Joystick";

const SOUND_KEY = "panico-de-estado:som";

function useTouch(): boolean {
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window);
  }, []);
  return touch;
}

/** O mundo em Phaser mais a interface por cima: objetivo, ação contextual e controles de toque. */
export default function WorldView({ hero, onSwitch, onReset }: { hero: HeroId; onSwitch: () => void; onReset: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hud, setHud] = useState<HudState | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const touch = useTouch();

  useEffect(() => {
    bus.emit("pause", menu);
    if (menu) resetTouchInput();
    return () => bus.emit("pause", false);
  }, [menu]);

  useEffect(() => {
    const on = readPref(SOUND_KEY, "on") !== "off";
    setSoundOn(on);
    sound.setEnabled(on);
  }, []);

  useEffect(() => {
    let handle: GameHandle | null = null;
    let cancelled = false;
    const offs = [
      bus.on("hud", setHud),
      bus.on("ready", () => setReady(true)),
      bus.on("toast", (msg) => setToast(msg)),
    ];
    const debug = new URLSearchParams(window.location.search).has("debug");
    void import("@/world/game/createGame").then(({ createGame }) => {
      if (cancelled || !host.current) return;
      handle = createGame(host.current, hero, { debug, onProgress: setProgress, onError: setError });
    });
    const el = host.current;
    const ro = new ResizeObserver(() => {
      if (el) handle?.resize(el.clientWidth, el.clientHeight);
    });
    if (el) ro.observe(el);
    return () => {
      cancelled = true;
      offs.forEach((o) => o());
      ro.disconnect();
      handle?.destroy();
      resetTouchInput();
    };
  }, [hero]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    sound.setEnabled(next);
    writePref(SOUND_KEY, next ? "on" : "off");
    if (next) sound.unlock();
  };

  const driving = hud?.mode === "carro";
  const action = hud?.action ?? null;

  return (
    <div className="fixed inset-0 overflow-hidden overscroll-none bg-[#8fcb68] text-[#1e1424]" style={{ touchAction: "none" }}>
      <div ref={host} className="absolute inset-0" aria-label="Bairro do jogo" />

      {!ready && !error && (
        <div className="absolute inset-0 grid place-items-center bg-[#0b0b0f] text-bone">
          <div className="text-center">
            <p className="text-lg font-black">Montando o bairro…</p>
            <div className="mx-auto mt-3 h-2 w-48 overflow-hidden rounded-full bg-line">
              <div className="h-full bg-alarm transition-[width]" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 grid place-items-center bg-[#0b0b0f] p-6 text-center text-bone">
          <div>
            <p className="font-bold">{error}</p>
            <button type="button" onClick={onSwitch} className="mt-4 rounded-lg bg-alarm px-4 py-2 font-bold text-ink">
              Voltar
            </button>
          </div>
        </div>
      )}

      {ready && hud && (
        <>
          {/* objetivo */}
          <div className="pointer-events-none absolute left-0 right-0 top-0 flex items-start gap-2 p-2 sm:p-3" style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}>
            <div className="max-w-[min(30rem,calc(100%-6.5rem))] rounded-xl border-[3px] border-[#1e1424] bg-[#fffaf0]/95 px-3 py-1.5 shadow-[0_3px_0_#1e1424]">
              <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wide text-[#66556a] sm:text-[10px]">
                Brasil hipotético do {hero === "lula" ? "Lula" : "Flávio"} · ficção satírica
              </p>
              <p className="text-[10px] font-black uppercase tracking-wider text-[#c62835] sm:text-[11px]">
                {hud.missionTitle ? `Missão · ${hud.missionTitle}` : "Exploração"}
                {hud.done ? " · concluída ✓" : ""}
              </p>
              <p className="text-[13px] font-bold leading-snug sm:text-[15px]">{hud.objective}</p>
              {hud.total > 1 && <p className="mt-1 text-[10px] font-bold text-[#66556a]">Boatos concretizados: {hud.completed}/{hud.total}</p>}
              {hud.stamina !== null && (
                <div className="mt-2 border-t border-[#1e1424]/15 pt-1.5">
                  <div className="flex items-center justify-between gap-2 text-[10px] font-black">
                    <span>Cachaça · energia de corrida</span><span>{hud.stamina}%</span>
                  </div>
                  <div role="progressbar" aria-label="Energia de corrida" aria-valuenow={hud.stamina} aria-valuemin={0} aria-valuemax={100} className="mt-1 h-2 overflow-hidden rounded-full bg-[#1e1424]/15">
                    <div className={`h-full rounded-full transition-[width] ${hud.stamina < 25 ? "bg-[#c62835]" : "bg-[#c48827]"}`} style={{ width: `${hud.stamina}%` }} />
                  </div>
                  {hud.stamina < 25 && <p className="mt-1 text-[10px] font-semibold">Reabasteça no bar, na padaria ou no terminal.</p>}
                </div>
              )}
            </div>
            <div className="pointer-events-auto ml-auto flex gap-2">
              <button type="button" onClick={toggleSound} aria-label={soundOn ? "Desligar som" : "Ligar som"} className="hud-btn">
                {soundOn ? "🔊" : "🔈"}
              </button>
              <button type="button" onClick={() => setMenu(true)} aria-label="Menu" className="hud-btn">
                ☰
              </button>
            </div>
          </div>

          {toast && (
            <div className="pointer-events-none absolute left-1/2 top-44 w-max max-w-[90vw] -translate-x-1/2 rounded-xl border-[3px] border-[#1e1424] bg-[#ffd23f] px-4 py-1.5 text-center text-sm font-black shadow-[0_3px_0_#1e1424]">
              {toast}
            </div>
          )}

          {/* dicas de teclado */}
          {!touch && (
            <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-[#1e1424]/80 px-3 py-1.5 text-xs font-semibold text-bone">
              {driving ? (
                <>
                  <b>W/↑</b> acelerar · <b>S/↓</b> frear e ré · <b>A/D ←/→</b> virar · <b>Espaço</b> freio de mão · <b>H</b> buzina · <b>E</b> sair
                </>
              ) : (
                <>
                  <b>WASD/setas</b> andar · <b>Shift</b> correr · <b>E</b> interagir
                </>
              )}
            </div>
          )}

          {/* controles de toque */}
          {touch && (
            <div className="absolute bottom-0 left-0 p-3" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))", paddingLeft: "max(0.75rem, env(safe-area-inset-left))" }}>
              <Joystick />
            </div>
          )}
          <div
            className="absolute bottom-0 right-0 flex flex-col items-end gap-3 p-3"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))", paddingRight: "max(0.75rem, env(safe-area-inset-right))" }}
          >
            {touch && driving && (
              <div className="flex gap-2">
                <button
                  type="button"
                  className="hud-round h-14 w-14 bg-white text-[11px]"
                  aria-label="Buzina"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    bus.emit("horn");
                  }}
                >
                  Bi-bi
                </button>
                <button
                  type="button"
                  className="hud-round h-14 w-16 bg-white text-sm"
                  aria-label="Ré: segure para dar ré"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    touchInput.reverse = true;
                    try {
                      e.currentTarget.setPointerCapture(e.pointerId);
                    } catch {
                      // segue funcionando sem captura
                    }
                  }}
                  onPointerUp={() => (touchInput.reverse = false)}
                  onPointerCancel={() => (touchInput.reverse = false)}
                  onLostPointerCapture={() => (touchInput.reverse = false)}
                >
                  Ré
                </button>
              </div>
            )}
            <button
              type="button"
              disabled={!action}
              aria-label={action ? `Ação: ${action}` : "Nenhuma ação disponível"}
              onPointerDown={(e) => {
                e.preventDefault();
                if (action) bus.emit("action");
              }}
              className={`hud-round flex-col leading-none transition ${touch ? "h-[88px] w-[88px] text-base" : "h-[74px] w-[74px] text-sm"} ${
                action ? "bg-[#ffd23f]" : "pointer-events-none scale-75 opacity-0"
              }`}
            >
              <span className="font-black">{action ?? "—"}</span>
              {!touch && action && <span className="mt-1 rounded bg-[#1e1424] px-1.5 py-0.5 text-[10px] text-bone">E</span>}
            </button>
          </div>

          {touch && driving && (
            <p className="pointer-events-none absolute bottom-[10.5rem] left-3 max-w-[11rem] rounded-lg bg-[#1e1424]/75 px-2 py-1 text-[11px] font-semibold leading-tight text-bone">
              Aponte o direcional para onde quer ir. Segure <b>Ré</b> para voltar.
            </p>
          )}
        </>
      )}

      {menu && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-black/55 p-4" onClick={() => setMenu(false)}>
          <div
            role="dialog"
            aria-label="Menu"
            className="w-full max-w-sm rounded-2xl border-4 border-[#1e1424] bg-[#fffaf0] p-4 shadow-[0_6px_0_#1e1424]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg font-black">Pausa</p>
            <div className="mt-3 flex flex-col gap-2">
              <button type="button" className="menu-btn bg-[#ffd23f]" onClick={() => setMenu(false)}>
                Continuar
              </button>
              <button type="button" className="menu-btn" onClick={onSwitch}>
                Trocar personagem
              </button>
              <button
                type="button"
                className={`menu-btn ${confirmReset ? "bg-[#c62835] text-white" : ""}`}
                onClick={() => {
                  if (confirmReset) onReset();
                  else setConfirmReset(true);
                }}
              >
                {confirmReset ? "Confirmar: reiniciar este Brasil" : "Reiniciar este Brasil"}
              </button>
              <Link href="/episodios" className="menu-btn text-center">
                Episódios da versão anterior
              </Link>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#1e1424]/70">
              Universo fictício e satírico: os boatos viraram realidade. Lula e Flávio são caricaturas inventadas; nada retrata fatos ou intenções reais.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
