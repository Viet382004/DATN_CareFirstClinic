// src/types/prescription.ts

export type PrescriptionStatus = 'Issued' | 'Dispensed' | 'Cancelled' | 'Expired';

export interface PrescriptionDetail {
  id: string;
  stockId: string;
  medicineName: string;
  medicineCode?: string;
  unit?: string;
  frequency: string;        // Tần suất: 2 lần/ngày
  durationDays: number;     // Số ngày dùng
  quantity: number;         // Số lượng xuất kho
  instructions?: string;    // Uống trước/sau ăn
  unitPrice: number;
  totalPrice: number;
}

export interface Prescription {
  id: string;
  medicalRecordId: string;
  status: PrescriptionStatus;
  notes?: string;
  issuedAt: string; // ISO date string
  details: PrescriptionDetail[];
}

export interface CreatePrescriptionDetailDTO {
  stockId: string;
  frequency: string;
  durationDays: number;
  quantity: number;
  instructions?: string;
}

export interface CreatePrescriptionDTO {
  medicalRecordId: string;
  notes?: string;
  details: CreatePrescriptionDetailDTO[];
}

export interface PrescriptionResponse {
  message: string;
  data: Prescription;
}
