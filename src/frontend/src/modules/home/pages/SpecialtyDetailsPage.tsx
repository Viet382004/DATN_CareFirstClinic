import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import { Footer } from "../components/Footer";
import { specialtyService } from "../../../services/specialtyService";
import { doctorService } from "../../../services/doctorService";
import type { Specialty } from "../../../types/specialty";
import type { Doctor } from "../../../types/doctor";
import { ImageWithFallback } from "../../../components/figma/ImageWithFallback";
import { ChevronRight, Stethoscope, Users, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function SpecialtyDetailsPage() {
  const { id } = useParams();
  const [specialty, setSpecialty] = useState<Specialty | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [query, setQuery] = useState({ page: 1, pageSize: 5 });

  useEffect(() => {
    const fetchSpecialtyData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [specialtyData, doctorsData] = await Promise.all([
          specialtyService.getById(id),
          doctorService.getBySpecialty(id, { ...query })
        ]);
        setSpecialty(specialtyData);
        setDoctors(doctorsData.items || []);
        setTotalItems(doctorsData.totalItems || 0);
      } catch (error) {
        console.error("Failed to fetch specialty details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialtyData();
  }, [id, query]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 container-page py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 font-medium">Đang tải thông tin chuyên khoa...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!specialty) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 container-page py-12 text-center">
          <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy chuyên khoa</h2>
          <Link to="/specialties" className="text-teal-600 font-bold mt-4 inline-block">Quay lại danh sách</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 container-page py-12 pt-[160px] lg:pt-[200px]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-12"
        >
          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="w-40 h-40 bg-teal-50 rounded-2xl flex items-center justify-center text-6xl shadow-inner shrink-0 overflow-hidden border border-teal-100">
              {specialty.icon ? (
                <ImageWithFallback src={specialty.icon} alt={specialty.name} className="w-full h-full object-cover" />
              ) : (
                <Stethoscope size={64} className="text-teal-500" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Chuyên khoa</span>
                {specialty.totalDoctors > 0 && (
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                    <Users size={12} /> {specialty.totalDoctors} Bác sĩ
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-black text-slate-800 mb-4">{specialty.name}</h1>
              <p className="text-slate-600 leading-relaxed text-lg mb-6">{specialty.description || "Đang cập nhật thông tin giới thiệu cho chuyên khoa này."}</p>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Info size={18} className="text-teal-500" /> Về chuyên khoa
                </h3>
                <p className="text-slate-600">
                  Phòng khám CareFirst+ tự hào mang đến dịch vụ {specialty.name} với đội ngũ chuyên gia hàng đầu và trang thiết bị hiện đại nhất. Chúng tôi cam kết mang lại sự an tâm và sức khỏe tốt nhất cho bệnh nhân.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mb-10">
          <h2 className="text-3xl font-black text-slate-800 mb-2">Đội ngũ Bác sĩ</h2>
          <p className="text-slate-500 font-medium">Các chuyên gia hàng đầu thuộc khoa {specialty.name}</p>
        </div>

        {doctors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {doctors.map((doc, idx) => (
              <motion.div 
                key={doc.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer text-center relative group flex flex-col h-full"
              >
                <Link to={`/doctors/${doc.id}`} className="absolute inset-0 z-10" />
                
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4 border-4 border-teal-50 group-hover:border-teal-100 transition-colors">
                  <ImageWithFallback 
                    src={doc.avatarUrl || "https://images.unsplash.com/photo-1612944095914-33fd0a85fcfc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400"} 
                    alt={doc.fullName} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-bold text-slate-900 mb-1 line-clamp-1">
                  {doc.academicTitle ? `${doc.academicTitle} ` : ""}{doc.fullName}
                </h4>
                <p className="text-xs text-slate-500 mb-4">{doc.position || "Phòng khám CareFirst"}</p>
                
                <div className="mt-auto pt-4 border-t border-slate-100 flex justify-center gap-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    <span className="text-xs font-bold">{doc.averageRating || "5.0"} ⭐</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <span className="text-xs font-bold">{doc.totalAppointments || 0}+ bệnh nhân</span>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="inline-flex items-center gap-1 text-teal-600 font-bold text-sm">
                    Xem hồ sơ <ChevronRight size={16} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl text-center border border-dashed border-slate-300">
            <Users size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium text-lg">Hiện chưa có bác sĩ nào trong chuyên khoa này.</p>
            <Link to="/doctors" className="text-teal-600 font-bold mt-4 inline-block">Xem tất cả bác sĩ</Link>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalItems > 5 && (
          <div className="mt-12 flex justify-center items-center gap-4">
            <button
              onClick={() => setQuery(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={query.page === 1}
              className="px-6 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold disabled:opacity-30 hover:bg-slate-50 transition-all"
            >
              Trang trước
            </button>
            <span className="text-slate-500 font-bold text-sm">
              Trang {query.page} / {Math.ceil(totalItems / query.pageSize)}
            </span>
            <button
              onClick={() => setQuery(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={query.page >= Math.ceil(totalItems / query.pageSize)}
              className="px-6 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold disabled:opacity-30 hover:bg-slate-50 transition-all"
            >
              Trang sau
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
