export type OrderStatus = "pending" | "ready" | "delivered";

export type OrderItemInput = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type OrderItem = OrderItemInput & {
  id: string;
  subtotal: number;
};

export type Order = {
  id: string;
  customerId: string;
  deliveryDate: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
};

export type CreateOrderInput = {
  customerId: string;
  deliveryDate: string;
  status: OrderStatus;
  items: OrderItemInput[];
};

export type UpdateOrderInput = CreateOrderInput & {
  id: string;
};

export type OrdersQuery = {
  customerId?: string;
  status?: OrderStatus;
  from?: string;
  to?: string;
  page: number;
  pageSize: number;
};
