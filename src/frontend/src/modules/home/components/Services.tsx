import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { ImageWithFallback } from "../../../components/figma/ImageWithFallback";
import { specialtyService } from "../../../services/specialtyService";
import type { Specialty } from "../../../types/specialty";

type HospitalCardProps = {
  image: string;
  name: string;
  desc: string;
  delay: number;
};

const HospitalCard = ({
  image,
  name,
  desc,
  delay,
}: HospitalCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -8 }}
    className="medical-card medical-card-hover cursor-pointer group"
  >
    <div className="relative h-56 overflow-hidden">
      <ImageWithFallback
        src={image}
        alt={name}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />

      <h4 className="absolute bottom-4 left-4 right-4 text-lg font-bold leading-tight text-white">
        {name}
      </h4>
    </div>

    <div className="p-5">
      <p className="line-clamp-2 text-sm text-slate-500 leading-relaxed">
        {desc}
      </p>

      <div className="clinic-link mt-4">
        Tìm hiểu thêm <ChevronRight size={16} />
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
        setLoading(true);
        // Lấy 4 chuyên khoa đầu tiên để hiển thị trang chủ
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
    <section className="section-spacing bg-slate-50" id="services">
      <div className="container-page">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="section-title">Chuyên khoa</h2>
            <p className="section-subtitle">
              Đa dạng các chuyên khoa khám chữa bệnh chất lượng cao
            </p>
          </div>

          <button className="clinic-link hidden sm:inline-flex">
            Xem tất cả <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="medical-card p-5 animate-pulse">
                <div className="h-56 bg-slate-200 rounded-lg mb-4 w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))
          ) : (
            specialties.map((specialty, index) => (
              <HospitalCard
                key={specialty.id}
                image={specialty.icon || "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600"}
                name={specialty.name}
                desc={specialty.description || "Khám và điều trị chuyên sâu."}
                delay={index * 0.1}
              />
            ))
          )}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <button className="clinic-link">
            Xem tất cả <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Services;