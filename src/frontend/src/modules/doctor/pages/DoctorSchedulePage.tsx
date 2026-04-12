import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Plus, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowRightLeft,
  ClipboardList
} from 'lucide-react';
import { scheduleService, type Schedule } from '../../../services/scheduleService';
import { toast } from 'sonner';

const DoctorSchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await scheduleService.getMySchedules();
      // Handle { message, data } if exists, but schedules usually direct array in this service
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

  const tableDates = useMemo(() => {
    const dates = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + (currentWeekOffset * 7));
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [currentWeekOffset]);

  const getShiftData = (date: Date, shift: 'morning' | 'afternoon' | 'evening') => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules.filter(s => {
      const sDate = s.workDate.split('T')[0];
      if (sDate !== dateStr) return false;
      const hour = parseInt(s.startTime.split(':')[0]);
      if (shift === 'morning') return hour < 12;
      if (shift === 'afternoon') return hour >= 12 && hour < 18;
      if (shift === 'evening') return hour >= 18;
      return false;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
             <Calendar size={20} className="text-indigo-600" /> Bảng lịch trực công tác
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Quản lý và theo dõi các ca làm việc đã đăng ký.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded border border-slate-200 shadow-sm">
             <button onClick={() => setCurrentWeekOffset(v => v - 1)} className="p-1.5 hover:bg-slate-50 text-slate-400 rounded transition-all"><ChevronLeft size={18} /></button>
             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 w-28 text-center">Tuần {currentWeekOffset >= 0 ? '+' : ''}{currentWeekOffset}</span>
             <button onClick={() => setCurrentWeekOffset(v => v + 1)} className="p-1.5 hover:bg-slate-50 text-slate-400 rounded transition-all"><ChevronRight size={18} /></button>
             <div className="w-px h-4 bg-slate-100 mx-1"></div>
             <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded font-bold text-xs transition-colors">
               ĐĂNG KÝ CA TRỰC
             </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden min-h-[500px]">
          {loading ? (
             <div className="py-40 text-center text-slate-400 text-xs font-bold animate-pulse">ĐANG ĐỒNG BỘ LỊCH TRỰC...</div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-200">
                            <th className="p-4 border-r border-slate-100 w-48">Thời gian</th>
                            <th className="p-4 border-r border-slate-100 text-center">Ca sáng <br/><span className="text-[8px] opacity-60">07:00 - 12:00</span></th>
                            <th className="p-4 border-r border-slate-100 text-center">Ca chiều <br/><span className="text-[8px] opacity-60">12:00 - 18:00</span></th>
                            <th className="p-4 text-center">Ca tối <br/><span className="text-[8px] opacity-60">18:00 - 22:00</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 italic">
                        {tableDates.map((date) => (
                            <tr key={date.toISOString()} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 border-r border-slate-100 bg-white sticky left-0 font-sans not-italic">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded flex flex-col items-center justify-center font-bold border ${
                                          date.toDateString() === new Date().toDateString() ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-100'
                                        }`}>
                                            <span className="text-[8px] uppercase">{date.toLocaleDateString('vi-VN', { weekday: 'short' })}</span>
                                            <span className="text-sm">{date.getDate()}</span>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-800 uppercase">Tháng {date.getMonth() + 1}</p>
                                            <p className="text-[9px] text-slate-400 font-medium">Năm {date.getFullYear()}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-2 border-r border-slate-100"><ShiftDisplay data={getShiftData(date, 'morning')} /></td>
                                <td className="p-2 border-r border-slate-100"><ShiftDisplay data={getShiftData(date, 'afternoon')} /></td>
                                <td className="p-2"><ShiftDisplay data={getShiftData(date, 'evening')} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <SmallCard icon={<Clock size={16} />} label="Tổng giờ trực" value="-- giờ" />
           <SmallCard icon={<ArrowRightLeft size={16} />} label="Hệ số lấp đầy" value="--" />
           <SmallCard icon={<ClipboardList size={16} />} label="Số phiên trực" value={`${schedules.length} phiên`} />
      </div>
    </div>
  );
};

const ShiftDisplay = ({ data }: { data: Schedule[] }) => {
    if (data.length === 0) return <div className="text-center py-4 text-[10px] text-slate-300 font-medium">-- Trống --</div>;
    return (
        <div className="space-y-1">
            {data.map(slot => (
                <div key={slot.id} className="p-2 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-600 flex justify-between items-center group cursor-default">
                    <span>{slot.startTime.slice(0,5)} - {slot.endTime.slice(0,5)}</span>
                    <div className={`h-1.5 w-1.5 rounded-full ${slot.isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </div>
            ))}
        </div>
    );
};

const SmallCard = ({ icon, label, value }: any) => (
    <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm flex items-center gap-4">
        <div className="p-2 bg-slate-50 text-slate-400 rounded">{icon}</div>
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-base font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

export default DoctorSchedulePage;
