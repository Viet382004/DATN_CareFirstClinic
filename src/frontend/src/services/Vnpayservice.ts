// ════════════════════════════════════════════════════════════════
// vnpayService.ts — Frontend service tích hợp VNPay
// ════════════════════════════════════════════════════════════════
import { apiRequest } from "./apiClient";

// ── Types ─────────────────────────────────────────────────────────
export interface CreateVNPayRequest {
  appointmentId: string;
  amount: number;
  notes?: string;
}

export interface CreateVNPayResponse {
  paymentUrl: string;  // URL redirect sang VNPay
  orderId: string;
  paymentId: string;
}

export interface VNPayReturnResult {
  isSuccess: boolean;
  orderId: string;
  transactionId: string;
  amount: number;
  responseCode: string;
  transactionStatus: string;
  bankCode: string;
  message: string;
}

// ── Service ───────────────────────────────────────────────────────
const vnpayService = {
  /**
   * Bước 1: Tạo URL thanh toán VNPay
   * POST /api/payment/vnpay
   * Sau khi nhận paymentUrl → redirect user tới VNPay
   *
   * @example
   * const { paymentUrl } = await vnpayService.createPayment({
   *   appointmentId: "xxx",
   *   amount: 350000
   * });
   * window.location.href = paymentUrl; // Redirect sang VNPay
   */
  createPayment: (data: CreateVNPayRequest): Promise<CreateVNPayResponse> =>
    apiRequest<CreateVNPayResponse>("/payment/vnpay", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Bước 2: Lấy kết quả sau khi VNPay redirect về
   * GET /api/payment/vnpay-return?{query params từ VNPay}
   * Gọi endpoint này khi user được VNPay redirect về trang result
   *
   * @example
   * // Trên trang /payment/result:
   * const params = window.location.search; // ?vnp_ResponseCode=00&...
   * const result = await vnpayService.getReturnResult(params);
   */
  getReturnResult: (queryString: string): Promise<VNPayReturnResult> =>
    apiRequest<VNPayReturnResult>(`/payment/vnpay-return${queryString}`),
};

export default vnpayService;