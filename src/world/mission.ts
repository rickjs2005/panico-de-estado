import type { HeroId } from "./types";

/**
 * Missões como dados: etapas, o que conclui cada etapa e as falas.
 * A cena do mundo só informa eventos (falou, pegou, entregou) e reage às transições.
 */

export type MissionEvent =
  | { type: "talk"; npc: string }
  | { type: "pickup"; item: string }
  | { type: "deliver"; npc: string; item: string }
  | { type: "interact"; place: string };

export type Target = { kind: "npc"; id: string } | { kind: "item"; id: string } | { kind: "place"; id: string };

export interface Line {
  /** Id do morador, ou "hero" para uma reação do protagonista (que não fala, só reage). */
  who: string;
  text: string;
  /** Marca o momento em que algo acontece no mundo durante a fala. */
  cue?: "consequencia";
}

export interface Step {
  id: string;
  objective: string;
  target: Target | null;
}

export interface Transition {
  from: string;
  on: MissionEvent;
  to: string;
  lines: Line[];
}

export interface Mission {
  id: string;
  title: string;
  hero: HeroId;
  steps: Step[];
  transitions: Transition[];
  /** Falas dos moradores que mudam conforme a etapa. */
  talk: Record<string, Record<string, string[]>>;
  /** Textos do cenário antes e depois da consequência. */
  banner: { before: string; after: string };
  finalStep: string;
}

export const CHICOTE_EXPRESSO: Mission = {
  id: "chicote-expresso",
  title: "Chicote Expresso",
  hero: "flavio",
  finalStep: "concluida",
  steps: [
    { id: "festa", objective: "Vá até a festa na porta da Fábrica Feliz", target: { kind: "npc", id: "boato" } },
    { id: "buscar", objective: "Busque um chicote na Selaria do Zeca", target: { kind: "item", id: "chicote" } },
    { id: "entregar", objective: "Leve o chicote ao patrão da fábrica", target: { kind: "npc", id: "patrao" } },
    { id: "concluida", objective: "O boato virou realidade. Explore o bairro.", target: null },
  ],
  transitions: [
    {
      from: "festa",
      on: { type: "talk", npc: "boato" },
      to: "buscar",
      lines: [
        { who: "boato", text: "Presidente! Olha aquilo: patrão tratando funcionário BEM." },
        { who: "hero", text: "!" },
        { who: "boato", text: "Aqui boato vira verdade… mas esse precisa de uma ajudinha." },
        { who: "boato", text: "Busca um chicote na Selaria do Zeca, do outro lado do bairro!" },
      ],
    },
    {
      from: "buscar",
      on: { type: "pickup", item: "chicote" },
      to: "entregar",
      lines: [
        { who: "zeca", text: "Leva! Hoje o chicote é por conta do boato." },
        { who: "hero", text: "!" },
        { who: "zeca", text: "Cuidado que no carro ele estala sozinho!" },
      ],
    },
    {
      from: "entregar",
      on: { type: "deliver", npc: "patrao", item: "chicote" },
      to: "concluida",
      lines: [
        { who: "patrao", text: "Um chicote? Pra mim?" },
        { who: "patrao", text: "Eu… eu sinto um boato tomando conta de mim!" },
        { who: "patrao", text: "PRODUTIVIDADE!!!", cue: "consequencia" },
        { who: "func2", text: "O boato era verdade?!" },
        { who: "func3", text: "Cadê a picanha?!" },
      ],
    },
  ],
  talk: {
    festa: {
      patrao: ["Hoje é dia de picanha pra todo mundo!", "Funcionário feliz, fábrica feliz!"],
    },
    buscar: {
      zeca: ["Chicote? Tá ali no expositor da frente. Pode pegar!"],
      boato: ["A Selaria do Zeca fica lá no nordeste do bairro. Vai de carro!"],
      patrao: ["Quer uma picanha antes de ir?"],
    },
    entregar: {
      boato: ["Agora entrega pro patrão. Ele tá na churrasqueira!"],
      zeca: ["Volta sempre! Ou não, depende do boato."],
    },
    concluida: {
      patrao: ["Mais rápido! Meta de 300%!", "Picanha agora só depois da meta!"],
      func1: ["Era só um boato!", "Volta, confraternização!"],
      func2: ["Meu crachá tá soltando fumaça!"],
      func3: ["Alguém desliga esse chicote!"],
      func4: ["Ontem eu tinha folga no aniversário…"],
      boato: ["Viu? Neste bairro, boato vira verdade.", "Agora pode explorar à vontade, presidente."],
      zeca: ["Vendeu bem, o chicote? Tô sem estoque!"],
    },
  },
  banner: { before: "CONFRATERNIZAÇÃO", after: "META: 300%" },
};

export const OPERACAO_CADEADO: Mission = {
  id: "operacao-cadeado", title: "Operação Cadeado", hero: "lula", finalStep: "concluida",
  steps: [
    { id: "anuncio", objective: "Fale com Seu Boato na praça da igreja", target: { kind: "npc", id: "boato" } },
    { id: "buscar", objective: "Pegue o cadeado presidencial em frente ao bar", target: { kind: "item", id: "cadeado" } },
    { id: "fechar", objective: "Leve o cadeado até a porta e feche a igreja", target: { kind: "place", id: "igreja" } },
    { id: "concluida", objective: "Igreja fechada por decreto neste Brasil impossível", target: null },
  ],
  transitions: [
    { from: "anuncio", on: { type: "talk", npc: "boato" }, to: "buscar", lines: [
      { who: "boato", text: "Presidente! O comunismo dos áudios de zap tomou conta do bairro!" },
      { who: "hero", text: "Então traz o cadeado. Hoje eu fecho essa igreja!" },
      { who: "boato", text: "Tá na frente do bar. Aproveita e abastece sua energia de cachaça!" },
    ] },
    { from: "buscar", on: { type: "pickup", item: "cadeado" }, to: "fechar", lines: [
      { who: "tiao", text: "Cadeado tamanho presidencial. Cabe uma igreja inteira nesse negócio!" },
    ] },
    { from: "fechar", on: { type: "interact", place: "igreja" }, to: "concluida", lines: [
      { who: "hero", text: "Por decreto do Brasil hipotético: igreja fechada!" },
      { who: "pastor", text: "O senhor trouxe um cadeado com orçamento de ministério!" },
      { who: "boato", text: "Próxima entrega: os kits que o grupo da família tanto anunciou." },
    ] },
  ],
  talk: {
    buscar: { boato: ["O cadeado tá no bar, a oeste. O boato veio até com chave!"], pastor: ["Presidente, pra que esse cadeado todo?"] },
    fechar: { pastor: ["Se é pra fechar, a porta é bem ali. Quero ver caber!"], tiao: ["A caneta só funciona abastecida! Mais cachaça aqui no balcão."] },
  },
  banner: { before: "IGREJA ABERTA", after: "FECHADA POR DECRETO" },
};

export const KIT_DO_ZAP: Mission = {
  id: "kit-do-zap", title: "Kit Gay do Zap", hero: "lula", finalStep: "concluida",
  steps: [
    { id: "buscar", objective: "Pegue as caixas coloridas na frente do mercadinho", target: { kind: "item", id: "kits" } },
    { id: "entregar", objective: "Entregue os kits à diretora na escola ao sul", target: { kind: "npc", id: "diretora" } },
    { id: "concluida", objective: "Os kits chegaram à escola do Brasil dos boatos", target: null },
  ],
  transitions: [
    { from: "buscar", on: { type: "pickup", item: "kits" }, to: "entregar", lines: [
      { who: "hero", text: "Os kits do grupo de família chegaram! Destino: escola!" },
    ] },
    { from: "entregar", on: { type: "deliver", npc: "diretora", item: "kits" }, to: "concluida", lines: [
      { who: "diretora", text: "Entrega presidencial? Até as caixas vieram em seis cores!" },
      { who: "hero", text: "Pode distribuir os kits. Aqui o boato tem até nota fiscal!" },
      { who: "diretora", text: "O almoxarifado agora precisa de uma prateleira por cor." },
    ] },
  ],
  talk: { entregar: { boato: ["A escola fica no sul. Leva as caixas no carro!"], reitora: ["Depois passa na universidade. Tem decreto esperando sua assinatura!"] } },
  banner: { before: "ESCOLA ESTADUAL", after: "KITS ENTREGUES" },
};

export const CAMPUS_LIBERADO: Mission = {
  id: "campus-liberado", title: "Campus Sem Freio", hero: "lula", finalStep: "concluida",
  steps: [
    { id: "conversa", objective: "Fale com a reitora na universidade, a leste", target: { kind: "npc", id: "reitora" } },
    { id: "assinar", objective: "Assine o decreto no portão da universidade", target: { kind: "place", id: "campus" } },
    { id: "concluida", objective: "Drogas liberadas no campus deste universo fictício", target: null },
  ],
  transitions: [
    { from: "conversa", on: { type: "talk", npc: "reitora" }, to: "assinar", lines: [
      { who: "reitora", text: "Nos áudios, o senhor libera todas as drogas na universidade." },
      { who: "hero", text: "Neste Brasil impossível, eu assino esse absurdo agora!" },
      { who: "reitora", text: "Caneta no portão. O setor de boatos já preparou a festa." },
    ] },
    { from: "assinar", on: { type: "interact", place: "campus" }, to: "concluida", lines: [
      { who: "hero", text: "Decreto assinado! Liberou geral no campus do pânico!" },
      { who: "reitora", text: "Esse governo tá parecendo o histórico do grupo da minha tia." },
    ] },
  ],
  talk: { assinar: { reitora: ["A assinatura é ali no portão. O absurdo tá esperando!"] } },
  banner: { before: "UNIVERSIDADE DO PÂNICO", after: "DROGAS LIBERADAS" },
};

export const BRASIL_PARA_CHINA: Mission = {
  id: "brasil-para-china", title: "Brasil, Destino China", hero: "lula", finalStep: "concluida",
  steps: [
    { id: "buscar", objective: "Pegue o Brasil embalado na praça do coreto", target: { kind: "item", id: "brasil-caixa" } },
    { id: "despachar", objective: "Leve o Brasil ao terminal de frete no sudeste", target: { kind: "place", id: "terminal" } },
    { id: "concluida", objective: "Brasil despachado! Explore as consequências dos quatro boatos", target: null },
  ],
  transitions: [
    { from: "buscar", on: { type: "pickup", item: "brasil-caixa" }, to: "despachar", lines: [
      { who: "hero", text: "Já fechei igreja. Agora vou entregar o Brasil para a China!" },
    ] },
    { from: "despachar", on: { type: "interact", place: "terminal" }, to: "concluida", lines: [
      { who: "despachante", text: "Um país inteiro? Esse pacote não passa na balança!" },
      { who: "hero", text: "Manda com frete grátis. Quem reclamou que pague o rastreio!" },
      { who: "despachante", text: "Destino: China. Conteúdo declarado: um Brasil hipotético." },
      { who: "boato", text: "Pronto! Até o último áudio virou cenário. Vai dar uma volta!" },
    ] },
  ],
  talk: { despachar: { despachante: ["A esteira fica na frente do terminal. Despacha ali!"], boato: ["País frágil. Favor não empilhar os estados."] } },
  banner: { before: "TERMINAL INTERNACIONAL", after: "BRASIL ENVIADO À CHINA" },
};

export const LULA_CAMPAIGN = [OPERACAO_CADEADO, KIT_DO_ZAP, CAMPUS_LIBERADO, BRASIL_PARA_CHINA];

export function missionsFor(hero: HeroId): Mission[] {
  return hero === "lula" ? LULA_CAMPAIGN : [CHICOTE_EXPRESSO];
}

export function stepOf(mission: Mission, id: string): Step | undefined {
  return mission.steps.find((s) => s.id === id);
}

function sameEvent(a: MissionEvent, b: MissionEvent): boolean {
  if (a.type !== b.type) return false;
  if (a.type === "talk" && b.type === "talk") return a.npc === b.npc;
  if (a.type === "pickup" && b.type === "pickup") return a.item === b.item;
  if (a.type === "deliver" && b.type === "deliver") return a.npc === b.npc && a.item === b.item;
  if (a.type === "interact" && b.type === "interact") return a.place === b.place;
  return false;
}

/** A transição que este evento dispara na etapa atual, se houver. */
export function advance(mission: Mission, step: string, event: MissionEvent): Transition | null {
  return mission.transitions.find((t) => t.from === step && sameEvent(t.on, event)) ?? null;
}
