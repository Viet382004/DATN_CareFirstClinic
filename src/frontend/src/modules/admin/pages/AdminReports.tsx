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
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';

const AdminReports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  
  // Simulated data
  const monthlyRevenue = [
    { month: 'Tháng 1', revenue: 45000000, bookings: 120 },
    { month: 'Tháng 2', revenue: 52000000, bookings: 145 },
    { month: 'Tháng 3', revenue: 48000000, bookings: 130 },
    { month: 'Tháng 4', revenue: 61000000, bookings: 170 },
    { month: 'Tháng 5', revenue: 55000000, bookings: 155 },
    { month: 'Tháng 6', revenue: 67000000, bookings: 190 },
  ];

  const methodDistribution = [
    { name: 'Tiền mặt', value: 450 },
    { name: 'Chuyển khoản', value: 380 },
    { name: 'Ví điện tử', value: 170 },
  ];

  const COLORS = ['#4f46e5', '#8b5cf6', '#10b981', '#f59e0b'];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
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
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-sm">
            <Calendar className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-black text-slate-700">Năm 2026</span>
            <ChevronDown size={14} className="text-slate-400" />
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase text-white shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all">
            <Download className="h-4 w-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Tổng doanh thu', value: '328.5M', growth: '+18.4%', icon: DollarSign, color: 'indigo' },
          { label: 'Lịch hẹn thành công', value: '912', growth: '+12.1%', icon: CalendarCheck, color: 'emerald' },
          { label: 'Bệnh nhân mới', value: '+284', growth: '45/tháng', icon: Users, color: 'blue' },
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
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Tăng trưởng</p>
                   <p className="text-sm font-black text-emerald-500 uppercase tracking-tighter">{kpi.growth}</p>
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
                 <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Xu hướng doanh thu</h3>
                 <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Dữ liệu 6 tháng gần nhất</p>
              </div>
              <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-600 w-3/4"></div>
              </div>
           </div>
           <div className="h-80 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="chartRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                    dy={12}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                    tickFormatter={(v) => `${(v/1000000)}M`}
                  />
                  <Tooltip 
                    cursor={{stroke: '#4f46e5', strokeWidth: 1}}
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px'}}
                  />
                  <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="#4f46e5" strokeWidth={4} fill="url(#chartRev)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Appointment Density Bar Chart */}
        <div className="rounded-[3rem] border border-slate-200 bg-white p-8 shadow-sm">
           <div className="flex items-center justify-between mb-10">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Mật độ lịch hẹn</h3>
           </div>
           <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                      dy={12}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                    />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="bookings" name="Số ca khám" radius={[10, 10, 0, 0]} barSize={40}>
                       {monthlyRevenue.map((_, i) => (
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
         {/* Payment Methods */}
         <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8 text-center">Cơ cấu thanh toán</h3>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                       data={methodDistribution}
                       cx="50%"
                       cy="50%"
                       innerRadius={65}
                       outerRadius={85}
                       paddingAngle={8}
                       dataKey="value"
                       stroke="none"
                     >
                       {methodDistribution.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                       ))}
                     </Pie>
                     <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
               {methodDistribution.map((m, i) => (
                  <div key={i} className="flex items-center gap-2">
                     <span className="h-1.5 w-1.5 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></span>
                     <span className="text-[10px] font-bold text-slate-500 uppercase">{m.name}</span>
                  </div>
               ))}
            </div>
         </div>

         {/* Growth Summary Table */}
         <div className="lg:col-span-2 rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm overflow-hidden relative">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Hiệu suất theo quý</h3>
               <button className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 px-3 py-1 rounded-lg">Xem chi tiết</button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-slate-100">
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời điểm</th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doanh thu</th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tăng trưởng</th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {[
                       { period: 'Quý 1, 2026', revenue: '145.200.000 đ', growth: '+15.4%', status: 'Ổn định', color: 'emerald' },
                       { period: 'Quý 2, 2026', revenue: '183.300.000 đ', growth: '+26.1%', status: 'Cao', color: 'indigo' },
                       { period: 'Tháng 7, 2026', revenue: '67.000.000 đ', growth: '+5.2%', status: 'Đang chạy', color: 'amber' },
                     ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                           <td className="py-5 font-black text-slate-800 text-sm whitespace-nowrap">{row.period}</td>
                           <td className="py-5 font-black text-slate-600 text-sm">{row.revenue}</td>
                           <td className="py-5 font-black text-emerald-500 text-sm">{row.growth}</td>
                           <td className="py-5">
                              <span className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase border", 
                                row.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                row.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                'bg-amber-50 text-amber-600 border-amber-100')}>
                                 {row.status}
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
    </div>
  );
};

export default AdminReports;
