import React, { useEffect, useState, useCallback } from 'react';
import { appointmentService } from '../../../services/appointmentService';
import { paymentService } from '../../../services/paymentService';
import type { Appointment, AppointmentQueryParams } from '../../../types/appointment';
import type { Payment } from '../../../types/payment';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Calendar,
  FileText,
  User,
  Activity,
  UserPlus,
  CreditCard,
  Wallet,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';
import { formatDate } from '../../../utils/format';

// ⭐ Modal thanh toán
interface PaymentModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, appointment, onClose, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'VNPay'>('Cash');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !appointment) return null;

  const handleCashPayment = async () => {
    setLoading(true);
    try {
      const created = await paymentService.create({
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        amount: appointment.consultationFee > 0 ? appointment.consultationFee : 200000,
        type: 'ConsultationFee',
        method: 'Cash',
        notes: `Thanh toán phí khám tại quầy cho lịch hẹn ${appointment.id}`
      });

      const payment = (created as any)?.data ?? created;
      if (!payment?.id) {
        throw new Error('Không lấy được thông tin thanh toán vừa tạo.');
      }

      await paymentService.complete(payment.id);

      toast.success('Thanh toán thành công, lịch hẹn đã được xác nhận.');
      onPaymentSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Có lỗi xảy ra khi thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handleVNPayPayment = async () => {
    setLoading(true);
    try {
      const result = await paymentService.createVNPayConsultationByAdmin(appointment.id, appointment.patientId);

      if (result.success && result.data?.paymentUrl) {
        sessionStorage.setItem('pendingConfirmAppointmentId', appointment.id);
        sessionStorage.setItem('pendingOrderId', result.data.orderId);
        window.location.href = result.data.paymentUrl;
      } else {
        toast.error(result.message || 'Không thể tạo link thanh toán VNPay');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Có lỗi xảy ra khi tạo thanh toán VNPay');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (paymentMethod === 'Cash') {
      await handleCashPayment();
    } else {
      await handleVNPayPayment();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
          <h3 className="text-lg font-bold text-white">Thanh toán lịch hẹn</h3>
          <p className="text-indigo-100 text-sm mt-1">
            Lịch hẹn với BS. {appointment.doctorName} - {formatDate(appointment.workDate)} {appointment.startTime}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Thông tin thanh toán */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">Tổng tiền:</span>
              <span className="text-2xl font-bold text-indigo-600">
                {(appointment.consultationFee > 0 ? appointment.consultationFee : 200000).toLocaleString()}đ
              </span>
            </div>
            <div className="flex justify-between items-center mt-2 text-sm text-slate-500">
              <span>Dịch vụ:</span>
              <span>{appointment.serviceName || 'Khám bệnh'}</span>
            </div>
          </div>

          {/* Chọn phương thức thanh toán */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Phương thức thanh toán</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('Cash')}
                className={cn(
                  "flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all",
                  paymentMethod === 'Cash'
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                )}
              >
                <Wallet size={20} />
                <span className="font-bold">Tiền mặt</span>
              </button>
              <button
                onClick={() => setPaymentMethod('VNPay')}
                className={cn(
                  "flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all",
                  paymentMethod === 'VNPay'
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                )}
              >
                <CreditCard size={20} />
                <span className="font-bold">VNPay</span>
              </button>
            </div>
          </div>

          {/* Thông báo */}
          {paymentMethod === 'VNPay' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                🔄 Bạn sẽ được chuyển đến cổng thanh toán VNPay. Sau khi thanh toán thành công,
                lịch hẹn sẽ được xác nhận.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-all"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Đang xử lý...
              </>
            ) : (
              `Thanh toán ${paymentMethod === 'Cash' ? 'tiền mặt' : 'qua VNPay'}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // ⭐ State cho modal thanh toán
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const [query, setQuery] = useState<AppointmentQueryParams>({
    page: 1,
    pageSize: 12,
    sortBy: 'workDate',
    sortDir: 'desc',
    status: 'All'
  });

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getList({
        ...query,
        status: query.status === 'All' ? undefined : query.status,
        search: searchQuery || undefined,
        fromDate: filterDate ? `${filterDate}T00:00:00Z` : undefined,
        toDate: filterDate ? `${filterDate}T23:59:59Z` : undefined
      });

      setAppointments(res.items || []);
      setTotalItems(res.totalCount || 0);
    } catch (error) {
      toast.error('Không thể lấy danh sách lịch hẹn');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [query, filterDate, searchQuery]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    const finalizeVNPayConfirm = async () => {
      const pendingOrderId = sessionStorage.getItem('pendingOrderId');
      const pendingAppointmentId = sessionStorage.getItem('pendingConfirmAppointmentId');
      const params = new URLSearchParams(window.location.search);
      const successOrderId = params.get('orderId');

      if (!pendingOrderId || !pendingAppointmentId || !successOrderId || pendingOrderId !== successOrderId) {
        return;
      }

      try {
        const status = await paymentService.getPaymentStatus(pendingOrderId);
        if (status.status === 'Completed') {
          toast.success('Thanh toán VNPay thành công, lịch hẹn đã được xác nhận.');
          sessionStorage.removeItem('pendingOrderId');
          sessionStorage.removeItem('pendingConfirmAppointmentId');
          fetchAppointments();
        }
      } catch (error: any) {
        toast.error(error?.data?.message || error?.message || 'Không thể đồng bộ kết quả thanh toán VNPay');
      }
    };

    void finalizeVNPayConfirm();
  }, [fetchAppointments]);

  // ⭐ Xử lý khi nhấn Confirm - Mở modal thanh toán
  const handleConfirm = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowPaymentModal(true);
  };

  // ⭐ Sau khi thanh toán thành công
  const handlePaymentSuccess = () => {
    fetchAppointments();
  };

  // ⭐ Xử lý Check-in (chuyển sang Waiting) - Chỉ dùng cho các trường hợp đặc biệt
  const handleCheckIn = async (id: string) => {
    try {
      await appointmentService.toWaiting(id);
      toast.success('Check-in thành công. Bệnh nhân đã vào hàng chờ.');
      fetchAppointments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi check-in');
    }
  };

  const handleCancelByAdmin = async (id: string) => {
    const reason = window.prompt('Nhập lý do hủy:');
    if (reason === null) return;
    if (!reason.trim()) {
      toast.error('Lý do hủy không được để trống');
      return;
    }

    try {
      await appointmentService.cancel(id, { cancelReason: reason });
      toast.success('Hủy lịch hẹn thành công');
      fetchAppointments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi hủy');
    }
  };

  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    Pending: { label: 'Chờ xác nhận', color: 'text-amber-700', bg: 'bg-amber-100' },
    Confirmed: { label: 'Đã xác nhận', color: 'text-blue-700', bg: 'bg-blue-100' },
    Waiting: { label: 'Sẵn sàng', color: 'text-indigo-700', bg: 'bg-indigo-100' },
    InProgress: { label: 'Đang khám', color: 'text-teal-700', bg: 'bg-teal-100' },
    Completed: { label: 'Hoàn thành', color: 'text-emerald-700', bg: 'bg-emerald-100' },
    Cancelled: { label: 'Đã hủy', color: 'text-slate-500', bg: 'bg-slate-100' },
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Điều phối lịch hẹn</h1>
          <p className="mt-1 text-sm font-bold text-slate-400">Kiểm soát và điều phối luồng bệnh nhân tại bệnh viện.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
            {['All', 'Pending', 'Confirmed', 'Waiting'].map(s => (
              <button
                key={s}
                onClick={() => setQuery(prev => ({ ...prev, status: s, page: 1 }))}
                className={cn(
                  "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                  query.status === s ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {s === 'All' ? 'Tất cả' : statusMap[s]?.label || s}
              </button>
            ))}
          </div>
          <button
            className="flex items-center gap-2 bg-slate-900 border border-slate-900 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            onClick={() => {/* Navigate to create */ }}
          >
            <UserPlus size={16} />
            Đặt lịch mới
          </button>
        </div>
      </div>

      {/* Toolbar Layer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Tìm theo BN, bác sĩ hoặc chuyên khoa..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="date"
            className="w-full pl-12 pr-8 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-700 focus:ring-2 focus:ring-indigo-600 cursor-pointer shadow-sm"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        <button
          onClick={() => { setFilterDate(new Date().toISOString().split('T')[0]); setSearchQuery(''); setQuery(prev => ({ ...prev, status: 'All', page: 1 })); }}
          className="flex items-center justify-center gap-2 p-3 bg-white border border-slate-200 text-slate-400 font-bold text-xs uppercase hover:text-rose-600 hover:border-rose-100 rounded-2xl transition-all shadow-sm"
        >
          <XCircle size={18} />
          Xóa lọc
        </button>
      </div>

      {/* Main List Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Đang tải dữ liệu...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg py-20 text-center flex flex-col items-center">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Không có lịch hẹn nào</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Thời gian</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Bệnh nhân</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Dịch vụ / Bác sĩ</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Lý do khám</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Trạng thái</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{a.startTime}</span>
                      <span className="text-[10px] font-medium text-slate-400">{formatDate(a.workDate)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-xs">
                        {a.patientName.substring(0, 1)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{a.patientName}</span>
                        <span className="text-[10px] text-slate-400 font-medium">ID: {a.id.substring(0, 8).toUpperCase()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-tight">{a.specialtyName}</span>
                      <span className="text-xs font-medium text-slate-600 mt-1">BS. {a.doctorName}</span>
                      {a.consultationFee > 0 && (
                        <span className="text-[10px] font-bold text-emerald-600 mt-1">
                          {a.consultationFee.toLocaleString()}đ
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-600 max-w-[200px] truncate" title={a.reason}>
                      {a.reason || 'Khám bệnh định kỳ'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      "inline-flex px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border",
                      statusMap[a.status]?.bg,
                      statusMap[a.status]?.color,
                      "border-transparent"
                    )}>
                      {statusMap[a.status]?.label || a.status}
                    </span>
                    {a.isConsultationPaid && (
                      <span className="block text-[9px] text-emerald-600 mt-1">Đã thanh toán</span>
                    )}
                    {!a.isConsultationPaid && a.status !== 'Pending' && (
                      <span className="block text-[9px] text-amber-600 mt-1">Chưa thanh toán</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* ⭐ Confirm - Mở modal thanh toán */}
                      {a.status === 'Pending' && (
                        <button
                          onClick={() => handleConfirm(a)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md transition-all"
                          title="Xác nhận và thanh toán"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      )}
                      {/* ⭐ Chỉ hiển thị Check-in nếu đã thanh toán */}
                      {a.status === 'Confirmed' && a.isConsultationPaid && (
                        <button
                          onClick={() => handleCheckIn(a.id)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-md transition-all"
                          title="Báo BN đã đến"
                        >
                          <UserCheck size={18} />
                        </button>
                      )}
                      {['Pending', 'Confirmed'].includes(a.status) && (
                        <button
                          onClick={() => handleCancelByAdmin(a.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-md transition-all"
                          title="Hủy lịch"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                      <button className="p-2 text-slate-400 hover:text-slate-600 rounded-md">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer / Pagination Layer */}
      {!loading && appointments.length > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white px-6 py-4 rounded-lg border border-slate-200">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Hiển thị {appointments.length} của {totalItems} hồ sơ
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={query.page === 1}
              onClick={() => setQuery(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
              className="h-8 px-3 rounded-md border border-slate-200 text-[10px] font-bold uppercase text-slate-500 hover:bg-slate-50 disabled:opacity-30"
            >
              Trước
            </button>

            <div className="flex items-center gap-1">
              {[...Array(Math.ceil(totalItems / (query.pageSize || 12)))].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(prev => ({ ...prev, page: i + 1 }))}
                  className={cn(
                    "h-8 w-8 rounded-md text-[10px] font-bold transition-all border",
                    query.page === i + 1 ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-200 text-slate-400 hover:bg-slate-50"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              disabled={appointments.length < (query.pageSize || 12)}
              onClick={() => setQuery(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
              className="h-8 px-3 rounded-md border border-slate-200 text-[10px] font-bold uppercase text-slate-500 hover:bg-slate-50 disabled:opacity-30"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* ⭐ Modal thanh toán */}
      <PaymentModal
        isOpen={showPaymentModal}
        appointment={selectedAppointment}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedAppointment(null);
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default AdminAppointments;