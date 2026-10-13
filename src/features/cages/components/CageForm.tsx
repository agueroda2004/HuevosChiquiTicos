import { useState, type FormEvent } from "react";

import type { CreateCageInput, UpdateCageInput } from "../domain/cage";
import { cageSchema, cageUpdateSchema } from "../validations/cage.validator";

type CommonProps = {
  isSubmitting: boolean;
  error: string | null;
};

type CreateModeProps = CommonProps & {
  mode: "create";
  onSubmit: (input: CreateCageInput) => void;
};

type EditModeProps = CommonProps & {
  mode: "edit";
  initialValues: UpdateCageInput;
  onSubmit: (input: UpdateCageInput) => void;
};

type CageFormProps = CreateModeProps | EditModeProps;

type FieldErrors = Partial<Record<"name" | "birds", string>>;

function collectFieldErrors(issues: { path: PropertyKey[]; message: string }[]): FieldErrors {
  return issues.reduce<FieldErrors>((accumulator, issue) => {
    const field = issue.path[0];
    if ((field === "name" || field === "birds") && !accumulator[field]) {
      accumulator[field] = issue.message;
    }
    return accumulator;
  }, {});
}

const inputClassName =
  "w-full rounded-xl border border-secondary/30 bg-white px-4 py-3 text-sm text-third outline-none transition placeholder:text-secondary/60 focus:border-secondary focus:ring-2 focus:ring-secondary/30";

export function CageForm(props: CageFormProps) {
  const [name, setName] = useState(props.mode === "edit" ? props.initialValues.name : "");
  const [birds, setBirds] = useState("");
  const [active, setActive] = useState(props.mode === "edit" ? props.initialValues.active : true);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (props.mode === "edit") {
      const result = cageUpdateSchema.safeParse({ name, active });
      if (!result.success) {
        setFieldErrors(collectFieldErrors(result.error.issues));
        return;
      }

      setFieldErrors({});
      props.onSubmit({
        id: props.initialValues.id,
        name: result.data.name,
        active: result.data.active,
      });
      return;
    }

    const result = cageSchema.safeParse({ name, birds, active });
    if (!result.success) {
      setFieldErrors(collectFieldErrors(result.error.issues));
      return;
    }

    setFieldErrors({});
    props.onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cage-name" className="text-xs font-medium text-third">
          Nombre
        </label>
        <input
          id="cage-name"
          name="name"
          type="text"
          maxLength={50}
          placeholder="Ej. Jaula A"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={inputClassName}
        />
        {fieldErrors.name && <p className="text-xs text-red-500">{fieldErrors.name}</p>}
      </div>

      {props.mode === "create" && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cage-birds" className="text-xs font-medium text-third">
            Cantidad de aves
          </label>
          <input
            id="cage-birds"
            name="birds"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={birds}
            onChange={(event) => setBirds(event.target.value)}
            className={inputClassName}
          />
          {fieldErrors.birds && <p className="text-xs text-red-500">{fieldErrors.birds}</p>}
        </div>
      )}

      <div className="flex items-center justify-between rounded-xl border border-secondary/30 bg-white px-4 py-3">
        <span className="text-sm text-third">Activa</span>
        <button
          type="button"
          role="switch"
          aria-checked={active}
          aria-label="Activa"
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
            : "Guardar jaula"}
      </button>
    </form>
  );
}
