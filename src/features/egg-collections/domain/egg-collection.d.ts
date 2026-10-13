export type EggCollection = {
  id: string;
  cageId: string;
  collectionDate: string;
  quantity: number;
};

export type CreateEggCollectionInput = {
  cageId: string;
  collectionDate: string;
  quantity: number;
};

export type UpdateEggCollectionInput = {
  id: string;
  cageId: string;
  collectionDate: string;
  quantity: number;
};

export type EggCollectionsQuery = {
  cageId?: string;
  from?: string;
  to?: string;
  page: number;
  pageSize: number;
};
