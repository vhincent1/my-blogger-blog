export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
  search: string;
  type: string;
}

export interface PaginatedResult<T> {
  parameters: PaginationParams
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  nextPageToken: number | null;
}

export interface PaginatedQuery {
  // pages prev,next
  hasPrevPage: boolean;
  hasNextPage: boolean;
  nextPageURL: string;
  previousPageURL: string;
  // original URL
  originalURL: string;
}