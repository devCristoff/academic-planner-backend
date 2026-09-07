/**
 * Generic shape returned by paginated list operations at the service/repository layer.
 * Matches the frontend's `DatatableResponse` shape exactly: data, total, page, limit, totalPages.
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
