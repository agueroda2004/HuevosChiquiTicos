import { BarChart3, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/react";

export default function DashboardPage() {
  const { user } = useUser();
  const firstName = user?.firstName ?? user?.username ?? "";

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-third">
          Hola{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-secondary">¿Qué reporte deseas ver?</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          to="/production/reports"
          className="rounded-2xl border border-secondary/20 bg-white/80 p-5 shadow-sm transition hover:border-secondary/40 hover:shadow"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
            <BarChart3 className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-sm font-semibold text-third">Reportes de producción</h2>
          <p className="mt-1 text-xs text-secondary">
            Huevos, muertes, entradas, desechos y medicamentos.
          </p>
        </Link>

        <Link
          to="/accounting/reports"
          className="rounded-2xl border border-secondary/20 bg-white/80 p-5 shadow-sm transition hover:border-secondary/40 hover:shadow"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
            <TrendingUp className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-sm font-semibold text-third">Reportes contables</h2>
          <p className="mt-1 text-xs text-secondary">
            Cuentas por cobrar, por pagar y flujo de caja.
          </p>
        </Link>
      </div>
    </div>
  );
}
