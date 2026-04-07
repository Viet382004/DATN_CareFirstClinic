import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './apiClient';

export interface Doctor {
  id: string;
  userId: string;
  fullName: string;
  specialtyId: string;
  specialtyName?: string;
  licenseNumber: string;
  yearsOfExperience: number;
  bio?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDoctorDTO {
  userId: string;
  specialtyId: string;
  licenseNumber: string;
  yearsOfExperience: number;
  bio?: string;
  avatarUrl?: string;
}

export interface UpdateDoctorDTO {
  specialtyId?: string;
  licenseNumber?: string;
  yearsOfExperience?: number;
  bio?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

export interface DoctorQueryParams {
  name?: string;
  specialtyId?: string;
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
  async getBySpecialty(specialtyId: string): Promise<Doctor[]> {
    return apiGet(`/doctor/specialty/${specialtyId}`);
  },

  /**
   * Tạo bác sĩ mới (Requires: Admin role)
   */
  async create(data: CreateDoctorDTO): Promise<Doctor> {
    return apiPost('/doctor', data);
  },

  /**
   * Cập nhật hồ sơ bác sĩ (Requires: Admin role)
   */
  async update(id: string, data: UpdateDoctorDTO): Promise<Doctor> {
    return apiPut(`/doctor/${id}`, data);
  },

  /**
   * Cập nhật hồ sơ bác sĩ hiện tại (Requires: Doctor role)
   */
  async updateMe(data: UpdateDoctorDTO): Promise<Doctor> {
    return apiPut('/doctor/me', data);
  },

  /**
   * Xóa bác sĩ (Soft delete) (Requires: Admin role)
   */
  async delete(id: string): Promise<void> {
    return apiDelete(`/doctor/${id}`);
  },

  /**
   * Bật/tắt trạng thái bác sĩ (Requires: Admin role)
   */
  async toggleActive(id: string): Promise<Doctor> {
    return apiPatch(`/doctor/${id}/toggle`);
  },
};
