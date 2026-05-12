import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { Footer } from "../components/Footer";
import { specialtyService } from "../../../services/specialtyService";
import type { Specialty } from "../../../types/specialty";
import { ImageWithFallback } from "../../../components/figma/ImageWithFallback";
import { Search, Stethoscope, ChevronRight, Award, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SpecialtiesListPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        setLoading(true);
        const data = await specialtyService.getAll();
        setSpecialties(data || []);
      } catch (error) {
        console.error("Failed to fetch specialties list:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialties();
  }, []);

  const filteredSpecialties = specialties.filter(spec => 
    spec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spec.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-['Inter',sans-serif]">
      <Header />
      
      <main className="flex-1 container-page py-12 pt-[160px] lg:pt-[200px]">
        {/* Banner Section */}
        <div className="relative mb-16 rounded-[3rem] overflow-hidden bg-slate-900 px-8 py-16 text-center text-white">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3"></div>
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-white/10"
            >
              Hệ thống chuyên khoa toàn diện
            </motion.span>
            <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
              Khám Phá Các <span className="text-teal-400">Dịch Vụ Chuyên Sâu</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-10 font-medium">
              CareFirstClinic cung cấp giải pháp y tế đa chuyên khoa với tiêu chuẩn quốc tế, giúp bạn chủ động bảo vệ sức khỏe bản thân và gia đình.
            </p>

            {/* Compact Search */}
            <div className="max-w-xl mx-auto relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-400 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Tìm tên chuyên khoa hoặc triệu chứng..." 
                className="w-full pl-16 pr-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] text-white placeholder:text-slate-400 focus:ring-2 focus:ring-teal-400 outline-none transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Categories / Trust badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <TrustBadge icon={<Award size={20} />} title="Bác sĩ đầu ngành" desc="Hơn 15 năm kinh nghiệm" color="bg-amber-50 text-amber-600" />
          <TrustBadge icon={<ShieldCheck size={20} />} title="An toàn tuyệt đối" desc="Quy trình đạt chuẩn JCI" color="bg-blue-50 text-blue-600" />
          <TrustBadge icon={<Zap size={20} />} title="Kết quả nhanh chóng" desc="Nhận kết quả trong 60 phút" color="bg-emerald-50 text-emerald-600" />
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 animate-pulse h-48"></div>
              ))
            ) : filteredSpecialties.length > 0 ? (
              filteredSpecialties.map((spec, idx) => (
                <motion.div
                  key={spec.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Link 
                    to={`/specialties/${spec.id}`} 
                    className="group bg-white p-6 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-teal-900/5 transition-all duration-500 border border-slate-100 flex flex-col h-full relative overflow-hidden"
                  >
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-[3] transition-transform duration-700 opacity-50"></div>

                    <div className="w-16 h-16 shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden mb-6 group-hover:bg-teal-600 transition-colors duration-300 relative z-10 shadow-inner">
                      {spec.icon ? (
                        <ImageWithFallback src={spec.icon} alt={spec.name} className="w-full h-full object-cover group-hover:opacity-0 transition-opacity" />
                      ) : (
                        <Stethoscope size={28} className="text-slate-400 group-hover:text-white transition-colors" />
                      )}
                      <Stethoscope size={28} className="absolute text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="relative z-10 flex-1 flex flex-col">
                      <h3 className="text-lg font-black text-slate-800 mb-2 group-hover:text-teal-900 transition-colors tracking-tight">{spec.name}</h3>
                      <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-6 font-medium">{spec.description || "Dịch vụ chăm sóc sức khỏe chuyên sâu tại CareFirst Clinic."}</p>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                          Tìm hiểu thêm <ChevronRight size={14} />
                        </span>
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-all shadow-sm">
                           <Zap size={14} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Stethoscope size={40} className="text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Không tìm thấy chuyên khoa</h3>
                <p className="text-slate-500 max-w-sm mx-auto">Vui lòng kiểm tra lại từ khóa hoặc quay lại danh sách đầy đủ.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function TrustBadge({ icon, title, desc, color }: any) {
  return (
    <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color} shadow-inner`}>
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-black text-slate-800 tracking-tight">{title}</h4>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{desc}</p>
      </div>
    </div>
  );
}

