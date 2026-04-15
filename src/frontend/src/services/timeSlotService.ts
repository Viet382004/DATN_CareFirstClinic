import { apiGet, apiPost, apiPatch, apiDelete } from './apiClient';
import type { TimeSlot } from '../types/schedule';

export const timeSlotService = {
  /**
   * Lấy danh sách slot theo ScheduleId
   */
  async getByScheduleId(scheduleId: string): Promise<TimeSlot[]> {
    return apiGet(`/timeslot/schedule/${scheduleId}`);
  },

  /**
   * Lấy chi tiết slot
   */
  async getById(id: string): Promise<TimeSlot> {
    return apiGet(`/timeslot/${id}`);
  },

  /**
   * Lấy danh sách slot của bác sĩ theo ngày (merged)
   */
  async getByDoctorAndDate(doctorId: string, date: string): Promise<TimeSlot[]> {
    return apiGet(`/timeslot/doctor/${doctorId}/date/${date}`);
  },

  /**
   * Thêm 1 slot lẻ vào Schedule
   */
  async addSlot(scheduleId: string, startTime: string, endTime: string): Promise<TimeSlot> {
    return apiPost(`/timeslot/schedule/${scheduleId}`, { startTime, endTime });
  },

  /**
   * Khóa/mở slot thủ công (Toggle IsBooked)
   */
  async toggleBooked(id: string): Promise<TimeSlot> {
    return apiPatch(`/timeslot/${id}/toggle`, {});
  },

  /**
   * Xóa slot chưa được đặt
   */
  async delete(id: string): Promise<void> {
    return apiDelete(`/timeslot/${id}`);
  }
};
