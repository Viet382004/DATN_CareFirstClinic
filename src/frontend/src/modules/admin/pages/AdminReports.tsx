import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import {
  Calendar,
  TrendingUp,
  ArrowUpRight,
  Download,
  Filter,
  DollarSign,
  Users,
  CalendarCheck,
  Activity,
  ChevronDown,
  RefreshCcw,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';
import { dashboardService } from '../../../services/dashboardService';
import type { RevenueReport } from '../../../services/dashboardService';

const AdminReports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<RevenueReport | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const COLORS = ['#4f46e5', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  const translateType = (type: string) => {
    switch (type) {
      case 'ConsultationFee': return 'Phí khám bệnh';
      case 'MedicineFee': return 'Tiền thuốc';
      case 'FullPayment': return 'Thanh toán trọn gói';
      default: return type;
    }
  };

  const translateMethod = (method: string) => {
    switch (method) {
      case 'Cash': return 'Tiền mặt';
      case 'CreditCard': return 'Thẻ tín dụng';
      case 'VNPay': return 'Ví VNPay';
      case 'BankTransfer': return 'Chuyển khoản';
      default: return method;
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getRevenueReport(dateRange.start, dateRange.end);
      setReport(data);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải báo cáo doanh thu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatCompactNumber = (number: number) => {
    if (number >= 1000000000) return (number / 1000000000).toFixed(1) + 'B';
    if (number >= 1000000) return (number / 1000000).toFixed(1) + 'M';
    if (number >= 1000) return (number / 1000).toFixed(1) + 'K';
    return number.toString();
  };

  if (loading && !report) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="font-bold text-sm tracking-[0.2em] uppercase">Đang tổng hợp báo cáo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Trung tâm Phân tích</h1>
          <p className="mt-1 text-sm font-bold text-slate-400 uppercase tracking-widest">Báo cáo doanh thu & Hiệu suất hệ thống</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="text-xs font-bold text-slate-700 border-none focus:ring-0 p-0"
            />
            <ArrowRight size={14} className="text-slate-300" />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="text-xs font-bold text-slate-700 border-none focus:ring-0 p-0"
            />
          </div>

          <button
            onClick={fetchReport}
            disabled={loading}
            className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCcw size={18} className={cn(loading && "animate-spin")} />
          </button>

          <button className="flex items-center gap-2 bg-indigo-600 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase text-white shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all">
            <Download className="h-4 w-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {report && (
        <>
          {/* KPI Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Tổng doanh thu', value: formatCompactNumber(report.totalRevenue), growth: `${report.growthRate > 0 ? '+' : ''}${report.growthRate}%`, icon: DollarSign, color: 'indigo' },
              { label: 'Lịch hẹn thành công', value: report.successfulAppointments.toString(), growth: `${Math.round((report.successfulAppointments / (report.totalAppointments || 1)) * 100)}%`, icon: CalendarCheck, color: 'emerald' },
              { label: 'Tổng lịch hẹn', value: report.totalAppointments.toString(), growth: 'Trong kỳ', icon: Users, color: 'blue' },
            ].map((kpi, i) => (
              <div key={i} className="group relative rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-indigo-50 hover:-translate-y-1 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg",
                    kpi.color === 'indigo' ? 'bg-indigo-600 shadow-indigo-100' :
                      kpi.color === 'emerald' ? 'bg-emerald-500 shadow-emerald-100' :
                        'bg-blue-600 shadow-blue-100')}>
                    <kpi.icon size={26} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Xu hướng</p>
                    <p className={cn("text-sm font-black uppercase tracking-tighter",
                      kpi.growth.startsWith('+') ? 'text-emerald-500' :
                        kpi.growth.startsWith('-') ? 'text-red-500' : 'text-slate-500')}>
                      {kpi.growth}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-slate-900 tracking-tight">{kpi.value}</p>
                    {kpi.color === 'indigo' && <span className="text-xs font-bold text-slate-300">VNĐ</span>}
                  </div>
                </div>
                {/* Decor */}
                <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-slate-50 opacity-50 group-hover:scale-150 transition-transform duration-1000"></div>
              </div>
            ))}
          </div>

          {/* Main Analysis Group */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Area Chart */}
            <div className="rounded-[3rem] border border-slate-200 bg-white p-8 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Biến động doanh thu</h3>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Từ {dateRange.start} đến {dateRange.end}</p>
                </div>
                <TrendingUp className="text-indigo-600" size={24} />
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={report.revenueByDay}>
                    <defs>
                      <linearGradient id="chartRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                      tickFormatter={(v) => v.split('-').slice(1).join('/')}
                      dy={12}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                      tickFormatter={(v) => formatCompactNumber(v)}
                    />
                    <Tooltip
                      cursor={{ stroke: '#4f46e5', strokeWidth: 1 }}
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                      formatter={(value: any) => [formatCurrency(value), "Doanh thu"]}
                    />
                    <Area type="monotone" dataKey="amount" name="Doanh thu" stroke="#4f46e5" strokeWidth={4} fill="url(#chartRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue By Type Bar Chart */}
            <div className="rounded-[3rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Cơ cấu doanh thu</h3>
                <Filter className="text-slate-400" size={20} />
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.revenueByType}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="type"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                      tickFormatter={translateType}
                      dy={12}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                      tickFormatter={(v) => formatCompactNumber(v)}
                    />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} formatter={(v: any, name: any, props: any) => [formatCurrency(v), translateType(props.payload.type)]} />
                    <Bar dataKey="amount" name="Doanh thu" radius={[10, 10, 0, 0]} barSize={40}>
                      {report.revenueByType.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Distribution & Tables Layer */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Payment Methods Pie Chart */}
            <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8 text-center">Phương thức thanh toán</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={report.revenueByMethod}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={8}
                      dataKey="amount"
                      nameKey="method"
                      stroke="none"
                    >
                      {report.revenueByMethod.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any, name: any, props: any) => [formatCurrency(v), translateMethod(props.payload.method)]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                {report.revenueByMethod.map((m, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{translateMethod(m.method)}: {m.percentage.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth Summary Table */}
            <div className="lg:col-span-2 rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm overflow-hidden relative">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Chi tiết doanh thu theo ngày</h3>
                <button className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 px-3 py-1 rounded-lg">Xem chi tiết</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Số lượng GD</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doanh thu</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {report.revenueByDay.slice(-5).reverse().map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-5 font-black text-slate-800 text-sm whitespace-nowrap">{row.date}</td>
                        <td className="py-5 font-black text-slate-600 text-sm">{row.count}</td>
                        <td className="py-5 font-black text-indigo-600 text-sm">{formatCurrency(row.amount)}</td>
                        <td className="py-5">
                          <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase border bg-emerald-50 text-emerald-600 border-emerald-100">
                            Hoàn thành
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Background decor */}
              <Activity className="absolute -right-12 -bottom-12 h-48 w-48 text-slate-50/50 pointer-events-none" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReports;
