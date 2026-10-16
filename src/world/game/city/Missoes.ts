import { buildingById, doorPoint } from "../../cidade";
import { CAMPANHA, ITENS } from "../../cidade/missoes/campanha";
import { completa, contexto, disponivel, evento, falaDoEstado, iniciar, missaoDe, pontosVisiveis, situacao, type Alvo, type Estado, type Saida, type SeloDef } from "../../cidade/missoes/motor";
import { saveCampanha } from "../../cidade/progress";

/**
 * Gerente da campanha dentro da cena: recebe os eventos do mundo (falar, usar, mudar um lugar),
 * pede ao motor (`cidade/missoes/motor.ts`) o que acontece e executa as saídas: balões, diálogos,
 * itens, mudança de lugares e a comemoração do selo. Guarda o estado e o salva a cada mudança,
 * então recarregar a página retoma a etapa certa.
 */

export interface Anfitriao {
  /** Estado atual dos lugares (igreja aberta, depósito vazio…). */
  lugares(): Record<string, string>;
  /** Muda um lugar pelo sistema normal de estados (a cena avisa de volta com o evento "lugar:…"). */
  aplicaLugar(place: string, estado: string): void;
  ler(texto: string): void;
  /** Mostra um diálogo curto; chama \`fim\` quando acaba ou o jogador pula. */
  dialogo(linhas: string[], quem: string | undefined, fim: () => void): void;
  toast(texto: string): void;
  celebrar(selo: SeloDef, numero: number, completa: boolean): void;
  /** O estado da campanha mudou: atualiza HUD, adereços e o interior em que o jogador está. */
  mudou(): void;
}

interface Bloco {
  linhas: string[];
  quem?: string;
}

export class Missoes {
  estado: Estado;
  private fila: string[] = [];
  private processando = false;
  private blocos: Bloco[] = [];
  private emDialogo = false;
  private celebracoes: { selo: SeloDef; completa: boolean }[] = [];
  private sujo = false;

  constructor(
    private host: Anfitriao,
    estado: Estado,
  ) {
    this.estado = estado;
  }

  /** Chaves de estado que as condições \`when\` dos interiores consultam. */
  contexto(): Record<string, string> {
    return contexto(CAMPANHA, this.estado, this.host.lugares());
  }

  get carregando(): string | null {
    return this.estado.carregando;
  }

  nomeDoItem(id: string | null): string | null {
    return id ? (ITENS[id] ?? id) : null;
  }

  /** Emite um evento do mundo. Devolve true se ele gerou fala (para a cena não repetir a fala comum). */
  emite(ev: string): boolean {
    this.fila.push(ev);
    if (this.processando) return false;
    this.processando = true;
    let falou = false;
    while (this.fila.length) {
      const e = this.fila.shift()!;
      const r = evento(CAMPANHA, this.estado, e, this.host.lugares());
      if (r.estado !== this.estado) {
        this.estado = r.estado;
        this.sujo = true;
      }
      if (this.aplica(r.saidas)) falou = true;
    }
    this.processando = false;
    this.salva();
    return falou;
  }

  private salva() {
    if (!this.sujo) return;
    this.sujo = false;
    saveCampanha(this.estado);
    this.host.mudou();
  }

  /** Falar com quem dá a próxima missão: abre o diálogo de apresentação e começa. */
  iniciaSe(npc: string): boolean {
    const m = disponivel(CAMPANHA, this.estado);
    if (!m || m.inicio.npc !== npc) return false;
    this.processando = true;
    const r = iniciar(CAMPANHA, this.estado, m.id, this.host.lugares());
    this.estado = r.estado;
    this.sujo = true;
    this.aplica(r.saidas);
    // eventos que as saídas provocaram (por exemplo, mudança de lugar) entram na fila normal
    this.processando = false;
    while (this.fila.length) this.emite(this.fila.shift()!);
    this.salva();
    return true;
  }

  /** Este morador é peça da missão agora (dá a próxima ou está numa regra da etapa)? Ganha prioridade na conversa. */
  relevante(npc: string): boolean {
    const m = missaoDe(CAMPANHA, this.estado.ativa);
    if (!m) return disponivel(CAMPANHA, this.estado)?.inicio.npc === npc;
    return m.etapas[this.estado.etapa]?.regras.some((r) => r.evento === `falou:${npc}`) ?? false;
  }

  falaPara(npc: string): string[] | null {
    return falaDoEstado(CAMPANHA, this.estado, this.host.lugares(), npc);
  }

  /** Pontos de missão ao ar livre que estão ativos agora. */
  pontosFora(): { id: string; x: number; y: number; label: string }[] {
    const m = missaoDe(CAMPANHA, this.estado.ativa);
    if (!m) return [];
    const vis = pontosVisiveis(CAMPANHA, this.estado, this.host.lugares());
    return m.pontos.filter((p) => p.fora && vis.has(p.id)).map((p) => ({ id: p.id, ...p.fora! }));
  }

  /** Dados do HUD: missão ativa ou a próxima a ser aceita. */
  hud() {
    const s = situacao(CAMPANHA, this.estado);
    const prox = disponivel(CAMPANHA, this.estado);
    return {
      missao: s ? { titulo: s.missao.titulo, numero: s.missao.numero, etapa: s.numero, total: s.total, objetivo: s.objetivo, carregando: this.nomeDoItem(this.estado.carregando) } : null,
      proxima: prox ? { titulo: prox.titulo, numero: prox.numero, quem: prox.inicio.quem } : null,
      selos: [...this.estado.selos],
      completa: completa(CAMPANHA, this.estado),
    };
  }

  /** Destino da missão no mapa (a etapa atual ou quem dá a próxima missão). */
  alvoMapa(): { x: number; y: number; label: string } | null {
    const s = situacao(CAMPANHA, this.estado);
    const alvo: Alvo | undefined = s ? s.etapa.alvo : (disponivel(CAMPANHA, this.estado)?.inicio.alvo ?? undefined);
    if (!alvo) return null;
    if (alvo.predio) {
      const b = buildingById(alvo.predio);
      if (!b) return null;
      const d = doorPoint(b);
      return { x: Math.round(d.x), y: Math.round(d.y), label: alvo.label };
    }
    return alvo.x !== undefined && alvo.y !== undefined ? { x: alvo.x, y: alvo.y, label: alvo.label } : null;
  }

  /** Executa as saídas do motor. Devolve true se mostrou alguma fala. */
  private aplica(saidas: Saida[]): boolean {
    const lers = saidas.filter((s) => s.tipo === "ler").length;
    const dialogos = saidas.filter((s) => s.tipo === "dialogo").length;
    // mais de uma fala no mesmo lance vira um diálogo, para nenhuma se perder
    const comoDialogo = dialogos > 0 || lers > 1;
    let falou = false;
    for (const s of saidas) {
      if (s.tipo === "ler") {
        falou = true;
        if (comoDialogo) this.blocos.push({ linhas: [s.texto] });
        else this.host.ler(s.texto);
      } else if (s.tipo === "dialogo") {
        falou = true;
        this.blocos.push({ linhas: s.linhas, quem: s.quem });
      } else if (s.tipo === "toast") this.host.toast(s.texto);
      else if (s.tipo === "lugar") this.host.aplicaLugar(s.place, s.estado);
      else if (s.tipo === "concluiu") {
        const m = missaoDe(CAMPANHA, s.missao);
        if (m) this.celebracoes.push({ selo: m.selo, completa: s.completa });
      }
    }
    this.avancaBlocos();
    return falou;
  }

  private avancaBlocos() {
    if (this.emDialogo) return;
    const b = this.blocos.shift();
    if (!b) {
      const c = this.celebracoes.shift();
      if (c) {
        this.host.celebrar(c.selo, this.estado.selos.length, c.completa);
        this.avancaBlocos();
      }
      return;
    }
    this.emDialogo = true;
    this.host.dialogo(b.linhas, b.quem, () => {
      this.emDialogo = false;
      this.avancaBlocos();
    });
  }
}
