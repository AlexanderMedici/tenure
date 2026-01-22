import { useEffect, useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import CardRow from "../../components/CardRow";
import ListSkeleton from "../../components/ListSkeleton";
import EmptyState from "../../components/EmptyState";
import { apiFetch, withBuildingId } from "../../app/api";
import { useAuth } from "../../app/auth";

export default function ResidentMessages() {
  const [state, setState] = useState({ loading: true, error: null, data: [] });
  const { scope } = useAuth();

  useEffect(() => {
    let active = true;
    apiFetch(withBuildingId("/api/threads", scope?.buildingId))
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
        title="Messages"
        subtitle="Threaded conversations with your building team."
      />

      {state.loading ? (
        <ListSkeleton />
      ) : state.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {state.error}
        </div>
      ) : state.data.length ? (
        <div className="space-y-4">
          {state.data.map((thread) => (
            <CardRow
              key={thread._id}
              meta="Thread"
              title={thread.subject || "General Inquiry"}
              subtitle={`Updated ${new Date(
                thread.lastMessageAt || thread.updatedAt
              ).toLocaleDateString()}`}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No active threads"
          body="When you message management, your conversations will appear here."
        />
      )}
    </div>
  );
}
