import { useState, useEffect } from "react";
import { ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ImageWithFallback } from "../../../components/figma/ImageWithFallback";
import { specialtyService } from "../../../services/specialtyService";
import type { Specialty } from "../../../types/specialty";

type SpecialtyCardProps = {
  id: string;
  image: string;
  name: string;
  desc: string;
  delay: number;
};

const SpecialtyCard = ({
  id,
  image,
  name,
  desc,
  delay,
}: SpecialtyCardProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="group relative bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-teal-900/10 transition-all duration-700 h-full flex flex-col"
  >
    <Link to={`/specialties/${id}`} className="absolute inset-0 z-10" />
    
    <div className="relative h-48 overflow-hidden rounded-[2rem] mb-6">
      <ImageWithFallback
        src={image}
        alt={name}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
      <div className="absolute top-4 left-4">
        <div className="bg-white/20 backdrop-blur-md border border-white/20 p-2 rounded-xl text-white">
          <Sparkles size={16} />
        </div>
      </div>
    </div>

    <div className="px-2 pb-2 flex-1 flex flex-col">
      <h4 className="text-xl font-black text-slate-800 mb-2 group-hover:text-teal-600 transition-colors tracking-tight">
        {name}
      </h4>
      <p className="line-clamp-2 text-xs font-medium text-slate-500 leading-relaxed mb-6">
        {desc}
      </p>

      <div className="mt-auto flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
          Khám phá ngay <ArrowRight size={14} />
        </span>
        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
           <ChevronRight size={18} />
        </div>
      </div>
    </div>
  </motion.div>
);

const Services = () => {
  const [loading, setLoading] = useState(true);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        if (specialties.length === 0) setLoading(true);
        const res = await specialtyService.getPaged({ page: 1, pageSize: 4 });
        setSpecialties(res.items || []);
      } catch (error) {
        console.error("Failed to fetch specialties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialties();
  }, []);

  return (
    <section className="py-24 bg-[#FCFCFD]" id="services">
      <div className="container-page">
        <div className="mb-16 flex flex-col md:flex-row items-center md:items-end justify-between text-center md:text-left gap-6">
          <div className="max-w-xl">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-emerald-100"
            >
              <Sparkles size={12} /> Tiêu chuẩn quốc tế
            </motion.div>
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Chuyên Khoa <span className="text-emerald-500">Mũi Nhọn</span></h2>
            <p className="text-slate-500 font-medium">
              CareFirst Clinic đầu tư trọng điểm vào các chuyên khoa mũi nhọn, ứng dụng công nghệ hiện đại bậc nhất.
            </p>
          </div>

          <Link 
            to="/specialties" 
            className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-600 transition-all shadow-lg hover:shadow-teal-200"
          >
            Tất cả dịch vụ <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 min-h-[350px]">
          <AnimatePresence mode="wait">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-[2.5rem] p-4 border border-slate-100 animate-pulse h-80"></div>
              ))
            ) : (
              specialties.map((specialty, index) => (
                <SpecialtyCard
                  key={specialty.id}
                  id={specialty.id}
                  image={specialty.icon || "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600"}
                  name={specialty.name}
                  desc={specialty.description || "Khám và điều trị chuyên sâu tại CareFirst Clinic."}
                  delay={index * 0.05}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default Services;
