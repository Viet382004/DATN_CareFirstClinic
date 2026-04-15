import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Activity,
  User,
  Info
} from 'lucide-react';
import { scheduleService } from '../../../services/scheduleService';
import { toast } from 'sonner';
import type { Schedule } from '../../../types/schedule';
import { formatDate } from '../../../utils/format';
import { cn } from '../../../lib/utils';

const DoctorSchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await scheduleService.getMySchedules();
      setSchedules(res || []);
    } catch (error) {
      toast.error("Không thể tải lịch làm việc.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // Calendar Logic
  const currentWeekMonday = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) + (currentWeekOffset * 7);
    return new Date(d.setDate(diff));
  }, [currentWeekOffset]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentWeekMonday);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [currentWeekMonday]);

  const handlePrevWeek = () => setCurrentWeekOffset(prev => prev - 1);
  const handleNextWeek = () => setCurrentWeekOffset(prev => prev + 1);
  const handleToday = () => setCurrentWeekOffset(0);

  // Group schedules by date and session
  const groupedSchedules = useMemo(() => {
    const groups: Record<string, Record<string, Schedule[]>> = {};

    schedules.forEach(s => {
      const dateKey = s.workDate.split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = { morning: [], afternoon: [], evening: [] };
      }

      const hour = parseInt(s.startTime.split(':')[0]);
      if (hour < 12) groups[dateKey].morning.push(s);
      else if (hour < 18) groups[dateKey].afternoon.push(s);
      else groups[dateKey].evening.push(s);
    });

    return groups;
  }, [schedules]);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* Professional Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Lịch công tác cá nhân</h1>
          <p className="mt-1 text-xs font-bold text-slate-400 flex items-center gap-2 tracking-wide uppercase">
            <Activity size={14} className="text-indigo-500" />
            Theo dõi và quản lý thời gian trực lâm sàng
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 p-1 rounded-sm shadow-sm">
            <button onClick={handlePrevWeek} className="p-2 hover:bg-slate-50 text-slate-400 transition-all"><ChevronLeft size={20} /></button>
            <button onClick={handleToday} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600">Hôm nay</button>
            <button onClick={handleNextWeek} className="p-2 hover:bg-slate-50 text-slate-400 transition-all"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>

      {/* Date Range indicator */}
      <div className="bg-white px-6 py-4 rounded-sm border border-slate-200 shadow-sm flex items-center gap-3 w-fit">
        <CalendarIcon size={18} className="text-indigo-500" />
        <span className="text-xs font-black text-slate-700 uppercase tracking-widest">
          {formatDate(weekDays[0])} — {formatDate(weekDays[6])}
        </span>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-40 text-center">
             <div className="inline-block h-8 w-8 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Đang đồng bộ dữ liệu lịch trực...</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
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
                {(['morning', 'afternoon', 'evening'] as const).map(sessionKey => (
                  <tr key={sessionKey} className="border-b border-slate-100 last:border-b-0">
                    <td className="p-6 border-r border-slate-200 bg-slate-50/30">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 rotate-0 md:-rotate-90 md:mb-10">
                          {sessionKey === 'morning' ? 'Sáng' : sessionKey === 'afternoon' ? 'Chiều' : 'Tối'}
                        </span>
                        {sessionKey === 'morning' && <Clock className="text-amber-500" size={18} />}
                        {sessionKey === 'afternoon' && <Clock className="text-orange-500" size={18} />}
                        {sessionKey === 'evening' && <Clock className="text-indigo-500" size={18} />}
                      </div>
                    </td>
                    {weekDays.map((day, i) => {
                      const dateKey = day.toISOString().split('T')[0];
                      const sessionSchedules = groupedSchedules[dateKey]?.[sessionKey] || [];

                      return (
                        <td key={i} className="p-4 border-r border-slate-100 last:border-r-0 align-top h-40 hover:bg-slate-50/50 transition-colors">
                          <div className="space-y-2">
                            {sessionSchedules.map(s => (
                              <div
                                key={s.id}
                                className="p-3 rounded-sm bg-white border border-slate-200 shadow-sm hover:border-indigo-600 transition-all group"
                              >
                                <div className="flex flex-col gap-1">
                                  <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter truncate">
                                      Ca trực #{s.id.slice(0, 4)}
                                    </span>
                                    <div className={cn(
                                       "h-1.5 w-1.5 rounded-full",
                                       s.availableSlots === 0 ? "bg-rose-500" : s.availableSlots < s.totalSlots ? "bg-amber-500" : "bg-emerald-500"
                                    )} />
                                  </div>
                                  <div className="mt-2 flex items-center justify-between">
                                    <span className="text-[10px] font-black tabular-nums text-slate-800">
                                      {s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                      {s.totalSlots - s.availableSlots}/{s.totalSlots} Slots
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-6 mt-4 px-2">
         <LegendItem color="bg-emerald-500" label="Sẵn sàng" />
         <LegendItem color="bg-amber-500" label="Gần đầy" />
         <LegendItem color="bg-rose-500" label="Đã hết chỗ" />
      </div>
    </div>
  );
};

const LegendItem = ({ color, label }: any) => (
  <div className="flex items-center gap-2">
    <div className={cn("h-2 w-2 rounded-full", color)} />
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
  </div>
);

export default DoctorSchedulePage;
