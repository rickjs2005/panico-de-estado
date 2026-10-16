import { buildingById, doorPoint } from "../../cidade";
import { CAMPANHA, DECISOES, ITENS } from "../../cidade/missoes/campanha";
import {
  alvosDe,
  completa,
  contexto,
  disponivel,
  escolher,
  evento,
  falaDoEstado,
  iniciar,
  missaoDe,
  pontosVisiveis,
  situacao,
  type Alvo,
  type Estado,
  type Opcao,
  type Saida,
  type SeloDef,
  type Valor,
} from "../../cidade/missoes/motor";
import { falaGeral } from "../../cidade/missoes/final";
import { saveCampanha } from "../../cidade/progress";

/**
 * Gerente da campanha dentro da cena: recebe os eventos do mundo (falar, usar, mudar um lugar),
 * pede ao motor (`cidade/missoes/motor.ts`) o que acontece e executa as saídas: balões, diálogos,
 * escolhas, itens, mudança de lugares, sons, a cerimônia final e a comemoração do selo. Guarda o
 * estado e o salva a cada mudança, então recarregar a página retoma a etapa certa.
 */

export interface Anfitriao {
  /** Estado atual dos lugares (igreja aberta, depósito vazio…). */
  lugares(): Record<string, string>;
  /** Muda um lugar pelo sistema normal de estados (a cena avisa de volta com o evento "lugar:…"). */
  aplicaLugar(place: string, estado: string): void;
  ler(texto: string): void;
  /** Mostra um diálogo curto; chama `fim` quando acaba ou o jogador pula. */
  dialogo(linhas: string[], quem: string | undefined, fim: () => void): void;
  /** Mostra uma escolha; chama `fim` com o id da opção ou com null se o jogador desistir. */
  escolha(titulo: string, quem: string | undefined, opcoes: { id: string; rotulo: string }[], fim: (id: string | null) => void): void;
  toast(texto: string): void;
  som(id: string): void;
  celebrar(selo: SeloDef, numero: number, completa: boolean): void;
  /** Cerimônia final (cena própria); chama `fim` quando termina, com as marcas que as escolhas dela deixaram. */
  cerimonia(estado: Estado, fim: (marcas?: Record<string, Valor>) => void): void;
  /** O estado da campanha mudou: atualiza HUD, adereços e o interior em que o jogador está. */
  mudou(): void;
}

type Bloco = { tipo: "fala"; linhas: string[]; quem?: string } | { tipo: "escolha"; s: Extract<Saida, { tipo: "escolha" }> } | { tipo: "cerimonia" };

/** Ponto solto para rever a cerimônia depois de concluída (ao lado do palanque). */
const REVER = { id: "rever-cerimonia", x: 2400, y: 1000, label: "Rever a cerimônia no palanque" };

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

  /** Chaves de estado que as condições `when` dos interiores consultam. */
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

  /** Fala de morador comum sobre o decreto, depois da cerimônia. */
  falaGeral(indice: number): string | null {
    return falaGeral(this.estado.flags, indice);
  }

  falaPara(npc: string): string[] | null {
    return falaDoEstado(CAMPANHA, this.estado, this.host.lugares(), npc);
  }

  /** A cerimônia final já foi vista pelo menos uma vez? */
  get cerimoniaFeita(): boolean {
    return this.estado.concluidas.includes("ditadura");
  }

  /** Pontos de missão ao ar livre que estão ativos agora (mais o de rever a cerimônia, se já concluída). */
  pontosFora(): { id: string; x: number; y: number; label: string }[] {
    const m = missaoDe(CAMPANHA, this.estado.ativa);
    const out: { id: string; x: number; y: number; label: string }[] = [];
    if (m) {
      const vis = pontosVisiveis(CAMPANHA, this.estado, this.host.lugares());
      for (const p of m.pontos) if (p.fora && vis.has(p.id)) out.push({ id: p.id, ...p.fora });
    }
    if (this.cerimoniaFeita && !this.estado.ativa) out.push(REVER);
    return out;
  }

  /** Usa um ponto ao ar livre: o de rever a cerimônia não passa pelo motor. */
  usaPonto(id: string) {
    if (id === REVER.id) this.rever();
    else this.emite(`usou:${id}`);
  }

  /** Rever a cerimônia: mostra tudo de novo, sem recompensa nem evento novo. */
  rever() {
    if (!this.cerimoniaFeita || this.emDialogo || this.blocos.length) return;
    this.host.cerimonia(this.estado, () => this.host.mudou());
  }

  /** Dados do HUD: missão ativa ou a próxima a ser aceita, checklist, indicadores, diário e decisões. */
  hud() {
    const s = situacao(CAMPANHA, this.estado, this.host.lugares());
    const prox = disponivel(CAMPANHA, this.estado);
    const principais = new Set(CAMPANHA.missoes.map((m) => m.selo.id));
    return {
      missao: s
        ? {
            titulo: s.missao.titulo,
            numero: s.missao.numero,
            etapa: s.numero,
            total: s.total,
            objetivo: s.objetivo,
            carregando: this.nomeDoItem(this.estado.carregando),
            lista: s.lista,
            painel: s.painel,
            destino: s.alvos[0]?.label ?? null,
          }
        : null,
      proxima: prox ? { titulo: prox.titulo, numero: prox.numero, quem: prox.inicio.quem } : null,
      selos: this.estado.selos.filter((x) => principais.has(x)),
      final: this.cerimoniaFeita,
      completa: completa(CAMPANHA, this.estado),
      diario: [...this.estado.diario].reverse().slice(0, 14),
      decisoes: this.decisoes(),
    };
  }

  /** O que o jogador decidiu em cada missão (texto curto), para o Passaporte. */
  decisoes(): { missao: number; texto: string; lado: "obediente" | "rebelde" | "meio" }[] {
    const out: { missao: number; texto: string; lado: "obediente" | "rebelde" | "meio" }[] = [];
    for (const m of CAMPANHA.missoes) {
      const v = this.estado.flags[`d.${m.id}`];
      const dec = typeof v === "string" ? DECISOES[m.id]?.[v] : undefined;
      if (dec) out.push({ missao: m.numero, texto: dec.texto, lado: dec.lado });
    }
    return out;
  }

  /** Destinos da missão para o mapa e a cidade (o primeiro é o principal; vários quando há mais de um pendente). */
  alvosMapa(): { x: number; y: number; label: string }[] {
    const m = missaoDe(CAMPANHA, this.estado.ativa);
    const alvos: Alvo[] = m ? alvosDe(m.etapas[this.estado.etapa], this.estado, this.host.lugares()) : disponivel(CAMPANHA, this.estado) ? [disponivel(CAMPANHA, this.estado)!.inicio.alvo] : [];
    const out: { x: number; y: number; label: string }[] = [];
    for (const alvo of alvos) {
      if (alvo.predio) {
        const b = buildingById(alvo.predio);
        if (!b) continue;
        const d = doorPoint(b);
        out.push({ x: Math.round(d.x), y: Math.round(d.y), label: alvo.label });
      } else if (alvo.x !== undefined && alvo.y !== undefined) out.push({ x: alvo.x, y: alvo.y, label: alvo.label });
    }
    return out;
  }

  /** Destino principal da missão no mapa (a etapa atual ou quem dá a próxima missão). */
  alvoMapa(): { x: number; y: number; label: string } | null {
    return this.alvosMapa()[0] ?? null;
  }

  /** Executa as saídas do motor. Devolve true se mostrou alguma fala ou escolha. */
  private aplica(saidas: Saida[]): boolean {
    const lers = saidas.filter((s) => s.tipo === "ler").length;
    const dialogos = saidas.filter((s) => s.tipo === "dialogo" || s.tipo === "escolha").length;
    // mais de uma fala no mesmo lance vira um diálogo, para nenhuma se perder
    const comoDialogo = dialogos > 0 || lers > 1;
    let falou = false;
    for (const s of saidas) {
      if (s.tipo === "ler") {
        falou = true;
        if (comoDialogo) this.blocos.push({ tipo: "fala", linhas: [s.texto] });
        else this.host.ler(s.texto);
      } else if (s.tipo === "dialogo") {
        falou = true;
        this.blocos.push({ tipo: "fala", linhas: s.linhas, quem: s.quem });
      } else if (s.tipo === "escolha") {
        falou = true;
        this.blocos.push({ tipo: "escolha", s });
      } else if (s.tipo === "toast") this.host.toast(s.texto);
      else if (s.tipo === "som") this.host.som(s.id);
      else if (s.tipo === "cerimonia") this.blocos.push({ tipo: "cerimonia" });
      else if (s.tipo === "lugar") this.host.aplicaLugar(s.place, s.estado);
      else if (s.tipo === "concluiu") {
        const m = missaoDe(CAMPANHA, s.missao);
        if (m && s.missao !== "ditadura") this.celebracoes.push({ selo: m.selo, completa: s.completa });
        else if (m) this.celebracoes.push({ selo: m.selo, completa: false });
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
        this.host.celebrar(c.selo, this.hud().selos.length, c.completa);
        this.avancaBlocos();
      }
      return;
    }
    this.emDialogo = true;
    if (b.tipo === "fala") {
      this.host.dialogo(b.linhas, b.quem, () => this.terminaBloco());
    } else if (b.tipo === "escolha") {
      const opcoes = b.s.opcoes.map((o) => ({ id: o.id, rotulo: o.rotulo }));
      this.host.escolha(b.s.titulo, b.s.quem, opcoes, (id) => {
        const op = id ? b.s.opcoes.find((o) => o.id === id) : undefined;
        if (op) this.aplicaOpcao(b.s, op);
        this.terminaBloco();
      });
    } else {
      this.host.cerimonia(this.estado, (marcas) => {
        this.emDialogo = false;
        // o que a cerimônia gravou (tom, estilo) entra no estado antes de concluir a missão
        if (marcas) {
          this.estado = { ...this.estado, flags: { ...this.estado.flags, ...marcas } };
          this.sujo = true;
        }
        this.emite("cerimonia:fim");
        this.avancaBlocos();
      });
    }
  }

  private terminaBloco() {
    this.emDialogo = false;
    this.avancaBlocos();
  }

  /** Aplica a opção escolhida (o motor recusa se a etapa mudou enquanto a escolha estava aberta). */
  private aplicaOpcao(s: Extract<Saida, { tipo: "escolha" }>, op: Opcao) {
    const antes = this.processando;
    this.processando = true;
    const r = escolher(CAMPANHA, this.estado, s.missao, s.etapaId, op, this.host.lugares());
    if (r.estado !== this.estado) {
      this.estado = r.estado;
      this.sujo = true;
    }
    // as falas novas entram depois deste bloco; a mudança de lugar volta como evento e é tratada na fila
    const emDialogo = this.emDialogo;
    this.emDialogo = true;
    this.aplica(r.saidas);
    this.emDialogo = emDialogo;
    this.processando = antes;
    if (!antes) {
      while (this.fila.length) this.emite(this.fila.shift()!);
      this.salva();
    }
  }
}
