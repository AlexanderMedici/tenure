import { useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import { withBuildingIdBody } from "../../app/api";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../app/auth";

export default function ResidentRequestNew() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [photos, setPhotos] = useState([]);
  const [state, setState] = useState({ loading: false, error: null });
  const { scope } = useAuth();

  const onSubmit = async (event) => {
    event.preventDefault();
    setState({ loading: true, error: null });
    try {
      const formData = new FormData();
      const payload = withBuildingIdBody(form, scope?.buildingId);
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      photos.slice(0, 5).forEach((file) => formData.append("photos", file));
      await fetch("/api/tickets", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      window.location.href = "/requests";
    } catch (err) {
      setState({ loading: false, error: err.message });
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="New request"
        subtitle="Describe the issue and we’ll route it to the right team."
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
            Description
          </label>
          <textarea
            className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Photos (up to 5)
          </label>
          <input
            className="mt-2 w-full text-sm"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setPhotos(Array.from(e.target.files || []))}
          />
        </div>
        {state.error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {state.error}
          </div>
        ) : null}
        <Button type="submit" disabled={state.loading}>
          {state.loading ? "Sending..." : "Submit request"}
        </Button>
      </form>
    </div>
  );
}
