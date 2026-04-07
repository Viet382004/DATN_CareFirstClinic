import { apiGet, apiPost, apiPut } from './apiClient';

export interface MedicalRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  symptoms?: string;
  treatment?: string;
  notes?: string;
  followUpDate?: string;
  hasFollowUp: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicalRecordDTO {
  appointmentId: string;
  diagnosis: string;
  symptoms?: string;
  treatment?: string;
  notes?: string;
  followUpDate?: string;
  hasFollowUp?: boolean;
}

export interface UpdateMedicalRecordDTO {
  diagnosis?: string;
  symptoms?: string;
  treatment?: string;
  notes?: string;
  followUpDate?: string;
  hasFollowUp?: boolean;
}

export interface MedicalRecordQueryParams {
  patientId?: string;
  doctorId?: string;
  diagnosis?: string;
  hasFollowUp?: boolean;
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

export const medicalRecordService = {
  /**
   * Lấy danh sách hồ sơ bệnh án có phân trang (Requires: Admin role)
   */
  async getList(params?: MedicalRecordQueryParams): Promise<PagedResult<MedicalRecord>> {
    return apiGet('/medicalrecord', params);
  },

  /**
   * Lấy chi tiết hồ sơ bệnh án (Requires: Admin, Doctor, Patient role)
   */
  async getById(id: string): Promise<MedicalRecord> {
    return apiGet(`/medicalrecord/${id}`);
  },

  /**
   * Lấy hồ sơ bệnh án theo lịch hẹn (Requires: Admin, Doctor, Patient role)
   */
  async getByAppointmentId(appointmentId: string): Promise<MedicalRecord> {
    return apiGet(`/medicalrecord/appointment/${appointmentId}`);
  },

  /**
   * Lấy danh sách hồ sơ bệnh án của bệnh nhân hiện tại (Requires: Patient role)
   */
  async getMyRecords(params?: MedicalRecordQueryParams): Promise<PagedResult<MedicalRecord>> {
    return apiGet('/medicalrecord/me', params);
  },

  /**
   * Lấy danh sách hồ sơ bệnh án của bác sĩ hiện tại (Requires: Doctor role)
   */
  async getMyDoctorRecords(params?: MedicalRecordQueryParams): Promise<PagedResult<MedicalRecord>> {
    return apiGet('/medicalrecord/me/doctor', params);
  },

  /**
   * Tạo hồ sơ bệnh án mới (Requires: Doctor role)
   */
  async create(data: CreateMedicalRecordDTO): Promise<MedicalRecord> {
    return apiPost('/medicalrecord', data);
  },

  /**
   * Cập nhật hồ sơ bệnh án (Requires: Doctor, Admin role)
   */
  async update(id: string, data: UpdateMedicalRecordDTO): Promise<MedicalRecord> {
    return apiPut(`/medicalrecord/${id}`, data);
  },
};
