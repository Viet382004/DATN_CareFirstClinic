import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Activity,
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import { appointmentService } from '../../../services/appointmentService';
import type { Appointment } from '../../../types/appointment';
import { Link } from 'react-router-dom';
import PatientDetailsModal from '../components/PatientDetailsModal';

const DoctorDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    waiting: 0,
    inProgress: 0,
    completed: 0,
    total: 0
  });
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingPatientId, setViewingPatientId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const appointments = await appointmentService.getMyDoctorAppointments({ pageSize: 50 });
        
        const waiting = appointments.items.filter(a => a.status === 'Waiting').length;
        const inProgress = appointments.items.filter(a => a.status === 'InProgress').length;
        const completed = appointments.items.filter(a => a.status === 'Completed').length;
        
        setStats({ waiting, inProgress, completed, total: appointments.items.length });
        setRecentAppointments(appointments.items.slice(0, 5));
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">Bảng điều khiển bác sĩ</h1>
        <p className="text-sm text-slate-500 mt-1">Chào ngày mới! Bạn có <span className="text-indigo-600 font-semibold">{stats.waiting} bệnh nhân</span> đang chờ trong hàng đợi.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Clock className="text-amber-500" size={20} />} 
          label="Đang chờ khám" 
          value={stats.waiting} 
          color="amber"
        />
        <StatCard 
          icon={<Activity className="text-indigo-500" size={20} />} 
          label="Chưa hoàn tất" 
          value={stats.inProgress} 
          color="indigo"
        />
        <StatCard 
          icon={<CheckCircle2 className="text-emerald-500" size={20} />} 
          label="Đã hoàn thành" 
          value={stats.completed} 
          color="emerald"
        />
        <StatCard 
          icon={<Users className="text-slate-500" size={20} />} 
          label="Tổng lượt khám" 
          value={stats.total} 
          color="slate"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Appointments */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ClipboardList size={18} className="text-indigo-600" /> Hàng đợi khám gần nhất
            </h3>
            <Link to="/doctor/appointments" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
                Xem chi tiết <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bệnh nhân</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Thời gian</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentAppointments.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-400 text-sm">Hiện chưa có lịch khám nào cho hôm nay</td></tr>
                ) : (
                    recentAppointments.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => setViewingPatientId(app.patientId)}>
                            <div className="font-semibold text-sm text-slate-800 underline decoration-dotted underline-offset-4 decoration-slate-300 group-hover:text-indigo-600 transition-colors">{app.patientName}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{app.reason || 'Khám định kỳ'}</div>
                        </td>
                        <td className="p-4 text-xs font-medium text-slate-600">{app.startTime}</td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight ${getStatusStyle(app.status)}`}>
                                {app.status === 'Waiting' ? 'Đang chờ' : app.status === 'InProgress' ? 'Đang khám' : 'Đã xong'}
                            </span>
                        </td>
                        <td className="p-4 text-right">
                            <Link to="/doctor/appointments" className="text-indigo-600 hover:text-indigo-800 transition-colors">
                                <ArrowRight size={16} />
                            </Link>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick View Stats */}
        <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 text-sm mb-4">Hoàn thành ca khám</h3>
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-50">
                                Hiệu suất hôm nay
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-bold inline-block text-indigo-600">
                                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                            </span>
                        </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-slate-100">
                        <div style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-1000"></div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">Bạn đã hoàn thành {stats.completed} trên tổng số {stats.total} ca khám được phân bổ.</p>
                </div>
            </div>

            <div className="bg-slate-900 rounded-lg p-6 text-white shadow-xl">
                 <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="text-emerald-400" size={20} />
                    <h3 className="font-bold text-sm">Lịch trực tiếp theo</h3>
                 </div>
                 <div className="space-y-4">
                    <div className="border-l-2 border-emerald-500 pl-4 py-1">
                        <p className="text-xs font-bold text-slate-300">Chiều nay</p>
                        <p className="text-sm font-bold mt-1">Ca Chiều (13:30 - 17:30)</p>
                    </div>
                    <Link to="/doctor/schedule" className="block text-center py-2.5 rounded-md bg-white/10 hover:bg-white/20 text-xs font-bold transition-all mt-4">
                        XEM CHI TIẾT LỊCH TRỰC
                    </Link>
                 </div>
            </div>
        </div>
      </div>

      {viewingPatientId && (
        <PatientDetailsModal 
            patientId={viewingPatientId}
            onClose={() => setViewingPatientId(null)}
        />
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: any) => (
    <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm flex items-center gap-4">
      <div className={`p-2.5 bg-${color}-50 rounded-md shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
);

const getStatusStyle = (status: string) => {
    switch(status) {
        case 'Waiting': return 'bg-amber-50 text-amber-600 border border-amber-100';
        case 'InProgress': return 'bg-indigo-50 text-indigo-600 border border-indigo-100';
        case 'Completed': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
        default: return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
};

export default DoctorDashboard;
