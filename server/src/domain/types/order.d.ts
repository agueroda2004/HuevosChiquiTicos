export type OrderStatus = "pending" | "ready" | "delivered";

export interface OrderItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderItem extends OrderItemInput {
  id: string;
  subtotal: number;
}

export interface Order {
  id: string;
  customerId: string;
  deliveryDate: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
}

export interface CreateOrderDTO {
  customerId: string;
  deliveryDate: string;
  status: OrderStatus;
  items: OrderItemInput[];
}

export type UpdateOrderDTO = CreateOrderDTO;

export interface OrdersQuery {
  customerId?: string;
  status?: OrderStatus;
  from?: string;
  to?: string;
  page: number;
  pageSize: number;
}
