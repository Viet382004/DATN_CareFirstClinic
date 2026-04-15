// services/appointmentService.ts
import { apiGet, apiPost, apiPut, apiPatch } from './apiClient';
import type {
  Appointment,
  CreateAppointmentDTO,
  UpdateAppointmentDTO,
  CancelAppointmentDTO,
  AppointmentQueryParams
} from '../types/appointment';
import type { PagedResult } from '../types/common';

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
   * Tạo lịch hẹn hộ bệnh nhân (Requires: Admin role)
   */
  async createByAdmin(patientId: string, data: CreateAppointmentDTO): Promise<{ message: string; data: Appointment }> {
    return apiPost(`/appointment/admin/${patientId}`, data);
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
   * Doctor cập nhật phí thuốc sau khi kê đơn
   */
  async updateMedicineFee(id: string, medicineFee: number): Promise<{ message: string; data: Appointment }> {
    return apiPatch(`/appointment/${id}/medicine-fee`, { medicineFee });
  },

  /**
   * Chuyển trạng thái sang Đang chờ (Requires: Admin role)
   */
  async toWaiting(id: string): Promise<{ message: string; data: Appointment }> {
    return apiPatch(`/appointment/${id}/waiting`);
  },

  /**
   * Bắt đầu khám (Requires: Doctor role)
   */
  async startExamination(id: string): Promise<{ message: string; data: Appointment }> {
    return apiPatch(`/appointment/${id}/start-examination`);
  },

  /**
   * Hủy lịch hẹn (Requires: all roles)
   */
  async cancel(id: string, data: CancelAppointmentDTO): Promise<{ message: string; data: Appointment }> {
    return apiPatch(`/appointment/${id}/cancel`, data);
  },

  /**
   * Lấy danh sách lịch hẹn chưa thanh toán (Requires: Patient role)
   */
  async getUnpaidAppointments(params?: AppointmentQueryParams): Promise<PagedResult<Appointment>> {
    return apiGet('/appointment/me/unpaid', params);
  },

};