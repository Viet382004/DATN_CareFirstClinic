import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { Footer } from "../components/Footer";
import { doctorService } from "../../../services/doctorService";
import type { Doctor } from "../../../types/doctor";
import { ImageWithFallback } from "../../../components/figma/ImageWithFallback";
import { getAvatarUrl } from "../../../utils/format";
import { 
  Star, 
  Users, 
  MapPin, 
  Clock, 
  Award, 
  GraduationCap, 
  ChevronRight, 
  Calendar,
  CheckCircle2,
  Stethoscope,
  Briefcase
} from "lucide-react";
import { motion } from "framer-motion";

export default function DoctorDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await doctorService.getById(id);
        setDoctor(data);
      } catch (error) {
        console.error("Failed to fetch doctor details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  const handleBookNow = () => {
    if (doctor) {
      // Store necessary info for the booking flow to skip steps
      localStorage.setItem("selectedSpecialty", doctor.specialtyId || "");
      localStorage.setItem("selectedSpecialtyName", doctor.specialtyName || "");
      localStorage.setItem("selectedDoctor", doctor.id);
      localStorage.setItem("selectedDoctorName", `${doctor.academicTitle ? doctor.academicTitle + '. ' : ''}${doctor.fullName}`);
      
      // Navigate directly to time selection
      navigate("/patient/booking/time");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 container-page py-12 pt-[180px] lg:pt-[220px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-slate-500 font-bold text-lg animate-pulse">Đang tải hồ sơ bác sĩ...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 container-page py-12 pt-[180px] lg:pt-[220px] text-center">
          <div className="max-w-md mx-auto bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-4">Không tìm thấy bác sĩ</h2>
            <p className="text-slate-500 mb-8 font-medium">Bác sĩ bạn đang tìm kiếm có thể đã thay đổi thông tin hoặc không còn hoạt động.</p>
            <Link 
              to="/doctors" 
              className="w-full bg-teal-600 text-white py-3 rounded-2xl font-bold inline-block hover:bg-teal-700 transition-all"
            >
              Xem danh sách bác sĩ
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100 pt-[160px] lg:pt-[200px] pb-4">
        <div className="container-page">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
            <Link to="/" className="hover:text-teal-600 transition-colors">Trang chủ</Link>
            <ChevronRight size={14} />
            <Link to="/doctors" className="hover:text-teal-600 transition-colors">Bác sĩ</Link>
            <ChevronRight size={14} />
            <span className="text-slate-900">{doctor.fullName}</span>
          </div>
        </div>
      </div>

      <main className="flex-1 container-page py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-[100px]"
            >
              <div className="relative mb-6">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-inner bg-slate-100 border-4 border-white shadow-lg">
                  <ImageWithFallback 
                    src={getAvatarUrl(doctor.avatarUrl)} 
                    alt={doctor.fullName} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-2xl shadow-xl border border-slate-100">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={20} fill="currentColor" />
                    <span className="text-lg font-black">{doctor.averageRating?.toFixed(1) || "5.0"}</span>
                  </div>
                </div>
              </div>

              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase mb-4">
                  <Stethoscope size={14} />
                  {doctor.specialtyName || "Bác sĩ Chuyên khoa"}
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">
                  {doctor.academicTitle ? `${doctor.academicTitle}. ` : ""}{doctor.fullName}
                </h1>
                <p className="text-lg text-slate-500 font-bold flex items-center justify-center gap-2">
                  <Briefcase size={18} className="text-teal-500" />
                  {doctor.position || "Phòng khám CareFirst+"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bệnh nhân</p>
                  <p className="text-xl font-black text-slate-900">{doctor.totalAppointments || 0}+</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kinh nghiệm</p>
                  <p className="text-xl font-black text-slate-900">{doctor.yearsOfExperience || 5} Năm</p>
                </div>
              </div>

              {doctor.isClinical && (
                <button 
                  onClick={handleBookNow}
                  className="w-full bg-amber-500 text-white py-4 rounded-2xl font-black text-lg hover:bg-amber-600 shadow-xl shadow-amber-200 hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
                >
                  <Calendar size={22} />
                  Đặt lịch khám ngay
                </button>
              )}
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                  <span>Xác nhận đặt khám trong 5 phút</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                  <span>Hỗ trợ bảo hiểm y tế</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100"
            >
              <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center">
                  <Award size={24} />
                </div>
                Giới thiệu chuyên môn
              </h3>
              <p className="text-slate-600 leading-relaxed text-lg font-medium whitespace-pre-wrap">
                {doctor.description || "Bác sĩ có nhiều năm kinh nghiệm trong lĩnh vực y tế, luôn tận tâm vì sức khỏe cộng đồng. Chuyên môn sâu rộng trong chẩn đoán và điều trị các bệnh lý phức tạp, kết hợp với phong cách làm việc chuyên nghiệp, chu đáo."}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100"
            >
              <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <GraduationCap size={24} />
                </div>
                Đào tạo & Quá trình công tác
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-px bg-slate-200 relative">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-teal-500 rounded-full border-4 border-white shadow-sm"></div>
                  </div>
                  <div className="pb-4">
                    <h4 className="font-black text-slate-800 mb-1 text-lg">Đại học Y Dược TP.HCM</h4>
                    <p className="text-slate-500 font-bold italic mb-2 text-sm">2010 - 2016</p>
                    <p className="text-slate-600 font-medium">Bác sĩ Đa khoa - Tốt nghiệp loại Ưu</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-px bg-slate-200 relative">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-teal-500 rounded-full border-4 border-white shadow-sm"></div>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 mb-1 text-lg">Bệnh viện Chợ Rẫy</h4>
                    <p className="text-slate-500 font-bold italic mb-2 text-sm">2016 - 2022</p>
                    <p className="text-slate-600 font-medium">Bác sĩ điều trị chuyên khoa sâu, tham gia nhiều ca phẫu thuật phức tạp và nghiên cứu khoa học.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100"
            >
              <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                  <Clock size={24} />
                </div>
                Địa điểm làm việc
              </h3>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-slate-900 font-black mb-2 text-lg">
                    <MapPin size={20} className="text-red-500" />
                    Phòng khám CareFirst+
                  </div>
                  <p className="text-slate-500 font-bold pl-7">Số 123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Thứ 2 - Thứ 7: 08:00 - 17:00
                  </div>
                  <div className="flex items-center gap-2 text-sm font-black text-slate-400">
                    <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                    Chủ nhật: Nghỉ
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

