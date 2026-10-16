import type { Point } from "../types";
import { initialPlaces, isPlace, PLACES, type PlaceId } from "./places";

/**
 * Progresso próprio da cidade do Lula: estados dos lugares, locais descobertos
 * e o destino marcado no mapa. Fica numa chave separada do salvamento das missões.
 */

const KEY = "panico-de-estado:cidade-lula:v1";

export interface CityProgress {
  places: Record<PlaceId, string>;
  discovered: string[];
  waypoint: (Point & { label: string }) | null;
}

function empty(): CityProgress {
  return { places: initialPlaces(), discovered: [], waypoint: null };
}

export function readCity(): CityProgress {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty();
    const data = JSON.parse(raw) as Partial<CityProgress> | null;
    const out = empty();
    if (data && typeof data === "object") {
      for (const [id, state] of Object.entries(data.places ?? {})) {
        if (isPlace(id) && typeof state === "string" && state in PLACES[id].states) out.places[id] = state;
      }
      if (Array.isArray(data.discovered)) out.discovered = data.discovered.filter((d): d is string => typeof d === "string");
      const w = data.waypoint;
      if (w && typeof w.x === "number" && typeof w.y === "number" && typeof w.label === "string") out.waypoint = { x: w.x, y: w.y, label: w.label };
    }
    return out;
  } catch {
    return empty();
  }
}

function write(p: CityProgress) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // sem armazenamento: vale só nesta visita
  }
}

export function setPlaceState(id: PlaceId, state: string) {
  if (!(state in PLACES[id].states)) return;
  const p = readCity();
  p.places[id] = state;
  write(p);
}

export function discover(id: string): boolean {
  const p = readCity();
  if (p.discovered.includes(id)) return false;
  p.discovered.push(id);
  write(p);
  return true;
}

export function saveWaypoint(w: CityProgress["waypoint"]) {
  const p = readCity();
  p.waypoint = w;
  write(p);
}

export function clearCity() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // nada a limpar
  }
}
