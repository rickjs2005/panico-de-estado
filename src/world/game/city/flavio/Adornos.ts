import type * as Phaser from "phaser";
import { buildingById, doorPoint, PROPS } from "../../../cidade";
import { marcasDaPracaFlavio } from "../../../cidade/flavio/final";
import type { LookId } from "../../../looks";
import type { Rect } from "../../../types";
import { RES } from "../../bake";
import { Walker } from "../../Walker";

/**
 * Consequências das missões do Brasil do Flávio desenhadas na rua: a placa de cada decisão na porta do
 * prédio da missão, as filas que algumas decisões criam, a caixa do Brasil no cais e a praça depois da
 * Eleição no Cofre. Mesma interface dos adornos da cidade do Lula: tudo sai do contexto do jogo
 * (decisões `d.<missão>` e estado dos lugares), então recarregar a página não desfaz nada.
 */

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

/** Chaves do contexto que mudam o que é desenhado. */
const CHAVES = ["flag:d.chicote", "flag:d.dezembro", "flag:d.catraca", "fl-catraca-posto", "flag:d.leilao", "flag:d.urna", "flag:d.eua", "flag:final.tom", "flag:final.proc", "flag:final.voto"];

/** Placa de cada decisão, na porta do prédio da missão: [texto, fundo, cor]. */
const PLACAS: Record<string, { predio: string; textos: Record<string, [string, string, string]> }> = {
  chicote: {
    predio: "fl-ind-fabrica",
    textos: {
      entregou: ["CHICOTE DE METAS · USO DECORATIVO", "#7a3e1d", "#fff4e0"],
      vale: ["VALE-REFEIÇÃO PARA TODOS · ASS.: PRESIDENTE", "#2f9e5a", "#fffaf0"],
      alcacuz: ["META DOCE: CHICOTE DE ALCAÇUZ", "#1e1424", "#ffd23f"],
    },
  },
  dezembro: {
    predio: "fl-ind-rh",
    textos: {
      aceitou: ["CALENDÁRIO OFICIAL: JANEIRO A NOVEMBRO", "#b5452b", "#fffaf0"],
      devolveu: ["DEZEMBRO DEVOLVIDO (À CANETA) · 13º PAGO", "#2f9e5a", "#fffaf0"],
      parcelou: ["13º EM 12 PARCELAS DE NOVEMBRO", "#1e1424", "#ffd23f"],
    },
  },
  leilao: {
    predio: "fl-ter-leilao",
    textos: {
      vendeu: ["LOTE 1 VENDIDO AO PINGUIM · PAGAMENTO: 1 PEIXE", "#2a3a6b", "#ffd23f"],
      cancelou: ["LEILÃO CANCELADO · BARRIL DEVOLVIDO", "#b5452b", "#fffaf0"],
      "sem-lance": ["LOTE SEM LANCE · VOLTOU AO PATRIMÔNIO", "#1e1424", "#ffd23f"],
    },
  },
  urna: {
    predio: "fl-civ-cartorio",
    textos: {
      autorizou: ["AUTORIZAÇÃO DE VOTO: 3 VIAS E UM CAFÉ", "#7b4bd1", "#fffaf0"],
      rasgou: ["PARA VOTAR, BASTA SER ELEITOR", "#2f9e5a", "#fffaf0"],
      titulo: ["O TÍTULO DE ELEITOR JÁ BASTA (REGIMENTO ANTIGO)", "#1e1424", "#ffd23f"],
    },
  },
};

/**
 * Moradores que assistem à cerimônia (dos dois lados do palanque, entre a Moto da Pátria e os canteiros)
 * e que formam as filas. `dy` é relativo ao pé do palanque.
 */
const PLATEIA: { look: LookId; dx: number; dy: number }[] = [
  { look: "m1", dx: -232, dy: -72 },
  { look: "m3", dx: -182, dy: -66 },
  { look: "m5", dx: -136, dy: -74 },
  { look: "m2", dx: 136, dy: -70 },
  { look: "m6", dx: 184, dy: -64 },
  { look: "m8", dx: 232, dy: -72 },
  { look: "m4", dx: -206, dy: -38 },
  { look: "m7", dx: 208, dy: -40 },
];

export class AdornosFlavio {
  private objs: Phaser.GameObjects.GameObject[] = [];
  private gente: Walker[] = [];
  private chave = "";

  constructor(
    private scene: Phaser.Scene,
    private registra: (o: Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Visible, bounds: Rect) => void,
    /** Menos movimento: o cadeado não balança e a plateia não pula. */
    private calmo = false,
  ) {}

  atualiza(ctx: Record<string, string>) {
    const k = CHAVES.map((x) => ctx[x] ?? "").join("|");
    if (k === this.chave) return;
    this.chave = k;
    for (const o of this.objs) o.destroy();
    for (const g of this.gente) g.destroy();
    this.objs = [];
    this.gente = [];
    const dec = (m: string) => ctx[`flag:d.${m}`] ?? "";
    for (const [m, def] of Object.entries(PLACAS)) if (dec(m)) this.naPorta(def.predio, def.textos[dec(m)]);
    if (dec("chicote") === "entregou") this.chicoteNaPorta();
    // quem obedeceu ganhou fila: no RH sem dezembro e no cartório das três vias
    if (dec("dezembro") === "aceitou") this.filaNaPorta("fl-ind-rh", 3, 0);
    if (dec("urna") === "autorizou") this.filaNaPorta("fl-civ-cartorio", 4, 2);
    if (dec("catraca")) this.posto(dec("catraca"), ctx["fl-catraca-posto"] === "liberada");
    if (dec("eua")) this.cais(dec("eua"));
    if (ctx["flag:final.tom"]) this.praca(ctx);
  }

  /** A plateia da praça reage: pulinhos de aplauso (todos, alguns ou quase ninguém). */
  aplaudir(nivel: "fila" | "dividido" | "nenhum") {
    if (this.calmo) return;
    this.gente.forEach((g, i) => {
      if (nivel === "nenhum" && i % 4) return;
      if (nivel === "dividido" && i % 2) return;
      this.scene.time.delayedCall(i * 70, () => g.hop(nivel === "fila" ? 16 : 10));
    });
  }

  private placa(x: number, y: number, texto: string, bg: string, color: string, depth: number, size = 10) {
    const t = this.scene.add
      .text(x, y, texto, { fontFamily: FONT, fontSize: `${size}px`, fontStyle: "900", backgroundColor: bg, color, padding: { x: 6, y: 3 }, align: "center", resolution: 2.5 })
      .setOrigin(0.5)
      .setDepth(depth);
    this.objs.push(t);
    this.registra(t, { x: x - 220, y: y - 24, w: 440, h: 48 });
    return t;
  }

  /** Placa da decisão logo abaixo da porta do prédio. */
  private naPorta(predio: string, texto: [string, string, string] | undefined) {
    const b = buildingById(predio);
    if (!b || !texto) return;
    const d = doorPoint(b);
    this.placa(d.x, d.y + 30, texto[0], texto[1], texto[2], d.y + 32, 9);
  }

  /** Uma fila de moradores parada na porta, olhando para ela. */
  private filaNaPorta(predio: string, n: number, deslocamento: number) {
    const b = buildingById(predio);
    if (!b) return;
    const d = doorPoint(b);
    for (let i = 0; i < n; i++) {
      const p = PLATEIA[(i * 3 + deslocamento) % PLATEIA.length];
      const w = new Walker(this.scene, p.look, d.x + 70 + (i % 2 ? 10 : -10), d.y + 46 + i * 34);
      w.setFacing("back");
      w.root.setDepth(w.y);
      this.registra(w.root, { x: w.x - 30, y: w.y - 90, w: 60, h: 100 });
      this.gente.push(w);
    }
  }

  /** O chicote entregue fica pendurado ao lado da porta da Fábrica Feliz, de enfeite. */
  private chicoteNaPorta() {
    const b = buildingById("fl-ind-fabrica");
    if (!b) return;
    const d = doorPoint(b);
    const base = b.y + b.d;
    const img = this.scene.add.image(d.x + 86, base - 40, "chicote").setOrigin(0.5, 1).setScale(0.9 / RES.small).setDepth(base + 3);
    this.objs.push(img);
    this.registra(img, { x: d.x + 40, y: base - 110, w: 100, h: 110 });
  }

  /**
   * Posto: a fachada já diz se a catraca cobra ou está liberada (o lugar desenha isso). Com a catraca
   * cobrando, o artigo 2º ganha placa própria, e quem mandou cobrar ganha a fila comum na calçada.
   */
  private posto(decisao: string, liberada: boolean) {
    if (liberada) return;
    if (decisao === "artigo") this.naPorta("fl-com-posto", ["ART. 2º EM VIGOR: IDOSO NÃO PAGA A CATRACA", "#2f9e5a", "#fffaf0"]);
    if (decisao === "cobrou") this.filaNaPorta("fl-com-posto", 3, 4);
  }

  /** Cais: o que aconteceu com a caixa do Brasil, ao lado da esteira. */
  private cais(decisao: string) {
    const belt = PROPS.find((p) => p.kind === "esteira");
    if (!belt) return;
    const x = belt.x + 190;
    const y = belt.y - 6;
    if (decisao !== "embarcou") {
      const caixa = this.scene.add.image(x, y, "brasil-caixa").setOrigin(0.5, 1).setScale(1.25 / RES.small).setDepth(y);
      this.objs.push(caixa);
      this.registra(caixa, { x: x - 50, y: y - 80, w: 100, h: 90 });
    }
    const texto = {
      embarcou: ["BRASIL · EMBARCADO PARA OS EUA, COM LAÇO", "#2f6fd6", "#fffaf0"],
      devolveu: ["BRASIL DEVOLVIDO AO ARMAZÉM · NÃO ESTÁ À VENDA", "#2f9e5a", "#fffaf0"],
      "caixa-vazia": ["CAIXA VAZIA EMBARCADA · O BRASIL FICOU", "#1e1424", "#ffd23f"],
    }[decisao];
    if (texto) this.placa(x, y - 62, texto[0], texto[1], texto[2], y + 2, 9);
  }

  /** Praça do Desfile: faixa sobre o palanque, cadeado na Moto da Pátria, o decreto e a plateia que sobra. */
  private praca(ctx: Record<string, string>) {
    const flags: Record<string, string> = {};
    for (const k of ["tom", "proc", "voto"]) flags[`final.${k}`] = ctx[`flag:final.${k}`] ?? "";
    const marcas = marcasDaPracaFlavio(flags);
    const pal = PROPS.find((p) => p.id === "fl-civ-palanque");
    const mon = PROPS.find((p) => p.id === "fl-civ-monumento");
    if (!marcas || !pal) return;
    if (mon) {
      const cadeado = this.scene.add.text(mon.x, mon.y - 150, "🔐", { fontFamily: FONT, fontSize: "40px", resolution: 2 }).setOrigin(0.5, 1).setDepth(mon.y + 4);
      this.objs.push(cadeado);
      this.registra(cadeado, { x: mon.x - 40, y: mon.y - 200, w: 80, h: 60 });
      if (!this.calmo) this.scene.tweens.add({ targets: cadeado, y: cadeado.y - 6, duration: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }
    // a faixa fica acima de quem discursa; o decreto e a senha, na frente do palanque
    this.placa(pal.x, pal.y - 205, marcas.faixa, "#1e1424", "#ffd23f", pal.y + 1, 10);
    this.placa(pal.x, pal.y + 44, `${marcas.decreto}\n${marcas.senha}`, "#1f6f43", "#fffaf0", pal.y + 46, 9);
    // a plateia que ficou, dos dois lados do palanque: obediente virada para quem discursa, ignorada virada
    // para a rua (e a feira), mista metade e metade
    const tom = ctx["flag:final.tom"];
    PLATEIA.forEach((p, i) => {
      if (tom === "ignorado" && i % 2) return;
      if (tom === "misto" && i % 3 === 2) return;
      const w = new Walker(this.scene, p.look, pal.x + p.dx, pal.y + p.dy);
      if (tom === "obediencia" || (tom === "misto" && i % 2)) w.setFacing("side", p.dx > 0);
      else w.setFacing("front");
      w.root.setDepth(w.y);
      this.registra(w.root, { x: w.x - 30, y: w.y - 90, w: 60, h: 100 });
      this.gente.push(w);
    });
  }
}
