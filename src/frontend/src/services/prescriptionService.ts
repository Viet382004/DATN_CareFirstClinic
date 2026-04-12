import { apiGet, apiPost, apiPatch } from './apiClient';
import type { Prescription, CreatePrescriptionDTO, PrescriptionResponse } from '../types/prescription';


export const prescriptionService = {
  /**
   * Lấy chi tiết đơn thuốc (Requires: Admin, Doctor, Patient role)
   */
  async getById(id: string): Promise<Prescription> {
    return apiGet(`/prescription/${id}`);
  },

  /**
   * Lấy đơn thuốc theo hồ sơ bệnh án (Requires: Admin, Doctor, Patient role)
   */
  async getByMedicalRecordId(medicalRecordId: string): Promise<Prescription> {
    return apiGet(`/prescription/medicalrecord/${medicalRecordId}`);
  },

  /**
   * Tạo đơn thuốc mới (Requires: Doctor role)
   */
  async create(data: CreatePrescriptionDTO): Promise<PrescriptionResponse> {
    return apiPost('/prescription', data);
  },

  /**
   * Phát thuốc và trừ kho (Requires: Admin role)
   */
  async dispense(id: string): Promise<Prescription> {
    return apiPatch(`/prescription/${id}/dispense`);
  },

  /**
   * Hủy đơn thuốc (Requires: Admin, Doctor role)
   */
  async cancel(id: string): Promise<Prescription> {
    return apiPatch(`/prescription/${id}/cancel`);
  },
};
