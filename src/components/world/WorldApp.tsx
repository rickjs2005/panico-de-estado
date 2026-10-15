"use client";

import { useState } from "react";
import { sound } from "@/lib/sound";
import { clearSave } from "@/world/save";
import type { HeroId } from "@/world/types";
import CharacterSelect from "./CharacterSelect";
import WorldView from "./WorldView";

/** Escolha do protagonista e o bairro. Sem cadastro: um toque e já começa. */
export default function WorldApp() {
  const [hero, setHero] = useState<HeroId | null>(null);
  const [run, setRun] = useState(0);

  if (!hero) {
    return (
      <CharacterSelect
        onPick={(h) => {
          sound.unlock();
          setHero(h);
        }}
      />
    );
  }
  return (
    <WorldView
      key={`${hero}-${run}`}
      hero={hero}
      onSwitch={() => setHero(null)}
      onReset={() => {
        clearSave();
        setRun((r) => r + 1);
      }}
    />
  );
}
