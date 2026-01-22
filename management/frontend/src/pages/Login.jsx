import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../app/api";
import { getHomeForRole, useAuth } from "../app/auth";
import { Button } from "../components/ui/button";

export default function Login() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [state, setState] = useState({ loading: false, error: null });

  const onSubmit = async (event) => {
    event.preventDefault();
    setState({ loading: true, error: null });
    try {
      const data = await authApi.login(form);
      await refresh();
      const role = data?.data?.user?.role;
      navigate(getHomeForRole(role), { replace: true });
    } catch (err) {
      setState({ loading: false, error: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
          TENURE
        </div>
        <h1 className="mt-4 text-4xl font-semibold">Sign in</h1>
        <p className="mt-2 max-w-xl text-sm text-slate-300">
          Use your management or resident credentials to access the workspace.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-10 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-6"
        >
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Email
            </label>
            <input
              className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Password
            </label>
            <input
              className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          {state.error ? (
            <div className="rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-200">
              {state.error}
            </div>
          ) : null}
          <Button type="submit" disabled={state.loading}>
            {state.loading ? "Signing in..." : "Sign in"}
          </Button>
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-xs text-slate-400 underline"
          >
            Don’t have an account? Sign up
          </button>
        </form>
      </div>
    </div>
  );
}
