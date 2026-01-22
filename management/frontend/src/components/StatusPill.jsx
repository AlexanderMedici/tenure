import { cn } from "../lib/utils";

const STATUS_MAP = {
  open: "bg-amber-50 text-amber-700 border-amber-200",
  pending: "bg-slate-50 text-slate-700 border-slate-200",
  closed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  overdue: "bg-rose-50 text-rose-700 border-rose-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  draft: "bg-slate-50 text-slate-600 border-slate-200",
  published: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function StatusPill({ status = "pending" }) {
  const styles = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em]",
        styles
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}
