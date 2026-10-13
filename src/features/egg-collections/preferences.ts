const STORAGE_KEY = "huevos-chiquiticos.egg-collections.keep-date";

export type EggCollectionDatePreference = {
  enabled: boolean;
  date: string | null;
};

const DEFAULT_PREFERENCE: EggCollectionDatePreference = { enabled: false, date: null };

export function readDatePreference(): EggCollectionDatePreference {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_PREFERENCE;

  try {
    const parsed = JSON.parse(raw) as Partial<EggCollectionDatePreference>;
    return {
      enabled: parsed.enabled === true,
      date: typeof parsed.date === "string" && parsed.date !== "" ? parsed.date : null,
    };
  } catch {
    return DEFAULT_PREFERENCE;
  }
}

export function writeDatePreference(preference: EggCollectionDatePreference): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preference));
}
