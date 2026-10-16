import type { CityBuilding, InteriorDef, TemplateId } from "../types";
import { PAREDES } from "./kits";
import { MISSOES_PREDIO } from "./missoes";
import { MODELS } from "./modelos";
import { Plan, rng } from "./plan";

/**
 * Catálogo: cada prédio da cidade aponta para um modelo de interior e tem nome próprio.
 * Os ids dos interiores são estáveis: `bar` e `reparticao` mantêm os ids antigos;
 * os outros usam `int-<id do prédio>`.
 */

interface Entry {
  template: TemplateId;
  name: string;
  label: { name: string; article: "o" | "a" | "os" | "as" };
  id?: string;
  wall?: string;
}

const casa = (name: string): Entry => ({ template: "casa", name, label: { name: "casa", article: "a" } });

export const CATALOG: Record<string, Entry> = {
  // Vila do Mutirão
  "res-casa-01": casa("Casa da Dona Lurdes"),
  "res-casa-02": casa("Casa do Seu Dirceu"),
  "res-casa-03": casa("Casa da Dona Penha"),
  "res-casa-04": casa("Casa do Seu Jurandir"),
  "res-casa-05": casa("Casa da Dona Socorro"),
  "res-casa-06": casa("Casa do Seu Valdomiro"),
  "res-casa-07": casa("Casa da Dona Graça"),
  "res-casa-08": casa("Casa do Seu Arnaldo"),
  "res-conjunto-13": { template: "conjunto", name: "Conjunto Habitacional Nº 13", label: { name: "Conjunto Nº 13", article: "o" } },
  "res-conjunto-07": { template: "conjunto", name: "Conjunto Nº 7", label: { name: "Conjunto Nº 7", article: "o" } },
  "res-associacao": { template: "associacao", name: "Associação do Povo", label: { name: "Associação do Povo", article: "a" } },
  // Centro Cívico
  "civ-secretaria": { template: "secretaria", name: "Secretaria da Coletivização", label: { name: "Secretaria", article: "a" }, wall: "#efe1c4" },
  "civ-prefeitura": { template: "prefeitura", name: "Prefeitura Popular", label: { name: "Prefeitura", article: "a" }, wall: "#f6ead2" },
  "civ-imprensa": { template: "imprensa", name: "Imprensa Oficial do Boato", label: { name: "Imprensa Oficial", article: "a" }, wall: "#f6dca6" },
  "civ-igreja-matriz": { template: "igreja", name: "Igreja Matriz", label: { name: "Igreja Matriz", article: "a" }, wall: "#f7efe0" },
  "civ-ministerio": { template: "ministerio", name: "Ministério do Boato", label: { name: "Ministério do Boato", article: "o" }, wall: "#ece6da" },
  "civ-reparticao": { template: "reparticao", id: "reparticao", name: "Repartição de Carimbos", label: { name: "Repartição", article: "a" }, wall: "#cfd8c8" },
  "civ-banco": { template: "banco", name: "Banco Estatal do Povo", label: { name: "banco", article: "o" }, wall: "#d8efe6" },
  "civ-assembleia": { template: "capela", name: "Assembleia da Fé", label: { name: "Assembleia da Fé", article: "a" }, wall: "#e8e4f2" },
  // Largo da Feira
  "com-mercadinho": { template: "mercado", name: "Mercadinho Ki-Preço", label: { name: "mercadinho", article: "o" }, wall: "#ffe0d2" },
  "com-padaria": { template: "padaria", name: "Padaria do Povo", label: { name: "padaria", article: "a" }, wall: "#f8e3b6" },
  "com-bar-tiao": { template: "bar", id: "bar", name: "Bar do Tião", label: { name: "Bar do Tião", article: "o" }, wall: "#e9b949" },
  "com-farmacia": { template: "farmacia", name: "Farmácia", label: { name: "farmácia", article: "a" }, wall: "#dff3ea" },
  "com-oficina": { template: "oficina", name: "Oficina do Zé", label: { name: "oficina", article: "a" }, wall: "#cfe3ee" },
  "com-borracharia": { template: "borracharia", name: "Borracharia 24h", label: { name: "borracharia", article: "a" }, wall: "#d6e3ea" },
  "com-shopping": { template: "shopping", name: "Shopping Popular", label: { name: "shopping", article: "o" }, wall: "#ece0f4" },
  "com-loterica": { template: "loterica", name: "Lotérica", label: { name: "lotérica", article: "a" }, wall: "#fff1a8" },
  "com-pastelaria": { template: "lanchonete", name: "Pastel do Povo", label: { name: "pastelaria", article: "a" }, wall: "#ffe3c4" },
  "com-casa-01": casa("Casa da Dona Fátima"),
  "com-casa-02": casa("Casa do Seu Bené"),
  "com-casa-03": casa("Casa da Dona Zuleide"),
  // Cidade Universitária
  "edu-universidade": { template: "universidade", name: "Universidade do Pânico", label: { name: "universidade", article: "a" }, wall: "#eef4f2" },
  "edu-biblioteca": { template: "biblioteca", name: "Biblioteca Livre", label: { name: "biblioteca", article: "a" }, wall: "#d7e7e3" },
  "edu-escola": { template: "escola", name: "Escola Estadual do Boato", label: { name: "escola", article: "a" }, wall: "#e9f1f8" },
  "edu-deposito": { template: "deposito-kits", name: "Depósito de Kits", label: { name: "Depósito de Kits", article: "o" }, wall: "#e2d9f6" },
  "edu-republica": { template: "republica", name: "República Liberou Geral", label: { name: "república", article: "a" }, wall: "#ffd9e6" },
  "edu-cantina": { template: "cantina", name: "Cantina do DCE", label: { name: "cantina", article: "a" }, wall: "#fff0a8" },
  // Polo Industrial
  "ind-fabrica": { template: "fabrica", name: "Fábrica Estatal Nº 1", label: { name: "fábrica", article: "a" }, wall: "#d9b3a6" },
  "ind-galpao-1": { template: "galpao", name: "Galpão Coletivo 1", label: { name: "Galpão 1", article: "o" }, wall: "#c9cdd2" },
  "ind-galpao-2": { template: "galpao", name: "Galpão Coletivo 2", label: { name: "Galpão 2", article: "o" }, wall: "#d8ccb4" },
  "ind-deposito": { template: "galpao", name: "Depósito Central do Povo", label: { name: "Depósito Central", article: "o" }, wall: "#cde3ee" },
  "ind-almoxarifado": { template: "almoxarifado", name: "Almoxarifado do Boato", label: { name: "almoxarifado", article: "o" }, wall: "#ecd5a8" },
  // Terminal Brasil–China
  "ter-alfandega": { template: "alfandega", name: "Alfândega do Impossível", label: { name: "Alfândega", article: "a" }, wall: "#f6e3a0" },
  "ter-armazem-1": { template: "armazem", name: "Armazém Brasil→China 1", label: { name: "Armazém 1", article: "o" }, wall: "#e6b3ad" },
  "ter-armazem-2": { template: "armazem", name: "Armazém Brasil→China 2", label: { name: "Armazém 2", article: "o" }, wall: "#ecc3a4" },
  "ter-despacho": { template: "despacho", name: "Controle de Despacho", label: { name: "Controle de Despacho", article: "o" }, wall: "#ebe6dc" },
};

export function interiorId(b: CityBuilding): string {
  return CATALOG[b.id]?.id ?? `int-${b.id}`;
}

/** Texto da ação de entrar: "Entrar na casa", "Entrar no mercadinho". */
export function entryLabel(b: CityBuilding): string {
  const l = CATALOG[b.id]?.label ?? { name: "prédio", article: "o" as const };
  const prep = { o: "no", a: "na", os: "nos", as: "nas" }[l.article];
  return `Entrar ${prep} ${l.name}`;
}

/** Monta o interior de um prédio a partir do catálogo e do modelo. */
export function interiorFor(b: CityBuilding): InteriorDef {
  const entry = CATALOG[b.id];
  if (!entry) throw new Error(`prédio sem interior no catálogo: ${b.id}`);
  const model = MODELS[entry.template];
  const r = rng(b.id);
  const size = model.size(b.w, r);
  const flip = !!model.flip && r.chance(0.5);
  const plan = new Plan(b, { id: interiorId(b), name: entry.name, template: entry.template, w: size.w, h: size.h, wallH: size.wallH, wall: entry.wall ?? r.pick(PAREDES) }, r, flip);
  model.build(plan);
  MISSOES_PREDIO[b.id]?.(plan);
  return plan.def;
}
