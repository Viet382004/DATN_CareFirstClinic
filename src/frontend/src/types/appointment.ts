export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  timeSlotId: string;
  doctorId: string;
  doctorName: string;
  specialtyName: string;
  workDate: string;
  startTime: string;
  endTime: string;
  status: string;
  reason?: string;
  cancelReason?: string;
  cancelledAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAppointmentDTO {
  timeSlotId: string;
  reason?: string;
  notes?: string;
  fullName: string;
  dob: string;
  gender: string;
  phone: string;
  email?: string;
}

export interface UpdateAppointmentDTO {
  reason?: string;
  notes?: string;
}

export interface CancelAppointmentDTO {
  cancelReason: string;
}

export interface AppointmentQueryParams {
  patientId?: string;
  doctorId?: string;
  today?: boolean;
  status?: string;
  page?: number;
  pageSize?: number;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDir?: string;
  search?: string;
}