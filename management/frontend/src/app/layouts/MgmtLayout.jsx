import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/auth";
import { Button } from "../../components/ui/button";
import { authApi } from "../../app/api";

const navItems = [
  { to: "/mgmt", label: "Overview" },
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
  const { scope, refresh } = useAuth();
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
