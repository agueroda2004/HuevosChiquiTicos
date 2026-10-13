import { useState, type FormEvent } from "react";

import { DatePicker } from "../../../shared/components/DatePicker";
import { Dropdown, type DropdownOption } from "../../../shared/components/Dropdown";
import { todayIso } from "../../../shared/utils/date";
import type {
  CreateEggCollectionInput,
  UpdateEggCollectionInput,
} from "../domain/egg-collection";
import { readDatePreference, writeDatePreference } from "../preferences";
import { eggCollectionSchema } from "../validations/egg-collection.validator";

type CommonProps = {
  cageOptions: DropdownOption[];
  isSubmitting: boolean;
  error: string | null;
};

type CreateModeProps = CommonProps & {
  mode: "create";
  onSubmit: (input: CreateEggCollectionInput) => void;
};

type EditModeProps = CommonProps & {
  mode: "edit";
  initialValues: UpdateEggCollectionInput;
  onSubmit: (input: UpdateEggCollectionInput) => void;
};

type EggCollectionFormProps = CreateModeProps | EditModeProps;

type FieldErrors = Partial<Record<"cageId" | "collectionDate" | "quantity", string>>;

function collectFieldErrors(issues: { path: PropertyKey[]; message: string }[]): FieldErrors {
  return issues.reduce<FieldErrors>((accumulator, issue) => {
    const field = issue.path[0];
    if (
      (field === "cageId" || field === "collectionDate" || field === "quantity") &&
      !accumulator[field]
    ) {
      accumulator[field] = issue.message;
    }
    return accumulator;
  }, {});
}

const inputClassName =
  "w-full rounded-xl border border-secondary/30 bg-white px-4 py-3 text-base text-third outline-none transition placeholder:text-secondary/60 focus:border-secondary focus:ring-2 focus:ring-secondary/30";

export function EggCollectionForm(props: EggCollectionFormProps) {
  const [cageId, setCageId] = useState(
    props.mode === "edit" ? props.initialValues.cageId : "",
  );
  const [collectionDate, setCollectionDate] = useState(() => {
    if (props.mode === "edit") return props.initialValues.collectionDate;
    const preference = readDatePreference();
    return preference.enabled && preference.date ? preference.date : todayIso();
  });
  const [quantity, setQuantity] = useState(
    props.mode === "edit" ? String(props.initialValues.quantity) : "",
  );
  const [keepDate, setKeepDate] = useState(
    () => props.mode === "create" && readDatePreference().enabled,
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleDateChange = (value: string) => {
    setCollectionDate(value);

    if (props.mode === "create" && keepDate) {
      writeDatePreference({ enabled: true, date: value });
    }
  };

  const handleToggleKeepDate = () => {
    const next = !keepDate;
    setKeepDate(next);
    writeDatePreference({
      enabled: next,
      date: next ? collectionDate : readDatePreference().date,
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = eggCollectionSchema.safeParse({ cageId, collectionDate, quantity });
    if (!result.success) {
      setFieldErrors(collectFieldErrors(result.error.issues));
      return;
    }

    setFieldErrors({});

    if (props.mode === "edit") {
      props.onSubmit({
        id: props.initialValues.id,
        cageId: result.data.cageId,
        collectionDate: result.data.collectionDate,
        quantity: result.data.quantity,
      });
      return;
    }

    if (keepDate) {
      writeDatePreference({ enabled: true, date: collectionDate });
    }

    props.onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="egg-cage" className="text-xs font-medium text-third">
          Jaula
        </label>
        <Dropdown
          id="egg-cage"
          value={cageId}
          options={props.cageOptions}
          onChange={setCageId}
          placeholder="Selecciona una jaula"
          invalid={Boolean(fieldErrors.cageId)}
        />
        {fieldErrors.cageId && <p className="text-xs text-red-500">{fieldErrors.cageId}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="egg-date" className="text-xs font-medium text-third">
          Día de recolección
        </label>
        <DatePicker
          id="egg-date"
          value={collectionDate}
          onChange={handleDateChange}
          max={todayIso()}
          invalid={Boolean(fieldErrors.collectionDate)}
        />
        {fieldErrors.collectionDate && (
          <p className="text-xs text-red-500">{fieldErrors.collectionDate}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="egg-quantity" className="text-xs font-medium text-third">
          Cantidad
        </label>
        <input
          id="egg-quantity"
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

      {props.mode === "create" && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-secondary/30 bg-white px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm text-third">Mantener fecha</p>
            <p className="text-xs text-secondary">
              Usa la última fecha seleccionada la próxima vez.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={keepDate}
            aria-label="Mantener fecha"
            onClick={handleToggleKeepDate}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${
              keepDate ? "bg-secondary" : "bg-secondary/30"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                keepDate ? "left-5" : "left-0.5"
              }`}
            />
          </button>
        </div>
      )}

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
