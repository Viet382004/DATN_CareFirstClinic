import { Video, Stethoscope, FileHeart, ArrowRight, FlaskConical } from "lucide-react";
import { motion } from "framer-motion";

const actions = [
  {
    id: 1,
    icon: <Video className="h-8 w-8 text-teal-600" />,
    title: "Tư vấn Trực tuyến",
    description: "Khám qua video",
    price: "Từ 150k VNĐ",
    isNew: true
  },
  {
    id: 2,
    icon: <Stethoscope className="h-8 w-8 text-amber-500" />,
    title: "Khám tại Phòng khám",
    description: "Khám trực tiếp",
    price: "Từ 200k VNĐ",
  },
  {
    id: 3,
    icon: <FileHeart className="h-8 w-8 text-blue-500" />,
    title: "Khám Tổng quát",
    description: "Gói tầm soát sức khỏe",
    price: "Từ 500k VNĐ",
  },
  {
    id: 4,
    icon: <FlaskConical className="h-8 w-8 text-emerald-500" />,
    title: "Xét nghiệm & Chẩn đoán",
    description: "Tại nhà & phòng khám",
    price: "Nhanh chóng & Chính xác",
  },
];

export function QuickActions() {
  return (
    <div className="bg-slate-50 relative z-20">
      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-slate-100 shadow-sm relative z-20 -mt-8 mx-4 sm:mx-8 lg:mx-auto max-w-7xl rounded-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <p className="text-3xl font-black text-teal-600 mb-1">10+</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Chuyên khoa</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-teal-600 mb-1">50+</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bác sĩ chuyên gia</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-teal-600 mb-1">500K+</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Lượt đặt khám</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-teal-600 mb-1">24/7</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hỗ trợ bệnh nhân</p>
          </div>
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-slate-900 mb-2">Dịch vụ Đặt khám Nhanh</h2>
          <p className="text-slate-500 font-medium">Lựa chọn dịch vụ phù hợp với nhu cầu của bạn</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {actions.map((action, i) => (
            <motion.a
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
              href="#book"
              key={action.id}
              className="bg-white p-6 rounded-2xl flex flex-col items-center text-center gap-4 cursor-pointer relative border border-slate-200 shadow-sm h-full group"
            >
              {action.isNew && (
                <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Mới
                </span>
              )}
              <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {action.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 group-hover:text-teal-600 transition-colors">{action.title}</h3>
                <p className="text-sm text-slate-500">{action.description}</p>
              </div>
              <div className="w-full flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-400">{action.price}</span>
                <span className="text-sm font-bold text-teal-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Chọn <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </section>
    </div>
  );
}