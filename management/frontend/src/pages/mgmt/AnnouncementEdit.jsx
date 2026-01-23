import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader";
import { Button } from "../../components/ui/button";
import { apiFetch, withBuildingId, withBuildingIdBody } from "../../app/api";
import { useAuth } from "../../app/auth";

const emptyForm = {
  title: "",
  body: "",
  status: "draft",
};

export default function AnnouncementEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeBuildingId } = useAuth();
  const buildingId = activeBuildingId;
  const [form, setForm] = useState(emptyForm);
  const [state, setState] = useState({ loading: true, saving: false, error: null });

  useEffect(() => {
    let active = true;
    if (!buildingId) return () => {};
    apiFetch(withBuildingId(`/api/announcements/${id}`, buildingId))
      .then((data) => {
        if (!active) return;
        const item = data.data || {};
        setForm({
          title: item.title || "",
          body: item.body || "",
          status: item.status || "draft",
        });
        setState({ loading: false, saving: false, error: null });
      })
      .catch((err) => {
        if (active) setState({ loading: false, saving: false, error: err.message });
      });
    return () => {
      active = false;
    };
  }, [id, buildingId]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setState((prev) => ({ ...prev, saving: true, error: null }));
    try {
      if (!buildingId) throw new Error("Select a building to continue.");
      await apiFetch(withBuildingId(`/api/announcements/${id}`, buildingId), {
        method: "PATCH",
        body: JSON.stringify(withBuildingIdBody(form, buildingId)),
      });
      navigate("/mgmt/announcements", { replace: true });
    } catch (err) {
      setState((prev) => ({ ...prev, saving: false, error: err.message }));
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Edit announcement"
        subtitle="Update the message shown to residents."
      />
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4"
      >
        {state.loading ? (
          <div className="text-sm text-slate-500">Loading announcement…</div>
        ) : (
          <>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Title
              </label>
              <input
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Body
              </label>
              <textarea
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                rows={6}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Status
              </label>
              <select
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </>
        )}
        {state.error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {state.error}
          </div>
        ) : null}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={state.loading || state.saving}>
            {state.saving ? "Saving..." : "Save"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/mgmt/announcements")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
