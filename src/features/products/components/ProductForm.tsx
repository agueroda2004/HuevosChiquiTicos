import { useState, type FormEvent } from "react";

import { formatCurrency } from "../../../shared/utils/currency";
import type { CreateProductInput, UpdateProductInput } from "../domain/product";
import { productSchema } from "../validations/product.validator";
import { ProductImage } from "./ProductImage";

type CommonProps = {
  isSubmitting: boolean;
  error: string | null;
};

type CreateModeProps = CommonProps & {
  mode: "create";
  onSubmit: (input: CreateProductInput) => void;
};

type EditModeProps = CommonProps & {
  mode: "edit";
  initialValues: UpdateProductInput;
  onSubmit: (input: UpdateProductInput) => void;
};

type ProductFormProps = CreateModeProps | EditModeProps;

type FieldErrors = Partial<Record<"name" | "price" | "imageUrl", string>>;

function collectFieldErrors(issues: { path: PropertyKey[]; message: string }[]): FieldErrors {
  return issues.reduce<FieldErrors>((accumulator, issue) => {
    const field = issue.path[0];
    if ((field === "name" || field === "price" || field === "imageUrl") && !accumulator[field]) {
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
  "w-full rounded-xl border border-secondary/30 bg-white px-4 py-3 text-base text-third outline-none transition placeholder:text-secondary/60 focus:border-secondary focus:ring-2 focus:ring-secondary/30";

export function ProductForm(props: ProductFormProps) {
  const [name, setName] = useState(props.mode === "edit" ? props.initialValues.name : "");
  const [price, setPrice] = useState(
    props.mode === "edit" ? String(props.initialValues.price) : "",
  );
  const [imageUrl, setImageUrl] = useState(
    props.mode === "edit" ? props.initialValues.imageUrl ?? "" : "",
  );
  const [active, setActive] = useState(props.mode === "edit" ? props.initialValues.active : true);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const parsedPrice = Number(price);
  const hasValidPreview = price.trim() !== "" && !Number.isNaN(parsedPrice);
  const previewImage = imageUrl.trim() === "" ? null : imageUrl.trim();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = productSchema.safeParse({ name, price, imageUrl, active });
    if (!result.success) {
      setFieldErrors(collectFieldErrors(result.error.issues));
      return;
    }

    setFieldErrors({});

    const values = {
      name: result.data.name,
      price: result.data.price,
      active: result.data.active,
      imageUrl: toNullable(result.data.imageUrl),
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
        <label htmlFor="product-name" className="text-xs font-medium text-third">
          Nombre
        </label>
        <input
          id="product-name"
          name="name"
          type="text"
          maxLength={100}
          placeholder="Ej. Huevos de codorniz"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={inputClassName}
        />
        {fieldErrors.name && <p className="text-xs text-red-500">{fieldErrors.name}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="product-price" className="text-xs font-medium text-third">
          Precio
        </label>
        <input
          id="product-price"
          name="price"
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          placeholder="Ej. 1500"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          className={inputClassName}
        />
        {hasValidPreview && (
          <p className="text-sm font-semibold text-secondary">{formatCurrency(parsedPrice)}</p>
        )}
        {fieldErrors.price && <p className="text-xs text-red-500">{fieldErrors.price}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="product-image" className="text-xs font-medium text-third">
          URL de la imagen
        </label>
        <input
          id="product-image"
          name="imageUrl"
          type="url"
          maxLength={200}
          placeholder="https://..."
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          className={inputClassName}
        />
        {fieldErrors.imageUrl && <p className="text-xs text-red-500">{fieldErrors.imageUrl}</p>}
        <div className="mx-auto mt-1 w-full max-w-[240px]">
          <ProductImage
            src={previewImage}
            alt="Vista previa del producto"
            className="aspect-square w-full rounded-xl border border-secondary/20"
          />
        </div>
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
            : "Guardar producto"}
      </button>
    </form>
  );
}
