import { useEffect, useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import CardRow from "../../components/CardRow";
import ListSkeleton from "../../components/ListSkeleton";
import EmptyState from "../../components/EmptyState";
import StatusPill from "../../components/StatusPill";
import { apiFetch, withBuildingId } from "../../app/api";
import { useAuth } from "../../app/auth";

export default function ResidentAnnouncements() {
  const [state, setState] = useState({ loading: true, error: null, data: [] });
  const { scope } = useAuth();

  useEffect(() => {
    let active = true;
    apiFetch(withBuildingId("/api/announcements", scope?.buildingId))
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
        title="Announcements"
        subtitle="Building updates and premium community notices."
      />

      {state.loading ? (
        <ListSkeleton />
      ) : state.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {state.error}
        </div>
      ) : state.data.length ? (
        <div className="space-y-4">
          {state.data.map((item) => (
            <CardRow
              key={item._id}
              meta={new Date(item.publishAt || item.createdAt).toLocaleDateString()}
              title={item.title}
              subtitle={item.body}
              status={<StatusPill status={item.status} />}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No announcements yet"
          body="When management shares news, you will see it here."
        />
      )}
    </div>
  );
}
