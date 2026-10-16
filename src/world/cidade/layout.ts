import type { Rect } from "../types";
import type { DistrictDef, RoadDef } from "./types";

/**
 * Geometria da cidade: tamanho, limites naturais, avenidas, ruas e distritos.
 *
 * Desenho: um anel de ruas na borda, três avenidas formando uma cruz dupla
 * (Avenida do Povo na horizontal; Avenidas do Áudio e da Exportação na vertical)
 * e ruas locais com o traçado próprio de cada distrito.
 */

export const CITY = { w: 4800, h: 3600 };

/** Faixa de interiores, abaixo da cidade e fora da câmera da rua. */
export const INTERIOR_ZONE = { y: 3900, h: 900 };
export const WORLD_H = INTERIOR_ZONE.y + INTERIOR_ZONE.h;

/** Limites: morro ao norte, canal a oeste, baía ao sul e o muro a leste. */
export const LIMITS = {
  morro: { x: 0, y: 0, w: CITY.w, h: 150 },
  canal: { x: 0, y: 0, w: 130, h: CITY.h },
  baia: { x: 0, y: 3430, w: CITY.w, h: CITY.h - 3430 },
  muro: { x: 4670, y: 0, w: CITY.w - 4670, h: CITY.h },
} satisfies Record<string, Rect>;

export const ROADS: RoadDef[] = [
  // anel
  { id: "rua-da-serra", name: "Rua da Serra", kind: "rua", rect: { x: 130, y: 160, w: 4540, h: 110 } },
  { id: "rua-do-canal", name: "Rua do Canal", kind: "rua", rect: { x: 140, y: 160, w: 110, h: 3230 } },
  { id: "rua-do-muro", name: "Rua do Muro", kind: "rua", rect: { x: 4550, y: 160, w: 110, h: 3260 } },
  { id: "rua-da-orla", name: "Rua da Orla", kind: "rua", rect: { x: 140, y: 3270, w: 3150, h: 120 } },
  // avenidas
  { id: "av-do-povo", name: "Avenida do Povo", kind: "avenida", rect: { x: 140, y: 1710, w: 4520, h: 180 } },
  { id: "av-do-boato", name: "Avenida do Áudio", kind: "avenida", rect: { x: 1510, y: 160, w: 180, h: 3230 } },
  { id: "av-da-exportacao", name: "Avenida da Exportação", kind: "avenida", rect: { x: 3110, y: 160, w: 180, h: 3260 } },
  // residencial
  { id: "rua-do-mutirao", name: "Rua do Mutirão", kind: "rua", rect: { x: 250, y: 760, w: 1260, h: 110 } },
  { id: "rua-do-varal", name: "Rua do Varal", kind: "rua", rect: { x: 250, y: 1230, w: 1260, h: 110 } },
  { id: "rua-da-laje", name: "Rua da Laje", kind: "rua", rect: { x: 840, y: 270, w: 110, h: 1440 } },
  // centro cívico
  { id: "rua-dos-decretos", name: "Rua dos Decretos", kind: "rua", rect: { x: 1690, y: 650, w: 1420, h: 110 } },
  { id: "rua-do-protocolo", name: "Rua do Protocolo", kind: "rua", rect: { x: 1690, y: 1220, w: 1420, h: 110 } },
  { id: "rua-do-carimbo", name: "Rua do Carimbo", kind: "rua", rect: { x: 1990, y: 270, w: 110, h: 1440 } },
  { id: "rua-da-reparticao", name: "Rua da Repartição", kind: "rua", rect: { x: 2700, y: 270, w: 110, h: 1440 } },
  // educacional
  { id: "rua-do-diploma", name: "Rua do Diploma", kind: "rua", rect: { x: 3290, y: 900, w: 1260, h: 110 } },
  { id: "rua-da-merenda", name: "Rua da Merenda", kind: "rua", rect: { x: 3900, y: 1010, w: 110, h: 700 } },
  // industrial
  { id: "via-de-servico", name: "Via de Serviço", kind: "rua", rect: { x: 250, y: 2520, w: 1260, h: 110 } },
  { id: "rua-da-fumaca", name: "Rua da Fumaça", kind: "rua", rect: { x: 860, y: 1890, w: 110, h: 1380 } },
  // comercial
  { id: "rua-da-feira", name: "Rua da Feira", kind: "rua", rect: { x: 1690, y: 2470, w: 1420, h: 110 } },
  { id: "rua-do-fiado", name: "Rua do Fiado", kind: "rua", rect: { x: 2150, y: 1890, w: 110, h: 1380 } },
  { id: "rua-da-pechincha", name: "Rua da Pechincha", kind: "rua", rect: { x: 2620, y: 1890, w: 110, h: 1380 } },
  // terminal
  { id: "via-do-conteiner", name: "Via do Contêiner", kind: "rua", rect: { x: 3290, y: 2560, w: 1260, h: 110 } },
  { id: "rua-da-alfandega", name: "Rua da Alfândega", kind: "rua", rect: { x: 3860, y: 1890, w: 110, h: 1380 } },
];

export const DISTRICTS: DistrictDef[] = [
  { id: "residencial", name: "Vila do Mutirão", tagline: "Residencial · tudo é de todos, até o seu portão", area: { x: 250, y: 270, w: 1260, h: 1440 }, color: "#e07a5f" },
  { id: "civico", name: "Centro Cívico", tagline: "Prefeitura, ministérios e muito carimbo", area: { x: 1690, y: 270, w: 1420, h: 1440 }, color: "#c62835" },
  { id: "educacional", name: "Cidade Universitária", tagline: "Educacional · o campus liberou geral", area: { x: 3290, y: 270, w: 1260, h: 1440 }, color: "#3a86c8" },
  { id: "industrial", name: "Polo Industrial", tagline: "Fábricas, galpões e a fumaça do progresso", area: { x: 250, y: 1890, w: 1260, h: 1380 }, color: "#8a8f98" },
  { id: "comercial", name: "Largo da Feira", tagline: "Comércio · feira, fiado e cachaça presidencial", area: { x: 1690, y: 1890, w: 1420, h: 1380 }, color: "#f2a33a" },
  { id: "terminal", name: "Terminal Brasil–China", tagline: "Exportação · o país inteiro, frete grátis", area: { x: 3290, y: 1890, w: 1260, h: 1530 }, color: "#d1453b" },
];

/** Distância entre o asfalto e o miolo dos quarteirões. */
export const SIDEWALK = 32;

/** Retângulo do miolo de um quarteirão a partir das ruas em volta. */
export function lot(x0: number, y0: number, x1: number, y1: number): Rect {
  return { x: x0 + SIDEWALK, y: y0 + SIDEWALK, w: x1 - x0 - 2 * SIDEWALK, h: y1 - y0 - 2 * SIDEWALK };
}
