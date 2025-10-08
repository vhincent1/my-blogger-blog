export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResult<T> {
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