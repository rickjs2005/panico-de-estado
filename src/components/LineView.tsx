import type { Line } from "@/game/types";

/** Uma linha da cena, com visual de acordo com o tipo (mensagem, manchete, meme…). */
export default function LineView({ line }: { line: Line }) {
  switch (line.tone) {
    case "system":
      return <p className="mx-auto max-w-[90%] rounded-md bg-white/5 px-3 py-1 text-center text-xs text-bone/75">{line.text}</p>;
    case "aside":
      return <p className="px-1 text-[15px] italic leading-snug text-bone/80">{line.text}</p>;
    case "fiction":
      return (
        <p className="rounded-md border border-dashed border-alarm/70 px-3 py-1.5 text-xs font-semibold text-alarm">
          ⚠ {line.text}
        </p>
      );
    case "headline":
      return (
        <div className="border-accent rounded-lg border-l-4 bg-panel px-3 py-2">
          {line.from && <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{line.from}</p>}
          <p className="text-lg font-black leading-tight">{line.text}</p>
        </div>
      );
    case "meme":
      return (
        <div className="rounded-lg border border-line bg-[#1b1b24] p-3">
          {line.from && <p className="text-xs font-bold text-muted">{line.from}</p>}
          <div className="mt-2 rounded-md bg-black/60 px-3 py-5 text-center font-black uppercase leading-tight text-bone">
            [meme] {line.text}
          </div>
        </div>
      );
    case "comment":
      return (
        <p className="text-sm leading-snug">
          <span className="font-bold text-bone/70">{line.from} </span>
          <span className="text-bone/90">{line.text}</span>
        </p>
      );
    case "dm":
      return (
        <div className="border-accent bg-accent-soft ml-auto max-w-[88%] rounded-2xl rounded-tr-sm border px-3 py-2">
          <p className="accent text-[11px] font-bold uppercase tracking-wide">Privado · {line.from}</p>
          <p className="leading-snug">{line.text}</p>
        </div>
      );
    case "forward":
    case "msg":
    default:
      return (
        <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-panel px-3 py-2">
          {line.tone === "forward" && <p className="text-[11px] italic text-muted">↪↪ Encaminhada com frequência</p>}
          {line.from && <p className="accent text-xs font-bold">{line.from}</p>}
          <p className="leading-snug">{line.text}</p>
        </div>
      );
  }
}
