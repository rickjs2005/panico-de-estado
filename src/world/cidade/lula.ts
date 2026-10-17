import { BOLAS, CAES } from "./caes";
import type { CidadeDef } from "./definicao";
import { CIVICO } from "./distritos/civico";
import { COMERCIAL } from "./distritos/comercial";
import { EDUCACIONAL } from "./distritos/educacional";
import { INDUSTRIAL } from "./distritos/industrial";
import { RESIDENCIAL } from "./distritos/residencial";
import { TERMINAL } from "./distritos/terminal";
import { CATALOG } from "./interiores";
import { MISSOES_PREDIO } from "./interiores/missoes";
import { CITY, DISTRICTS, LIMITS, ROADS } from "./layout";
import { CAMPANHA, DECISOES, ITENS, SELO_FINAL } from "./missoes/campanha";
import { falaGeral, roteiro } from "./missoes/final";
import { PLACES_LULA } from "./places";
import { AMBIENT, CHATTER } from "./vida";

/** O Brasil hipotético do Lula: a cidade de 6 distritos, a campanha da Ditadura do Carimbo e a cachaça. */
export const LULA: CidadeDef = {
  id: "lula",
  city: CITY,
  limits: LIMITS,
  roads: ROADS,
  districts: DISTRICTS,
  content: {
    residencial: RESIDENCIAL,
    civico: CIVICO,
    educacional: EDUCACIONAL,
    industrial: INDUSTRIAL,
    comercial: COMERCIAL,
    terminal: TERMINAL,
  },
  catalogo: CATALOG,
  missoesPredio: MISSOES_PREDIO,
  marcos: [{ id: "morro", name: "Morro do Letreiro", district: "residencial", x: 2400, y: 200, kind: "marco", landmark: true }],
  /** Na calçada da praça, ao lado do carro oficial. */
  spawn: { x: 2400, y: 1206 },
  ruasSemCarro: ["rua-da-feira"],
  almoco: {
    residencial: "com-padaria",
    comercial: "com-padaria",
    educacional: "edu-cantina",
    civico: "com-pastelaria",
    industrial: "ind-fabrica",
    terminal: "com-pastelaria",
  },
  bar: "com-bar-tiao",
  falasRotina: {
    "indo-ponto": { manha: ["Acordei com o áudio do dia e já estou atrasado.", "Café coletivo só até as 8. Corre!"], tarde: ["Voltando pro meu cantinho. O almoço acabou rápido.", "Cheguei a tempo da fofoca da tarde."] },
    "indo-casa": { sempre: ["Vou pra casa. Hoje o povo já trabalhou por todo mundo.", "A rua de noite é de todos, mas a cama é minha."] },
    "indo-almoco": { sempre: ["Hora do almoço! O prato é coletivo, mas a fome é minha.", "Vou ali comer. Volto antes do próximo áudio."] },
    "indo-bar": { sempre: ["Hoje é dia de bar do Tião. Fiado é política pública.", "Só um gole. Ou três decretos."] },
    dentro: { sempre: ["Estou em casa, mas a casa é de todos."] },
    ponto: { noite: ["Já está escurecendo. Daqui a pouco eu vou pra casa.", "A noite chegou e a fofoca também."] },
  },
  ambient: AMBIENT,
  chatter: CHATTER,
  caes: CAES,
  bolas: BOLAS,
  places: PLACES_LULA,
  chaveSave: "panico-de-estado:cidade-lula:v1",
  campanha: CAMPANHA,
  itens: ITENS,
  decisoes: DECISOES,
  seloFinal: SELO_FINAL,
  final: { roteiro, falaGeral, rever: { x: 2400, y: 1000, label: "Rever a cerimônia no palanque" } },
  energia: true,
};
