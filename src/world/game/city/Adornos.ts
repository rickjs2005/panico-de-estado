import * as Phaser from "phaser";
import { buildingById, doorPoint, PROPS } from "../../cidade";
import { marcasDaPraca } from "../../cidade/missoes/final";
import type { LookId } from "../../looks";
import type { Rect } from "../../types";
import { RES } from "../bake";
import { Walker } from "../Walker";

/**
 * Consequências das missões que aparecem na rua: o que foi feito na porta da igreja, a faixa do campus,
 * a placa do depósito, a carga no embarque e a praça depois da cerimônia final. Tudo é desenhado a partir
 * do estado da campanha (decisões `d.<missão>`) e do estado atual dos lugares, então recarregar a página
 * não desfaz nada e reabrir a igreja depois da missão muda a fachada de verdade (o selo continua seu).
 * O contexto vem de `CityScene.contextoJogo()`.
 */

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

/** Chaves do contexto que mudam o que é desenhado. */
const CHAVES = [
  "flag:d.cadeado",
  "igreja-matriz",
  "flag:d.campus",
  "flag:d.zap",
  "missao:zap",
  "flag:d.brasil",
  "flag:final.tom",
  "flag:final.proc",
  "flag:final.aplauso",
];

/** Moradores que assistem à cerimônia, por tom (olhando para o palanque ou de costas). */
const PLATEIA: { look: LookId; dx: number; dy: number }[] = [
  { look: "m1", dx: -150, dy: 96 },
  { look: "m3", dx: -90, dy: 118 },
  { look: "m5", dx: -30, dy: 102 },
  { look: "m2", dx: 40, dy: 122 },
  { look: "m6", dx: 100, dy: 100 },
  { look: "m8", dx: 156, dy: 120 },
  { look: "m4", dx: -120, dy: 150 },
  { look: "m7", dx: 70, dy: 156 },
];

export class Adornos {
  private objs: Phaser.GameObjects.GameObject[] = [];
  private gente: Walker[] = [];
  private chave = "";

  constructor(
    private scene: Phaser.Scene,
    private registra: (o: Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Visible, bounds: Rect) => void,
    /** Menos movimento: a coroa não balança e a plateia não pula. */
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
    if (dec("cadeado")) this.igreja(dec("cadeado"), ctx["igreja-matriz"] === "aberta");
    if (dec("campus")) this.campus(dec("campus"));
    if (dec("zap")) this.deposito(dec("zap"));
    if (dec("brasil")) this.embarque(dec("brasil"));
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

  /** Uma fila de moradores parada (a consequência de uma decisão que a rua percebe): olham para a porta, de costas para quem vem da rua. */
  private fila(x: number, y: number, n: number, deslocamento = 0) {
    for (let i = 0; i < n; i++) {
      const p = PLATEIA[(i * 3 + deslocamento) % PLATEIA.length];
      const w = new Walker(this.scene, p.look, x + (i % 2 ? 10 : -10), y + i * 36);
      w.setFacing("back");
      w.root.setDepth(w.y);
      this.registra(w.root, { x: w.x - 30, y: w.y - 90, w: 60, h: 100 });
      this.gente.push(w);
    }
  }

  /** O cadeado extra ao lado da porta (a imagem de interdição pequena). */
  private cadeadoExtra(x: number, base: number) {
    const lock = this.scene.add.image(x, base - 2, "interdicao").setOrigin(0.5, 1).setScale(0.55 / RES.small).setDepth(base + 3);
    this.objs.push(lock);
    this.registra(lock, { x: x - 55, y: base - 90, w: 110, h: 100 });
  }

  /**
   * Igreja Matriz: cada decisão deixa uma marca diferente na fachada. Se a igreja foi reaberta depois da
   * missão, a fachada reconhece o novo estado (o cadeado cumprido aparece como rompido).
   */
  private igreja(decisao: string, aberta: boolean) {
    const b = buildingById("civ-igreja-matriz");
    if (!b) return;
    const d = doorPoint(b);
    const base = b.y + b.d;
    const lateral = doorPoint(b, true);
    if (decisao === "cumpriu") {
      if (aberta) this.placa(d.x, base - 156, "CADEADO PRESIDENCIAL Nº 2 · ROMPIDO (IGREJA REABERTA)", "#6b6070", "#fffaf0", base + 3, 9);
      else {
        this.placa(d.x, base - 156, "CADEADO PRESIDENCIAL Nº 2 · COM COMPROVANTE", "#7a1e28", "#ffd23f", base + 3, 9);
        this.cadeadoExtra(d.x + 74, base);
        // a porta lateral vira a única entrada: fila de fiéis com senha
        this.fila(lateral.x, base + 26, 3, 1);
      }
    } else if (decisao === "sabotou") {
      this.placa(d.x, base - 156, "CADEADO DE PAPELÃO · NÃO CONTAR AO MINISTÉRIO", "#caa066", "#3b2a14", base + 3, 9);
    } else if (decisao === "brecha") {
      this.placa(d.x, base - 156, "PORTARIA Nº 7 · ENTRADA LATERAL REGULAMENTADA", "#2f6fd6", "#fffaf0", base + 3, 9);
      if (!aberta) this.cadeadoExtra(d.x + 74, base);
      // a lateral regulamentada recebe os fiéis em dois ou três de cada vez
      this.fila(lateral.x, base + 26, 2, 4);
    }
  }

  /** Universidade: faixa em frente ao prédio conforme o que foi decidido sobre a festa. */
  private campus(decisao: string) {
    const b = buildingById("edu-universidade");
    if (!b) return;
    const d = doorPoint(b);
    const texto = {
      autorizou: ["ASSEMBLEIA AUTORIZADA · PORTARIA Nº 1 (FESTA INCLUÍDA)", "#7b4bd1", "#fffaf0"],
      negociou: ["PORTARIA Nº 2 · ASSEMBLEIA ÀS 18H · FESTA ATÉ AS 22H", "#3a6b5a", "#fffaf0"],
      ignorou: ["ASSEMBLEIA SEM FESTA · ORDEM IGNORADA", "#1e1424", "#ffd23f"],
    }[decisao];
    if (texto) this.placa(d.x, d.y + 78, texto[0], texto[1], texto[2], d.y + 80, 11);
  }

  /** Depósito de Kits: placa do que foi decidido sobre os kits. */
  private deposito(decisao: string) {
    const b = buildingById("edu-deposito");
    if (!b) return;
    const d = doorPoint(b);
    const texto = {
      lacrado: ["KITS LACRADOS · NÃO ABRIR", "#6746a0", "#fff4ce"],
      desmentiu: ["ROMANEIO NA PAREDE: LÁPIS, COLA, CARTILHA", "#2f7a52", "#fffaf0"],
      boato: ["KIT DO ZAP · FILA AQUI (NINGUÉM SABE O QUÊ)", "#1e1424", "#ffd23f"],
    }[decisao];
    if (texto) this.placa(d.x, d.y + 34, texto[0], texto[1], texto[2], d.y + 36, 10);
    // o boato do kit atraiu fila na porta do depósito
    if (decisao === "boato") this.fila(d.x, d.y + 70, 4, 0);
  }

  /** Terminal: o que aconteceu com a carga, na área de embarque ao lado da esteira. */
  private embarque(decisao: string) {
    const belt = PROPS.find((p) => p.kind === "esteira");
    if (!belt) return;
    const x = belt.x + 190;
    const y = belt.y - 6;
    const caixa = this.scene.add.image(x, y, "brasil-caixa").setOrigin(0.5, 1).setScale(1.25 / RES.small).setDepth(y);
    this.objs.push(caixa);
    this.registra(caixa, { x: x - 50, y: y - 80, w: 100, h: 90 });
    const texto = {
      despachou: ["BRASIL · 1 VOLUME EMBARCADO", "#c62835", "#fffaf0"],
      trocou: ["BRASIL RETIDO · CACHAÇA EMBARCADA", "#d9a520", "#1e1424"],
      sabotou: ["BRASIL PRESO NA ESTEIRA · FRETE CANCELADO", "#1e1424", "#ffd23f"],
    }[decisao];
    if (texto) this.placa(x, y - 62, texto[0], texto[1], texto[2], y + 2, 9);
  }

  /** Praça: coroa de carimbos no monumento, faixa, decreto, formulário impossível e a plateia que sobra. */
  private praca(ctx: Record<string, string>) {
    const flags: Record<string, string> = {};
    for (const k of ["tom", "proc", "aplauso"]) flags[`final.${k}`] = ctx[`flag:final.${k}`] ?? "";
    const marcas = marcasDaPraca(flags);
    const mon = PROPS.find((p) => p.id === "civ-monumento");
    if (!marcas || !mon) return;
    const coroa = this.scene.add.text(mon.x, mon.y - 122, "👑", { fontFamily: FONT, fontSize: "46px", resolution: 2 }).setOrigin(0.5, 1).setDepth(mon.y + 4);
    this.objs.push(coroa);
    this.registra(coroa, { x: mon.x - 40, y: mon.y - 180, w: 80, h: 60 });
    if (!this.calmo) this.scene.tweens.add({ targets: coroa, y: coroa.y - 6, duration: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    const carimbo = this.scene.add.text(mon.x, mon.y - 64, "CARIMBADO", { fontFamily: FONT, fontSize: "12px", fontStyle: "900", color: "#c62835", backgroundColor: "#fffaf0", padding: { x: 5, y: 2 }, resolution: 2.5 }).setOrigin(0.5).setAngle(-10).setDepth(mon.y + 5);
    this.objs.push(carimbo);
    this.registra(carimbo, { x: mon.x - 60, y: mon.y - 90, w: 120, h: 40 });
    // a faixa fica acima da coroa, bem à vista de quem sobe ao palanque; o decreto e o formulário, no meio-fio, depois da plateia
    this.placa(mon.x, mon.y - 178, marcas.faixa, "#1e1424", "#ffd23f", mon.y + 1, 10);
    this.placa(mon.x, mon.y + 262, `${marcas.decreto}
${marcas.formulario}`, "#7a1e28", "#fffaf0", mon.y + 264, 9);
    // a plateia que ficou: obediente em fila de frente, ignorada de costas, mista metade e metade
    const tom = ctx["flag:final.tom"];
    PLATEIA.forEach((p, i) => {
      if (tom === "ignorado" && i % 2) return;
      if (tom === "misto" && i % 3 === 2) return;
      const w = new Walker(this.scene, p.look, mon.x + p.dx, mon.y + 195 + p.dy * 0.3);
      w.setFacing(tom === "obediencia" || (tom === "misto" && i % 2) ? "back" : "front");
      w.root.setDepth(w.y);
      this.registra(w.root, { x: w.x - 30, y: w.y - 90, w: 60, h: 100 });
      this.gente.push(w);
    });
  }
}
