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
  const { activeBuildingId } = useAuth();
  const navigate = useNavigate();
  const buildingId = activeBuildingId;

  useEffect(() => {
    let active = true;
    if (!buildingId) return () => {};
    apiFetch(withBuildingId("/api/announcements", buildingId))
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

  const handleDelete = async (id) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await apiFetch(withBuildingId(`/api/announcements/${id}`, buildingId), {
        method: "DELETE",
      });
      setState((prev) => ({
        ...prev,
        data: prev.data.filter((item) => item._id !== id),
      }));
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message }));
    }
  };

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
              right={
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="h-9 px-3 text-xs"
                    onClick={() =>
                      navigate(`/mgmt/announcements/${item._id}/edit`)
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="h-9 px-3 text-xs border-rose-200 text-rose-700 hover:bg-rose-50"
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </Button>
                </div>
              }
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
