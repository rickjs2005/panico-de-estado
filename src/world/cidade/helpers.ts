import type { CityBuilding, CityProp, DistrictId, ParkingDef, VehicleSpawn } from "./types";

/** Atalhos para escrever os distritos sem repetir medidas padrão. */

export function casa(district: DistrictId, id: string, x: number, y: number, w: number, wall: string, roof: "telha" | "laje" = "telha", extra: Partial<CityBuilding> = {}): CityBuilding {
  return { id, district, kind: "casa", x, y, w, d: 100, h: 95, wall, roof, ...extra };
}

export function loja(
  district: DistrictId,
  id: string,
  x: number,
  y: number,
  w: number,
  wall: string,
  sign: string,
  awning: [string, string],
  extra: Partial<CityBuilding> = {},
): CityBuilding {
  return { id, district, kind: "loja", x, y, w, d: 110, h: 110, wall, roof: "telha", sign, awning, ...extra };
}

/** Fileira de objetos iguais, de x0 a x1, a cada `step`. */
export function row(kind: CityProp["kind"], x0: number, x1: number, y: number, step: number, extra: Partial<CityProp> = {}): CityProp[] {
  const list: CityProp[] = [];
  for (let x = x0; x <= x1; x += step) list.push({ kind, x, y, ...extra });
  return list;
}

/** Coluna de objetos iguais, de y0 a y1. */
export function col(kind: CityProp["kind"], x: number, y0: number, y1: number, step: number, extra: Partial<CityProp> = {}): CityProp[] {
  const list: CityProp[] = [];
  for (let y = y0; y <= y1; y += step) list.push({ kind, x, y, ...extra });
  return list;
}

/** Vagas pintadas de um estacionamento: posição e direção de cada carro. */
export function stalls(p: ParkingDef): { x: number; y: number; angle: number }[] {
  const r = p.rect;
  const out: { x: number; y: number; angle: number }[] = [];
  if (p.rows === "h") {
    const n = Math.floor(r.w / 46);
    const x0 = r.x + (r.w - n * 46) / 2 + 23;
    for (let i = 0; i < n; i++) out.push({ x: x0 + i * 46, y: r.y + 40, angle: Math.PI / 2 });
    if (r.h >= 170) for (let i = 0; i < n; i++) out.push({ x: x0 + i * 46, y: r.y + r.h - 40, angle: -Math.PI / 2 });
  } else if (r.w >= r.h) {
    const n = Math.floor(r.w / 80);
    const x0 = r.x + (r.w - n * 80) / 2 + 40;
    for (let i = 0; i < n; i++) out.push({ x: x0 + i * 80, y: r.y + r.h / 2, angle: 0 });
  } else {
    const n = Math.floor(r.h / 46);
    const y0 = r.y + (r.h - n * 46) / 2 + 23;
    for (let i = 0; i < n; i++) out.push({ x: r.x + r.w / 2, y: y0 + i * 46, angle: 0 });
  }
  return out;
}

/** Carro estacionado numa vaga. */
export function parked(id: string, p: ParkingDef, index: number, color: string): VehicleSpawn {
  const s = stalls(p)[index];
  return { id, x: s.x, y: s.y, angle: s.angle, color };
}
