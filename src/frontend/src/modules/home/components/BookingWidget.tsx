import { useState } from "react";
import { useForm } from "react-hook-form";
import { Calendar, User, Phone, Clock, Stethoscope, FileText, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

type FormData = {
  fullName: string;
  phone: string;
  specialty: string;
  doctor: string;
  date: string;
  time: string;
  notes: string;
  smsReminder: boolean;
};

const specialties = ["Nội Tim Mạch", "Nhi Khoa", "Cơ Xương Khớp", "Nội Thần Kinh", "Nội Tổng Quát", "Khám Sức Khỏe Định Kỳ"];
const doctorsBySpecialty: Record<string, string[]> = {
  "Nội Tim Mạch": ["PGS.TS.BS Nguyễn Thị Lan", "BS.CKII Phạm Minh Tuấn"],
  "Nhi Khoa": ["TS.BS Phạm Hoàng Yến", "ThS.BS Lê Trung Kiên"],
  "Cơ Xương Khớp": ["BS.CKII Lê Minh Quân", "ThS.BS Trần Hữu Khang"],
  "Nội Thần Kinh": ["ThS.BS Trần Hữu Khang", "BS.CKII Vũ Thị Bích"],
  "Nội Tổng Quát": ["BS.CKII Nguyễn Văn An", "ThS.BS Trần Thị Thu"],
  "Khám Sức Khỏe Định Kỳ": ["BS.CKI Lê Văn Hùng", "BS Phạm Thị Nga"],
};

export function BookingWidget() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { smsReminder: true }
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const selectedSpecialty = watch("specialty");

  // Calculate min and max dates (today to 30 days from now)
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 30);
  const minDateString = today.toISOString().split("T")[0];
  const maxDateString = maxDate.toISOString().split("T")[0];

const onSubmit = (data: FormData) => {
  console.log(data); 
  setTimeout(() => {
    setIsSuccess(true);
  }, 500);
};

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center py-12 px-6"
      >
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Đặt Lịch Thành Công!</h3>
        <p className="text-slate-600 mb-8 max-w-sm">
          Chi tiết lịch khám đã được gửi đến số điện thoại của bạn qua SMS. Cảm ơn bạn đã tin tưởng MediCare+.
        </p>
        
        <div className="bg-slate-50 w-full rounded-2xl p-6 mb-8 text-left border border-slate-100">
          <h4 className="font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Tóm tắt lịch hẹn</h4>
          <div className="space-y-3 text-sm text-slate-700">
            <div className="flex items-center gap-3"><User className="w-4 h-4 text-teal-600"/> <span className="font-medium w-24">Bệnh nhân:</span> {watch("fullName")}</div>
            <div className="flex items-center gap-3"><Stethoscope className="w-4 h-4 text-teal-600"/> <span className="font-medium w-24">Dịch vụ:</span> {watch("specialty")} - {watch("doctor")}</div>
            <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-teal-600"/> <span className="font-medium w-24">Ngày khám:</span> {watch("date")}</div>
            <div className="flex items-center gap-3"><Clock className="w-4 h-4 text-teal-600"/> <span className="font-medium w-24">Giờ khám:</span> {watch("time")}</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <button className="flex-1 py-3 px-6 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium transition-colors text-sm flex items-center justify-center gap-2">
             <Calendar className="w-4 h-4" /> Thêm vào Google Calendar
          </button>
          <button 
            onClick={() => setIsSuccess(false)}
            className="flex-1 py-3 px-6 border-2 border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-colors text-sm"
          >
            Đặt lịch khác
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Full Name */}
        <div className="space-y-1 relative">
          <label className="text-sm font-medium text-slate-700 block">Họ và tên <span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className={`block w-full pl-10 pr-3 py-3 border ${errors.fullName ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'} rounded-xl leading-5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-slate-800 shadow-sm`}
              placeholder="Nguyễn Văn A"
              {...register("fullName", { required: "Vui lòng nhập họ tên" })}
            />
          </div>
          {errors.fullName && <p className="text-red-500 text-xs mt-1 absolute -bottom-5">{errors.fullName.message}</p>}
        </div>

        {/* Phone Number */}
        <div className="space-y-1 relative">
          <label className="text-sm font-medium text-slate-700 block">Số điện thoại <span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="tel"
              className={`block w-full pl-10 pr-3 py-3 border ${errors.phone ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'} rounded-xl leading-5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-slate-800 shadow-sm`}
              placeholder="090xxxxxxx"
              {...register("phone", { 
                required: "Vui lòng nhập số điện thoại",
                pattern: { value: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ" }
              })}
            />
          </div>
          {errors.phone && <p className="text-red-500 text-xs mt-1 absolute -bottom-5">{errors.phone.message}</p>}
        </div>

        {/* Specialty */}
        <div className="space-y-1 relative mt-2 md:mt-0">
          <label className="text-sm font-medium text-slate-700 block">Chuyên khoa <span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Stethoscope className="h-5 w-5 text-slate-400" />
            </div>
            <select
              className={`block w-full pl-10 pr-10 py-3 border ${errors.specialty ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'} rounded-xl leading-5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-slate-800 shadow-sm appearance-none`}
              {...register("specialty", { required: "Vui lòng chọn chuyên khoa" })}
              defaultValue=""
            >
              <option value="" disabled>Chọn chuyên khoa</option>
              {specialties.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
          {errors.specialty && <p className="text-red-500 text-xs mt-1 absolute -bottom-5">{errors.specialty.message}</p>}
        </div>

        {/* Doctor */}
        <div className="space-y-1 relative mt-2 md:mt-0">
          <label className="text-sm font-medium text-slate-700 block">Bác sĩ (Tùy chọn)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <select
              className={`block w-full pl-10 pr-10 py-3 border border-slate-200 bg-white rounded-xl leading-5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-slate-800 shadow-sm appearance-none disabled:bg-slate-50 disabled:text-slate-400`}
              {...register("doctor")}
              disabled={!selectedSpecialty}
              defaultValue=""
            >
              <option value="" disabled>Chọn bác sĩ (nếu cần)</option>
              {selectedSpecialty && doctorsBySpecialty[selectedSpecialty]?.map(doc => (
                <option key={doc} value={doc}>{doc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date */}
        <div className="space-y-1 relative mt-2 md:mt-0">
          <label className="text-sm font-medium text-slate-700 block">Ngày khám <span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="date"
              min={minDateString}
              max={maxDateString}
              className={`block w-full pl-10 pr-3 py-3 border ${errors.date ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'} rounded-xl leading-5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-slate-800 shadow-sm`}
              {...register("date", { required: "Vui lòng chọn ngày khám" })}
            />
          </div>
          {errors.date && <p className="text-red-500 text-xs mt-1 absolute -bottom-5">{errors.date.message}</p>}
        </div>

        {/* Time */}
        <div className="space-y-1 relative mt-2 md:mt-0">
          <label className="text-sm font-medium text-slate-700 block">Khung giờ <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            {[
              { id: "morning", label: "Sáng", sub: "8-12h" },
              { id: "afternoon", label: "Chiều", sub: "13-17h" },
              { id: "evening", label: "Tối", sub: "17-20h" }
            ].map(slot => (
              <div key={slot.id} className="flex-1 relative">
                <input
                  type="radio"
                  id={slot.id}
                  value={slot.label}
                  className="peer sr-only"
                  {...register("time", { required: "Vui lòng chọn khung giờ" })}
                />
                <label
                  htmlFor={slot.id}
                  className={`flex flex-col items-center justify-center p-2 border rounded-xl cursor-pointer transition-all text-xs font-medium ${errors.time ? 'border-red-300' : 'border-slate-200'} peer-checked:border-teal-600 peer-checked:bg-teal-50 peer-checked:text-teal-700 text-slate-600 hover:bg-slate-50`}
                >
                  {slot.label}
                  <span className="text-[10px] text-slate-400 font-normal peer-checked:text-teal-600">{slot.sub}</span>
                </label>
              </div>
            ))}
          </div>
          {errors.time && <p className="text-red-500 text-xs mt-1 absolute -bottom-5">{errors.time.message}</p>}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1 relative pt-2">
        <label className="text-sm font-medium text-slate-700 block">Triệu chứng (Tùy chọn)</label>
        <div className="relative">
          <div className="absolute top-3 left-3 flex items-start pointer-events-none">
            <FileText className="h-5 w-5 text-slate-400" />
          </div>
          <textarea
            rows={3}
            className="block w-full pl-10 pr-3 py-3 border border-slate-200 bg-white rounded-xl leading-5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-slate-800 shadow-sm resize-none"
            placeholder="Mô tả ngắn gọn triệu chứng hoặc lý do khám..."
            {...register("notes")}
          />
        </div>
      </div>

      {/* Submit */}
      <div className="pt-4 space-y-4">
        <button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.01]"
        >
          Hoàn tất Đặt lịch
        </button>
        
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500 cursor-pointer accent-teal-600"
              {...register("smsReminder")} 
            />
            <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">Gửi nhắc nhở qua SMS</span>
          </label>
          <span className="text-xs text-slate-500">Miễn phí hủy & dời lịch hẹn.</span>
        </div>
      </div>
    </form>
  );
}