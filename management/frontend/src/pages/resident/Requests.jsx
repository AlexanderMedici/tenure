import { useEffect, useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import CardRow from "../../components/CardRow";
import ListSkeleton from "../../components/ListSkeleton";
import EmptyState from "../../components/EmptyState";
import StatusPill from "../../components/StatusPill";
import { apiFetch, withBuildingId } from "../../app/api";
import { useAuth } from "../../app/auth";
import { getSocket } from "../../app/socket";
import { notifyInfo } from "../../app/toast";

export default function ResidentRequests() {
  const [state, setState] = useState({ loading: true, error: null, data: [] });
  const { scope } = useAuth();
  const buildingId = scope?.buildingId;

  useEffect(() => {
    let active = true;
    if (!buildingId) return () => {};
    apiFetch(withBuildingId("/api/tickets", buildingId))
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
    const socket = getSocket();
    const onCompleted = (payload) => {
      notifyInfo(`Request completed: ${payload?.title || "Your request"}`);
    };
    socket.on("ticket:completed", onCompleted);
    return () => {
      socket.off("ticket:completed", onCompleted);
    };
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Requests"
        subtitle="Service requests and maintenance progress."
        action={
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
            onClick={() => (window.location.href = "/requests/new")}
          >
            New request
          </button>
        }
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
                subtitle={
                  ticket.description ||
                  ticket.completionNotes ||
                  "No description provided."
                }
                status={<StatusPill status={ticket.status} />}
                right={
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {ticket.priority}
                  </div>
                }
              />
              {ticket.assignedAgentName ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                  Assigned agent:{" "}
                  <span className="text-slate-900">
                    {ticket.assignedAgentName}
                  </span>
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
          body="Create a new request and track it here."
          actionLabel="New request"
          onAction={() => (window.location.href = "/requests/new")}
        />
      )}
    </div>
  );
}
