"use client";

import { useState } from "react";
import { sound } from "@/lib/sound";
import { ativaCidade, temCidade } from "@/world/cidade/ativa";
import { clearCity } from "@/world/cidade/progress";
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
        clearSave(hero);
        if (temCidade(hero)) {
          ativaCidade(hero);
          clearCity();
        }
        setRun((r) => r + 1);
      }}
    />
  );
}
