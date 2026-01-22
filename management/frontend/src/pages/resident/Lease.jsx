import { useEffect, useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import { apiFetch, withBuildingId } from "../../app/api";
import { useAuth } from "../../app/auth";

export default function ResidentLease() {
  const { scope } = useAuth();
  const [state, setState] = useState({ loading: true, error: null, data: [] });

  useEffect(() => {
    let active = true;
    apiFetch(withBuildingId("/api/leases", scope?.buildingId))
      .then((data) => {
        if (active) setState({ loading: false, error: null, data: data.data });
      })
      .catch((err) => {
        if (active) setState({ loading: false, error: err.message, data: [] });
      });
    return () => {
      active = false;
    };
  }, [scope?.buildingId]);

  const lease = state.data[0];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Lease agreement"
        subtitle="Your active lease and contract details."
      />
      {state.loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading lease…
        </div>
      ) : state.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {state.error}
        </div>
      ) : lease ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Active lease
          </div>
          <div className="grid gap-3 md:grid-cols-2 text-sm text-slate-700">
            <div>
              <div className="text-slate-500">Unit</div>
              <div className="text-slate-900">
                {lease.unitId?.number || lease.unitId}
              </div>
            </div>
            <div>
              <div className="text-slate-500">Resident</div>
              <div className="text-slate-900">
                {lease.residentId?.name || lease.residentId?.email || "-"}
              </div>
            </div>
            <div>
              <div className="text-slate-500">Start</div>
              <div className="text-slate-900">
                {new Date(lease.startDate).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-slate-500">End</div>
              <div className="text-slate-900">
                {lease.endDate
                  ? new Date(lease.endDate).toLocaleDateString()
                  : "Open"}
              </div>
            </div>
            <div>
              <div className="text-slate-500">Rent</div>
              <div className="text-slate-900">
                {lease.rentAmount?.toLocaleString("en-US", {
                  style: "currency",
                  currency: lease.currency || "USD",
                })}
              </div>
            </div>
            <div>
              <div className="text-slate-500">Status</div>
              <div className="text-slate-900">{lease.status}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          No lease found.
        </div>
      )}
    </div>
  );
}
