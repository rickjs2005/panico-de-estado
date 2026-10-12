"use client";

const btn =
  "flex h-11 items-center gap-1.5 rounded-full border border-line bg-panel/90 px-3 text-xs font-semibold text-bone backdrop-blur hover:border-bone/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-bone sm:text-sm";

/** Controles fixos: som e tempo extra nos desafios cronometrados. */
export default function TopControls({
  soundOn,
  onToggleSound,
  extraTime,
  onToggleTime,
}: {
  soundOn: boolean;
  onToggleSound: () => void;
  extraTime: boolean;
  onToggleTime: () => void;
}) {
  return (
    <div className="fixed right-3 top-3 z-50 flex gap-2">
      <button
        type="button"
        onClick={onToggleTime}
        aria-pressed={extraTime}
        aria-label={extraTime ? "Desligar tempo extra nos desafios" : "Ligar tempo extra nos desafios"}
        className={btn}
      >
        <span aria-hidden>⏱</span>
        <span>{extraTime ? "Tempo extra" : "Tempo normal"}</span>
      </button>
      <button
        type="button"
        onClick={onToggleSound}
        aria-pressed={soundOn}
        aria-label={soundOn ? "Desligar efeitos sonoros" : "Ligar efeitos sonoros"}
        className={btn}
      >
        <span aria-hidden>{soundOn ? "🔊" : "🔇"}</span>
        <span>{soundOn ? "Som" : "Mudo"}</span>
      </button>
    </div>
  );
}
