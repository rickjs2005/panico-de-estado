import type { HeroId } from "./types";

/**
 * Missões como dados: etapas, o que conclui cada etapa e as falas.
 * A cena do mundo só informa eventos (falou, pegou, entregou) e reage às transições.
 */

export type MissionEvent =
  | { type: "talk"; npc: string }
  | { type: "pickup"; item: string }
  | { type: "deliver"; npc: string; item: string };

export type Target = { kind: "npc"; id: string } | { kind: "item"; id: string };

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

/** Objetivo do Lula nesta versão: a missão dele é a próxima etapa. */
export const LULA_OBJECTIVE = "Explore o bairro. A missão do Lula chega na próxima etapa.";

export function stepOf(mission: Mission, id: string): Step | undefined {
  return mission.steps.find((s) => s.id === id);
}

function sameEvent(a: MissionEvent, b: MissionEvent): boolean {
  if (a.type !== b.type) return false;
  if (a.type === "talk" && b.type === "talk") return a.npc === b.npc;
  if (a.type === "pickup" && b.type === "pickup") return a.item === b.item;
  if (a.type === "deliver" && b.type === "deliver") return a.npc === b.npc && a.item === b.item;
  return false;
}

/** A transição que este evento dispara na etapa atual, se houver. */
export function advance(mission: Mission, step: string, event: MissionEvent): Transition | null {
  return mission.transitions.find((t) => t.from === step && sameEvent(t.on, event)) ?? null;
}
