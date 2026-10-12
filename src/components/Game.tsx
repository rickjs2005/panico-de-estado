"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import { applyEffects, INITIAL_METERS, pickEnding } from "@/game/engine";
import { otherRoute, ROUTES } from "@/game/routes";
import type { Choice, EndingId, Meters, RouteId } from "@/game/types";
import { readSoundPref, writeSoundPref } from "@/lib/hooks";
import { sound } from "@/lib/sound";
import EndingScreen from "./EndingScreen";
import PlayScreen from "./PlayScreen";
import RouteIntro from "./RouteIntro";
import RouteSelect from "./RouteSelect";
import SoundToggle from "./SoundToggle";
import TitleScreen from "./TitleScreen";

export type Screen = "title" | "select" | "intro" | "play" | "ending";

export interface GameState {
  screen: Screen;
  route: RouteId | null;
  roundIndex: number;
  meters: Meters;
  ignores: number;
  phase: "choose" | "result";
  lastChoice: Choice | null;
  ending: EndingId | null;
}

type Action =
  | { type: "goto"; screen: Screen }
  | { type: "pickRoute"; route: RouteId }
  | { type: "begin" }
  | { type: "choose"; choice: Choice }
  | { type: "next" };

const initial: GameState = {
  screen: "title",
  route: null,
  roundIndex: 0,
  meters: INITIAL_METERS,
  ignores: 0,
  phase: "choose",
  lastChoice: null,
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
    case "choose":
      if (state.phase !== "choose") return state;
      return {
        ...state,
        phase: "result",
        lastChoice: action.choice,
        meters: applyEffects(state.meters, action.choice.effects),
        ignores: state.ignores + (action.choice.ignore ? 1 : 0),
      };
    case "next": {
      if (!state.route) return state;
      const total = ROUTES[state.route].rounds.length;
      if (state.roundIndex + 1 >= total) {
        return { ...state, screen: "ending", ending: pickEnding(state.meters, state.ignores) };
      }
      return { ...state, roundIndex: state.roundIndex + 1, phase: "choose", lastChoice: null };
    }
  }
}

export default function Game() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    const pref = readSoundPref();
    setSoundOn(pref);
    sound.setEnabled(pref);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((on) => {
      const next = !on;
      sound.setEnabled(next);
      writeSoundPref(next);
      if (next) {
        sound.unlock();
        sound.click();
      }
      return next;
    });
  }, []);

  // Zumbido de fundo só durante o jogo e os finais.
  useEffect(() => {
    if (state.screen === "play" || state.screen === "ending") sound.drone(state.meters.panico);
    else sound.stopDrone();
  }, [state.screen, state.meters.panico]);

  // Cada troca de tela começa no topo.
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
      <SoundToggle on={soundOn} onToggle={toggleSound} />

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
          onChoose={(choice) => {
            sound.unlock();
            sound.click();
            if ((choice.effects.panico ?? 0) >= 10) sound.sting(state.meters.panico);
            dispatch({ type: "choose", choice });
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
