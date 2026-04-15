import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { appointmentService } from '../../../services/appointmentService';
import { paymentService } from '../../../services/paymentService';
import type { Appointment } from '../../../types/appointment';
import type { Payment, PaymentQueryParams } from '../../../types/payment';
import {
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  Landmark,
  RefreshCw,
  Wallet,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';

type ChargeKind = 'ConsultationFee' | 'MedicineFee';

function resolveChargeKind(appointment: Appointment): ChargeKind {
  if (!appointment.isConsultationPaid) {
    return 'ConsultationFee';
  }
  return 'MedicineFee';
}

function resolveChargeAmount(appointment: Appointment, kind: ChargeKind): number {
  return kind === 'ConsultationFee' ? appointment.consultationFee : appointment.medicineFee;
}

const methodLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  Cash: { label: 'Tien mat', icon: <Banknote className="h-3 w-3" />, color: 'text-emerald-600' },
  BankTransfer: { label: 'Chuyen khoan', icon: <Landmark className="h-3 w-3" />, color: 'text-blue-600' },
  VNPay: { label: 'VNPay', icon: <CreditCard className="h-3 w-3" />, color: 'text-indigo-600' },
  CreditCard: { label: 'The tin dung', icon: <CreditCard className="h-3 w-3" />, color: 'text-purple-600' },
};

const statusStyles: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
  Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Refunded: 'bg-rose-100 text-rose-700 border-rose-200',
  Failed: 'bg-slate-100 text-slate-500 border-slate-200',
};

const AdminBilling: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentAppointments, setPaymentAppointments] = useState<Record<string, Appointment>>({});
  const [pendingCharges, setPendingCharges] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedCharge, setSelectedCharge] = useState<Appointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showChargeModal, setShowChargeModal] = useState(false);

  const [query, setQuery] = useState<PaymentQueryParams>({
    page: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortDir: 'desc'
  });

  const [filters, setFilters] = useState({
    status: '',
    method: ''
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: PaymentQueryParams = {
        ...query,
        status: filters.status ? (filters.status as PaymentQueryParams['status']) : undefined,
        method: filters.method ? (filters.method as PaymentQueryParams['method']) : undefined,
      };

      const [paymentResult, appointmentResult] = await Promise.all([
        paymentService.getList(params),
        appointmentService.getList({ page: 1, pageSize: 100, sortBy: 'workDate', sortDir: 'desc' })
      ]);

      const paymentItems = paymentResult.items || [];
      setPayments(paymentItems);

      const appointmentIds = Array.from(new Set(paymentItems.map((payment) => payment.appointmentId).filter(Boolean)));
      const appointmentPairs = await Promise.all(
        appointmentIds.map(async (appointmentId) => {
          try {
            const appointment = await appointmentService.getById(appointmentId);
            return [appointmentId, appointment] as const;
          } catch {
            return null;
          }
        })
      );

      setPaymentAppointments(
        appointmentPairs.reduce<Record<string, Appointment>>((accumulator, entry) => {
          if (entry) {
            accumulator[entry[0]] = entry[1];
          }
          return accumulator;
        }, {})
      );

      const outstandingCharges = (appointmentResult.items || []).filter((appointment) => {
        const consultationOutstanding =
          !appointment.isConsultationPaid &&
          appointment.consultationFee > 0 &&
          ['Pending', 'Confirmed'].includes(appointment.status);

        const medicineOutstanding =
          appointment.status === 'Completed' &&
          appointment.medicineFee > 0 &&
          !appointment.isMedicinePaid;

        const chargeKind = resolveChargeKind(appointment);
        const hasPendingPayment = paymentItems.some(
          (payment) => payment.appointmentId === appointment.id && payment.type === chargeKind && payment.status === 'Pending'
        );

        return (consultationOutstanding || medicineOutstanding) && !hasPendingPayment;
      });

      setPendingCharges(outstandingCharges);
    } catch (error) {
      console.error(error);
      toast.error('Khong the tai du lieu hoa don');
    } finally {
      setLoading(false);
    }
  }, [filters.method, filters.status, query]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const totals = useMemo(() => ({
    todayRevenue: payments
      .filter((payment) => payment.status === 'Completed' && new Date(payment.createdAt).toDateString() === new Date().toDateString())
      .reduce((sum, payment) => sum + payment.amount, 0),
    pendingCount: pendingCharges.length,
    completedCount: payments.filter((payment) => payment.status === 'Completed').length,
    refundedCount: payments.filter((payment) => payment.status === 'Refunded').length,
  }), [payments, pendingCharges]);

  const handleCompletePayment = async (payment: Payment) => {
    let transactionId = payment.transactionId;
    if (payment.method !== 'Cash' && payment.method !== 'VNPay') {
      transactionId = window.prompt('Nhap ma giao dich') || undefined;
    }

    try {
      await paymentService.complete(payment.id, transactionId);
      toast.success('Xac nhan thanh toan thanh cong');
      void fetchData();
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Khong the xac nhan thanh toan');
    }
  };

  const handleRefund = async (paymentId: string) => {
    if (!window.confirm('Ban co chac muon hoan tien giao dich nay?')) {
      return;
    }

    try {
      await paymentService.refund(paymentId);
      toast.success('Hoan tien thanh cong');
      void fetchData();
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Khong the hoan tien');
    }
  };

  const handleCheckVNPayStatus = async (orderId: string) => {
    try {
      const status = await paymentService.getPaymentStatus(orderId);
      toast.success(`Trang thai: ${status.status}${status.transactionId ? ` | GD: ${status.transactionId}` : ''}`);
      void fetchData();
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Khong the kiem tra giao dich');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quan ly hoa don</h1>
          <p className="mt-1 text-slate-500">Theo doi giao dich da thanh toan va cac khoan can thu tu lich kham.</p>
        </div>
        <button
          onClick={() => void fetchData()}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          Lam moi
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {[
          { label: 'Tong thu hom nay', value: `${totals.todayRevenue.toLocaleString('vi-VN')}d` },
          { label: 'Khoan can thu', value: totals.pendingCount.toString() },
          { label: 'Hoa don hoan thanh', value: totals.completedCount.toString() },
          { label: 'Hoan tien', value: totals.refundedCount.toString() },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
            <p className="mt-2 text-xl font-black text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
          <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">Khoan can thu</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600"
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="">Tat ca trang thai</option>
              <option value="Pending">Cho thanh toan</option>
              <option value="Completed">Da thanh toan</option>
              <option value="Refunded">Da hoan tien</option>
            </select>
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600"
              value={filters.method}
              onChange={(event) => setFilters((prev) => ({ ...prev, method: event.target.value }))}
            >
              <option value="">Tat ca phuong thuc</option>
              <option value="Cash">Tien mat</option>
              <option value="VNPay">VNPay</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Benh nhan</th>
                <th className="px-6 py-4">Lich kham</th>
                <th className="px-6 py-4">Khoan thu</th>
                <th className="px-6 py-4">So tien</th>
                <th className="px-6 py-4">Trang thai lich</th>
                <th className="px-6 py-4 text-center">Thao tac</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pendingCharges.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">Khong con khoan can thu nao.</td>
                </tr>
              ) : (
                pendingCharges.map((appointment) => {
                  const chargeKind = resolveChargeKind(appointment);
                  const amount = resolveChargeAmount(appointment, chargeKind);
                  return (
                    <tr key={appointment.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-800">{appointment.patientName}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-700">{appointment.serviceName || appointment.specialtyName}</div>
                        <div className="text-[11px] text-slate-400">BS. {appointment.doctorName} | {new Date(appointment.workDate).toLocaleDateString('vi-VN')} {appointment.startTime}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest border',
                          chargeKind === 'ConsultationFee' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-purple-100 text-purple-700 border-purple-200'
                        )}>
                          {chargeKind === 'ConsultationFee' ? 'Phi kham' : 'Tien thuoc'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900">{amount.toLocaleString('vi-VN')}d</td>
                      <td className="px-6 py-4 text-slate-600 font-semibold">{appointment.status}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedCharge(appointment);
                            setShowChargeModal(true);
                          }}
                          className="rounded-lg bg-indigo-600 p-2 text-white hover:bg-indigo-700 transition-colors"
                          title="Thu tien"
                        >
                          <Wallet className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">Giao dich da tao</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Ma don hang</th>
                <th className="px-6 py-4">Benh nhan / Lich</th>
                <th className="px-6 py-4">Loai phi</th>
                <th className="px-6 py-4">So tien</th>
                <th className="px-6 py-4">Hinh thuc</th>
                <th className="px-6 py-4">Trang thai</th>
                <th className="px-6 py-4 text-center">Thao tac</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">Dang tai du lieu...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">Khong co giao dich nao.</td>
                </tr>
              ) : (
                payments.map((payment) => {
                  const appointment = paymentAppointments[payment.appointmentId];
                  return (
                    <tr key={payment.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="font-black text-slate-900">{payment.orderId}</div>
                        <div className="text-[10px] text-slate-400">{new Date(payment.createdAt).toLocaleString('vi-VN')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{payment.patientName}</div>
                        <div className="text-[10px] text-slate-400">{appointment ? `${appointment.serviceName || appointment.specialtyName} | BS. ${appointment.doctorName}` : payment.appointmentId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest border',
                          payment.type === 'ConsultationFee' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-purple-100 text-purple-700 border-purple-200'
                        )}>
                          {payment.type === 'ConsultationFee' ? 'Phi kham' : 'Tien thuoc'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900">{payment.amount.toLocaleString('vi-VN')}d</td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 ${methodLabels[payment.method]?.color || 'text-slate-600'}`}>
                          {methodLabels[payment.method]?.icon || <CreditCard className="h-3 w-3" />}
                          <span className="font-semibold">{methodLabels[payment.method]?.label || payment.method}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest border ${statusStyles[payment.status] || statusStyles.Failed}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowDetailModal(true);
                            }}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 transition-colors"
                            title="Xem chi tiet"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {payment.status === 'Pending' && (
                            <button
                              onClick={() => void handleCompletePayment(payment)}
                              className="rounded-lg bg-indigo-600 p-2 text-white hover:bg-indigo-700 transition-colors"
                              title="Xac nhan thanh toan"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          )}
                          {payment.method === 'VNPay' && (
                            <button
                              onClick={() => void handleCheckVNPayStatus(payment.orderId)}
                              className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Kiem tra VNPay"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          )}
                          {payment.status === 'Completed' && (
                            <button
                              onClick={() => void handleRefund(payment.id)}
                              className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 transition-colors"
                              title="Hoan tien"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hien thi {payments.length} giao dich</p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setQuery((prev) => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
              disabled={(query.page || 1) === 1}
              className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-400 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-600">Trang {query.page || 1}</span>
            <button
              onClick={() => setQuery((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
              disabled={payments.length < (query.pageSize || 10)}
              className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-400 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {showDetailModal && selectedPayment && (
        <PaymentDetailModal
          payment={selectedPayment}
          appointment={paymentAppointments[selectedPayment.appointmentId]}
          onClose={() => setShowDetailModal(false)}
          onComplete={handleCompletePayment}
        />
      )}

      {showChargeModal && selectedCharge && (
        <ChargeCollectionModal
          appointment={selectedCharge}
          onClose={() => setShowChargeModal(false)}
          onCompleted={() => {
            setShowChargeModal(false);
            void fetchData();
          }}
        />
      )}
    </div>
  );
};

const PaymentDetailModal: React.FC<{
  payment: Payment;
  appointment?: Appointment;
  onClose: () => void;
  onComplete: (payment: Payment) => Promise<void> | void;
}> = ({ payment, appointment, onClose, onComplete }) => {
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await onComplete(payment);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
          <h3 className="text-lg font-bold text-white">Chi tiet thanh toan</h3>
          <p className="text-indigo-100 text-sm mt-1">Ma don: {payment.orderId}</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <Info label="Benh nhan" value={payment.patientName} />
          <Info label="Loai phi" value={payment.type === 'ConsultationFee' ? 'Phi kham' : 'Tien thuoc'} />
          <Info label="So tien" value={`${payment.amount.toLocaleString('vi-VN')}d`} />
          <Info label="Phuong thuc" value={methodLabels[payment.method]?.label || payment.method} />
          <Info label="Trang thai" value={payment.status} />
          <Info label="Ma giao dich" value={payment.transactionId || '-'} />
          <Info label="Ngan hang" value={payment.bankCode || '-'} />
          <Info label="Ngay tao" value={new Date(payment.createdAt).toLocaleString('vi-VN')} />
          <Info label="Ngay thanh toan" value={payment.paidAt ? new Date(payment.paidAt).toLocaleString('vi-VN') : '-'} />
          <Info label="Lich kham" value={appointment ? `${appointment.serviceName || appointment.specialtyName} | BS. ${appointment.doctorName}` : payment.appointmentId} />
        </div>
        <div className="bg-slate-50 px-6 py-4 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-100">Dong</button>
          {payment.status === 'Pending' && (
            <button
              onClick={() => void handleComplete()}
              disabled={loading}
              className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Dang xu ly...' : 'Xac nhan thanh toan'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ChargeCollectionModal: React.FC<{
  appointment: Appointment;
  onClose: () => void;
  onCompleted: () => void;
}> = ({ appointment, onClose, onCompleted }) => {
  const [method, setMethod] = useState<'Cash' | 'VNPay'>('Cash');
  const [loading, setLoading] = useState(false);
  const chargeKind = resolveChargeKind(appointment);
  const amount = resolveChargeAmount(appointment, chargeKind);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (method === 'Cash') {
        const paymentResponse = await paymentService.create({
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          amount,
          type: chargeKind,
          method: 'Cash',
          notes: chargeKind === 'ConsultationFee' ? 'Thu phi kham tai quay' : 'Thu tien thuoc tai quay'
        });

        const payment = (paymentResponse as any)?.data ?? paymentResponse;
        await paymentService.complete(payment.id);
        toast.success('Thu tien thanh cong');
        onCompleted();
        return;
      }

      const result = chargeKind === 'ConsultationFee'
        ? await paymentService.createVNPayConsultationByAdmin(appointment.id, appointment.patientId)
        : await paymentService.createVNPayMedicinePayment(appointment.id, appointment.patientId);

      if (!result.success || !result.data?.paymentUrl) {
        throw new Error(result.message || 'Khong the tao giao dich VNPay.');
      }

      sessionStorage.setItem('pendingOrderId', result.data.orderId);
      if (chargeKind === 'ConsultationFee') {
        sessionStorage.setItem('pendingConfirmAppointmentId', appointment.id);
      } else {
        sessionStorage.setItem('pendingMedicineAppointmentId', appointment.id);
      }
      window.location.href = result.data.paymentUrl;
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Khong the thu tien');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
          <h3 className="text-lg font-bold text-white">Thu tien benh nhan</h3>
          <p className="text-indigo-100 text-sm mt-1">{appointment.patientName} | {appointment.serviceName || appointment.specialtyName}</p>
        </div>
        <div className="p-6 space-y-5">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Khoan thu</span>
              <span className="font-black text-slate-900">{chargeKind === 'ConsultationFee' ? 'Phi kham' : 'Tien thuoc'}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-slate-500 font-medium">So tien</span>
              <span className="text-2xl font-black text-indigo-600">{amount.toLocaleString('vi-VN')}d</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMethod('Cash')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 font-bold transition-all',
                method === 'Cash' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600'
              )}
            >
              <Banknote className="h-4 w-4" />
              Tien mat
            </button>
            <button
              onClick={() => setMethod('VNPay')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 font-bold transition-all',
                method === 'VNPay' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'
              )}
            >
              <CreditCard className="h-4 w-4" />
              VNPay
            </button>
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-100">Huy</button>
          <button
            onClick={() => void handleSubmit()}
            disabled={loading}
            className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Dang xu ly...' : 'Thu tien'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Info: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-400">{label}</p>
    <p className="font-semibold text-slate-800">{value}</p>
  </div>
);

export default AdminBilling;

