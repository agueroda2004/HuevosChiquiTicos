import { accountingReportsHttpService } from "../features/accounting/services/accounting-reports.http.service";
import { accountingReportsLocalService } from "../features/accounting/services/accounting-reports.local.service";
import type { AccountingReportsPort } from "../features/accounting/domain/accounting-report.ports";
import { billsHttpService } from "../features/bills/services/bills.http.service";
import { billsLocalService } from "../features/bills/services/bills.local.service";
import type { BillsPort } from "../features/bills/domain/bill.ports";
import { cagesHttpService } from "../features/cages/services/cages.http.service";
import { cagesLocalService } from "../features/cages/services/cages.local.service";
import type { CagesPort } from "../features/cages/domain/cage.ports";
import { customersHttpService } from "../features/customers/services/customers.http.service";
import { customersLocalService } from "../features/customers/services/customers.local.service";
import type { CustomersPort } from "../features/customers/domain/customer.ports";
import { deathsHttpService } from "../features/deaths/services/deaths.http.service";
import { deathsLocalService } from "../features/deaths/services/deaths.local.service";
import type { DeathsPort } from "../features/deaths/domain/death.ports";
import { discardsHttpService } from "../features/discards/services/discards.http.service";
import { discardsLocalService } from "../features/discards/services/discards.local.service";
import type { DiscardsPort } from "../features/discards/domain/discard.ports";
import { eggCollectionsHttpService } from "../features/egg-collections/services/egg-collections.http.service";
import { eggCollectionsLocalService } from "../features/egg-collections/services/egg-collections.local.service";
import type { EggCollectionsPort } from "../features/egg-collections/domain/egg-collection.ports";
import { entriesHttpService } from "../features/entries/services/entries.http.service";
import { entriesLocalService } from "../features/entries/services/entries.local.service";
import type { EntriesPort } from "../features/entries/domain/entry.ports";
import { invoicesHttpService } from "../features/invoices/services/invoices.http.service";
import { invoicesLocalService } from "../features/invoices/services/invoices.local.service";
import type { InvoicesPort } from "../features/invoices/domain/invoice.ports";
import { medicationApplicationsHttpService } from "../features/medication-applications/services/medication-applications.http.service";
import { medicationApplicationsLocalService } from "../features/medication-applications/services/medication-applications.local.service";
import type { MedicationApplicationsPort } from "../features/medication-applications/domain/medication-application.ports";
import { medicationsHttpService } from "../features/medications/services/medications.http.service";
import { medicationsLocalService } from "../features/medications/services/medications.local.service";
import type { MedicationsPort } from "../features/medications/domain/medication.ports";
import { ordersHttpService } from "../features/orders/services/orders.http.service";
import { ordersLocalService } from "../features/orders/services/orders.local.service";
import type { OrdersPort } from "../features/orders/domain/order.ports";
import { productsHttpService } from "../features/products/services/products.http.service";
import { productsLocalService } from "../features/products/services/products.local.service";
import type { ProductsPort } from "../features/products/domain/product.ports";
import { reportsHttpService } from "../features/reports/services/reports.http.service";
import { reportsLocalService } from "../features/reports/services/reports.local.service";
import type { ReportsPort } from "../features/reports/domain/report.ports";
import { suppliersHttpService } from "../features/suppliers/services/suppliers.http.service";
import { suppliersLocalService } from "../features/suppliers/services/suppliers.local.service";
import type { SuppliersPort } from "../features/suppliers/domain/supplier.ports";
import { env } from "./env";

function selectService<T>(local: T, http: T): T {
  return env.dataSource === "production" ? http : local;
}

export const cagesService: CagesPort = selectService(cagesLocalService, cagesHttpService);

export const billsService: BillsPort = selectService(billsLocalService, billsHttpService);

export const accountingReportsService: AccountingReportsPort = selectService(
  accountingReportsLocalService,
  accountingReportsHttpService,
);

export const customersService: CustomersPort = selectService(
  customersLocalService,
  customersHttpService,
);

export const eggCollectionsService: EggCollectionsPort = selectService(
  eggCollectionsLocalService,
  eggCollectionsHttpService,
);

export const deathsService: DeathsPort = selectService(deathsLocalService, deathsHttpService);

export const entriesService: EntriesPort = selectService(entriesLocalService, entriesHttpService);

export const discardsService: DiscardsPort = selectService(
  discardsLocalService,
  discardsHttpService,
);

export const medicationsService: MedicationsPort = selectService(
  medicationsLocalService,
  medicationsHttpService,
);

export const medicationApplicationsService: MedicationApplicationsPort = selectService(
  medicationApplicationsLocalService,
  medicationApplicationsHttpService,
);

export const suppliersService: SuppliersPort = selectService(
  suppliersLocalService,
  suppliersHttpService,
);

export const productsService: ProductsPort = selectService(
  productsLocalService,
  productsHttpService,
);

export const reportsService: ReportsPort = selectService(
  reportsLocalService,
  reportsHttpService,
);

export const ordersService: OrdersPort = selectService(ordersLocalService, ordersHttpService);

export const invoicesService: InvoicesPort = selectService(
  invoicesLocalService,
  invoicesHttpService,
);
