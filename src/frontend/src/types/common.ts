export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PagedResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  page: number;
  pageSize: number;
}