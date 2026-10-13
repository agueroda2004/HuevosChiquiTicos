export type DeathType = "sacrifice" | "disease" | "other";

export interface Death {
  id: string;
  deathDate: string;
  cageId: string;
  quantity: number;
  type: DeathType;
}

export interface CreateDeathDTO {
  deathDate: string;
  cageId: string;
  quantity: number;
  type: DeathType;
}

export type UpdateDeathDTO = CreateDeathDTO;

export interface DeathsQuery {
  cageId?: string;
  from?: string;
  to?: string;
  type?: DeathType;
  page: number;
  pageSize: number;
}
