import { useState, type FormEvent } from "react";

import type { CreateMedicationInput, UpdateMedicationInput } from "../domain/medication";
import { medicationSchema } from "../validations/medication.validator";

type CommonProps = {
  isSubmitting: boolean;
  error: string | null;
};

type CreateModeProps = CommonProps & {
  mode: "create";
  onSubmit: (input: CreateMedicationInput) => void;
};

type EditModeProps = CommonProps & {
  mode: "edit";
  initialValues: UpdateMedicationInput;
  onSubmit: (input: UpdateMedicationInput) => void;
};

type MedicationFormProps = CreateModeProps | EditModeProps;

type FieldErrors = Partial<Record<"name", string>>;

export function MedicationForm(props: MedicationFormProps) {
  const [name, setName] = useState(props.mode === "edit" ? props.initialValues.name : "");
  const [active, setActive] = useState(props.mode === "edit" ? props.initialValues.active : true);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = medicationSchema.safeParse({ name, active });
    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        if (issue.path[0] === "name" && !errors.name) {
          errors.name = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    if (props.mode === "edit") {
      props.onSubmit({
        id: props.initialValues.id,
        name: result.data.name,
        active: result.data.active,
      });
      return;
    }

    props.onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="medication-name" className="text-xs font-medium text-third">
          Nombre
        </label>
        <input
          id="medication-name"
          name="name"
          type="text"
          maxLength={100}
          placeholder="Ej. Oxitetraciclina"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-xl border border-secondary/30 bg-white px-4 py-3 text-sm text-third outline-none transition placeholder:text-secondary/60 focus:border-secondary focus:ring-2 focus:ring-secondary/30"
        />
        {fieldErrors.name && <p className="text-xs text-red-500">{fieldErrors.name}</p>}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-secondary/30 bg-white px-4 py-3">
        <span className="text-sm text-third">Activo</span>
        <button
          type="button"
          role="switch"
          aria-checked={active}
          aria-label="Activo"
          onClick={() => setActive((value) => !value)}
          className={`relative h-6 w-11 rounded-full transition ${
            active ? "bg-secondary" : "bg-secondary/30"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
              active ? "left-5" : "left-0.5"
            }`}
          />
        </button>
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
            : "Guardar medicamento"}
      </button>
    </form>
  );
}
