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
  /** Id do interior (padrão: o próprio id do prédio; o bar e a repartição mantêm ids antigos). */
  interior?: string;
  /** Nome curto usado na ação de entrar ("Entrar no mercadinho") e no mapa. */
  label?: { name: string; article: "o" | "a" | "os" | "as" };
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
  | "pilhaPapel"
  // interiores
  | "sofa"
  | "poltrona"
  | "tv"
  | "radio"
  | "geladeira"
  | "fogao"
  | "pia"
  | "mesa"
  | "cadeira"
  | "cama"
  | "rede"
  | "armario"
  | "estante"
  | "planta"
  | "tapete"
  | "quadro"
  | "janela"
  | "relogio"
  | "mesaEscritorio"
  | "arquivo"
  | "mesaReuniao"
  | "bebedouro"
  | "bancoIgreja"
  | "altar"
  | "pulpito"
  | "sino"
  | "orgao"
  | "carteira"
  | "lousa"
  | "gondola"
  | "caixaRegistradora"
  | "freezer"
  | "vitrinePao"
  | "forno"
  | "maquina"
  | "empilhadeira"
  | "caixaPapelao"
  | "painelFerramentas"
  | "elevadorCarro"
  | "caixaEletronico"
  | "cofre"
  | "painelLoteria"
  | "rotativa"
  | "mesaPingPong"
  | "colchao"
  | "beliche"
  | "maquinaLavar"
  | "elevador"
  | "caixasCorreio"
  | "filtro"
  | "ventilador"
  | "raioX"
  | "painelControle"
  | "portaPaletes"
  | "mesaTelefones"
  | "telao"
  | "violao"
  | "fritadeira"
  | "compressor"
  | "carroOficina"
  | "lojinha"
  | "escadaRolante"
  | "vaso"
  | "quadroAvisos"
  | "vitral"
  | "castical"
  | "cavalete"
  | "tapeteCorredor"
  | "balizaFila"
  | "totemSenha"
  | "cafezinho"
  | "alavanca"
  | "cadeadao"
  | "ferramenta"
  | "caixaBrasil"
  | "etiquetadora"
  // Brasil do Flávio
  | "catraca"
  | "palanque"
  | "pinguim"
  | "pombo"
  | "urna"
  | "calendario"
  | "motoEstatua"
  | "placaAluga"
  // rua: personalidade dos bairros
  | "canteiro"
  | "horta"
  | "cachorro"
  | "bicicleta"
  | "bandeirolas"
  | "carrinhoPipoca"
  | "bicicletario"
  | "muroBaixo";

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
  /** Moto (Brasil do Flávio): mais leve, mais rápida e chama a motociata. Padrão: carro. */
  tipo?: "carro" | "moto";
}

export interface CachacaStop extends Point {
  id: string;
  name: string;
  district: DistrictId;
}

/** Comportamento de morador genérico, reaproveitado em toda a cidade. */
export type AmbientBehavior = "passeio" | "travessia" | "conversa" | "fila" | "parado";

export interface CityNpc extends NpcDef {
  district: DistrictId;
  hooks?: Hooks;
  behavior?: AmbientBehavior;
  /** Moradores do mesmo grupo conversam entre si. */
  group?: string;
  /** Morador de interior que só aparece quando um lugar está num estado. */
  when?: PlaceCondition;
}

/** Detalhes pintados no chão: tapetes na frente das portas, degraus, setas de fila. Não colidem. */
export type DecalKind = "tapete" | "degraus" | "setas";

export interface DecalDef {
  kind: DecalKind;
  rect: Rect;
  /** Cor principal (padrão por tipo). */
  color?: string;
}

export interface DistrictContent {
  buildings: CityBuilding[];
  /** Detalhes de chão do distrito. */
  decals?: DecalDef[];
  props: CityProp[];
  grounds: GroundDef[];
  pois: Poi[];
  parking: ParkingDef[];
  vehicles: VehicleSpawn[];
  npcs: CityNpc[];
  cachaca: CachacaStop[];
}

/** Piso de um cômodo. O desenho é neutro e ganha a cor (`tint`) de cada interior. */
export type FloorKind = "taco" | "ceramica" | "ladrilho" | "piso-bar" | "piso-reparticao" | "concreto" | "carpete" | "marmore" | "azulejo";

export interface InteriorRoom {
  id: string;
  name: string;
  rect: Rect;
  floor: FloorKind;
  tint: string;
}

/** Parede interna (sólida). `face` é a altura visível da parede na vista 3/4. */
export interface InteriorWall extends Rect {
  id: string;
  face: number;
  color: string;
}

/** Interações ambientais: comportamentos reaproveitados entre interiores. */
export type SpotKind =
  | "sentar"
  | "deitar"
  | "tv"
  | "radio"
  | "geladeira"
  | "armario"
  | "caixa"
  | "campainha"
  | "maquina"
  | "carimbo"
  | "senha"
  | "sino"
  | "instrumento"
  | "examinar"
  | "beber"
  | "luz"
  | "telefone"
  | "registradora"
  | "torneira"
  | "fogao"
  | "livro"
  | "computador"
  | "ventilador"
  | "jukebox"
  | "decreto"
  /** Interação de missão: só faz o barulhinho; o resto vem das regras da campanha. */
  | "missao";

/** Estado de um lugar (`places.ts`) exigido para um item de interior aparecer. */
export interface PlaceCondition {
  place: string;
  state: string;
}

export interface InteractionSpot {
  id: string;
  kind: SpotKind;
  /** Onde o jogador fica para usar. */
  x: number;
  y: number;
  /** Texto do botão de ação, por exemplo "Sentar no sofá". */
  label: string;
  /** Objeto que reage (id de um objeto deste interior). */
  prop?: string;
  /** Frases curtas que podem aparecer. */
  lines?: string[];
  /** Posição do personagem sentado ou deitado. */
  seat?: Point & { facing: "front" | "back" | "side"; flip?: boolean };
  /** Só existe quando o lugar está neste estado. */
  when?: PlaceCondition;
  /** Usar esta interação muda o estado de um lugar (com consequência visual e persistente). */
  setPlace?: PlaceCondition;
  /** Selo que aparece com impacto ao usar uma interação que muda um lugar. */
  stamp?: { text: string; color: string; bg: string };
  /** Usar esta interação emite o evento "usou:<evento>" para a campanha de missões. */
  evento?: string;
}

export interface InteriorPoster {
  text: string;
  x: number;
  y: number;
  color: string;
  bg: string;
  when?: PlaceCondition;
}

export type TemplateId =
  | "casa"
  | "republica"
  | "conjunto"
  | "associacao"
  | "prefeitura"
  | "ministerio"
  | "reparticao"
  | "secretaria"
  | "imprensa"
  | "banco"
  | "igreja"
  | "capela"
  | "mercado"
  | "padaria"
  | "bar"
  | "farmacia"
  | "lanchonete"
  | "cantina"
  | "loterica"
  | "shopping"
  | "oficina"
  | "borracharia"
  | "escola"
  | "universidade"
  | "biblioteca"
  | "fabrica"
  | "galpao"
  | "armazem"
  | "almoxarifado"
  | "deposito-kits"
  | "alfandega"
  | "despacho"
  // Brasil do Flávio
  | "posto"
  | "leilao"
  | "tribunal";

/** Objeto de interior que só aparece num estado do lugar (por exemplo, depósito abastecido). */
export interface InteriorProp extends CityProp {
  id: string;
  when?: PlaceCondition;
}

export interface InteriorDef {
  id: string;
  /** Nome mostrado no HUD e no mapa. */
  name: string;
  building: string;
  template: TemplateId;
  /** Área total do interior, montada na faixa abaixo da cidade quando o jogador entra. */
  room: Rect;
  /** Altura da parede do fundo (sólida). */
  wallH: number;
  wall: string;
  rooms: InteriorRoom[];
  walls: InteriorWall[];
  /** Onde o jogador aparece ao entrar e onde fica a porta de saída. */
  entry: Point;
  exit: Point;
  props: InteriorProp[];
  npcs: CityNpc[];
  posters: InteriorPoster[];
  spots: InteractionSpot[];
  cachaca?: CachacaStop;
  hooks?: Hooks;
}

export type { LookId };
