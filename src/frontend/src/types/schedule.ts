export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface Schedule {
  id: string;
  doctorId: string;
  doctorName: string;
  specialtyName: string;
  workDate: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  totalSlots: number;
  availableSlots: number;
  isAvailable: boolean;
  note?: string;
  timeSlots: TimeSlot[];
}

export interface CreateScheduleDTO {
  doctorId?: string;
  workDate: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes?: number;
  note?: string;
}

export interface UpdateScheduleDTO {
  note?: string;
  isAvailable?: boolean;
}

export interface ScheduleQueryParams {
  doctorId?: string;
  fromDate?: string;
  toDate?: string;
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