import { apiGet, apiPut, apiDelete, apiPatch } from './apiClient';
import type { Patient, UpdatePatientDTO } from '../types/patient';

export const patientService = {
  /**
   * Lấy danh sách tất cả bệnh nhân (Requires: Admin role)
   */
  async getAll(): Promise<Patient[]> {
    return apiGet('/patient');
  },

  /**
   * Lấy hồ sơ bệnh nhân hiện tại (Requires: Patient role)
   */
  async getMe(): Promise<Patient> {
    return apiGet('/patient/me');
  },

  /**
   * Lấy chi tiết bệnh nhân theo ID (Requires: Admin, Doctor role)
   */
  async getById(id: string): Promise<Patient> {
    return apiGet(`/patient/${id}`);
  },

  /**
   * Cập nhật hồ sơ bệnh nhân hiện tại (Requires: Patient role)
   */
  async updateMe(data: UpdatePatientDTO): Promise<Patient> {
    const response = await apiPut<{ message: string; data: Patient }>('/patient/me', data);
    return response.data;
  },

  /**
   * Cập nhật hồ sơ bệnh nhân (Requires: Admin role)
   */
  async updateById(id: string, data: UpdatePatientDTO): Promise<Patient> {
    return apiPut(`/patient/${id}`, data);
  },
  

  /**
   * Xóa bệnh nhân (Soft delete) (Requires: Admin role)
   */
  async delete(id: string): Promise<void> {
    return apiDelete(`/patient/${id}`);
  },

  /**
   * Bật/tắt trạng thái bệnh nhân
   */
  async toggleActive(id: string): Promise<void> {
    return apiPatch(`/patient/${id}/toggle`);
  },

  /**
   * Cập nhật ảnh đại diện (patient / me)
   */
  async uploadAvatar(file: File): Promise<{ message: string; avatarUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL}/avatar/patient`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
      body: formData
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Lỗi tải ảnh lên' }));
      throw new Error(error.message || 'Lỗi tải ảnh lên');
    }

    return response.json();
  },

  /**
   * Xóa ảnh đại diện (patient / me)
   */
  async deleteAvatar(): Promise<{ message: string }> {
    return apiDelete('/avatar/patient');
  }
};
