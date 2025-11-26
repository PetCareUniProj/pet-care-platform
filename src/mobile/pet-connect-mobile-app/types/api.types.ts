// Common API types based on backend OpenAPI specs

/**
 * Standard problem details response from backend
 */
export interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
}

/**
 * Generic API error type
 */
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
  problemDetails?: ProblemDetails;
}

/**
 * Paginated response matching backend structure
 */
export interface PaginatedResponse<T> {
  items: T[];
  pageSize: number;
  page: number;
  total: number;
  hasNextPage?: boolean;
}

/**
 * Query parameters for paginated requests
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
}
