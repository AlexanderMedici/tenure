import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader";
import { Button } from "../../components/ui/button";
import { apiFetch, withBuildingIdBody } from "../../app/api";
import { useAuth } from "../../app/auth";

export default function AnnouncementNew() {
  const navigate = useNavigate();
  const { activeBuildingId } = useAuth();
  const [form, setForm] = useState({
    title: "",
    body: "",
    status: "published",
  });
  const [state, setState] = useState({ loading: false, error: null });

  const onSubmit = async (event) => {
    event.preventDefault();
    setState({ loading: true, error: null });
    try {
      if (!activeBuildingId) throw new Error("Select a building to continue.");
      await apiFetch("/api/announcements", {
        method: "POST",
        body: JSON.stringify(withBuildingIdBody(form, activeBuildingId)),
      });
      navigate("/mgmt/announcements", { replace: true });
    } catch (err) {
      setState({ loading: false, error: err.message });
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="New announcement"
        subtitle="Share a clear update with your residents."
      />
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4"
      >
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
        {state.error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {state.error}
          </div>
        ) : null}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={state.loading}>
            {state.loading ? "Publishing..." : "Publish"}
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
