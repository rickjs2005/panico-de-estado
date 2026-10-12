"use client";

import { useEffect, useRef, useState } from "react";
import { linesFor, reactedCast } from "@/game/engine";
import { IDLE_NAGS, IDLE_SECONDS } from "@/game/shared";
import type { CastSlot, ChoiceRound, Notification, Outcome, Round, RouteDef } from "@/game/types";
import { useReducedMotion } from "@/lib/hooks";
import { sound } from "@/lib/sound";
import type { GameState, Resolved } from "./Game";
import LineView from "./LineView";
import { DragGame, InterruptGame, TapGame, TimeBar, useCountdown, type Tier } from "./Minigames";
import { MetersBar, PhoneShell, StatusBar, Ticker, ToastStack } from "./Phone";
import Puppet from "./Puppet";
import Scene, { presidentMood } from "./Scene";
import { useNotifications } from "./useNotifications";

const MODE_LABEL: Record<Round["mode"], string> = {
  choice: "Decisão",
  tap: "Ação rápida",
  interrupt: "Ação rápida",
  drag: "Ação rápida",
};

export default function PlayScreen({
  route,
  state,
  timeScale,
  onResolve,
  onNext,
}: {
  route: RouteDef;
  state: GameState;
  timeScale: number;
  onResolve: (r: Resolved) => void;
  onNext: () => void;
}) {
  const round = route.rounds[state.roundIndex];
  // Notificações de fundo só incomodam nas decisões e nos resultados (nos minijogos, a tela já é o caos).
  const ambient = round.mode === "choice" || state.phase === "result";
  const { toasts, unread, push, dismiss } = useNotifications(route.notifications, state.meters.panico, ambient);
  const [shake, setShake] = useState(0);

  useEffect(() => {
    if (state.phase === "result" && (state.last?.outcome.effects.panico ?? 0) >= 10) setShake((s) => s + 1);
  }, [state.phase, state.last]);

  const battery = Math.max(3, 87 - state.roundIndex * 8 - Math.floor(state.meters.panico / 8));
  const ticker = state.meters.caos >= 50 ? [...route.ticker, ...route.chaosTicker] : route.ticker;

  return (
    <PhoneShell panico={state.meters.panico} caos={state.meters.caos} shake={shake}>
      <StatusBar time={round.time} panico={state.meters.panico} unread={unread} battery={battery} />
      <MetersBar meters={state.meters} delta={state.phase === "result" ? state.last?.outcome.effects : null} />

      <div className="relative flex-1">
        <ToastStack toasts={toasts} onDismiss={dismiss} />
        <RoundView
          key={state.roundIndex}
          route={route}
          state={state}
          timeScale={timeScale}
          onResolve={onResolve}
          onNext={onNext}
          push={push}
        />
      </div>

      <Ticker items={ticker} step={state.roundIndex} />
    </PhoneShell>
  );
}

function RoundView({
  route,
  state,
  timeScale,
  onResolve,
  onNext,
  push,
}: {
  route: RouteDef;
  state: GameState;
  timeScale: number;
  onResolve: (r: Resolved) => void;
  onNext: () => void;
  push: (n: Notification, urgent?: boolean) => void;
}) {
  const round = route.rounds[state.roundIndex];
  const reduced = useReducedMotion();
  const [lines] = useState(() => linesFor(round, state.roundStartMeters));
  const headingRef = useRef<HTMLHeadingElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const isLast = state.roundIndex === route.rounds.length - 1;
  const resolved = state.phase === "result" ? state.last : null;

  // Elenco em cena: o presidente caricato reage à popularidade; depois do resultado, todos reagem.
  const baseCast: CastSlot[] = round.cast.map((c) =>
    c.id === route.roles.president ? { ...c, mood: presidentMood(state.roundStartMeters.popularidade) } : c,
  );
  const cast = resolved ? reactedCast(round.cast, resolved.outcome) : baseCast;

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  // Decisões sem relógio: se o jogador demora, o celular cobra.
  useEffect(() => {
    if (state.phase !== "play" || round.mode !== "choice" || round.timer) return;
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
  }, [state.phase, state.roundIndex, round, push]);

  // Depois do resultado: rola até ele e, se houver, uma mensagem invade a tela.
  useEffect(() => {
    if (!resolved) return;
    resultRef.current?.focus({ preventScroll: true });
    resultRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    const shock = resolved.outcome.aftershock;
    if (!shock) return;
    const t = window.setTimeout(() => push({ app: shock.from ?? "Número desconhecido", text: shock.text }, true), 1600);
    return () => window.clearTimeout(t);
  }, [resolved, push, reduced]);

  const resolve = (label: string, outcome: Outcome) => onResolve({ label, outcome });
  const resolveTier = (tier: Tier, label: string) => {
    if (round.mode === "choice") return;
    resolve(label, round.outcomes[tier]);
  };

  return (
    <section className="flex flex-col pb-6" aria-labelledby="scene-title">
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <span className="bg-accent-soft accent rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wide">
          {MODE_LABEL[round.mode]}
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

      <Scene kind={round.kind} cast={cast} meters={state.meters} presidentId={route.roles.president} />

      <div className="tilt flex flex-col gap-3 px-4 pt-4">
        {lines.map((line, i) => (
          <div key={i} className="anim-rise flex flex-col" style={{ animationDelay: `${Math.min(i * 0.15, 1.2)}s` }}>
            <LineView line={line} />
          </div>
        ))}
      </div>

      {!resolved && (
        <div
          className="anim-rise mt-6 flex flex-col gap-3 px-4"
          style={{ animationDelay: `${Math.min(lines.length * 0.15, 1.2) + 0.2}s` }}
        >
          <p className="accent text-sm font-black uppercase tracking-wide">{round.prompt}</p>
          {round.mode === "choice" && <ChoicePanel round={round} timeScale={timeScale} onPick={resolve} />}
          {round.mode === "tap" && (
            <TapGame round={round} timeScale={timeScale} panico={state.meters.panico} onDone={resolveTier} />
          )}
          {round.mode === "interrupt" && <InterruptGame round={round} timeScale={timeScale} onDone={resolveTier} />}
          {round.mode === "drag" && <DragGame round={round} timeScale={timeScale} onDone={resolveTier} />}
        </div>
      )}

      {resolved && (
        <div
          ref={resultRef}
          tabIndex={-1}
          aria-live="polite"
          className="anim-rise border-accent mx-4 mt-6 scroll-mt-4 rounded-2xl border-2 bg-black/40 p-4 focus:outline-none"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Você: {resolved.label}</p>
          <ul className="mt-3 space-y-2">
            {resolved.outcome.result.map((r, i) => (
              <li
                key={i}
                className={`anim-rise text-lg leading-snug ${i === resolved.outcome.result.length - 1 ? "font-bold" : ""}`}
                style={{ animationDelay: `${0.2 + i * 0.3}s` }}
              >
                {r}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-end justify-center gap-1 rounded-xl bg-white/5 pt-2" aria-label="Reações">
            {cast.map((c) => (
              <Puppet key={c.id} id={c.id} mood={c.mood} size={58} />
            ))}
          </div>
          <button
            type="button"
            onClick={onNext}
            className="bg-accent mt-4 h-14 w-full rounded-xl text-lg font-black uppercase tracking-wide text-ink transition hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-bone"
          >
            {isLast ? "Ver o que restou" : "Próxima crise →"}
          </button>
        </div>
      )}
    </section>
  );
}

/** Opções de uma decisão. Com relógio, o tempo esgotado também é uma escolha (a pior). */
function ChoicePanel({
  round,
  timeScale,
  onPick,
}: {
  round: ChoiceRound;
  timeScale: number;
  onPick: (label: string, outcome: Outcome) => void;
}) {
  const total = (round.timer ?? 0) * timeScale;
  const done = useRef(false);
  const pick = (label: string, outcome: Outcome) => {
    if (done.current) return;
    done.current = true;
    sound.click();
    onPick(label, outcome);
  };
  const left = useCountdown(total, total > 0, () => {
    if (round.timeout) {
      sound.fail();
      pick("Não respondeu a tempo", round.timeout);
    }
  });
  const cards = round.layout === "cards";

  return (
    <div className="flex flex-col gap-3" role="group" aria-label={round.prompt}>
      {total > 0 && <TimeBar left={left} total={total} label="Tempo para decidir" />}
      {round.choices.map((c, i) => (
        <button
          key={c.id}
          type="button"
          onClick={() => pick(c.label, c)}
          className={
            cards
              ? "min-h-16 rounded-2xl border-2 border-alarm/50 bg-alarm/10 px-4 py-3 text-left text-base font-semibold leading-snug text-bone transition hover:border-alarm focus:outline-none focus-visible:ring-2 focus-visible:ring-bone active:scale-[0.99]"
              : "min-h-14 rounded-2xl border-2 border-line bg-panel px-4 py-3 text-left text-base font-semibold leading-snug text-bone transition hover:border-accent focus:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-bone active:scale-[0.99]"
          }
        >
          {cards && (
            <span className="mb-1 block text-[11px] font-black uppercase tracking-widest text-alarm">Crise {i + 1}</span>
          )}
          {c.label}
        </button>
      ))}
    </div>
  );
}
