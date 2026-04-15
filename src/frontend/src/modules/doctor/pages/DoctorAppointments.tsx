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
import { formatDate } from '../../../utils/format';
import { cn } from '../../../lib/utils';

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

      let appointmentList: Appointment[] = [];
      if (Array.isArray(response)) appointmentList = response;
      else if (response?.items) appointmentList = response.items;

      setAppointments(appointmentList);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách hàng đợi.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [filterDate]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

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
      fetchAppointments();
    } catch (error) {
      toast.error("Lỗi khi bắt đầu ca khám.");
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* Professional Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Danh sách hàng đợi</h1>
          <p className="mt-1 text-xs font-bold text-slate-400 flex items-center gap-2 tracking-wide uppercase">
            <Clock size={14} className="text-indigo-500" />
            Điều phối và thực hiện thăm khám lâm sàng
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-sm border border-slate-200 shadow-sm">
          <FilterButton active={filterStatus === 'All'} onClick={() => setFilterStatus('All')} label="Tất cả" count={appointments.length} />
          <FilterButton active={filterStatus === 'Waiting'} onClick={() => setFilterStatus('Waiting')} label="Đang chờ" count={appointments.filter(a => a.status === 'Waiting').length} color="amber" />
          <FilterButton active={filterStatus === 'InProgress'} onClick={() => setFilterStatus('InProgress')} label="Đang khám" count={appointments.filter(a => a.status === 'InProgress').length} color="indigo" />
          <FilterButton active={filterStatus === 'Completed'} onClick={() => setFilterStatus('Completed')} label="Xong" count={appointments.filter(a => a.status === 'Completed').length} color="emerald" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 border border-slate-200 rounded-sm shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm bệnh nhân trong danh sách..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-sm text-sm font-bold focus:ring-1 focus:ring-indigo-500 outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="date"
            className="pl-12 pr-4 py-3 bg-slate-50 border-none rounded-sm text-sm font-black text-slate-600 focus:ring-1 focus:ring-indigo-500 outline-none"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="py-20 text-center animate-pulse flex flex-col items-center gap-4">
           <div className="h-8 w-8 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang trích xuất dữ liệu hàng đợi...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-20 text-center rounded-sm border border-dashed border-slate-300">
          <User size={48} className="mx-auto text-slate-100 mb-4" />
          <p className="text-slate-400 font-black uppercase text-xs tracking-widest italic">Hàng đợi hiện tại đang trống</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(app => (
            <div 
              key={app.id} 
              className={cn(
                "bg-white border p-6 rounded-sm shadow-sm transition-all flex flex-col h-full group",
                app.status === 'InProgress' ? "border-indigo-200 bg-indigo-50/10 shadow-indigo-100 shadow-xl" : "border-slate-200 hover:border-slate-400"
              )}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={cn(
                  "px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest",
                  getStatusBadge(app.status)
                )}>
                  {getStatusLabel(app.status)}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewingPatientId(app.patientId)}
                    title="Xem hồ sơ bệnh nhân"
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-all"
                  >
                    <User size={16} />
                  </button>
                  <button className="text-slate-300 hover:text-slate-600 p-1.5"><MoreVertical size={16} /></button>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h4 className="font-black text-slate-900 text-sm tracking-tight">{app.patientName}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1 italic">
                    <Clock size={12} className="text-indigo-500" /> {app.startTime} - {app.endTime} ({app.specialtyName})
                  </div>
                </div>

                <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-sm">
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">Lý do khám</p>
                  <p className="text-xs font-bold text-slate-600 line-clamp-2 italic leading-relaxed">{app.reason || 'Khám nội khoa định kỳ'}</p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-50 flex gap-2">
                {app.status === 'Waiting' && (
                  <button
                    onClick={() => handleStartExam(app.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-slate-900 text-white py-3 rounded-sm font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-100"
                  >
                    <Play size={14} fill="currentColor" /> Bắt đầu khám
                  </button>
                )}
                {app.status === 'Confirmed' && (
                  <div className="flex-1 text-center py-3 bg-slate-50 border border-dashed border-slate-200 rounded-sm text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Chờ Check-in
                  </div>
                )}
                {app.status === 'InProgress' && (
                  <button
                    onClick={() => setSelectedAppointment(app)}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-sm font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-200"
                  >
                    <Activity size={14} /> Tiếp tục khám
                  </button>
                )}
                {app.status === 'Completed' && (
                  <button
                    onClick={() => setSelectedAppointment(app)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 py-3 rounded-sm font-black text-[10px] uppercase tracking-widest transition-all"
                  >
                    <ArrowRight size={14} /> Xem lại / Sửa
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
    className={cn(
      "px-5 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
      active
        ? `bg-slate-900 text-white shadow-lg`
        : 'text-slate-400 hover:text-slate-700 bg-transparent'
    )}
  >
    {label}
    <span className={cn(
      "px-1.5 py-0.5 rounded-sm text-[9px] font-black",
      active ? `bg-white/20 text-white` : 'bg-slate-100 text-slate-400'
    )}>
      {count}
    </span>
  </button>
);

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Confirmed': return 'bg-blue-50 text-blue-600 border border-blue-100';
    case 'Waiting': return 'bg-amber-50 text-amber-600 border border-amber-100';
    case 'InProgress': return 'bg-indigo-600 text-white shadow-lg shadow-indigo-100';
    case 'Completed': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    default: return 'bg-slate-50 text-slate-600 border border-slate-100';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'Confirmed': return 'Xác nhận';
    case 'Waiting': return 'Sẵn sàng';
    case 'InProgress': return 'Đang khám';
    case 'Completed': return 'Đã Xong';
    default: return status;
  }
};

export default DoctorAppointments;