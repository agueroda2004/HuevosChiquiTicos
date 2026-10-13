import { Navigate, Route, Routes } from "react-router-dom";

import AccountingReportsPage from "./features/accounting/page/reports";
import BillsPage from "./features/bills/page/bills";
import CagesPage from "./features/cages/page/cages";
import CustomersPage from "./features/customers/page/customers";
import DeathsPage from "./features/deaths/page/deaths";
import DiscardsPage from "./features/discards/page/discards";
import EggCollectionsPage from "./features/egg-collections/page/egg-collections";
import EntriesPage from "./features/entries/page/entries";
import InvoicesPage from "./features/invoices/page/invoices";
import MedicationApplicationsPage from "./features/medication-applications/page/medication-applications";
import MedicationsPage from "./features/medications/page/medications";
import OrdersPage from "./features/orders/page/orders";
import ProductsPage from "./features/products/page/products";
import ReportsPage from "./features/reports/page/reports";
import SuppliersPage from "./features/suppliers/page/suppliers";
import DashboardPage from "./features/dashboard/page/dashboard";
import LoginPage from "./features/auth/page/login";
import { AppLayout } from "./shared/components/layout/AppLayout";
import { ProtectedRoute } from "./shared/components/ProtectedRoute";
import { PublicOnlyRoute } from "./shared/components/PublicOnlyRoute";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/sign-in" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="production/cages" element={<CagesPage />} />
          <Route path="production/reports" element={<ReportsPage />} />
          <Route path="production/egg-collections" element={<EggCollectionsPage />} />
          <Route path="production/deaths" element={<DeathsPage />} />
          <Route path="production/entries" element={<EntriesPage />} />
          <Route path="production/discards" element={<DiscardsPage />} />
          <Route path="production/medications" element={<MedicationsPage />} />
          <Route
            path="production/medication-applications"
            element={<MedicationApplicationsPage />}
          />
          <Route path="accounting/customers" element={<CustomersPage />} />
          <Route path="accounting/bills" element={<BillsPage />} />
          <Route path="accounting/invoices" element={<InvoicesPage />} />
          <Route path="accounting/orders" element={<OrdersPage />} />
          <Route path="accounting/products" element={<ProductsPage />} />
          <Route path="accounting/suppliers" element={<SuppliersPage />} />
          <Route path="accounting/reports" element={<AccountingReportsPage />} />
          <Route path="accounting" element={<Navigate to="/accounting/reports" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
