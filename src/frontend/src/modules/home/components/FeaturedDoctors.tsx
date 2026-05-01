import { useState, useEffect } from "react";
import { Star, Users, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ImageWithFallback } from "../../../components/figma/ImageWithFallback";
import { doctorService } from "../../../services/doctorService";
import { getAvatarUrl } from "../../../utils/format";
import type { Doctor } from "../../../types/doctor";

export function FeaturedDoctors() {
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // Không set loading = true nếu đã có dữ liệu (chạy nền)
        if (doctors.length === 0) setLoading(true);
        const res = await doctorService.getList({ page: 1, pageSize: 8 });
        setDoctors(res.items || []);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Bác sĩ chuyên khoa</h2>
            <p className="text-slate-500 font-medium">Đội ngũ bác sĩ chuyên môn cao, tận tâm</p>
          </div>
          <Link 
            to="/doctors" 
            className="hidden sm:flex text-teal-600 font-bold items-center gap-1 hover:gap-2 transition-all"
          >
            Xem tất cả <ChevronRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 min-h-[400px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="contents"
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm animate-pulse text-center h-full flex flex-col">
                    <div className="w-32 h-32 mx-auto rounded-full bg-slate-200 mb-4 border-4 border-slate-100"></div>
                    <div className="h-5 bg-slate-200 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto mb-3"></div>
                    <div className="h-4 bg-slate-200 rounded w-2/3 mx-auto mb-4"></div>
                    <div className="mt-auto pt-4 border-t border-slate-100 flex justify-center gap-4">
                      <div className="h-4 bg-slate-200 rounded w-12"></div>
                      <div className="h-4 bg-slate-200 rounded w-12"></div>
                    </div>
                    <div className="mt-6 h-10 bg-slate-200 rounded-xl w-full"></div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="contents"
              >
                {doctors.map((doc, idx) => (
                  <motion.div 
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -8 }}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer text-center relative group flex flex-col h-full"
                  >
                    <Link to={`/doctors/${doc.id}`} className="absolute inset-0 z-10" aria-label={`Xem chi tiết ${doc.fullName}`} />
                    
                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4 border-4 border-teal-50 group-hover:border-teal-100 transition-colors">
                      <ImageWithFallback 
                        src={getAvatarUrl(doc.avatarUrl)} 
                        alt={doc.fullName} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1 line-clamp-1" title={doc.fullName}>
                      {doc.academicTitle ? `${doc.academicTitle} ` : ''}{doc.fullName}
                    </h4>
                    <p className="text-xs font-bold text-teal-600 mb-3 uppercase tracking-wider line-clamp-1">{doc.specialtyName || 'Chuyên khoa'}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{doc.position || "Phòng khám CareFirst"}</p>
                    
                    <div className="mt-auto pt-4 border-t border-slate-100 flex justify-center gap-4">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star size={14} fill="currentColor" />
                        <span className="text-xs font-bold">{doc.averageRating > 0 ? doc.averageRating.toFixed(1) : "5.0"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <Users size={14} />
                        <span className="text-xs font-bold">{doc.totalAppointments > 0 ? `${doc.totalAppointments}+` : "0"}</span>
                      </div>
                    </div>

                    <div className="mt-6 relative z-20">
                      <Link 
                        to={`/patient/booking?doctorId=${doc.id}`} 
                        className="block w-full py-2 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors"
                      >
                        Đặt khám ngay
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link 
            to="/doctors" 
            className="text-teal-600 font-bold inline-flex items-center gap-1 hover:gap-2 transition-all"
          >
            Xem tất cả <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}


