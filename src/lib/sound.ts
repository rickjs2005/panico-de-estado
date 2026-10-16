/**
 * Efeitos sonoros sintetizados com Web Audio (sem arquivos, sem dependências).
 * Tudo é baixinho e opcional: o botão de som desliga qualquer saída.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let drone: { oscs: OscillatorNode[]; gain: GainNode } | null = null;
let enabled = true;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = enabled ? 0.6 : 0;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", vol = 0.08) {
  const ac = audio();
  if (!ac || !master || !enabled) return;
  const t = ac.currentTime + start;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

export const sound = {
  setEnabled(on: boolean) {
    enabled = on;
    if (master && ctx) master.gain.setTargetAtTime(on ? 0.6 : 0, ctx.currentTime, 0.05);
  },
  /** Precisa ser chamado num clique para o navegador liberar o áudio. */
  unlock() {
    audio();
  },
  ping() {
    tone(880, 0, 0.12, "sine", 0.06);
    tone(1320, 0.09, 0.14, "sine", 0.05);
  },
  click() {
    tone(420, 0, 0.06, "triangle", 0.05);
  },
  pop() {
    tone(520, 0, 0.08, "triangle", 0.05);
    tone(780, 0.05, 0.08, "triangle", 0.04);
  },
  carimbo() {
    tone(90, 0, 0.18, "square", 0.05);
    tone(60, 0.02, 0.2, "sine", 0.08);
  },
  porta() {
    tone(70, 0, 0.5, "sawtooth", 0.035);
    tone(55, 0.1, 0.6, "sine", 0.07);
  },
  buzina() {
    tone(392, 0, 0.18, "square", 0.03);
    tone(392, 0.25, 0.25, "square", 0.03);
  },
  tick() {
    tone(1000, 0, 0.05, "square", 0.025);
  },
  /** Sino de igreja. */
  sino() {
    tone(392, 0, 1.4, "sine", 0.09);
    tone(784, 0, 0.9, "sine", 0.03);
    tone(392, 0.7, 1.4, "sine", 0.07);
  },
  /** Campainha de balcão ou de porta. */
  campainha() {
    tone(1568, 0, 0.35, "sine", 0.05);
    tone(1175, 0.18, 0.45, "sine", 0.05);
  },
  /** Chiado de TV ou rádio ligando. */
  chiado() {
    for (let i = 0; i < 6; i++) tone(200 + ((i * 431) % 900), i * 0.03, 0.05, "square", 0.012);
  },
  /** Trecho curto de música (rádio, órgão, violão). */
  notas(kind: "radio" | "orgao" | "violao" = "radio") {
    const seq = kind === "orgao" ? [262, 330, 392, 523] : kind === "violao" ? [196, 247, 294, 392] : [523, 587, 659, 523];
    const type: OscillatorType = kind === "orgao" ? "sawtooth" : kind === "violao" ? "triangle" : "square";
    seq.forEach((f, i) => tone(f, i * 0.16, kind === "orgao" ? 0.5 : 0.18, type, kind === "orgao" ? 0.02 : 0.03));
  },
  /** Máquina ligando. */
  maquina() {
    tone(80, 0, 0.6, "sawtooth", 0.04);
    tone(120, 0.15, 0.5, "square", 0.02);
  },
  /** Água ou fritura. */
  agua() {
    for (let i = 0; i < 5; i++) tone(1200 + i * 140, i * 0.05, 0.04, "sine", 0.02);
  },
  /** Mesa de som do DCE: um canal (grave, médio, agudo) num nível de 0 a 2. Quanto maior o nível, mais forte e mais cheio. */
  canal(canal: "grave" | "medio" | "agudo", nivel: number) {
    const base = canal === "grave" ? 70 : canal === "medio" ? 330 : 1250;
    const type: OscillatorType = canal === "grave" ? "sine" : canal === "medio" ? "triangle" : "square";
    const n = Math.max(0, Math.min(2, Math.round(nivel)));
    const vol = (canal === "agudo" ? 0.012 : 0.04) * (1 + n * 0.9);
    for (let i = 0; i <= n; i++) tone(base * (1 + i * 0.5), i * 0.09, 0.28, type, vol);
  },
  /** Conserto de um posto (batida, atarraxar, rangido que volta a funcionar). */
  conserto() {
    tone(180, 0, 0.1, "square", 0.05);
    tone(140, 0.14, 0.1, "square", 0.05);
    tone(520, 0.3, 0.16, "triangle", 0.05);
    tone(780, 0.42, 0.22, "triangle", 0.05);
  },
  /** Aplauso da praça: uma chuva de estalos. `forca` de 0 a 1. */
  aplauso(forca = 1) {
    const n = Math.round(8 + forca * 18);
    for (let i = 0; i < n; i++) tone(900 + ((i * 577) % 1900), i * 0.045, 0.03, "square", 0.012 * (0.4 + forca));
  },
  success() {
    tone(660, 0, 0.12, "triangle", 0.06);
    tone(880, 0.1, 0.12, "triangle", 0.06);
    tone(1320, 0.2, 0.2, "triangle", 0.05);
  },
  fail() {
    tone(330, 0, 0.18, "sawtooth", 0.03);
    tone(247, 0.16, 0.32, "sawtooth", 0.03);
  },
  sting(intensity: number) {
    // Acorde dissonante curto; mais grave quanto maior o pânico.
    const base = 220 - intensity;
    tone(base, 0, 0.6, "sawtooth", 0.025);
    tone(base * 1.06, 0, 0.6, "sawtooth", 0.02);
  },
  /** Zumbido de fundo que cresce com o pânico (0–100). */
  drone(panico: number) {
    const ac = audio();
    if (!ac || !master) return;
    if (!drone) {
      const gain = ac.createGain();
      gain.gain.value = 0;
      gain.connect(master);
      const oscs = [55, 58.3].map((f) => {
        const o = ac.createOscillator();
        o.type = "sine";
        o.frequency.value = f;
        o.connect(gain);
        o.start();
        return o;
      });
      drone = { oscs, gain };
    }
    const level = panico < 35 ? 0 : ((panico - 35) / 65) * 0.05;
    drone.gain.gain.setTargetAtTime(level, ac.currentTime, 0.8);
  },
  stopDrone() {
    if (drone && ctx) drone.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
  },
};
