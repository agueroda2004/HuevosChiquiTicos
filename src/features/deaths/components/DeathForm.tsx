import { useState, type FormEvent } from "react";

import { DatePicker } from "../../../shared/components/DatePicker";
import { Dropdown, type DropdownOption } from "../../../shared/components/Dropdown";
import { todayIso } from "../../../shared/utils/date";
import { DEATH_TYPE_OPTIONS } from "../constants";
import type { CreateDeathInput, DeathType, UpdateDeathInput } from "../domain/death";
import { deathSchema } from "../validations/death.validator";

type CommonProps = {
  cageOptions: DropdownOption[];
  isSubmitting: boolean;
  error: string | null;
};

type CreateModeProps = CommonProps & {
  mode: "create";
  onSubmit: (input: CreateDeathInput) => void;
};

type EditModeProps = CommonProps & {
  mode: "edit";
  initialValues: UpdateDeathInput;
  onSubmit: (input: UpdateDeathInput) => void;
};

type DeathFormProps = CreateModeProps | EditModeProps;

type FieldErrors = Partial<Record<"cageId" | "deathDate" | "quantity" | "type", string>>;

function collectFieldErrors(issues: { path: PropertyKey[]; message: string }[]): FieldErrors {
  return issues.reduce<FieldErrors>((accumulator, issue) => {
    const field = issue.path[0];
    if (
      (field === "cageId" ||
        field === "deathDate" ||
        field === "quantity" ||
        field === "type") &&
      !accumulator[field]
    ) {
      accumulator[field] = issue.message;
    }
    return accumulator;
  }, {});
}

const inputClassName =
  "w-full rounded-xl border border-secondary/30 bg-white px-4 py-3 text-sm text-third outline-none transition placeholder:text-secondary/60 focus:border-secondary focus:ring-2 focus:ring-secondary/30";

const typeOptions: DropdownOption<DeathType | "">[] = DEATH_TYPE_OPTIONS;

export function DeathForm(props: DeathFormProps) {
  const [cageId, setCageId] = useState(props.mode === "edit" ? props.initialValues.cageId : "");
  const [deathDate, setDeathDate] = useState(
    props.mode === "edit" ? props.initialValues.deathDate : todayIso(),
  );
  const [quantity, setQuantity] = useState(
    props.mode === "edit" ? String(props.initialValues.quantity) : "",
  );
  const [type, setType] = useState<DeathType | "">(
    props.mode === "edit" ? props.initialValues.type : "",
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!type) {
      setFieldErrors({ type: "Selecciona un tipo." });
      return;
    }

    const result = deathSchema.safeParse({ cageId, deathDate, quantity, type });
    if (!result.success) {
      setFieldErrors(collectFieldErrors(result.error.issues));
      return;
    }

    setFieldErrors({});

    if (props.mode === "edit") {
      props.onSubmit({
        id: props.initialValues.id,
        cageId: result.data.cageId,
        deathDate: result.data.deathDate,
        quantity: result.data.quantity,
        type: result.data.type,
      });
      return;
    }

    props.onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="death-cage" className="text-xs font-medium text-third">
          Jaula
        </label>
        <Dropdown
          id="death-cage"
          value={cageId}
          options={props.cageOptions}
          onChange={setCageId}
          placeholder="Selecciona una jaula"
          invalid={Boolean(fieldErrors.cageId)}
        />
        {fieldErrors.cageId && <p className="text-xs text-red-500">{fieldErrors.cageId}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="death-date" className="text-xs font-medium text-third">
          Fecha de muerte
        </label>
        <DatePicker
          id="death-date"
          value={deathDate}
          onChange={setDeathDate}
          max={todayIso()}
          invalid={Boolean(fieldErrors.deathDate)}
        />
        {fieldErrors.deathDate && <p className="text-xs text-red-500">{fieldErrors.deathDate}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="death-quantity" className="text-xs font-medium text-third">
          Cantidad
        </label>
        <input
          id="death-quantity"
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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="death-type" className="text-xs font-medium text-third">
          Tipo
        </label>
        <Dropdown
          id="death-type"
          value={type}
          options={typeOptions}
          onChange={setType}
          placeholder="Selecciona un tipo"
          invalid={Boolean(fieldErrors.type)}
        />
        {fieldErrors.type && <p className="text-xs text-red-500">{fieldErrors.type}</p>}
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
