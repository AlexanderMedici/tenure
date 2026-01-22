import { useEffect, useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import { Button } from "../../components/ui/button";
import { serviceAgentApi } from "../../app/api";
import { useAuth } from "../../app/auth";
import StatusPill from "../../components/StatusPill";

const ROLE_OPTIONS = [
  "plumber",
  "electrician",
  "handyman",
  "hvac",
  "cleaning",
  "other",
];

export default function ServiceAgents() {
  const { scope } = useAuth();
  const buildingId = scope?.buildingId || scope?.buildingIds?.[0];
  const [filters, setFilters] = useState({ q: "", role: "", status: "" });
  const [form, setForm] = useState({
    name: "",
    role: "handyman",
    email: "",
    phone: "",
    company: "",
  });
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: [],
  });

  const loadAgents = async () => {
    if (!buildingId) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await serviceAgentApi.list(buildingId, filters);
      setState({ loading: false, error: null, data: data.data || [] });
    } catch (err) {
      setState({ loading: false, error: err.message, data: [] });
    }
  };

  useEffect(() => {
    loadAgents();
  }, [buildingId, filters.q, filters.role, filters.status]);

  const createAgent = async (event) => {
    event.preventDefault();
    try {
      await serviceAgentApi.create(buildingId, form);
      setForm({
        name: "",
        role: "handyman",
        email: "",
        phone: "",
        company: "",
      });
      await loadAgents();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message }));
    }
  };

  const deleteAgent = async (id) => {
    try {
      await serviceAgentApi.remove(buildingId, id);
      await loadAgents();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message }));
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Service agents"
        subtitle="Add plumbers, electricians, and vendors for quick dispatch."
      />

      <form
        onSubmit={createAgent}
        className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4"
      >
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <select
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="Company"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <Button type="submit">Add agent</Button>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="Search name, email, company"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          />
          <select
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          >
            <option value="">All roles</option>
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <select
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {state.error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {state.error}
          </div>
        ) : null}

        <div className="space-y-3">
          {state.data.map((agent) => (
            <div
              key={agent._id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 px-4 py-3 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {agent.name}
                </div>
                <div className="text-xs text-slate-500">
                  {agent.company || "Independent"} · {agent.email || "No email"} ·{" "}
                  {agent.phone || "No phone"}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={agent.status} />
                <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-slate-600">
                  {agent.role}
                </span>
                <Button variant="outline" onClick={() => deleteAgent(agent._id)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
          {!state.loading && !state.data.length ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              No service agents yet.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
