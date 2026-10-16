import * as Phaser from "phaser";
import { sound } from "@/lib/sound";
import { ARESTAS, curva, pontoNaCurva, tangenteNaCurva, type Aresta, type Curva, type Grupo } from "../../cidade/ruas";
import { CORES_TRANSITO } from "../../cidade/vida";
import type { Point } from "../../types";
import { Car } from "../Car";
import type { Circle } from "../collide";

/**
 * Trânsito pelas ruas da cidade: cada carro anda na faixa da direita de um trecho de rua, escolhe
 * a saída em cada cruzamento (reto, direita ou esquerda), freia diante de qualquer obstáculo
 * (pedestre, jogador, outro carro), buzina quando fica parado e, se o bloqueio não sai do lugar,
 * ultrapassa pela esquerda. Nos cruzamentos entra um carro por vez. O movimento cai de noite: parte
 * dos carros sai de cena (longe da câmera) e volta de dia.
 */

const CRUISE = 150;
const CORNER = 70;
const ACCEL = 160;
const BRAKE = 520;
const FORA = -9999;
const TOTAL = 36;

export interface Obstacle extends Point {
  r: number;
  /** Fica parado (carro estacionado, morador na fila): vale ultrapassar. */
  still: boolean;
}

/** Quantos carros circulam a cada hora (minutos desde a meia-noite). */
export function carrosNaHora(minuto: number): number {
  const h = (((minuto % 1440) + 1440) % 1440) / 60;
  if (h >= 7 && h < 19) return TOTAL;
  if (h >= 19 && h < 22) return Math.round(TOTAL * 0.6);
  if (h >= 5 && h < 7) return Math.round(TOTAL * 0.5);
  return Math.round(TOTAL * 0.22);
}

export class TrafficCar {
  readonly car: Car;
  ativo = false;
  private edge!: Aresta;
  private s = 0;
  private next!: Aresta;
  private turn: { c: Curva; t: number } | null = null;
  private token: Grupo | null = null;
  private speed = CRUISE;
  private offset = 0;
  private blockedFor = 0;
  private overtaking = 0;
  private lastHorn = 0;
  private esperaToken = 0;
  private parado = 0;
  /** Travado por outro carro há muito tempo: finge que não o vê por um instante (desfaz o impasse). */
  private ignoraCarros = 0;

  constructor(
    scene: Phaser.Scene,
    readonly id: string,
    color: string,
  ) {
    this.car = new Car(scene, FORA, FORA, 0, color);
    this.car.root.setVisible(false);
  }

  /** Põe o carro num trecho de rua, na faixa da direita. */
  colocar(edge: Aresta, s: number) {
    this.soltaToken();
    this.edge = edge;
    this.s = Math.max(0, Math.min(edge.len, s));
    this.turn = null;
    this.next = this.escolheProxima(edge);
    this.speed = CRUISE;
    this.offset = 0;
    this.blockedFor = 0;
    this.overtaking = 0;
    this.esperaToken = 0;
    this.parado = 0;
    this.ativo = true;
    const p = this.pose();
    this.car.x = p.x;
    this.car.y = p.y;
    this.car.angle = p.angle;
  }

  tirar() {
    this.soltaToken();
    this.ativo = false;
    this.car.x = FORA;
    this.car.y = FORA;
    this.car.speed = 0;
    this.car.root.setVisible(false);
  }

  private soltaToken() {
    if (this.token && this.token.ocupante === this) this.token.ocupante = null;
    this.token = null;
  }

  private escolheProxima(de: Aresta): Aresta {
    const saidas = de.para.saidas.filter((a) => a !== de.reversa);
    const lista = saidas.length ? saidas : de.para.saidas;
    // quem está numa avenida tende a seguir nela; nas ruas pequenas a escolha é livre
    const pesos = lista.map((a) => (a.via === de.via ? 2 : 1));
    let r = Math.random() * pesos.reduce((x, y) => x + y, 0);
    for (let i = 0; i < lista.length; i++) {
      r -= pesos[i];
      if (r <= 0) return lista[i];
    }
    return lista[0];
  }

  private pose(): Point & { angle: number } {
    if (this.turn) {
      const u = Math.min(1, this.turn.t / this.turn.c.len);
      const p = pontoNaCurva(this.turn.c, u);
      return { ...p, angle: tangenteNaCurva(this.turn.c, u) };
    }
    const e = this.edge;
    return { x: e.a.x + e.dir.x * this.s, y: e.a.y + e.dir.y * this.s, angle: Math.atan2(e.dir.y, e.dir.x) };
  }

  /** O cruzamento à frente exige vez (3 ou mais ruas)? */
  private get controlado() {
    return this.edge.para.grau >= 3;
  }

  /** A faixa de saída está livre o bastante para entrar no cruzamento? */
  private saidaLivre(others: TrafficCar[]): boolean {
    // só conta quem está de fato na faixa de saída (os que esperam em outra entrada não bloqueiam)
    const p = this.next.a;
    for (const c of others) if (c !== this && c.ativo && c.naAresta(this.next) && Math.hypot(c.car.x - p.x, c.car.y - p.y) < 90) return false;
    return true;
  }

  /** Não há carro vindo de frente no mesmo trecho: dá para invadir a outra mão. */
  private contramaoLivre(others: TrafficCar[]): boolean {
    const contra = this.edge.reversa;
    for (const c of others) {
      if (c === this || !c.ativo) continue;
      if (Math.hypot(c.car.x - this.car.x, c.car.y - this.car.y) > 320) continue;
      if (c.naAresta(contra) || c.naAresta(this.edge.para.saidas.find((a) => a.via === this.edge.via && a !== contra) ?? null)) return false;
    }
    return true;
  }

  naAresta(e: Aresta | null): boolean {
    return !!e && (this.edge === e || (this.turn !== null && this.next === e));
  }

  /** `obstacles`: tudo o que pode estar na frente. Devolve true se buzinou. */
  update(dt: number, now: number, obstacles: Obstacle[], others: TrafficCar[]): boolean {
    // largou o cruzamento: libera a vez
    if (this.token && !this.turn && (this.edge.de.grupo !== this.token || (this.edge.para.grupo !== this.token && this.s > 46))) this.soltaToken();

    const here = this.pose();
    const dir = { x: Math.cos(here.angle), y: Math.sin(here.angle) };
    const look = 60 + this.speed * 0.45;
    let block: Obstacle | null = null;
    let blockDist = Infinity;
    const check = (o: Obstacle) => {
      const dx = o.x - this.car.x;
      const dy = o.y - this.car.y;
      const ahead = dx * dir.x + dy * dir.y;
      if (ahead < 10 || ahead > look + o.r) return;
      const side = Math.abs(dx * -dir.y + dy * dir.x);
      if (side > 20 + o.r) return;
      if (ahead < blockDist) {
        blockDist = ahead;
        block = o;
      }
    };
    for (const o of obstacles) if (Math.abs(o.x - this.car.x) < 260 && Math.abs(o.y - this.car.y) < 260) check(o);
    if (this.ignoraCarros > 0) this.ignoraCarros -= dt;
    else for (const c of others) if (c !== this && c.ativo && Math.abs(c.car.x - this.car.x) < 200 && Math.abs(c.car.y - this.car.y) < 200) check({ x: c.car.x, y: c.car.y, r: 16, still: c.speed < 5 });

    const faltaFim = this.turn ? 0 : this.edge.len - this.s;
    let target = this.turn || faltaFim < 70 ? CORNER : CRUISE;

    // vez no cruzamento: espera na linha de retenção até estar livre
    let esperaVez = false;
    if (!this.turn && this.controlado && this.token !== this.edge.para.grupo) {
      const no = this.edge.para.grupo;
      if (faltaFim < 85) {
        if ((!no.ocupante || !no.ocupante.ativo || no.ocupante === this) && this.saidaLivre(others)) {
          no.ocupante = this;
          this.token = no;
          this.esperaToken = 0;
        } else {
          esperaVez = true;
          target = Math.min(target, Math.max(0, faltaFim - 4) * 2.2);
          if (this.speed < 8) this.esperaToken += dt;
          // fila parada demais (travamento): entra mesmo assim
          if (this.esperaToken > 9) {
            no.ocupante = this;
            this.token = no;
            this.esperaToken = 0;
            esperaVez = false;
          }
        }
      }
    }

    let honked = false;
    if (block) {
      const b = block as Obstacle;
      const gap = blockDist - b.r - 34;
      target = gap <= 0 ? 0 : Math.min(target, gap * 2.2);
      if (this.speed < 8) {
        this.blockedFor += dt;
        if (this.blockedFor > 1.2 && now - this.lastHorn > 3500) {
          this.lastHorn = now;
          honked = true;
        }
        // obstáculo parado: ultrapassa pela esquerda, se não vier ninguém na outra mão
        if (b.still && this.blockedFor > 2.4 && !this.turn && this.contramaoLivre(others)) this.overtaking = 2.6;
      }
    } else this.blockedFor = 0;
    if (this.overtaking > 0) {
      this.overtaking -= dt;
      if (!block) target = Math.max(target, 90);
    }
    const desired = this.overtaking > 0 && !this.turn ? 44 : 0;
    this.offset += (desired - this.offset) * Math.min(1, dt * 2.2);
    if (this.speed < target) this.speed = Math.min(target, this.speed + ACCEL * dt);
    else this.speed = Math.max(target, this.speed - BRAKE * dt);

    // anda
    let ds = this.speed * dt;
    if (this.turn) {
      this.turn.t += ds;
      if (this.turn.t >= this.turn.c.len) {
        const sobra = this.turn.t - this.turn.c.len;
        this.edge = this.next;
        this.s = sobra;
        this.turn = null;
        this.next = this.escolheProxima(this.edge);
      }
    } else {
      this.s += ds;
      if (this.s >= this.edge.len) {
        if (this.controlado && this.token !== this.edge.para.grupo) {
          this.s = this.edge.len;
          ds = 0;
        } else {
          const sobra = this.s - this.edge.len;
          this.turn = { c: curva(this.edge, this.next), t: sobra };
          this.s = this.edge.len;
        }
      }
    }

    // travado por muito tempo e fora de vista: some e volta noutro lugar (quem vê não percebe)
    if (this.speed < 5 && (esperaVez || block)) this.parado += dt;
    else this.parado = 0;
    if (this.parado > 8 && !esperaVez && this.ignoraCarros <= 0) {
      this.ignoraCarros = 2.5;
      this.parado = 5;
    }

    const p = this.pose();
    const lx = Math.sin(p.angle);
    const ly = -Math.cos(p.angle);
    this.car.x = p.x + lx * this.offset;
    this.car.y = p.y + ly * this.offset;
    this.car.angle = p.angle;
    this.car.speed = this.speed;
    return honked;
  }

  /** Estado resumido para depuração. */
  debug() {
    return { id: this.id, aresta: this.edge.id, s: Math.round(this.s), len: Math.round(this.edge.len), curva: !!this.turn, proxima: this.next.id, token: this.token ? this.token.nos[0].id : null, ocupanteDoNo: (this.edge.para.grupo.ocupante as TrafficCar | null)?.id ?? null, esperaToken: +this.esperaToken.toFixed(1), parado: +this.parado.toFixed(1), bloqueado: +this.blockedFor.toFixed(1), speed: Math.round(this.speed) };
  }

  get speedNow() {
    return this.speed;
  }
  get paradoPor() {
    return this.parado;
  }
  get circles(): Circle[] {
    return this.car.circles();
  }
}

export class Traffic {
  readonly cars: TrafficCar[] = [];
  private proxima = 0;

  /** `evitar`: ponto onde ninguém aparece no começo (o jogador). */
  constructor(
    private scene: Phaser.Scene,
    minuto: number,
    evitar: Point,
  ) {
    for (let i = 0; i < TOTAL; i++) this.cars.push(new TrafficCar(scene, `transito-${i + 1}`, CORES_TRANSITO[i % CORES_TRANSITO.length]));
    const n = carrosNaHora(minuto);
    for (let i = 0; i < n; i++) this.surgir(this.cars[i], (x, y) => Math.hypot(x - evitar.x, y - evitar.y) > 380);
  }

  /** Escolhe um trecho e uma posição livre que satisfaça `ok` e coloca o carro lá. */
  private surgir(c: TrafficCar, ok: (x: number, y: number) => boolean): boolean {
    for (let k = 0; k < 40; k++) {
      const e = ARESTAS[Math.floor(Math.random() * ARESTAS.length)];
      if (e.len < 60) continue;
      const s = 20 + Math.random() * (e.len - 40);
      const x = e.a.x + e.dir.x * s;
      const y = e.a.y + e.dir.y * s;
      if (!ok(x, y)) continue;
      if (this.cars.some((o) => o !== c && o.ativo && Math.hypot(o.car.x - x, o.car.y - y) < 110)) continue;
      c.colocar(e, s);
      return true;
    }
    return false;
  }

  get ativos(): number {
    return this.cars.filter((c) => c.ativo).length;
  }

  update(dt: number, now: number, obstacles: Obstacle[], view: Phaser.Geom.Rectangle, hearing: Point | null, minuto: number) {
    const longe = (x: number, y: number, m: number) => x < view.x - m || x > view.right + m || y < view.y - m || y > view.bottom + m;
    // ajusta o volume de carros à hora, só fora da vista
    this.proxima -= dt;
    if (this.proxima <= 0) {
      this.proxima = 1.2;
      const alvo = carrosNaHora(minuto);
      const ativos = this.cars.filter((c) => c.ativo);
      if (ativos.length > alvo) {
        const sai = ativos.find((c) => longe(c.car.x, c.car.y, 420));
        if (sai) sai.tirar();
      } else if (ativos.length < alvo) {
        const entra = this.cars.find((c) => !c.ativo);
        if (entra) this.surgir(entra, (x, y) => longe(x, y, 520));
      }
      // carro travado há muito tempo e fora de vista volta noutro ponto
      for (const c of ativos) if (c.paradoPor > 14 && longe(c.car.x, c.car.y, 420)) this.surgir(c, (x, y) => longe(x, y, 520));
    }
    for (const t of this.cars) {
      if (!t.ativo) continue;
      const honked = t.update(dt, now, obstacles, this.cars);
      const near = t.car.x > view.x - 200 && t.car.x < view.right + 200 && t.car.y > view.y - 200 && t.car.y < view.bottom + 200;
      t.car.root.setVisible(near);
      if (near) t.car.render(dt);
      if (honked && hearing && Math.hypot(hearing.x - t.car.x, hearing.y - t.car.y) < 420) sound.buzina();
    }
  }
}
