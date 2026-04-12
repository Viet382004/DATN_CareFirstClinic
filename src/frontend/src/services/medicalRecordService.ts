import { apiGet, apiPost, apiPut } from './apiClient';
import type { MedicalRecord, CreateMedicalRecordDTO, UpdateMedicalRecordDTO, MedicalRecordQueryParams, PagedResult } from '../types/medicalRecord';


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
  async create(data: CreateMedicalRecordDTO): Promise<{
    message: string;
    data: MedicalRecord
  }> {
    return apiPost('/medicalrecord', data);
  },
  /**
   * Cập nhật hồ sơ bệnh án (Requires: Doctor, Admin role)
   */
  async update(id: string, data: UpdateMedicalRecordDTO): Promise<{
    message: string; data: MedicalRecord
  }> {
    return apiPut(`/medicalrecord/${id}`, data);
  },
};
