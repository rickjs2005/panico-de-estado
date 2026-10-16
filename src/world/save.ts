import type { HeroId } from "./types";

/**
 * Progresso do mundo salvo no navegador. Cada protagonista vive no seu próprio
 * Brasil inventado, então a conclusão fica guardada por personagem.
 */

const KEY = "panico-de-estado:mundo:v1";

export interface WorldSave {
  /** Missões concluídas, como "flavio:chicote-expresso". */
  done: string[];
  progress: Partial<Record<HeroId, { mission: string; step: string; holding: string | null }>>;
}

function empty(): WorldSave {
  return { done: [], progress: {} };
}

export function readSave(): WorldSave {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty();
    const data = JSON.parse(raw) as Partial<WorldSave>;
    const progress: WorldSave["progress"] = {};
    for (const hero of ["lula", "flavio"] as const) {
      const p = data?.progress?.[hero];
      if (p && typeof p.mission === "string" && typeof p.step === "string" && (p.holding === null || typeof p.holding === "string")) progress[hero] = p;
    }
    return { done: Array.isArray(data?.done) ? data.done.filter((d) => typeof d === "string") : [], progress };
  } catch {
    return empty();
  }
}

export function isDone(hero: HeroId, missionId: string): boolean {
  return readSave().done.includes(`${hero}:${missionId}`);
}

export function markDone(hero: HeroId, missionId: string) {
  const save = readSave();
  const key = `${hero}:${missionId}`;
  if (save.done.includes(key)) return;
  save.done.push(key);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    // sem armazenamento: a conclusão vale só nesta visita
  }
}

export function saveProgress(hero: HeroId, mission: string, step: string, holding: string | null) {
  const save = readSave();
  save.progress[hero] = { mission, step, holding };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    // Sem armazenamento, a partida continua nesta visita.
  }
}

export function clearSave(hero?: HeroId) {
  try {
    if (!hero) window.localStorage.removeItem(KEY);
    else {
      const save = readSave();
      save.done = save.done.filter((id) => !id.startsWith(`${hero}:`));
      delete save.progress[hero];
      window.localStorage.setItem(KEY, JSON.stringify(save));
    }
  } catch {
    // nada a limpar
  }
}
