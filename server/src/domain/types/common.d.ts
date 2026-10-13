export type DeleteResult = "deleted" | "not_found" | "in_use";

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
