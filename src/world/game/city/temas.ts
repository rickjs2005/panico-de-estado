import type { HeroId } from "../../types";

/**
 * Textos da cena que mudam de universo: o que o feirante grita quando o carro derruba a barraca,
 * o carinho no cão, a chuva da cerimônia final e as frases do HUD no fim da campanha.
 * O motor da cena é o mesmo nas duas cidades.
 */
export interface TemaCena {
  /** Morador que pula para longe do carro. */
  desvio: string[];
  /** Feirante reclamando das frutas no chão, por fruta. */
  frutas: Record<string, string[]>;
  /** Fala ao fazer carinho num cão. */
  carinho: (nome: string) => string[];
  /** Palavras que chovem na cerimônia final. */
  chuva: string[];
  /** Nome curto da cerimônia final (toast do selo extra e HUD). */
  final: string;
  /** Objetivo do HUD depois da cerimônia. */
  depoisDoFinal: string;
  /** Nome do passaporte dos seis selos. */
  passaporte: string;
  /** Faixa do passaporte depois da cerimônia final. */
  seloFinal: string;
}

const LULA: TemaCena = {
  desvio: ["Olha o carro!", "Ê, motorista!", "Calma, presidente!", "Isso é calçada!"],
  frutas: {
    laranja: ["Minhas laranjas!", "Laranja por comitê, não por atropelo!"],
    banana: ["Minhas bananas!", "Até a banana ganhou plano quinquenal!"],
    abacaxi: ["Meu abacaxi!", "Quem vai descascar esse abacaxi?"],
  },
  carinho: (nome) => [`Bom garoto, ${nome}! Agora você é assessor especial.`, `${nome} abanou o rabo: vai me acompanhar um pouco.`, `Quem é o cachorro mais coletivo da cidade? É o ${nome}!`],
  chuva: ["CARIMBADO", "DEFERIDO", "AUTENTICADO", "FIRMA?", "VIA 2"],
  final: "Ditadura do Carimbo",
  depoisDoFinal: "Ditadura do Carimbo proclamada. A cidade é sua: veja como cada canto recebeu o decreto, ou reveja a cerimônia no palanque da praça.",
  passaporte: "Passaporte do Absurdo",
  seloFinal: "👑 Carimbo final: Ditadura do Carimbo. Dá para rever a cerimônia no palanque da praça.",
};

const FLAVIO: TemaCena = {
  desvio: ["Olha a motociata!", "Ê, motorista!", "Calma, presidente!", "Isso é calçada, não pista!"],
  frutas: {
    laranja: ["Minhas laranjas! Quem paga o pedágio delas agora?", "Laranja derrubada também paga taxa!"],
    banana: ["Minhas bananas! Eram exportação!", "Banana no chão não vai para os EUA!"],
    abacaxi: ["Meu abacaxi! Era premium!", "Quem vai descascar esse abacaxi? Eu cobro."],
  },
  carinho: (nome) => [`Bom garoto, ${nome}! Agora você tem crachá de assessor.`, `${nome} bateu continência com a orelha: vai me acompanhar um pouco.`, `Quem é o cachorro mais patriota da cidade? É o ${nome}!`],
  chuva: ["SENHA?", "1234", "ERRADA", "TENTE DE NOVO", "COFRE"],
  final: "Eleição no Cofre",
  depoisDoFinal: "A eleição ficou no cofre. A cidade é sua: veja como cada canto recebeu a notícia, ou reveja a cerimônia no palanque da Praça do Desfile.",
  passaporte: "Passaporte da Ordem",
  seloFinal: "🔐 Selo final: Eleição no Cofre. Dá para rever a cerimônia no palanque da Praça do Desfile.",
};

export function temaDe(hero: HeroId): TemaCena {
  return hero === "flavio" ? FLAVIO : LULA;
}
