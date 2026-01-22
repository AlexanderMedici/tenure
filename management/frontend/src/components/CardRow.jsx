import { cn } from "../lib/utils";

export default function CardRow({ title, subtitle, meta, status, right, onClick }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(36,34,30,0.06)] md:flex-row md:items-center md:justify-between",
        onClick && "cursor-pointer transition hover:border-slate-300"
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <div>
        <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
          {meta}
        </div>
        <div className="mt-2 text-lg font-semibold text-slate-900">{title}</div>
        {subtitle ? (
          <div className="mt-1 text-sm text-slate-500">{subtitle}</div>
        ) : null}
      </div>
      <div className="flex items-center gap-3">{status}{right}</div>
    </div>
  );
}
