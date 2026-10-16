import * as Phaser from "phaser";
import { buildingById, doorPoint, PROPS } from "../../cidade";
import type { Rect } from "../../types";
import { RES } from "../bake";

/**
 * Consequências das missões que aparecem na rua: plaquinhas, o cadeado extra da igreja, a faixa
 * da assembleia autorizada, o recebimento no depósito e a caixa do Brasil na área de embarque.
 * Tudo é desenhado a partir do estado da campanha (missões concluídas e flags), então recarregar a
 * página ou reabrir a igreja não desfaz nada. O contexto vem de `Missoes.contexto()`.
 */

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

export class Adornos {
  private objs: Phaser.GameObjects.GameObject[] = [];
  private chave = "";

  constructor(
    private scene: Phaser.Scene,
    private registra: (o: Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Visible, bounds: Rect) => void,
  ) {}

  atualiza(ctx: Record<string, string>) {
    const k = ["missao:cadeado", "flag:cadeado.segunda", "missao:campus", "missao:zap", "missao:brasil"].map((x) => ctx[x] ?? "").join("|");
    if (k === this.chave) return;
    this.chave = k;
    for (const o of this.objs) o.destroy();
    this.objs = [];
    if (ctx["missao:cadeado"] === "concluida") this.igreja(ctx["flag:cadeado.segunda"] === "sim");
    if (ctx["missao:campus"] === "concluida") this.campus();
    if (ctx["missao:zap"] === "concluida") this.deposito();
    if (ctx["missao:brasil"] === "concluida") this.embarque();
  }

  private placa(x: number, y: number, texto: string, bg: string, color: string, depth: number, size = 10) {
    const t = this.scene.add
      .text(x, y, texto, { fontFamily: FONT, fontSize: `${size}px`, fontStyle: "900", backgroundColor: bg, color, padding: { x: 6, y: 3 }, align: "center", resolution: 2.5 })
      .setOrigin(0.5)
      .setDepth(depth);
    this.objs.push(t);
    this.registra(t, { x: x - 160, y: y - 24, w: 320, h: 48 });
    return t;
  }

  /** Igreja: plaquinha do comprovante e, se foi segunda via, um cadeado extra ao lado da porta. */
  private igreja(segunda: boolean) {
    const b = buildingById("civ-igreja-matriz");
    if (!b) return;
    const d = doorPoint(b);
    const base = b.y + b.d;
    this.placa(d.x, base - 156, "CADEADO PRESIDENCIAL Nº 2 · COM COMPROVANTE", "#7a1e28", "#ffd23f", base + 3, 9);
    if (segunda) {
      const lock = this.scene.add.image(d.x + 74, base - 2, "interdicao").setOrigin(0.5, 1).setScale(0.55 / RES.small).setDepth(base + 3);
      this.objs.push(lock);
      this.registra(lock, { x: d.x + 20, y: base - 90, w: 110, h: 100 });
    }
  }

  /** Universidade: faixa da assembleia autorizada em frente ao prédio. */
  private campus() {
    const b = buildingById("edu-universidade");
    if (!b) return;
    const d = doorPoint(b);
    this.placa(d.x, d.y + 78, "ASSEMBLEIA AUTORIZADA · PORTARIA Nº 1", "#7b4bd1", "#fffaf0", d.y + 80, 11);
  }

  /** Depósito de Kits: placa de recebimento. */
  private deposito() {
    const b = buildingById("edu-deposito");
    if (!b) return;
    const d = doorPoint(b);
    this.placa(d.x, d.y + 34, "RECEBIDO: CAIXA DO ZAP ✓", "#6746a0", "#fff4ce", d.y + 36, 10);
  }

  /** Terminal: a caixa do Brasil na área de embarque, ao lado da esteira. */
  private embarque() {
    const belt = PROPS.find((p) => p.kind === "esteira");
    if (!belt) return;
    const x = belt.x + 190;
    const y = belt.y - 6;
    const caixa = this.scene.add.image(x, y, "brasil-caixa").setOrigin(0.5, 1).setScale(1.25 / RES.small).setDepth(y);
    this.objs.push(caixa);
    this.registra(caixa, { x: x - 50, y: y - 80, w: 100, h: 90 });
    this.placa(x, y - 62, "BRASIL · 1 VOLUME EMBARCADO", "#c62835", "#fffaf0", y + 2, 9);
  }
}
