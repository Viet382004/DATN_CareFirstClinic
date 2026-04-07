import { apiGet, apiPost, apiPut, apiPatch } from './apiClient';

export interface Stock {
  id: string;
  medicineName: string;
  medicineCode?: string;
  unit?: string;
  manufacturer?: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStockDTO {
  medicineName: string;
  medicineCode?: string;
  unit?: string;
  manufacturer?: string;
  quantity: number;
  minQuantity?: number;
  unitPrice: number;
}

export interface UpdateStockDTO {
  medicineName: string;
  medicineCode?: string;
  unit?: string;
  manufacturer?: string;
  quantity: number;
  minQuantity?: number;
  unitPrice: number;
  isActive?: boolean;
}

export interface ImportStockDTO {
  quantity: number;
}

export interface StockQueryParams {
  name?: string;
  medicineCode?: string;
  isLowStock?: boolean;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export const stockService = {
  /**
   * Lấy danh sách thuốc có phân trang (Requires: Admin, Doctor role)
   */
  async getList(params?: StockQueryParams): Promise<PagedResult<Stock>> {
    return apiGet('/stock', params);
  },

  /**
   * Lấy chi tiết thuốc (Requires: Admin, Doctor role)
   */
  async getById(id: string): Promise<Stock> {
    return apiGet(`/stock/${id}`);
  },

  /**
   * Lấy danh sách thuốc sắp hết (Requires: Admin role)
   */
  async getLowStock(): Promise<Stock[]> {
    return apiGet('/stock/low');
  },

  /**
   * Tạo thuốc mới (Requires: Admin role)
   */
  async create(data: CreateStockDTO): Promise<Stock> {
    return apiPost('/stock', data);
  },

  /**
   * Cập nhật thông tin thuốc (Requires: Admin role)
   */
  async update(id: string, data: UpdateStockDTO): Promise<Stock> {
    return apiPut(`/stock/${id}`, data);
  },

  /**
   * Nhập thêm hàng vào kho (Requires: Admin role)
   */
  async import(id: string, data: ImportStockDTO): Promise<Stock> {
    return apiPatch(`/stock/${id}/import`, data);
  },

  /**
   * Bật/tắt trạng thái thuốc (Requires: Admin role)
   */
  async toggle(id: string): Promise<Stock> {
    return apiPatch(`/stock/${id}/toggle`);
  },
};