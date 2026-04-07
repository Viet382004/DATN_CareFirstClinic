import { apiGet, apiPost, apiPatch } from './apiClient';

export interface Payment {
  id: string;
  appointmentId: string;
  patientId: string;
  amount: number;
  method: string;
  status: string;
  transactionCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDTO {
  appointmentId: string;
  amount: number;
  method: string;
}

export interface PaymentQueryParams {
  appointmentId?: string;
  patientId?: string;
  status?: string;
  method?: string;
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

export const paymentService = {
  /**
   * Lấy danh sách thanh toán có phân trang (Requires: Admin role)
   */
  async getList(params?: PaymentQueryParams): Promise<PagedResult<Payment>> {
    return apiGet('/payment', params);
  },

  /**
   * Lấy chi tiết thanh toán (Requires: Admin, Patient role)
   */
  async getById(id: string): Promise<Payment> {
    return apiGet(`/payment/${id}`);
  },

  /**
   * Lấy thanh toán theo lịch hẹn (Requires: Admin, Doctor, Patient role)
   */
  async getByAppointmentId(appointmentId: string): Promise<Payment> {
    return apiGet(`/payment/appointment/${appointmentId}`);
  },

  /**
   * Lấy lịch sử thanh toán của bệnh nhân (Requires: Patient role)
   */
  async getMyPayments(params?: PaymentQueryParams): Promise<PagedResult<Payment>> {
    return apiGet('/payment/me', params);
  },

  /**
   * Tạo thanh toán mới (Requires: Patient role)
   */
  async create(data: CreatePaymentDTO): Promise<Payment> {
    return apiPost('/payment', data);
  },

  /**
   * Xác nhận thanh toán (Requires: Admin role)
   */
  async complete(id: string, transactionId?: string): Promise<Payment> {
    const params = transactionId ? { transactionId } : undefined;
    return apiPatch(`/payment/${id}/complete`, undefined, params);
  },

  /**
   * Hoàn tiền (Requires: Admin role)
   */
  async refund(id: string): Promise<Payment> {
    return apiPatch(`/payment/${id}/refund`);
  },
};
