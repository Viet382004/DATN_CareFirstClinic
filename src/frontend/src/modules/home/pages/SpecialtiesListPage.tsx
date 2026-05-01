import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { Footer } from "../components/Footer";
import { specialtyService } from "../../../services/specialtyService";
import type { Specialty } from "../../../types/specialty";
import { ImageWithFallback } from "../../../components/figma/ImageWithFallback";
import { Search, Stethoscope, ChevronRight } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 container-page py-12 pt-[160px] lg:pt-[200px]">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-teal-800 mb-4">Danh Sách Chuyên Khoa</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            CareFirstClinic quy tụ đầy đủ các chuyên khoa trọng yếu với đội ngũ chuyên gia hàng đầu, đáp ứng toàn diện nhu cầu chăm sóc sức khỏe của bạn.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-10 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm chuyên khoa..." 
            className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-3xl shadow-sm focus:ring-2 focus:ring-teal-500 transition-all text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 animate-pulse flex items-start gap-4">
                  <div className="w-20 h-20 bg-slate-200 rounded-2xl shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : filteredSpecialties.length > 0 ? (
              filteredSpecialties.map((spec, idx) => (
                <motion.div
                  key={spec.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -8 }}
                >
                  <Link 
                    to={`/specialties/${spec.id}`} 
                    className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-slate-100 group flex items-start gap-5 h-full relative"
                  >
                    <div className="w-20 h-20 shrink-0 bg-teal-50 rounded-2xl flex items-center justify-center overflow-hidden border border-teal-100 group-hover:bg-teal-600 transition-colors duration-300">
                      {spec.icon ? (
                        <ImageWithFallback src={spec.icon} alt={spec.name} className="w-full h-full object-cover group-hover:opacity-20 transition-opacity" />
                      ) : (
                        <Stethoscope size={32} className="text-teal-500 group-hover:text-white transition-colors" />
                      )}
                      <Stethoscope size={32} className="absolute text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-teal-700 transition-colors">{spec.name}</h3>
                      <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-4">{spec.description || "Khám và điều trị chuyên sâu tại phòng khám."}</p>
                      <div className="flex items-center gap-1 text-teal-600 font-bold text-xs uppercase tracking-wider">
                        Xem chi tiết <ChevronRight size={14} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <Stethoscope size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-800">Không tìm thấy chuyên khoa phù hợp</h3>
                <p className="text-slate-500">Thử thay đổi từ khóa tìm kiếm của bạn.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}
