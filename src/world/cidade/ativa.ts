import type { HeroId } from "../types";
import type { CidadeDef } from "./definicao";
import { CIDADE, definirCidade } from "./index";
import { FLAVIO } from "./flavio";
import { LULA } from "./lula";
import { reiniciaNavegacao } from "./navegacao";
import { reiniciaRotinas } from "./rotinas";
import { montaRede } from "./ruas";

/**
 * Troca a cidade ativa: dados do mapa, interiores, trânsito, navegação a pé e rotinas.
 * Chamada antes de a cena da cidade abrir (e pelo mapa e pelas checagens). Trocar para a cidade
 * que já está ativa não refaz nada.
 */

const CIDADES: Partial<Record<HeroId, CidadeDef>> = { lula: LULA, flavio: FLAVIO };

/** O protagonista tem uma cidade grande? (o bairro original fica para quem não tiver). */
export function temCidade(hero: HeroId): boolean {
  return !!CIDADES[hero];
}

export function ativaCidade(hero: HeroId) {
  const def = CIDADES[hero];
  if (!def) throw new Error(`sem cidade para ${hero}`);
  if (CIDADE === def) return;
  definirCidade(def);
  montaRede(def.roads, def.ruasSemCarro);
  reiniciaNavegacao();
  reiniciaRotinas();
}
