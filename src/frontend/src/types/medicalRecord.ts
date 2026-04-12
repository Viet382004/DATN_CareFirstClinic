export interface MedicalRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  diagnosis: string;
  symptoms?: string;
  bloodPressure?: number;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  notes?: string;
  followUpDate?: string;
  hasPrescription: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateMedicalRecordDTO {
  appointmentId: string;
  diagnosis: string;
  symptoms?: string;
  bloodPressure?: number;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  notes?: string;
  followUpDate?: string;
}

export interface UpdateMedicalRecordDTO {
  diagnosis: string;
  symptoms?: string;
  bloodPressure?: number;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  notes?: string;
  followUpDate?: string;
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