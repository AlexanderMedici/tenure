import { useEffect, useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import CardRow from "../../components/CardRow";
import ListSkeleton from "../../components/ListSkeleton";
import EmptyState from "../../components/EmptyState";
import StatusPill from "../../components/StatusPill";
import { apiFetch, withBuildingId } from "../../app/api";
import { useAuth } from "../../app/auth";

export default function ResidentRequests() {
  const [state, setState] = useState({ loading: true, error: null, data: [] });
  const { scope } = useAuth();

  useEffect(() => {
    let active = true;
    apiFetch(withBuildingId("/api/tickets", scope?.buildingId))
      .then((data) => {
        if (active) setState({ loading: false, error: null, data: data.data });
      })
      .catch((err) => {
        if (active) setState({ loading: false, error: err.message, data: [] });
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Requests"
        subtitle="Service requests and maintenance progress."
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
            <CardRow
              key={ticket._id}
              meta="Request"
              title={ticket.title}
              subtitle={ticket.description || "No description provided."}
              status={<StatusPill status={ticket.status} />}
              right={
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {ticket.priority}
                </div>
              }
            />
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
