import { apiGet, apiPost, apiPut, apiPatch } from './apiClient';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  scheduleId: string;
  workDate: string;
  timeSlot: string;
  reason?: string;
  diagnosis?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentDTO {
  doctorId: string;
  scheduleId: string;
  workDate: string;
  timeSlot: string;
  reason?: string;
}

export interface UpdateAppointmentDTO {
  reason?: string;
  diagnosis?: string;
  status?: string;
}

export interface CancelAppointmentDTO {
  reason?: string;
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
  async create(data: CreateAppointmentDTO): Promise<Appointment> {
    return apiPost('/appointment', data);
  },

  /**
   * Cập nhật lịch hẹn (Requires: Patient role)
   */
  async update(id: string, data: UpdateAppointmentDTO): Promise<Appointment> {
    return apiPut(`/appointment/${id}`, data);
  },

  /**
   * Xác nhận lịch hẹn (Requires: Admin, Doctor role)
   */
  async confirm(id: string): Promise<Appointment> {
    return apiPatch(`/appointment/${id}/confirm`);
  },

  /**
   * Hoàn thành lịch hẹn (Requires: Doctor role)
   */
  async complete(id: string): Promise<Appointment> {
    return apiPatch(`/appointment/${id}/complete`);
  },

  /**
   * Hủy lịch hẹn (Requires: all roles)
   */
  async cancel(id: string, data?: CancelAppointmentDTO): Promise<Appointment> {
    return apiPatch(`/appointment/${id}/cancel`, data);
  },
};
