import { apiGet, apiPost, apiPatch } from './apiClient';

export interface PrescriptionMedicine {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  medicalRecordId: string;
  doctorId: string;
  prescriptionDate: string;
  medicines: PrescriptionMedicine[];
  instructions?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePrescriptionDTO {
  medicalRecordId: string;
  medicines: Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes?: string;
  }>;
  instructions?: string;
}

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
  async create(data: CreatePrescriptionDTO): Promise<Prescription> {
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
