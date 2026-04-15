import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { scheduleService } from '../../../services/scheduleService';
import { timeSlotService } from '../../../services/timeSlotService';
import type { Schedule, ScheduleQueryParams, TimeSlot } from '../../../types/schedule';
import { doctorService } from '../../../services/doctorService';
import type { Doctor } from '../../../types/doctor';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Users,
  Clock,
  User,
  MoreVertical,
  CalendarCheck,
  Info,
  Trash2,
  X,
  Phone,
  MessageSquare,
  Activity,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  PlusCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';
import { formatDate, formatDateShort } from '../../../utils/format';

interface ScheduleSession {
  morning: Schedule[];
  afternoon: Schedule[];
  evening: Schedule[];
}

const AdminSchedules: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filter states
  const [doctorId, setDoctorId] = useState<string>('');

  // Get start of week (Monday)
  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const currentWeekMonday = useMemo(() => getMonday(selectedDate), [selectedDate]);

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekMonday);
      day.setDate(currentWeekMonday.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentWeekMonday]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const fromDate = currentWeekMonday.toISOString().split('T')[0];
      const toDate = new Date(currentWeekMonday);
      toDate.setDate(toDate.getDate() + 6);
      const toDateStr = toDate.toISOString().split('T')[0];

      const [schedRes, docRes] = await Promise.all([
        scheduleService.getList({
          fromDate,
          toDate: toDateStr,
          doctorId: doctorId || undefined,
          pageSize: 1000
        }),
        doctorService.getList({ pageSize: 100 })
      ]);

      setSchedules(schedRes.items || []);
      setDoctors(docRes.items || []);
    } catch (error) {
      toast.error('Không thể lấy dữ liệu lịch trực');
    } finally {
      setLoading(false);
    }
  }, [currentWeekMonday, doctorId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getSession = (startTime: string): 'morning' | 'afternoon' | 'evening' => {
    const hour = parseInt(startTime.split(':')[0]);
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const groupedSchedules = useMemo(() => {
    const grouped: Record<string, ScheduleSession> = {};

    weekDays.forEach(day => {
      const dateKey = day.toISOString().split('T')[0];
      grouped[dateKey] = { morning: [], afternoon: [], evening: [] };
    });

    schedules.forEach(s => {
      const dateKey = new Date(s.workDate).toISOString().split('T')[0];
      if (grouped[dateKey]) {
        const session = getSession(s.startTime);
        grouped[dateKey][session].push(s);
      }
    });

    return grouped;
  }, [schedules, weekDays]);

  const handlePrevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const openScheduleDetail = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setShowDetailModal(true);
  };

  const openSlotDetail = (slot: TimeSlot) => {
    if (slot.isBooked) {
      setSelectedSlot(slot);
      setShowSlotModal(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch làm việc này?')) return;
    try {
      await scheduleService.delete(id);
      toast.success('Xóa lịch làm việc thành công');
      setShowDetailModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa lịch làm việc');
    }
  };
  const handleToggleSlot = async (slotId: string) => {
    try {
      await timeSlotService.toggleBooked(slotId);
      toast.success('Cập nhật trạng thái slot thành công');
      // Update local state instead of refetching everything
      if (selectedSchedule) {
        const updatedSlots = selectedSchedule.timeSlots.map(s => 
          s.id === slotId ? { ...s, isBooked: !s.isBooked } : s
        );
        setSelectedSchedule({ ...selectedSchedule, timeSlots: updatedSlots });
      }
      fetchData(); // Sync with backend for availability counts
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật slot');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khung giờ này?')) return;
    try {
      await timeSlotService.delete(slotId);
      toast.success('Xóa khung giờ thành công');
      if (selectedSchedule) {
        const remainingSlots = selectedSchedule.timeSlots.filter(s => s.id !== slotId);
        setSelectedSchedule({ ...selectedSchedule, timeSlots: remainingSlots });
      }
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa khung giờ');
    }
  };

  const statusMap: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    Pending: { label: 'Chờ xác nhận', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100', icon: Clock },
    Confirmed: { label: 'Đã xác nhận', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-100', icon: CheckCircle2 },
    Waiting: { label: 'Sẵn sàng', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-100', icon: Activity },
    InProgress: { label: 'Đang khám', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-100', icon: Activity },
    Completed: { label: 'Hoàn thành', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100', icon: CheckCircle2 },
    Cancelled: { label: 'Đã hủy', color: 'text-slate-500', bg: 'bg-slate-50 border-slate-100', icon: AlertCircle },
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Thời khóa biểu bác sĩ</h1>
          <p className="mt-1 text-sm font-bold text-slate-400 flex items-center gap-2">
            <Users size={14} className="text-indigo-500" />
            Điều phối nhân sự và quản lý lịch trực tổng thể
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
            <button
              onClick={handlePrevWeek}
              className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleToday}
              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600 transition-all"
            >
              Hôm nay
            </button>
            <button
              onClick={handleNextWeek}
              className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">
            <Plus size={18} strokeWidth={3} />
            Phân lịch mới
          </button>
        </div>
      </div>

      {/* Filters section */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600 appearance-none cursor-pointer"
          >
            <option value="">Tất cả bác sĩ</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>{d.fullName} - {d.specialtyName}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 bg-indigo-50/50 px-4 py-3 rounded-xl border border-indigo-100/50">
          <CalendarIcon size={18} className="text-indigo-500" />
          <span className="text-xs font-black text-indigo-700 uppercase tracking-wider">
            {formatDate(currentWeekMonday)} - {formatDate(weekDays[6])}
          </span>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="w-24 p-6 border-r border-slate-200"></th>
                {weekDays.map((day, i) => {
                  const isToday = new Date().toDateString() === day.toDateString();
                  return (
                    <th key={i} className={cn(
                      "p-6 text-center border-r border-slate-200 last:border-r-0",
                      isToday && "bg-indigo-50/30"
                    )}>
                      <span className={cn(
                        "block text-[10px] font-black uppercase tracking-[0.2em]",
                        isToday ? "text-indigo-600" : "text-slate-400"
                      )}>
                        {day.toLocaleDateString('vi-VN', { weekday: 'short' })}
                      </span>
                      <span className={cn(
                        "mt-1 block text-2xl font-black tabular-nums tracking-tighter",
                        isToday ? "text-indigo-600" : "text-slate-900"
                      )}>
                        {day.getDate()}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Sessions */}
              {(['morning', 'afternoon', 'evening'] as const).map(sessionKey => (
                <tr key={sessionKey} className="border-b border-slate-100 last:border-b-0">
                  <td className="p-6 border-r border-slate-200 bg-slate-50/30">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 rotate-0 md:-rotate-90 md:mb-10">
                        {sessionKey === 'morning' ? 'Sáng' : sessionKey === 'afternoon' ? 'Chiều' : 'Tối'}
                      </span>
                      {sessionKey === 'morning' && <Clock className="text-amber-500" size={20} />}
                      {sessionKey === 'afternoon' && <Clock className="text-orange-500" size={20} />}
                      {sessionKey === 'evening' && <Clock className="text-indigo-500" size={20} />}
                    </div>
                  </td>
                  {weekDays.map((day, i) => {
                    const dateKey = day.toISOString().split('T')[0];
                    const sessionSchedules = groupedSchedules[dateKey]?.[sessionKey] || [];

                    return (
                      <td key={i} className="p-4 border-r border-slate-100 last:border-r-0 align-top h-48 hover:bg-slate-50/50 transition-colors">
                        <div className="space-y-2">
                          {sessionSchedules.map(s => (
                            <div
                              key={s.id}
                              onClick={() => openScheduleDetail(s)}
                              className="group p-3 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-indigo-600 hover:shadow-md hover:shadow-indigo-100/50 transition-all cursor-pointer"
                            >
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter truncate">
                                  {s.doctorName}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase truncate">
                                  {s.specialtyName}
                                </span>
                                <div className="mt-2 flex items-center justify-between">
                                  <span className="text-[9px] font-black tabular-nums text-slate-300">
                                    {s.startTime} - {s.endTime}
                                  </span>
                                  <div className="flex gap-1">
                                    <div className={cn(
                                      "h-1.5 w-1.5 rounded-full",
                                      s.availableSlots === 0 ? "bg-rose-500" : s.availableSlots < s.totalSlots ? "bg-amber-500" : "bg-emerald-500"
                                    )}></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {sessionSchedules.length === 0 && (
                            <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plus className="text-slate-200" size={24} />
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 px-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Còn trống hoàn toàn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-amber-500"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đã có người đặt</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-rose-500"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đã đầy lịch</span>
        </div>
      </div>


      {/* Schedule Detail Side Modal */}
      {showDetailModal && selectedSchedule && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowDetailModal(false)}></div>
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                  <Activity className="text-indigo-600" />
                  Kế hoạch công tác
                </h2>
                <p className="mt-1 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {selectedSchedule.doctorName} • {formatDate(selectedSchedule.workDate)}
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-slate-200 rounded-xl transition-all"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Thời gian ca</span>
                  <p className="text-sm font-black text-slate-700">{selectedSchedule.startTime} - {selectedSchedule.endTime}</p>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Trạng thái lấp đầy</span>
                  <p className="text-sm font-black text-indigo-700">{selectedSchedule.availableSlots} / {selectedSchedule.totalSlots} SLOTS TRỐNG</p>
                </div>
              </div>

              {/* Slots Grid */}
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Danh sách khung giờ (15-30 phút)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedSchedule.timeSlots?.map((slot, idx) => (
                    <div
                      key={slot.id || idx}
                      className={cn(
                        "relative p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all group overflow-hidden",
                        slot.isBooked
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "bg-white border-slate-200 text-slate-500"
                      )}
                    >
                      <span className="text-sm font-black tabular-nums">{slot.startTime.substring(0, 5)}</span>
                      
                      <div className="flex items-center gap-1">
                        {slot.appointmentId ? (
                          <button
                            onClick={() => openSlotDetail(slot)}
                            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
                            title="Xem chi tiết bệnh nhân"
                          >
                            <Info size={14} />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleToggleSlot(slot.id)}
                              className={cn(
                                "p-1.5 rounded-lg transition-colors",
                                slot.isBooked ? "hover:bg-white/20 text-white" : "hover:bg-slate-100 text-slate-400"
                              )}
                              title={slot.isBooked ? "Mở khóa slot" : "Khóa slot"}
                            >
                              {slot.isBooked ? <Unlock size={14} /> : <Lock size={14} />}
                            </button>
                            <button
                              onClick={() => handleDeleteSlot(slot.id)}
                              className={cn(
                                "p-1.5 rounded-lg transition-colors",
                                slot.isBooked ? "hover:bg-white/20 text-white" : "hover:bg-rose-50 text-rose-400"
                              )}
                              title="Xóa slot"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>

                      <div className={cn(
                        "absolute top-0 right-0 p-1 opacity-20",
                        slot.isBooked ? "text-white" : "text-slate-300"
                      )}>
                        {slot.appointmentId && <CalendarCheck size={12} />}
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Slot Placeholder Button */}
                  <button
                    className="p-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center gap-1 group"
                    onClick={() => toast.info('Tính năng thêm slot lẻ đang được cập nhật')}
                  >
                    <PlusCircle size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Thêm Slot</span>
                  </button>
                </div>
              </div>

              {selectedSchedule.note && (
                <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100">
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block mb-2">Ghi chú</span>
                  <p className="text-xs font-bold text-amber-800 leading-relaxed italic">
                    "{selectedSchedule.note}"
                  </p>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
              <button
                onClick={() => handleDelete(selectedSchedule.id)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all"
              >
                <Trash2 size={16} />
                Xóa lịch này
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-3 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Detail Modal (For booked slots) */}
      {showSlotModal && selectedSlot && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => setShowSlotModal(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden border border-white/20">
            {/* Modal content */}
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Chi tiết lượt khám</h3>
                  <p className="text-[10px] font-bold uppercase opacity-60 tracking-widest">Khung giờ: {selectedSlot.startTime} - {selectedSlot.endTime}</p>
                </div>
              </div>
              <button onClick={() => setShowSlotModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Patient Profile */}
              <div className="flex items-start gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <div className="flex-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Bệnh nhân</span>
                  <h4 className="text-xl font-black text-slate-800">{selectedSlot.patientName || 'N/A'}</h4>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center gap-1 text-slate-500">
                      <Phone size={14} />
                      <span className="text-xs font-bold">{selectedSlot.patientPhone || 'Chưa cập nhật'}</span>
                    </div>
                  </div>
                </div>
                {selectedSlot.status && (
                   <div className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 h-fit",
                    statusMap[selectedSlot.status]?.bg,
                    statusMap[selectedSlot.status]?.color
                  )}>
                    {React.createElement(statusMap[selectedSlot.status]?.icon || AlertCircle, { size: 14 })}
                    {statusMap[selectedSlot.status]?.label || selectedSlot.status}
                  </div>
                )}
              </div>

              {/* Consultation Info */}
              <div className="space-y-4">
                <div className="flex gap-4">
                   <div className="p-5 rounded-3xl bg-white border border-slate-100 flex-1 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Mã cuộc hẹn</span>
                    <p className="text-sm font-black text-slate-700 tracking-tighter">
                      {selectedSlot.appointmentId?.substring(0, 13).toUpperCase() || '---'}
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <MessageSquare size={48} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Lý do khám bệnh</span>
                  <p className="text-sm font-bold text-slate-600 leading-relaxed">
                    {selectedSlot.reason || 'Bệnh nhân chưa cung cấp lý do chi tiết cho buổi khám này.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 flex gap-3">
              <button 
                onClick={() => setShowSlotModal(false)}
                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
              >
                Đóng thông tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchedules;
