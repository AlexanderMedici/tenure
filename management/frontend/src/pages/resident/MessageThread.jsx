import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader";
import ListSkeleton from "../../components/ListSkeleton";
import EmptyState from "../../components/EmptyState";
import { apiFetch, withBuildingId } from "../../app/api";
import StatusPill from "../../components/StatusPill";
import { getSocket } from "../../app/socket";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../app/auth";

export default function ResidentMessageThread() {
  const { threadId } = useParams();
  const [state, setState] = useState({ loading: true, error: null, data: [] });
  const [input, setInput] = useState("");
  const { scope } = useAuth();

  useEffect(() => {
    let active = true;
    apiFetch(
      withBuildingId(`/api/threads/${threadId}/messages`, scope?.buildingId)
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
  }, [threadId]);

  useEffect(() => {
    if (!scope?.buildingId) return;
    const socket = getSocket();
    socket.emit("thread:join", { threadId, buildingId: scope.buildingId });
    const onMessage = (msg) => {
      setState((prev) => ({ ...prev, data: [...prev.data, msg] }));
    };
    socket.on("thread:message", onMessage);
    return () => {
      socket.off("thread:message", onMessage);
    };
  }, [threadId, scope?.buildingId]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || !scope?.buildingId) return;
    setInput("");
    const socket = getSocket();
    socket.emit("thread:message", {
      threadId,
      buildingId: scope.buildingId,
      body: text,
    });
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Thread"
        subtitle="Messages are kept private between you and your building team."
      />

      {state.loading ? (
        <ListSkeleton count={3} />
      ) : state.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {state.error}
        </div>
      ) : state.data.length ? (
        <div className="space-y-4">
          {state.data.map((msg) => (
            <div
              key={msg._id}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
                <span>{new Date(msg.createdAt).toLocaleString()}</span>
                <StatusPill status="open" />
              </div>
              <p className="mt-3 text-sm text-slate-700">{msg.body}</p>
              {msg.attachments?.length ? (
                <div className="mt-3 text-xs text-slate-500">
                  {msg.attachments.length} attachment(s)
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No messages yet"
          body="Start the conversation and your updates will show here."
        />
      )}
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm"
          placeholder="Write a message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}
