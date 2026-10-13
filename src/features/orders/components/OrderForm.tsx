import { useState, type FormEvent } from "react";

import { DatePicker } from "../../../shared/components/DatePicker";
import { Dropdown, type DropdownOption } from "../../../shared/components/Dropdown";
import { todayIso } from "../../../shared/utils/date";
import type { Product } from "../../products/domain/product";
import { ORDER_STATUS_OPTIONS } from "../constants";
import type {
  CreateOrderInput,
  OrderItemInput,
  OrderStatus,
  UpdateOrderInput,
} from "../domain/order";
import { orderSchema } from "../validations/order.validator";
import { OrderItemsEditor } from "./OrderItemsEditor";

type CommonProps = {
  customerOptions: DropdownOption[];
  products: Product[];
  isSubmitting: boolean;
  error: string | null;
};

type CreateModeProps = CommonProps & {
  mode: "create";
  onSubmit: (input: CreateOrderInput) => void;
};

type EditModeProps = CommonProps & {
  mode: "edit";
  initialValues: UpdateOrderInput;
  onSubmit: (input: UpdateOrderInput) => void;
};

type OrderFormProps = CreateModeProps | EditModeProps;

type FieldErrors = Partial<Record<"customerId" | "deliveryDate" | "items", string>>;

function collectFieldErrors(issues: { path: PropertyKey[]; message: string }[]): FieldErrors {
  return issues.reduce<FieldErrors>((accumulator, issue) => {
    const field = issue.path[0];
    if (
      (field === "customerId" || field === "deliveryDate" || field === "items") &&
      !accumulator[field]
    ) {
      accumulator[field] = issue.message;
    }
    return accumulator;
  }, {});
}

export function OrderForm(props: OrderFormProps) {
  const [customerId, setCustomerId] = useState(
    props.mode === "edit" ? props.initialValues.customerId : "",
  );
  const [deliveryDate, setDeliveryDate] = useState(
    props.mode === "edit" ? props.initialValues.deliveryDate : "",
  );
  const [status, setStatus] = useState<OrderStatus>(
    props.mode === "edit" ? props.initialValues.status : "pending",
  );
  const [items, setItems] = useState<OrderItemInput[]>(
    props.mode === "edit" ? props.initialValues.items : [],
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = orderSchema.safeParse({ customerId, deliveryDate, status, items });
    if (!result.success) {
      setFieldErrors(collectFieldErrors(result.error.issues));
      return;
    }

    setFieldErrors({});

    const values = {
      customerId: result.data.customerId,
      deliveryDate: result.data.deliveryDate,
      status: result.data.status,
      items: result.data.items,
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
        <label htmlFor="order-customer" className="text-xs font-medium text-third">
          Cliente
        </label>
        <Dropdown
          id="order-customer"
          value={customerId}
          options={props.customerOptions}
          onChange={setCustomerId}
          placeholder="Selecciona un cliente"
          invalid={Boolean(fieldErrors.customerId)}
        />
        {fieldErrors.customerId && (
          <p className="text-xs text-red-500">{fieldErrors.customerId}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="order-date" className="text-xs font-medium text-third">
          Fecha de entrega
        </label>
        <DatePicker
          id="order-date"
          value={deliveryDate}
          onChange={setDeliveryDate}
          min={todayIso()}
          invalid={Boolean(fieldErrors.deliveryDate)}
        />
        {fieldErrors.deliveryDate && (
          <p className="text-xs text-red-500">{fieldErrors.deliveryDate}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="order-status" className="text-xs font-medium text-third">
          Estado
        </label>
        <Dropdown
          id="order-status"
          value={status}
          options={ORDER_STATUS_OPTIONS}
          onChange={setStatus}
        />
      </div>

      <OrderItemsEditor
        products={props.products}
        items={items}
        onChange={setItems}
        error={fieldErrors.items}
      />

      {props.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{props.error}</p>
      )}

      <button
        type="submit"
        disabled={props.isSubmitting || props.customerOptions.length === 0}
        className="mt-1 w-full rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-primary transition hover:bg-third disabled:cursor-not-allowed disabled:opacity-60"
      >
        {props.isSubmitting
          ? "Guardando..."
          : props.mode === "edit"
            ? "Guardar cambios"
            : "Guardar pedido"}
      </button>

      {props.customerOptions.length === 0 && (
        <p className="text-center text-xs text-secondary">
          Crea al menos un cliente antes de registrar pedidos.
        </p>
      )}
    </form>
  );
}
