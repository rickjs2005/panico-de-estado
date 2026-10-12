"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DragRound, InterruptRound, TapRound } from "@/game/types";
import { sound } from "@/lib/sound";

export type Tier = "good" | "mid" | "bad";

const bigBtn =
  "bg-accent h-14 w-full rounded-xl text-lg font-black uppercase tracking-wide text-ink transition hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-bone";

function StartButton({ label, onStart }: { label: string; onStart: () => void }) {
  return (
    <button type="button" className={bigBtn} onClick={onStart}>
      {label}
    </button>
  );
}

export function TimeBar({ left, total, label }: { left: number; total: number; label: string }) {
  const pct = Math.max(0, (left / total) * 100);
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-bold uppercase tracking-wide text-bone/80">
        <span>{label}</span>
        <span className="font-mono">{Math.ceil(left)}s</span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={Math.round(total)}
        aria-valuenow={Math.ceil(left)}
      >
        <div className={`timer-bar h-full ${pct < 30 ? "bg-siren" : "bg-alarm"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Relógio regressivo simples (atualiza 4x por segundo). */
export function useCountdown(seconds: number, running: boolean, onEnd: () => void) {
  const [left, setLeft] = useState(seconds);
  const endRef = useRef(onEnd);
  endRef.current = onEnd;
  useEffect(() => {
    if (!running) return;
    const start = performance.now();
    let lastWhole = Math.ceil(seconds);
    const id = window.setInterval(() => {
      const l = seconds - (performance.now() - start) / 1000;
      setLeft(Math.max(0, l));
      const whole = Math.ceil(l);
      if (whole !== lastWhole && whole <= 3 && whole > 0) sound.tick();
      lastWhole = whole;
      if (l <= 0) {
        window.clearInterval(id);
        endRef.current();
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [seconds, running]);
  return left;
}

/* ------------------------------------------------------------------ */
/* Tocar nas notificações antes que cubram a tela                       */
/* ------------------------------------------------------------------ */

export function TapGame({
  round,
  timeScale,
  panico,
  onDone,
}: {
  round: TapRound;
  timeScale: number;
  panico: number;
  onDone: (t: Tier, label: string) => void;
}) {
  const [phase, setPhase] = useState<"ready" | "running" | "done">("ready");
  const [items, setItems] = useState<{ id: number; from: string; text: string }[]>([]);
  const [cleared, setCleared] = useState(0);
  const nextId = useRef(0);
  const cursor = useRef(0);
  const finished = useRef(false);
  const duration = round.duration * timeScale;
  const spawnEvery = Math.max(450, round.spawnEvery * timeScale * (1 - panico / 250));

  const finish = (tier: Tier, label: string) => {
    if (finished.current) return;
    finished.current = true;
    setPhase("done");
    if (tier === "good") sound.success();
    else sound.fail();
    onDone(tier, label);
  };

  const countRef = useRef(0);
  countRef.current = items.length;

  const left = useCountdown(duration, phase === "running", () => {
    const remaining = countRef.current;
    finish(
      remaining <= 1 ? "good" : "mid",
      remaining <= 1 ? "Você segurou a avalanche" : `Sobraram ${remaining} notificações na tela`,
    );
  });

  useEffect(() => {
    if (phase !== "running") return;
    const spawn = () => {
      const src = round.items[cursor.current % round.items.length];
      cursor.current += 1;
      setItems((list) => [{ id: nextId.current++, ...src }, ...list]);
      sound.ping();
    };
    spawn();
    const id = window.setInterval(spawn, spawnEvery);
    return () => window.clearInterval(id);
  }, [phase, round.items, spawnEvery]);

  useEffect(() => {
    if (phase === "running" && items.length >= round.maxOnScreen) finish("bad", "As notificações cobriram a tela");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, phase, round.maxOnScreen]);

  if (phase === "ready") {
    return (
      <div className="space-y-3">
        <p className="text-bone/90">
          Toque em cada notificação para silenciar. Se juntar <strong>{round.maxOnScreen}</strong>, elas cobrem a tela.
        </p>
        <StartButton label="Destravar o celular" onStart={() => setPhase("running")} />
      </div>
    );
  }

  const fill = items.length / round.maxOnScreen;
  return (
    <div className="space-y-3">
      <TimeBar left={left} total={duration} label="Aguente até o fim" />
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide">
        <span className={fill >= 0.7 ? "text-siren" : "text-bone/80"}>
          Tela coberta: {items.length}/{round.maxOnScreen}
        </span>
        <span className="text-acid">Silenciadas: {cleared}</span>
      </div>
      <div
        className="relative flex min-h-[280px] flex-col gap-2 overflow-hidden rounded-2xl border-2 border-line bg-black/40 p-2"
        style={{ boxShadow: `inset 0 0 ${Math.round(fill * 60)}px rgba(255,59,79,${fill * 0.5})` }}
        aria-live="off"
      >
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            disabled={phase !== "running"}
            onClick={() => {
              sound.click();
              setItems((l) => l.filter((x) => x.id !== it.id));
              setCleared((c) => c + 1);
            }}
            className="anim-drop flex min-h-12 w-full items-start gap-2 rounded-xl border border-line bg-panel px-3 py-2 text-left hover:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-bone"
          >
            <span aria-hidden className="mt-0.5">🔔</span>
            <span className="min-w-0">
              <span className="block text-[11px] font-bold uppercase tracking-wide text-muted">{it.from}</span>
              <span className="block text-sm leading-snug">{it.text}</span>
            </span>
            <span className="ml-auto self-center text-xs font-bold text-acid">🔇</span>
          </button>
        ))}
        {items.length === 0 && phase === "running" && (
          <p className="m-auto text-sm text-muted">Silêncio… por enquanto.</p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cortar o sinal antes do trecho recortável                           */
/* ------------------------------------------------------------------ */

interface Word {
  text: string;
  danger: boolean;
}

export function parseScript(script: string): { words: Word[]; safeFrom: number; dangerFrom: number } {
  const words: Word[] = [];
  let safeFrom = 0;
  let inDanger = false;
  for (const raw of script.split(/\s+/).filter(Boolean)) {
    if (raw === "|") {
      safeFrom = words.length;
      continue;
    }
    let t = raw;
    if (t.startsWith("[")) {
      inDanger = true;
      t = t.slice(1);
    }
    const closes = t.endsWith("]") || t.endsWith("].");
    t = t.replace("]", "");
    words.push({ text: t, danger: inDanger });
    if (closes) inDanger = false;
  }
  const dangerFrom = words.findIndex((w) => w.danger);
  return { words, safeFrom, dangerFrom: dangerFrom === -1 ? words.length : dangerFrom };
}

export function InterruptGame({
  round,
  timeScale,
  onDone,
}: {
  round: InterruptRound;
  timeScale: number;
  onDone: (t: Tier, label: string) => void;
}) {
  const { words, safeFrom, dangerFrom } = useMemo(() => parseScript(round.script), [round.script]);
  const [phase, setPhase] = useState<"ready" | "running" | "done">("ready");
  const [shown, setShown] = useState(0);
  const finished = useRef(false);

  const finish = (tier: Tier, label: string) => {
    if (finished.current) return;
    finished.current = true;
    setPhase("done");
    if (tier === "good") sound.success();
    else sound.fail();
    onDone(tier, label);
  };

  useEffect(() => {
    if (phase !== "running") return;
    const id = window.setInterval(() => {
      setShown((s) => {
        const n = s + 1;
        if (n >= words.length) window.clearInterval(id);
        return Math.min(n, words.length);
      });
    }, round.msPerWord * timeScale);
    return () => window.clearInterval(id);
  }, [phase, round.msPerWord, timeScale, words.length]);

  useEffect(() => {
    if (phase === "running" && shown >= words.length) {
      const t = window.setTimeout(() => finish("bad", "Você não cortou. O trecho foi ao ar inteiro"), 400);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, phase, words.length]);

  const cut = () => {
    if (phase !== "running") return;
    sound.sting(60);
    if (shown > dangerFrom) finish("bad", "Cortou tarde: o trecho perigoso já tinha saído");
    else if (shown < safeFrom) {
      const aired = words
        .slice(Math.max(0, shown - 4), shown)
        .map((w) => w.text)
        .join(" ");
      finish("mid", `Cortou cedo demais. Foi ao ar: “…${aired}…”`);
    }
    else finish("good", "Cortou na hora exata");
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-line bg-black/60 p-3">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted">
          Teleprompter · {round.speaker}
        </p>
        <p className="text-lg leading-relaxed">
          {words.map((w, i) => {
            const said = i < shown;
            const current = i === shown - 1;
            return (
              <span
                key={i}
                className={`${said ? "text-bone" : "text-bone/35"} ${current ? "bg-accent-soft rounded" : ""} ${
                  w.danger ? "underline decoration-alarm decoration-dashed decoration-2 underline-offset-4" : ""
                }`}
              >
                {w.text}{" "}
              </span>
            );
          })}
        </p>
        <p className="mt-2 text-xs font-semibold text-alarm">
          Sublinhado = trecho que dá para tirar de contexto. Corte antes dele, mas não cedo demais.
        </p>
      </div>
      {phase === "ready" ? (
        <StartButton label="Entrar ao vivo" onStart={() => setPhase("running")} />
      ) : (
        <button
          type="button"
          onClick={cut}
          disabled={phase !== "running"}
          className="h-16 w-full rounded-xl border-4 border-siren bg-siren/20 text-xl font-black uppercase tracking-wide text-bone transition hover:bg-siren/35 focus:outline-none focus-visible:ring-4 focus-visible:ring-bone disabled:opacity-50"
        >
          ✂ Corta o sinal!
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Arrastar o boato para a lixeira (e as cópias que surgem)            */
/* ------------------------------------------------------------------ */

interface Card {
  id: number;
  label: string;
  gen: number;
}

/** Quantas cópias cada geração produz ao ir para a lixeira: 1 → 2 → 2 → acabou. */
const SPAWN_BY_GEN = [2, 1, 0];

export function DragGame({
  round,
  timeScale,
  onDone,
}: {
  round: DragRound;
  timeScale: number;
  onDone: (t: Tier, label: string) => void;
}) {
  const [phase, setPhase] = useState<"ready" | "running" | "done">("ready");
  const [cards, setCards] = useState<Card[]>([{ id: 0, label: round.rumor.text, gen: 0 }]);
  const [trashed, setTrashed] = useState(0);
  const [hot, setHot] = useState(false);
  const [drag, setDrag] = useState<{ id: number; dx: number; dy: number } | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const trashRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const copyCursor = useRef(0);
  const finished = useRef(false);
  const duration = round.duration * timeScale;

  const finish = (tier: Tier, label: string) => {
    if (finished.current) return;
    finished.current = true;
    setPhase("done");
    if (tier === "good") sound.success();
    else sound.fail();
    onDone(tier, label);
  };

  const countRef = useRef(0);
  countRef.current = cards.length;

  const left = useCountdown(duration, phase === "running", () => {
    const n = countRef.current;
    finish(n <= 2 ? "mid" : "bad", `Sobraram ${n} versões do boato`);
  });

  useEffect(() => {
    if (phase === "running" && cards.length === 0) finish("good", "Timeline limpa");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length, phase]);

  const trash = (card: Card) => {
    sound.click();
    setTrashed((t) => t + 1);
    const n = SPAWN_BY_GEN[card.gen] ?? 0;
    const spawned: Card[] = Array.from({ length: n }, () => ({
      id: nextId.current++,
      label: round.copies[copyCursor.current++ % round.copies.length],
      gen: card.gen + 1,
    }));
    if (n > 0) window.setTimeout(() => sound.ping(), 150);
    setCards((list) => [...list.filter((c) => c.id !== card.id), ...spawned]);
  };

  const overTrash = (x: number, y: number) => {
    const r = trashRef.current?.getBoundingClientRect();
    return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };

  if (phase === "ready") {
    return (
      <div className="space-y-3">
        <p className="text-bone/90">
          Arraste o boato até a lixeira (ou toque em <strong>Lixeira</strong>). Atenção: apagar um boato pode gerar prints.
        </p>
        <StartButton label="Abrir a timeline" onStart={() => setPhase("running")} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <TimeBar left={left} total={duration} label="Limpe a timeline" />
      <p className="text-xs font-bold uppercase tracking-wide text-bone/80">
        Versões em circulação: <span className={cards.length >= 3 ? "text-siren" : "text-bone"}>{cards.length}</span> ·
        Apagadas: {trashed}
      </p>
      <div className="relative flex min-h-[220px] flex-col gap-2 rounded-2xl border-2 border-line bg-black/40 p-2">
        {cards.map((c) => {
          const dragging = drag?.id === c.id;
          return (
            <div
              key={c.id}
              className={`anim-pop flex touch-none select-none items-center gap-2 rounded-xl border-2 bg-[#1b1b24] p-2 ${
                dragging ? "z-10 border-alarm shadow-2xl" : "border-line"
              }`}
              style={dragging ? { transform: `translate(${drag.dx}px, ${drag.dy}px) rotate(-3deg)` } : undefined}
              onPointerDown={(e) => {
                if ((e.target as HTMLElement).closest("button") || phase !== "running") return;
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                start.current = { x: e.clientX, y: e.clientY };
                setDrag({ id: c.id, dx: 0, dy: 0 });
              }}
              onPointerMove={(e) => {
                if (!dragging || !start.current) return;
                setDrag({ id: c.id, dx: e.clientX - start.current.x, dy: e.clientY - start.current.y });
                setHot(overTrash(e.clientX, e.clientY));
              }}
              onPointerUp={(e) => {
                if (!dragging) return;
                setDrag(null);
                setHot(false);
                if (overTrash(e.clientX, e.clientY)) trash(c);
              }}
              onPointerCancel={() => {
                setDrag(null);
                setHot(false);
              }}
            >
              <span aria-hidden className="cursor-grab text-xl">⠿</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold uppercase text-muted">
                  {c.gen === 0 ? round.rumor.from : "cópia do boato"}
                </span>
                <span className="block font-black uppercase leading-tight">[meme] {c.label}</span>
              </span>
              <button
                type="button"
                onClick={() => trash(c)}
                className="shrink-0 rounded-lg border border-line px-3 py-2 text-sm font-bold hover:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-bone"
              >
                🗑 Lixeira
              </button>
            </div>
          );
        })}
        {cards.length === 0 && <p className="m-auto text-sm text-acid">Timeline limpa!</p>}
      </div>
      <div
        ref={trashRef}
        className={`flex h-20 items-center justify-center rounded-2xl border-2 border-dashed text-lg font-black uppercase transition ${
          hot ? "border-acid bg-acid/20 text-acid" : "border-line text-bone/70"
        }`}
        aria-hidden
      >
        🗑 Lixeira
      </div>
    </div>
  );
}
