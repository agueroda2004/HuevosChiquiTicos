import { useState, type FormEvent } from "react";

import { DatePicker } from "../../../shared/components/DatePicker";
import { Dropdown, type DropdownOption } from "../../../shared/components/Dropdown";
import { formatCurrency } from "../../../shared/utils/currency";
import { todayIso } from "../../../shared/utils/date";
import type { BillItemInput, CreateBillInput, UpdateBillInput } from "../domain/bill";
import { computeBillTotal } from "../utils";
import { billSchema } from "../validations/bill.validator";
import { BillItemsEditor } from "./BillItemsEditor";
import { BillItemsSummary } from "./BillItemsSummary";

type CommonProps = {
  supplierOptions: DropdownOption[];
  number?: string;
  itemsLocked?: boolean;
  isSubmitting: boolean;
  error: string | null;
};

type CreateModeProps = CommonProps & {
  mode: "create";
  onSubmit: (input: CreateBillInput, paid: boolean) => void;
};

type EditModeProps = CommonProps & {
  mode: "edit";
  initialValues: UpdateBillInput & { paid: boolean };
  onSubmit: (input: UpdateBillInput, paid: boolean) => void;
};

type BillFormProps = CreateModeProps | EditModeProps;

type FieldErrors = Partial<
  Record<"supplierId" | "supplierNumber" | "issueDate" | "dueDate" | "items", string>
>;

function collectFieldErrors(issues: { path: PropertyKey[]; message: string }[]): FieldErrors {
  return issues.reduce<FieldErrors>((accumulator, issue) => {
    const field = issue.path[0];
    if (
      (field === "supplierId" ||
        field === "supplierNumber" ||
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

const inputClassName =
  "w-full rounded-xl border border-secondary/30 bg-white px-4 py-3 text-base text-third outline-none transition placeholder:text-secondary/60 focus:border-secondary focus:ring-2 focus:ring-secondary/30";

export function BillForm(props: BillFormProps) {
  const [supplierId, setSupplierId] = useState(
    props.mode === "edit" ? props.initialValues.supplierId : "",
  );
  const [supplierNumber, setSupplierNumber] = useState(
    props.mode === "edit" ? props.initialValues.supplierNumber ?? "" : "",
  );
  const [issueDate, setIssueDate] = useState(
    props.mode === "edit" ? props.initialValues.issueDate : todayIso(),
  );
  const [dueDate, setDueDate] = useState(
    props.mode === "edit" ? props.initialValues.dueDate : "",
  );
  const [items, setItems] = useState<BillItemInput[]>(
    props.mode === "edit" ? props.initialValues.items : [],
  );
  const [paid, setPaid] = useState(props.mode === "edit" ? props.initialValues.paid : false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = billSchema.safeParse({
      supplierId,
      supplierNumber,
      issueDate,
      dueDate,
      items,
    });
    if (!result.success) {
      setFieldErrors(collectFieldErrors(result.error.issues));
      return;
    }

    setFieldErrors({});

    const values = {
      supplierId: result.data.supplierId,
      supplierNumber:
        result.data.supplierNumber === "" ? null : result.data.supplierNumber,
      issueDate: result.data.issueDate,
      dueDate: result.data.dueDate,
      items: result.data.items,
    };

    if (props.mode === "edit") {
      props.onSubmit({ id: props.initialValues.id, ...values }, paid);
      return;
    }

    props.onSubmit(values, paid);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex items-center justify-between rounded-xl border border-secondary/20 bg-white/60 px-4 py-3">
        <span className="text-xs text-secondary">Número interno</span>
        <span className="text-sm font-semibold text-third">
          {props.number ?? "Se generará automáticamente"}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="bill-supplier" className="text-xs font-medium text-third">
          Proveedor
        </label>
        <Dropdown
          id="bill-supplier"
          value={supplierId}
          options={props.supplierOptions}
          onChange={setSupplierId}
          placeholder="Selecciona un proveedor"
          invalid={Boolean(fieldErrors.supplierId)}
        />
        {fieldErrors.supplierId && (
          <p className="text-xs text-red-500">{fieldErrors.supplierId}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="bill-supplier-number" className="text-xs font-medium text-third">
          Nº de factura del proveedor <span className="text-secondary/60">(opcional)</span>
        </label>
        <input
          id="bill-supplier-number"
          type="text"
          maxLength={100}
          placeholder="Ej. 0001-2026"
          value={supplierNumber}
          onChange={(event) => setSupplierNumber(event.target.value)}
          className={inputClassName}
        />
        {fieldErrors.supplierNumber && (
          <p className="text-xs text-red-500">{fieldErrors.supplierNumber}</p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="bill-issue" className="text-xs font-medium text-third">
            Fecha de emisión
          </label>
          <DatePicker
            id="bill-issue"
            value={issueDate}
            onChange={setIssueDate}
            invalid={Boolean(fieldErrors.issueDate)}
          />
          {fieldErrors.issueDate && (
            <p className="text-xs text-red-500">{fieldErrors.issueDate}</p>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="bill-due" className="text-xs font-medium text-third">
            Fecha de vencimiento
          </label>
          <DatePicker
            id="bill-due"
            value={dueDate}
            onChange={setDueDate}
            min={issueDate || undefined}
            invalid={Boolean(fieldErrors.dueDate)}
          />
          {fieldErrors.dueDate && <p className="text-xs text-red-500">{fieldErrors.dueDate}</p>}
        </div>
      </div>

      {props.itemsLocked ? (
        <div className="flex flex-col gap-3">
          <span className="text-xs font-medium text-third">Conceptos de la factura</span>
          <p className="rounded-lg bg-secondary/10 px-3 py-2 text-xs text-secondary">
            No puedes modificar los conceptos de una factura con pagos registrados.
          </p>
          <BillItemsSummary items={items} />
          <div className="flex items-center justify-between rounded-xl border border-secondary/30 bg-white px-4 py-3">
            <span className="text-sm text-third">Total</span>
            <span className="text-base font-semibold text-secondary">
              {formatCurrency(computeBillTotal(items))}
            </span>
          </div>
        </div>
      ) : (
        <BillItemsEditor items={items} onChange={setItems} error={fieldErrors.items} />
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
        disabled={props.isSubmitting || props.supplierOptions.length === 0}
        className="mt-1 w-full rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-primary transition hover:bg-third disabled:cursor-not-allowed disabled:opacity-60"
      >
        {props.isSubmitting
          ? "Guardando..."
          : props.mode === "edit"
            ? "Guardar cambios"
            : "Guardar factura"}
      </button>

      {props.supplierOptions.length === 0 && (
        <p className="text-center text-xs text-secondary">
          Crea al menos un proveedor activo antes de registrar facturas.
        </p>
      )}
    </form>
  );
}
