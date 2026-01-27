import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { authApi } from "../../app/api";
import { useAuth } from "../../app/auth";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/payments", label: "Payments" },
  { to: "/lease", label: "Lease" },
  { to: "/requests", label: "Requests" },
  { to: "/announcements", label: "Announcements" },
  { to: "/community", label: "Community" },
  { to: "/profile", label: "Profile" },
];

export default function ResidentLayout() {
  const navigate = useNavigate();
  const { refresh } = useAuth();

  const onLogout = async () => {
    await authApi.logout();
    await refresh();
    navigate("/login", { replace: true });
  };
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="text-sm font-semibold tracking-wide">TENURE</div>
          <nav className="hidden gap-4 text-sm md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? "text-slate-900" : "text-slate-500"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <Button variant="outline" onClick={onLogout} className="hidden md:inline-flex">
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white md:hidden">
        <div className="mx-auto grid max-w-6xl grid-cols-5 gap-2 px-2 py-2 text-[11px]">
          {navItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 ${
                  isActive ? "text-slate-900" : "text-slate-500"
                }`
              }
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
