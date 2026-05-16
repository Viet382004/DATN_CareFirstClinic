import React, { useState, useEffect } from 'react';
import { specialtyService } from '../../../services/specialtyService';
import { doctorService } from '../../../services/doctorService';
import { scheduleService } from '../../../services/scheduleService';
import { timeSlotService } from '../../../services/timeSlotService';
import { appointmentService } from '../../../services/appointmentService';
import type { Appointment } from '../../../types/appointment';
import type { Specialty } from '../../../types/specialty';
import type { Doctor } from '../../../types/doctor';
import type { TimeSlot } from '../../../types/schedule';
import { toast } from 'sonner';
import { Calendar, User, Stethoscope, Clock, Loader2, X, Check } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { formatDate } from '../../../utils/format';

interface ReassignAppointmentModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ReassignAppointmentModal: React.FC<ReassignAppointmentModalProps> = ({
  isOpen,
  appointment,
  onClose,
  onSuccess
}) => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Khởi tạo data khi mở modal
  useEffect(() => {
    if (isOpen && appointment) {
      setNotes(appointment.notes || '');
      fetchSpecialties();
    }
  }, [isOpen, appointment]);

  const fetchSpecialties = async () => {
    setLoading(true);
    try {
      const res = await specialtyService.getAll();
      setSpecialties(res || []);
    } catch (error) {
      toast.error('Không thể tải danh sách chuyên khoa');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async (specialtyId: string) => {
    setLoading(true);
    try {
      const res = await doctorService.getList({ specialtyId });
      setDoctors(res.items || []);
      // Reset selections
      setSelectedDoctorId('');
      setSelectedDate('');
      setSelectedTimeSlotId('');
      setAvailableDates([]);
      setTimeSlots([]);
    } catch (error) {
      toast.error('Không thể tải danh sách bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDates = async (doctorId: string) => {
    setLoading(true);
    try {
      const schedules = await scheduleService.getAvailable(doctorId, new Date().toISOString().split('T')[0]);
      const dates = Array.from(new Set(schedules.map(s => s.workDate.split('T')[0])));
      setAvailableDates(dates);
      // Reset selections
      setSelectedDate('');
      setSelectedTimeSlotId('');
      setTimeSlots([]);
    } catch (error) {
      toast.error('Không thể tải lịch làm việc của bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async (doctorId: string, date: string) => {
    setLoading(true);
    try {
      const slots = await timeSlotService.getByDoctorAndDate(doctorId, date);
      // Chỉ lấy các slot chưa được đặt, hoặc chính là slot hiện tại của lịch hẹn này
      setTimeSlots(slots.filter(s => !s.isBooked || s.id === appointment?.timeSlotId));
      setSelectedTimeSlotId('');
    } catch (error) {
      toast.error('Không thể tải danh sách giờ khám');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!appointment || !selectedTimeSlotId) {
      toast.error('Vui lòng chọn khung giờ mới');
      return;
    }

    setSubmitting(true);
    try {
      await appointmentService.adminUpdate(appointment.id, {
        timeSlotId: selectedTimeSlotId,
        notes: notes
      });
      toast.success('Điều chỉnh lịch hẹn thành công');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-indigo-600 px-8 py-6 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">Điều chỉnh lịch hẹn</h3>
            <p className="text-indigo-100 text-sm font-bold mt-1 uppercase tracking-widest">
              BN: {appointment.patientName} - ID: {appointment.id.substring(0, 8)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Selection */}
            <div className="space-y-6">
              {/* Specialty */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Chuyên khoa</label>
                <div className="relative">
                  <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 transition-all outline-none appearance-none cursor-pointer"
                    value={selectedSpecialtyId}
                    onChange={(e) => {
                      setSelectedSpecialtyId(e.target.value);
                      fetchDoctors(e.target.value);
                    }}
                  >
                    <option value="">Chọn chuyên khoa</option>
                    {specialties.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Doctor */}
              <div className={cn(!selectedSpecialtyId && "opacity-50 pointer-events-none")}>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Bác sĩ</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 transition-all outline-none appearance-none cursor-pointer"
                    value={selectedDoctorId}
                    onChange={(e) => {
                      setSelectedDoctorId(e.target.value);
                      fetchAvailableDates(e.target.value);
                    }}
                  >
                    <option value="">Chọn bác sĩ</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>BS. {d.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date */}
              <div className={cn(!selectedDoctorId && "opacity-50 pointer-events-none")}>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ngày khám</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 transition-all outline-none appearance-none cursor-pointer"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      fetchTimeSlots(selectedDoctorId, e.target.value);
                    }}
                  >
                    <option value="">Chọn ngày khám</option>
                    {availableDates.map(date => (
                      <option key={date} value={date}>{formatDate(date)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ghi chú điều chỉnh</label>
                <textarea
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-600 transition-all outline-none resize-none h-24"
                  placeholder="Lý do điều chỉnh hoặc lưu ý thêm..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Right Column: Time Slots */}
            <div className="flex flex-col">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Khung giờ khả dụng</label>

              {!selectedDate ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
                  <Clock size={40} className="text-slate-300 mb-3" />
                  <p className="text-sm font-bold text-slate-400">Vui lòng chọn bác sĩ và ngày khám để xem khung giờ</p>
                </div>
              ) : loading ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-8">
                  <Loader2 size={32} className="text-indigo-600 animate-spin mb-3" />
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Đang tìm slot...</p>
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-rose-50 rounded-2xl border-2 border-dashed border-rose-100 p-8 text-center">
                  <X size={40} className="text-rose-300 mb-3" />
                  <p className="text-sm font-bold text-rose-400">Ngày này bác sĩ đã hết lịch trống</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
                  {timeSlots.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedTimeSlotId(slot.id)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                        selectedTimeSlotId === slot.id
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-100 bg-white text-slate-600 hover:border-slate-300"
                      )}
                    >
                      <span className="text-sm font-black">{slot.startTime.substring(0, 5)}</span>
                      {selectedTimeSlotId === slot.id && <Check size={16} />}
                      {slot.id === appointment.timeSlotId && (
                        <span className="text-[8px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-black uppercase">Hiện tại</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Summary */}
              {selectedTimeSlotId && (
                <div className="mt-auto pt-6 border-t border-slate-100 mt-6">
                  <div className="bg-indigo-600/5 rounded-2xl p-4 border border-indigo-100">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Tóm tắt điều chỉnh</p>
                    <p className="text-sm font-bold text-slate-700">
                      Chuyển sang <span className="text-indigo-600">BS. {doctors.find(d => d.id === selectedDoctorId)?.fullName}</span>
                    </p>
                    <p className="text-sm font-bold text-slate-700 mt-1">
                      Thời gian: <span className="text-indigo-600">{formatDate(selectedDate)} - {timeSlots.find(s => s.id === selectedTimeSlotId)?.startTime.substring(0, 5)}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-6 flex gap-4 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
            disabled={submitting}
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedTimeSlotId}
            className="flex-[2] px-6 py-3.5 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Đang lưu thay đổi...
              </>
            ) : (
              'Xác nhận điều chỉnh'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReassignAppointmentModal;
