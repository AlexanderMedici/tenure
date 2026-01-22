import { useAuth } from "../../app/auth";
import SectionHeader from "../../components/SectionHeader";

export default function ResidentProfile() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Profile"
        subtitle="Manage your contact and notification settings."
      />
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Account
        </div>
        <div className="mt-4 space-y-3 text-sm text-slate-700">
          <div>
            <span className="text-slate-500">Name</span>
            <div className="text-slate-900">{user?.name || "Resident"}</div>
          </div>
          <div>
            <span className="text-slate-500">Email</span>
            <div className="text-slate-900">{user?.email || "-"}</div>
          </div>
          <div>
            <span className="text-slate-500">Role</span>
            <div className="text-slate-900">{user?.role || "-"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
