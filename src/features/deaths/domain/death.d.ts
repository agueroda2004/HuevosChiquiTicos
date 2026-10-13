export type DeathType = "sacrifice" | "disease" | "other";

export type Death = {
  id: string;
  deathDate: string;
  cageId: string;
  quantity: number;
  type: DeathType;
};

export type CreateDeathInput = {
  deathDate: string;
  cageId: string;
  quantity: number;
  type: DeathType;
};

export type UpdateDeathInput = {
  id: string;
  deathDate: string;
  cageId: string;
  quantity: number;
  type: DeathType;
};

export type DeathsQuery = {
  cageId?: string;
  from?: string;
  to?: string;
  type?: DeathType;
  page: number;
  pageSize: number;
};
