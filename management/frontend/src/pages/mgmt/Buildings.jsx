import { useAuth } from "../../app/auth";
import SectionHeader from "../../components/SectionHeader";
import EmptyState from "../../components/EmptyState";

export default function MgmtBuildings() {
  const { scope } = useAuth();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Buildings"
        subtitle="Manage building records and settings."
      />
      {scope?.buildingIds?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {scope.buildingIds.map((id) => (
            <div
              key={id}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Building
              </div>
              <div className="mt-3 text-lg font-semibold text-slate-900">
                {id}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No buildings assigned"
          body="Assign buildings to begin managing assets."
        />
      )}
    </div>
  );
}
