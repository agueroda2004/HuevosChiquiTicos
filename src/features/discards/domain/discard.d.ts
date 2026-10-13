export type Discard = {
  id: string;
  quantity: number;
  cageId: string;
  discardDate: string;
};

export type CreateDiscardInput = {
  quantity: number;
  cageId: string;
  discardDate: string;
};

export type UpdateDiscardInput = {
  id: string;
  quantity: number;
  cageId: string;
  discardDate: string;
};

export type DiscardsQuery = {
  cageId?: string;
  from?: string;
  to?: string;
  page: number;
  pageSize: number;
};
