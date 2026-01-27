import { useEffect, useMemo, useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import DataTable from "../../components/DataTable";
import ListSkeleton from "../../components/ListSkeleton";
import { Button } from "../../components/ui/button";
import { apiFetch, withBuildingId } from "../../app/api";
import { useAuth } from "../../app/auth";

export default function MgmtLeases() {
  const { activeBuildingId } = useAuth();
  const buildingId = activeBuildingId;
  const [state, setState] = useState({ loading: true, error: null, data: [] });
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploadState, setUploadState] = useState({});
  const [terminateModal, setTerminateModal] = useState({
    open: false,
    leaseId: null,
  });
  const [terminationReason, setTerminationReason] = useState("");
  const [terminating, setTerminating] = useState(false);

  useEffect(() => {
    let active = true;
    if (!buildingId) return () => {};
    setState((prev) => ({ ...prev, loading: true, error: null }));
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

  const setLeaseUploadState = (leaseId, patch) => {
    setUploadState((prev) => ({
      ...prev,
      [leaseId]: { ...(prev[leaseId] || {}), ...patch },
    }));
  };

  const onFileChange = (leaseId, file) => {
    setSelectedFiles((prev) => ({ ...prev, [leaseId]: file || null }));
    setLeaseUploadState(leaseId, { error: null, success: null });
  };

  const uploadLease = async (leaseId) => {
    const file = selectedFiles[leaseId];
    if (!file) {
      setLeaseUploadState(leaseId, {
        error: "Select a PDF to upload.",
        success: null,
      });
      return;
    }
    if (!buildingId) return;
    setLeaseUploadState(leaseId, { loading: true, error: null, success: null });

    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("buildingId", buildingId);
      formData.append("leaseId", leaseId);

      await apiFetch("/api/leases/document", {
        method: "POST",
        body: formData,
      });

      setLeaseUploadState(leaseId, {
        loading: false,
        error: null,
        success: "Uploaded.",
      });
      setSelectedFiles((prev) => ({ ...prev, [leaseId]: null }));
      const data = await apiFetch(withBuildingId("/api/leases", buildingId));
      setState({ loading: false, error: null, data: data.data });
    } catch (err) {
      setLeaseUploadState(leaseId, {
        loading: false,
        error: err.message || "Upload failed.",
        success: null,
      });
    }
  };

  const deleteLease = async (leaseId) => {
    if (!buildingId) return;
    if (!confirm("Delete this ended lease?")) return;
    try {
      await apiFetch(withBuildingId(`/api/leases/${leaseId}`, buildingId), {
        method: "DELETE",
      });
      const data = await apiFetch(withBuildingId("/api/leases", buildingId));
      setState({ loading: false, error: null, data: data.data });
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message }));
    }
  };

  const terminateLease = async (leaseId) => {
    if (!buildingId) return;
    try {
      setTerminating(true);
      await apiFetch(withBuildingId(`/api/leases/${leaseId}/terminate`, buildingId), {
        method: "PATCH",
        body: JSON.stringify({ reason: terminationReason }),
      });
      const data = await apiFetch(withBuildingId("/api/leases", buildingId));
      setState({ loading: false, error: null, data: data.data });
      setTerminateModal({ open: false, leaseId: null });
      setTerminationReason("");
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message }));
    } finally {
      setTerminating(false);
    }
  };

  const rows = useMemo(
    () =>
      state.data.map((lease) => {
        const status = uploadState[lease._id] || {};
        return {
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
          terminatedAt: lease.terminatedAt
            ? new Date(lease.terminatedAt).toLocaleDateString()
            : "-",
          terminationReason: lease.terminationReason || "-",
          actions: (
            <div className="flex flex-wrap gap-2">
              {lease.document?.url ? (
                <a
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
                  href={lease.document.url}
                  download
                >
                  Download
                </a>
              ) : (
                <span className="text-xs text-slate-400">No PDF</span>
              )}
              {lease.status !== "ended" ? (
                <button
                  type="button"
                  className="rounded-full border border-amber-200 px-3 py-1 text-xs text-amber-700 hover:bg-amber-50"
                  onClick={() =>
                    setTerminateModal({ open: true, leaseId: lease._id })
                  }
                >
                  Terminate
                </button>
              ) : (
                <span className="text-xs text-slate-400">Ended</span>
              )}
              <button
                type="button"
                className="rounded-full border border-rose-200 px-3 py-1 text-xs text-rose-700 hover:bg-rose-50"
                onClick={() => deleteLease(lease._id)}
              >
                Delete
              </button>
            </div>
          ),
          upload: (
            <div className="space-y-2">
              <input
                className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                type="file"
                accept="application/pdf"
                onChange={(e) =>
                  onFileChange(lease._id, e.target.files?.[0] || null)
                }
              />
              <Button
                variant="outline"
                onClick={() => uploadLease(lease._id)}
                disabled={status.loading}
                className="w-full"
              >
                {status.loading ? "Uploading…" : "Upload"}
              </Button>
              {status.error ? (
                <div className="text-xs text-rose-600">{status.error}</div>
              ) : status.success ? (
                <div className="text-xs text-emerald-600">
                  {status.success}
                </div>
              ) : null}
            </div>
          ),
        };
      }),
    [state.data, uploadState]
  );

  const activeRows = rows.filter(
    (row) => state.data.find((lease) => lease._id === row.id)?.status !== "ended"
  );
  const endedRows = rows.filter(
    (row) => state.data.find((lease) => lease._id === row.id)?.status === "ended"
  );

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
        <div className="space-y-6">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Active leases
            </div>
            <div className="mt-3">
              <DataTable
                columns={[
                  { key: "unit", label: "Unit", className: "md:col-span-2" },
                  { key: "resident", label: "Resident", className: "md:col-span-3" },
                  { key: "start", label: "Start", className: "md:col-span-2" },
                  { key: "status", label: "Status", className: "md:col-span-1" },
                  { key: "document", label: "PDF", className: "md:col-span-1" },
                  { key: "actions", label: "Actions", className: "md:col-span-2" },
                  { key: "upload", label: "Upload", className: "md:col-span-2" },
                ]}
                rows={activeRows}
                emptyLabel="No active leases."
              />
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Terminated leases
            </div>
            <div className="mt-3">
              <DataTable
                columns={[
                  { key: "unit", label: "Unit", className: "md:col-span-2" },
                  { key: "resident", label: "Resident", className: "md:col-span-3" },
                  { key: "start", label: "Start", className: "md:col-span-2" },
                  { key: "status", label: "Status", className: "md:col-span-1" },
                  { key: "document", label: "PDF", className: "md:col-span-1" },
                  { key: "terminatedAt", label: "Ended", className: "md:col-span-1" },
                  { key: "terminationReason", label: "Reason", className: "md:col-span-2" },
                  { key: "actions", label: "Actions", className: "md:col-span-2" },
                ]}
                rows={endedRows}
                emptyLabel="No terminated leases."
              />
            </div>
          </div>
        </div>
      )}

      {terminateModal.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="text-lg font-semibold text-slate-900">
              Terminate lease
            </div>
            <div className="mt-2 text-sm text-slate-500">
              Provide a reason for termination. This will be saved with the lease.
            </div>
            <textarea
              className="mt-4 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              rows={4}
              value={terminationReason}
              onChange={(e) => setTerminationReason(e.target.value)}
              placeholder="Reason for termination"
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setTerminateModal({ open: false, leaseId: null });
                  setTerminationReason("");
                }}
                disabled={terminating}
              >
                Cancel
              </Button>
              <Button
                onClick={() => terminateLease(terminateModal.leaseId)}
                disabled={terminating}
              >
                {terminating ? "Terminating..." : "Confirm terminate"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
