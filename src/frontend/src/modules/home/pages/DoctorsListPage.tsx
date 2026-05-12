import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { Footer } from "../components/Footer";
import { doctorService } from "../../../services/doctorService";
import { specialtyService } from "../../../services/specialtyService";
import type { Doctor } from "../../../types/doctor";
import type { Specialty } from "../../../types/specialty";
import { ImageWithFallback } from "../../../components/figma/ImageWithFallback";
import { Search, Star, Users, ChevronRight, Stethoscope, Award, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAvatarUrl } from "../../../utils/format";

export default function DoctorsListPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all doctors to enable client-side grouping
        const [docRes, specRes] = await Promise.all([
          doctorService.getList({ page: 1, pageSize: 200 }), // Large page size to get all
          specialtyService.getAll()
        ]);
        setDoctors(docRes.items || []);
        setSpecialties(specRes || []);
      } catch (error) {
        console.error("Failed to fetch doctors list:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => 
      doc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialtyName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [doctors, searchTerm]);

  // Grouping logic
  const clinicalDoctors = useMemo(() => 
    filteredDoctors.filter(d => d.isClinical), 
    [filteredDoctors]
  );

  const specialtyGroups = useMemo(() => {
    const nonClinical = filteredDoctors.filter(d => !d.isClinical);
    const groups: Record<string, Doctor[]> = {};
    
    nonClinical.forEach(doc => {
      const sName = doc.specialtyName || "Khác";
      if (!groups[sName]) groups[sName] = [];
      groups[sName].push(doc);
    });
    
    return groups;
  }, [filteredDoctors]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-['Inter',sans-serif]">
      <Header />
      
      <main className="flex-1 container-page py-12 pt-[160px] lg:pt-[200px]">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-50 text-teal-700 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-teal-100"
          >
            <Award size={14} /> Đội ngũ chuyên gia hàng đầu
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Chuyên Gia & <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Bác Sĩ Tận Tâm</span>
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            CareFirstClinic quy tụ đội ngũ y bác sĩ từ các bệnh viện lớn, tận tâm chăm sóc sức khỏe cho cộng đồng với tinh thần chuyên nghiệp nhất.
          </p>
        </div>

        {/* Search Bar - Premium Design */}
        <div className="max-w-2xl mx-auto mb-20">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center bg-white rounded-[1.8rem] shadow-xl shadow-teal-900/5 border border-slate-100 p-2 overflow-hidden">
              <Search className="ml-4 text-slate-400" size={24} />
              <input
                type="text"
                placeholder="Tìm tên bác sĩ hoặc chuyên khoa..."
                className="flex-1 px-4 py-4 bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="bg-slate-900 text-white px-8 py-4 rounded-[1.4rem] font-bold text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                Tìm Kiếm
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-16">
            {[1, 2].map(i => (
              <div key={i}>
                <div className="h-8 bg-slate-200 rounded-lg w-48 mb-8 animate-pulse"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="bg-white rounded-3xl p-5 border border-slate-100 animate-pulse h-64"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-20">
            {/* 1. Clinical Doctors Section (Prioritized & Compact) */}
            {clinicalDoctors.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-10 w-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-200">
                    <Stethoscope size={22} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Bác Sĩ Lâm Sàng</h2>
                    <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mt-1">Đội ngũ khám sàng lọc & tư vấn ban đầu</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                  {clinicalDoctors.map((doc, idx) => (
                    <DoctorCard key={doc.id} doctor={doc} index={idx} />
                  ))}
                </div>
              </section>
            )}

            {/* 2. Specialists by Specialty */}
            {Object.entries(specialtyGroups).map(([specName, docs]) => (
              <section key={specName}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                    <Award size={22} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Chuyên Khoa {specName}</h2>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">Các chuyên gia điều trị chuyên sâu</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                  {docs.map((doc, idx) => (
                    <DoctorCard key={doc.id} doctor={doc} index={idx} />
                  ))}
                </div>
              </section>
            ))}

            {filteredDoctors.length === 0 && (
              <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users size={40} className="text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Không tìm thấy bác sĩ</h3>
                <p className="text-slate-500 max-w-sm mx-auto">Vui lòng thử lại với từ khóa khác hoặc liên hệ hotline để được hỗ trợ.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

// Compact Doctor Card Component
function DoctorCard({ doctor, index }: { doctor: Doctor; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col p-4 relative"
    >
      <Link to={`/doctors/${doctor.id}`} className="absolute inset-0 z-10" />
      
      {/* Avatar with reduced size */}
      <div className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-slate-50 mb-4">
        <ImageWithFallback
          src={getAvatarUrl(doctor.avatarUrl)}
          alt={doctor.fullName}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-black text-amber-600 flex items-center gap-1 shadow-sm border border-white/20">
          <Star size={10} fill="currentColor" /> {doctor.averageRating > 0 ? doctor.averageRating.toFixed(1) : "5.0"}
        </div>
      </div>

      <div className="text-center flex-1 flex flex-col">
        <h4 className="text-sm font-black text-slate-900 leading-tight mb-1 group-hover:text-teal-600 transition-colors line-clamp-1">
          {doctor.academicTitle ? `${doctor.academicTitle} ` : ""}{doctor.fullName}
        </h4>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-4 line-clamp-1">
          {doctor.specialtyName || "Chuyên khoa"}
        </p>

        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500 font-bold">
            <span className="flex items-center gap-1">
              <Calendar size={12} className="text-teal-500" /> {doctor.totalAppointments || 0}
            </span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span className="flex items-center gap-1">
              <Users size={12} className="text-emerald-500" /> {doctor.totalAppointments > 50 ? "50+" : "Mới"}
            </span>
          </div>

          {doctor.isClinical ? (
            <Link
              to={`/patient/booking?doctorId=${doctor.id}`}
              className="block w-full py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black hover:bg-teal-600 transition-all shadow-md hover:shadow-teal-200 relative z-20 text-center"
            >
              ĐẶT LỊCH KHÁM
            </Link>
          ) : (
            <Link
              to={`/doctors/${doctor.id}`}
              className="block w-full py-2.5 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black hover:bg-slate-200 transition-all relative z-20 text-center"
            >
              XEM HỒ SƠ
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

