import type { EntradaCatalogo } from "../definicao";

/**
 * Catálogo de interiores do Brasil do Flávio: cada prédio aponta para um modelo de planta e tem
 * nome próprio. As falas dos modelos passam pela tradução de `textos.ts`.
 */

const casa = (name: string): EntradaCatalogo => ({ template: "casa", name, label: { name: "casa", article: "a" } });

export const CATALOGO_FLAVIO: Record<string, EntradaCatalogo> = {
  // Condomínio Pátria Amada
  "fl-res-casa-01": casa("Casa da Dona Neide"),
  "fl-res-casa-02": casa("Casa do Seu Waldemar"),
  "fl-res-casa-03": casa("Casa da Dona Celeste"),
  "fl-res-casa-04": casa("Casa do Síndico Moacir"),
  "fl-res-casa-05": casa("Casa da Dona Odete"),
  "fl-res-casa-06": casa("Casa do Seu Gervásio"),
  "fl-res-casa-07": casa("Casa da Dona Lucinha"),
  "fl-res-casa-08": casa("Casa do Seu Altamiro"),
  "fl-res-edificio": { template: "conjunto", name: "Edifício Patriota", label: { name: "Edifício Patriota", article: "o" }, wall: "#e8e1c6" },
  "fl-res-motoclube": { template: "oficina", name: "Motoclube Pátria Sobre Rodas", label: { name: "motoclube", article: "o" }, wall: "#d6dbe4" },
  "fl-res-guarita": { template: "associacao", name: "Administração do Condomínio", label: { name: "Administração", article: "a" }, wall: "#e9e2cf" },
  // Colégio Cívico-Militar
  "fl-edu-colegio": { template: "escola", name: "Colégio Cívico-Militar", label: { name: "colégio", article: "o" }, wall: "#e6efe2" },
  "fl-edu-cantina": { template: "cantina", name: "Cantina do Rancho", label: { name: "cantina", article: "a" }, wall: "#f6e3a0" },
  "fl-edu-casa-sargento": casa("Casa do Sargento Ademar"),
  "fl-edu-biblioteca": { template: "biblioteca", name: "Biblioteca dos Livros Aprovados", label: { name: "biblioteca", article: "a" }, wall: "#dfe8f0" },
  "fl-edu-faculdade": { template: "universidade", name: "Faculdade de Ordem Unida", label: { name: "faculdade", article: "a" }, wall: "#eef2e6" },
  "fl-edu-casa-01": casa("Casa da Dona Iolanda"),
  "fl-edu-casa-02": casa("Casa do Seu Brás"),
  "fl-edu-republica": { template: "republica", name: "República dos Cadetes", label: { name: "república", article: "a" }, wall: "#e4ecf6" },
  // Esplanada da Ordem
  "fl-civ-ministerio": { template: "ministerio", name: "Ministério da Ordem Comunicacional", label: { name: "Ministério", article: "o" }, wall: "#eef0e6" },
  "fl-civ-cartorio": { template: "reparticao", name: "Cartório das Autorizações", label: { name: "cartório", article: "o" }, wall: "#dfe6d2" },
  "fl-civ-palacio": { template: "prefeitura", name: "Palácio da Ordem", label: { name: "Palácio", article: "o" }, wall: "#fbf6e6" },
  "fl-civ-tribunal": { template: "tribunal", name: "Tribunal Eleitoral do Cofre", label: { name: "Tribunal", article: "o" }, wall: "#ecebe4" },
  "fl-civ-gabinete": { template: "imprensa", name: "Gabinete do Desmentido", label: { name: "Gabinete", article: "o" }, wall: "#f2e6c4" },
  "fl-civ-secretaria": { template: "secretaria", name: "Secretaria de Privatização", label: { name: "Secretaria", article: "a" }, wall: "#e2ead8" },
  "fl-civ-casa-01": casa("Casa do Seu Evaristo"),
  "fl-civ-casa-02": casa("Casa da Dona Marlene"),
  // Livre Mercado
  "fl-com-posto": { template: "posto", name: "Posto de Saúde Premium", label: { name: "posto", article: "o" }, wall: "#e4f4ee" },
  "fl-com-farmacia": { template: "farmacia", name: "Farmácia Popular · Demonstração", label: { name: "farmácia", article: "a" }, wall: "#dff3ea" },
  "fl-com-banco": { template: "banco", name: "Banco do Livre Mercado", label: { name: "banco", article: "o" }, wall: "#d8efe0" },
  "fl-com-shopping": { template: "shopping", name: "Shopping Livre Mercado", label: { name: "shopping", article: "o" }, wall: "#ece4d0" },
  "fl-com-loterica": { template: "loterica", name: "Lotérica do Benefício", label: { name: "lotérica", article: "a" }, wall: "#fff1a8" },
  "fl-com-padaria": { template: "padaria", name: "Padaria Premium", label: { name: "padaria", article: "a" }, wall: "#f8e3b6" },
  "fl-com-mercado": { template: "mercado", name: "Supermercado Livre Concorrência", label: { name: "supermercado", article: "o" }, wall: "#ffe7cf" },
  "fl-com-bar": { template: "bar", name: "Choperia Livre Iniciativa", label: { name: "choperia", article: "a" }, wall: "#f4d35e" },
  "fl-com-lanchonete": { template: "lanchonete", name: "Pastel com Taxa de Serviço", label: { name: "pastelaria", article: "a" }, wall: "#ffd6a5" },
  "fl-com-casa-01": casa("Casa do Seu Nestor"),
  "fl-com-casa-02": casa("Casa da Dona Ivete"),
  "fl-com-casa-03": casa("Casa do Seu Romeu"),
  // Distrito do Chicote
  "fl-ind-fabrica": { template: "fabrica", name: "Fábrica Feliz", label: { name: "fábrica", article: "a" }, wall: "#e2c7a8" },
  "fl-ind-galpao-metas": { template: "galpao", name: "Galpão das Metas", label: { name: "Galpão das Metas", article: "o" }, wall: "#cdd2c8" },
  "fl-ind-selaria": { template: "oficina", name: "Selaria do Zeca", label: { name: "selaria", article: "a" }, wall: "#e8c9a0" },
  "fl-ind-rh": { template: "reparticao", name: "Recursos Humanos", label: { name: "RH", article: "o" }, wall: "#e6e0d2" },
  "fl-ind-almoxarifado": { template: "almoxarifado", name: "Almoxarifado da Produtividade", label: { name: "almoxarifado", article: "o" }, wall: "#d8ccb4" },
  "fl-ind-galpao-1": { template: "galpao", name: "Galpão Terceirizado 1", label: { name: "Galpão 1", article: "o" }, wall: "#c9cdd2" },
  "fl-ind-galpao-2": { template: "galpao", name: "Galpão Terceirizado 2", label: { name: "Galpão 2", article: "o" }, wall: "#d5c9b0" },
  "fl-ind-oficina": { template: "oficina", name: "Oficina do Pé na Tábua", label: { name: "oficina", article: "a" }, wall: "#cfe3ee" },
  "fl-ind-borracharia": { template: "borracharia", name: "Borracharia Sem Folga", label: { name: "borracharia", article: "a" }, wall: "#d6e3ea" },
  // Porto Brasil–EUA
  "fl-ter-leilao": { template: "leilao", name: "Casa de Leilões da Pátria", label: { name: "Casa de Leilões", article: "a" }, wall: "#e8eef8" },
  "fl-ter-alfandega": { template: "alfandega", name: "Alfândega do Made In", label: { name: "Alfândega", article: "a" }, wall: "#f6e3a0" },
  "fl-ter-imobiliaria": { template: "secretaria", name: "Imobiliária Floresta Inteira", label: { name: "imobiliária", article: "a" }, wall: "#e2f0d8" },
  "fl-ter-despacho": { template: "despacho", name: "Controle de Embarque", label: { name: "Controle de Embarque", article: "o" }, wall: "#ebe6dc" },
  "fl-ter-armazem-1": { template: "armazem", name: "Armazém Brasil→EUA 1", label: { name: "Armazém 1", article: "o" }, wall: "#b9cde6" },
  "fl-ter-armazem-2": { template: "armazem", name: "Armazém Brasil→EUA 2", label: { name: "Armazém 2", article: "o" }, wall: "#c9d6e8" },
};
