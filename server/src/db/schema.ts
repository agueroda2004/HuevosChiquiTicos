import {
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const deathTypeEnum = pgEnum("death_type", ["sacrifice", "disease", "other"]);

export const applicationFormEnum = pgEnum("application_form", [
  "food",
  "water",
  "fumigation",
  "injection",
]);

export const orderStatusEnum = pgEnum("order_status", ["pending", "ready", "delivered"]);

export const invoiceStatusEnum = pgEnum("invoice_status", ["pending", "partial", "paid"]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "transfer",
  "card",
  "check",
  "other",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const cages = pgTable(
  "cages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    birds: integer("birds").notNull().default(0),
    active: boolean("active").notNull().default(true),
    ...timestamps,
  },
  (table) => [uniqueIndex("cages_name_idx").on(table.name)],
);

export const eggCollections = pgTable(
  "egg_collections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cageId: uuid("cage_id")
      .notNull()
      .references(() => cages.id, { onDelete: "cascade" }),
    collectionDate: date("collection_date").notNull(),
    quantity: integer("quantity").notNull(),
    ...timestamps,
  },
  (table) => [
    index("egg_collections_date_idx").on(table.collectionDate),
    index("egg_collections_cage_idx").on(table.cageId),
  ],
);

export const deaths = pgTable(
  "deaths",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cageId: uuid("cage_id")
      .notNull()
      .references(() => cages.id, { onDelete: "cascade" }),
    deathDate: date("death_date").notNull(),
    quantity: integer("quantity").notNull(),
    type: deathTypeEnum("type").notNull(),
    ...timestamps,
  },
  (table) => [
    index("deaths_date_idx").on(table.deathDate),
    index("deaths_cage_idx").on(table.cageId),
  ],
);

export const entries = pgTable(
  "entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cageId: uuid("cage_id")
      .notNull()
      .references(() => cages.id, { onDelete: "cascade" }),
    entryDate: date("entry_date").notNull(),
    quantity: integer("quantity").notNull(),
    ...timestamps,
  },
  (table) => [
    index("entries_date_idx").on(table.entryDate),
    index("entries_cage_idx").on(table.cageId),
  ],
);

export const discards = pgTable(
  "discards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cageId: uuid("cage_id")
      .notNull()
      .references(() => cages.id, { onDelete: "cascade" }),
    discardDate: date("discard_date").notNull(),
    quantity: integer("quantity").notNull(),
    ...timestamps,
  },
  (table) => [
    index("discards_date_idx").on(table.discardDate),
    index("discards_cage_idx").on(table.cageId),
  ],
);

export const medications = pgTable(
  "medications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    active: boolean("active").notNull().default(true),
    ...timestamps,
  },
  (table) => [uniqueIndex("medications_name_idx").on(table.name)],
);

export const medicationApplications = pgTable(
  "medication_applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    medicationId: uuid("medication_id")
      .notNull()
      .references(() => medications.id, { onDelete: "restrict" }),
    dose: varchar("dose", { length: 100 }).notNull(),
    applicationDate: date("application_date").notNull(),
    birdCount: integer("bird_count").notNull(),
    type: applicationFormEnum("type"),
    ...timestamps,
  },
  (table) => [index("medication_applications_date_idx").on(table.applicationDate)],
);

export const medicationApplicationCages = pgTable(
  "medication_application_cages",
  {
    applicationId: uuid("application_id")
      .notNull()
      .references(() => medicationApplications.id, { onDelete: "cascade" }),
    cageId: uuid("cage_id")
      .notNull()
      .references(() => cages.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("medication_application_cages_idx").on(table.applicationId, table.cageId),
    index("medication_application_cages_cage_idx").on(table.cageId),
  ],
);

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 100 }),
    phone: varchar("phone", { length: 8 }),
    address: text("address"),
    active: boolean("active").notNull().default(true),
    ...timestamps,
  },
  (table) => [uniqueIndex("customers_name_idx").on(table.name)],
);

export const suppliers = pgTable(
  "suppliers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 100 }),
    phone: varchar("phone", { length: 8 }),
    address: text("address"),
    active: boolean("active").notNull().default(true),
    ...timestamps,
  },
  (table) => [uniqueIndex("suppliers_name_idx").on(table.name)],
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    price: doublePrecision("price").notNull(),
    active: boolean("active").notNull().default(true),
    imageUrl: varchar("image_url", { length: 200 }),
    ...timestamps,
  },
  (table) => [uniqueIndex("products_name_idx").on(table.name)],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    deliveryDate: date("delivery_date").notNull(),
    status: orderStatusEnum("status").notNull().default("pending"),
    total: doublePrecision("total").notNull(),
    ...timestamps,
  },
  (table) => [
    index("orders_date_idx").on(table.deliveryDate),
    index("orders_customer_idx").on(table.customerId),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    unitPrice: doublePrecision("unit_price").notNull(),
    subtotal: doublePrecision("subtotal").notNull(),
  },
  (table) => [index("order_items_order_idx").on(table.orderId)],
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
    number: varchar("number", { length: 20 }).notNull(),
    issueDate: date("issue_date").notNull(),
    dueDate: date("due_date").notNull(),
    status: invoiceStatusEnum("status").notNull().default("pending"),
    total: doublePrecision("total").notNull(),
    totalPaid: doublePrecision("total_paid").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("invoices_due_date_idx").on(table.dueDate),
    index("invoices_customer_idx").on(table.customerId),
  ],
);

export const invoiceItems = pgTable(
  "invoice_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    unitPrice: doublePrecision("unit_price").notNull(),
    subtotal: doublePrecision("subtotal").notNull(),
  },
  (table) => [index("invoice_items_invoice_idx").on(table.invoiceId)],
);

export const invoicePayments = pgTable(
  "invoice_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    amount: doublePrecision("amount").notNull(),
    method: paymentMethodEnum("method").notNull().default("cash"),
    reference: varchar("reference", { length: 200 }),
    notes: text("notes"),
  },
  (table) => [index("invoice_payments_invoice_idx").on(table.invoiceId)],
);

export const bills = pgTable(
  "bills",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => suppliers.id, { onDelete: "restrict" }),
    number: varchar("number", { length: 20 }).notNull(),
    supplierNumber: varchar("supplier_number", { length: 100 }),
    issueDate: date("issue_date").notNull(),
    dueDate: date("due_date").notNull(),
    status: invoiceStatusEnum("status").notNull().default("pending"),
    total: doublePrecision("total").notNull(),
    totalPaid: doublePrecision("total_paid").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("bills_due_date_idx").on(table.dueDate),
    index("bills_supplier_idx").on(table.supplierId),
  ],
);

export const billItems = pgTable(
  "bill_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    billId: uuid("bill_id")
      .notNull()
      .references(() => bills.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    unitPrice: doublePrecision("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
    subtotal: doublePrecision("subtotal").notNull(),
  },
  (table) => [index("bill_items_bill_idx").on(table.billId)],
);

export const billPayments = pgTable(
  "bill_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    billId: uuid("bill_id")
      .notNull()
      .references(() => bills.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    amount: doublePrecision("amount").notNull(),
    method: paymentMethodEnum("method").notNull().default("cash"),
    reference: varchar("reference", { length: 200 }),
    notes: text("notes"),
  },
  (table) => [index("bill_payments_bill_idx").on(table.billId)],
);

export type CageRow = typeof cages.$inferSelect;
export type NewCageRow = typeof cages.$inferInsert;

export type EggCollectionRow = typeof eggCollections.$inferSelect;
export type NewEggCollectionRow = typeof eggCollections.$inferInsert;

export type DeathRow = typeof deaths.$inferSelect;
export type NewDeathRow = typeof deaths.$inferInsert;

export type EntryRow = typeof entries.$inferSelect;
export type NewEntryRow = typeof entries.$inferInsert;

export type DiscardRow = typeof discards.$inferSelect;
export type NewDiscardRow = typeof discards.$inferInsert;

export type MedicationRow = typeof medications.$inferSelect;
export type NewMedicationRow = typeof medications.$inferInsert;

export type MedicationApplicationRow = typeof medicationApplications.$inferSelect;
export type NewMedicationApplicationRow = typeof medicationApplications.$inferInsert;

export type CustomerRow = typeof customers.$inferSelect;
export type NewCustomerRow = typeof customers.$inferInsert;

export type SupplierRow = typeof suppliers.$inferSelect;
export type NewSupplierRow = typeof suppliers.$inferInsert;

export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;

export type OrderRow = typeof orders.$inferSelect;
export type NewOrderRow = typeof orders.$inferInsert;

export type OrderItemRow = typeof orderItems.$inferSelect;
export type NewOrderItemRow = typeof orderItems.$inferInsert;

export type InvoiceRow = typeof invoices.$inferSelect;
export type NewInvoiceRow = typeof invoices.$inferInsert;

export type InvoiceItemRow = typeof invoiceItems.$inferSelect;

export type InvoicePaymentRow = typeof invoicePayments.$inferSelect;

export type BillRow = typeof bills.$inferSelect;
export type NewBillRow = typeof bills.$inferInsert;

export type BillItemRow = typeof billItems.$inferSelect;

export type BillPaymentRow = typeof billPayments.$inferSelect;
