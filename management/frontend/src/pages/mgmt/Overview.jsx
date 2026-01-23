import { useEffect, useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import { apiFetch, withBuildingId } from "../../app/api";
import ListSkeleton from "../../components/ListSkeleton";
import { useAuth } from "../../app/auth";
import CardRow from "../../components/CardRow";
import StatusPill from "../../components/StatusPill";

export default function MgmtOverview() {
  const [state, setState] = useState({ loading: true, error: null, data: null });
  const { activeBuildingId } = useAuth();

  useEffect(() => {
    let active = true;
    if (!activeBuildingId) return () => {};
    apiFetch(withBuildingId("/api/dashboard", activeBuildingId))
      .then((data) => {
        if (active) setState({ loading: false, error: null, data: data.data });
      })
      .catch((err) => {
        if (active) setState({ loading: false, error: err.message, data: null });
      });
    return () => {
      active = false;
    };
  }, [activeBuildingId]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Management Overview"
        subtitle="Portfolio health, open work, and billing risk."
      />

      {state.loading ? (
        <ListSkeleton count={2} />
      ) : state.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {state.error}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { label: "Announcements", value: state.data?.announcements },
              { label: "Threads", value: state.data?.threads },
              { label: "Open Tickets", value: state.data?.openTickets },
              { label: "Open Invoices", value: state.data?.openInvoices },
            ].map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(36,34,30,0.06)]"
              >
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {metric.label}
                </div>
                <div className="mt-3 text-3xl font-semibold text-slate-900">
                  {metric.value ?? 0}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Recent announcements
            </div>
            {state.data?.recentAnnouncements?.length ? (
              <div className="space-y-3">
                {state.data.recentAnnouncements.map((item) => (
                  <CardRow
                    key={item._id}
                    meta={new Date(
                      item.publishAt || item.createdAt
                    ).toLocaleDateString()}
                    title={item.title}
                    subtitle={item.body}
                    status={<StatusPill status={item.status} />}
                  />
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500">
                No announcements yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
