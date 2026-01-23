import { useEffect, useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import CardRow from "../../components/CardRow";
import ListSkeleton from "../../components/ListSkeleton";
import EmptyState from "../../components/EmptyState";
import { apiFetch, withBuildingId } from "../../app/api";
import { useAuth } from "../../app/auth";

export default function ResidentMessages() {
  const [state, setState] = useState({ loading: true, error: null, data: [] });
  const [form, setForm] = useState({ subject: "", body: "" });
  const [sending, setSending] = useState(false);
  const { scope } = useAuth();
  const buildingId = scope?.buildingId;

  useEffect(() => {
    let active = true;
    if (!buildingId) return () => {};
    apiFetch(withBuildingId("/api/threads", buildingId))
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

  const createThread = async (event) => {
    event.preventDefault();
    if (!buildingId) return;
    if (!form.body.trim()) return;
    setSending(true);
    try {
      const payload = {
        subject: form.subject.trim(),
        body: form.body.trim(),
        buildingId,
      };
      const res = await apiFetch("/api/threads", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const threadId = res.data?.thread?._id;
      setForm({ subject: "", body: "" });
      if (threadId) {
        window.location.href = `/messages/${threadId}`;
        return;
      }
      const data = await apiFetch(withBuildingId("/api/threads", buildingId));
      setState({ loading: false, error: null, data: data.data });
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message }));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Messages"
        subtitle="Threaded conversations with your building team."
      />
      <form
        onSubmit={createThread}
        className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3"
      >
        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
          New message
        </div>
        <input
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          placeholder="Subject (optional)"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
        />
        <textarea
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          rows={3}
          placeholder="Write a message to management"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          required
        />
        <button
          type="submit"
          disabled={sending}
          className="rounded-full bg-slate-900 px-4 py-2 text-xs text-white disabled:opacity-60"
        >
          {sending ? "Sending..." : "Send message"}
        </button>
      </form>

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
              onClick={() => (window.location.href = `/messages/${thread._id}`)}
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
