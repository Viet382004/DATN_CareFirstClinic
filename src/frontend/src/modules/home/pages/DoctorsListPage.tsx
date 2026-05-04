import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { Footer } from "../components/Footer";
import { doctorService } from "../../../services/doctorService";
import { specialtyService } from "../../../services/specialtyService";
import type { Doctor } from "../../../types/doctor";
import type { Specialty } from "../../../types/specialty";
import { ImageWithFallback } from "../../../components/figma/ImageWithFallback";
import { Search, Filter, Star, Users, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DoctorsListPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [totalItems, setTotalItems] = useState(0);
  const [query, setQuery] = useState({ page: 1, pageSize: 5 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [docRes, specRes] = await Promise.all([
          doctorService.getList({ ...query, specialtyId: selectedSpecialty || undefined, isClinical: true }),
          specialtyService.getAll()
        ]);
        setDoctors(docRes.items || []);
        setTotalItems(docRes.totalItems || 0);
        setSpecialties(specRes || []);
      } catch (error) {
        console.error("Failed to fetch doctors list:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [query, selectedSpecialty]);

  // Filter logic
  const filteredDoctors = doctors.filter(doc => {
    const matchSearch = doc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialtyName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSpecialty = selectedSpecialty === "" || doc.specialtyName?.toLowerCase().includes(selectedSpecialty.toLowerCase());
    return matchSearch && matchSpecialty;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 container-page py-12 pt-[160px] lg:pt-[200px]">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-teal-800 mb-4">Đội Ngũ Bác Sĩ</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Tự hào sở hữu đội ngũ chuyên gia, y bác sĩ giỏi chuyên môn, giàu y đức, tận tâm với bệnh nhân.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Tìm tên bác sĩ, chuyên khoa..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="md:w-64 relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <select
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 appearance-none transition-all"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
              >
                <option value="">Tất cả chuyên khoa</option>
                {specialties.map(spec => (
                  <option key={spec.id} value={spec.id}>{spec.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 animate-pulse text-center">
                  <div className="w-32 h-32 mx-auto rounded-full bg-slate-200 mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto mb-2"></div>
                  <div className="h-6 bg-slate-200 rounded w-3/4 mx-auto mb-4"></div>
                  <div className="h-10 bg-slate-200 rounded-full w-full"></div>
                </div>
              ))
            ) : filteredDoctors.length > 0 ? (
              filteredDoctors.map((doc, idx) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col group relative"
                >
                  <Link to={`/doctors/${doc.id}`} className="absolute inset-0 z-10" />

                  <div className="relative pt-[100%] bg-slate-50 overflow-hidden">
                    <ImageWithFallback
                      src={doc.avatarUrl || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80"}
                      alt={doc.fullName}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-amber-600 flex items-center gap-1 shadow-sm">
                      <Star size={12} fill="currentColor" /> {doc.averageRating?.toFixed(1) || "5.0"}
                    </div>
                  </div>

                  <div className="p-6 text-center flex flex-col flex-1">
                    <p className="text-teal-600 text-[10px] font-black uppercase tracking-widest mb-1">{doc.specialtyName || "Chuyên khoa"}</p>
                    <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-teal-600 transition-colors">
                      {doc.academicTitle ? `${doc.academicTitle} ` : ""}{doc.fullName}
                    </h3>
                    <p className="text-slate-500 text-xs mb-6 flex-1 line-clamp-2">{doc.position || "Phòng khám CareFirst"}</p>

                    <div className="flex gap-2 w-full mt-auto relative z-20">
                      <Link
                        to={`/patient/booking?doctorId=${doc.id}`}
                        className="flex-1 py-3 bg-amber-500 text-white rounded-2xl text-xs font-black hover:bg-amber-600 transition-all shadow-sm hover:shadow-md"
                      >
                        ĐẶT LỊCH NGAY
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <Users size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-800">Không tìm thấy bác sĩ phù hợp</h3>
                <p className="text-slate-500">Thử thay đổi từ khóa hoặc bộ lọc của bạn.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

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
