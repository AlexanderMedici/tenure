import { useEffect, useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import CardRow from "../../components/CardRow";
import ListSkeleton from "../../components/ListSkeleton";
import EmptyState from "../../components/EmptyState";
import StatusPill from "../../components/StatusPill";
import { apiFetch, withBuildingId } from "../../app/api";
import { useAuth } from "../../app/auth";
import { getSocket } from "../../app/socket";
import { notifyInfo } from "../../app/toast";

export default function ResidentRequests() {
  const [state, setState] = useState({ loading: true, error: null, data: [] });
  const [messageModal, setMessageModal] = useState({
    open: false,
    ticket: null,
  });
  const [messagesState, setMessagesState] = useState({
    loading: false,
    error: null,
    data: [],
  });
  const [messageBody, setMessageBody] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const { scope } = useAuth();
  const buildingId = scope?.buildingId;

  useEffect(() => {
    let active = true;
    if (!buildingId) return () => {};
    apiFetch(withBuildingId("/api/tickets", buildingId))
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

  useEffect(() => {
    const socket = getSocket();
    const onCompleted = (payload) => {
      notifyInfo(`Request completed: ${payload?.title || "Your request"}`);
    };
    socket.on("ticket:completed", onCompleted);
    return () => {
      socket.off("ticket:completed", onCompleted);
    };
  }, []);

  useEffect(() => {
    if (!messageModal.open || !messageModal.ticket || !buildingId) return;
    let active = true;
    const loadMessages = async () => {
      try {
        const data = await apiFetch(
          withBuildingId(
            `/api/tickets/${messageModal.ticket._id}/messages`,
            buildingId
          )
        );
        if (active) {
          setMessagesState({ loading: false, error: null, data: data.data || [] });
        }
      } catch (err) {
        if (active) {
          setMessagesState({ loading: false, error: err.message, data: [] });
        }
      }
    };

    loadMessages();
    const intervalId = setInterval(loadMessages, 8000);
    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [messageModal.open, messageModal.ticket?._id, buildingId]);

  const openMessages = async (ticket) => {
    if (!buildingId) return;
    setMessageModal({ open: true, ticket });
    setMessagesState({ loading: true, error: null, data: [] });
    try {
      const data = await apiFetch(
        withBuildingId(`/api/tickets/${ticket._id}/messages`, buildingId)
      );
      setMessagesState({ loading: false, error: null, data: data.data || [] });
    } catch (err) {
      setMessagesState({ loading: false, error: err.message, data: [] });
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!buildingId || !messageModal.ticket) return;
    const body = messageBody.trim();
    if (!body) return;
    setSendingMessage(true);
    try {
      const payload = { body, buildingId };
      const res = await apiFetch(
        withBuildingId(
          `/api/tickets/${messageModal.ticket._id}/messages`,
          buildingId
        ),
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      setMessagesState((prev) => ({
        ...prev,
        data: [...prev.data, res.data],
      }));
      setMessageBody("");
    } catch (err) {
      setMessagesState((prev) => ({ ...prev, error: err.message }));
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Requests"
        subtitle="Service requests and maintenance progress."
        action={
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
            onClick={() => (window.location.href = "/requests/new")}
          >
            New request
          </button>
        }
      />

      {state.loading ? (
        <ListSkeleton />
      ) : state.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {state.error}
        </div>
      ) : state.data.length ? (
        <div className="space-y-4">
          {state.data.map((ticket) => (
            <div key={ticket._id} className="space-y-2">
              <CardRow
                meta="Request"
                title={ticket.title}
                subtitle={
                  ticket.description ||
                  ticket.completionNotes ||
                  "No description provided."
                }
                status={<StatusPill status={ticket.status} />}
                right={
                  <div className="flex items-center gap-3">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {ticket.priority}
                    </div>
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
                      onClick={() => openMessages(ticket)}
                    >
                      Questions
                    </button>
                  </div>
                }
              />
              {ticket.assignedAgentName ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                  Assigned agent:{" "}
                  <span className="text-slate-900">
                    {ticket.assignedAgentName}
                  </span>
                </div>
              ) : null}
              {ticket.completionAttachments?.length ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Completion attachments
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ticket.completionAttachments.map((file) => (
                      <a
                        key={file.url}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-700 underline"
                      >
                        {file.fileName || "Attachment"}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No requests yet"
          body="Create a new request and track it here."
          actionLabel="New request"
          onAction={() => (window.location.href = "/requests/new")}
        />
      )}

      {messageModal.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="text-lg font-semibold text-slate-900">
              Request questions
            </div>
            <div className="mt-1 text-sm text-slate-500">
              {messageModal.ticket?.title}
            </div>

            <div className="mt-4 max-h-80 space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
              {messagesState.loading ? (
                <div className="text-sm text-slate-500">Loading messages…</div>
              ) : messagesState.error ? (
                <div className="text-sm text-rose-600">{messagesState.error}</div>
              ) : messagesState.data.length ? (
                messagesState.data.map((msg, index) => (
                  <div
                    key={`${msg.createdAt}-${index}`}
                    className="rounded-xl border border-slate-200 bg-white p-3"
                  >
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      {msg.senderRole || "User"} ·{" "}
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleString()
                        : ""}
                    </div>
                    <div className="mt-2 text-sm text-slate-700">{msg.body}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500">No messages yet.</div>
              )}
            </div>

            <form onSubmit={sendMessage} className="mt-4 space-y-3">
              <textarea
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                rows={3}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Ask a question to management"
                required
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    setMessageModal({ open: false, ticket: null });
                    setMessagesState({ loading: false, error: null, data: [] });
                    setMessageBody("");
                  }}
                  disabled={sendingMessage}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-slate-900 px-4 py-2 text-xs text-white disabled:opacity-60"
                  disabled={sendingMessage}
                >
                  {sendingMessage ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
