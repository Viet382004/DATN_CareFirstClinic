import React, { useState, useEffect } from 'react';
import type { CreateAppointmentDTO } from '../../../types/appointment';
import { patientService } from '../../../services/patientService';
import type { Patient } from '../../../types/patient';
import { doctorService } from '../../../services/doctorService';
import type { Doctor } from '../../../types/doctor';
import { scheduleService } from '../../../services/scheduleService';
import type { TimeSlot } from '../../../types/schedule';
import { appointmentService } from '../../../services/appointmentService';
import { paymentService } from '../../../services/paymentService';
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
  Check,
  CreditCard,
  Wallet,
  Loader2,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';
import { SERVICE_TYPE_OPTIONS, type ServiceTypeOption } from '../../../constants/serviceTypes';

const steps = ['Thông tin bệnh nhân', 'Chọn dịch vụ & thời gian', 'Thanh toán', 'Hoàn tất'];

// ⭐ Interface cho dịch vụ khám
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
  const mapGender = (
    gender: string
  ): 'Male' | 'Female' | 'Other' => {
    switch (gender) {
      case 'Nam':
        return 'Male';
      case 'Nữ':
        return 'Female';
      default:
        return 'Other';
    }
  };

  // Step 2: Booking Data
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // ⭐ Step 3: Payment Data
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'VNPay'>('Cash');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<any>(null);

  // ⭐ Service list (có thể fetch từ API hoặc hardcode)
  const services = [...SERVICE_TYPE_OPTIONS];
  const [selectedService, setSelectedService] = useState<ServiceTypeOption | null>(services[0]);

  useEffect(() => {
    // Không cần fetch chuyên khoa ở luồng tại quầy nữa
  }, []);

  // Fetch clinical doctors on mount or when service changes
  useEffect(() => {
    let ignore = false;

    const fetchDoctors = async () => {
      setLoading(true);
      try {
        // Fetch all clinical doctors (isClinical: true) like in online booking
        const res = await doctorService.getList({ isClinical: true, page: 1, pageSize: 100 });
        if (!ignore) {
          setDoctors(res.items);
        }
      } catch (error) {
        toast.error('Lỗi khi lấy danh sách bác sĩ');
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchDoctors();
    setSelectedDoctor('');
    setSelectedSlot('');

    return () => {
      ignore = true;
    };
  }, [selectedService]); // Re-fetch if service changes, though usually it just affects metadata

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
        setPatientForm(prev => ({
          ...prev,
          phoneNumber: searchPhone
        })); toast.info('Số điện thoại mới. Vui lòng nhập thông tin đăng ký.');
      }
    } catch (error) {
      toast.error('Lỗi khi tìm kiếm bệnh nhân');
    } finally {
      setLoading(false);
    }
  };

  // WalkInBooking.tsx - Sửa hàm createAppointmentOnly
  const createAppointmentOnly = async (): Promise<any> => {
    let patientId = selectedPatient?.id;

    if (isNewPatient) {
      const emailToUse = patientForm.email || `${patientForm.phoneNumber}@carefirst.clinic`;
      const regRes = await authService.register({
        ...patientForm,
        email: emailToUse,
        password: patientForm.phoneNumber,
        phoneNumber: patientForm.phoneNumber,
        dateOfBirth: patientForm.dateOfBirth,
        gender: mapGender(patientForm.gender),
        address: patientForm.address,
      });

      if (regRes.patientId) {
        patientId = regRes.patientId;
        toast.success('Đã tạo tài khoản cho bệnh nhân mới.');
      } else {
        const allPatients = await patientService.getAll();
        const newPatient = allPatients.find(p => p.phoneNumber === patientForm.phoneNumber);
        patientId = newPatient?.id;
      }
    }

    if (!patientId) {
      throw new Error('Không thể xác định ID bệnh nhân');
    }

    const appointmentData: CreateAppointmentDTO = {
      timeSlotId: selectedSlot,
      reason: `Đăng ký trực tiếp tại quầy - Dịch vụ: ${selectedService?.name || 'Khám bệnh'}`,
      notes: `Tổng tiền: ${(selectedService?.consultationFee || 0).toLocaleString()}đ`,
      fullName: selectedPatient?.fullName || patientForm.fullName,
      dob: selectedPatient?.dateOfBirth || patientForm.dateOfBirth,
      gender: selectedPatient?.gender || patientForm.gender,
      phone: selectedPatient?.phoneNumber || patientForm.phoneNumber,
      email: selectedPatient?.userEmail || patientForm.email,
      serviceName: selectedService?.name,
      consultationFee: selectedService?.consultationFee || 0
    };

    try {
      const result = await appointmentService.createByAdmin(patientId, appointmentData);
      return result.data;
    } catch (error: any) {
      // ⭐ XỬ LÝ LỖI 409 - LỊCH HẸN ĐÃ TỒN TẠI
      if (error.status === 409) {
        toast.info('Lịch hẹn đã tồn tại, đang lấy thông tin...');

        // Tìm appointment đã có trong time slot này
        const appointments = await appointmentService.getList({
          patientId: patientId,
          page: 1,
          pageSize: 5
        });

        const existingAppointment = appointments.items?.find(
          (a: any) => a.timeSlotId === selectedSlot
        );

        if (existingAppointment) {
          return existingAppointment;
        }
      }
      throw error;
    }
  };

  // ⭐ Xử lý thanh toán tiền mặt
  const handleCashPayment = async (appointment: any) => {
    const patientId = selectedPatient?.id || appointment.patientId;

    if (!patientId) {
      toast.error('Không xác định được bệnh nhân');
      throw new Error('PatientId is missing');
    }

    try {
      const created = await paymentService.create({
        appointmentId: appointment.id,
        patientId,
        amount: selectedService?.consultationFee || 0,
        type: 'ConsultationFee',
        method: 'Cash',
        notes: `Thanh toán tiền mặt tại quầy - ${selectedService?.name}`
      });

      const payment = (created as any)?.data ?? created;
      if (!payment?.id) {
        throw new Error('Không lấy được thông tin thanh toán vừa tạo.');
      }

      await paymentService.complete(payment.id);

      // ⭐ LUỒNG DẮT BÁC SĨ LÂM SÀNG: Sau khi thanh toán tiền mặt, tự động Check-in (Waiting)
      try {
        await appointmentService.toWaiting(appointment.id);
        toast.success('Thanh toán thành công & Bệnh nhân đã được đưa vào hàng đợi khám!');
      } catch (checkinError) {
        console.error('Check-in error:', checkinError);
        toast.success('Thanh toán thành công, lịch hẹn đã được xác nhận!');
      }

      setCurrentStep(3);
    } catch (error: any) {
      const msg = error?.message || error?.data?.message || 'Lỗi khi thanh toán tiền mặt';
      toast.error(msg);
      throw error;
    }
  };

  // ⭐ Xử lý thanh toán VNPay
  const handleVNPayPayment = async (appointment: any) => {
    const patientId = selectedPatient?.id || appointment.patientId;

    if (!patientId) {
      toast.error('Không xác định được bệnh nhân');
      throw new Error('PatientId is missing');
    }

    try {
      const result = await paymentService.createVNPayConsultationByAdmin(appointment.id, patientId);

      if (result.success && result.data?.paymentUrl) {
        sessionStorage.setItem('pendingAppointmentId', appointment.id);
        sessionStorage.setItem('pendingOrderId', result.data.orderId);
        sessionStorage.setItem('isAdminBooking', 'true');

        sessionStorage.setItem(
          'bookingSummary',
          JSON.stringify({
            patientName: selectedPatient?.fullName || patientForm.fullName,
            doctorName: doctors.find(d => d.id === selectedDoctor)?.fullName,
            serviceName: selectedService?.name,
            date: selectedDate,
            slot: slots.find(s => s.id === selectedSlot)?.startTime
          })
        );

        window.location.href = result.data.paymentUrl;
      } else {
        toast.error(result.message || 'Không thể tạo link thanh toán VNPay');
        throw new Error(result.message);
      }
    } catch (error: any) {
      const msg = error?.message || error?.data?.message || 'Lỗi khi tạo thanh toán VNPay';
      toast.error(msg);
      throw error;
    }
  };

  // Tạo lịch hẹn và xử lý thanh toán
  const handleCreateAndPayment = async () => {
    if (!selectedSlot) {
      toast.error('Vui lòng chọn ca khám');
      return;
    }

    if (!selectedService) {
      toast.error('Vui lòng chọn dịch vụ khám');
      return;
    }

    setPaymentProcessing(true);
    try {
      // 1. Tạo lịch hẹn
      const appointment = await createAppointmentOnly();
      setCreatedAppointment(appointment);

      // 2. Xử lý thanh toán theo phương thức
      if (paymentMethod === 'Cash') {
        await handleCashPayment(appointment);
      } else {
        await handleVNPayPayment(appointment);
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      // Nếu lỗi, không chuyển step
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Kiểm tra trạng thái thanh toán khi quay lại từ VNPay
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const pendingOrderId = sessionStorage.getItem('pendingOrderId');
      const pendingAppointmentId = sessionStorage.getItem('pendingAppointmentId');
      const orderId = new URLSearchParams(window.location.search).get('orderId');
      if (pendingOrderId && pendingAppointmentId && orderId === pendingOrderId) {
        try {
          const status = await paymentService.getPaymentStatus(pendingOrderId);
          if (status.status === 'Completed') {
            sessionStorage.removeItem('pendingOrderId');
            sessionStorage.removeItem('pendingAppointmentId');

            // ⭐ LUỒNG DẮT BÁC SĨ LÂM SÀNG: Sau khi VNPay thành công, tự động Check-in (Waiting)
            try {
              await appointmentService.toWaiting(pendingAppointmentId);
              toast.success('Thanh toán VNPay thành công & Bệnh nhân đã được đưa vào hàng đợi khám!');
            } catch (checkinError) {
              toast.success('Thanh toán VNPay thành công!');
            }

            setCurrentStep(3);
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      }
    };

    checkPaymentStatus();
  }, []);

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
            {isNewPatient ? '📚 Đăng ký tài khoản mới' : '✅ Thông tin bệnh nhân'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Form fields - giữ nguyên như cũ */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Họ và tên</label>
              <input
                type="text"
                disabled={!isNewPatient}
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
                className="w-full rounded-md border border-slate-200 p-2.5 text-sm focus:ring-1 focus:ring-indigo-600 outline-none disabled:bg-slate-50 font-bold text-slate-700"
                value={isNewPatient ? patientForm.gender : selectedPatient?.gender || 'Nam'}
                onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
              <input
                type="email"
                disabled={!isNewPatient}
                className="w-full rounded-md border border-slate-200 p-2.5 text-sm focus:ring-1 focus:ring-indigo-600 outline-none disabled:bg-slate-50 font-bold text-slate-700"
                value={isNewPatient ? patientForm.email : selectedPatient?.userEmail || ''}
                onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Địa chỉ</label>
              <input
                type="text"
                disabled={!isNewPatient}
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
              className="px-10 py-3 rounded-md bg-indigo-600 text-[11px] font-black uppercase text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Doctor Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                <User className="h-4 w-4 text-indigo-600" />
                1. Chọn Bác sĩ lâm sàng
              </h3>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {doctors.length} bác sĩ sẵn sàng
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {doctors.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDoctor(d.id)}
                  className={`group relative flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${selectedDoctor === d.id ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-600/5' : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'}`}
                >
                  <div className="h-14 w-14 rounded-2xl bg-slate-100 flex-shrink-0 flex items-center justify-center border border-slate-200 group-hover:scale-105 transition-transform">
                    {d.avatarUrl ? (
                      <img src={d.avatarUrl} alt={d.fullName} className="h-full w-full object-cover rounded-2xl" />
                    ) : (
                      <User className="h-7 w-7 text-slate-300" />
                    )}
                  </div>
                  {selectedDoctor === d.id && (
                    <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <div>
                    <p className="font-black text-slate-900 text-sm leading-tight">{d.fullName}</p>
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">
                      {d.academicTitle || 'Bác sĩ'}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{d.specialtyName || 'Đa khoa'}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tight">
              <CreditCard className="h-4 w-4 text-indigo-600" />
              2. Chọn loại hình thăm khám
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {services.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedService(s)}
                  className={`relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all ${selectedService?.id === s.id ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-600/5' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
                >
                  <p className="font-black text-slate-900 text-xs uppercase tracking-tight">{s.name}</p>
                  <p className="mt-2 font-black text-indigo-600 text-base">{s.consultationFee.toLocaleString()}đ</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Time Slot Selection */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-full flex flex-col">
            <h3 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tight">
              <Clock className="h-4 w-4 text-indigo-600" />
              3. Chọn Giờ khám
            </h3>

            {!selectedDoctor ? (
              <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-slate-300" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                  Vui lòng chọn bác sĩ lâm sàng<br />để xem lịch khả dụng
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {slots.map(s => {
                  const now = new Date();
                  const [hours, minutes] = s.startTime.split(':').map(Number);
                  const slotDate = new Date(selectedDate);
                  slotDate.setHours(hours, minutes, 0, 0);
                  
                  const isPast = slotDate <= now;
                  const isSelectable = !s.isBooked && !isPast;
                  const isSelected = selectedSlot === s.id;

                  return (
                    <button
                      key={s.id}
                      disabled={!isSelectable}
                      onClick={() => setSelectedSlot(s.id)}
                      className={cn(
                        "relative rounded-xl border-2 py-4 px-4 text-center text-sm font-black transition-all",
                        isSelected 
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100 scale-105 z-10" 
                          : isSelectable
                            ? "bg-white text-slate-600 border-slate-100 hover:border-indigo-200 hover:text-indigo-600 hover:translate-y-[-2px]"
                            : "bg-slate-50 text-slate-300 border-slate-50 cursor-not-allowed opacity-40 grayscale"
                      )}
                    >
                      {s.startTime.substring(0, 5)}
                      {s.isBooked && (
                        <div className="absolute top-1 right-1">
                          <XCircle className="h-3 w-3 text-red-400" />
                        </div>
                      )}
                      {isPast && !s.isBooked && (
                        <div className="absolute top-1 right-1">
                          <Clock className="h-3 w-3 text-slate-300" />
                        </div>
                      )}
                    </button>
                  );
                })}
                {slots.length === 0 && (
                  <div className="col-span-full text-center py-20 px-4">
                    <Clock className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Bác sĩ chưa có lịch hẹn nào trong ngày</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Step 2: Thanh toán
  const renderStep2 = () => {
    const totalAmount = selectedService?.consultationFee || 0;

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-300">
        {/* Thông tin lịch hẹn */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-tight">Thông tin lịch hẹn</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Bệnh nhân:</span>
              <span className="font-bold text-slate-800">{selectedPatient?.fullName || patientForm.fullName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Bác sĩ:</span>
              <span className="font-bold text-slate-800">{doctors.find(d => d.id === selectedDoctor)?.fullName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Dịch vụ:</span>
              <span className="font-bold text-slate-800">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Thời gian:</span>
              <span className="font-bold text-slate-800">
                {new Date(selectedDate).toLocaleDateString('vi-VN')} - {slots.find(s => s.id === selectedSlot)?.startTime}
              </span>
            </div>
            <div className="flex justify-between py-3 bg-slate-50 rounded-lg px-4 -mx-1">
              <span className="font-bold text-slate-800">Tổng tiền:</span>
              <span className="text-2xl font-black text-indigo-600">{totalAmount.toLocaleString()}đ</span>
            </div>
          </div>
        </div>

        {/* Phương thức thanh toán */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-tight">Phương thức thanh toán</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPaymentMethod('Cash')}
              className={cn(
                "flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all",
                paymentMethod === 'Cash'
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              <Wallet size={20} />
              <span className="font-bold">Tiền mặt</span>
            </button>
            <button
              onClick={() => setPaymentMethod('VNPay')}
              className={cn(
                "flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all",
                paymentMethod === 'VNPay'
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              <CreditCard size={20} />
              <span className="font-bold">VNPay</span>
            </button>
          </div>

          {paymentMethod === 'VNPay' && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                🔄 Bạn sẽ được chuyển đến cổng thanh toán VNPay. Sau khi thanh toán thành công,
                lịch hẹn sẽ được xác nhận tự động.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setCurrentStep(1)}
            className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
          >
            Quay lại
          </button>
          <button
            onClick={handleCreateAndPayment}
            disabled={paymentProcessing}
            className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {paymentProcessing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Đang xử lý...
              </>
            ) : (
              `Thanh toán ${totalAmount.toLocaleString()}đ`
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="max-w-md mx-auto py-12 text-center animate-in zoom-in duration-500">
      <div className="mb-6 flex justify-center">
        <div className="h-20 w-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
          <CheckCircle2 className="h-12 w-12" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-slate-900">Đặt lịch thành công!</h2>
      <p className="mt-2 text-slate-500">
        Lịch hẹn đã được xác nhận. {isNewPatient && 'Mật khẩu mặc định là số điện thoại.'}
      </p>

      <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50/50 p-6 space-y-4 text-left">
        <div className="flex justify-between">
          <span className="text-xs font-bold text-slate-400">Bệnh nhân</span>
          <span className="text-sm font-bold text-slate-900">{selectedPatient?.fullName || patientForm.fullName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs font-bold text-slate-400">Dịch vụ</span>
          <span className="text-sm font-bold text-slate-900">{selectedService?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs font-bold text-slate-400">Bác sĩ</span>
          <span className="text-sm font-bold text-slate-900">{doctors.find(d => d.id === selectedDoctor)?.fullName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs font-bold text-slate-400">Thời gian</span>
          <span className="text-sm font-bold text-slate-900">
            {new Date(selectedDate).toLocaleDateString('vi-VN')} - {slots.find(s => s.id === selectedSlot)?.startTime}
          </span>
        </div>
        <div className="flex justify-between pt-2 border-t border-white">
          <span className="text-xs font-bold text-slate-400">Thanh toán</span>
          <span className="text-sm font-bold text-emerald-600">
            {paymentMethod === 'Cash' ? '💰 Tiền mặt tại quầy' : '💳 VNPay'}
          </span>
        </div>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="mt-10 w-full rounded-xl bg-slate-900 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800"
      >
        Tiếp nhận bệnh nhân mới
      </button>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between flex-wrap gap-4">
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
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </button>
      )}

      {currentStep === 0 && renderStep0()}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {/* Nút chuyển từ step 1 sang step 2 */}
      {currentStep === 1 && selectedSlot && selectedService && (
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setCurrentStep(2)}
            className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 flex items-center gap-2"
          >
            Tiếp tục thanh toán
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default WalkInBooking;


