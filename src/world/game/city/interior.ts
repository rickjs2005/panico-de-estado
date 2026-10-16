import * as Phaser from "phaser";
import { FLAT_PROPS, interiorProps, interiorSolids, WALL_PROPS, type Solid } from "../../cidade";
import type { InteriorDef, InteriorProp } from "../../cidade/types";
import { INK, toInt } from "../art";
import { RES, tex } from "../bake";
import { Npc } from "../Npc";
import { cityPropArt } from "./cityArt";

/**
 * Um interior montado na cena. Só existe enquanto o jogador está dentro: ao sair,
 * tudo é destruído e a memória fica livre para o próximo prédio.
 */

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

export interface PropImage {
  def: InteriorProp;
  img: Phaser.GameObjects.Image;
  /** Texto pintado no objeto (painel de senha, lousa, telão). */
  label?: Phaser.GameObjects.Text;
  /** Objeto alto que fica transparente quando o jogador passa atrás. */
  tall: boolean;
  top: number;
  halfW: number;
}

interface WallView {
  x: number;
  w: number;
  bottom: number;
  face: number;
  parts: Phaser.GameObjects.Graphics[];
}

export class InteriorView {
  readonly objs: Phaser.GameObjects.GameObject[] = [];
  readonly props = new Map<string, PropImage>();
  readonly npcs: Npc[] = [];
  readonly solids: Solid[];
  private walls: WallView[] = [];
  readonly tweens: Phaser.Tweens.Tween[] = [];

  constructor(
    private scene: Phaser.Scene,
    readonly def: InteriorDef,
    places: Record<string, string>,
  ) {
    this.solids = interiorSolids(def, places);
    const r = def.room;
    const wallColor = toInt(def.wall);

    // chão: base escura (aparece sob as paredes internas) e um piso por cômodo
    const base = this.keep(scene.add.graphics().setDepth(-95));
    base.fillStyle(Phaser.Display.Color.ValueToColor(wallColor).darken(45).color, 1);
    base.fillRect(r.x, r.y, r.w, r.h);
    // o maior cômodo forra o interior inteiro (cantos e corredores); os outros vêm por cima
    const rooms = [...def.rooms].sort((a, b) => b.rect.w * b.rect.h - a.rect.w * a.rect.h);
    const floor = (x: number, y: number, w: number, h: number, room: (typeof rooms)[number]) => {
      const t = scene.add.tileSprite(x, y, w, h, `floor:${room.floor}`).setOrigin(0).setTileScale(1 / RES.tile).setDepth(-90);
      if (room.floor !== "piso-bar") t.setTint(toInt(room.tint));
      this.keep(t);
    };
    if (rooms[0]) floor(r.x, r.y + def.wallH, r.w, r.h - def.wallH, rooms[0]);
    for (const room of rooms.slice(1)) floor(room.rect.x, room.rect.y, room.rect.w, room.rect.h, room);
    for (const room of def.rooms) {
      const name = scene.add
        .text(room.rect.x + 12, room.rect.y + 6, room.name.toUpperCase(), { fontFamily: FONT, fontSize: "11px", fontStyle: "900", color: "#1e1424", resolution: 2.5 })
        .setOrigin(0, 0)
        .setAlpha(0.3)
        .setDepth(-80);
      this.keep(name);
    }

    // parede do fundo
    const wall = this.keep(scene.add.graphics().setDepth(r.y));
    wall.fillStyle(wallColor, 1);
    wall.fillRect(r.x, r.y, r.w, def.wallH);
    wall.fillStyle(0xffffff, 0.28);
    wall.fillRect(r.x, r.y, r.w, 10);
    wall.fillStyle(0x000000, 0.08);
    for (let x = r.x + 40; x < r.x + r.w; x += 80) wall.fillRect(x, r.y + 10, 2, def.wallH - 22);
    wall.fillStyle(0x000000, 0.22);
    wall.fillRect(r.x, r.y + def.wallH - 12, r.w, 12);

    // paredes internas em 3/4: tampa clara e face visível com rodapé
    for (const w of def.walls) {
      const color = toInt(w.color);
      const parts: Phaser.GameObjects.Graphics[] = [];
      const vertical = w.h > w.w;
      const draw = (x: number, y: number, ww: number, hh: number, face: boolean) => {
        const g = this.keep(scene.add.graphics().setDepth(y + hh));
        g.fillStyle(Phaser.Display.Color.ValueToColor(color).lighten(18).color, 1);
        g.fillRect(x, y - w.face, ww, hh);
        if (face) {
          g.fillStyle(color, 1);
          g.fillRect(x, y + hh - w.face, ww, w.face);
          g.fillStyle(0x000000, 0.22);
          g.fillRect(x, y + hh - 8, ww, 8);
          g.fillStyle(0xffffff, 0.25);
          g.fillRect(x, y + hh - w.face, ww, 3);
        }
        g.lineStyle(1.5, 0x1e1424, 0.55);
        g.strokeRect(x, y - w.face, ww, hh + (face ? 0 : 0));
        parts.push(g);
      };
      if (vertical) {
        // em fatias, para a ordem de desenho acompanhar quem anda ao lado
        for (let y = w.y; y < w.y + w.h; y += 16) {
          const hh = Math.min(16, w.y + w.h - y);
          draw(w.x, y, w.w, hh, y + hh >= w.y + w.h);
        }
      } else draw(w.x, w.y, w.w, w.h, true);
      this.walls.push({ x: w.x, w: w.w, bottom: w.y + w.h, face: w.face, parts });
    }

    // objetos
    for (const p of interiorProps(def, places)) this.placeProp(p);

    // cartazes na parede do fundo
    for (const p of def.posters) {
      const t = scene.add
        .text(p.x, p.y, p.text, { fontFamily: FONT, fontSize: "13px", fontStyle: "900", color: p.color, backgroundColor: p.bg, padding: { x: 8, y: 5 }, align: "center", wordWrap: { width: 260, useAdvancedWrap: true }, resolution: 2.5 })
        .setOrigin(0.5)
        .setDepth(r.y + 2);
      this.keep(t);
    }

    // moldura escura e porta de saída
    const frame = this.keep(scene.add.graphics().setDepth(r.y + r.h + 500));
    frame.fillStyle(0x1e1424, 1);
    frame.fillRect(r.x - 30, r.y - 30, 30, r.h + 60);
    frame.fillRect(r.x + r.w, r.y - 30, 30, r.h + 60);
    frame.fillRect(r.x - 30, r.y + r.h, r.w + 60, 30);
    frame.fillRect(r.x - 30, r.y - 30, r.w + 60, 30);
    // fundo escuro em volta: em telas altas a câmera mostra além do interior, e a rua não pode aparecer
    const M = 2400;
    frame.fillStyle(0x140f1c, 1);
    frame.fillRect(r.x - M, r.y - 30 - M, r.w + 2 * M, M);
    frame.fillRect(r.x - M, r.y + r.h + 30, r.w + 2 * M, M);
    frame.fillRect(r.x - M, r.y - 30, M - 30, r.h + 60);
    frame.fillRect(r.x + r.w + 30, r.y - 30, M - 30, r.h + 60);
    frame.fillStyle(0x6b4a2a, 1);
    frame.fillRect(def.exit.x - 38, r.y + r.h - 4, 76, 12);
    frame.fillStyle(0xffd23f, 1);
    frame.fillTriangle(def.exit.x - 10, r.y + r.h + 10, def.exit.x + 10, r.y + r.h + 10, def.exit.x, r.y + r.h + 22);
    const mat = this.keep(scene.add.graphics().setDepth(-70));
    mat.fillStyle(0xc62835, 1);
    mat.fillRoundedRect(def.exit.x - 30, def.exit.y - 14, 60, 20, 4);
    mat.fillStyle(0xffd23f, 1);
    mat.fillRect(def.exit.x - 22, def.exit.y - 6, 44, 3);
    this.keep(
      scene.add
        .text(def.exit.x, r.y + r.h + 26, "SAÍDA ↓ RUA", { fontFamily: FONT, fontSize: "12px", fontStyle: "900", color: "#ffd23f", resolution: 2.5 })
        .setOrigin(0.5, 0)
        .setDepth(r.y + r.h + 501),
    );

    // cachaça
    if (def.cachaca) {
      const c = def.cachaca;
      const bottle = this.keep(scene.add.image(c.x, c.y - 66, "cachaca").setScale(0.8 / RES.small).setDepth(c.y + 300));
      this.tweens.push(scene.tweens.add({ targets: bottle, angle: { from: -10, to: 10 }, duration: 700, yoyo: true, repeat: -1, ease: "Sine.easeInOut" }));
      this.keep(
        scene.add
          .text(c.x, c.y - 96, "CACHAÇA · ENERGIA", { fontFamily: FONT, fontSize: "10px", fontStyle: "900", backgroundColor: "#592b36", color: "#ffdf7d", padding: { x: 6, y: 3 }, resolution: 2.5 })
          .setOrigin(0.5)
          .setDepth(c.y + 300),
      );
    }

    for (const n of def.npcs) this.npcs.push(new Npc(scene, n));
  }

  private keep<T extends Phaser.GameObjects.GameObject>(o: T): T {
    this.objs.push(o);
    return o;
  }

  private placeProp(p: InteriorProp) {
    const art = cityPropArt(p.kind, p.variant);
    const depth = WALL_PROPS.has(p.kind) ? this.def.room.y + 1 : FLAT_PROPS.has(p.kind) ? -60 : p.y;
    const img = this.keep(this.scene.add.image(p.x, p.y, tex.prop(p.kind, p.variant)).setOrigin(0.5, art.originY).setScale(1 / RES.cityProp).setDepth(depth));
    const top = p.y - art.h * art.originY;
    const view: PropImage = { def: p, img, tall: !WALL_PROPS.has(p.kind) && art.h > 70, top, halfW: art.w / 2 };
    if (p.text) {
      const style = (size: number, color: string, wrap: number): Phaser.Types.GameObjects.Text.TextStyle => ({ fontFamily: FONT, fontSize: `${size}px`, fontStyle: "900", color, align: "center", wordWrap: { width: wrap, useAdvancedWrap: true }, resolution: 2.5 });
      let t: Phaser.GameObjects.Text | null = null;
      if (p.kind === "painelSenha") t = this.scene.add.text(p.x, top + 23, p.text, { ...style(18, "#ff4d4d", 120), fontFamily: "ui-monospace, Menlo, monospace" });
      else if (p.kind === "lousa") t = this.scene.add.text(p.x, top + 38, p.text, { ...style(12, "#f4f1ea", 180), fontFamily: '"Comic Sans MS", "Chalkboard SE", cursive' });
      else if (p.kind === "telao") t = this.scene.add.text(p.x, top + 45, p.text, style(13, "#ffd23f", 190));
      else if (p.kind === "quadroAvisos") t = this.scene.add.text(p.x - 10, top + 28, p.text, style(7, INK, 70));
      else if (p.kind === "lojinha") t = this.scene.add.text(p.x, top + 20, p.text, style(11, "#fffaf0", 150));
      if (t) {
        t.setOrigin(0.5).setDepth(depth + 0.5);
        view.label = this.keep(t);
      }
    }
    this.props.set(p.id, view);
  }

  /** Deixa paredes internas e móveis altos transparentes quando o jogador está atrás deles. */
  update(px: number, py: number, dt: number) {
    const k = Math.min(1, dt * 10);
    for (const w of this.walls) {
      const behind = px > w.x - 14 && px < w.x + w.w + 14 && py < w.bottom && py > w.bottom - w.face - 46;
      const a = behind ? 0.38 : 1;
      for (const g of w.parts) if (g.alpha !== a) g.alpha += (a - g.alpha) * k;
    }
    for (const v of this.props.values()) {
      if (!v.tall) continue;
      const behind = Math.abs(px - v.def.x) < v.halfW + 6 && py < v.def.y - 2 && py > v.top + 20;
      const a = behind ? 0.45 : 1;
      if (v.img.alpha !== a) v.img.alpha += (a - v.img.alpha) * k;
    }
  }

  destroy() {
    for (const n of this.npcs) n.walker.destroy();
    for (const t of this.tweens) t.remove();
    for (const o of this.objs) o.destroy();
    this.tweens.length = 0;
    this.objs.length = 0;
    this.props.clear();
  }
}
