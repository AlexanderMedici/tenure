import SectionHeader from "../../components/SectionHeader";
import EmptyState from "../../components/EmptyState";

export default function MgmtUsers() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Users"
        subtitle="Manage staff and resident access."
      />
      <EmptyState
        title="No users loaded"
        body="Add filters or create users to populate this list."
      />
    </div>
  );
}
