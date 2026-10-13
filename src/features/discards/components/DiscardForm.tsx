import { useState, type FormEvent } from "react";

import { DatePicker } from "../../../shared/components/DatePicker";
import { Dropdown, type DropdownOption } from "../../../shared/components/Dropdown";
import { todayIso } from "../../../shared/utils/date";
import type { CreateDiscardInput, UpdateDiscardInput } from "../domain/discard";
import { discardSchema } from "../validations/discard.validator";

type CommonProps = {
  cageOptions: DropdownOption[];
  isSubmitting: boolean;
  error: string | null;
};

type CreateModeProps = CommonProps & {
  mode: "create";
  onSubmit: (input: CreateDiscardInput) => void;
};

type EditModeProps = CommonProps & {
  mode: "edit";
  initialValues: UpdateDiscardInput;
  onSubmit: (input: UpdateDiscardInput) => void;
};

type DiscardFormProps = CreateModeProps | EditModeProps;

type FieldErrors = Partial<Record<"cageId" | "discardDate" | "quantity", string>>;

function collectFieldErrors(issues: { path: PropertyKey[]; message: string }[]): FieldErrors {
  return issues.reduce<FieldErrors>((accumulator, issue) => {
    const field = issue.path[0];
    if (
      (field === "cageId" || field === "discardDate" || field === "quantity") &&
      !accumulator[field]
    ) {
      accumulator[field] = issue.message;
    }
    return accumulator;
  }, {});
}

const inputClassName =
  "w-full rounded-xl border border-secondary/30 bg-white px-4 py-3 text-base text-third outline-none transition placeholder:text-secondary/60 focus:border-secondary focus:ring-2 focus:ring-secondary/30";

export function DiscardForm(props: DiscardFormProps) {
  const [cageId, setCageId] = useState(
    props.mode === "edit" ? props.initialValues.cageId : "",
  );
  const [discardDate, setDiscardDate] = useState(
    props.mode === "edit" ? props.initialValues.discardDate : todayIso(),
  );
  const [quantity, setQuantity] = useState(
    props.mode === "edit" ? String(props.initialValues.quantity) : "",
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = discardSchema.safeParse({ cageId, discardDate, quantity });
    if (!result.success) {
      setFieldErrors(collectFieldErrors(result.error.issues));
      return;
    }

    setFieldErrors({});

    if (props.mode === "edit") {
      props.onSubmit({
        id: props.initialValues.id,
        quantity: result.data.quantity,
        cageId: result.data.cageId,
        discardDate: result.data.discardDate,
      });
      return;
    }

    props.onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="discard-cage" className="text-xs font-medium text-third">
          Jaula
        </label>
        <Dropdown
          id="discard-cage"
          value={cageId}
          options={props.cageOptions}
          onChange={setCageId}
          placeholder="Selecciona una jaula"
          invalid={Boolean(fieldErrors.cageId)}
        />
        {fieldErrors.cageId && <p className="text-xs text-red-500">{fieldErrors.cageId}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="discard-date" className="text-xs font-medium text-third">
          Fecha de desecho
        </label>
        <DatePicker
          id="discard-date"
          value={discardDate}
          onChange={setDiscardDate}
          max={todayIso()}
          invalid={Boolean(fieldErrors.discardDate)}
        />
        {fieldErrors.discardDate && (
          <p className="text-xs text-red-500">{fieldErrors.discardDate}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="discard-quantity" className="text-xs font-medium text-third">
          Cantidad
        </label>
        <input
          id="discard-quantity"
          name="quantity"
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          className={inputClassName}
        />
        {fieldErrors.quantity && <p className="text-xs text-red-500">{fieldErrors.quantity}</p>}
      </div>

      {props.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{props.error}</p>
      )}

      <button
        type="submit"
        disabled={props.isSubmitting}
        className="mt-1 w-full rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-primary transition hover:bg-third disabled:cursor-not-allowed disabled:opacity-60"
      >
        {props.isSubmitting
          ? "Guardando..."
          : props.mode === "edit"
            ? "Guardar cambios"
            : "Guardar registro"}
      </button>
    </form>
  );
}
