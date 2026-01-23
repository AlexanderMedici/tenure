import { useEffect, useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import EmptyState from "../../components/EmptyState";
import { apiFetch } from "../../app/api";
import { useAuth } from "../../app/auth";
import { Button } from "../../components/ui/button";

export default function MgmtBuildings() {
  const { refresh } = useAuth();
  const [state, setState] = useState({ loading: true, error: null, data: [] });
  const [form, setForm] = useState({
    name: "",
    code: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
  });
  const [editingId, setEditingId] = useState(null);

  const loadBuildings = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await apiFetch("/api/buildings");
      setState({ loading: false, error: null, data: data.data || [] });
    } catch (err) {
      setState({ loading: false, error: err.message, data: [] });
    }
  };

  useEffect(() => {
    loadBuildings();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      code: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
    });
    setEditingId(null);
  };

  const startEdit = (building) => {
    setEditingId(building._id);
    setForm({
      name: building.name || "",
      code: building.code || "",
      addressLine1: building.addressLine1 || "",
      addressLine2: building.addressLine2 || "",
      city: building.city || "",
      state: building.state || "",
      postalCode: building.postalCode || "",
    });
  };

  const submitForm = async (event) => {
    event.preventDefault();
    try {
      if (!form.name) throw new Error("Name is required");
      if (editingId) {
        await apiFetch(`/api/buildings/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
      } else {
        await apiFetch("/api/buildings", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
      await refresh();
      resetForm();
      await loadBuildings();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message }));
    }
  };

  const removeBuilding = async (id) => {
    if (!confirm("Delete this building?")) return;
    try {
      await apiFetch(`/api/buildings/${id}`, { method: "DELETE" });
      await refresh();
      await loadBuildings();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message }));
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Buildings"
        subtitle="Manage building records and settings."
      />
      <form
        onSubmit={submitForm}
        className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="Building name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="Code (optional)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="Address line 1"
            value={form.addressLine1}
            onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
          />
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="Address line 2"
            value={form.addressLine2}
            onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
          />
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="State"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
          />
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="Postal code"
            value={form.postalCode}
            onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
          />
        </div>
        {state.error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {state.error}
          </div>
        ) : null}
        <div className="flex items-center gap-3">
          <Button type="submit">
            {editingId ? "Update building" : "Add building"}
          </Button>
          {editingId ? (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>

      {state.loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading buildings…
        </div>
      ) : state.data.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {state.data.map((building) => (
            <div
              key={building._id}
              className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2"
            >
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Building
              </div>
              <div className="text-lg font-semibold text-slate-900">
                {building.name}
              </div>
              <div className="text-sm text-slate-500">
                {[
                  building.addressLine1,
                  building.addressLine2,
                  building.city,
                  building.state,
                  building.postalCode,
                ]
                  .filter(Boolean)
                  .join(", ") || "No address"}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  className="h-9 px-3 text-xs"
                  onClick={() => startEdit(building)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className="h-9 px-3 text-xs border-rose-200 text-rose-700 hover:bg-rose-50"
                  onClick={() => removeBuilding(building._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No buildings assigned"
          body="Create a building to begin managing assets."
        />
      )}
    </div>
  );
}
