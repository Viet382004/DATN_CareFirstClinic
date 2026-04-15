export interface Payment {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId: string;
  orderId: string;
  amount: number;
  type: 'ConsultationFee' | 'MedicineFee';
  method: 'Cash' | 'CreditCard' | 'VNPay' | 'BankTransfer';
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  transactionId?: string;
  bankCode?: string;
  notes?: string;
  createdAt: string;
  paidAt?: string;
}

export interface CreatePaymentDTO {
  appointmentId: string;
  amount: number;
  type: 'ConsultationFee' | 'MedicineFee';
  method: 'Cash' | 'CreditCard' | 'VNPay' | 'BankTransfer';
  notes?: string;
  patientId: string;
}

export interface VNPayPaymentRequest {
  appointmentId: string;
}

export interface VNPayPaymentResponse {
  success: boolean;
  message: string;
  data?: {
    paymentUrl: string;
    orderId: string;
    paymentId: string;
    amount: number;
    expiresInMinutes: number;
  };
}

export interface VNPayReturnResult {
  isSuccess: boolean;
  orderId: string;
  transactionId: string;
  amount: number;
  responseCode: string;
  transactionStatus: string;
  bankCode: string;
  payDate: string;
  message: string;
}

export interface PaymentStatusResponse {
  orderId: string;
  paymentId: string;
  status: string;
  amount: number;
  transactionId?: string;
  bankCode?: string;
  paidAt?: string;
  createdAt: string;
}

export interface PaymentHistoryResponse {
  id: string;
  orderId: string;
  amount: number;
  status: string;
  method: string;
  transactionId?: string;
  serviceName?: string;
  createdAt: string;
  paidAt?: string;
}

export interface PaymentQueryParams {
  appointmentId?: string;
  patientId?: string;
  status?: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  method?: 'Cash' | 'CreditCard' | 'VNPay' | 'BankTransfer';
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: string;
  fromDate?: string;
  toDate?: string;
}