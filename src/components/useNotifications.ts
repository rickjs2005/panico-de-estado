"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Notification } from "@/game/types";
import { sound } from "@/lib/sound";

export interface Toast extends Notification {
  id: number;
  /** Notificação que "invade" (resposta a ignorar o celular): fica mais tempo e com destaque. */
  urgent?: boolean;
}

const MAX_VISIBLE = 3;

/**
 * Notificações que se acumulam sozinhas. Quanto maior o pânico,
 * mais rápido chegam e mais tempo ficam na tela.
 */
export function useNotifications(pool: Notification[], panico: number, active: boolean) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [unread, setUnread] = useState(0);
  const nextId = useRef(1);
  const cursor = useRef(0);
  const panicRef = useRef(panico);
  panicRef.current = panico;

  const push = useCallback((n: Notification, urgent = false) => {
    const id = nextId.current++;
    setToasts((list) => [...list, { ...n, id, urgent }].slice(-MAX_VISIBLE));
    setUnread((u) => u + 1);
    sound.ping();
    const life = (urgent ? 7000 : 4200) + panicRef.current * 30;
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), life);
  }, []);

  useEffect(() => {
    if (!active || pool.length === 0) return;
    let timer: number;
    const schedule = () => {
      const delay = Math.max(3200, 10000 - panicRef.current * 75);
      timer = window.setTimeout(() => {
        push(pool[cursor.current % pool.length]);
        cursor.current += 1;
        schedule();
      }, delay);
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [active, pool, push]);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  return { toasts, unread, push, dismiss };
}
