import { useEffect, useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import DataTable from "../../components/DataTable";
import ListSkeleton from "../../components/ListSkeleton";
import { apiFetch, withBuildingId, withBuildingIdBody } from "../../app/api";
import { useAuth } from "../../app/auth";
import { Button } from "../../components/ui/button";

export default function MgmtBilling() {
  const [state, setState] = useState({ loading: true, error: null, data: [] });
  const [form, setForm] = useState({
    amount: "",
    dueDate: "",
    residentId: "",
    unitId: "",
    leaseId: "",
  });
  const [leases, setLeases] = useState([]);
  const [files, setFiles] = useState([]);
  const { activeBuildingId } = useAuth();
  const buildingId = activeBuildingId;

  useEffect(() => {
    let active = true;
    if (!buildingId) return () => {};
    apiFetch(withBuildingId("/api/invoices", buildingId))
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

  useEffect(() => {
    let active = true;
    if (!buildingId) return () => {};
    apiFetch(withBuildingId("/api/leases", buildingId))
      .then((data) => {
        if (!active) return;
        const all = data.data || [];
        const activeLeases = all.filter((lease) => lease.status === "active");
        setLeases(activeLeases);
      })
      .catch(() => {
        if (active) setLeases([]);
      });
    return () => {
      active = false;
    };
  }, [buildingId]);

  const createInvoice = async (event) => {
    event.preventDefault();
    try {
      if (!buildingId) {
        throw new Error("Select a building to continue.");
      }
      if (!form.leaseId || !form.unitId || !form.residentId) {
        throw new Error("Select an active unit to bill.");
      }
      const formData = new FormData();
      const payload = withBuildingIdBody(form, buildingId);
      Object.entries(payload).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      files.forEach((file) => formData.append("attachments", file));
      await fetch("/api/invoices", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      setForm({ amount: "", dueDate: "", residentId: "", unitId: "", leaseId: "" });
      setFiles([]);
      const data = await apiFetch(
        withBuildingId("/api/invoices", buildingId)
      );
      setState({ loading: false, error: null, data: data.data });
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message }));
    }
  };

  const removeInvoice = async (id) => {
    if (!buildingId) return;
    if (!confirm("Delete this invoice?")) return;
    try {
      await apiFetch(withBuildingId(`/api/invoices/${id}`, buildingId), {
        method: "DELETE",
      });
      const data = await apiFetch(withBuildingId("/api/invoices", buildingId));
      setState({ loading: false, error: null, data: data.data });
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message }));
    }
  };

  const rows = state.data.map((invoice) => ({
    id: invoice._id,
    dueDate: new Date(invoice.dueDate || invoice.createdAt).toLocaleDateString(),
    amount: invoice.amount?.toLocaleString("en-US", {
      style: "currency",
      currency: invoice.currency || "USD",
    }),
    status: invoice.status,
    attachments: invoice.attachments?.length ? (
      <div className="flex flex-wrap gap-2">
        {invoice.attachments.map((file) => (
          <a
            key={file.url}
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-600 underline"
          >
            {file.fileName || "Attachment"}
          </a>
        ))}
      </div>
    ) : (
      <span className="text-xs text-slate-400">None</span>
    ),
    actions: (
      <div className="flex flex-wrap gap-2">
        <a
          className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
          href={withBuildingId(`/api/invoices/${invoice._id}/download`, buildingId)}
        >
          Download
        </a>
        <button
          type="button"
          className="rounded-full border border-rose-200 px-3 py-1 text-xs text-rose-700 hover:bg-rose-50"
          onClick={() => removeInvoice(invoice._id)}
        >
          Delete
        </button>
      </div>
    ),
  }));

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Billing"
        subtitle="Invoices, payouts, and reconciliation."
      />
      <form
        onSubmit={createInvoice}
        className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4"
      >
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-3">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Active unit
            </label>
            <select
              className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={form.leaseId}
              onChange={(e) => {
                const lease = leases.find((item) => item._id === e.target.value);
                if (!lease) {
                  setForm({ ...form, leaseId: "", unitId: "", residentId: "" });
                  return;
                }
                setForm({
                  ...form,
                  leaseId: lease._id,
                  unitId: lease.unitId?._id || lease.unitId,
                  residentId: lease.residentId?._id || lease.residentId,
                });
              }}
            >
              <option value="">Select a unit</option>
              {leases.map((lease) => {
                const unitLabel = lease.unitId?.number || lease.unitId || "-";
                const residentLabel =
                  lease.residentId?.name ||
                  lease.residentId?.email ||
                  lease.residentId ||
                  "-";
                return (
                  <option key={lease._id} value={lease._id}>
                    {unitLabel} - {residentLabel}
                  </option>
                );
              })}
            </select>
          </div>
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
          <input type="hidden" value={form.residentId} readOnly />
          <input type="hidden" value={form.unitId} readOnly />
          <input type="hidden" value={form.leaseId} readOnly />
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
        </div>
        <Button type="submit">Add invoice</Button>
      </form>

      {state.loading ? (
        <ListSkeleton count={2} />
      ) : state.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {state.error}
        </div>
      ) : (
        <DataTable
          columns={[
            { key: "dueDate", label: "Due", className: "md:col-span-2" },
            { key: "amount", label: "Amount", className: "md:col-span-2" },
            { key: "status", label: "Status", className: "md:col-span-2" },
            {
              key: "attachments",
              label: "Attachments",
              className: "md:col-span-4",
            },
            { key: "actions", label: "Actions", className: "md:col-span-2" },
          ]}
          rows={rows}
          emptyLabel="No invoices yet."
        />
      )}
    </div>
  );
}
