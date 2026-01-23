import { useEffect, useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import DataTable from "../../components/DataTable";
import ListSkeleton from "../../components/ListSkeleton";
import { apiFetch, withBuildingId } from "../../app/api";
import { useAuth } from "../../app/auth";
import { notifyInfo } from "../../app/toast";

export default function ResidentPayments() {
  const [state, setState] = useState({ loading: true, error: null, data: [] });
  const { scope } = useAuth();

  useEffect(() => {
    let active = true;
    apiFetch(withBuildingId("/api/invoices", scope?.buildingId))
      .then((data) => {
        if (active) setState({ loading: false, error: null, data: data.data });
      })
      .catch((err) => {
        if (active) setState({ loading: false, error: err.message, data: [] });
      });
    return () => {
      active = false;
    };
  }, []);

  const rows = state.data.map((invoice) => ({
    id: invoice._id,
    dueDate: new Date(invoice.dueDate || invoice.createdAt).toLocaleDateString(),
    amount: invoice.amount?.toLocaleString("en-US", {
      style: "currency",
      currency: invoice.currency || "USD",
    }),
    status: invoice.status,
    action:
      invoice.status === "paid" || invoice.status === "void" ? (
        <span className="text-slate-400">-</span>
      ) : (
        <button
          type="button"
          onClick={() => notifyInfo("Payments are coming soon.")}
          className="rounded-full bg-slate-900 px-3 py-1 text-xs text-white"
        >
          Pay
        </button>
      ),
  }));

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Payments"
        subtitle="Invoices, balances, and payment status."
      />

      {state.loading ? (
        <ListSkeleton count={2} />
      ) : state.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {state.error}
        </div>
      ) : (
        <DataTable
          columns={[
            { key: "dueDate", label: "Due", className: "md:col-span-3" },
            { key: "amount", label: "Amount", className: "md:col-span-3" },
            { key: "status", label: "Status", className: "md:col-span-3" },
            { key: "action", label: "Pay", className: "md:col-span-3" },
          ]}
          rows={rows}
          emptyLabel="No invoices yet."
        />
      )}
    </div>
  );
}
