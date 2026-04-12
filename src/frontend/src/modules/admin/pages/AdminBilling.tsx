import React, { useEffect, useState, useCallback } from 'react';
import { paymentService } from '../../../services/paymentService';
import type { Payment, PaymentQueryParams } from '../../../types/payment';
import { 
  Search, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Filter,
  Receipt,
  Download,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const AdminBilling: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [query, setQuery] = useState<PaymentQueryParams>({
    page: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortDir: 'desc'
  });

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentService.getList(query);
      setPayments(res.items);
      setTotalItems(res.totalCount);
    } catch (error) {
      toast.error('Không thể lấy danh sách thanh toán');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleCompletePayment = async (id: string) => {
    const transactionId = window.prompt('Nhập mã giao dịch (nếu có):');
    if (transactionId === null) return;

    try {
      await paymentService.complete(id, transactionId || undefined);
      toast.success('Xác nhận thanh toán thành công');
      fetchPayments();
    } catch (error) {
      toast.error('Lỗi khi xác nhận thanh toán');
    }
  };

  const statusStyles: Record<string, string> = {
    Pending: 'bg-amber-100 text-amber-700 border-amber-200',
    Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Refunded: 'bg-rose-100 text-rose-700 border-rose-200',
    Failed: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  const methodLabels: Record<string, string> = {
    Cash: 'Tiền mặt',
    BankTransfer: 'Chuyển khoản',
    Momo: 'Momo',
    VNPay: 'VNPay',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý hóa đơn</h1>
          <p className="mt-1 text-slate-500">Theo dõi trạng thái thanh toán và quản lý các giao dịch tài chính.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95">
            <Download className="h-4 w-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {[
          { label: 'Tổng thu hôm nay', value: '12.4M', icon: Receipt, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Đang chờ xử lý', value: '3.2M', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Hóa đơn hoàn thành', value: '45', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Khiếu nại/Hoàn tiền', value: '2', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                <p className="text-xl font-black text-slate-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payments Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Mã hóa đơn, mã bệnh nhân..." 
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
              onChange={(e) => setQuery({ ...query, patientId: e.target.value, page: 1 })}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex h-10 items-center gap-2 rounded-xl bg-slate-50 px-4 text-xs font-bold text-slate-600 hover:bg-slate-100">
              <Filter className="h-4 w-4" />
              Lọc nâng cao
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Mã hóa đơn</th>
                <th className="px-6 py-4">Bệnh nhân / Lịch hẹn</th>
                <th className="px-6 py-4">Số tiền</th>
                <th className="px-6 py-4">Hình thức</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="px-6 py-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                      <p className="font-semibold text-slate-400">Đang tải dữ liệu hóa đơn...</p>
                    </div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <p className="font-semibold text-slate-400">Không có bản ghi thanh toán nào.</p>
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-slate-50/50 group">
                    <td className="px-6 py-4">
                      <span className="font-black text-slate-900">#{p.id.substring(0, 8)}</span>
                      <p className="text-[10px] font-medium text-slate-400">{new Date(p.createdAt).toLocaleString('vi-VN')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-700">BN-{p.patientId.substring(0, 6)}</p>
                          <p className="text-[10px] font-medium text-slate-400">Lịch: {p.appointmentId.substring(0, 6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-900">{p.amount.toLocaleString('vi-VN')} đ</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-3 w-3 text-slate-400" />
                        <span className="font-semibold text-slate-600">{methodLabels[p.method] || p.method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest border ${statusStyles[p.status]}`}>
                        {p.status === 'Completed' ? 'Đã thu' : p.status === 'Pending' ? 'Chưa thu' : p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {p.status === 'Pending' && (
                          <button 
                            onClick={() => handleCompletePayment(p.id)}
                            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-tight text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95"
                          >
                            Xác nhận thu
                          </button>
                        )}
                        <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Trang {query.page} / {Math.ceil(totalItems / (query.pageSize || 10))}
          </p>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setQuery({ ...query, page: (query.page || 1) - 1 })}
              disabled={query.page === 1}
              className="group flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-400 hover:border-indigo-600 hover:text-indigo-600 transition-all disabled:opacity-30 disabled:hover:border-slate-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setQuery({ ...query, page: (query.page || 1) + 1 })}
              disabled={payments.length < (query.pageSize || 10)}
              className="group flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-400 hover:border-indigo-600 hover:text-indigo-600 transition-all disabled:opacity-30 disabled:hover:border-slate-200"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// SVG User fallback
function User(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default AdminBilling;
