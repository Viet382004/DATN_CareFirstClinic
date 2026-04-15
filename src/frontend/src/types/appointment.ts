export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  timeSlotId: string;
  doctorId: string;
  doctorName: string;
  specialtyName: string;
  serviceName?: string;
  consultationFee: number;
  medicineFee: number;
  isConsultationPaid: boolean;
  isMedicinePaid: boolean;
  // Backward-compatible fields used by older UI components
  totalAmount?: number;
  paymentStatus?: 'Unpaid' | 'Paid' | 'Refunded';
  workDate: string;
  startTime: string;
  endTime: string;
  status: 'Pending' | 'Confirmed' | 'Waiting' | 'InProgress' | 'Completed' | 'Cancelled';
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
  serviceName?: string;
  consultationFee: number;
}

export interface UpdateAppointmentDTO {
  reason?: string;
  notes?: string;
  status?: 'Pending' | 'Confirmed' | 'Waiting' | 'InProgress' | 'Completed' | 'Cancelled';
  paymentStatus?: 'Unpaid' | 'Paid' | 'Refunded';
}

export interface CancelAppointmentDTO {
  cancelReason: string;
}

export interface AppointmentQueryParams {
  patientId?: string;
  doctorId?: string;
  today?: boolean;
  status?: string;
  paymentStatus?: 'Unpaid' | 'Paid' | 'Refunded';
  page?: number;
  pageSize?: number;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDir?: string;
  search?: string;
}