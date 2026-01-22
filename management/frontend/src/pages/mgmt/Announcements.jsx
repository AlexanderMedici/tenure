import { useEffect, useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import CardRow from "../../components/CardRow";
import ListSkeleton from "../../components/ListSkeleton";
import EmptyState from "../../components/EmptyState";
import StatusPill from "../../components/StatusPill";
import { apiFetch, withBuildingId } from "../../app/api";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../app/auth";

export default function MgmtAnnouncements() {
  const [state, setState] = useState({ loading: true, error: null, data: [] });
  const { scope } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    apiFetch(
      withBuildingId("/api/announcements", scope?.buildingId || scope?.buildingIds?.[0])
    )
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
        subtitle="Publish updates to residents and staff."
        action={<Button onClick={() => navigate("/mgmt/announcements/new")}>New announcement</Button>}
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
          body="Share a new update to keep residents informed."
          actionLabel="Create announcement"
          onAction={() => navigate("/mgmt/announcements/new")}
        />
      )}
    </div>
  );
}
