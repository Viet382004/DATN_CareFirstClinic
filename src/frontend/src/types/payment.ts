export interface Payment {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId: string;
  amount: number;
  method: string;
  status: string;
  transactionId?: string;
  notes?: string;
  createdAt: string;
  paidAt?: string;
}

export interface CreatePaymentDTO {
  appointmentId: string;
  amount: number;
  method: string;
  notes?: string;
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
