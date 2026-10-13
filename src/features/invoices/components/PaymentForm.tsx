import { useState, type FormEvent } from "react";

import { DatePicker } from "../../../shared/components/DatePicker";
import { Dropdown } from "../../../shared/components/Dropdown";
import { formatCurrency } from "../../../shared/utils/currency";
import { todayIso } from "../../../shared/utils/date";
import { PAYMENT_METHOD_OPTIONS } from "../constants";
import type { PaymentInput, PaymentMethod } from "../domain/invoice";
import { paymentSchema } from "../validations/payment.validator";

type PaymentFormProps = {
  isSubmitting: boolean;
  error?: string | null;
  maxAmount?: number;
  onSubmit: (input: PaymentInput) => void;
};

type FieldErrors = Partial<Record<"date" | "amount" | "reference" | "notes", string>>;

const inputClassName =
  "w-full rounded-xl border border-secondary/30 bg-white px-4 py-3 text-base text-third outline-none transition placeholder:text-secondary/60 focus:border-secondary focus:ring-2 focus:ring-secondary/30";

export function PaymentForm({ isSubmitting, error, maxAmount, onSubmit }: PaymentFormProps) {
  const [date, setDate] = useState(todayIso());
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const parsedAmount = Number(amount);
  const hasValidPreview = amount.trim() !== "" && !Number.isNaN(parsedAmount);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = paymentSchema.safeParse({ date, amount, method, reference, notes });
    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (
          (field === "date" ||
            field === "amount" ||
            field === "reference" ||
            field === "notes") &&
          !errors[field]
        ) {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    if (typeof maxAmount === "number" && result.data.amount > maxAmount + 1e-6) {
      setFieldErrors({
        amount: `El monto no puede superar el saldo pendiente de ${formatCurrency(maxAmount)}.`,
      });
      return;
    }

    onSubmit({
      date: result.data.date,
      amount: result.data.amount,
      method: result.data.method,
      reference: result.data.reference === "" ? null : result.data.reference,
      notes: result.data.notes === "" ? null : result.data.notes,
    });

    setDate(todayIso());
    setAmount("");
    setMethod("cash");
    setReference("");
    setNotes("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="payment-date" className="text-xs font-medium text-third">
            Fecha
          </label>
          <DatePicker
            id="payment-date"
            value={date}
            onChange={setDate}
            invalid={Boolean(fieldErrors.date)}
          />
          {fieldErrors.date && <p className="text-xs text-red-500">{fieldErrors.date}</p>}
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="payment-amount" className="text-xs font-medium text-third">
            Monto
          </label>
          <input
            id="payment-amount"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            placeholder="Ej. 5000"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className={inputClassName}
          />
          {hasValidPreview && (
            <p className="text-sm font-semibold text-secondary">{formatCurrency(parsedAmount)}</p>
          )}
          {typeof maxAmount === "number" && (
            <p className="text-xs text-secondary">
              Saldo pendiente: {formatCurrency(maxAmount)}
            </p>
          )}
          {fieldErrors.amount && <p className="text-xs text-red-500">{fieldErrors.amount}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="payment-method" className="text-xs font-medium text-third">
          Método de pago
        </label>
        <Dropdown
          id="payment-method"
          value={method}
          options={PAYMENT_METHOD_OPTIONS}
          onChange={setMethod}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="payment-reference" className="text-xs font-medium text-third">
          Referencia <span className="text-secondary/60">(opcional)</span>
        </label>
        <input
          id="payment-reference"
          type="text"
          maxLength={200}
          placeholder="Ej. No. de comprobante"
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          className={inputClassName}
        />
        {fieldErrors.reference && <p className="text-xs text-red-500">{fieldErrors.reference}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="payment-notes" className="text-xs font-medium text-third">
          Notas <span className="text-secondary/60">(opcional)</span>
        </label>
        <textarea
          id="payment-notes"
          rows={2}
          maxLength={1000}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className={`${inputClassName} resize-none`}
        />
        {fieldErrors.notes && <p className="text-xs text-red-500">{fieldErrors.notes}</p>}
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl border border-secondary/40 px-4 py-2.5 text-sm font-semibold text-secondary transition hover:bg-secondary/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Registrando..." : "Registrar pago"}
      </button>
    </form>
  );
}
