"use client";

import { useRef, useState } from "react";
import { touchInput } from "@/world/bridge";

const RADIUS = 52;

/** Direcional virtual: arraste a partir do centro. Escreve direto na entrada de toque do mundo. */
export default function Joystick() {
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const active = useRef<number | null>(null);

  const move = (clientX: number, clientY: number) => {
    const el = base.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let dx = clientX - (r.left + r.width / 2);
    let dy = clientY - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy);
    if (d > RADIUS) {
      dx = (dx / d) * RADIUS;
      dy = (dy / d) * RADIUS;
    }
    touchInput.x = dx / RADIUS;
    touchInput.y = dy / RADIUS;
    setKnob({ x: dx, y: dy });
  };

  const end = () => {
    active.current = null;
    touchInput.x = 0;
    touchInput.y = 0;
    setKnob({ x: 0, y: 0 });
  };

  return (
    <div
      ref={base}
      role="application"
      aria-label="Direcional: arraste para andar ou dirigir"
      className="relative h-[136px] w-[136px] touch-none select-none rounded-full border-4 border-[#1e1424]/70 bg-white/25 backdrop-blur-[2px]"
      onPointerDown={(e) => {
        e.preventDefault();
        active.current = e.pointerId;
        move(e.clientX, e.clientY);
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // sem captura o direcional continua funcionando enquanto o dedo estiver em cima
        }
      }}
      onPointerMove={(e) => {
        if (active.current === e.pointerId) move(e.clientX, e.clientY);
      }}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[58px] w-[58px] rounded-full border-4 border-[#1e1424] bg-[#ffd23f] shadow-[0_3px_0_#1e1424]"
        style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
      />
    </div>
  );
}
