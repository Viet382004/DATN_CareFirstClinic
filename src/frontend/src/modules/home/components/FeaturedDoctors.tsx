import { useState, useEffect } from "react";
import { Star, Users, ChevronRight, Stethoscope, Award } from "lucide-react";
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
        if (doctors.length === 0) setLoading(true);
        // Ưu tiên bác sĩ lâm sàng và bác sĩ nổi bật
        const res = await doctorService.getList({ page: 1, pageSize: 6 });
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
    <section className="py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 text-center md:text-left gap-6">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-teal-100"
            >
              <Award size={12} /> Đội ngũ tận tâm
            </motion.div>
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Gặp Gỡ <span className="text-teal-600">Chuyên Gia</span></h2>
            <p className="text-slate-500 font-medium max-w-md">Những bác sĩ hàng đầu luôn sẵn sàng lắng nghe và đồng hành cùng sức khỏe của bạn.</p>
          </div>
          <Link 
            to="/doctors" 
            className="group flex items-center gap-3 px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-100 shadow-sm hover:shadow-xl transition-all"
          >
            Xem toàn bộ <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 min-h-[300px]">
          <AnimatePresence mode="wait">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-[2rem] p-4 border border-slate-100 animate-pulse h-64"></div>
              ))
            ) : (
              doctors.map((doc, idx) => (
                <motion.div 
                  key={doc.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.03 }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-teal-900/5 transition-all duration-500 group flex flex-col relative"
                >
                  <Link to={`/doctors/${doc.id}`} className="absolute inset-0 z-10" />
                  
                  <div className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-slate-50 mb-4 shadow-inner">
                    <ImageWithFallback 
                      src={getAvatarUrl(doc.avatarUrl)} 
                      alt={doc.fullName} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {doc.isClinical && (
                      <div className="absolute top-2 left-2 bg-teal-600 text-white p-1.5 rounded-lg shadow-lg">
                        <Stethoscope size={12} />
                      </div>
                    )}
                  </div>

                  <div className="text-center flex-1 flex flex-col">
                    <h4 className="text-xs font-black text-slate-900 mb-1 group-hover:text-teal-600 transition-colors line-clamp-1">
                      {doc.academicTitle ? `${doc.academicTitle} ` : ''}{doc.fullName}
                    </h4>
                    <p className="text-[9px] font-bold text-teal-600 uppercase tracking-tighter mb-4 line-clamp-1">{doc.specialtyName || 'Chuyên khoa'}</p>
                    
                    <div className="mt-auto pt-3 border-t border-slate-50 flex justify-center gap-3 text-slate-400">
                      <div className="flex items-center gap-1">
                        <Star size={10} fill="#f59e0b" className="text-amber-500" />
                        <span className="text-[10px] font-black text-slate-700">{doc.averageRating > 0 ? doc.averageRating.toFixed(1) : "5.0"}</span>
                      </div>
                      <div className="w-px h-2.5 bg-slate-100"></div>
                      <div className="flex items-center gap-1">
                        <Users size={10} />
                        <span className="text-[10px] font-black text-slate-700">{doc.totalAppointments || 0}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}



