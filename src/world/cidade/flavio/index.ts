import type { CidadeDef } from "../definicao";
import { CATALOGO_FLAVIO } from "./catalogo";
import { BOLAS_FLAVIO, CAES_FLAVIO } from "./caes";
import { CAMPANHA_FLAVIO, DECISOES_FLAVIO, ITENS_FLAVIO, PALANQUE_FLAVIO, SELO_FINAL_FLAVIO } from "./campanha";
import { CHICOTE } from "./distritos/chicote";
import { COLEGIO } from "./distritos/colegio";
import { CONDOMINIO } from "./distritos/condominio";
import { ESPLANADA } from "./distritos/esplanada";
import { MERCADO } from "./distritos/mercado";
import { PORTO } from "./distritos/porto";
import { falaGeralFlavio, roteiroFlavio } from "./final";
import { MISSOES_PREDIO_FLAVIO } from "./interiores";
import { CITY_FLAVIO, DISTRITOS_FLAVIO, LIMITES_FLAVIO, RUAS_FLAVIO } from "./layout";
import { PLACES_FLAVIO } from "./places";
import { textoFlavio } from "./textos";
import { AMBIENT_FLAVIO, CONVERSAS_FLAVIO, FALAS_ROTINA_FLAVIO } from "./vida";

/**
 * O Brasil hipotético do Flávio: cidade própria (outro traçado, outros distritos), interiores com as
 * plantas da cidade do Lula e falas deste universo, motociata no lugar da cachaça e a campanha da
 * Eleição no Cofre. Tudo é ficção satírica.
 */
export const FLAVIO: CidadeDef = {
  id: "flavio",
  city: CITY_FLAVIO,
  limits: LIMITES_FLAVIO,
  roads: RUAS_FLAVIO,
  districts: DISTRITOS_FLAVIO,
  content: {
    residencial: CONDOMINIO,
    civico: ESPLANADA,
    educacional: COLEGIO,
    industrial: CHICOTE,
    comercial: MERCADO,
    terminal: PORTO,
  },
  catalogo: CATALOGO_FLAVIO,
  missoesPredio: MISSOES_PREDIO_FLAVIO,
  texto: textoFlavio,
  marcos: [{ id: "fl-serra", name: "Serra do Letreiro", district: "residencial", x: 2400, y: 200, kind: "marco", landmark: true }],
  /** Na praça do desfile, na frente do Palácio, ao lado do carro oficial. */
  spawn: { x: 1660, y: 1715 },
  ruasSemCarro: ["fl-rua-do-pedagio"],
  almoco: {
    residencial: "fl-edu-cantina",
    educacional: "fl-edu-cantina",
    civico: "fl-com-lanchonete",
    comercial: "fl-com-padaria",
    industrial: "fl-ind-fabrica",
    terminal: "fl-com-lanchonete",
  },
  bar: "fl-com-bar",
  falasRotina: FALAS_ROTINA_FLAVIO,
  ambient: AMBIENT_FLAVIO,
  chatter: CONVERSAS_FLAVIO,
  caes: CAES_FLAVIO,
  bolas: BOLAS_FLAVIO,
  places: PLACES_FLAVIO,
  chaveSave: "panico-de-estado:cidade-flavio:v1",
  campanha: CAMPANHA_FLAVIO,
  itens: ITENS_FLAVIO,
  decisoes: DECISOES_FLAVIO,
  seloFinal: SELO_FINAL_FLAVIO,
  final: { roteiro: roteiroFlavio, falaGeral: falaGeralFlavio, rever: { ...PALANQUE_FLAVIO, label: "Rever a cerimônia no palanque" } },
  energia: false,
};
