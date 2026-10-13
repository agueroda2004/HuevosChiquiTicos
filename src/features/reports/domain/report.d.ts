import type { Death } from "../../deaths/domain/death";
import type { Discard } from "../../discards/domain/discard";
import type { Entry } from "../../entries/domain/entry";
import type { MedicationApplication } from "../../medication-applications/domain/medication-application";

export type ReportsQuery = {
  from: string;
  to: string;
  cageId?: string;
  recentLimit?: number;
};

export type DailyEggCollection = {
  date: string;
  quantity: number;
};

export type ProductionReport = {
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
};
