import type { HeroId } from "./types";

/**
 * Progresso do mundo salvo no navegador. Cada protagonista vive no seu próprio
 * Brasil inventado, então a conclusão fica guardada por personagem.
 */

const KEY = "panico-de-estado:mundo:v1";

export interface WorldSave {
  /** Missões concluídas, como "flavio:chicote-expresso". */
  done: string[];
}

function empty(): WorldSave {
  return { done: [] };
}

export function readSave(): WorldSave {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty();
    const data = JSON.parse(raw) as Partial<WorldSave>;
    return { done: Array.isArray(data.done) ? data.done.filter((d) => typeof d === "string") : [] };
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

export function clearSave() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // nada a limpar
  }
}
