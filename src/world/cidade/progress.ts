import type { Point } from "../types";
import { CAMPANHA } from "./missoes/campanha";
import { estadoVazio, sanear, type Estado } from "./missoes/motor";
import { initialPlaces, isPlace, PLACES, type PlaceId } from "./places";

/**
 * Progresso próprio da cidade do Lula: estados dos lugares, locais descobertos
 * e o destino marcado no mapa. Fica numa chave separada do salvamento das missões.
 */

const KEY = "panico-de-estado:cidade-lula:v1";

export interface CityProgress {
  places: Record<PlaceId, string>;
  discovered: string[];
  /** Prédios em que o jogador já entrou. */
  visited: string[];
  waypoint: (Point & { label: string }) | null;
  /** Hora do dia da cidade (minutos desde a meia-noite). Ausente em saves antigos. */
  hora?: number;
  /** Campanha de missões: etapa, itens, selos e flags. Saves antigos começam sem missão. */
  campanha: Estado;
}

function empty(): CityProgress {
  return { places: initialPlaces(), discovered: [], visited: [], waypoint: null, campanha: estadoVazio() };
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
      if (Array.isArray(data.visited)) out.visited = data.visited.filter((d): d is string => typeof d === "string");
      if (typeof data.hora === "number" && Number.isFinite(data.hora)) out.hora = data.hora;
      out.campanha = sanear((data as { campanha?: unknown }).campanha, CAMPANHA);
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

export function visit(buildingId: string): boolean {
  const p = readCity();
  if (p.visited.includes(buildingId)) return false;
  p.visited.push(buildingId);
  write(p);
  return true;
}

export function saveCampanha(campanha: Estado) {
  const p = readCity();
  p.campanha = campanha;
  write(p);
}

export function saveHora(minutos: number) {
  const p = readCity();
  p.hora = Math.round(minutos);
  write(p);
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
