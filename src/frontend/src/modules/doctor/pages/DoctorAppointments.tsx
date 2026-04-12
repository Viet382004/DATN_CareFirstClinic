import React, { useEffect, useState, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  Activity,
  Calendar,
  MoreVertical,
  Play
} from 'lucide-react';
import { appointmentService } from '../../../services/appointmentService';
import type { Appointment } from '../../../types/appointment';
import { toast } from 'sonner';
import ExaminationModal from '../components/ExaminationModal';
import PatientDetailsModal from '../components/PatientDetailsModal';

const DoctorAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Confirmed' | 'Waiting' | 'InProgress' | 'Completed'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [viewingPatientId, setViewingPatientId] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getMyDoctorAppointments({ 
        pageSize: 100,
        fromDate: filterDate ? `${filterDate}T00:00:00Z` : undefined,
        toDate: filterDate ? `${filterDate}T23:59:59Z` : undefined
      });

      // Xử lý an toàn nhiều trường hợp trả về từ API
      let appointmentList: Appointment[] = [];

      if (Array.isArray(response)) {
        appointmentList = response;
      } else if (response?.items && Array.isArray(response.items)) {
        appointmentList = response.items;
      } else if (response?.data && Array.isArray(response.data)) {
        appointmentList = response.data;
      } else if (response) {
        appointmentList = [response]; // trường hợp trả về 1 object
      }

      setAppointments(appointmentList);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách hàng đợi.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments, filterDate]);

  // Filter an toàn
  const filtered = React.useMemo(() => {
    return appointments.filter(a => {
      const matchesStatus = filterStatus === 'All' || a.status === filterStatus;
      const matchesSearch = a.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      return matchesStatus && matchesSearch;
    });
  }, [appointments, filterStatus, searchTerm]);

  const handleStartExam = async (appointmentId: string) => {
    try {
      await appointmentService.startExamination(appointmentId);
      toast.success("Đã bắt đầu ca khám!");
      fetchAppointments(); // reload lại danh sách
    } catch (error) {
      toast.error("Lỗi khi bắt đầu ca khám.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Hàng đợi bệnh nhân</h1>
          <p className="text-sm text-slate-500">Quản lý các ca khám và lịch làm việc của bạn.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-white border border-slate-200 rounded-md flex p-1 shadow-sm">
            <FilterButton active={filterStatus === 'All'} onClick={() => setFilterStatus('All')} label="Tất cả" count={appointments.length} />
            <FilterButton active={filterStatus === 'Confirmed'} onClick={() => setFilterStatus('Confirmed')} label="Lịch hẹn" count={appointments.filter(a => a.status === 'Confirmed').length} color="blue" />
            <FilterButton active={filterStatus === 'Waiting'} onClick={() => setFilterStatus('Waiting')} label="Đang chờ" count={appointments.filter(a => a.status === 'Waiting').length} color="amber" />
            <FilterButton active={filterStatus === 'InProgress'} onClick={() => setFilterStatus('InProgress')} label="Đang khám" count={appointments.filter(a => a.status === 'InProgress').length} color="indigo" />
            <FilterButton active={filterStatus === 'Completed'} onClick={() => setFilterStatus('Completed')} label="Đã hoàn thành" count={appointments.filter(a => a.status === 'Completed').length} color="emerald" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Tìm tên bệnh nhân..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-md text-sm focus:ring-1 focus:ring-indigo-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="date" 
            className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-md text-sm focus:ring-1 focus:ring-indigo-500 font-bold text-slate-600"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
          />
        </div>
        <button 
          onClick={fetchAppointments} 
          className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-md transition-colors"
        >
          LÀM MỚI
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 font-bold animate-pulse">ĐANG TẢI DANH SÁCH...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-20 text-center rounded-lg border border-dashed border-slate-300">
          <User size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold">Không tìm thấy bệnh nhân nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(app => (
            <div key={app.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:border-indigo-300 transition-all flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${getStatusBadge(app.status)}`}>
                  {getStatusLabel(app.status)}
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setViewingPatientId(app.patientId)}
                    title="Xem hồ sơ bệnh nhân"
                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                  >
                    <User size={16} />
                  </button>
                  <button className="text-slate-300 hover:text-slate-600 transition-colors p-1"><MoreVertical size={16} /></button>
                </div>
              </div>

              <div className="flex-1">
                <h4 className="font-bold text-slate-800 text-sm mb-1">{app.patientName}</h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium mb-4 italic">
                  <Clock size={12} /> {app.startTime} - {app.endTime} ({app.specialtyName})
                </div>
                
                <div className="bg-slate-50 p-3 rounded-md mb-4">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Lý do khám</p>
                  <p className="text-xs font-medium text-slate-600 line-clamp-2">{app.reason || 'Khám bệnh định kỳ'}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex gap-2">
                {app.status === 'Waiting' && (
                  <button 
                    onClick={() => handleStartExam(app.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-bold text-xs transition-colors"
                  >
                    <Play size={14} fill="currentColor" /> BẮT ĐẦU KHÁM
                  </button>
                )}
                {app.status === 'Confirmed' && (
                  <div className="flex-1 text-center py-2 bg-slate-50 border border-dashed border-slate-200 rounded-md text-[10px] font-bold text-slate-400">
                    CHỜ BỆNH NHÂN CHECK-IN
                  </div>
                )}
                {app.status === 'InProgress' && (
                  <button 
                    onClick={() => setSelectedAppointment(app)}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-md font-bold text-xs transition-colors"
                  >
                    <Activity size={14} /> TIẾP TỤC KHÁM
                  </button>
                )}
                {app.status === 'Completed' && (
                  <button 
                    onClick={() => setSelectedAppointment(app)}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-md font-bold text-xs transition-colors"
                  >
                    <ArrowRight size={14} /> XEM LẠI BỆNH ÁN
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAppointment && (
        <ExaminationModal 
          appointment={selectedAppointment} 
          onClose={() => setSelectedAppointment(null)}
          onComplete={() => {
            setSelectedAppointment(null);
            fetchAppointments();
          }}
        />
      )}

      {viewingPatientId && (
        <PatientDetailsModal 
          patientId={viewingPatientId}
          onClose={() => setViewingPatientId(null)}
        />
      )}
    </div>
  );
};

const FilterButton = ({ active, onClick, label, count, color = "indigo" }: any) => (
  <button 
    onClick={onClick}
    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${
      active 
        ? `bg-white text-${color}-600 shadow-sm border border-slate-100` 
        : 'text-slate-400 hover:text-slate-600 bg-transparent'
    }`}
  >
    {label}
    <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${active ? `bg-${color}-50` : 'bg-slate-50'}`}>
      {count}
    </span>
  </button>
);

const getStatusBadge = (status: string) => {
  switch(status) {
    case 'Confirmed': return 'bg-blue-100 text-blue-700';
    case 'Waiting': return 'bg-amber-100 text-amber-700';
    case 'InProgress': return 'bg-indigo-100 text-indigo-700';
    case 'Completed': return 'bg-emerald-100 text-emerald-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const getStatusLabel = (status: string) => {
  switch(status) {
    case 'Confirmed': return 'Đã xác nhận';
    case 'Waiting': return 'Sẵn sàng';
    case 'InProgress': return 'Đang khám';
    case 'Completed': return 'Hoàn thành';
    default: return status;
  }
};

export default DoctorAppointments;