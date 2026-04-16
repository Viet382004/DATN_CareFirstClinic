// services/paymentService.ts
import { apiGet, apiPost, apiPatch } from './apiClient';
import type {
  Payment,
  CreatePaymentDTO,
  PaymentQueryParams,
  VNPayPaymentResponse,
  PaymentStatusResponse,
  PaymentHistoryResponse
} from '../types/payment';
import type { PagedResult } from '../types/common';

interface WrappedResponse<T> {
  success: boolean;
  message: string;
  data: T;
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

  // CÁC HÀM MỚI CHO VNPAY

  /**
   * Tạo URL thanh toán VNPay (Requires: Patient role)
   * @param appointmentId - Mã lịch hẹn cần thanh toán
   * @returns URL thanh toán và thông tin giao dịch
   */
  async createVNPayPayment(appointmentId: string): Promise<VNPayPaymentResponse> {
    return apiPost('/vnpay/pay-consultation', { appointmentId });
  },

  /**
   * Tạo URL thanh toán VNPay cho phí khám với quyền Admin
   */
  async createVNPayConsultationByAdmin(appointmentId: string, patientId: string): Promise<VNPayPaymentResponse> {
    return apiPost('/vnpay/pay-consultation', { appointmentId, patientId });
  },

  /**
   * Tạo URL thanh toán VNPay cho phí thuốc
   */
  async createVNPayMedicinePayment(appointmentId: string, patientId?: string): Promise<VNPayPaymentResponse> {
    return apiPost('/vnpay/pay-medicine', { appointmentId, patientId });
  },

  /**
   * Kiểm tra trạng thái thanh toán theo OrderId
   * @param orderId - Mã đơn hàng VNPay
   */
  async getPaymentStatus(orderId: string): Promise<PaymentStatusResponse> {
    const response = await apiGet<WrappedResponse<PaymentStatusResponse>>(`/vnpay/status/${orderId}`);
    return response.data;
  },

  /**
   * Lấy lịch sử thanh toán VNPay của bệnh nhân (Requires: Patient role)
   */
  async getMyVNPayPayments(page: number = 1, pageSize: number = 10): Promise<{
    total: number;
    page: number;
    pageSize: number;
    payments: PaymentHistoryResponse[];
  }> {
    return apiGet('/vnpay/my-payments', { page, pageSize });
  },

  /**
   * Xử lý kết quả return từ VNPay (gọi từ PaymentResult page)
   * @param queryParams - URL search params từ redirect
   */
  async handleVNPayReturn(queryParams: URLSearchParams): Promise<{
    isSuccess: boolean;
    orderId: string;
    transactionId: string;
    amount: number;
    responseCode: string;
    message: string;
  }> {
    const responseCode = queryParams.get('code');
    const orderId = queryParams.get('orderId') || '';
    const transactionId = queryParams.get('transactionId') || '';
    const amount = Number(queryParams.get('amount')) || 0;
    const message = queryParams.get('message') || '';

    const isSuccess = responseCode === '00';

    // Optional: Gọi API để xác nhận status từ server
    if (orderId && isSuccess) {
      try {
        await this.getPaymentStatus(orderId);
      } catch (error) {
        console.error('Error confirming payment status:', error);
      }
    }

    return {
      isSuccess,
      orderId,
      transactionId,
      amount,
      responseCode: responseCode || 'unknown',
      message
    };
  },

};
