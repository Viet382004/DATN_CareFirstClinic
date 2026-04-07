import { apiGet, apiPut, apiDelete } from './apiClient';

export interface Patient {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  address?: string;
  medicalHistory?: string;
  allergies?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePatientDTO {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  medicalHistory?: string;
  allergies?: string;
}

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
    return apiPut('/patient/me', data);
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
};
