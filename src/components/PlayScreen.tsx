"use client";

import { useEffect, useRef, useState } from "react";
import { linesFor } from "@/game/engine";
import { IDLE_NAGS, IDLE_SECONDS } from "@/game/shared";
import type { Choice, Notification, RouteDef } from "@/game/types";
import { useReducedMotion } from "@/lib/hooks";
import type { GameState } from "./Game";
import LineView from "./LineView";
import { MetersBar, PhoneShell, StatusBar, Ticker, ToastStack } from "./Phone";
import Stage from "./Stage";
import { useNotifications } from "./useNotifications";

const KIND_LABEL = {
  chat: "Grupo",
  speech: "TV",
  live: "Live",
  press: "Coletiva",
  home: "Casa",
  feed: "Feed",
  call: "Ligação",
} as const;

export default function PlayScreen({
  route,
  state,
  onChoose,
  onNext,
}: {
  route: RouteDef;
  state: GameState;
  onChoose: (c: Choice) => void;
  onNext: () => void;
}) {
  const round = route.rounds[state.roundIndex];
  const { toasts, unread, push, dismiss } = useNotifications(route.notifications, state.meters.panico, true);
  const [shake, setShake] = useState(0);

  useEffect(() => {
    if (state.phase === "result" && (state.lastChoice?.effects.panico ?? 0) >= 10) setShake((s) => s + 1);
  }, [state.phase, state.lastChoice]);

  const battery = Math.max(3, 87 - state.roundIndex * 9 - Math.floor(state.meters.panico / 8));

  return (
    <PhoneShell panico={state.meters.panico} shake={shake}>
      <StatusBar time={round.time} panico={state.meters.panico} unread={unread} battery={battery} />
      <MetersBar meters={state.meters} delta={state.phase === "result" ? state.lastChoice?.effects : null} />

      <div className="relative flex-1">
        <ToastStack toasts={toasts} onDismiss={dismiss} />
        <RoundView
          key={state.roundIndex}
          route={route}
          state={state}
          kindLabel={KIND_LABEL[round.kind]}
          onChoose={onChoose}
          onNext={onNext}
          push={push}
        />
      </div>

      <Ticker items={route.ticker} step={state.roundIndex} />
    </PhoneShell>
  );
}

function RoundView({
  route,
  state,
  kindLabel,
  onChoose,
  onNext,
  push,
}: {
  route: RouteDef;
  state: GameState;
  kindLabel: string;
  onChoose: (c: Choice) => void;
  onNext: () => void;
  push: (n: Notification, urgent?: boolean) => void;
}) {
  const round = route.rounds[state.roundIndex];
  const reduced = useReducedMotion();
  // As variantes são calculadas com os indicadores do começo da rodada.
  const [lines] = useState(() => linesFor(round, state.meters));
  const headingRef = useRef<HTMLHeadingElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const isLast = state.roundIndex === route.rounds.length - 1;
  const choice = state.phase === "result" ? state.lastChoice : null;

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  // Se o jogador demora para escolher, o celular cobra.
  useEffect(() => {
    if (state.phase !== "choose") return;
    let count = 0;
    let timer: number;
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(nag, IDLE_SECONDS * 1000);
    };
    const nag = () => {
      if (count >= 3) return;
      push({ app: "Família Reunida 🇧🇷❤️", text: IDLE_NAGS[(state.roundIndex + count) % IDLE_NAGS.length] }, true);
      count += 1;
      timer = window.setTimeout(nag, 8000);
    };
    const events = ["pointerdown", "keydown", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [state.phase, state.roundIndex, push]);

  // Depois de uma escolha, mostra o resultado e, se houver, a mensagem que invade a tela.
  useEffect(() => {
    if (!choice) return;
    resultRef.current?.focus({ preventScroll: true });
    resultRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    const shock = choice.aftershock;
    if (!shock) return;
    const t = window.setTimeout(() => push({ app: shock.from ?? "Número desconhecido", text: shock.text }, true), 1600);
    return () => window.clearTimeout(t);
  }, [choice, push, reduced]);

  return (
    <section className="flex flex-col pb-6" aria-labelledby="scene-title">
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <span className="bg-accent-soft accent rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wide">
          {kindLabel}
        </span>
        <div className="min-w-0">
          <h2 id="scene-title" ref={headingRef} tabIndex={-1} className="truncate font-bold leading-tight focus:outline-none">
            {round.channel}
          </h2>
          {round.meta && <p className="truncate text-xs text-muted">{round.meta}</p>}
        </div>
        <span className="ml-auto font-mono text-xs text-muted">
          {state.roundIndex + 1}/{route.rounds.length}
        </span>
      </header>

      <Stage kind={round.kind} label={round.channel} />

      <div className="flex flex-col gap-3 px-4 pt-4">
        {lines.map((line, i) => (
          <div key={i} className="anim-rise flex flex-col" style={{ animationDelay: `${Math.min(i * 0.18, 1.6)}s` }}>
            <LineView line={line} />
          </div>
        ))}
      </div>

      {!choice && (
        <div
          className="anim-rise mt-6 flex flex-col gap-3 px-4"
          style={{ animationDelay: `${Math.min(lines.length * 0.18, 1.6) + 0.2}s` }}
          role="group"
          aria-label="O que você faz?"
        >
          <p className="text-sm font-bold uppercase tracking-wide text-muted">O que você faz?</p>
          {round.choices.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onChoose(c)}
              className="min-h-14 rounded-2xl border-2 border-line bg-panel px-4 py-3 text-left text-base font-semibold leading-snug text-bone transition hover:border-accent focus:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-bone active:scale-[0.99]"
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {choice && (
        <div
          ref={resultRef}
          tabIndex={-1}
          aria-live="polite"
          className="anim-rise border-accent mx-4 mt-6 scroll-mt-4 rounded-2xl border-2 bg-black/40 p-4 focus:outline-none"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Você: {choice.label}</p>
          <ul className="mt-3 space-y-2">
            {choice.result.map((r, i) => (
              <li
                key={i}
                className={`anim-rise text-lg leading-snug ${i === choice.result.length - 1 ? "font-bold" : ""}`}
                style={{ animationDelay: `${0.25 + i * 0.35}s` }}
              >
                {r}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onNext}
            className="bg-accent mt-5 h-14 w-full rounded-xl text-lg font-black uppercase tracking-wide text-ink transition hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-bone"
          >
            {isLast ? "Ver o que restou" : "Continuar"}
          </button>
        </div>
      )}
    </section>
  );
}
