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
