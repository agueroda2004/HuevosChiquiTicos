import { useState, type FormEvent } from "react";

import { DatePicker } from "../../../shared/components/DatePicker";
import { Dropdown, type DropdownOption } from "../../../shared/components/Dropdown";
import { MultiSelectDropdown } from "../../../shared/components/MultiSelectDropdown";
import { todayIso } from "../../../shared/utils/date";
import { APPLICATION_FORM_OPTIONS } from "../constants";
import type {
  ApplicationForm,
  CreateMedicationApplicationInput,
  UpdateMedicationApplicationInput,
} from "../domain/medication-application";
import { medicationApplicationSchema } from "../validations/medication-application.validator";

type CommonProps = {
  cageOptions: DropdownOption[];
  medicationOptions: DropdownOption[];
  cageBirdCountById: Record<string, number>;
  isSubmitting: boolean;
  error: string | null;
};

type CreateModeProps = CommonProps & {
  mode: "create";
  onSubmit: (input: CreateMedicationApplicationInput) => void;
};

type EditModeProps = CommonProps & {
  mode: "edit";
  initialValues: UpdateMedicationApplicationInput;
  onSubmit: (input: UpdateMedicationApplicationInput) => void;
};

type MedicationApplicationFormProps = CreateModeProps | EditModeProps;

type FieldErrors = Partial<
  Record<"cageIds" | "medicationId" | "dose" | "applicationDate" | "birdCount", string>
>;

const FIELDS = ["cageIds", "medicationId", "dose", "applicationDate", "birdCount"] as const;

function collectFieldErrors(issues: { path: PropertyKey[]; message: string }[]): FieldErrors {
  return issues.reduce<FieldErrors>((accumulator, issue) => {
    const field = issue.path[0];
    if (typeof field === "string" && (FIELDS as readonly string[]).includes(field)) {
      const key = field as keyof FieldErrors;
      if (!accumulator[key]) accumulator[key] = issue.message;
    }
    return accumulator;
  }, {});
}

const inputClassName =
  "w-full rounded-xl border border-secondary/30 bg-white px-4 py-3 text-base text-third outline-none transition placeholder:text-secondary/60 focus:border-secondary focus:ring-2 focus:ring-secondary/30";

const typeOptions: DropdownOption<ApplicationForm | "">[] = [
  { value: "", label: "Sin especificar" },
  ...APPLICATION_FORM_OPTIONS,
];

export function MedicationApplicationForm(props: MedicationApplicationFormProps) {
  const [cageIds, setCageIds] = useState<string[]>(
    props.mode === "edit" ? props.initialValues.cageIds : [],
  );
  const [medicationId, setMedicationId] = useState(
    props.mode === "edit" ? props.initialValues.medicationId : "",
  );
  const [dose, setDose] = useState(
    props.mode === "edit" ? String(props.initialValues.dose) : "",
  );
  const [applicationDate, setApplicationDate] = useState(
    props.mode === "edit" ? props.initialValues.applicationDate : todayIso(),
  );
  const [birdCount, setBirdCount] = useState(
    props.mode === "edit" ? String(props.initialValues.birdCount) : "",
  );
  const [type, setType] = useState<ApplicationForm | "">(
    props.mode === "edit" ? (props.initialValues.type ?? "") : "",
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleCagesChange = (next: string[]) => {
    setCageIds(next);
    const total = next.reduce(
      (sum, id) => sum + (props.cageBirdCountById[id] ?? 0),
      0,
    );
    setBirdCount(total > 0 ? String(total) : "1");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = medicationApplicationSchema.safeParse({
      cageIds,
      medicationId,
      dose,
      applicationDate,
      birdCount,
      type: type || null,
    });

    if (!result.success) {
      setFieldErrors(collectFieldErrors(result.error.issues));
      return;
    }

    setFieldErrors({});

    if (props.mode === "edit") {
      props.onSubmit({
        id: props.initialValues.id,
        cageIds: result.data.cageIds,
        medicationId: result.data.medicationId,
        dose: result.data.dose,
        applicationDate: result.data.applicationDate,
        birdCount: result.data.birdCount,
        type: result.data.type,
      });
      return;
    }

    props.onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="application-cage" className="text-xs font-medium text-third">
          Jaulas
        </label>
        <MultiSelectDropdown
          id="application-cage"
          values={cageIds}
          options={props.cageOptions}
          onChange={handleCagesChange}
          placeholder="Selecciona una o varias jaulas"
          invalid={Boolean(fieldErrors.cageIds)}
        />
        {fieldErrors.cageIds && <p className="text-xs text-red-500">{fieldErrors.cageIds}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="application-medication" className="text-xs font-medium text-third">
          Medicamento
        </label>
        <Dropdown
          id="application-medication"
          value={medicationId}
          options={props.medicationOptions}
          onChange={setMedicationId}
          placeholder="Selecciona un medicamento"
          invalid={Boolean(fieldErrors.medicationId)}
        />
        {fieldErrors.medicationId && (
          <p className="text-xs text-red-500">{fieldErrors.medicationId}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="application-dose" className="text-xs font-medium text-third">
            Dosis
          </label>
          <input
            id="application-dose"
            name="dose"
            type="text"
            value={dose}
            onChange={(event) => setDose(event.target.value)}
            placeholder="Ej: 1 ajo en 2 litros de agua"
            className={inputClassName}
          />
          {fieldErrors.dose && <p className="text-xs text-red-500">{fieldErrors.dose}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="application-birds" className="text-xs font-medium text-third">
            Cantidad de aves
          </label>
          <input
            id="application-birds"
            name="birdCount"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            value={birdCount}
            onChange={(event) => setBirdCount(event.target.value)}
            className={inputClassName}
          />
          {fieldErrors.birdCount && (
            <p className="text-xs text-red-500">{fieldErrors.birdCount}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="application-date" className="text-xs font-medium text-third">
          Fecha de aplicación
        </label>
        <DatePicker
          id="application-date"
          value={applicationDate}
          onChange={setApplicationDate}
          max={todayIso()}
          invalid={Boolean(fieldErrors.applicationDate)}
        />
        {fieldErrors.applicationDate && (
          <p className="text-xs text-red-500">{fieldErrors.applicationDate}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="application-type" className="text-xs font-medium text-third">
          Forma de aplicación
        </label>
        <Dropdown
          id="application-type"
          value={type}
          options={typeOptions}
          onChange={setType}
          placeholder="Sin especificar"
        />
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
            : "Guardar aplicación"}
      </button>
    </form>
  );
}
