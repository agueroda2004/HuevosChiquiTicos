import type { Death } from "./death.js";
import type { Discard } from "./discard.js";
import type { Entry } from "./entry.js";
import type { MedicationApplication } from "./medication-application.js";

export interface ReportsQuery {
  from: string;
  to: string;
  cageId?: string;
  recentLimit?: number;
}

export interface DailyEggCollection {
  date: string;
  quantity: number;
}

export interface ProductionReport {
  range: {
    from: string;
    to: string;
    cageId: string | null;
  };
  eggCollections: {
    totalEggs: number;
    count: number;
    daily: DailyEggCollection[];
  };
  deaths: {
    totalQuantity: number;
    count: number;
    recent: Death[];
  };
  entries: {
    totalQuantity: number;
    count: number;
    recent: Entry[];
  };
  discards: {
    totalQuantity: number;
    count: number;
    recent: Discard[];
  };
  medicationApplications: {
    count: number;
    recent: MedicationApplication[];
  };
}
