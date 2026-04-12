import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';
import type { Schedule, CreateScheduleDTO, UpdateScheduleDTO, ScheduleQueryParams, PagedResult } from '../types/schedule';

export const scheduleService = {
  /**
   * Lấy danh sách lịch làm việc có phân trang (Requires: Admin role)
   */
  async getList(params?: ScheduleQueryParams): Promise<PagedResult<Schedule>> {
    return apiGet('/schedule', params);
  },

  /**
   * Lấy chi tiết lịch làm việc (Requires: Admin, Doctor role)
   */
  async getById(id: string): Promise<Schedule> {
    return apiGet(`/schedule/${id}`);
  },

  /**
   * Lấy lịch làm việc của bác sĩ hiện tại (Requires: Doctor role)
   */
  async getMySchedules(): Promise<Schedule[]> {
    return apiGet('/schedule/me');
  },

  /**
   * Lấy lịch làm việc của một bác sĩ (Public, Doctor, Admin)
   */
  async getByDoctorId(doctorId: string): Promise<Schedule[]> {
    return apiGet(`/schedule/doctor/${doctorId}`);
  },

  /**
   * Lấy lịch làm việc của bác sĩ theo ngày (Public, Doctor, Admin)
   */
  async getByDoctorAndDate(doctorId: string, date: Date | string): Promise<Schedule[]> {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    return apiGet(`/schedule/doctor/${doctorId}/date/${dateStr}`);
  },

  /**
   * Lấy lịch còn slot trống của bác sĩ (Public, Doctor, Admin)
   */
  async getAvailable(doctorId: string, fromDate?: Date | string): Promise<Schedule[]> {
    const params: any = {};
    if (fromDate) {
      params.fromDate = typeof fromDate === 'string' ? fromDate : fromDate.toISOString().split('T')[0];
    }
    return apiGet(`/schedule/doctor/${doctorId}/available`, params);
  },

  /**
   * Lấy lịch còn slot trống của bác sĩ theo ngày (Public, Doctor, Admin)
   */
  async getAvailableByDoctorAndDate(doctorId: string, date: Date | string): Promise<Schedule[]> {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    return apiGet(`/schedule/doctor/${doctorId}/available/date/${dateStr}`);
  },

  /**
   * Tạo lịch làm việc mới (Requires: Admin role)
   */
  async create(data: CreateScheduleDTO): Promise<Schedule> {
    return apiPost('/schedule', data);
  },

  /**
   * Tạo lịch làm việc cho bác sĩ hiện tại (Requires: Doctor role)
   */
  async createForMe(data: CreateScheduleDTO): Promise<Schedule> {
    return apiPost('/schedule/me', data);
  },

  /**
   * Cập nhật lịch làm việc (Requires: Admin role)
   */
  async update(id: string, data: UpdateScheduleDTO): Promise<Schedule> {
    return apiPut(`/schedule/${id}`, data);
  },

  /**
   * Cập nhật lịch làm việc của bác sĩ hiện tại (Requires: Doctor role)
   */
  async updateForMe(id: string, data: UpdateScheduleDTO): Promise<Schedule> {
    return apiPut(`/schedule/me/${id}`, data);
  },

  /**
   * Xóa lịch làm việc (Requires: Admin role)
   */
  async delete(id: string): Promise<void> {
    return apiDelete(`/schedule/${id}`);
  },
};
