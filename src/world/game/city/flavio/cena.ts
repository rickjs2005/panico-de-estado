import * as Phaser from "phaser";
import { CITY, LIMITS, PROPS } from "../../../cidade";
import type { CityBuilding, CityProp } from "../../../cidade/types";
import type { Point, Rect } from "../../../types";
import { INK } from "../../art";
import { RES } from "../../bake";

/**
 * Desenhos de cena que só existem no Brasil do Flávio: as bordas do mapa (serra, rio, mar e mata),
 * os lugares com estado (a catraca do posto e o embarque para os EUA) e as árvores da reserva que,
 * à noite, se juntam para escrever "NÃO". A cena da cidade chama isto no lugar do equivalente do Lula.
 */

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

type Registra = (o: Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Visible, bounds: Rect) => void;

/** Serra com casinhas e letreiro ao norte, rio a oeste, mar com o navio dos EUA ao sul e a mata a leste. */
export function desenhaBordasFlavio(scene: Phaser.Scene, registra: Registra, agua: Phaser.GameObjects.TileSprite[]) {
  const L = LIMITS as Record<"serra" | "rio" | "mar" | "mata", Rect>;
  const ts = 1 / RES.tile;
  const rio = scene.add.tileSprite(L.rio.x, L.rio.y, L.rio.w, L.rio.h, "tile:agua").setOrigin(0).setTileScale(ts).setDepth(-95);
  const mar = scene.add.tileSprite(L.mar.x, L.mar.y, L.mar.w, L.mar.h, "tile:agua").setOrigin(0).setTileScale(ts).setDepth(-95);
  agua.push(rio, mar);
  registra(rio, L.rio);
  registra(mar, L.mar);

  const rail = scene.add.graphics().setDepth(-70);
  rail.lineStyle(3, 0xeae5d9, 1);
  rail.lineBetween(L.rio.w + 2, 150, L.rio.w + 2, L.mar.y);
  rail.lineBetween(L.rio.w, L.mar.y - 2, L.mata.x, L.mar.y - 2);
  rail.lineStyle(1.5, 0x8a8494, 1);
  for (let y = 170; y < L.mar.y; y += 18) rail.lineBetween(L.rio.w - 2, y, L.rio.w + 6, y);

  // serra: picos mais altos que o morro do Lula, verde mais escuro
  for (let x0 = 0; x0 < CITY.w; x0 += 1200) {
    const g = scene.add.graphics().setDepth(-60);
    for (let x = x0 - 60; x < x0 + 1260; x += 110) {
      const h = 80 + Math.abs(Math.sin(x * 0.011)) * 70;
      g.fillStyle(0x2f7f45, 1);
      g.fillTriangle(x - h, 150, x, 150 - h * 1.2, x + h, 150);
      g.fillStyle(0x3c9555, 1);
      g.fillTriangle(x - h * 0.55, 150, x + 10, 150 - h * 0.8, x + h * 0.7, 150);
    }
    g.fillStyle(0x6a5a4a, 1);
    g.fillRect(x0, 140, 1200, 12);
    registra(g, { x: x0 - 200, y: -200, w: 1600, h: 360 });
  }
  for (let i = 0; i < 46; i++) {
    const x = 90 + ((i * 211) % 4560);
    const y = 50 + ((i * 37) % 80);
    if (Math.abs(x - 2400) < 420) continue;
    const img = scene.add.image(x, y, `casinha:${i % 6}`).setScale(1 / RES.prop).setDepth(-55 + y / 1000);
    registra(img, { x: x - 20, y: y - 20, w: 40, h: 40 });
  }
  const letreiro = scene.add
    .text(2400, 70, "BRASIL HIPOTÉTICO", { fontFamily: FONT, fontSize: "64px", fontStyle: "900", color: "#fffaf0", stroke: INK, strokeThickness: 8, resolution: 1.5 })
    .setOrigin(0.5)
    .setDepth(-50);
  registra(letreiro, { x: 2000, y: 20, w: 800, h: 110 });
  const fic = scene.add
    .text(2400, 122, "ficção satírica · ordem e progresso (e taxa)", { fontFamily: FONT, fontSize: "18px", fontStyle: "700", color: "#fffaf0", stroke: INK, strokeThickness: 5, resolution: 1.5 })
    .setOrigin(0.5)
    .setDepth(-50);
  registra(fic, { x: 2000, y: 100, w: 800, h: 40 });

  // mata a leste: copas em camadas e placas na beira
  for (let y0 = 0; y0 < L.mar.y; y0 += 900) {
    const g = scene.add.graphics().setDepth(-70);
    g.fillStyle(0x245c34, 1);
    g.fillRect(L.mata.x, y0, L.mata.w, Math.min(900, L.mar.y - y0));
    for (let y = y0 + 10; y < Math.min(y0 + 900, L.mar.y); y += 46) {
      for (let x = L.mata.x + 18; x < CITY.w; x += 44) {
        const r = 22 + Math.abs(Math.sin(x * 0.07 + y * 0.03)) * 10;
        g.fillStyle(0x2f7a43, 1);
        g.fillCircle(x + ((y / 46) % 2) * 20, y, r);
        g.fillStyle(0x3f9b55, 1);
        g.fillCircle(x + ((y / 46) % 2) * 20 - 6, y - 6, r * 0.55);
      }
    }
    registra(g, { x: L.mata.x - 40, y: y0 - 40, w: L.mata.w + 80, h: 980 });
  }
  for (const [y, t] of [
    [700, "MATA NATIVA"],
    [1800, "ALUGA-SE (DIZEM)"],
    [2900, "FIM DO MAPA"],
  ] as const) {
    const txt = scene.add
      .text(L.mata.x + 60, y, t, { fontFamily: FONT, fontSize: "20px", fontStyle: "900", color: "#ffd23f", stroke: INK, strokeThickness: 5, resolution: 1.5 })
      .setOrigin(0.5)
      .setAngle(90)
      .setDepth(-69);
    registra(txt, { x: L.mata.x, y: y - 160, w: 130, h: 320 });
  }

  const navio = scene.add.image(3960, 3610, "navio-eua").setOrigin(0.5, 1).setScale(1 / RES.big).setDepth(-60);
  registra(navio, { x: 3580, y: 3420, w: 760, h: 200 });
  scene.tweens.add({ targets: navio, y: 3614, duration: 1800, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
}

/** À noite, as árvores da reserva florestal se juntam para escrever "NÃO" (a resposta delas à placa de aluga-se). */
export function criaNaoDaReserva(scene: Phaser.Scene, registra: Registra): Phaser.GameObjects.Text | null {
  const placa = PROPS.find((p) => p.id === "fl-ter-placa-aluga");
  if (!placa) return null;
  const t = scene.add
    .text(4110, 2790, "NÃO", { fontFamily: FONT, fontSize: "170px", fontStyle: "900", color: "#3f9b55", stroke: "#1d4a2b", strokeThickness: 14, resolution: 1 })
    .setOrigin(0.5)
    .setAlpha(0)
    .setDepth(2950);
  registra(t, { x: 3780, y: 2660, w: 660, h: 260 });
  return t;
}

/** Utilitários de desenho que a cena empresta para redesenhar um lugar. */
export interface CtxLugar {
  scene: Phaser.Scene;
  b: CityBuilding;
  d: Point;
  facadeBottom: number;
  signAt: (x: number, y: number, text: string, bg: string, color: string, size?: number) => Phaser.GameObjects.Text;
  propImg: (kind: CityProp["kind"], x: number, y: number, variant?: string, solid?: boolean) => Phaser.GameObjects.Image;
  keep: <T extends Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Visible>(o: T, bounds: Rect) => T;
  tweens: Phaser.Tweens.Tween[];
}

/** Redesenha um lugar do Brasil do Flávio conforme o estado salvo. Devolve false se o lugar não for desta cidade. */
export function desenhaLugarFlavio(c: CtxLugar, id: string, state: string, animated: boolean): boolean {
  const { scene, b, d, facadeBottom } = c;
  if (id === "fl-catraca-posto") {
    if (state === "cobrando") {
      c.signAt(d.x, facadeBottom - b.h - 14, "CATRACA: R$ 5 POR ENTRADA", "#b5452b", "#fff4ce", 10);
      const cat = c.propImg("catraca", d.x + 52, facadeBottom + 34, undefined, false);
      if (animated) c.tweens.push(scene.tweens.add({ targets: cat, y: { from: cat.y - 60, to: cat.y }, duration: 500, ease: "Bounce.easeOut" }));
    } else {
      c.signAt(d.x, facadeBottom - b.h - 14, "ATENDIMENTO LIBERADO · CATRACA DESLIGADA", "#1f8a4c", "#fffaf0", 10);
    }
    return true;
  }
  if (id === "fl-terminal-eua") {
    const belt = PROPS.find((p) => p.kind === "esteira");
    if (!belt) return true;
    if (state === "em-operacao") {
      for (let k = 0; k < 4; k++) {
        const box = scene.add.image(belt.x - 140, belt.y - 30, "brasil-caixa").setScale(0.7 / RES.small).setDepth(belt.y + 1);
        c.keep(box, { x: belt.x - 170, y: belt.y - 80, w: 340, h: 90 });
        c.tweens.push(scene.tweens.add({ targets: box, x: belt.x + 140, duration: 4000, delay: k * 1000, repeat: -1 }));
      }
      c.signAt(belt.x, belt.y - 92, "EMBARQUE: BRASIL → EUA · EM OPERAÇÃO", "#2f6fd6", "#fffaf0", 10);
      const crane = PROPS.find((p) => p.kind === "guindaste");
      if (crane) {
        const hook = scene.add.graphics().setDepth(crane.y + 1);
        hook.lineStyle(2, 0x55555c, 1);
        hook.lineBetween(0, 0, 0, 70);
        hook.fillStyle(0x2f6fd6, 1);
        hook.fillRect(-26, 70, 52, 22);
        hook.setPosition(crane.x + 80, crane.y - 175);
        c.keep(hook, { x: crane.x - 40, y: crane.y - 200, w: 200, h: 140 });
        c.tweens.push(scene.tweens.add({ targets: hook, angle: { from: -8, to: 8 }, duration: 1400, yoyo: true, repeat: -1, ease: "Sine.easeInOut" }));
      }
    } else {
      c.signAt(belt.x, belt.y - 92, "EMBARQUE SUSPENSO · O ADESIVO ENTALOU", "#55555c", "#fff4ce", 11);
    }
    return true;
  }
  return false;
}
