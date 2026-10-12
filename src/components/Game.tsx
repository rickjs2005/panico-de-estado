"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import { applyEffects, INITIAL_METERS, pickEnding } from "@/game/engine";
import { otherRoute, ROUTES } from "@/game/routes";
import type { EndingId, Meters, Outcome, RouteId } from "@/game/types";
import { readPref, writePref } from "@/lib/hooks";
import { sound } from "@/lib/sound";
import EndingScreen from "./EndingScreen";
import PlayScreen from "./PlayScreen";
import RouteIntro from "./RouteIntro";
import RouteSelect from "./RouteSelect";
import TopControls from "./SoundToggle";
import TitleScreen from "./TitleScreen";

export type Screen = "title" | "select" | "intro" | "play" | "ending";

/** O que aconteceu na rodada: a ação do jogador e o resultado. */
export interface Resolved {
  label: string;
  outcome: Outcome;
}

export interface GameState {
  screen: Screen;
  route: RouteId | null;
  roundIndex: number;
  meters: Meters;
  /** Indicadores no começo da rodada (para variantes e cenas). */
  roundStartMeters: Meters;
  ignores: number;
  phase: "play" | "result";
  last: Resolved | null;
  ending: EndingId | null;
}

type Action =
  | { type: "goto"; screen: Screen }
  | { type: "pickRoute"; route: RouteId }
  | { type: "begin" }
  | { type: "resolve"; resolved: Resolved }
  | { type: "next" };

const initial: GameState = {
  screen: "title",
  route: null,
  roundIndex: 0,
  meters: INITIAL_METERS,
  roundStartMeters: INITIAL_METERS,
  ignores: 0,
  phase: "play",
  last: null,
  ending: null,
};

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "goto":
      return { ...state, screen: action.screen };
    case "pickRoute":
      return { ...initial, screen: "intro", route: action.route };
    case "begin":
      return { ...initial, screen: "play", route: state.route };
    case "resolve":
      if (state.phase !== "play") return state;
      return {
        ...state,
        phase: "result",
        last: action.resolved,
        meters: applyEffects(state.meters, action.resolved.outcome.effects),
        ignores: state.ignores + (action.resolved.outcome.ignore ? 1 : 0),
      };
    case "next": {
      if (!state.route) return state;
      const total = ROUTES[state.route].rounds.length;
      if (state.roundIndex + 1 >= total) {
        return { ...state, screen: "ending", ending: pickEnding(state.meters, state.ignores) };
      }
      return { ...state, roundIndex: state.roundIndex + 1, roundStartMeters: state.meters, phase: "play", last: null };
    }
  }
}

const SOUND_KEY = "panico-de-estado:som";
const TIME_KEY = "panico-de-estado:tempo-extra";

export default function Game() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [soundOn, setSoundOn] = useState(true);
  const [extraTime, setExtraTime] = useState(false);

  useEffect(() => {
    const s = readPref(SOUND_KEY, "on") !== "off";
    setSoundOn(s);
    sound.setEnabled(s);
    setExtraTime(readPref(TIME_KEY, "off") === "on");
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((on) => {
      const next = !on;
      sound.setEnabled(next);
      writePref(SOUND_KEY, next ? "on" : "off");
      if (next) {
        sound.unlock();
        sound.click();
      }
      return next;
    });
  }, []);

  const toggleTime = useCallback(() => {
    setExtraTime((on) => {
      writePref(TIME_KEY, on ? "off" : "on");
      return !on;
    });
  }, []);

  // Zumbido de fundo só durante o jogo e os finais.
  useEffect(() => {
    if (state.screen === "play" || state.screen === "ending") sound.drone(state.meters.panico);
    else sound.stopDrone();
  }, [state.screen, state.meters.panico]);

  // Cada troca de tela ou rodada começa no topo.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [state.screen, state.roundIndex]);

  const tap = () => {
    sound.unlock();
    sound.click();
  };

  const route = state.route ? ROUTES[state.route] : null;

  return (
    <div data-route={state.route ?? undefined} className="min-h-dvh">
      <TopControls soundOn={soundOn} onToggleSound={toggleSound} extraTime={extraTime} onToggleTime={toggleTime} />

      {state.screen === "title" && (
        <TitleScreen
          onStart={() => {
            tap();
            dispatch({ type: "goto", screen: "select" });
          }}
        />
      )}

      {state.screen === "select" && (
        <RouteSelect
          onPick={(id) => {
            tap();
            dispatch({ type: "pickRoute", route: id });
          }}
          onBack={() => {
            tap();
            dispatch({ type: "goto", screen: "title" });
          }}
        />
      )}

      {state.screen === "intro" && route && (
        <RouteIntro
          route={route}
          onBegin={() => {
            tap();
            dispatch({ type: "begin" });
          }}
          onBack={() => {
            tap();
            dispatch({ type: "goto", screen: "select" });
          }}
        />
      )}

      {state.screen === "play" && route && (
        <PlayScreen
          key={route.id}
          route={route}
          state={state}
          timeScale={extraTime ? 1.75 : 1}
          onResolve={(resolved) => {
            sound.unlock();
            if ((resolved.outcome.effects.panico ?? 0) >= 10) sound.sting(state.meters.panico);
            dispatch({ type: "resolve", resolved });
          }}
          onNext={() => {
            tap();
            dispatch({ type: "next" });
          }}
        />
      )}

      {state.screen === "ending" && route && state.ending && (
        <EndingScreen
          route={route}
          endingId={state.ending}
          meters={state.meters}
          onReplay={() => {
            tap();
            dispatch({ type: "pickRoute", route: route.id });
            dispatch({ type: "begin" });
          }}
          onSwitch={() => {
            tap();
            dispatch({ type: "pickRoute", route: otherRoute(route.id) });
          }}
          onTitle={() => {
            tap();
            dispatch({ type: "goto", screen: "title" });
          }}
        />
      )}
    </div>
  );
}
