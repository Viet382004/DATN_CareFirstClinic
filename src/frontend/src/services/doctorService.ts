import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './apiClient';
import type{ 
  Doctor, 
  CreateDoctorDTO, 
  UpdateDoctorDTO, 
  DoctorQueryParams 
} from '../types/doctor';
import type{ PagedResult } from '../types/common';


export const doctorService = {
  /**
   * Lấy danh sách bác sĩ có phân trang (Public)
   */
  async getList(params?: DoctorQueryParams): Promise<PagedResult<Doctor>> {
    return apiGet('/doctor', params);
  },

  /**
   * Lấy chi tiết 1 bác sĩ (Public)
   */
  async getById(id: string): Promise<Doctor> {
    return apiGet(`/doctor/${id}`);
  },

  /**
   * Lấy hồ sơ bác sĩ hiện tại (Requires: Doctor role)
   */
  async getMe(): Promise<Doctor> {
    return apiGet('/doctor/me');
  },

  /**
   * Lấy danh sách bác sĩ theo chuyên khoa (Public)
   */
  async getBySpecialty(specialtyId: string, params?: DoctorQueryParams): Promise<PagedResult<Doctor>> {
    return apiGet(`/doctor/specialty/${specialtyId}`, params);
  },

  /**
   * Tạo bác sĩ mới (Requires: Admin role)
   */
  async create(data: CreateDoctorDTO): Promise<{ message: string; data: Doctor }> {
    return apiPost('/doctor', data);
  },

  /**
   * Cập nhật hồ sơ bác sĩ (Requires: Admin role)
   */
  async update(id: string, data: UpdateDoctorDTO): Promise<{ message: string; data: Doctor }> {
    return apiPut(`/doctor/${id}`, data);
  },

  /**
   * Cập nhật hồ sơ bác sĩ hiện tại (Requires: Doctor role)
   */
  async updateMe(data: UpdateDoctorDTO): Promise<{ message: string; data: Doctor }> {
    return apiPut('/doctor/me', data);
  },

  /**
   * Xóa bác sĩ (Soft delete) (Requires: Admin role)
   */
  async delete(id: string): Promise<{ message: string }> {
    return apiDelete(`/doctor/${id}`);
  },

  /**
   * Bật/tắt trạng thái bác sĩ (Requires: Admin role)
   */
  async toggleActive(id: string): Promise<{ message: string; isActive: boolean }> {
    return apiPatch(`/doctor/${id}/toggle`);
  },
};
