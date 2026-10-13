import { useQuery } from "@tanstack/react-query";

import { invoicesService } from "../../../config/container";

const INVOICED_ORDER_IDS_KEY = ["invoices", "order-ids"] as const;

export function useInvoicedOrderIds() {
  const query = useQuery({
    queryKey: INVOICED_ORDER_IDS_KEY,
    queryFn: () =>
      invoicesService.list({ page: 1, pageSize: 500, includeHidden: true }),
  });

  const orderIds = new Set(
    (query.data?.items ?? [])
      .map((invoice) => invoice.orderId)
      .filter((orderId): orderId is string => Boolean(orderId)),
  );

  return { orderIds };
}
