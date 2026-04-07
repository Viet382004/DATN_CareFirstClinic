import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { ImageWithFallback } from "../../../components/figma/ImageWithFallback";

const services = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600",
    name: "Khám Tổng quát Chuyên sâu",
    desc: "Gói khám đa dạng phù hợp mọi lứa tuổi, tầm soát toàn diện.",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1551076805-e18690c5e53b?auto=format&fit=crop&q=80&w=600",
    name: "Xét nghiệm Kỹ thuật cao",
    desc: "Trang thiết bị hiện đại, kết quả chính xác, trả qua ứng dụng.",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=600",
    name: "Chẩn đoán Hình ảnh",
    desc: "Siêu âm, X-quang, MRI, CT scan với công nghệ tiên tiến nhất.",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=600",
    name: "Tiêm chủng vắc-xin",
    desc: "Đầy đủ các loại vắc-xin chất lượng cao cho trẻ em và người lớn.",
  },
];

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
  return (
    <section className="section-spacing bg-slate-50" id="services">
      <div className="container-page">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="section-title">Dịch vụ Y tế</h2>
            <p className="section-subtitle">
              Đa dạng các dịch vụ chăm sóc sức khỏe chất lượng cao
            </p>
          </div>

          <button className="clinic-link hidden sm:inline-flex">
            Xem tất cả <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <HospitalCard
              key={service.id}
              image={service.image}
              name={service.name}
              desc={service.desc}
              delay={index * 0.1}
            />
          ))}
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