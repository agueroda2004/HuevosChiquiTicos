import { useState, type FormEvent } from "react";

import { DatePicker } from "../../../shared/components/DatePicker";
import { Dropdown, type DropdownOption } from "../../../shared/components/Dropdown";
import { formatCurrency } from "../../../shared/utils/currency";
import { todayIso } from "../../../shared/utils/date";
import type { Order } from "../../orders/domain/order";
import type { Product } from "../../products/domain/product";
import type {
  CreateInvoiceInput,
  InvoiceItemInput,
  UpdateInvoiceInput,
} from "../domain/invoice";
import { computeInvoiceTotal } from "../utils";
import { invoiceSchema } from "../validations/invoice.validator";
import { InvoiceItemsEditor } from "./InvoiceItemsEditor";
import { InvoiceItemsSummary } from "./InvoiceItemsSummary";

type CommonProps = {
  customerOptions: DropdownOption[];
  orderOptions: DropdownOption[];
  orders: Order[];
  products: Product[];
  number?: string;
  itemsLocked?: boolean;
  isSubmitting: boolean;
  error: string | null;
};

type CreateModeProps = CommonProps & {
  mode: "create";
  onSubmit: (input: CreateInvoiceInput, paid: boolean) => void;
};

type EditModeProps = CommonProps & {
  mode: "edit";
  initialValues: UpdateInvoiceInput & { paid: boolean };
  onSubmit: (input: UpdateInvoiceInput, paid: boolean) => void;
};

type InvoiceFormProps = CreateModeProps | EditModeProps;

type FieldErrors = Partial<
  Record<"customerId" | "issueDate" | "dueDate" | "items", string>
>;

function collectFieldErrors(issues: { path: PropertyKey[]; message: string }[]): FieldErrors {
  return issues.reduce<FieldErrors>((accumulator, issue) => {
    const field = issue.path[0];
    if (
      (field === "customerId" ||
        field === "issueDate" ||
        field === "dueDate" ||
        field === "items") &&
      !accumulator[field]
    ) {
      accumulator[field] = issue.message;
    }
    return accumulator;
  }, {});
}

export function InvoiceForm(props: InvoiceFormProps) {
  const [customerId, setCustomerId] = useState(
    props.mode === "edit" ? props.initialValues.customerId : "",
  );
  const [orderId, setOrderId] = useState(
    props.mode === "edit" ? props.initialValues.orderId ?? "" : "",
  );
  const [issueDate, setIssueDate] = useState(
    props.mode === "edit" ? props.initialValues.issueDate : todayIso(),
  );
  const [dueDate, setDueDate] = useState(
    props.mode === "edit" ? props.initialValues.dueDate : "",
  );
  const [items, setItems] = useState<InvoiceItemInput[]>(
    props.mode === "edit" ? props.initialValues.items : [],
  );
  const [paid, setPaid] = useState(props.mode === "edit" ? props.initialValues.paid : false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const orderDropdownOptions: DropdownOption[] = [
    { value: "", label: "Sin pedido" },
    ...props.orderOptions,
  ];

  const handleSelectOrder = (id: string) => {
    setOrderId(id);

    const order = props.orders.find((candidate) => candidate.id === id);
    if (!order) return;

    setCustomerId(order.customerId);
    setItems(
      order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = invoiceSchema.safeParse({ customerId, orderId, issueDate, dueDate, items });
    if (!result.success) {
      setFieldErrors(collectFieldErrors(result.error.issues));
      return;
    }

    setFieldErrors({});

    if (props.mode === "edit") {
      props.onSubmit(
        {
          id: props.initialValues.id,
          customerId: result.data.customerId,
          orderId: orderId === "" ? null : orderId,
          issueDate: result.data.issueDate,
          dueDate: result.data.dueDate,
          items: result.data.items,
        },
        paid,
      );
      return;
    }

    props.onSubmit(
      {
        customerId: result.data.customerId,
        orderId: orderId === "" ? null : orderId,
        issueDate: result.data.issueDate,
        dueDate: result.data.dueDate,
        items: result.data.items,
      },
      paid,
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex items-center justify-between rounded-xl border border-secondary/20 bg-white/60 px-4 py-3">
        <span className="text-xs text-secondary">Número de factura</span>
        <span className="text-sm font-semibold text-third">
          {props.number ?? "Se generará automáticamente"}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="invoice-order" className="text-xs font-medium text-third">
          Pedido <span className="text-secondary/60">(opcional)</span>
        </label>
        <Dropdown
          id="invoice-order"
          value={orderId}
          options={orderDropdownOptions}
          onChange={handleSelectOrder}
          placeholder="Sin pedido"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="invoice-customer" className="text-xs font-medium text-third">
          Cliente
        </label>
        <Dropdown
          id="invoice-customer"
          value={customerId}
          options={props.customerOptions}
          onChange={setCustomerId}
          placeholder="Selecciona un cliente"
          invalid={Boolean(fieldErrors.customerId)}
        />
        {fieldErrors.customerId && (
          <p className="text-xs text-red-500">{fieldErrors.customerId}</p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="invoice-issue" className="text-xs font-medium text-third">
            Fecha de emisión
          </label>
          <DatePicker
            id="invoice-issue"
            value={issueDate}
            onChange={setIssueDate}
            invalid={Boolean(fieldErrors.issueDate)}
          />
          {fieldErrors.issueDate && (
            <p className="text-xs text-red-500">{fieldErrors.issueDate}</p>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="invoice-due" className="text-xs font-medium text-third">
            Fecha de vencimiento
          </label>
          <DatePicker
            id="invoice-due"
            value={dueDate}
            onChange={setDueDate}
            min={issueDate || undefined}
            invalid={Boolean(fieldErrors.dueDate)}
          />
          {fieldErrors.dueDate && (
            <p className="text-xs text-red-500">{fieldErrors.dueDate}</p>
          )}
        </div>
      </div>

      {props.itemsLocked ? (
        <div className="flex flex-col gap-3">
          <span className="text-xs font-medium text-third">Productos de la factura</span>
          <p className="rounded-lg bg-secondary/10 px-3 py-2 text-xs text-secondary">
            No puedes modificar los productos de una factura con pagos registrados.
          </p>
          <InvoiceItemsSummary items={items} products={props.products} />
          <div className="flex items-center justify-between rounded-xl border border-secondary/30 bg-white px-4 py-3">
            <span className="text-sm text-third">Total</span>
            <span className="text-base font-semibold text-secondary">
              {formatCurrency(computeInvoiceTotal(items))}
            </span>
          </div>
        </div>
      ) : (
        <InvoiceItemsEditor
          products={props.products}
          items={items}
          onChange={setItems}
          error={fieldErrors.items}
        />
      )}

      <div className="flex items-center justify-between rounded-xl border border-secondary/30 bg-white px-4 py-3">
        <span className="text-sm text-third">Pagada</span>
        <button
          type="button"
          role="switch"
          aria-checked={paid}
          aria-label="Pagada"
          onClick={() => setPaid((value) => !value)}
          className={`relative h-6 w-11 rounded-full transition ${
            paid ? "bg-secondary" : "bg-secondary/30"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
              paid ? "left-5" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {props.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{props.error}</p>
      )}

      <button
        type="submit"
        disabled={props.isSubmitting || props.customerOptions.length === 0}
        className="mt-1 w-full rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-primary transition hover:bg-third disabled:cursor-not-allowed disabled:opacity-60"
      >
        {props.isSubmitting
          ? "Guardando..."
          : props.mode === "edit"
            ? "Guardar cambios"
            : "Guardar factura"}
      </button>

      {props.customerOptions.length === 0 && (
        <p className="text-center text-xs text-secondary">
          Crea al menos un cliente antes de registrar facturas.
        </p>
      )}
    </form>
  );
}
