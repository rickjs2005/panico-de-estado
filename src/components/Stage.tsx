"use client";

import { useEffect, useRef, useState } from "react";
import { character } from "@/game/characters";
import type { BackdropId, CharacterId, Mood, PropId } from "@/game/types";
import Backdrop, { BACKDROP_NAME } from "./Backdrops";
import Puppet from "./Puppet";

export interface Actor {
  id: CharacterId;
  x: number;
  mood: Mood;
  holding?: PropId | null;
  flip?: boolean;
  scale?: number;
  /** Animação de entrada/saída em curso. */
  anim?: "enter-left" | "enter-right" | "exit-left" | "exit-right" | null;
}

export interface Balloon {
  who: CharacterId;
  text: string;
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(360);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

export default function Stage({
  backdrop,
  scene,
  actors,
  balloon,
  caption,
  phone,
  onTap,
}: {
  backdrop: BackdropId;
  scene: Record<string, string>;
  actors: Actor[];
  balloon?: Balloon | null;
  caption?: string | null;
  phone?: { from: string; text: string } | null;
  onTap?: () => void;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const speaker = balloon ? actors.find((a) => a.id === balloon.who) : undefined;
  const base = width * 0.22;

  return (
    <div
      ref={ref}
      onClick={onTap}
      className="relative aspect-[4/3] w-full select-none overflow-hidden bg-black sm:rounded-2xl sm:border sm:border-line"
      role="group"
      aria-label={`Cena: ${BACKDROP_NAME[backdrop]}`}
    >
      <Backdrop id={backdrop} scene={scene} />

      <span className="absolute left-2 top-2 z-20 rounded bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-alarm">
        Sátira • Universo alternativo
      </span>

      {actors.map((a) => {
        const size = base * (a.scale ?? 1);
        const talking = balloon?.who === a.id;
        return (
          <div
            key={a.id}
            className={`absolute bottom-[2%] z-10 ${a.anim ? `actor-${a.anim}` : ""} actor-move`}
            style={{ left: `${a.x}%`, width: size, marginLeft: -size / 2 }}
          >
            <Puppet id={a.id} mood={a.mood} size={size} holding={a.holding} flip={a.flip} talking={talking} showName={false} />
          </div>
        );
      })}

      {caption && (
        <div className="anim-rise absolute inset-x-2 top-9 z-30 rounded-lg bg-black/85 px-3 py-2 text-center text-[15px] font-semibold italic leading-snug text-bone">
          {caption}
        </div>
      )}

      {speaker && (
        <span
          aria-hidden
          className="absolute z-20 -translate-x-1/2 rounded-full border-2 border-[#141016] bg-white px-1.5 text-xs font-black leading-4 text-[#141016]"
          style={{ left: `${speaker.x}%`, bottom: `calc(2% + ${base * (speaker.scale ?? 1) * 1.25}px)` }}
        >
          •••
        </span>
      )}

      {balloon && (
        <div
          key={balloon.text}
          className="anim-pop absolute top-[11%] z-30 w-max max-w-[64%] rounded-2xl border-[3px] border-[#141016] bg-white px-3 py-2 text-[15px] font-semibold leading-snug text-[#141016] shadow-lg"
          style={
            (speaker?.x ?? 50) < 38
              ? { left: "3%" }
              : (speaker?.x ?? 50) > 62
                ? { right: "3%" }
                : { left: "50%", transform: "translateX(-50%)" }
          }
          aria-live="polite"
        >
          <span className="block text-[11px] font-black uppercase tracking-wide text-[#c62835]">
            {character(balloon.who).name}
          </span>
          {balloon.text}
        </div>
      )}

      {phone && (
        <div key={phone.text} className="anim-drop absolute right-2 top-8 z-40 flex max-w-[60%] items-start gap-2 rounded-xl border border-line bg-panel/95 px-2 py-1.5 shadow-lg">
          <span aria-hidden>📱</span>
          <span className="min-w-0 text-left">
            <span className="block text-[10px] font-bold uppercase text-muted">{phone.from}</span>
            <span className="block text-xs leading-snug text-bone">{phone.text}</span>
          </span>
        </div>
      )}
    </div>
  );
}
