export default function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <p
      role="note"
      className={`rounded-lg border border-alarm/60 bg-alarm/10 px-3 py-2 text-sm font-semibold text-alarm ${className}`}
    >
      Sátira política fictícia. Os eventos e personagens secundários foram inventados.
    </p>
  );
}
