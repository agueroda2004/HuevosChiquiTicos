import { useState, type FormEvent } from "react";

import type { CreateSupplierInput, UpdateSupplierInput } from "../domain/supplier";
import { supplierSchema } from "../validations/supplier.validator";

type CommonProps = {
  isSubmitting: boolean;
  error: string | null;
};

type CreateModeProps = CommonProps & {
  mode: "create";
  onSubmit: (input: CreateSupplierInput) => void;
};

type EditModeProps = CommonProps & {
  mode: "edit";
  initialValues: UpdateSupplierInput;
  onSubmit: (input: UpdateSupplierInput) => void;
};

type SupplierFormProps = CreateModeProps | EditModeProps;

type FieldErrors = Partial<Record<"name" | "email" | "phone" | "address", string>>;

function collectFieldErrors(issues: { path: PropertyKey[]; message: string }[]): FieldErrors {
  return issues.reduce<FieldErrors>((accumulator, issue) => {
    const field = issue.path[0];
    if (
      (field === "name" || field === "email" || field === "phone" || field === "address") &&
      !accumulator[field]
    ) {
      accumulator[field] = issue.message;
    }
    return accumulator;
  }, {});
}

function toNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

const inputClassName =
  "w-full rounded-xl border border-secondary/30 bg-white px-4 py-3 text-sm text-third outline-none transition placeholder:text-secondary/60 focus:border-secondary focus:ring-2 focus:ring-secondary/30";

export function SupplierForm(props: SupplierFormProps) {
  const [name, setName] = useState(props.mode === "edit" ? props.initialValues.name : "");
  const [email, setEmail] = useState(
    props.mode === "edit" ? props.initialValues.email ?? "" : "",
  );
  const [phone, setPhone] = useState(
    props.mode === "edit" ? props.initialValues.phone ?? "" : "",
  );
  const [address, setAddress] = useState(
    props.mode === "edit" ? props.initialValues.address ?? "" : "",
  );
  const [active, setActive] = useState(props.mode === "edit" ? props.initialValues.active : true);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = supplierSchema.safeParse({ name, email, phone, address, active });
    if (!result.success) {
      setFieldErrors(collectFieldErrors(result.error.issues));
      return;
    }

    setFieldErrors({});

    const values = {
      name: result.data.name,
      email: toNullable(result.data.email),
      phone: toNullable(result.data.phone),
      address: toNullable(result.data.address),
      active: result.data.active,
    };

    if (props.mode === "edit") {
      props.onSubmit({ id: props.initialValues.id, ...values });
      return;
    }

    props.onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="supplier-name" className="text-xs font-medium text-third">
          Nombre
        </label>
        <input
          id="supplier-name"
          name="name"
          type="text"
          maxLength={100}
          placeholder="Ej. Avícola Central"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={inputClassName}
        />
        {fieldErrors.name && <p className="text-xs text-red-500">{fieldErrors.name}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="supplier-email" className="text-xs font-medium text-third">
          Correo
        </label>
        <input
          id="supplier-email"
          name="email"
          type="email"
          maxLength={100}
          placeholder="Ej. contacto@avicola.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClassName}
        />
        {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="supplier-phone" className="text-xs font-medium text-third">
          Teléfono
        </label>
        <input
          id="supplier-phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          maxLength={8}
          placeholder="Ej. 12345678"
          value={phone}
          onChange={(event) => setPhone(event.target.value.replace(/\D/g, ""))}
          className={inputClassName}
        />
        {fieldErrors.phone && <p className="text-xs text-red-500">{fieldErrors.phone}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="supplier-address" className="text-xs font-medium text-third">
          Dirección
        </label>
        <textarea
          id="supplier-address"
          name="address"
          rows={3}
          maxLength={500}
          placeholder="Ej. Zona 1, Ciudad de Guatemala"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          className={`${inputClassName} resize-none`}
        />
        {fieldErrors.address && <p className="text-xs text-red-500">{fieldErrors.address}</p>}
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
            : "Guardar proveedor"}
      </button>
    </form>
  );
}
