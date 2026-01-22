export default function ListSkeleton({ count = 4 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="h-20 rounded-2xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(36,34,30,0.04)]"
        >
          <div className="h-full animate-pulse bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50" />
        </div>
      ))}
    </div>
  );
}
