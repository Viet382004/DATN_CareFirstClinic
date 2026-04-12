import React from 'react';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Activity
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { dashboardService } from '../../../services/dashboardService';
import type { DashboardStats, ChartData } from '../../../services/dashboardService';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard: React.FC = () => {
  const [statsData, setStatsData] = React.useState<DashboardStats | null>(null);
  const [chartData, setChartData] = React.useState<ChartData[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [s, c] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getCharts()
        ]);
        setStatsData(s);
        setChartData(c);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu dashboard:', error);
        toast.error('Không thể kết nối với máy chủ thống kê');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
          <p className="font-bold text-[10px] tracking-widest uppercase italic">Đang đồng bộ dữ liệu hệ thống...</p>
        </div>
      </div>
    );
  }

  if (!statsData) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center text-center px-4">
        <Activity className="h-12 w-12 text-slate-200 mb-4" />
        <h3 className="text-xl font-black text-slate-900">Không có dữ liệu</h3>
        <p className="mt-2 text-sm font-bold text-slate-500">Vui lòng thử lại sau.</p>
      </div>
    );
  }

  const stats = [
    { label: 'Tổng Bệnh Nhân', value: statsData.totalPatients.toLocaleString(), trend: '+12%', icon: Users },
    { label: 'Lịch Hẹn Hôm Nay', value: statsData.todayAppointments.toString(), trend: '+5%', icon: Calendar },
    { label: 'Doanh Thu Tháng', value: `${(statsData.monthlyRevenue / 1000000).toFixed(1)}M`, trend: '-2%', icon: CreditCard },
    { label: 'Tỉ Lệ Hoàn Thành', value: `${statsData.completionRate}%`, trend: '+1%', icon: Activity },
  ];

  const pieData = [
    { name: 'Hoàn tất', value: 45 },
    { name: 'Đang chuẩn bị', value: 25 },
    { name: 'Đã hủy', value: 10 },
  ];

  // Mock appointments for UI
  const recentAppointments = [
    { time: '08:30', patient: 'Nguyễn Văn A', doctor: 'Trần B', status: 'Completed' },
    { time: '09:15', patient: 'Lê Thị C', doctor: 'Phạm D', status: 'Waiting' },
    { time: '10:00', patient: 'Trần Văn E', doctor: 'Nguyễn F', status: 'Waiting' },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Tổng quan hệ thống</h1>
          <p className="mt-1 text-xs font-bold text-slate-400 uppercase tracking-widest">Dữ liệu thời gian thực của phòng khám</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1 rounded-md border border-slate-200">
           <button className="px-4 py-1.5 text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 rounded-md">Hôm nay</button>
           <button className="px-4 py-1.5 text-[10px] font-bold uppercase text-slate-400 hover:text-slate-600 transition-colors">Tuần này</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:border-indigo-200">
            <div className="h-10 w-10 flex items-center justify-center rounded-md border text-indigo-600 bg-indigo-50 border-indigo-100">
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-slate-900 tabular-nums">{stat.value}</span>
                <span className="text-[10px] font-bold text-emerald-500">{stat.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                 <div className="h-6 w-1 bg-indigo-600 rounded-full"></div>
                 <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Xu hướng doanh thu</h2>
              </div>
           </div>
           
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#4f46e5" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#revenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
           <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-8">Trạng thái khám</h2>
           <div className="h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={pieData}
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={8}
                   dataKey="value"
                 >
                   {pieData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
         <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Hàng chờ khám gần đây</h2>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                     <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Thời gian</th>
                     <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Bệnh nhân</th>
                     <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Trạng thái</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {recentAppointments.map((a, idx) => (
                     <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 text-xs font-bold text-slate-700">{a.time}</td>
                        <td className="px-6 py-3">
                           <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-900">{a.patient}</span>
                              <span className="text-[10px] text-slate-400">BS. {a.doctor}</span>
                           </div>
                        </td>
                        <td className="px-6 py-3 text-right">
                           <span className={cn(
                             "inline-block px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-widest",
                             a.status === 'Completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                           )}>
                              {a.status === 'Completed' ? 'HOÀN TẤT' : 'CHỜ KHÁM'}
                           </span>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
