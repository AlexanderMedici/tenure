import StatusPill from "./StatusPill";

export default function DataTable({ columns, rows, emptyLabel = "No data." }) {
  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="hidden grid-cols-12 gap-4 border-b border-slate-200 px-6 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500 md:grid">
        {columns.map((col) => (
          <div key={col.key} className={col.className}>
            {col.label}
          </div>
        ))}
      </div>
      <div className="divide-y divide-slate-200">
        {rows.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-1 gap-3 px-6 py-4 text-sm text-slate-700 md:grid-cols-12"
          >
            {columns.map((col) => {
              const value = row[col.key];
              if (col.type === "status") {
                return (
                  <div key={col.key} className={col.className}>
                    <StatusPill status={value} />
                  </div>
                );
              }
              return (
                <div key={col.key} className={col.className}>
                  {value}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
