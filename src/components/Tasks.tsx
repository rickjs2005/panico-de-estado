"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AssignTask, FindItem, FindTask, StepsTask } from "@/game/types";
import { sound } from "@/lib/sound";
import { PropIcon } from "./Props";

/**
 * As três mecânicas reutilizáveis. Cada uma chama `onDone(chave)` uma única vez;
 * a chave escolhe o ramo do episódio.
 *
 * - FindTaskView: tocar nos objetos de cima da pilha até achar o alvo.
 * - AssignTaskView: levar objetos a destinos (arrastar ou tocar-e-tocar).
 * - StepsTaskView: escolher qual documento apresentar a cada exigência.
 */

/* ------------------------------------------------------------------ */
/* Cronômetro com pausa                                                */
/* ------------------------------------------------------------------ */

function useTimer(seconds: number | undefined, paused: boolean, onEnd: () => void) {
  const [left, setLeft] = useState(seconds ?? 0);
  const leftRef = useRef(seconds ?? 0);
  const endRef = useRef(onEnd);
  endRef.current = onEnd;
  useEffect(() => {
    if (!seconds || paused) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      leftRef.current = Math.max(0, leftRef.current - (now - last) / 1000);
      last = now;
      setLeft(leftRef.current);
      if (leftRef.current <= 3 && leftRef.current > 0 && Math.abs(leftRef.current - Math.round(leftRef.current)) < 0.13) sound.tick();
      if (leftRef.current <= 0) {
        window.clearInterval(id);
        endRef.current();
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [seconds, paused]);
  return left;
}

function TimerBar({
  left,
  total,
  paused,
  onPause,
}: {
  left: number;
  total: number;
  paused: boolean;
  onPause: () => void;
}) {
  const pct = Math.max(0, (left / total) * 100);
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-3 flex-1 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-label="Tempo restante"
        aria-valuemin={0}
        aria-valuemax={Math.round(total)}
        aria-valuenow={Math.ceil(left)}
      >
        <div className={`timer-bar h-full ${pct < 30 ? "bg-siren" : "bg-alarm"}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right font-mono text-sm font-bold">{Math.ceil(left)}s</span>
      <button
        type="button"
        onClick={onPause}
        aria-pressed={paused}
        className="h-9 rounded-lg border border-line px-3 text-sm font-bold hover:border-bone/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-bone"
      >
        {paused ? "▶ Seguir" : "⏸ Pausar"}
      </button>
    </div>
  );
}

function Quip({ text }: { text: string | null }) {
  return (
    <p aria-live="polite" className="min-h-[2.75rem] rounded-lg bg-black/40 px-3 py-2 text-sm font-semibold leading-snug text-alarm">
      {text ?? " "}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Procurar na pilha                                                   */
/* ------------------------------------------------------------------ */

interface Placed extends FindItem {
  key: number;
  x: number;
  y: number;
  r: number;
}

/**
 * A mesa tem 12 lugares (4×3). Objetos novos caem em cima dos antigos no mesmo
 * lugar, com um pequeno deslocamento, e os cobrem. Sem Math.random na renderização.
 */
function spot(slot: number, layer: number) {
  const col = slot % 4;
  const row = Math.floor(slot / 4) % 3;
  const x = 2 + col * 24 + ((layer * 7) % 6);
  const y = 3 + row * 31 + ((layer * 5) % 6);
  const r = ((slot * 29 + layer * 13) % 24) - 12;
  return { x, y, r };
}

export function FindTaskView({
  task,
  timeScale,
  onDone,
}: {
  task: FindTask;
  timeScale: number;
  onDone: (key: string) => void;
}) {
  const counter = useRef(0);
  const layers = useRef<number[]>(Array(12).fill(0));
  const place = (it: FindItem, slot: number): Placed => {
    const layer = layers.current[slot]++;
    return { ...it, key: counter.current++, ...spot(slot, layer) };
  };
  // Os alvos começam por baixo: o lixo inicial cai exatamente em cima deles.
  const [pile, setPile] = useState<Placed[]>(() => {
    const targets = task.start.filter((i) => i.target);
    const rest = task.start.filter((i) => !i.target);
    const targetSlots = [1, 6, 8, 11].slice(0, targets.length);
    const free = Array.from({ length: 12 }, (_, i) => i).filter((i) => !targetSlots.includes(i));
    const out: Placed[] = targets.map((t, i) => place(t, targetSlots[i]));
    rest.forEach((r, i) => out.push(place(r, i < targetSlots.length ? targetSlots[i] : free[(i - targetSlots.length) % free.length])));
    return out;
  });
  const [floor, setFloor] = useState(0);
  const [quip, setQuip] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const done = useRef(false);
  const cursor = useRef(0);
  const total = task.timer ? task.timer * timeScale : undefined;

  const finish = (key: string) => {
    if (done.current) return;
    done.current = true;
    onDone(key);
  };
  const left = useTimer(total, paused, () => {
    sound.fail();
    finish("tempo");
  });

  useEffect(() => {
    if (paused || task.incoming.length === 0) return;
    const id = window.setInterval(() => {
      if (done.current) return;
      const it = task.incoming[cursor.current % task.incoming.length];
      cursor.current += 1;
      sound.pop();
      setPile((p) => [...p, place(it, (cursor.current * 5) % 12)]);
    }, task.every * timeScale);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, task, timeScale]);

  useEffect(() => {
    if (pile.length > task.collapseAt) {
      sound.fail();
      finish("desabou");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pile.length]);

  const tap = (p: Placed) => {
    if (done.current || paused) return;
    if (p.target) {
      sound.success();
      finish(p.target);
      return;
    }
    sound.click();
    setPile((list) => list.filter((x) => x.key !== p.key));
    setFloor((f) => f + 1);
    if (p.quip) setQuip(p.quip);
  };

  const fill = pile.length / task.collapseAt;

  return (
    <div className="space-y-2">
      {total && <TimerBar left={left} total={total} paused={paused} onPause={() => setPaused((v) => !v)} />}
      <div className="flex justify-between text-xs font-bold uppercase tracking-wide">
        <span className={fill > 0.75 ? "text-siren" : "text-bone/80"}>
          Mesa: {pile.length}/{task.collapseAt} {fill > 0.75 ? "· vai desabar!" : ""}
        </span>
        <span className="text-muted">No chão: {floor}</span>
      </div>
      <div
        className="relative h-64 overflow-hidden rounded-2xl border-[3px] border-[#141016] bg-[#8a5a32]"
        style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,.08) 0 2px, transparent 2px 34px)" }}
      >
        {pile.map((p, i) => (
          <button
            key={p.key}
            type="button"
            onClick={() => tap(p)}
            aria-label={p.label}
            className="anim-pop absolute flex w-[23%] flex-col items-center rounded-lg border-2 border-[#141016] bg-[#f4e7c9] p-1 shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-alarm"
            style={{ left: `${p.x}%`, top: `${p.y}%`, zIndex: i + 1, transform: `rotate(${p.r}deg)` }}
          >
            <PropIcon id={p.prop} size={48} />
            <span className="mt-0.5 line-clamp-2 text-center text-[10px] font-bold leading-tight text-[#141016]">{p.label}</span>
          </button>
        ))}
        {paused && <div className="absolute inset-0 z-[200] grid place-items-center bg-black/70 text-lg font-black">Pausado</div>}
      </div>
      <Quip text={quip} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Levar ao destino                                                    */
/* ------------------------------------------------------------------ */

/** Formas das cinco regiões para o tabuleiro "mapa" (coordenadas 0–100). */
export const REGIONS: Record<string, string> = {
  norte: "5,30 15,15 30,10 45,8 55,12 58,25 52,35 45,42 30,45 15,45 8,40",
  nordeste: "58,25 55,12 65,15 80,22 95,32 92,45 80,55 70,52 62,45 52,35",
  "centro-oeste": "30,45 45,42 52,35 62,45 70,52 65,62 55,68 45,66 35,58",
  sudeste: "70,52 80,55 78,65 70,72 60,75 55,68 65,62",
  sul: "55,68 60,75 62,82 55,92 48,88 45,78 45,66",
};

function RegionIcon({ id, size = 48 }: { id: string; size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      <polygon points={REGIONS[id]} fill="#3ddc84" stroke="#141016" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

export function AssignTaskView({
  task,
  timeScale,
  onDone,
}: {
  task: AssignTask;
  timeScale: number;
  onDone: (key: string) => void;
}) {
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [spoiled, setSpoiled] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [quip, setQuip] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null);
  const done = useRef(false);
  const total = task.timer ? task.timer * timeScale : undefined;
  const items = task.items;
  const free = items.filter((i) => !placed[i.id] && !spoiled.includes(i.id));

  const weightIn = (slot: string) =>
    items.filter((i) => placed[i.id] === slot).reduce((sum, i) => sum + (i.weight ?? 0), 0);

  const verdict = (pl: Record<string, string>, sp: string[], miss: number, timeUp: boolean) => {
    const good = items.filter((i) => pl[i.id] && (!i.goal || pl[i.id] === i.goal)).length;
    const all = good === items.length;
    if (all && miss <= (task.forgive ?? 1) && !timeUp) return "otimo";
    if (good >= Math.ceil(items.length / 2) && sp.length < items.length / 2) return "medio";
    return "ruim";
  };

  const finish = (key: string) => {
    if (done.current) return;
    done.current = true;
    if (key === "otimo") sound.success();
    else if (key === "ruim") sound.fail();
    onDone(key);
  };

  const left = useTimer(total, paused, () => finish(verdict(placed, spoiled, mistakes, true)));

  // A máquina (ou o que for) estraga um objeto livre de tempos em tempos.
  useEffect(() => {
    if (!task.spoil || paused) return;
    const id = window.setInterval(() => {
      if (done.current) return;
      setSpoiled((sp) => {
        const candidates = items.filter((i) => !sp.includes(i.id) && !placedRef.current[i.id]);
        if (candidates.length === 0) return sp;
        const victim = candidates[(sp.length * 7 + 3) % candidates.length];
        sound.carimbo();
        setQuip(`${task.spoil!.label}: “${victim.label}” agora é do Estado.`);
        if (selectedRef.current === victim.id) setSelected(null);
        return [...sp, victim.id];
      });
    }, task.spoil.every * timeScale);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, task, timeScale]);

  const placedRef = useRef(placed);
  placedRef.current = placed;
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  // Acabou quando não sobra nada livre.
  useEffect(() => {
    if (done.current) return;
    if (free.length === 0) {
      const t = window.setTimeout(() => finish(verdict(placed, spoiled, mistakes, false)), 500);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [free.length]);

  const drop = (itemId: string, slotId: string) => {
    if (done.current || paused) return;
    const it = items.find((i) => i.id === itemId);
    const slot = task.slots.find((s) => s.id === slotId);
    if (!it || !slot || placed[itemId] || spoiled.includes(itemId)) return;
    setSelected(null);
    if (it.goal && it.goal !== slotId) {
      sound.fail();
      setMistakes((m) => m + 1);
      setQuip(it.wrong ?? "Não encaixa. O objeto parece ofendido.");
      return;
    }
    if (slot.capacity !== undefined && weightIn(slotId) + (it.weight ?? 0) > slot.capacity) {
      sound.fail();
      setMistakes((m) => m + 1);
      setQuip(it.wrong ?? "Excesso de bagagem.");
      return;
    }
    sound.pop();
    setPlaced((p) => ({ ...p, [itemId]: slotId }));
    if (it.right) setQuip(it.right);
  };

  // Arrasto só começa depois de um pequeno movimento; um toque simples apenas seleciona.
  const press = useRef<{ id: string; x: number; y: number } | null>(null);

  const onPointerMove = (e: React.PointerEvent) => {
    const p = press.current;
    if (!p) return;
    if (drag || Math.hypot(e.clientX - p.x, e.clientY - p.y) > 8) setDrag({ id: p.id, x: e.clientX, y: e.clientY });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    press.current = null;
    if (!drag) return;
    const el = document.elementsFromPoint(e.clientX, e.clientY).find((n) => (n as HTMLElement).dataset?.slot);
    const id = drag.id;
    setDrag(null);
    if (el) drop(id, (el as HTMLElement).dataset.slot!);
  };

  const renderItem = (id: string) => {
    const it = items.find((i) => i.id === id)!;
    const isSel = selected === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => {
          if (drag) return;
          sound.click();
          setSelected(isSel ? null : id);
        }}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          press.current = { id, x: e.clientX, y: e.clientY };
        }}
        aria-pressed={isSel}
        className={`flex touch-none flex-col items-center rounded-xl border-2 bg-panel p-1.5 text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-bone ${
          isSel ? "border-alarm bg-alarm/15" : "border-line hover:border-bone/50"
        }`}
      >
        {task.layout === "mapa" ? <RegionIcon id={it.prop} /> : <PropIcon id={it.prop} size={44} />}
        <span className="mt-0.5 text-[11px] font-bold leading-tight">{it.label}</span>
        {it.weight !== undefined && <span className="font-mono text-[10px] text-muted">{it.weight} kg</span>}
      </button>
    );
  };

  const slotClass = (id: string) =>
    `rounded-2xl border-[3px] border-dashed p-2 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-bone ${
      selected ? "border-alarm bg-alarm/10 hover:bg-alarm/20" : "border-line bg-black/30"
    }`;

  return (
    <div className="space-y-2" onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={() => !drag && (press.current = null)}>
      {total && <TimerBar left={left} total={total} paused={paused} onPause={() => setPaused((v) => !v)} />}

      {task.layout === "mapa" ? (
        <div className="relative mx-auto aspect-square w-full max-w-[300px] rounded-2xl border-[3px] border-[#141016] bg-[#c8945a]">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
            {task.slots.map((s) => {
              const filled = items.find((i) => placed[i.id] === s.id);
              return (
                <polygon
                  key={s.id}
                  data-slot={s.id}
                  points={REGIONS[s.id]}
                  fill={filled ? "#3ddc84" : selected ? "rgba(255,210,63,.35)" : "rgba(0,0,0,.15)"}
                  stroke="#141016"
                  strokeWidth="1.2"
                  strokeDasharray={filled ? undefined : "3 2"}
                  onClick={() => selected && drop(selected, s.id)}
                  className="cursor-pointer"
                />
              );
            })}
          </svg>
          {task.slots.map((s) => (
            <button
              key={s.id}
              type="button"
              data-slot={s.id}
              onClick={() => selected && drop(selected, s.id)}
              disabled={!selected}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-bone focus:outline-none focus-visible:ring-2 focus-visible:ring-alarm"
              style={{ left: `${s.at?.x ?? 50}%`, top: `${s.at?.y ?? 50}%` }}
            >
              {s.label}
            </button>
          ))}
        </div>
      ) : (
        <div className={`grid gap-2 ${task.slots.length % 2 === 0 ? "grid-cols-2" : "grid-cols-3"}`}>
          {task.slots.map((s) => {
            const inside = items.filter((i) => placed[i.id] === s.id);
            return (
              <button
                key={s.id}
                type="button"
                data-slot={s.id}
                onClick={() => selected && drop(selected, s.id)}
                className={slotClass(s.id)}
                aria-label={`Destino: ${s.label}${selected ? ". Toque para colocar o objeto escolhido." : ""}`}
              >
                <span data-slot={s.id} className="block text-xs font-black uppercase leading-tight">
                  {s.label}
                </span>
                {s.capacity !== undefined && (
                  <span data-slot={s.id} className="mt-1 block font-mono text-[11px] text-alarm">
                    {weightIn(s.id)}/{s.capacity} kg
                  </span>
                )}
                <span data-slot={s.id} className="mt-1 flex min-h-[34px] flex-wrap gap-0.5">
                  {inside.map((i) => (
                    <PropIcon key={i.id} id={i.prop} size={28} label={i.label} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted">
        {selected ? "Agora toque no destino (ou arraste até ele)." : "Toque num objeto e depois no destino, ou arraste."}
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {free.map((i) => renderItem(i.id))}
        {items
          .filter((i) => spoiled.includes(i.id))
          .map((i) => (
            <div key={i.id} className="relative flex flex-col items-center rounded-xl border-2 border-siren/60 bg-siren/10 p-1.5 opacity-70">
              <PropIcon id={i.prop} size={44} />
              <span className="text-[11px] font-bold leading-tight line-through">{i.label}</span>
              <span className="absolute top-3 -rotate-12 rounded border-2 border-siren px-1 text-[10px] font-black text-siren">DO POVO</span>
            </div>
          ))}
      </div>
      <Quip text={quip} />
      {drag && (
        <div className="pointer-events-none fixed z-[300] -translate-x-1/2 -translate-y-1/2" style={{ left: drag.x, top: drag.y }} aria-hidden>
          {task.layout === "mapa" ? (
            <RegionIcon id={items.find((i) => i.id === drag.id)!.prop} size={64} />
          ) : (
            <PropIcon id={items.find((i) => i.id === drag.id)!.prop} size={56} />
          )}
        </div>
      )}
      {paused && <p className="text-center font-black">Pausado</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Exigências em sequência                                             */
/* ------------------------------------------------------------------ */

export function StepsTaskView({ task, onDone }: { task: StepsTask; onDone: (key: string) => void }) {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState(0);
  const [reply, setReply] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const done = useRef(false);
  const cur = task.steps[step];
  // Ordem das opções muda a cada passo, sem aleatoriedade na renderização.
  const options = useMemo(() => {
    const o = [...cur.options];
    return step % 2 ? o.reverse() : o;
  }, [cur, step]);

  const finish = (key: string) => {
    if (done.current) return;
    done.current = true;
    onDone(key);
  };

  const pick = (o: (typeof cur.options)[number]) => {
    if (locked) return;
    setReply(o.reply);
    if (o.good) {
      sound.carimbo();
      setLocked(true);
      window.setTimeout(() => {
        setLocked(false);
        setReply(null);
        if (step + 1 >= task.steps.length) finish(errors === 0 ? "otimo" : "medio");
        else setStep((s) => s + 1);
      }, 1400);
    } else {
      sound.fail();
      const e = errors + 1;
      setErrors(e);
      if (e > task.maxErrors) {
        setLocked(true);
        window.setTimeout(() => finish("travou"), 1400);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide">
        <span>
          Exigência {step + 1} de {task.steps.length}
        </span>
        <span className={errors ? "text-siren" : "text-muted"}>
          Formulários extras: {errors}/{task.maxErrors + 1}
        </span>
      </div>
      <div className="rounded-xl border-[3px] border-[#141016] bg-[#1b1b24] p-3 font-mono">
        <p className="text-[11px] text-muted">{task.asker} diz:</p>
        <p key={step} className="anim-pop text-base font-bold text-acid">
          {cur.demand}
        </p>
      </div>
      <p className="text-xs text-muted">Qual documento apresentar?</p>
      <div className="grid gap-2">
        {options.map((o) => (
          <button
            key={o.label}
            type="button"
            disabled={locked}
            onClick={() => pick(o)}
            className="flex min-h-14 items-center gap-3 rounded-2xl border-2 border-line bg-panel px-3 py-2 text-left font-semibold leading-snug transition hover:border-alarm focus:outline-none focus-visible:ring-2 focus-visible:ring-bone disabled:opacity-60"
          >
            {o.prop && <PropIcon id={o.prop} size={36} />}
            <span>{o.label}</span>
          </button>
        ))}
      </div>
      <Quip text={reply} />
    </div>
  );
}
