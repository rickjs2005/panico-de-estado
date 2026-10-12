"use client";

import { useCallback, useEffect, useState } from "react";
import { countWins, readProgress, remember, type Progress } from "@/game/engine";
import { pickEnding } from "@/game/finale";
import { otherRoute, ROUTES } from "@/game/routes";
import type { EpisodeResult, Reward, RouteId } from "@/game/types";
import { readPref, writePref } from "@/lib/hooks";
import { sound } from "@/lib/sound";
import EndingScreen from "./EndingScreen";
import EpisodePlayer, { type EpisodeReport } from "./EpisodePlayer";
import Interlude from "./Interlude";
import RouteSelect from "./RouteSelect";
import TopControls from "./SoundToggle";
import TitleScreen from "./TitleScreen";

type Screen = "title" | "select" | "episode" | "interlude" | "ending";

interface Run {
  route: RouteId;
  /** 0–2 = episódios, 3 = desfecho. */
  index: number;
  results: EpisodeResult[];
  rewards: Reward[];
  ending: string | null;
}

const SOUND_KEY = "panico-de-estado:som";
const TIME_KEY = "panico-de-estado:tempo-extra";

export default function Game() {
  const [screen, setScreen] = useState<Screen>("title");
  const [run, setRun] = useState<Run | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [extraTime, setExtraTime] = useState(false);
  const [progress, setProgress] = useState<Progress>({ endings: [], rewards: [] });

  useEffect(() => {
    const s = readPref(SOUND_KEY, "on") !== "off";
    setSoundOn(s);
    sound.setEnabled(s);
    setExtraTime(readPref(TIME_KEY, "off") === "on");
    setProgress(readProgress());
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen, run?.index]);

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

  const tap = () => {
    sound.unlock();
    sound.click();
  };

  const start = (route: RouteId) => {
    tap();
    setRun({ route, index: 0, results: [], rewards: [], ending: null });
    setScreen("episode");
  };

  const route = run ? ROUTES[run.route] : null;

  const finishEpisode = (report: EpisodeReport) => {
    if (!run || !route) return;
    if (run.index < route.episodes.length) {
      if (report.reward) setProgress(remember("rewards", run.route, report.reward.prop));
      setRun({
        ...run,
        results: [...run.results, report.result],
        rewards: report.reward ? [...run.rewards, report.reward] : run.rewards,
      });
      setScreen("interlude");
    } else {
      const ending = pickEnding(report.flags);
      setProgress(remember("endings", run.route, ending));
      setRun({ ...run, ending });
      setScreen("ending");
    }
  };

  const nextEpisode = () => {
    if (!run) return;
    tap();
    setRun({ ...run, index: run.index + 1 });
    setScreen("episode");
  };

  const episode = run && route ? (run.index < route.episodes.length ? route.episodes[run.index] : route.finale) : null;

  return (
    <div data-route={run?.route} className="min-h-dvh">
      <TopControls soundOn={soundOn} onToggleSound={toggleSound} extraTime={extraTime} onToggleTime={toggleTime} />

      {screen === "title" && (
        <TitleScreen
          onStart={() => {
            tap();
            setScreen("select");
          }}
        />
      )}

      {screen === "select" && (
        <RouteSelect
          progress={progress}
          onPick={start}
          onBack={() => {
            tap();
            setScreen("title");
          }}
        />
      )}

      {screen === "episode" && run && route && episode && (
        <main className="mx-auto max-w-2xl pt-14">
          <EpisodePlayer
            key={`${run.route}-${run.index}-${run.results.length}`}
            episode={episode}
            timeScale={extraTime ? 1.75 : 1}
            wins={countWins(run.results)}
            onFinish={finishEpisode}
          />
        </main>
      )}

      {screen === "interlude" && run && route && (
        <Interlude route={route} index={run.index} results={run.results} rewards={run.rewards} onNext={nextEpisode} />
      )}

      {screen === "ending" && run && route && run.ending && (
        <EndingScreen
          route={route}
          endingId={run.ending}
          results={run.results}
          rewards={run.rewards}
          progress={progress}
          onOther={() => start(otherRoute(run.route))}
          onReplay={() => start(run.route)}
          onTitle={() => {
            tap();
            setScreen("title");
          }}
        />
      )}
    </div>
  );
}
