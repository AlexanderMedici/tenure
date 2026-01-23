import { useEffect, useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import CardRow from "../../components/CardRow";
import ListSkeleton from "../../components/ListSkeleton";
import EmptyState from "../../components/EmptyState";
import StatusPill from "../../components/StatusPill";
import { apiFetch, serviceAgentApi, withBuildingId } from "../../app/api";
import { useAuth } from "../../app/auth";
import { Button } from "../../components/ui/button";

export default function MgmtRequests() {
  const [state, setState] = useState({ loading: true, error: null, data: [] });
  const [agents, setAgents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    status: "open",
    assignedAgentId: "",
    completionNotes: "",
    completionFiles: [],
  });
  const { activeBuildingId } = useAuth();

  useEffect(() => {
    let active = true;
    if (!activeBuildingId) return () => {};
    apiFetch(withBuildingId("/api/tickets", activeBuildingId))
      .then((data) => {
        if (active) setState({ loading: false, error: null, data: data.data });
      })
      .catch((err) => {
        if (active) setState({ loading: false, error: err.message, data: [] });
      });
    return () => {
      active = false;
    };
  }, [activeBuildingId]);

  useEffect(() => {
    let active = true;
    if (!activeBuildingId) return () => {};
    serviceAgentApi
      .list(activeBuildingId, { status: "active" })
      .then((data) => {
        if (active) setAgents(data.data || []);
      })
      .catch(() => {
        if (active) setAgents([]);
      });
    return () => {
      active = false;
    };
  }, [activeBuildingId]);

  const startEdit = (ticket) => {
    setEditingId(ticket._id);
    setForm({
      status: ticket.status || "open",
      assignedAgentId: ticket.assignedAgentId || "",
      completionNotes: ticket.completionNotes || "",
      completionFiles: [],
    });
  };

  const resetEdit = () => {
    setEditingId(null);
    setForm({
      status: "open",
      assignedAgentId: "",
      completionNotes: "",
      completionFiles: [],
    });
  };

  const saveTicket = async (ticketId) => {
    if (!activeBuildingId) return;
    try {
      const formData = new FormData();
      formData.append("buildingId", activeBuildingId);
      formData.append("status", form.status);
      formData.append("assignedAgentId", form.assignedAgentId || "");
      if (form.completionNotes) {
        formData.append("completionNotes", form.completionNotes);
      }
      (form.completionFiles || []).forEach((file) =>
        formData.append("completionFiles", file)
      );
      await fetch(withBuildingId(`/api/tickets/${ticketId}`, activeBuildingId), {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });
      const data = await apiFetch(withBuildingId("/api/tickets", activeBuildingId));
      setState({ loading: false, error: null, data: data.data });
      resetEdit();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message }));
    }
  };

  const removeTicket = async (ticketId) => {
    if (!activeBuildingId) return;
    if (!confirm("Delete this request?")) return;
    try {
      await apiFetch(withBuildingId(`/api/tickets/${ticketId}`, activeBuildingId), {
        method: "DELETE",
      });
      const data = await apiFetch(withBuildingId("/api/tickets", activeBuildingId));
      setState({ loading: false, error: null, data: data.data });
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message }));
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Requests"
        subtitle="Review open work orders across buildings."
      />

      {state.loading ? (
        <ListSkeleton />
      ) : state.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {state.error}
        </div>
      ) : state.data.length ? (
        <div className="space-y-4">
          {state.data.map((ticket) => (
            <div key={ticket._id} className="space-y-2">
              <CardRow
                meta="Request"
                title={ticket.title}
                subtitle={ticket.description || "No description provided."}
                status={<StatusPill status={ticket.status} />}
                right={
                  <div className="flex items-center gap-2">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {ticket.priority}
                    </div>
                    <Button
                      variant="outline"
                      className="h-8 px-3 text-xs"
                      onClick={() => startEdit(ticket)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 px-3 text-xs border-rose-200 text-rose-700 hover:bg-rose-50"
                      onClick={() => removeTicket(ticket._id)}
                    >
                      Delete
                    </Button>
                  </div>
                }
              />
              {editingId === ticket._id ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Status
                      </label>
                      <select
                        className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                        value={form.status}
                        onChange={(e) =>
                          setForm({ ...form, status: e.target.value })
                        }
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Assigned agent
                      </label>
                      <select
                        className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                        value={form.assignedAgentId}
                        onChange={(e) =>
                          setForm({ ...form, assignedAgentId: e.target.value })
                        }
                      >
                        <option value="">Unassigned</option>
                        {agents.map((agent) => (
                          <option key={agent._id} value={agent._id}>
                            {agent.name} ({agent.role})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Completion file
                      </label>
                      <input
                        className="mt-2 w-full text-sm"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={(e) =>
                          setForm({
                            ...form,
                            completionFiles: Array.from(
                              e.target.files || []
                            ),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Completion notes
                    </label>
                    <textarea
                      className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                      rows={3}
                      value={form.completionNotes}
                      onChange={(e) =>
                        setForm({ ...form, completionNotes: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button onClick={() => saveTicket(ticket._id)}>
                      Save
                    </Button>
                    <Button variant="outline" onClick={resetEdit}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : null}
              {ticket.completionAttachments?.length ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Completion attachments
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ticket.completionAttachments.map((file) => (
                      <a
                        key={file.url}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-700 underline"
                      >
                        {file.fileName || "Attachment"}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No requests yet"
          body="When residents submit tickets, they will appear here."
        />
      )}
    </div>
  );
}
