import * as Phaser from "phaser";
import type { CaoDef, Pelagem } from "../../cidade/caes";
import type { Point } from "../../types";

/**
 * Os cães da cidade: vira-latas desenhados em código que passeiam perto de casa, sentam, dormem à noite,
 * latem, fogem dos carros, correm atrás da bola e, de vez em quando (ou depois de um carinho), resolvem
 * seguir o protagonista por um tempo. Não colidem com ninguém: andam só por onde a grade de caminhada
 * deixa (`navegacao.livre`).
 */

const INK = 0x1e1424;
const CORES: Record<Pelagem, { corpo: number; escuro: number; mancha?: number }> = {
  caramelo: { corpo: 0xc98a4b, escuro: 0x8a5a3a },
  preto: { corpo: 0x2f2f38, escuro: 0x15151b },
  malhado: { corpo: 0xf2efe8, escuro: 0x8a5a3a, mancha: 0x8a5a3a },
  cinza: { corpo: 0x9a9aa4, escuro: 0x5d5d66 },
  branco: { corpo: 0xf7f4ee, escuro: 0xc9c2b8 },
};
const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

type Estado = "parado" | "andando" | "sentado" | "dormindo" | "seguindo" | "fugindo" | "bola";

export interface MundoCaes {
  livre(x: number, y: number): boolean;
  jogador: Point & { correndo: boolean; dentro: boolean };
  carros: { x: number; y: number; v: number }[];
  bolas: { id: string; x: number; y: number; v: number }[];
  /** 0 de dia, 1 no meio da noite. */
  noite: number;
  agora: number;
  visivel(x: number, y: number): boolean;
  /** Empurra uma bola (o cão chegou nela). */
  empurraBola(id: string, dx: number, dy: number, forca: number): void;
  latido(x: number, y: number): void;
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

export class Cao {
  readonly root: Phaser.GameObjects.Container;
  private corpo: Phaser.GameObjects.Container;
  private pose: Phaser.GameObjects.Container;
  private rabo: Phaser.GameObjects.Graphics;
  private pernas: Phaser.GameObjects.Graphics[] = [];
  private olho: Phaser.GameObjects.Graphics;
  private olhoFechado: Phaser.GameObjects.Graphics;
  private estado: Estado = "parado";
  private alvo: Point | null = null;
  private ate = 0;
  private fase = 0;
  private t = Math.random() * 10;
  private olhando = 1;
  private seguirAte = 0;
  private proximaChance = 0;
  private proximaLatida = 0;
  private bolaId: string | null = null;
  private ultimoZ = 0;
  x: number;
  y: number;

  constructor(
    private scene: Phaser.Scene,
    readonly def: CaoDef,
    private calmo: boolean,
  ) {
    this.x = def.x;
    this.y = def.y;
    const cor = CORES[def.pelagem];
    const sombra = scene.add.graphics();
    sombra.fillStyle(0x000000, 0.18);
    sombra.fillEllipse(0, 0, 30, 8);
    const perna = (px: number, escura: boolean) => {
      const g = scene.add.graphics();
      g.fillStyle(escura ? cor.escuro : cor.corpo, 1);
      g.lineStyle(1.3, INK, 1);
      g.fillRoundedRect(-1.6, 0, 3.4, 9, 1.2);
      g.strokeRoundedRect(-1.6, 0, 3.4, 9, 1.2);
      g.setPosition(px, -9);
      return g;
    };
    // pernas de trás (mais escuras) atrás do corpo, as da frente na frente
    const trasA = perna(-9, true);
    const frenteA = perna(6, true);
    const trasB = perna(-6, false);
    const frenteB = perna(9, false);
    this.pernas = [trasA, frenteA, trasB, frenteB];
    this.rabo = scene.add.graphics();
    this.rabo.lineStyle(3.4, INK, 1);
    this.rabo.beginPath();
    this.rabo.moveTo(0, 0);
    this.rabo.lineTo(-5, -5);
    this.rabo.lineTo(-7, -11);
    this.rabo.strokePath();
    this.rabo.lineStyle(2, cor.escuro, 1);
    this.rabo.beginPath();
    this.rabo.moveTo(0, 0);
    this.rabo.lineTo(-5, -5);
    this.rabo.lineTo(-7, -11);
    this.rabo.strokePath();
    this.rabo.setPosition(-13, -17);
    const tronco = scene.add.graphics();
    tronco.fillStyle(cor.corpo, 1);
    tronco.lineStyle(1.6, INK, 1);
    tronco.fillEllipse(0, -15, 30, 14);
    tronco.strokeEllipse(0, -15, 30, 14);
    if (cor.mancha) {
      tronco.fillStyle(cor.mancha, 1);
      tronco.fillCircle(-5, -17, 4);
      tronco.fillCircle(4, -13, 3);
    }
    const cabeca = scene.add.container(14, -23);
    const cab = scene.add.graphics();
    cab.fillStyle(cor.corpo, 1);
    cab.lineStyle(1.6, INK, 1);
    cab.fillCircle(0, 0, 7);
    cab.strokeCircle(0, 0, 7);
    cab.fillEllipse(6, 2.5, 8, 6);
    cab.strokeEllipse(6, 2.5, 8, 6);
    cab.fillStyle(INK, 1);
    cab.fillCircle(9.6, 1.6, 1.6);
    // orelha caída e coleira
    cab.fillStyle(cor.escuro, 1);
    cab.fillTriangle(-5, -4, 0, -6, -4, 4);
    cab.lineStyle(1.2, INK, 1);
    cab.strokeTriangle(-5, -4, 0, -6, -4, 4);
    const coleira = Phaser.Display.Color.HexStringToColor(def.coleira).color;
    cab.fillStyle(coleira, 1);
    cab.fillRect(-6, 4, 6, 3);
    this.olho = scene.add.graphics();
    this.olho.fillStyle(INK, 1);
    this.olho.fillCircle(2.6, -1.6, 1.3);
    this.olhoFechado = scene.add.graphics();
    this.olhoFechado.lineStyle(1.2, INK, 1);
    this.olhoFechado.lineBetween(1.2, -1.4, 4, -1.4);
    this.olhoFechado.setVisible(false);
    cabeca.add([cab, this.olho, this.olhoFechado]);
    this.pose = scene.add.container(0, 0, [trasA, frenteA, this.rabo, tronco, trasB, frenteB, cabeca]);
    this.corpo = scene.add.container(0, 0, [this.pose]);
    this.root = scene.add.container(def.x, def.y, [sombra, this.corpo]).setDepth(def.y).setScale(1.2);
  }

  get nome() {
    return this.def.nome;
  }

  /** Carinho: corações, pulinho, latido feliz, e ele resolve seguir por um tempo. */
  carinho(agora: number) {
    this.estado = "seguindo";
    this.seguirAte = agora + 25000;
    this.olhoFechado.setVisible(false);
    this.olho.setVisible(true);
    this.alvo = null;
    for (let i = 0; i < (this.calmo ? 1 : 3); i++) {
      const t = this.scene.add.text(this.x + rnd(-10, 10), this.y - 40, "❤", { fontFamily: FONT, fontSize: "16px", color: "#e63946", stroke: "#1e1424", strokeThickness: 3, resolution: 2 }).setOrigin(0.5).setDepth(this.y + 40);
      this.scene.tweens.add({ targets: t, y: t.y - (this.calmo ? 0 : 30), alpha: 0, delay: i * 140, duration: 900, onComplete: () => t.destroy() });
    }
    if (!this.calmo) this.scene.tweens.add({ targets: this.corpo, y: -8, duration: 140, yoyo: true });
  }

  private latir(m: MundoCaes) {
    this.proximaLatida = m.agora + rnd(7000, 16000);
    if (!m.visivel(this.x, this.y)) return;
    m.latido(this.x, this.y);
    const t = this.scene.add.text(this.x + this.olhando * 20, this.y - 44, "Au!", { fontFamily: FONT, fontSize: "13px", fontStyle: "900", color: "#1e1424", backgroundColor: "#fffaf0", padding: { x: 4, y: 1 }, resolution: 2 }).setOrigin(0.5).setDepth(this.y + 40);
    this.scene.tweens.add({ targets: t, y: t.y - (this.calmo ? 0 : 12), alpha: 0, delay: 500, duration: 500, onComplete: () => t.destroy() });
  }

  private novoPasseio(m: MundoCaes) {
    const longe = Math.hypot(this.x - this.def.x, this.y - this.def.y) > 240;
    for (let k = 0; k < 8; k++) {
      const a = longe ? Math.atan2(this.def.y - this.y, this.def.x - this.x) + rnd(-0.5, 0.5) : rnd(0, Math.PI * 2);
      const d = rnd(40, 150);
      const p = { x: this.x + Math.cos(a) * d, y: this.y + Math.sin(a) * d };
      if (m.livre(p.x, p.y)) {
        this.alvo = p;
        this.estado = "andando";
        return;
      }
    }
    this.estado = "parado";
    this.ate = m.agora + 1500;
  }

  /** Anda até o alvo; devolve true se chegou ou ficou preso. */
  private anda(dt: number, vel: number, m: MundoCaes): boolean {
    if (!this.alvo) return true;
    const dx = this.alvo.x - this.x;
    const dy = this.alvo.y - this.y;
    const d = Math.hypot(dx, dy);
    if (d < 6) return true;
    const passo = Math.min(d, vel * dt);
    const nx = this.x + (dx / d) * passo;
    const ny = this.y + (dy / d) * passo;
    if (Math.abs(dx) > 2) this.olhando = dx > 0 ? 1 : -1;
    if (m.livre(nx, ny)) {
      this.x = nx;
      this.y = ny;
    } else if (m.livre(nx, this.y)) this.x = nx;
    else if (m.livre(this.x, ny)) this.y = ny;
    else return true;
    this.fase += passo * 0.35;
    return false;
  }

  update(dt: number, m: MundoCaes) {
    const agora = m.agora;
    const j = m.jogador;
    const dj = j.dentro ? Infinity : Math.hypot(j.x - this.x, j.y - this.y);
    let vel = 0;

    // carro passando perto: foge latindo
    if (this.estado !== "fugindo" && this.estado !== "dormindo") {
      const carro = m.carros.find((c) => c.v > 30 && Math.hypot(c.x - this.x, c.y - this.y) < 70);
      if (carro) {
        const a = Math.atan2(this.y - carro.y, this.x - carro.x);
        this.alvo = { x: this.x + Math.cos(a) * 90, y: this.y + Math.sin(a) * 90 };
        this.estado = "fugindo";
        this.ate = agora + 1100;
        this.latir(m);
      }
    }
    // bola rolando por perto: corre atrás
    if (this.estado === "parado" || this.estado === "andando" || this.estado === "sentado") {
      const bola = m.bolas.find((b) => b.v > 45 && Math.hypot(b.x - this.x, b.y - this.y) < 260);
      if (bola && Math.random() < 0.6) {
        this.estado = "bola";
        this.bolaId = bola.id;
        this.ate = agora + 7000;
      }
    }
    // noite: volta para perto de casa e dorme (a não ser que esteja acompanhando o protagonista)
    if (m.noite > 0.55 && (this.estado === "parado" || this.estado === "andando" || this.estado === "sentado")) {
      if (Math.hypot(this.x - this.def.x, this.y - this.def.y) > 40) {
        this.alvo = { x: this.def.x, y: this.def.y };
        this.estado = "andando";
      } else this.estado = "dormindo";
    }
    if (this.estado === "dormindo" && m.noite < 0.4) this.estado = "parado";
    // o protagonista passou perto: às vezes o cão resolve ir junto
    if (dj < 90 && agora > this.proximaChance && this.estado !== "seguindo" && this.estado !== "dormindo" && this.estado !== "fugindo") {
      this.proximaChance = agora + 15000;
      if (Math.random() < this.def.sociavel) {
        this.estado = "seguindo";
        this.seguirAte = agora + rnd(12000, 20000);
      }
    }

    switch (this.estado) {
      case "fugindo":
        vel = 150;
        if (this.anda(dt, vel, m) || agora > this.ate) {
          this.estado = "parado";
          this.ate = agora + 1200;
        }
        break;
      case "bola": {
        const b = m.bolas.find((x) => x.id === this.bolaId);
        if (!b || agora > this.ate || (b.v < 12 && Math.hypot(b.x - this.x, b.y - this.y) < 20)) {
          this.estado = "parado";
          this.ate = agora + rnd(800, 2000);
          break;
        }
        this.alvo = { x: b.x, y: b.y };
        vel = 130;
        if (Math.hypot(b.x - this.x, b.y - this.y) < 16) {
          const a = Math.atan2(b.y - this.y, b.x - this.x) + rnd(-0.6, 0.6);
          m.empurraBola(b.id, Math.cos(a), Math.sin(a), rnd(70, 140));
          if (agora > this.proximaLatida) this.latir(m);
        } else this.anda(dt, vel, m);
        break;
      }
      case "seguindo":
        if (dj > 600 || agora > this.seguirAte) {
          this.estado = "parado";
          this.ate = agora + 1500;
          break;
        }
        if (dj > 62) {
          const lado = this.x < j.x ? -1 : 1;
          this.alvo = { x: j.x + lado * 38, y: j.y + 8 };
          vel = j.correndo ? 140 : dj > 160 ? 120 : 80;
          this.anda(dt, vel, m);
        } else this.olhando = j.x > this.x ? 1 : -1;
        break;
      case "andando":
        vel = 46;
        if (this.anda(dt, vel, m)) {
          this.estado = Math.random() < 0.3 ? "sentado" : "parado";
          this.ate = agora + (this.estado === "sentado" ? rnd(3000, 7000) : rnd(1200, 4000));
        }
        break;
      case "dormindo":
        break;
      default:
        if (agora > this.ate) this.novoPasseio(m);
    }
    if (dj < 220 && agora > this.proximaLatida && this.estado !== "dormindo" && Math.random() < 0.004) this.latir(m);

    // desenho
    const vis = m.visivel(this.x, this.y);
    this.root.setVisible(vis);
    if (!vis) return;
    this.t += dt;
    this.root.setPosition(this.x, this.y).setDepth(this.y);
    this.corpo.setScale(this.olhando, 1);
    const sentado = this.estado === "sentado";
    const dormindo = this.estado === "dormindo";
    this.pose.setAngle(sentado ? -16 : 0);
    this.pose.setScale(1, dormindo ? 0.72 : 1);
    this.olho.setVisible(!dormindo);
    this.olhoFechado.setVisible(dormindo);
    const movendo = vel > 0 && !dormindo;
    const s = Math.sin(this.fase);
    this.pernas.forEach((p, i) => {
      p.setVisible(!dormindo && !(sentado && i % 2 === 0));
      p.setRotation(movendo ? (i % 2 ? s : -s) * 0.55 : 0);
    });
    if (!this.calmo) this.pose.setY(movendo ? -Math.abs(s) * 1.6 : 0);
    // o rabo abana mais rápido perto do protagonista
    const feliz = this.estado === "seguindo" || dj < 120;
    const amp = dormindo ? 0 : this.calmo ? 8 : feliz ? 26 : 12;
    this.rabo.setAngle(Math.sin(this.t * (feliz ? 18 : 6)) * amp);
    if (dormindo && !this.calmo && this.t - this.ultimoZ > 2.6) {
      this.ultimoZ = this.t;
      const z = this.scene.add.text(this.x + 8 * this.olhando, this.y - 30, "z", { fontFamily: FONT, fontSize: "12px", fontStyle: "900", color: "#fffaf0", stroke: "#1e1424", strokeThickness: 3, resolution: 2 }).setOrigin(0.5).setDepth(this.y + 40);
      this.scene.tweens.add({ targets: z, y: z.y - 22, x: z.x + 8, alpha: 0, duration: 1600, onComplete: () => z.destroy() });
    }
  }

  destroy() {
    this.root.destroy();
  }
}

export class Matilha {
  readonly caes: Cao[];

  constructor(scene: Phaser.Scene, defs: CaoDef[], calmo: boolean) {
    this.caes = defs.map((d) => new Cao(scene, d, calmo));
  }

  update(dt: number, m: MundoCaes) {
    for (const c of this.caes) c.update(dt, m);
  }

  /** O cão mais perto de um ponto, dentro do raio. */
  proximo(p: Point, raio: number): Cao | null {
    let melhor: Cao | null = null;
    let d = raio;
    for (const c of this.caes) {
      const dc = Math.hypot(c.x - p.x, c.y - p.y);
      if (dc < d) {
        d = dc;
        melhor = c;
      }
    }
    return melhor;
  }

  destroy() {
    for (const c of this.caes) c.destroy();
  }
}
