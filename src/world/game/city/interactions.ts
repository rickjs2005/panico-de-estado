import * as Phaser from "phaser";
import { sound } from "@/lib/sound";
import type { InteractionSpot } from "../../cidade/types";
import type { Npc } from "../Npc";
import type { Walker } from "../Walker";
import type { InteriorView, PropImage } from "./interior";

/**
 * Interações ambientais dos interiores. Os comportamentos são reaproveitados por tipo
 * (sentar, ligar, abrir, tocar, examinar…) e respondem dentro do mundo: animação,
 * mudança de estado, som e uma frase curta, sem abrir janelas.
 *
 * Estados ligados/desligados ficam guardados durante a visita à cidade (sessão),
 * então a TV continua ligada se o jogador sair e voltar.
 */

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

export interface SpotContext {
  scene: Phaser.Scene;
  view: InteriorView;
  player: Walker;
  say: (text: string, ms?: number) => void;
  npcSay: (n: Npc, text: string) => void;
  /** Estados ligados/desligados por objeto. */
  toggles: Map<string, boolean>;
  /** Contador por interação, para alternar as frases. */
  counters: Map<string, number>;
  /** Quando a pessoa se senta ou deita. */
  seat: (spot: InteractionSpot, pose: "sentado" | "deitado") => void;
  /** Muda o estado de um lugar: salva, redesenha a rua e refaz o interior onde o jogador está. */
  changePlace: (place: string, state: string) => void;
}

const DEFAULT_LINES: Partial<Record<InteractionSpot["kind"], string[]>> = {
  examinar: ["Interessante. E um pouco coletivo demais."],
  livro: ["Página 1: “Era uma vez um áudio de 3 minutos…”"],
  computador: ["O sistema caiu. Foi coletivizado."],
  telefone: ["Trim-trim! Ninguém do outro lado. Só um áudio."],
};

function line(ctx: SpotContext, spot: InteractionSpot): string | null {
  const lines = spot.lines ?? DEFAULT_LINES[spot.kind];
  if (!lines?.length) return null;
  const n = ctx.counters.get(spot.id) ?? 0;
  ctx.counters.set(spot.id, n + 1);
  return lines[n % lines.length];
}

function prop(ctx: SpotContext, spot: InteractionSpot): PropImage | undefined {
  return spot.prop ? ctx.view.props.get(spot.prop) : undefined;
}

/** Sacudida rápida do objeto. */
function wobble(ctx: SpotContext, p: PropImage | undefined, amount = 5, times = 3) {
  if (!p) return;
  ctx.scene.tweens.add({ targets: p.img, angle: { from: -amount, to: amount }, duration: 70, yoyo: true, repeat: times, onComplete: () => p.img.setAngle(0) });
}

/** Pulinho e volta (abrir, apertar). */
function squash(ctx: SpotContext, p: PropImage | undefined) {
  if (!p) return;
  const sy = p.img.scaleY;
  ctx.scene.tweens.add({ targets: p.img, scaleY: sy * 0.9, duration: 90, yoyo: true, onComplete: () => p.img.setScale(p.img.scaleX, sy) });
}

/** Partículas simples que sobem e somem (fumaça, vapor, notas). */
function float(ctx: SpotContext, x: number, y: number, glyphs: string[], color: string, n = 5, size = 18) {
  for (let i = 0; i < n; i++) {
    const t = ctx.scene.add
      .text(x + (Math.random() - 0.5) * 30, y, glyphs[i % glyphs.length], { fontFamily: FONT, fontSize: `${size}px`, fontStyle: "900", color, stroke: "#1e1424", strokeThickness: 3, resolution: 2 })
      .setOrigin(0.5)
      .setDepth(y + 400);
    ctx.view.objs.push(t);
    ctx.scene.tweens.add({ targets: t, y: y - 50 - Math.random() * 30, x: t.x + (Math.random() - 0.5) * 30, alpha: { from: 1, to: 0 }, duration: 900 + Math.random() * 500, delay: i * 120, onComplete: () => t.destroy() });
  }
}

/** Selo ou palavra que aparece com impacto. */
function stamp(ctx: SpotContext, x: number, y: number, text: string, color: string, bg: string) {
  const t = ctx.scene.add
    .text(x, y, text, { fontFamily: FONT, fontSize: "16px", fontStyle: "900", color, backgroundColor: bg, padding: { x: 6, y: 3 }, resolution: 2.5 })
    .setOrigin(0.5)
    .setDepth(y + 500)
    .setAngle(-8)
    .setScale(2.2)
    .setAlpha(0);
  ctx.view.objs.push(t);
  ctx.scene.tweens.add({ targets: t, scale: 1, alpha: 1, duration: 160, ease: "Back.easeOut" });
  ctx.scene.tweens.add({ targets: t, alpha: 0, y: y - 16, delay: 1300, duration: 400, onComplete: () => t.destroy() });
}

/** Liga ou desliga uma tela (TV, telão, projetor) com uma imagem animada por cima. */
function screen(ctx: SpotContext, p: PropImage, on: boolean) {
  const key = `tela-${p.def.id}`;
  const old = ctx.view.objs.find((o) => o.name === key);
  old?.destroy();
  if (!on) return;
  const kind = p.def.kind;
  const scale = p.img.scaleX;
  const w = (kind === "telao" ? 204 : kind === "tv" && p.def.variant === "parede" ? 62 : 40) * scale * 1.8;
  const h = (kind === "telao" ? 70 : kind === "tv" && p.def.variant === "parede" ? 34 : 34) * scale * 1.8;
  const top = p.top + (kind === "telao" ? 10 : kind === "tv" && p.def.variant === "parede" ? 9 : 11);
  const left = p.def.x - (kind === "telao" ? 102 : kind === "tv" && p.def.variant === "parede" ? 31 : 24);
  const g = ctx.scene.add.graphics().setDepth(p.img.depth + 0.4).setName(key);
  ctx.view.objs.push(g);
  let frame = 0;
  const colors = [0x7fd1ff, 0xffd23f, 0x9be7a0, 0xff9f80];
  const paint = () => {
    if (!g.scene) return;
    frame++;
    g.clear();
    g.fillStyle(colors[frame % colors.length], 1);
    g.fillRect(left, top, w, h);
    g.fillStyle(0xffffff, 0.6);
    g.fillRect(left + 3, top + h - 9, w * (0.3 + ((frame * 7) % 10) / 20), 4);
    g.fillStyle(0x1e1424, 0.6);
    g.fillCircle(left + w * 0.3, top + h * 0.45, Math.min(w, h) * 0.18);
  };
  paint();
  const ev = ctx.scene.time.addEvent({ delay: 450, loop: true, callback: paint });
  g.once(Phaser.GameObjects.Events.DESTROY, () => ev.remove());
}

/** Rádio, jukebox, caixa de som: notas saindo enquanto estiver ligado. */
function music(ctx: SpotContext, p: PropImage | undefined, on: boolean, x: number, y: number) {
  const key = `som-${p?.def.id ?? x}`;
  ctx.view.objs.find((o) => o.name === key)?.destroy();
  if (!on) return;
  const holder = ctx.scene.add.zone(x, y, 1, 1).setName(key);
  ctx.view.objs.push(holder);
  const ev = ctx.scene.time.addEvent({ delay: 650, loop: true, callback: () => float(ctx, x, y - 30, ["♪", "♫"], ["#e63946", "#3a86ff", "#ffd23f"][Math.floor(Math.random() * 3)], 1, 20) });
  holder.once(Phaser.GameObjects.Events.DESTROY, () => ev.remove());
  if (p) {
    const tw = ctx.scene.tweens.add({ targets: p.img, scaleY: p.img.scaleY * 1.06, duration: 220, yoyo: true, repeat: -1 });
    holder.once(Phaser.GameObjects.Events.DESTROY, () => {
      tw.remove();
      p.img.setScale(p.img.scaleX, p.img.scaleX);
    });
  }
}

/** Acha o morador mais perto de um ponto. */
function nearestNpc(ctx: SpotContext, x: number, y: number, max = 260): Npc | null {
  let best: Npc | null = null;
  let bd = max;
  for (const n of ctx.view.npcs) {
    const d = Math.hypot(n.x - x, n.y - y);
    if (d < bd) {
      bd = d;
      best = n;
    }
  }
  return best;
}

/** Executa a interação e devolve por quanto tempo o jogador fica ocupado (ms). */
export function runSpot(ctx: SpotContext, spot: InteractionSpot): number {
  const p = prop(ctx, spot);
  const px = p?.def.x ?? spot.x;
  const py = p ? p.top + 10 : spot.y - 60;
  const text = line(ctx, spot);
  ctx.player.faceToward((p?.def.x ?? spot.x) - ctx.player.x, (p?.def.y ?? spot.y - 30) - ctx.player.y);
  switch (spot.kind) {
    case "sentar":
    case "deitar":
      ctx.seat(spot, spot.kind === "deitar" ? "deitado" : "sentado");
      sound.pop();
      if (text) ctx.say(text);
      return 400;
    case "tv": {
      const on = !(ctx.toggles.get(spot.prop ?? spot.id) ?? false);
      ctx.toggles.set(spot.prop ?? spot.id, on);
      if (p) screen(ctx, p, on);
      sound.chiado();
      if (on && text) ctx.say(text, 2600);
      else if (!on) ctx.say("Desligado. Economia coletiva de energia.", 1600);
      return 350;
    }
    case "radio":
    case "jukebox": {
      const on = !(ctx.toggles.get(spot.prop ?? spot.id) ?? false);
      ctx.toggles.set(spot.prop ?? spot.id, on);
      music(ctx, p, on, px, (p?.top ?? spot.y - 40) + 10);
      if (on) {
        sound.chiado();
        ctx.scene.time.delayedCall(180, () => sound.notas("radio"));
        if (text) ctx.say(text, 2600);
      } else ctx.say("Silêncio. O vizinho agradece.", 1500);
      return 350;
    }
    case "instrumento":
      sound.notas(p?.def.kind === "orgao" ? "orgao" : "violao");
      float(ctx, px, py, ["♪", "♫", "♩"], "#7b4bd1", 6, 22);
      wobble(ctx, p, 2, 4);
      if (text) ctx.say(text, 2400);
      return 700;
    case "sino":
      sound.sino();
      if (p) ctx.scene.tweens.add({ targets: p.img, angle: { from: -16, to: 16 }, duration: 260, yoyo: true, repeat: 3, ease: "Sine.easeInOut", onComplete: () => p.img.setAngle(0) });
      float(ctx, px, py, ["BLÉM", "BLÉM"], "#ffd23f", 2, 16);
      ctx.scene.cameras.main.shake(200, 0.002);
      if (text) ctx.say(text, 2200);
      return 900;
    case "geladeira":
    case "armario":
    case "caixa": {
      squash(ctx, p);
      sound.porta();
      const light = ctx.scene.add.ellipse(px, (p?.def.y ?? spot.y) - 30, 70, 50, 0xfff6c0, 0.0).setDepth((p?.def.y ?? spot.y) + 1);
      ctx.view.objs.push(light);
      ctx.scene.tweens.add({ targets: light, fillAlpha: 0.45, duration: 150, yoyo: true, hold: 900, onComplete: () => light.destroy() });
      if (spot.kind === "caixa") float(ctx, px, py, ["✦", "★", "✦"], "#ffd23f", 4, 16);
      if (text) ctx.say(text, 2800);
      return 700;
    }
    case "campainha": {
      sound.campainha();
      float(ctx, spot.x, spot.y - 50, ["PLIM!"], "#ffd23f", 1, 16);
      const n = nearestNpc(ctx, spot.x, spot.y);
      if (n) {
        n.walker.hop(10);
        n.attend(spot.x, spot.y, 2400);
        if (text) ctx.scene.time.delayedCall(350, () => ctx.npcSay(n, text));
      } else if (text) ctx.say(text, 2400);
      return 500;
    }
    case "maquina":
      sound.maquina();
      wobble(ctx, p, 3, 8);
      float(ctx, px, py, ["💨", "⚙", "💨"], "#ffffff", 4, 18);
      ctx.scene.cameras.main.shake(260, 0.0025);
      if (text) ctx.say(text, 2600);
      return 900;
    case "missao":
      sound.pop();
      squash(ctx, p);
      float(ctx, px, py, ["✦"], "#ffd23f", 2, 16);
      return 450;
    case "decreto": {
      const target = spot.setPlace;
      sound.carimbo();
      const opening = target?.state === "aberta";
      const st = spot.stamp ?? { text: opening ? "REVOGADO!" : "DECRETADO!", color: opening ? "#fffaf0" : "#fff4ce", bg: opening ? "#1f8a4c" : "#b62f3e" };
      stamp(ctx, px, py - 10, st.text, st.color, st.bg);
      ctx.scene.cameras.main.shake(120, 0.003);
      if (text) ctx.say(text, 2800);
      if (target) ctx.scene.time.delayedCall(700, () => ctx.changePlace(target.place, target.state));
      return 1200;
    }
    case "carimbo":
      sound.carimbo();
      stamp(ctx, px, py - 10, Math.random() < 0.5 ? "CARIMBADO!" : "DEFERIDO!", "#c62835", "#fff4ce");
      ctx.scene.cameras.main.shake(90, 0.003);
      if (text) ctx.say(text, 2400);
      return 600;
    case "senha": {
      sound.ping();
      if (p?.label) {
        const m = /(\d+)/.exec(p.label.text);
        const next = m ? String(Number(m[1]) + 1).padStart(m[1].length, "0") : "0001";
        p.label.setText(p.label.text.replace(/\d+/, next));
        ctx.scene.tweens.add({ targets: p.label, scale: { from: 1.4, to: 1 }, duration: 260, ease: "Back.easeOut" });
      }
      stamp(ctx, spot.x, spot.y - 70, "SENHA", "#1e1424", "#ffd23f");
      if (text) ctx.say(text, 2400);
      return 500;
    }
    case "torneira":
    case "fogao":
      sound.agua();
      float(ctx, px, py, spot.kind === "fogao" ? ["~", "≈", "~"] : ["💧", "💧"], spot.kind === "fogao" ? "#ffffff" : "#7fd1ff", 4, 18);
      squash(ctx, p);
      if (text) ctx.say(text, 2400);
      return 600;
    default:
      // examinar, livro, computador, telefone, luz, ventilador
      if (spot.kind === "telefone") sound.campainha();
      else sound.click();
      squash(ctx, p);
      float(ctx, px, py, spot.kind === "livro" ? ["📖"] : spot.kind === "computador" ? ["💻"] : spot.kind === "telefone" ? ["☎"] : ["?", "!"], "#ffd23f", spot.kind === "examinar" ? 2 : 1, 18);
      if (text) ctx.say(text, 2600);
      return 500;
  }
}

/** Restaura TVs e rádios que estavam ligados quando o jogador volta ao interior. */
export function restoreToggles(ctx: SpotContext) {
  for (const spot of ctx.view.def.spots) {
    if (!ctx.toggles.get(spot.prop ?? spot.id)) continue;
    const p = prop(ctx, spot);
    if (spot.kind === "tv" && p) screen(ctx, p, true);
    if (spot.kind === "radio" || spot.kind === "jukebox") music(ctx, p, true, p?.def.x ?? spot.x, (p?.top ?? spot.y - 40) + 10);
  }
}
