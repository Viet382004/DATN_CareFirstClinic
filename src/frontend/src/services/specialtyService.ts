import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiClient';
import type{ 
  Specialty, 
  CreateSpecialtyDTO, 
  UpdateSpecialtyDTO, 
  SpecialtyQueryParams 
} from '../types/specialty';
import type{ PagedResult } from '../types/common';


export const specialtyService = {
  /**
   * Lấy danh sách tất cả chuyên khoa (Public)
   */
  async getAll(): Promise<Specialty[]> {
    return apiGet('/specialty');
  },

  /**
   * Lấy danh sách chuyên khoa phân trang (Public)
   */
  async getPaged(params?: SpecialtyQueryParams): Promise<PagedResult<Specialty>> {
    return apiGet('/specialty/paged', params);
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
