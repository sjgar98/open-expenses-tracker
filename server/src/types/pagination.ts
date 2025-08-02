export interface PaginatedResults<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
}

