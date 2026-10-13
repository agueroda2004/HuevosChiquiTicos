export interface EggCollection {
  id: string;
  cageId: string;
  collectionDate: string;
  quantity: number;
}

export interface CreateEggCollectionDTO {
  cageId: string;
  collectionDate: string;
  quantity: number;
}

export type UpdateEggCollectionDTO = CreateEggCollectionDTO;

export interface EggCollectionsQuery {
  cageId?: string;
  from?: string;
  to?: string;
  page: number;
  pageSize: number;
}
