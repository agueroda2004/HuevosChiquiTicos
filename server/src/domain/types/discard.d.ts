export interface Discard {
  id: string;
  quantity: number;
  cageId: string;
  discardDate: string;
}

export interface CreateDiscardDTO {
  quantity: number;
  cageId: string;
  discardDate: string;
}

export type UpdateDiscardDTO = CreateDiscardDTO;

export interface DiscardsQuery {
  cageId?: string;
  from?: string;
  to?: string;
  page: number;
  pageSize: number;
}
