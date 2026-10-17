import type { HeroId, Point, Rect } from "../types";
import type { BolaDef, CaoDef } from "./caes";
import type { Plan } from "./interiores/plan";
import type { Passo } from "./missoes/final";
import type { Campanha, SeloDef, Valor } from "./missoes/motor";
import type { PlaceDef } from "./places";
import type { CityNpc, DistrictContent, DistrictDef, DistrictId, Poi, RoadDef, TemplateId } from "./types";

/**
 * Uma cidade do jogo: o Brasil hipotético de um protagonista. O motor (cena, mapa, rotinas,
 * trânsito, interiores, campanha) é o mesmo para as duas; cada cidade entrega aqui os seus dados.
 * A cidade ativa fica em `index.ts` e é trocada por `ativa.ts` antes de a cena abrir.
 */

/** Cada prédio aponta para um modelo de interior e tem nome próprio. */
export interface EntradaCatalogo {
  template: TemplateId;
  name: string;
  label: { name: string; article: "o" | "a" | "os" | "as" };
  /** Id do interior (padrão `int-<id do prédio>`). */
  id?: string;
  wall?: string;
}

/** Decisão de uma missão: de que lado ela fica na apuração final e o texto curto do diário. */
export interface Decisao {
  lado: "obediente" | "rebelde" | "meio";
  texto: string;
}

/** O que um morador da rua está fazendo agora (rotina diária). */
export type Atividade = "ponto" | "indo-ponto" | "indo-casa" | "indo-almoco" | "indo-bar" | "dentro";

/** Falas de rotina: de manhã, à tarde, à noite (só no ponto) ou a qualquer hora. */
export type FalasRotina = Record<Atividade, { manha?: string[]; tarde?: string[]; noite?: string[]; sempre?: string[] }>;

/** Roteiro puro da cerimônia final. */
export interface FinalDef {
  roteiro: (flags: Record<string, Valor>) => { tom: string; passos: Passo[] };
  /** Fala de morador depois da cerimônia (null se ainda não houve). */
  falaGeral: (flags: Record<string, Valor>, indice: number) => string | null;
  /** Onde fica o ponto de rever a cerimônia, depois de concluída (ao lado do palanque). */
  rever: { x: number; y: number; label: string };
}

export interface CidadeDef {
  id: HeroId;
  city: { w: number; h: number };
  /** Bordas sólidas do mapa (água, morro, mata, muro). A arte de cada borda fica na cena. */
  limits: Record<string, Rect>;
  roads: RoadDef[];
  districts: DistrictDef[];
  content: Record<DistrictId, DistrictContent>;
  catalogo: Record<string, EntradaCatalogo>;
  /** Interações, objetos e cartazes das missões dentro de prédios específicos. */
  missoesPredio: Record<string, (p: Plan) => void>;
  /**
   * Tradução dos textos dos modelos de interior. As plantas (cômodos, móveis, interações) são as mesmas
   * nas duas cidades; as falas, cartazes e rótulos mudam de universo.
   */
  texto?: (s: string) => string;
  /** Marcos naturais que entram no mapa desde o começo. */
  marcos: Poi[];
  spawn: Point;
  /** Ruas em que o trânsito da cidade não entra (feira na pista, por exemplo). */
  ruasSemCarro: string[];
  /** Onde cada distrito almoça e o bar da noite (rotinas dos moradores). */
  almoco: Record<DistrictId, string>;
  bar: string;
  falasRotina: FalasRotina;
  ambient: CityNpc[];
  chatter: Record<DistrictId, string[]>;
  caes: CaoDef[];
  bolas: BolaDef[];
  places: Record<string, PlaceDef>;
  /** Chave do progresso desta cidade no navegador. */
  chaveSave: string;
  campanha: Campanha;
  itens: Record<string, string>;
  decisoes: Record<string, Record<string, Decisao>>;
  seloFinal: SeloDef;
  final: FinalDef;
  /** Energia de corrida: a cachaça do Lula. Sem energia, a corrida é livre. */
  energia: boolean;
}
