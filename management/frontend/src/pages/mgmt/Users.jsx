import { useEffect, useMemo, useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import EmptyState from "../../components/EmptyState";
import DataTable from "../../components/DataTable";
import { apiFetch, withBuildingId } from "../../app/api";
import { useAuth } from "../../app/auth";
import { Button } from "../../components/ui/button";

export default function MgmtUsers() {
  const { activeBuildingId } = useAuth();
  const buildingId = activeBuildingId;
  const [unitsState, setUnitsState] = useState({
    loading: true,
    error: null,
    data: [],
  });
  const [leasesState, setLeasesState] = useState({
    loading: true,
    error: null,
    data: [],
  });
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    unitId: "",
    startDate: "",
    endDate: "",
    rentAmount: "",
    currency: "USD",
  });

  const loadData = async () => {
    if (!buildingId) return;
    setUnitsState((prev) => ({ ...prev, loading: true, error: null }));
    setLeasesState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [unitsRes, leasesRes] = await Promise.all([
        apiFetch(withBuildingId("/api/units", buildingId)),
        apiFetch(withBuildingId("/api/leases", buildingId)),
      ]);
      setUnitsState({ loading: false, error: null, data: unitsRes.data || [] });
      setLeasesState({
        loading: false,
        error: null,
        data: leasesRes.data || [],
      });
    } catch (err) {
      setUnitsState({ loading: false, error: err.message, data: [] });
      setLeasesState({ loading: false, error: err.message, data: [] });
    }
  };

  useEffect(() => {
    loadData();
  }, [buildingId]);

  const leaseByUnit = useMemo(() => {
    const map = new Map();
    (leasesState.data || []).forEach((lease) => {
      const unitId =
        typeof lease.unitId === "object" ? lease.unitId?._id : lease.unitId;
      if (!unitId) return;
      const existing = map.get(unitId);
      if (!existing || existing.status !== "active") {
        map.set(unitId, lease);
      }
    });
    return map;
  }, [leasesState.data]);

  const availableUnits = useMemo(
    () =>
      (unitsState.data || []).filter((unit) => {
        const lease = leaseByUnit.get(unit._id);
        return !lease || lease.status !== "active";
      }),
    [unitsState.data, leaseByUnit]
  );

  const createResident = async (event) => {
    event.preventDefault();
    if (!buildingId) return;
    try {
      if (!form.unitId) {
        throw new Error("Select a unit to assign.");
      }
      const userRes = await apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: "resident",
          buildingId,
          unitId: form.unitId,
        }),
      });
      await apiFetch("/api/leases", {
        method: "POST",
        body: JSON.stringify({
          buildingId,
          unitId: form.unitId,
          residentId: userRes.data?._id,
          startDate: form.startDate,
          endDate: form.endDate || undefined,
          rentAmount: form.rentAmount || undefined,
          currency: form.currency || "USD",
          status: "active",
        }),
      });
      setForm({
        name: "",
        email: "",
        password: "",
        unitId: "",
        startDate: "",
        endDate: "",
        rentAmount: "",
        currency: "USD",
      });
      await loadData();
    } catch (err) {
      setUnitsState((prev) => ({ ...prev, error: err.message }));
    }
  };

  const rows = (unitsState.data || []).map((unit) => {
    const lease = leaseByUnit.get(unit._id);
    const residentLabel = lease?.residentId
      ? lease.residentId.name || lease.residentId.email || "-"
      : "-";
    const leaseStatus = lease?.status || "vacant";
    const start = lease?.startDate
      ? new Date(lease.startDate).toLocaleDateString()
      : "-";
    const end = lease?.endDate
      ? new Date(lease.endDate).toLocaleDateString()
      : "-";
    return {
      id: unit._id,
      unit: unit.number,
      status: unit.status,
      resident: residentLabel,
      leaseStatus,
      start,
      end,
    };
  });

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Users"
        subtitle="Manage staff and resident access."
      />

      <form
        onSubmit={createResident}
        className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4"
      >
        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Create resident + lease
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="Temp password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <select
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={form.unitId}
            onChange={(e) => setForm({ ...form, unitId: e.target.value })}
            required
          >
            <option value="">Select unit</option>
            {availableUnits.map((unit) => (
              <option key={unit._id} value={unit._id}>
                {unit.number} ({unit.status})
              </option>
            ))}
          </select>
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            required
          />
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="Rent amount"
            value={form.rentAmount}
            onChange={(e) => setForm({ ...form, rentAmount: e.target.value })}
          />
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="Currency"
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
          />
        </div>
        <Button type="submit">Create resident</Button>
      </form>

      {unitsState.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {unitsState.error}
        </div>
      ) : null}

      {unitsState.loading ? (
        <EmptyState title="Loading units" body="Fetching building units..." />
      ) : rows.length ? (
        <DataTable
          columns={[
            { key: "unit", label: "Unit", className: "md:col-span-2" },
            { key: "status", label: "Unit status", className: "md:col-span-2" },
            { key: "resident", label: "Resident", className: "md:col-span-3" },
            { key: "leaseStatus", label: "Lease", className: "md:col-span-1" },
            { key: "start", label: "Start", className: "md:col-span-2" },
            { key: "end", label: "End", className: "md:col-span-2" },
          ]}
          rows={rows}
          emptyLabel="No units found."
        />
      ) : (
        <EmptyState
          title="No units loaded"
          body="Create units first to assign residents."
        />
      )}
    </div>
  );
}
