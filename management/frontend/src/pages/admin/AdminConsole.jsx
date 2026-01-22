import { useEffect, useMemo, useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import { Button } from "../../components/ui/button";
import { adminApi, adminExportUrl } from "../../app/api";
import { useAuth } from "../../app/auth";
import StatusPill from "../../components/StatusPill";

const roleLabel = (role) =>
  role === "management" ? "Management" : role === "resident" ? "Resident" : "Admin";

export default function AdminConsole() {
  const { scope } = useAuth();
  const [buildingId, setBuildingId] = useState(
    scope?.buildingId || scope?.buildingIds?.[0] || ""
  );
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [state, setState] = useState({
    loading: true,
    error: null,
    management: [],
    residents: [],
  });
  const [exportForm, setExportForm] = useState({
    threadId: "",
    communityFormat: "pdf",
    threadFormat: "pdf",
  });
  const [deleteForm, setDeleteForm] = useState({
    communityMessageId: "",
    threadId: "",
    threadMessageId: "",
  });

  const canFetch = useMemo(() => Boolean(buildingId), [buildingId]);

  const loadUsers = async () => {
    if (!buildingId) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [management, residents] = await Promise.all([
        adminApi.listUsers(buildingId, "management"),
        adminApi.listUsers(buildingId, "resident"),
      ]);
      setState({
        loading: false,
        error: null,
        management: management.data || [],
        residents: residents.data || [],
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.message,
      }));
    }
  };

  useEffect(() => {
    if (canFetch) loadUsers();
  }, [canFetch]);

  const createAdmin = async (event) => {
    event.preventDefault();
    try {
      await adminApi.createAdmin(buildingId, adminForm);
      setAdminForm({ name: "", email: "", password: "" });
      await loadUsers();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message }));
    }
  };

  const updateRole = async (id, role) => {
    try {
      await adminApi.updateUser(buildingId, id, { role });
      await loadUsers();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message }));
    }
  };

  const deleteUser = async (id) => {
    try {
      await adminApi.deleteUser(buildingId, id);
      await loadUsers();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message }));
    }
  };

  const deleteCommunityMessage = async () => {
    try {
      await adminApi.deleteCommunityMessage(
        buildingId,
        deleteForm.communityMessageId
      );
      setDeleteForm((prev) => ({ ...prev, communityMessageId: "" }));
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message }));
    }
  };

  const deleteThreadMessage = async () => {
    try {
      await adminApi.deleteThreadMessage(
        buildingId,
        deleteForm.threadId,
        deleteForm.threadMessageId
      );
      setDeleteForm((prev) => ({
        ...prev,
        threadId: "",
        threadMessageId: "",
      }));
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message }));
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Admin Console"
        subtitle="Create admins, manage management access, and remove tenant emails."
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Building ID
          </label>
          <input
            className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={buildingId}
            onChange={(e) => setBuildingId(e.target.value)}
            placeholder="Paste buildingId"
          />
        </div>
        <div className="text-xs text-slate-500">
          Admin actions are scoped to the buildingId above.
        </div>
      </div>

      <form
        onSubmit={createAdmin}
        className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4"
      >
        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Create admin
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="Name"
            value={adminForm.name}
            onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
          />
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="Email"
            value={adminForm.email}
            onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
            required
          />
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="Temp password"
            value={adminForm.password}
            onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
            required
          />
        </div>
        <Button type="submit">Create admin</Button>
      </form>

      {state.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {state.error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="text-sm font-semibold">Management</div>
          <div className="mt-4 space-y-4">
            {state.management.map((user) => (
              <div key={user._id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {user.name || user.email}
                  </div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill status="published" />
                  <Button
                    variant="outline"
                    onClick={() => updateRole(user._id, "resident")}
                  >
                    Demote
                  </Button>
                  <Button variant="outline" onClick={() => deleteUser(user._id)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            {!state.management.length && !state.loading ? (
              <div className="text-sm text-slate-500">No management users.</div>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="text-sm font-semibold">Residents</div>
          <div className="mt-4 space-y-4">
            {state.residents.map((user) => (
              <div key={user._id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {user.name || user.email}
                  </div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill status="pending" />
                  <Button
                    variant="outline"
                    onClick={() => updateRole(user._id, "management")}
                  >
                    Promote
                  </Button>
                  <Button variant="outline" onClick={() => deleteUser(user._id)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            {!state.residents.length && !state.loading ? (
              <div className="text-sm text-slate-500">No residents found.</div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
        <div className="text-sm font-semibold">Admin exports</div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Community chat
            </div>
            <select
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={exportForm.communityFormat}
              onChange={(e) =>
                setExportForm((prev) => ({
                  ...prev,
                  communityFormat: e.target.value,
                }))
              }
            >
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
            </select>
            <Button
              onClick={() =>
                window.open(
                  adminExportUrl(
                    "/api/admin/exports/community",
                    buildingId,
                    exportForm.communityFormat
                  ),
                  "_blank"
                )
              }
            >
              Download community
            </Button>
          </div>

          <div className="space-y-3">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Thread export
            </div>
            <input
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="Thread ID"
              value={exportForm.threadId}
              onChange={(e) =>
                setExportForm((prev) => ({
                  ...prev,
                  threadId: e.target.value,
                }))
              }
            />
            <select
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={exportForm.threadFormat}
              onChange={(e) =>
                setExportForm((prev) => ({
                  ...prev,
                  threadFormat: e.target.value,
                }))
              }
            >
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
            </select>
            <Button
              onClick={() =>
                window.open(
                  adminExportUrl(
                    `/api/admin/exports/threads/${exportForm.threadId}`,
                    buildingId,
                    exportForm.threadFormat
                  ),
                  "_blank"
                )
              }
              disabled={!exportForm.threadId}
            >
              Download thread
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
        <div className="text-sm font-semibold">Admin deletes</div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Community message
            </div>
            <input
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="Message ID"
              value={deleteForm.communityMessageId}
              onChange={(e) =>
                setDeleteForm((prev) => ({
                  ...prev,
                  communityMessageId: e.target.value,
                }))
              }
            />
            <Button
              variant="outline"
              onClick={deleteCommunityMessage}
              disabled={!deleteForm.communityMessageId}
            >
              Delete message
            </Button>
          </div>

          <div className="space-y-3">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Thread message
            </div>
            <input
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="Thread ID"
              value={deleteForm.threadId}
              onChange={(e) =>
                setDeleteForm((prev) => ({ ...prev, threadId: e.target.value }))
              }
            />
            <input
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="Message ID"
              value={deleteForm.threadMessageId}
              onChange={(e) =>
                setDeleteForm((prev) => ({
                  ...prev,
                  threadMessageId: e.target.value,
                }))
              }
            />
            <Button
              variant="outline"
              onClick={deleteThreadMessage}
              disabled={!deleteForm.threadId || !deleteForm.threadMessageId}
            >
              Delete thread message
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
