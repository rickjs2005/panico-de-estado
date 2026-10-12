"use client";

import { useEffect, useState } from "react";
import { METER_LABELS, panicLevel } from "@/game/engine";
import type { Effects, MeterKey, Meters } from "@/game/types";
import { useReducedMotion } from "@/lib/hooks";
import type { Toast } from "./useNotifications";

const METER_COLOR: Record<MeterKey, string> = {
  panico: "bg-siren",
  popularidade: "bg-alarm",
  caos: "bg-sky-400",
};

/** Moldura de celular: tela cheia no celular, aparelho centralizado no computador. */
export function PhoneShell({
  panico,
  caos = 0,
  shake,
  children,
}: {
  panico: number;
  caos?: number;
  shake?: number;
  children: React.ReactNode;
}) {
  const caosLevel = caos >= 70 ? 2 : caos >= 50 ? 1 : 0;
  return (
    <div className="mx-auto min-h-dvh max-w-md pt-16 sm:py-16">
      <div
        key={shake}
        data-panic={panicLevel(panico)}
        data-caos={caosLevel}
        className={`phone-screen flex min-h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-ink sm:min-h-[760px] sm:rounded-[2.2rem] sm:border-[6px] sm:border-[#22222b] sm:shadow-2xl ${shake ? "anim-shake" : ""}`}
      >
        {caosLevel === 2 && (
          <svg className="crack" viewBox="0 0 100 200" preserveAspectRatio="none" aria-hidden>
            <path
              d="M70 0 L64 30 L72 42 L58 70 L66 84 L52 120 M64 30 L80 36 M58 70 L44 76 M66 84 L82 96"
              stroke="#fff"
              strokeWidth="0.6"
              fill="none"
            />
          </svg>
        )}
        {children}
      </div>
    </div>
  );
}

export function StatusBar({ time, panico, unread, battery }: { time: string; panico: number; unread: number; battery: number }) {
  const level = panicLevel(panico);
  const shownTime = level === 3 ? "03:33" : time;
  return (
    <div className="flex items-center justify-between px-5 pb-1 pt-3 font-mono text-xs text-bone/80">
      <span className="jitter" aria-label={`Hora: ${shownTime}`}>
        {shownTime}
      </span>
      <span className="flex items-center gap-3">
        <span aria-label={`${unread} notificações não lidas`} className={unread > 0 ? "accent font-bold" : ""}>
          🔔 {unread}
        </span>
        <span aria-hidden>{level >= 2 ? "SEM SINAL?" : "4G do Medo"}</span>
        <span aria-label={`Bateria: ${battery}%`} className={battery <= 20 ? "text-siren anim-blink" : ""}>
          {battery}%
        </span>
      </span>
    </div>
  );
}

export function MetersBar({ meters, delta }: { meters: Meters; delta?: Effects | null }) {
  return (
    <div className="grid grid-cols-3 gap-2 border-b border-line px-4 pb-1 pt-1" role="group" aria-label="Indicadores">
      {(Object.keys(METER_LABELS) as MeterKey[]).map((k) => {
        const d = delta?.[k] ?? 0;
        return (
          <div key={k}>
            <div className="flex items-baseline justify-between gap-1 text-[10px] font-semibold uppercase tracking-wide text-bone/80 sm:text-[11px]">
              <span>{METER_LABELS[k]}</span>
              <span className="font-mono text-bone">{meters[k]}</span>
            </div>
            <div
              className="mt-1 h-2 overflow-hidden rounded-full bg-line"
              role="meter"
              aria-label={METER_LABELS[k]}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={meters[k]}
            >
              <div
                className={`h-full rounded-full ${METER_COLOR[k]} transition-[width] duration-700`}
                style={{ width: `${meters[k]}%` }}
              />
            </div>
            <div className="mt-0.5 h-4 text-right font-mono text-xs font-bold">
              {d !== 0 && (
                <span className={`anim-rise inline-block ${d > 0 ? "text-siren" : "text-acid"}`}>
                  {d > 0 ? `+${d}` : d} {d > 0 ? "▲" : "▼"}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Pilha de notificações sobre a tela. Decorativa para leitores de tela (o contador fica na barra de status). */
export function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="pointer-events-none absolute inset-x-3 top-2 z-40 flex flex-col gap-2" aria-hidden>
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          tabIndex={-1}
          onClick={() => onDismiss(t.id)}
          className={`anim-drop pointer-events-auto rounded-2xl border px-4 py-2 text-left shadow-lg backdrop-blur ${
            t.urgent ? "border-accent bg-[#2a0d12]/95" : "border-line bg-panel/95"
          }`}
        >
          <span className={`block text-[11px] font-bold uppercase tracking-wide ${t.urgent ? "accent" : "text-muted"}`}>
            {t.app}
          </span>
          <span className="block text-sm leading-snug text-bone">{t.text}</span>
        </button>
      ))}
    </div>
  );
}

/** Faixa de manchetes contraditórias. Com movimento reduzido, troca de manchete sem rolar. */
export function Ticker({ items, step }: { items: string[]; step: number }) {
  const reduced = useReducedMotion();
  const [i, setI] = useState(step);
  useEffect(() => setI(step), [step]);

  if (reduced) {
    return (
      <div className="border-t border-line bg-black px-4 py-2 text-xs text-bone/80" aria-hidden>
        <span className="accent font-bold">URGENTE · </span>
        {items[i % items.length]}
      </div>
    );
  }
  const row = items.join("   ●   ");
  return (
    <div className="overflow-hidden border-t border-line bg-black py-2 text-xs text-bone/80" aria-hidden>
      <div className="ticker-track flex w-max whitespace-nowrap">
        <span className="px-4">
          <span className="accent font-bold">URGENTE · </span>
          {row}
        </span>
        <span className="px-4">
          <span className="accent font-bold">URGENTE · </span>
          {row}
        </span>
      </div>
    </div>
  );
}
