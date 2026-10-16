import type * as Phaser from "phaser";
import { buildingById, doorPoint, type Solid } from "../../cidade";
import { caminho } from "../../cidade/navegacao";
import { MIN_POR_SEG, normaliza } from "../../cidade/relogio";
import { agendaDe, alvoEm, BAR, falaDe, type Agenda, type Alvo, type Atividade } from "../../cidade/rotinas";
import type { CityNpc, InteriorDef } from "../../cidade/types";
import type { Point } from "../../types";
import { isFree } from "../collide";
import type { Npc } from "../Npc";

/**
 * Faz os moradores da rua viverem a rotina diária (`cidade/rotinas.ts`): quem deve sair de casa
 * calcula o caminho pelas calçadas e faixas, anda até lá e entra pela porta do prédio; quem está
 * dentro some da rua (e aparece dentro do prédio, se o jogador entrar). Roda todo quadro para
 * todos, mas é só aritmética: quem está longe da câmera anda sem animar.
 */

const VELOCIDADE = 78;
const FORA = -9999;

interface Agente {
  npc: Npc;
  agenda: Agenda;
  base: Point;
  dentro: string | null;
  caminho: Point[] | null;
  i: number;
  alvo: string;
  destino: Alvo;
  atividade: Atividade;
}

const chave = (a: Alvo) => (a.tipo === "dentro" ? a.predio : "ponto");

export class Rotinas {
  minuto: number;
  private agentes: Agente[] = [];
  private ultimoMinuto = -1;

  constructor(
    private scene: Phaser.Scene,
    npcs: Npc[],
    hora: number,
  ) {
    this.minuto = normaliza(hora);
    for (const npc of npcs) {
      const def = npc.def as CityNpc;
      const agenda = agendaDe(def);
      const destino = alvoEm(agenda, this.minuto);
      const ag: Agente = { npc, agenda, base: { x: def.x, y: def.y }, dentro: null, caminho: null, i: 0, alvo: chave(destino), destino, atividade: "ponto" };
      this.agentes.push(ag);
      if (destino.tipo === "dentro") this.entrar(ag, destino.predio, false);
    }
  }

  /** Avança o relógio e os moradores. `perto` diz se vale animar o boneco (está na tela). */
  update(dt: number, perto: (n: Npc) => boolean) {
    this.minuto = normaliza(this.minuto + dt * MIN_POR_SEG);
    const m = Math.floor(this.minuto);
    if (m !== this.ultimoMinuto) {
      this.ultimoMinuto = m;
      for (const ag of this.agentes) this.reavaliar(ag);
    }
    for (const ag of this.agentes) if (ag.caminho) this.andar(ag, dt, perto(ag.npc));
  }

  /** Muda a hora na hora (depuração): ajeita quem está dentro ou fora sem esperar a caminhada. */
  ajustar(hora: number) {
    this.minuto = normaliza(hora);
    this.ultimoMinuto = Math.floor(this.minuto);
    for (const ag of this.agentes) {
      const destino = alvoEm(ag.agenda, this.minuto);
      ag.alvo = chave(destino);
      ag.destino = destino;
      ag.caminho = null;
      if (destino.tipo === "dentro") {
        if (ag.dentro !== destino.predio) this.entrar(ag, destino.predio, false);
      } else {
        if (ag.dentro) this.aparecer(ag, ag.base);
        else ag.npc.walker.setPosition(ag.base.x, ag.base.y);
        ag.npc.controlado = false;
        ag.atividade = "ponto";
      }
    }
  }

  private reavaliar(ag: Agente) {
    const destino = alvoEm(ag.agenda, this.minuto);
    const k = chave(destino);
    if (k === ag.alvo) return;
    ag.alvo = k;
    ag.destino = destino;
    this.iniciar(ag);
  }

  private iniciar(ag: Agente) {
    const { npc, destino } = ag;
    let de: Point;
    if (ag.dentro) {
      const b = buildingById(ag.dentro);
      de = b ? doorPoint(b) : { x: ag.base.x, y: ag.base.y };
      this.aparecer(ag, de);
    } else de = { x: npc.x, y: npc.y };
    const pb = destino.tipo === "dentro" ? buildingById(destino.predio) : null;
    const para = pb ? doorPoint(pb) : ag.base;
    ag.atividade = destino.tipo === "ponto" ? "indo-ponto" : destino.predio === BAR ? "indo-bar" : destino.predio === ag.agenda.casa ? "indo-casa" : "indo-almoco";
    const rota = caminho(de, para);
    if (!rota || rota.length < 2) {
      this.chegar(ag, true);
      return;
    }
    ag.caminho = rota;
    ag.i = 1;
    npc.controlado = true;
  }

  private andar(ag: Agente, dt: number, animar: boolean) {
    const caminhoAtual = ag.caminho!;
    const w = ag.npc.walker;
    const alvo = caminhoAtual[ag.i];
    const dx = alvo.x - w.x;
    const dy = alvo.y - w.y;
    const d = Math.hypot(dx, dy);
    const passo = VELOCIDADE * dt;
    if (d <= passo) {
      w.setPosition(alvo.x, alvo.y);
      ag.i++;
      if (ag.i >= caminhoAtual.length) this.chegar(ag, false);
    } else {
      w.setPosition(w.x + (dx / d) * passo, w.y + (dy / d) * passo);
      w.faceToward(dx, dy);
    }
    if (animar) w.animate(dt, VELOCIDADE, false);
  }

  private chegar(ag: Agente, instantaneo: boolean) {
    ag.caminho = null;
    if (ag.destino.tipo === "dentro") {
      this.entrar(ag, ag.destino.predio, !instantaneo);
    } else {
      if (ag.dentro) this.aparecer(ag, ag.base);
      else ag.npc.walker.setPosition(ag.base.x, ag.base.y);
      const def = ag.npc.def;
      ag.npc.walker.setFacing(def.facing, def.flip);
      ag.npc.controlado = false;
      ag.atividade = "ponto";
    }
  }

  /** Entra no prédio: some da rua (com um piscar rápido quando alguém vê). */
  private entrar(ag: Agente, predio: string, animado: boolean) {
    ag.dentro = predio;
    ag.caminho = null;
    ag.npc.controlado = true;
    ag.atividade = "dentro";
    const root = ag.npc.walker.root;
    const sumir = () => {
      ag.npc.walker.setPosition(FORA, FORA);
      root.setAlpha(1);
    };
    if (animado) this.scene.tweens.add({ targets: root, alpha: 0, duration: 220, onComplete: sumir });
    else sumir();
  }

  /** Aparece na rua num ponto (saída do prédio ou volta ao posto). */
  private aparecer(ag: Agente, p: Point) {
    ag.dentro = null;
    ag.npc.walker.setPosition(p.x, p.y);
    ag.npc.walker.root.setAlpha(0);
    this.scene.tweens.add({ targets: ag.npc.walker.root, alpha: 1, duration: 200 });
  }

  /** Moradores que estão dentro de um prédio, prontos para aparecer no interior. */
  visitantes(interior: InteriorDef, solids: Solid[], max = 4): CityNpc[] {
    const dentro = this.agentes.filter((a) => a.dentro === interior.building).slice(0, max);
    const usados: Point[] = [];
    const out: CityNpc[] = [];
    const base: Point[] = [];
    for (const s of interior.spots) base.push({ x: s.x, y: s.y });
    base.push({ x: interior.room.x + interior.room.w * 0.3, y: interior.room.y + interior.room.h * 0.6 }, { x: interior.room.x + interior.room.w * 0.7, y: interior.room.y + interior.room.h * 0.6 });
    const desloc = [
      [-46, 26],
      [46, 26],
      [0, 46],
      [-30, -10],
      [60, -4],
    ];
    for (const ag of dentro) {
      let escolhido: Point | null = null;
      for (let k = 0; k < base.length * desloc.length && !escolhido; k++) {
        const b = base[(k + usados.length * 3) % base.length];
        const [dx, dy] = desloc[Math.floor(k / base.length) % desloc.length];
        const p = { x: b.x + dx, y: b.y + dy };
        if (Math.hypot(p.x - interior.exit.x, p.y - interior.exit.y) < 90 || Math.hypot(p.x - interior.entry.x, p.y - interior.entry.y) < 70) continue;
        if (!isFree(p.x, p.y, 12, solids)) continue;
        if (usados.some((u) => Math.hypot(u.x - p.x, u.y - p.y) < 60)) continue;
        escolhido = p;
      }
      if (!escolhido) continue;
      usados.push(escolhido);
      const def = ag.npc.def as CityNpc;
      out.push({
        ...def,
        id: `visita-${def.id}`,
        x: escolhido.x,
        y: escolhido.y,
        facing: "front",
        flip: undefined,
        route: undefined,
        behavior: undefined,
        group: undefined,
        lines: [...(ag.dentro === ag.agenda.casa ? ["Estou em casa. A casa é de todos, mas o sofá é meu.", "Hoje não saio. O boato que venha até aqui."] : [`Tô aqui um instante. Já já eu volto pra rua.`]), ...def.lines.slice(0, 1)],
      });
    }
    return out;
  }

  /** Fala do morador conforme o que ele faz agora; `null` se não houver nada de especial. */
  fala(id: string, n: number): string | null {
    const ag = this.agentes.find((a) => a.npc.id === id);
    if (!ag) return null;
    const t = falaDe(ag.atividade, this.minuto, n);
    return t || null;
  }

  atividadeDe(id: string): Atividade | null {
    return this.agentes.find((a) => a.npc.id === id)?.atividade ?? null;
  }

  /** Resumo para depuração e testes. */
  resumo() {
    const por: Record<string, number> = {};
    for (const a of this.agentes) {
      const k = a.dentro ? "dentro" : a.caminho ? "andando" : "no ponto";
      por[k] = (por[k] ?? 0) + 1;
    }
    return { minuto: Math.round(this.minuto), total: this.agentes.length, ...por };
  }

  /** Quem está dentro de cada prédio (depuração). */
  ocupacao(): Record<string, number> {
    const out: Record<string, number> = {};
    for (const a of this.agentes) if (a.dentro) out[a.dentro] = (out[a.dentro] ?? 0) + 1;
    return out;
  }
}
