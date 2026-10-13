import { useMemo, useState } from "react";

import { formatDateLabel, formatYearRangeLabel, toIsoDate } from "../../../shared/utils/date";
import { useCages } from "../../cages/hooks/useCages";
import { getDeathTypeLabel } from "../../deaths/constants";
import { useMedications } from "../../medications/hooks/useMedications";
import { EggCollectionsChart } from "../components/EggCollectionsChart";
import { RecentList, type RecentListItem } from "../components/RecentList";
import { ReportRangeFilter, type ReportFiltersValue } from "../components/ReportRangeFilter";
import { ReportsSkeleton } from "../components/ReportsSkeleton";
import { SummaryCards } from "../components/SummaryCards";
import { useProductionReport } from "../hooks/useProductionReport";

function defaultFilters(): ReportFiltersValue {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);

  return { from: toIsoDate(from), to: toIsoDate(to), cageId: "" };
}

export default function ReportsPage() {
  const [filters, setFilters] = useState<ReportFiltersValue>(defaultFilters);
  const { cages } = useCages();
  const { medications } = useMedications();

  const { report, isLoading, error } = useProductionReport({
    from: filters.from,
    to: filters.to,
    cageId: filters.cageId || undefined,
    recentLimit: 5,
  });

  const cageOptions = useMemo(
    () => cages.map((cage) => ({ value: cage.id, label: cage.name })),
    [cages],
  );

  const cageNameById = useMemo(
    () => Object.fromEntries(cages.map((cage) => [cage.id, cage.name])),
    [cages],
  );

  const medicationNameById = useMemo(
    () => Object.fromEntries(medications.map((medication) => [medication.id, medication.name])),
    [medications],
  );

  const deathsRecent: RecentListItem[] = (report?.deaths.recent ?? []).map((record) => ({
    id: record.id,
    title: cageNameById[record.cageId] ?? "Jaula eliminada",
    subtitle: `${formatDateLabel(record.deathDate)} · ${getDeathTypeLabel(record.type)}`,
    trailing: `${record.quantity} aves`,
  }));

  const entriesRecent: RecentListItem[] = (report?.entries.recent ?? []).map((record) => ({
    id: record.id,
    title: cageNameById[record.cageId] ?? "Jaula eliminada",
    subtitle: formatDateLabel(record.entryDate),
    trailing: `${record.quantity} aves`,
  }));

  const discardsRecent: RecentListItem[] = (report?.discards.recent ?? []).map((record) => ({
    id: record.id,
    title: cageNameById[record.cageId] ?? "Jaula eliminada",
    subtitle: formatDateLabel(record.discardDate),
    trailing: `${record.quantity} aves`,
  }));

  const applicationsRecent: RecentListItem[] = (
    report?.medicationApplications.recent ?? []
  ).map((record) => ({
    id: record.id,
    title: medicationNameById[record.medicationId] ?? "Medicamento eliminado",
    subtitle: `${formatDateLabel(record.applicationDate)} · Dosis: ${record.dose}`,
    trailing: `${record.birdCount} aves`,
  }));

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-third">Reportes de producción</h1>
        <p className="mt-1 text-sm text-secondary">
          Resumen de la actividad del criadero en el rango seleccionado
        </p>
      </header>

      <ReportRangeFilter value={filters} cageOptions={cageOptions} onChange={setFilters} />

      {isLoading && <ReportsSkeleton />}

      {!isLoading && error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {!isLoading && !error && report && (
        <div className="flex flex-col gap-6">
          <SummaryCards report={report} />

          <EggCollectionsChart
            daily={report.eggCollections.daily}
            yearLabel={formatYearRangeLabel(report.range.from, report.range.to)}
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RecentList
              title="Últimas muertes"
              items={deathsRecent}
              emptyLabel="Sin muertes registradas."
            />
            <RecentList
              title="Últimas entradas"
              items={entriesRecent}
              emptyLabel="Sin entradas registradas."
            />
            <RecentList
              title="Últimos desechos"
              items={discardsRecent}
              emptyLabel="Sin desechos registrados."
            />
            <RecentList
              title="Últimas aplicaciones de medicamentos"
              items={applicationsRecent}
              emptyLabel="Sin aplicaciones registradas."
            />
          </div>

          <p className="text-center text-xs text-secondary">
            Rango consultado: {formatDateLabel(report.range.from)} —{" "}
            {formatDateLabel(report.range.to)}
            {report.range.cageId
              ? ` · ${cageNameById[report.range.cageId] ?? "Jaula eliminada"}`
              : ""}
          </p>
        </div>
      )}
    </div>
  );
}
