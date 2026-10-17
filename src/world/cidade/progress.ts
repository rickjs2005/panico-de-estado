import type { Point } from "../types";
import { CAMPANHA, CIDADE, initialPlaces, isPlace, PLACES, type PlaceId } from "./index";
import { estadoVazio, sanear, type Estado } from "./missoes/motor";

/**
 * Progresso próprio da cidade ativa: estados dos lugares, locais descobertos e o destino marcado
 * no mapa. Cada cidade tem a sua chave (`chaveSave`), separada do salvamento das missões do bairro.
 */

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
    const raw = window.localStorage.getItem(CIDADE.chaveSave);
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
    window.localStorage.setItem(CIDADE.chaveSave, JSON.stringify(p));
  } catch {
    // sem armazenamento: vale só nesta visita
  }
}

export function setPlaceState(id: PlaceId, state: string) {
  if (!isPlace(id) || !(state in PLACES[id].states)) return;
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

/** Apaga o progresso de uma cidade (a ativa, se nenhuma chave for dada). */
export function clearCity(chave = CIDADE.chaveSave) {
  try {
    window.localStorage.removeItem(chave);
  } catch {
    // nada a limpar
  }
}
