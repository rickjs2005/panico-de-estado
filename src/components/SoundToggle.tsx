"use client";

export default function SoundToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={on ? "Desligar efeitos sonoros" : "Ligar efeitos sonoros"}
      className="fixed right-3 top-3 z-50 flex h-11 items-center gap-2 rounded-full border border-line bg-panel/90 px-4 text-sm font-semibold text-bone backdrop-blur hover:border-bone/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-bone"
    >
      <span aria-hidden>{on ? "🔊" : "🔇"}</span>
      <span>{on ? "Som ligado" : "Som desligado"}</span>
    </button>
  );
}
