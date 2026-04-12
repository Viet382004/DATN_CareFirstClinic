import React, { useEffect, useState, useCallback } from 'react';
import { scheduleService } from '../../../services/scheduleService';
import type { Schedule, ScheduleQueryParams, TimeSlot } from '../../../types/schedule';
import { doctorService } from '../../../services/doctorService';
import type { Doctor } from '../../../types/doctor';
import {
  Calendar,
  Search,
  Plus,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Filter,
  Trash2,
  CalendarCheck,
  Activity,
  ArrowRight,
  Info,
  MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';
import { formatDate, formatDateShort } from '../../../utils/format';

const AdminSchedules: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  const [query, setQuery] = useState<ScheduleQueryParams>({
    page: 1,
    pageSize: 10,
    sortBy: 'workDate',
    sortDir: 'desc'
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [schedRes, docRes] = await Promise.all([
        scheduleService.getList(query),
        doctorService.getList({ pageSize: 100 })
      ]);
      setSchedules(schedRes.items || []);
      setTotalItems(schedRes.totalCount || 0);
      setDoctors(docRes.items || []);
    } catch (error) {
      toast.error('Không thể lấy dữ liệu lịch trực');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn lịch làm việc này?')) return;
    try {
      await scheduleService.delete(id);
      toast.success('Xóa lịch làm việc thành công');
      if (selectedSchedule?.id === id) setSelectedSchedule(null);
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi xóa lịch làm việc');
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Điều phối nhân sự</h1>
          <p className="mt-1 text-xs font-bold text-slate-400 uppercase tracking-widest">Quản lý ca trực và lịch biểu bác sĩ</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md font-bold text-sm shadow-sm hover:bg-indigo-700 transition-all">
          <Plus size={18} /> PHÂN LỊCH MỚI
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Schedule List (Horizontal Rows) */}
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border-none rounded-md text-sm font-bold text-slate-700 focus:ring-1 focus:ring-indigo-600 appearance-none cursor-pointer"
                onChange={(e) => setQuery({ ...query, doctorId: e.target.value || undefined, page: 1 })}
              >
                <option value="">Tất cả bác sĩ</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.fullName}</option>
                ))}
              </select>
            </div>
            <input
              type="date"
              className="w-full px-3 py-2 bg-slate-50 border-none rounded-md text-sm font-bold text-slate-700 focus:ring-1 focus:ring-indigo-600 cursor-pointer"
              onChange={(e) => setQuery({ ...query, fromDate: e.target.value || undefined, page: 1 })}
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-xs font-bold text-slate-400 uppercase tracking-widest capitalize">Đang nạp...</div>
            ) : schedules.length === 0 ? (
              <div className="p-10 text-center text-xs font-bold text-slate-400">Trống lịch</div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {schedules.map(s => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSchedule(s)}
                    className={cn(
                      "p-4 cursor-pointer transition-all hover:bg-slate-50 flex items-center justify-between group",
                      selectedSchedule?.id === s.id ? "bg-indigo-50/50 border-l-4 border-l-indigo-600" : "border-l-4 border-l-transparent"
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-tight">
                        {new Date(s.workDate).toLocaleDateString('vi-VN', { weekday: 'short' })}, {formatDateShort(s.workDate)}
                      </span>
                      <span className="text-[11px] font-bold text-indigo-600">{s.doctorName}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-bold text-slate-400">{s.startTime} - {s.endTime}</span>
                      <span className="text-[9px] font-black text-slate-300 uppercase">{s.availableSlots}/{s.totalSlots} SLOTS</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
              <span>TRANG {query.page}</span>
              <div className="flex gap-2">
                <button onClick={() => setQuery(p => ({ ...p, page: Math.max(1, (p.page || 1) - 1) }))} className="hover:text-indigo-600"><ChevronLeft size={14} /></button>
                <button onClick={() => setQuery(p => ({ ...p, page: (p.page || 1) + 1 }))} className="hover:text-indigo-600"><ChevronRight size={14} /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Timetable Grid (Detailed Slots) */}
        <div className="xl:col-span-2">
          {selectedSchedule ? (
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm h-full flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-black text-slate-800 tracking-tight">Thời khóa biểu chi tiết</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Bác sĩ: {selectedSchedule.doctorName} • Ngày: {formatDate(selectedSchedule.workDate)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(selectedSchedule.id)}
                    className="p-2 text-rose-400 hover:bg-rose-50 rounded-md transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className={cn("px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border h-fit",
                    selectedSchedule.isAvailable ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-200")}>
                    {selectedSchedule.isAvailable ? 'Đang hoạt động' : 'Tạm khóa'}
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 bg-slate-50/30">
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {selectedSchedule.timeSlots?.map((slot, idx) => (
                    <div
                      key={slot.id || idx}
                      className={cn(
                        "relative p-3 rounded-md border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group",
                        slot.isBooked
                          ? "bg-white border-slate-200 hover:border-indigo-600 hover:shadow-md"
                          : "bg-indigo-50 border-indigo-100 cursor-help"
                      )}
                      onClick={() => {
                        if (!slot.isBooked) {
                          toast.info(`Ca khám ${slot.startTime} đã được đặt.`);
                        }
                      }}
                    >
                      <span className="text-xs font-black text-slate-800 tabular-nums">{slot.startTime}</span>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-tighter px-1 rounded",
                        slot.isBooked ? "text-slate-300" : "text-indigo-600 bg-white"
                      )}>
                        {slot.isBooked ? 'Trống' : 'Đã đặt'}
                      </span>

                      {/* Detail Tooltip/Hover Effect */}
                      {!slot.isBooked && (
                        <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-100 rounded-md flex items-center justify-center transition-opacity text-white">
                          <Info size={16} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {selectedSchedule.timeSlots?.length === 0 && (
                  <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-md">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Không có ca khám chi tiết</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50 rounded-b-lg border-t border-slate-200">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-white border border-slate-200 rounded-sm"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Còn trống</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-indigo-600 rounded-sm"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Đã được đặt</span>
                  </div>
                  <div className="ml-auto">
                    <p className="text-[10px] font-bold text-slate-400 capitalize underline italic">
                      * Nhấn vào ca 'Đã đặt' để xem chi tiết bệnh nhân (Tính năng đang cập nhật)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-white border border-slate-200 border-dashed rounded-lg p-10 opacity-60">
              <CalendarCheck size={48} className="text-slate-200 mb-4" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Chọn một lịch trực phía bên trái để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default AdminSchedules;
