import type { LookId } from "../looks";
import type { NpcDef } from "../map";
import type { Point, Rect } from "../types";

/**
 * Tipos da cidade do Brasil hipotético do Lula.
 *
 * Os dados ficam separados por responsabilidade:
 * - geometria e colisão: ruas, lotes, pegadas dos prédios e áreas sólidas dos objetos;
 * - aparência: cores, letreiros, decoração;
 * - interações ambientais: portas, cachaça, objetos que reagem a batidas;
 * - estados persistentes: lugares que futuras histórias podem mudar;
 * - vínculos futuros: ganchos para missões e personagens (`hooks`).
 * Todo item tem um id estável, que não deve mudar entre versões.
 */

export type DistrictId = "civico" | "residencial" | "comercial" | "educacional" | "industrial" | "terminal";

export interface DistrictDef {
  id: DistrictId;
  name: string;
  /** Uma linha que aparece ao entrar no distrito. */
  tagline: string;
  area: Rect;
  /** Cor do distrito no mapa e nos detalhes de sinalização. */
  color: string;
}

export type RoadKind = "avenida" | "rua";

export interface RoadDef {
  id: string;
  name: string;
  kind: RoadKind;
  rect: Rect;
}

export type GroundKind = "grama" | "calcada" | "terra" | "ondas" | "concreto" | "patio" | "quadra";

export interface GroundDef {
  rect: Rect;
  kind: GroundKind;
}

export type CityBuildingKind =
  | "casa"
  | "loja"
  | "igreja"
  | "fabrica"
  | "escola"
  | "prefeitura"
  | "ministerio"
  | "reparticao"
  | "capela"
  | "conjunto"
  | "galpao"
  | "armazem"
  | "alfandega"
  | "universidade";

export interface Hooks {
  /** Ids de missões futuras que usam este lugar. */
  missions?: string[];
  /** Ids de personagens futuros que vivem ou trabalham aqui. */
  characters?: string[];
}

export interface CityBuilding {
  id: string;
  district: DistrictId;
  kind: CityBuildingKind;
  /** Pegada no chão (colide). */
  x: number;
  y: number;
  w: number;
  d: number;
  /** Altura da fachada e espaço extra para torres. */
  h: number;
  top?: number;
  wall: string;
  roof: "telha" | "laje";
  sign?: string;
  awning?: [string, string];
  /** Posição da porta na fachada, em fração da largura (padrão 0,5). */
  door?: number;
  /** Interior acessível por esta porta. */
  interior?: string;
  /** Estado persistente ligado a este prédio. */
  place?: string;
  hooks?: Hooks;
}

export type CityPropKind =
  | "arvore"
  | "palmeira"
  | "ipe"
  | "poste"
  | "banco"
  | "coreto"
  | "orelhao"
  | "banca"
  | "mesaBar"
  | "barraca"
  | "lixeira"
  | "pneus"
  | "trave"
  | "bandeira"
  | "outdoor"
  | "placaColetiva"
  | "frade"
  | "cone"
  | "tambor"
  | "palete"
  | "caminhao"
  | "conteiner"
  | "guindaste"
  | "esteira"
  | "monumento"
  | "chafariz"
  | "varal"
  | "barracaCamping"
  | "caixaSom"
  | "mesaPiquenique"
  | "cancela"
  | "quiosque"
  | "pontoOnibus"
  | "tabela"
  | "caixasKits"
  | "placaRua"
  | "faixaCampus"
  | "cabeco"
  | "balcao"
  | "banqueta"
  | "prateleira"
  | "jukebox"
  | "guiche"
  | "cadeiraFila"
  | "painelSenha"
  | "pilhaPapel";

/** Reação a batidas de carro. */
export type Reaction = "spill" | "tip" | "wobble";

export interface CityProp {
  id?: string;
  kind: CityPropKind;
  x: number;
  y: number;
  variant?: string;
  /** Texto pintado (outdoors, placas). */
  text?: string;
  react?: Reaction;
}

export type PoiKind = "marco" | "governo" | "comercio" | "servico" | "educacao" | "industria" | "terminal" | "praca" | "cachaca" | "estacionamento";

export interface Poi {
  id: string;
  name: string;
  district: DistrictId;
  x: number;
  y: number;
  kind: PoiKind;
  /** Marcos aparecem no mapa desde o começo; os outros, depois de descobertos. */
  landmark?: boolean;
  hooks?: Hooks;
}

export interface ParkingDef {
  id: string;
  name: string;
  district: DistrictId;
  rect: Rect;
  /** Vagas em fila: "h" lado a lado (carros na vertical), "v" uma sobre a outra (carros na horizontal). */
  rows: "h" | "v";
}

export interface VehicleSpawn {
  id: string;
  x: number;
  y: number;
  angle: number;
  color: string;
}

export interface CachacaStop extends Point {
  id: string;
  name: string;
  district: DistrictId;
}

export interface CityNpc extends NpcDef {
  district: DistrictId;
  hooks?: Hooks;
}

export interface DistrictContent {
  buildings: CityBuilding[];
  props: CityProp[];
  grounds: GroundDef[];
  pois: Poi[];
  parking: ParkingDef[];
  vehicles: VehicleSpawn[];
  npcs: CityNpc[];
  cachaca: CachacaStop[];
}

export interface InteriorDef {
  id: string;
  name: string;
  building: string;
  /** Sala fora do mapa da rua, onde o interior é montado. */
  room: Rect;
  /** Altura da parede do fundo, que também é sólida. */
  wallH: number;
  wall: string;
  floor: "piso-bar" | "piso-reparticao";
  /** Onde o jogador aparece ao entrar e onde fica a porta de saída. */
  entry: Point;
  exit: Point;
  props: CityProp[];
  npcs: CityNpc[];
  /** Cartazes na parede do fundo. */
  posters: { text: string; x: number; y: number; color: string; bg: string }[];
  cachaca?: CachacaStop;
}

export type { LookId };
