import { useState } from "react";

import { formatCurrency } from "../../../shared/utils/currency";
import { toIsoDate } from "../../../shared/utils/date";
import { AccountingListCard, type AccountingListRow } from "../components/AccountingListCard";
import {
  AccountingRangeFilter,
  type AccountingFiltersValue,
} from "../components/AccountingRangeFilter";
import { AccountingSkeleton } from "../components/AccountingSkeleton";
import { AccountingSummaryCards } from "../components/AccountingSummaryCards";
import { useAccountingReport } from "../hooks/useAccountingReport";

function defaultFilters(): AccountingFiltersValue {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);

  return { from: toIsoDate(from), to: toIsoDate(to) };
}

export default function AccountingReportsPage() {
  const [filters, setFilters] = useState<AccountingFiltersValue>(defaultFilters);
  const { report, isLoading, error } = useAccountingReport({
    from: filters.from,
    to: filters.to,
    topLimit: 5,
  });

  const customerRows: AccountingListRow[] = (report?.topCustomers ?? []).map((item) => ({
    id: item.id,
    title: item.name,
    value: formatCurrency(item.outstanding),
  }));

  const supplierRows: AccountingListRow[] = (report?.topSuppliers ?? []).map((item) => ({
    id: item.id,
    title: item.name,
    value: formatCurrency(item.outstanding),
  }));

  const productRows: AccountingListRow[] = (report?.topProducts ?? []).map((item) => ({
    id: item.productId,
    title: item.name,
    subtitle: `${item.quantity} unidades`,
    value: formatCurrency(item.amount),
  }));

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-third">Reportes contables</h1>
        <p className="mt-1 text-sm text-secondary">
          Cuentas por cobrar, cuentas por pagar y flujo de caja
        </p>
      </header>

      <AccountingRangeFilter value={filters} onChange={setFilters} />

      {isLoading && <AccountingSkeleton />}

      {!isLoading && error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {!isLoading && !error && report && (
        <div className="flex flex-col gap-6">
          <AccountingSummaryCards report={report} />

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-secondary/20 bg-white/80 p-4 shadow-sm">
              <p className="text-xs text-secondary">Facturado por cobrar (rango)</p>
              <p className="mt-1 text-lg font-semibold text-third">
                {formatCurrency(report.receivables.invoicedInRange)}
              </p>
            </div>
            <div className="rounded-2xl border border-secondary/20 bg-white/80 p-4 shadow-sm">
              <p className="text-xs text-secondary">Facturado por pagar (rango)</p>
              <p className="mt-1 text-lg font-semibold text-third">
                {formatCurrency(report.payables.invoicedInRange)}
              </p>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <AccountingListCard
              title="Top clientes por saldo"
              rows={customerRows}
              emptyLabel="Sin saldos por cobrar."
            />
            <AccountingListCard
              title="Top proveedores por saldo"
              rows={supplierRows}
              emptyLabel="Sin saldos por pagar."
            />
            <AccountingListCard
              title="Top productos facturados"
              rows={productRows}
              emptyLabel="Sin productos facturados en el rango."
            />
          </div>
        </div>
      )}
    </div>
  );
}
