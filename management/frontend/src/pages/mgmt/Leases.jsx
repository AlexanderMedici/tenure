import { useEffect, useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import DataTable from "../../components/DataTable";
import ListSkeleton from "../../components/ListSkeleton";
import { apiFetch, withBuildingId } from "../../app/api";
import { useAuth } from "../../app/auth";

export default function MgmtLeases() {
  const { activeBuildingId } = useAuth();
  const buildingId = activeBuildingId;
  const [state, setState] = useState({ loading: true, error: null, data: [] });

  useEffect(() => {
    let active = true;
    if (!buildingId) return () => {};
    apiFetch(withBuildingId("/api/leases", buildingId))
      .then((data) => {
        if (active) setState({ loading: false, error: null, data: data.data });
      })
      .catch((err) => {
        if (active) setState({ loading: false, error: err.message, data: [] });
      });
    return () => {
      active = false;
    };
  }, [buildingId]);

  const rows = state.data.map((lease) => ({
    id: lease._id,
    unit: lease.unitId?.number || lease.unitId || "-",
    resident: lease.residentId?.name || lease.residentId?.email || "-",
    start: new Date(lease.startDate).toLocaleDateString(),
    status: lease.status,
    document: lease.document?.url ? (
      <a
        className="text-emerald-700 underline"
        href={lease.document.url}
        target="_blank"
        rel="noreferrer"
      >
        View
      </a>
    ) : (
      "-"
    ),
  }));

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Leases"
        subtitle="Active and historical lease agreements."
      />
      {state.loading ? (
        <ListSkeleton count={2} />
      ) : state.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {state.error}
        </div>
      ) : (
        <DataTable
          columns={[
            { key: "unit", label: "Unit", className: "md:col-span-3" },
            { key: "resident", label: "Resident", className: "md:col-span-5" },
            { key: "start", label: "Start", className: "md:col-span-2" },
            { key: "status", label: "Status", className: "md:col-span-1" },
            { key: "document", label: "PDF", className: "md:col-span-1" },
          ]}
          rows={rows}
          emptyLabel="No leases found."
        />
      )}
    </div>
  );
}
