export interface Entry {
  id: string;
  quantity: number;
  cageId: string;
  entryDate: string;
}

export interface CreateEntryDTO {
  quantity: number;
  cageId: string;
  entryDate: string;
}

export type UpdateEntryDTO = CreateEntryDTO;

export interface EntriesQuery {
  cageId?: string;
  from?: string;
  to?: string;
  page: number;
  pageSize: number;
}
