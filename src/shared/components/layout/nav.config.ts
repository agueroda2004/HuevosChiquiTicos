import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Bird,
  Calculator,
  ClipboardList,
  Egg,
  Home,
  Package,
  Pill,
  Receipt,
  ShoppingBag,
  Skull,
  Syringe,
  TrendingUp,
  Truck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
};

export type NavGroup = {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
};

export const homeItem: NavItem = {
  label: "Inicio",
  to: "/",
  icon: Home,
};

export const navGroups: NavGroup[] = [
  {
    id: "production",
    label: "Producción",
    icon: Package,
    items: [
      { label: "Reportes", to: "/production/reports", icon: BarChart3 },
      { label: "Jaulas", to: "/production/cages", icon: Bird },
      {
        label: "Recolección de huevos",
        to: "/production/egg-collections",
        icon: Egg,
      },
      { label: "Muertes", to: "/production/deaths", icon: Skull },
      { label: "Entradas", to: "/production/entries", icon: ArrowDownToLine },
      { label: "Desechos", to: "/production/discards", icon: ArrowUpFromLine },
      { label: "Medicamentos", to: "/production/medications", icon: Pill },
      {
        label: "Aplicación de medicamentos",
        to: "/production/medication-applications",
        icon: Syringe,
      },
    ],
  },
  {
    id: "accounting",
    label: "Contabilidad",
    icon: Calculator,
    items: [
      { label: "Reportes", to: "/accounting/reports", icon: TrendingUp },
      { label: "Clientes", to: "/accounting/customers", icon: Users },
      { label: "Proveedores", to: "/accounting/suppliers", icon: Truck },
      { label: "Productos", to: "/accounting/products", icon: ShoppingBag },
      { label: "Pedidos", to: "/accounting/orders", icon: ClipboardList },
      { label: "Por cobrar", to: "/accounting/invoices", icon: Receipt },
      { label: "Por pagar", to: "/accounting/bills", icon: Wallet },
    ],
  },
];

export function getActiveGroupId(pathname: string): string | null {
  const group = navGroups.find((candidate) =>
    candidate.items.some((item) => pathname.startsWith(item.to)),
  );

  return group?.id ?? null;
}

export function getActiveSectionLabel(pathname: string): string {
  let match: { group: NavGroup; item: NavItem } | null = null;

  for (const group of navGroups) {
    for (const item of group.items) {
      if (
        pathname.startsWith(item.to) &&
        (!match || item.to.length > match.item.to.length)
      ) {
        match = { group, item };
      }
    }
  }

  return match ? `${match.group.label} · ${match.item.label}` : "Inicio";
}
