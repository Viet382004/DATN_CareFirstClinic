import React, { useState, useEffect } from 'react';
import type { CreateAppointmentDTO } from '../../../types/appointment';
import { patientService } from '../../../services/patientService';
import type { Patient } from '../../../types/patient';
import { specialtyService } from '../../../services/specialtyService';
import type { Specialty } from '../../../types/specialty';
import { doctorService } from '../../../services/doctorService';
import type { Doctor } from '../../../types/doctor';
import { scheduleService } from '../../../services/scheduleService';
import type { TimeSlot } from '../../../types/schedule';
import { appointmentService } from '../../../services/appointmentService';
import { authService } from '../../../services/authService';
import {
  Search,
  UserPlus,
  Calendar,
  ChevronRight,
  CheckCircle2,
  User,
  Stethoscope,
  Clock,
  ArrowLeft,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

const steps = ['Thông tin bệnh nhân', 'Chọn dịch vụ & thời gian', 'Hoàn tất'];

const WalkInBooking: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 1: Patient Data
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [patientForm, setPatientForm] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'Nam',
    phoneNumber: '',
    email: '',
    address: ''
  });

  // Step 2: Booking Data
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    specialtyService.getAll().then(setSpecialties);
  }, []);

  useEffect(() => {
    if (selectedSpecialty) {
      doctorService.getBySpecialty(selectedSpecialty).then(res => setDoctors(res.items));
      setSelectedDoctor('');
      setSelectedSlot('');
    }
  }, [selectedSpecialty]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      scheduleService.getAvailableByDoctorAndDate(selectedDoctor, selectedDate)
        .then(schedules => {
          const mappedSlots: TimeSlot[] = schedules.flatMap(schedule =>
            schedule.timeSlots.map(slot => ({
              id: slot.id,
              startTime: slot.startTime,
              endTime: slot.endTime,
              isBooked: slot.isBooked ?? false,
            }))
          );
          setSlots(mappedSlots);
        });
      setSelectedSlot('');
    }
  }, [selectedDoctor, selectedDate]);


  const handleSearchPatient = async () => {
    if (!searchPhone) return;
    setLoading(true);
    try {
      const allPatients = await patientService.getAll();
      const patient = allPatients.find(p => p.phoneNumber === searchPhone);
      if (patient) {
        setSelectedPatient(patient);
        setIsNewPatient(false);
        toast.success(`Tìm thấy bệnh nhân: ${patient.fullName}`);
      } else {
        setSelectedPatient(null);
        setIsNewPatient(true);
        setPatientForm({ ...patientForm, phoneNumber: searchPhone });
        toast.info('Số điện thoại mới. Vui lòng nhập thông tin đăng ký.');
      }
    } catch (error) {
      toast.error('Lỗi khi tìm kiếm bệnh nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndBook = async () => {
    if (!selectedSlot) {
      toast.error('Vui lòng chọn ca khám');
      return;
    }

    setLoading(true);
    try {
      let patientId = selectedPatient?.id;

      // 1. Register if new
      if (isNewPatient) {
        // Use phone number as part of dummy email if not provided
        const emailToUse = patientForm.email || `${patientForm.phoneNumber}@carefirst.clinic`;

        const regRes = await authService.register({
          ...patientForm,
          email: emailToUse,
          password: patientForm.phoneNumber,
          phoneNumber: patientForm.phoneNumber,
          dateOfBirth: patientForm.dateOfBirth,
          gender: patientForm.gender as 'Male' | 'Female' | 'Other',
          address: patientForm.address,
        });

        if (regRes.patientId) {
          patientId = regRes.patientId;
          toast.success('Hệ thống đã tự động tạo tài khoản cho bệnh nhân mới.');
        } else {
          // Fallback if backend didn't return ID (shouldn't happen now)
          const allPatients = await patientService.getAll();
          const newPatient = allPatients.find(p => p.phoneNumber === patientForm.phoneNumber);
          patientId = newPatient?.id;
        }
      }

      if (!patientId) {
        throw new Error('Không thể xác định ID bệnh nhân để tạo lịch hẹn');
      }

      // 2. Create Appointment
      const appointment: CreateAppointmentDTO = {
        fullName: selectedPatient.fullName,
        dob: selectedPatient.dateOfBirth,
        gender: selectedPatient.gender,
        phone: selectedPatient.phoneNumber,
        timeSlotId: selectedSlot,
        reason: 'Đăng ký trực tiếp tại quầy (Admin)',
      };

      await appointmentService.create(appointment);
      setCurrentStep(2);
      toast.success('Đã hoàn tất đặt lịch hẹn!');


      setCurrentStep(2);
      toast.success('Đã hoàn tất đặt lịch hẹn!');
    } catch (error: any) {
      console.error('Walk-in booking error:', error);
      toast.error(error.message || 'Lỗi khi xử lý đặt lịch');
    } finally {
      setLoading(false);
    }
  };

  const renderStep0 = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-tight">
          <Search className="h-4 w-4 text-indigo-600" />
          Tiếp nhận & Kiểm tra thông tin
        </h3>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <User className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Nhập chính xác số điện thoại bệnh nhân..."
              className="w-full rounded-md border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-indigo-600 outline-none transition-all"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchPatient()}
            />
          </div>
          <button
            onClick={handleSearchPatient}
            disabled={loading}
            className="rounded-md bg-slate-800 px-6 py-2.5 text-xs font-black uppercase text-white transition-all hover:bg-slate-900 shadow-sm disabled:opacity-50"
          >
            {loading ? 'Đang kiểm tra...' : 'Kiểm tra hồ sơ'}
          </button>
        </div>
      </div>

      {(selectedPatient || isNewPatient) && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm animate-in fade-in duration-500">
          <h3 className="text-sm font-black text-slate-800 mb-6 uppercase tracking-tight">
            {isNewPatient ? '📚 Đăng ký tài khoản mới' : '✅ Thông tin bệnh nhân hồ sơ'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Họ và tên</label>
              <input
                type="text"
                disabled={!isNewPatient}
                placeholder="Nguyễn Văn A"
                className="w-full rounded-md border border-slate-200 p-2.5 text-sm focus:ring-1 focus:ring-indigo-600 outline-none disabled:bg-slate-50 font-bold text-slate-700"
                value={isNewPatient ? patientForm.fullName : selectedPatient?.fullName || ''}
                onChange={(e) => setPatientForm({ ...patientForm, fullName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Số điện thoại</label>
              <input
                type="text"
                disabled
                className="w-full rounded-md border border-slate-200 p-2.5 text-sm bg-slate-50 font-bold text-slate-400"
                value={isNewPatient ? patientForm.phoneNumber : selectedPatient?.phoneNumber || ''}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày sinh</label>
              <input
                type="date"
                disabled={!isNewPatient}
                className="w-full rounded-md border border-slate-200 p-2.5 text-sm focus:ring-1 focus:ring-indigo-600 outline-none disabled:bg-slate-50 font-bold text-slate-700"
                value={isNewPatient ? patientForm.dateOfBirth : selectedPatient?.dateOfBirth?.split('T')[0] || ''}
                onChange={(e) => setPatientForm({ ...patientForm, dateOfBirth: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Giới tính</label>
              <select
                disabled={!isNewPatient}
                className="w-full rounded-md border border-slate-200 p-2.5 text-sm focus:ring-1 focus:ring-indigo-600 outline-none disabled:bg-slate-50 font-bold text-slate-700 appearance-none"
                value={isNewPatient ? patientForm.gender : selectedPatient?.gender || 'Nam'}
                onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email liên hệ</label>
              <input
                type="email"
                disabled={!isNewPatient}
                placeholder="bn@carefirst.clinic"
                className="w-full rounded-md border border-slate-200 p-2.5 text-sm focus:ring-1 focus:ring-indigo-600 outline-none disabled:bg-slate-50 font-bold text-slate-700"
                value={isNewPatient ? patientForm.email : selectedPatient?.email || ''}
                onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Địa chỉ thường trú</label>
              <input
                type="text"
                disabled={!isNewPatient}
                placeholder="Số nhà, đường, Phường/Xã..."
                className="w-full rounded-md border border-slate-200 p-2.5 text-sm focus:ring-1 focus:ring-indigo-600 outline-none disabled:bg-slate-50 font-bold text-slate-700"
                value={isNewPatient ? patientForm.address : selectedPatient?.address || ''}
                onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setCurrentStep(1)}
              disabled={isNewPatient ? !patientForm.fullName || !patientForm.dateOfBirth : !selectedPatient}
              className="px-10 py-3 rounded-md bg-indigo-600 text-[11px] font-black uppercase text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed tracking-widest"
            >
              Tiếp tục bước chọn lịch & dịch vụ
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep1 = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-right-4 duration-300">
      {/* Specialty */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-indigo-600" />
          1. Chuyên khoa
        </label>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {specialties.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSpecialty(s.id)}
              className={`w-full rounded-xl border p-4 text-left transition-all ${selectedSpecialty === s.id ? 'border-indigo-600 bg-indigo-50 shadow-md ring-2 ring-indigo-600/10' : 'border-slate-100 bg-white hover:border-slate-200'}`}
            >
              <p className="font-bold text-slate-900">{s.name}</p>
              <p className="mt-1 text-xs text-slate-500 line-clamp-1">{s.description || 'Chưa có thông tin'}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Doctor */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <User className="h-4 w-4 text-indigo-600" />
          2. Bác sĩ
        </label>
        {!selectedSpecialty ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center bg-slate-50">
            <p className="text-xs font-semibold text-slate-400">Vui lòng chọn chuyên khoa trước</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {doctors.map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDoctor(d.id)}
                className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${selectedDoctor === d.id ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-100 bg-white hover:border-slate-200'}`}
              >
                <div className="h-10 w-10 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center">
                  <User className="h-6 w-6 text-slate-300" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{d.fullName}</p>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-tighter">{d.academicTitle}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Slots */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="h-4 w-4 text-indigo-600" />
          3. Giờ khám (Hôm nay)
        </label>
        {!selectedDoctor ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center bg-slate-50">
            <p className="text-xs font-semibold text-slate-400">Vui lòng chọn bác sĩ trước</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {slots.filter(s => !s.isBooked).map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSlot(s.id)}
                className={`rounded-lg border py-2 px-3 text-center text-xs font-bold transition-all ${selectedSlot === s.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:text-indigo-600'}`}
              >
                {s.startTime.substring(0, 5)}
              </button>
            ))}
            {slots.filter(s => !s.isBooked).length === 0 && (
              <p className="col-span-2 text-center py-10 text-xs font-semibold text-slate-400 italic">Đã hết slot khả dụng hôm nay</p>
            )}
          </div>
        )}

        {selectedSlot && (
          <button
            onClick={handleCreateAndBook}
            disabled={loading}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 transition-all hover:bg-indigo-700 active:scale-95"
          >
            {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Check className="h-5 w-5" />}
            Xác nhận & Đặt ngay
          </button>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-md mx-auto py-12 text-center animate-in zoom-in duration-500">
      <div className="mb-6 flex justify-center">
        <div className="h-20 w-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
          <CheckCircle2 className="h-12 w-12" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-slate-900">Đặt lịch thành công!</h2>
      <p className="mt-2 text-slate-500">Thông tin đăng ký đã được lưu vào hệ thống. {isNewPatient && 'Mật khẩu mặc định của bệnh nhân là số điện thoại.'}</p>

      <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50/50 p-6 space-y-4 text-left">
        <div className="flex justify-between border-b border-white pb-3">
          <span className="text-xs font-bold text-slate-400 uppercase">Bệnh nhân</span>
          <span className="text-sm font-bold text-slate-900">{isNewPatient ? patientForm.fullName : selectedPatient?.fullName}</span>
        </div>
        <div className="flex justify-between border-b border-white pb-3">
          <span className="text-xs font-bold text-slate-400 uppercase">Chuyên khoa</span>
          <span className="text-sm font-bold text-slate-900">{specialties.find(s => s.id === selectedSpecialty)?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase">Bác sĩ</span>
          <span className="text-sm font-bold text-slate-900">{doctors.find(d => d.id === selectedDoctor)?.fullName}</span>
        </div>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="mt-10 w-full rounded-xl bg-slate-900 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800"
      >
        Tiếp tục tiếp nhận BN mới
      </button>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Đặt lịch tại quầy</h1>
          <p className="mt-1 text-slate-500">Tiếp nhận bệnh nhân đến trực tiếp tại phòng khám.</p>
        </div>
        <div className="flex items-center gap-2">
          {steps.map((step, idx) => (
            <React.Fragment key={step}>
              <div className={`flex items-center gap-2 ${idx <= currentStep ? 'text-indigo-600' : 'text-slate-300'}`}>
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${idx <= currentStep ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {idx + 1}
                </div>
                <span className="text-xs font-bold hidden sm:inline">{step}</span>
              </div>
              {idx < steps.length - 1 && <ChevronRight className="h-4 w-4 text-slate-200" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {currentStep > 0 && currentStep < 2 && (
        <button
          onClick={() => setCurrentStep(currentStep - 1)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại bước trước
        </button>
      )}

      {currentStep === 0 && renderStep0()}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
    </div>
  );
};

export default WalkInBooking;
