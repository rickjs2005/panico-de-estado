import type { Beat, CharacterId, Mood, PropId, Sfx, StageX } from "./types";

/**
 * Atalhos para escrever cenas de forma curta e legível:
 *
 *   say("lula", "Vim fechar a igreja.", "fala")
 *   enter("fiscal", 92, { from: "right", holding: "formulario" })
 */

export const say = (who: CharacterId, text: string, mood?: Mood): Beat => ({ t: "say", who, text, mood });
export const nar = (text: string): Beat => ({ t: "narrate", text });
export const pause = (ms = 600): Beat => ({ t: "pause", ms });
export const sfx = (name: Sfx): Beat => ({ t: "sfx", name });
export const set = (key: string, value: string | null): Beat => ({ t: "set", key, value });
export const mood = (who: CharacterId, m: Mood): Beat => ({ t: "mood", who, mood: m });
export const react = (moods: Record<CharacterId, Mood>): Beat => ({ t: "react", moods });
export const hold = (who: CharacterId, item: PropId | null): Beat => ({ t: "hold", who, item });
export const move = (who: CharacterId, x: StageX): Beat => ({ t: "move", who, x });
export const exit = (who: CharacterId, to: "left" | "right" = "right"): Beat => ({ t: "exit", who, to });
export const phone = (from: string, text: string): Beat => ({ t: "phone", from, text });

export const enter = (
  who: CharacterId,
  x: StageX,
  opts: { from?: "left" | "right"; mood?: Mood; holding?: PropId; flip?: boolean; scale?: number } = {},
): Beat => ({ t: "enter", who, x, ...opts });
