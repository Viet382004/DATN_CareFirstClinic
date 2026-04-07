import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiClient';

export interface Specialty {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpecialtyDTO {
  name: string;
  description?: string;
  icon?: string;
}

export interface UpdateSpecialtyDTO {
  name?: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
}

export const specialtyService = {
  /**
   * Lấy danh sách tất cả chuyên khoa (Public)
   */
  async getAll(): Promise<Specialty[]> {
    return apiGet('/specialty');
  },

  /**
   * Lấy chi tiết chuyên khoa (Public)
   */
  async getById(id: string): Promise<Specialty> {
    return apiGet(`/specialty/${id}`);
  },

  /**
   * Tạo chuyên khoa mới (Requires: Admin role)
   */
  async create(data: CreateSpecialtyDTO): Promise<Specialty> {
    return apiPost('/specialty', data);
  },

  /**
   * Cập nhật chuyên khoa (Requires: Admin role)
   */
  async update(id: string, data: UpdateSpecialtyDTO): Promise<Specialty> {
    return apiPut(`/specialty/${id}`, data);
  },

  /**
   * Xóa chuyên khoa (Requires: Admin role)
   */
  async delete(id: string): Promise<void> {
    return apiDelete(`/specialty/${id}`);
  },

  /**
   * Bật/tắt chuyên khoa (Requires: Admin role)
   */
  async toggle(id: string): Promise<any> {
    return apiPatch(`/specialty/${id}/toggle`);
  },
};
