export interface PaginatedResults<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
}

export interface PaginationDto {
  page: number;
  pageSize: number;
}

export const DEFAULT_PAGE_SIZE_OPTIONS: number[] = [10, 25, 50];

