import { useEffect, useRef, useState } from "react";
import { apiFetch, withBuildingId } from "../../app/api";
import { getSocket } from "../../app/socket";
import { useAuth } from "../../app/auth";
import SectionHeader from "../../components/SectionHeader";
import { Button } from "../../components/ui/button";

export default function CommunityChat({ title = "Community chat" }) {
  const { scope, activeBuildingId } = useAuth();
  const buildingId =
    scope?.role === "management" || scope?.role === "admin"
      ? activeBuildingId
      : scope?.buildingId;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [photo, setPhoto] = useState(null);
  const [state, setState] = useState({ loading: true, error: null });
  const endRef = useRef(null);

  useEffect(() => {
    let active = true;
    if (!buildingId) return;
    apiFetch(withBuildingId("/api/community/messages", buildingId))
      .then((data) => {
        if (!active) return;
        setMessages(data.data || []);
        setState({ loading: false, error: null });
      })
      .catch((err) => {
        if (!active) return;
        setState({ loading: false, error: err.message });
      });
    return () => {
      active = false;
    };
  }, [buildingId]);

  useEffect(() => {
    if (!buildingId) return;
    const socket = getSocket();
    socket.emit("community:join", { buildingId });
    const onMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };
    const onDelete = (payload) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== payload?._id));
    };
    socket.on("community:message", onMessage);
    socket.on("community:delete", onDelete);
    return () => {
      socket.off("community:message", onMessage);
      socket.off("community:delete", onDelete);
    };
  }, [buildingId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const text = input.trim();
    if (!buildingId || (!text && !photo)) return;
    setInput("");
    const formData = new FormData();
    formData.append("body", text || "Photo");
    formData.append("buildingId", buildingId);
    if (photo) {
      formData.append("photo", photo);
      setPhoto(null);
    }
    await fetch("/api/community/messages", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
  };

  const handleDelete = async (id) => {
    if (!buildingId) return;
    if (!confirm("Delete this message?")) return;
    await apiFetch(withBuildingId(`/api/community/messages/${id}`, buildingId), {
      method: "DELETE",
    });
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={title}
        subtitle="A shared space for residents and management."
      />
      {state.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {state.error}
        </div>
      ) : null}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="max-h-[420px] space-y-4 overflow-y-auto">
          {state.loading ? (
            <div className="text-sm text-slate-500">Loading…</div>
          ) : messages.length ? (
            messages.map((msg) => (
              <div key={msg._id} className="rounded-xl bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                  <span>
                    {msg.senderName || "Member"} ·{" "}
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                  {scope?.role === "management" || scope?.role === "admin" ? (
                    <button
                      type="button"
                      className="text-rose-600"
                      onClick={() => handleDelete(msg._id)}
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
                <div className="mt-2 text-sm text-slate-700">{msg.body}</div>
                {msg.attachments?.length ? (
                  <div className="mt-3">
                    {msg.attachments[0].mimeType?.startsWith("image/") ? (
                      <img
                        src={msg.attachments[0].url}
                        alt={msg.attachments[0].fileName || "attachment"}
                        className="max-h-64 rounded-lg border border-slate-200"
                      />
                    ) : (
                      <a
                        href={msg.attachments[0].url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-emerald-700 underline"
                      >
                        {msg.attachments[0].fileName || "Attachment"}
                      </a>
                    )}
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-500">No messages yet.</div>
          )}
          <div ref={endRef} />
        </div>
        <form onSubmit={sendMessage} className="mt-4 flex flex-col gap-2 md:flex-row">
          <input
            className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="Share an update"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              className="text-xs"
            />
            <Button type="submit">Send</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
