import type * as Phaser from "phaser";
import { sound } from "@/lib/sound";
import type { LookId } from "../../../looks";
import { CORES_MOTOCIATA } from "../../bake";
import { Car } from "../../Car";

/**
 * Motociata: no Brasil do Flávio, subir numa moto chama a turma. Os motoqueiros entram em fila
 * atrás do protagonista, seguindo exatamente o caminho que ele fez (então nunca atravessam prédio),
 * em duas colunas levemente desencontradas. Ao descer, eles param, buzinam uma última vez e somem.
 * São só enfeite: não colidem com nada nem atrapalham o trânsito.
 */

const PILOTOS: LookId[] = ["motoqueiro", "m2", "m4", "func1", "m8"];
/** Distância (em px de caminho) entre um motoqueiro e o seguinte. */
const ESPACO = 46;
/** A trilha guarda um ponto a cada este tanto de deslocamento. */
const PASSO = 6;

interface Seguidor {
  moto: Car;
  /** Deslocamento lateral na fila (duas colunas). */
  lado: number;
  alpha: number;
}

export class Motociata {
  private seguidores: Seguidor[] = [];
  private trilha: { x: number; y: number }[] = [];
  private lider: Car | null = null;
  private dispersaEm = 0;

  constructor(
    private scene: Phaser.Scene,
    private calmo: boolean,
  ) {}

  /** O protagonista subiu numa moto: a turma chega por trás, já em fila. */
  comeca(lider: Car) {
    this.limpa();
    this.lider = lider;
    this.dispersaEm = 0;
    const c = Math.cos(lider.angle);
    const s = Math.sin(lider.angle);
    // trilha inicial: uma reta atrás da moto do protagonista
    this.trilha = [];
    const n = Math.ceil((ESPACO * (PILOTOS.length + 1)) / PASSO);
    for (let i = n; i >= 0; i--) this.trilha.push({ x: lider.x - c * i * PASSO, y: lider.y - s * i * PASSO });
    PILOTOS.forEach((look, i) => {
      const lado = i % 2 ? 11 : -11;
      const moto = new Car(this.scene, lider.x, lider.y, lider.angle, CORES_MOTOCIATA[(i + 1) % CORES_MOTOCIATA.length], "moto");
      moto.setDriver(look);
      this.seguidores.push({ moto, lado, alpha: 0 });
    });
    this.posiciona(0);
    sound.ronco();
  }

  /** O protagonista desceu: a fila para e se desfaz em alguns segundos. */
  termina(agora: number) {
    this.lider = null;
    this.dispersaEm = agora + 2200;
    if (this.seguidores.length) this.scene.time.delayedCall(500, () => sound.fomfom());
  }

  /** Buzina da motociata: o protagonista buzinou, a fila responde. */
  buzina() {
    if (!this.seguidores.length) return;
    this.seguidores.slice(0, 3).forEach((_, i) => this.scene.time.delayedCall(160 + i * 140, () => sound.fomfom()));
  }

  get ativa() {
    return !!this.lider;
  }

  update(dt: number, agora: number) {
    if (!this.seguidores.length) return;
    if (this.lider) {
      const ult = this.trilha[this.trilha.length - 1];
      const d = Math.hypot(this.lider.x - ult.x, this.lider.y - ult.y);
      if (d >= PASSO) {
        // completa a trilha em passos iguais, mesmo se a moto andou muito num quadro
        const k = Math.floor(d / PASSO);
        for (let i = 1; i <= k; i++) this.trilha.push({ x: ult.x + ((this.lider.x - ult.x) * i) / k, y: ult.y + ((this.lider.y - ult.y) * i) / k });
        const max = Math.ceil((ESPACO * (PILOTOS.length + 2)) / PASSO);
        if (this.trilha.length > max) this.trilha.splice(0, this.trilha.length - max);
      }
      this.posiciona(dt);
      for (const f of this.seguidores) f.alpha = Math.min(1, f.alpha + dt * 3);
    } else {
      // parados: diminuem até zerar e, depois do tempo, somem
      for (const f of this.seguidores) {
        f.moto.speed *= Math.max(0, 1 - dt * 3);
        if (agora > this.dispersaEm) f.alpha = Math.max(0, f.alpha - dt * 1.5);
      }
    }
    for (const f of this.seguidores) {
      f.moto.root.setAlpha(f.alpha);
      f.moto.render(dt);
    }
    if (!this.lider && this.seguidores.every((f) => f.alpha <= 0)) this.limpa();
  }

  /** Cada motoqueiro fica num ponto da trilha, atrás do anterior, olhando para onde a trilha vai. */
  private posiciona(dt: number) {
    const ult = this.trilha.length - 1;
    this.seguidores.forEach((f, i) => {
      const idx = Math.max(1, ult - Math.round((ESPACO * (i + 1)) / PASSO));
      const p = this.trilha[idx];
      const q = this.trilha[Math.min(ult, idx + 2)];
      const ang = Math.atan2(q.y - p.y, q.x - p.x);
      const ok = Number.isFinite(ang) && (q.x !== p.x || q.y !== p.y);
      const a = ok ? ang : f.moto.angle;
      const nx = p.x - Math.sin(a) * f.lado;
      const ny = p.y + Math.cos(a) * f.lado;
      const vx = dt > 0 ? Math.hypot(nx - f.moto.x, ny - f.moto.y) / dt : 0;
      f.moto.x = nx;
      f.moto.y = ny;
      f.moto.angle = a;
      f.moto.speed = this.calmo ? 0 : Math.min(400, vx);
    });
  }

  private limpa() {
    for (const f of this.seguidores) f.moto.root.destroy();
    this.seguidores = [];
  }

  destroy() {
    this.limpa();
    this.lider = null;
  }
}
