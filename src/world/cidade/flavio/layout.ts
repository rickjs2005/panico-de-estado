import type { Rect } from "../../types";
import type { DistrictDef, RoadDef } from "../types";

/**
 * Geometria do Brasil hipotético do Flávio: o mesmo tamanho da cidade do Lula, outro traçado.
 *
 * Desenho: anel de ruas na borda; a Avenida Ordem e Progresso corta a cidade de norte a sul e as
 * Avenidas da Pátria e do Livre Mercado a atravessam de oeste a leste. São duas colunas e três
 * faixas de distritos, cada um com ruas locais próprias. Serra ao norte, rio a oeste, mar ao sul
 * (com o navio para os EUA) e a mata a leste.
 *
 * Todos os ids desta cidade começam com `fl-`: texturas, saves e mapas nunca se confundem com os
 * da cidade do Lula.
 */

export const CITY_FLAVIO = { w: 4800, h: 3600 };

/** Limites: serra ao norte, rio a oeste, mar ao sul e a mata a leste. */
export const LIMITES_FLAVIO = {
  serra: { x: 0, y: 0, w: CITY_FLAVIO.w, h: 150 },
  rio: { x: 0, y: 0, w: 170, h: CITY_FLAVIO.h },
  mar: { x: 0, y: 3470, w: CITY_FLAVIO.w, h: CITY_FLAVIO.h - 3470 },
  mata: { x: 4610, y: 0, w: CITY_FLAVIO.w - 4610, h: CITY_FLAVIO.h },
} satisfies Record<string, Rect>;

export const RUAS_FLAVIO: RoadDef[] = [
  // anel
  { id: "fl-rua-da-serra", name: "Rua da Serra", kind: "rua", rect: { x: 170, y: 160, w: 4440, h: 110 } },
  { id: "fl-rua-do-rio", name: "Rua do Rio", kind: "rua", rect: { x: 180, y: 160, w: 110, h: 3300 } },
  { id: "fl-rua-da-mata", name: "Rua da Mata", kind: "rua", rect: { x: 4490, y: 160, w: 110, h: 3190 } },
  { id: "fl-rua-da-orla", name: "Rua da Orla", kind: "rua", rect: { x: 180, y: 3340, w: 2310, h: 120 } },
  // avenidas
  { id: "fl-av-ordem-progresso", name: "Avenida Ordem e Progresso", kind: "avenida", rect: { x: 2310, y: 160, w: 180, h: 3300 } },
  { id: "fl-av-patria", name: "Avenida da Pátria", kind: "avenida", rect: { x: 180, y: 1180, w: 4420, h: 180 } },
  { id: "fl-av-livre-mercado", name: "Avenida do Livre Mercado", kind: "avenida", rect: { x: 180, y: 2400, w: 4420, h: 180 } },
  // Condomínio Pátria Amada
  { id: "fl-alameda-patriotas", name: "Alameda dos Patriotas", kind: "rua", rect: { x: 290, y: 700, w: 2020, h: 110 } },
  { id: "fl-rua-da-guarita", name: "Rua da Guarita", kind: "rua", rect: { x: 960, y: 270, w: 110, h: 910 } },
  { id: "fl-rua-da-cancela", name: "Rua da Cancela", kind: "rua", rect: { x: 1640, y: 270, w: 110, h: 910 } },
  // Colégio Cívico-Militar
  { id: "fl-rua-da-continencia", name: "Rua da Continência", kind: "rua", rect: { x: 3400, y: 270, w: 110, h: 910 } },
  { id: "fl-rua-do-hino", name: "Rua do Hino", kind: "rua", rect: { x: 3510, y: 660, w: 980, h: 110 } },
  // Esplanada da Ordem
  { id: "fl-rua-do-palanque", name: "Rua do Palanque", kind: "rua", rect: { x: 1100, y: 1360, w: 110, h: 600 } },
  { id: "fl-rua-do-desfile", name: "Rua do Desfile", kind: "rua", rect: { x: 290, y: 1960, w: 2020, h: 110 } },
  // Livre Mercado
  { id: "fl-rua-do-pedagio", name: "Rua do Pedágio", kind: "rua", rect: { x: 2490, y: 1840, w: 2000, h: 110 } },
  { id: "fl-rua-da-catraca", name: "Rua da Catraca", kind: "rua", rect: { x: 3500, y: 1360, w: 110, h: 1040 } },
  // Distrito do Chicote
  { id: "fl-rua-da-meta", name: "Rua da Meta 300%", kind: "rua", rect: { x: 290, y: 2950, w: 2020, h: 110 } },
  { id: "fl-rua-do-ponto", name: "Rua do Ponto Batido", kind: "rua", rect: { x: 1250, y: 2580, w: 110, h: 760 } },
  // Porto Brasil–EUA
  { id: "fl-rua-do-leilao", name: "Rua do Leilão", kind: "rua", rect: { x: 3600, y: 2580, w: 110, h: 410 } },
  { id: "fl-via-do-cais", name: "Via do Cais", kind: "rua", rect: { x: 2490, y: 2990, w: 2000, h: 110 } },
];

export const DISTRITOS_FLAVIO: DistrictDef[] = [
  { id: "residencial", name: "Condomínio Pátria Amada", tagline: "Residencial · cancela, guarita e catraca até na pracinha", area: { x: 290, y: 270, w: 2020, h: 910 }, color: "#2f9e5a" },
  { id: "educacional", name: "Colégio Cívico-Militar", tagline: "Educacional · ordem unida antes do recreio", area: { x: 2490, y: 270, w: 2000, h: 910 }, color: "#3a7a4a" },
  { id: "civico", name: "Esplanada da Ordem", tagline: "Palácio, ministérios e um cartório de autorizações", area: { x: 290, y: 1360, w: 2020, h: 1040 }, color: "#1f6f43" },
  { id: "comercial", name: "Livre Mercado", tagline: "Comércio · tudo à venda, até a fila do posto", area: { x: 2490, y: 1360, w: 2000, h: 1040 }, color: "#e0a91f" },
  { id: "industrial", name: "Distrito do Chicote", tagline: "Fábricas · meta de 300% e dezembro em análise", area: { x: 290, y: 2580, w: 2020, h: 760 }, color: "#8a6a3a" },
  { id: "terminal", name: "Porto Brasil–EUA", tagline: "Exportação · o país em leilão, frete pago", area: { x: 2490, y: 2580, w: 2000, h: 890 }, color: "#2f6fd6" },
];
