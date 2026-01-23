import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/auth";
import { Button } from "../../components/ui/button";
import { authApi } from "../../app/api";

const navItems = [
  { to: "/mgmt", label: "Overview" },
  { to: "/mgmt/profile", label: "Profile" },
  { to: "/mgmt/messages", label: "Messages" },
  { to: "/mgmt/requests", label: "Requests" },
  { to: "/mgmt/announcements", label: "Announcements" },
  { to: "/mgmt/billing", label: "Billing" },
  { to: "/mgmt/community", label: "Community" },
  { to: "/mgmt/leases", label: "Leases" },
  { to: "/mgmt/service-agents", label: "Service Agents" },
  { to: "/mgmt/buildings", label: "Buildings" },
  { to: "/mgmt/users", label: "Users" },
];

export default function MgmtLayout() {
  const { scope, refresh, activeBuildingId, setActiveBuildingId } = useAuth();
  const navigate = useNavigate();
  const items = scope?.role === "admin"
    ? [...navItems, { to: "/admin", label: "Admin" }]
    : navItems;
  const onLogout = async () => {
    await authApi.logout();
    await refresh();
    navigate("/login", { replace: true });
  };
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-0 hidden h-screen w-64 flex-col gap-2 border-r border-slate-200 bg-white p-4 lg:flex">
          <div className="mb-4 text-sm font-semibold tracking-wide">TENURE</div>
          {scope?.buildingIds?.length ? (
            <div className="mb-3">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Building
              </div>
              <select
                className="mt-2 w-full rounded-md border border-slate-200 px-2 py-2 text-sm"
                value={activeBuildingId || ""}
                onChange={(e) => setActiveBuildingId(e.target.value)}
              >
                {scope.buildingIds.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-600"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="mt-auto">
            <Button variant="outline" onClick={onLogout} className="w-full">
              Sign out
            </Button>
          </div>
        </aside>

        <div className="flex-1">
          <header className="border-b border-slate-200 bg-white lg:hidden">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
              <div className="text-sm font-semibold tracking-wide">TENURE</div>
              {scope?.buildingIds?.length ? (
                <select
                  className="rounded-md border border-slate-200 px-2 py-1 text-xs"
                  value={activeBuildingId || ""}
                  onChange={(e) => setActiveBuildingId(e.target.value)}
                >
                  {scope.buildingIds.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
              ) : null}
              <Button variant="outline" onClick={onLogout}>
                Sign out
              </Button>
            </div>
          </header>
          <main className="px-4 py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
