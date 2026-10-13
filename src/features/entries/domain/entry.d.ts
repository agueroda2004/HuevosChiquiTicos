export type Entry = {
  id: string;
  quantity: number;
  cageId: string;
  entryDate: string;
};

export type CreateEntryInput = {
  quantity: number;
  cageId: string;
  entryDate: string;
};

export type UpdateEntryInput = {
  id: string;
  quantity: number;
  cageId: string;
  entryDate: string;
};

export type EntriesQuery = {
  cageId?: string;
  from?: string;
  to?: string;
  page: number;
  pageSize: number;
};
