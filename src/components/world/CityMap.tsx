"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { bus, worldState } from "@/world/bridge";
import { BUILDINGS, CITY, DISTRICTS, INTERIORS, LIMITS, POIS, ROADS } from "@/world/cidade";
import { readCity } from "@/world/cidade/progress";
import type { Poi, PoiKind } from "@/world/cidade/types";

const ICON: Record<PoiKind, string> = {
  marco: "⭐",
  governo: "🏛️",
  comercio: "🛒",
  servico: "🔧",
  educacao: "🎓",
  industria: "🏭",
  terminal: "🚢",
  praca: "🌳",
  cachaca: "🍶",
  estacionamento: "🅿️",
};

/** Área mostrada no mapa (a cidade sem as bordas de água e morro). */
const VIEW = { x: 90, y: 110, w: CITY.w - 180, h: 3420 - 110 + 60 };

/**
 * Mapa da cidade: distritos, ruas, prédios, lugares descobertos, a posição do Lula
 * e o destino marcado. Clicar no mapa ou escolher um lugar da lista marca o destino.
 */
export default function CityMap({ onClose }: { onClose: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [discovered, setDiscovered] = useState<string[]>([]);
  const [waypoint, setWaypoint] = useState(worldState.waypoint);
  const pos = { x: worldState.x, y: worldState.y, inside: worldState.inside };
  const insideRoom = INTERIORS.find((i) => i.name === pos.inside);
  const here = insideRoom ? (() => {
    const b = BUILDINGS.find((x) => x.id === insideRoom.building)!;
    return { x: b.x + b.w * (b.door ?? 0.5), y: b.y + b.d + 16 };
  })() : pos;

  useEffect(() => setDiscovered(readCity().discovered), []);

  const visible = useMemo(() => POIS.filter((p) => p.landmark || discovered.includes(p.id)), [discovered]);
  const byDistrict = useMemo(
    () => DISTRICTS.map((d) => ({ d, pois: visible.filter((p) => p.district === d.id).sort((a, b) => a.name.localeCompare(b.name, "pt-BR")) })),
    [visible],
  );

  const mark = (w: { x: number; y: number; label: string } | null) => {
    setWaypoint(w);
    bus.emit("waypoint", w);
  };

  const onMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const m = svg.getScreenCTM();
    if (!m) return;
    const w = pt.matrixTransform(m.inverse());
    const near = visible
      .map((p) => ({ p, d: Math.hypot(p.x - w.x, p.y - w.y) }))
      .sort((a, b) => a.d - b.d)[0];
    if (near && near.d < 140) mark({ x: near.p.x, y: near.p.y, label: near.p.name });
    else mark({ x: Math.round(w.x), y: Math.round(w.y), label: "Ponto marcado no mapa" });
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-[#0b0b0f]/85 p-2 text-[#1e1424] sm:p-4" role="dialog" aria-label="Mapa da cidade">
      <div className="mb-2 flex items-center gap-2">
        <p className="rounded-lg border-[3px] border-[#1e1424] bg-[#fffaf0] px-3 py-1 text-sm font-black shadow-[0_3px_0_#1e1424]">
          Mapa · Brasil hipotético do Lula
        </p>
        <p className="hidden text-xs font-semibold text-bone/80 sm:block">Toque no mapa ou num lugar da lista para marcar o destino. M ou Esc fecha.</p>
        <button type="button" onClick={onClose} className="hud-btn ml-auto" aria-label="Fechar mapa">
          ✕
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 sm:flex-row">
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border-4 border-[#1e1424] bg-[#3f8fd2]">
          <svg
            ref={svgRef}
            viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
            preserveAspectRatio="xMidYMid meet"
            className="h-full w-full cursor-crosshair"
            onClick={onMapClick}
            role="img"
            aria-label="Mapa da cidade com distritos, ruas e lugares"
          >
            <rect x={LIMITS.canal.w} y={LIMITS.morro.h} width={LIMITS.muro.x - LIMITS.canal.w} height={LIMITS.baia.y - LIMITS.morro.h} fill="#d9d4ca" />
            <rect x={0} y={0} width={CITY.w} height={LIMITS.morro.h} fill="#3f9b4a" />
            <rect x={LIMITS.muro.x} y={0} width={LIMITS.muro.w} height={LIMITS.baia.y} fill="#c9b8a0" />
            {DISTRICTS.map((d) => (
              <rect key={d.id} x={d.area.x} y={d.area.y} width={d.area.w} height={d.area.h} fill={d.color} fillOpacity={0.22} />
            ))}
            {ROADS.map((r) => (
              <rect key={r.id} x={r.rect.x} y={r.rect.y} width={r.rect.w} height={r.rect.h} fill={r.kind === "avenida" ? "#45454f" : "#6b6b78"} />
            ))}
            {BUILDINGS.map((b) => (
              <rect key={b.id} x={b.x} y={b.y} width={b.w} height={b.d} fill={b.wall} stroke="#1e1424" strokeWidth={6} />
            ))}
            {DISTRICTS.map((d) => (
              <text
                key={d.id}
                x={d.area.x + d.area.w / 2}
                y={d.area.y + d.area.h / 2}
                textAnchor="middle"
                fontSize={110}
                fontWeight={900}
                fill="#1e1424"
                fillOpacity={0.55}
                stroke="#fffaf0"
                strokeWidth={10}
                paintOrder="stroke"
              >
                {d.name}
              </text>
            ))}
            {ROADS.filter((r) => r.kind === "avenida").map((r) => {
              const horiz = r.rect.w > r.rect.h;
              const x = horiz ? r.rect.x + r.rect.w * 0.18 : r.rect.x + r.rect.w / 2;
              const y = horiz ? r.rect.y + r.rect.h / 2 : r.rect.y + r.rect.h * 0.6;
              return (
                <text key={r.id} x={x} y={y + 22} textAnchor="middle" fontSize={64} fontWeight={800} fill="#ffd23f" transform={horiz ? undefined : `rotate(-90 ${x} ${y})`}>
                  {r.name}
                </text>
              );
            })}
            {visible.map((p) => (
              <g key={p.id} transform={`translate(${p.x} ${p.y})`}>
                <circle r={58} fill="#fffaf0" stroke="#1e1424" strokeWidth={8} />
                <text y={24} textAnchor="middle" fontSize={64}>
                  {ICON[p.kind]}
                </text>
              </g>
            ))}
            {waypoint && (
              <g transform={`translate(${waypoint.x} ${waypoint.y})`}>
                <path d="M0 0 V-190" stroke="#1e1424" strokeWidth={14} />
                <path d="M0 -190 L120 -150 L0 -110 Z" fill="#ffd23f" stroke="#1e1424" strokeWidth={10} />
              </g>
            )}
            <g transform={`translate(${here.x} ${here.y})`}>
              <circle r={95} fill="#c62835" fillOpacity={0.25}>
                <animate attributeName="r" values="70;120;70" dur="1.6s" repeatCount="indefinite" />
              </circle>
              <circle r={52} fill="#c62835" stroke="#fffaf0" strokeWidth={14} />
              <text y={-80} textAnchor="middle" fontSize={70} fontWeight={900} fill="#fffaf0" stroke="#1e1424" strokeWidth={12} paintOrder="stroke">
                {insideRoom ? `Você (no ${insideRoom.name})` : "Você"}
              </text>
            </g>
          </svg>
        </div>
        <aside className="max-h-[38vh] min-h-0 overflow-y-auto rounded-xl border-4 border-[#1e1424] bg-[#fffaf0] p-2 sm:max-h-none sm:w-60 lg:w-72">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-black">
              Lugares conhecidos: {visible.length}/{POIS.length}
            </p>
            {waypoint && (
              <button type="button" className="rounded-lg border-2 border-[#1e1424] px-2 py-0.5 text-xs font-bold" onClick={() => mark(null)}>
                Limpar destino
              </button>
            )}
          </div>
          {byDistrict.map(({ d, pois }) => (
            <section key={d.id} className="mb-2">
              <h3 className="mb-1 rounded px-1.5 py-0.5 text-[11px] font-black uppercase tracking-wide text-white" style={{ background: d.color }}>
                {d.name}
              </h3>
              <ul className="space-y-0.5">
                {pois.map((p: Poi) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => mark({ x: p.x, y: p.y, label: p.name })}
                      className={`flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-xs font-semibold hover:bg-[#ffd23f]/40 focus-visible:bg-[#ffd23f]/60 ${waypoint?.label === p.name ? "bg-[#ffd23f]" : ""}`}
                    >
                      <span aria-hidden>{ICON[p.kind]}</span>
                      <span>{p.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <p className="mt-2 text-[10px] leading-snug text-[#1e1424]/70">Lugares menores aparecem aqui depois que você passa por eles. As placas CACHAÇA · ENERGIA recarregam a corrida.</p>
        </aside>
      </div>
    </div>
  );
}
