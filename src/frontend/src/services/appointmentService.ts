import { apiGet, apiPost, apiPut, apiPatch } from './apiClient';

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
  sortBy?: string;
  sortDir?: string;
  search?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export const appointmentService = {
  /**
   * Lấy danh sách lịch hẹn có phân trang (Requires: Admin role)
   */
  async getList(params?: AppointmentQueryParams): Promise<PagedResult<Appointment>> {
    return apiGet('/appointment', params);
  },

  /**
   * Lấy chi tiết lịch hẹn (Admin, Doctor, Patient role)
   */
  async getById(id: string): Promise<Appointment> {
    return apiGet(`/appointment/${id}`);
  },

  /**
   * Lấy danh sách lịch hẹn của bệnh nhân hiện tại (Requires: Patient role)
   */
  async getMyAppointments(params?: AppointmentQueryParams): Promise<PagedResult<Appointment>> {
    return apiGet('/appointment/me', params);
  },

  /**
   * Lấy danh sách lịch hẹn của bác sĩ hiện tại (Requires: Doctor role)
   */
  async getMyDoctorAppointments(params?: AppointmentQueryParams): Promise<PagedResult<Appointment>> {
    return apiGet('/appointment/me/doctor', params);
  },

  /**
   * Lấy danh sách lịch hẹn của 1 bác sĩ (Requires: Admin role)
   */
  async getByDoctorId(doctorId: string, params?: AppointmentQueryParams): Promise<Appointment[]> {
    return apiGet(`/appointment/doctor/${doctorId}`, params);
  },

  /**
   * Tạo lịch hẹn mới (Requires: Patient role)
   */
  async create(data: CreateAppointmentDTO): Promise<{ message: string; data: Appointment }> {
    return apiPost('/appointment', data);
  },

  /**
   * Cập nhật lịch hẹn (Requires: Patient role)
   */
  async update(id: string, data: UpdateAppointmentDTO): Promise<{ message: string; data: Appointment }> {
    return apiPut(`/appointment/${id}`, data);
  },

  /**
   * Xác nhận lịch hẹn (Requires: Admin, Doctor role)
   */
  async confirm(id: string): Promise<{ message: string; data: Appointment }> {
    return apiPatch(`/appointment/${id}/confirm`);
  },

  /**
   * Hoàn thành lịch hẹn (Requires: Doctor role)
   */
  async complete(id: string): Promise<{ message: string; data: Appointment }> {
    return apiPatch(`/appointment/${id}/complete`);
  },

  /**
   * Hủy lịch hẹn (Requires: all roles)
   */
  async cancel(id: string, data: CancelAppointmentDTO): Promise<{ message: string; data: Appointment }> {
    return apiPatch(`/appointment/${id}/cancel`, data);
  },
};
