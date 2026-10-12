"use client";

import { useEffect, useRef } from "react";
import { METER_LABELS } from "@/game/engine";
import { otherRoute, ROUTES } from "@/game/routes";
import type { EndingId, MeterKey, Meters, RouteDef } from "@/game/types";
import Disclaimer from "./Disclaimer";
import Scene from "./Scene";
import { MetersBar, PhoneShell, StatusBar, Ticker, ToastStack } from "./Phone";
import { useNotifications } from "./useNotifications";

const ENDING_ORDER: EndingId[] = ["calma", "comissao", "transmite", "silencio", "outro"];

export default function EndingScreen({
  route,
  endingId,
  meters,
  onReplay,
  onSwitch,
  onTitle,
}: {
  route: RouteDef;
  endingId: EndingId;
  meters: Meters;
  onReplay: () => void;
  onSwitch: () => void;
  onTitle: () => void;
}) {
  const ending = route.endings[endingId];
  // O jogo acabou. As notificações, não.
  const { toasts, unread, dismiss } = useNotifications(route.notifications, Math.max(meters.panico, 60), true);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const other = ROUTES[otherRoute(route.id)];

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <PhoneShell panico={meters.panico} caos={meters.caos}>
      <StatusBar time="03:33" panico={meters.panico} unread={unread} battery={2} />
      <MetersBar meters={meters} />

      <div className="relative flex-1">
        <ToastStack toasts={toasts} onDismiss={dismiss} />

        <section className="flex flex-col gap-5 px-4 pb-8 pt-8" aria-labelledby="ending-title">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
            Final {ENDING_ORDER.indexOf(endingId) + 1} de {ENDING_ORDER.length} · {route.name}
          </p>
          <h1
            id="ending-title"
            ref={headingRef}
            tabIndex={-1}
            className="title-glitch accent text-5xl font-black uppercase leading-[0.95] focus:outline-none"
          >
            {ending.title}
          </h1>

          <Scene kind="home" cast={ending.cast} meters={meters} presidentId={route.roles.president} className="" />

          <div className="space-y-3">
            {ending.lines.map((l, i) => (
              <p key={i} className="anim-rise text-lg leading-snug" style={{ animationDelay: `${0.3 + i * 0.5}s` }}>
                {l}
              </p>
            ))}
          </div>

          <p
            className="anim-rise border-accent rounded-xl border-2 px-4 py-3 text-lg font-black"
            style={{ animationDelay: `${0.4 + ending.lines.length * 0.5}s` }}
          >
            {ending.kicker}
          </p>

          <dl className="grid grid-cols-3 gap-2 text-center text-sm">
            {(Object.keys(METER_LABELS) as MeterKey[]).map((k) => (
              <div key={k} className="rounded-lg bg-panel px-2 py-2">
                <dt className="text-xs text-muted">{METER_LABELS[k]}</dt>
                <dd className="font-mono text-xl font-bold">{meters[k]}</dd>
              </div>
            ))}
          </dl>

          <p className="text-sm text-muted">Existem 5 finais neste Brasil. Escolhas diferentes, medos diferentes.</p>

          <div className="flex flex-col gap-3">
            {endingId === "outro" ? (
              <>
                <button type="button" onClick={onSwitch} className={primary}>
                  Visitar o outro Brasil
                </button>
                <button type="button" onClick={onReplay} className={secondary}>
                  Jogar de novo neste Brasil
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={onReplay} className={primary}>
                  Jogar de novo
                </button>
                <button type="button" onClick={onSwitch} className={secondary}>
                  Trocar para “{other.name}”
                </button>
              </>
            )}
            <button type="button" onClick={onTitle} className={secondary}>
              Voltar ao início
            </button>
          </div>

          <Disclaimer />
        </section>
      </div>

      <Ticker items={route.ticker} step={7} />
    </PhoneShell>
  );
}

const primary =
  "bg-accent h-14 rounded-xl text-lg font-black uppercase tracking-wide text-ink transition hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-bone";
const secondary =
  "min-h-12 rounded-xl border border-line px-4 text-bone/90 hover:border-bone/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-bone";
