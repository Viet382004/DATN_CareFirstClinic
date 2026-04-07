import { CalendarPlus, Clock, Stethoscope, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    id: 1,
    icon: <CalendarPlus className="h-10 w-10 text-teal-600 mb-6" />,
    title: "Chọn Dịch Vụ",
    description: "Chọn chuyên khoa, bác sĩ hoặc gói khám sức khỏe",
  },
  {
    id: 2,
    icon: <Clock className="h-10 w-10 text-teal-600 mb-6" />,
    title: "Chọn Ngày & Giờ",
    description: "Chọn khung giờ phù hợp với lịch trình của bạn",
  },
  {
    id: 3,
    icon: <Stethoscope className="h-10 w-10 text-teal-600 mb-6" />,
    title: "Đến Khám",
    description: "Đến phòng khám hoặc kết nối qua cuộc gọi video",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 lg:py-24 bg-teal-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-slate-900 mb-4">
            Hướng Dẫn Đặt Lịch
          </h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">
            Quy trình 3 bước đơn giản để nhận được sự chăm sóc bạn cần.
          </p>
        </div>

        <div className="relative">
          {/* Connecting arrows for desktop */}
          <div className="hidden lg:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-teal-200 -translate-y-[20px] z-0"></div>
          <div className="hidden lg:block absolute top-1/2 left-[32%] w-4 h-4 rounded-full bg-teal-400 -translate-y-[28px] z-0 shadow-sm border-2 border-white"></div>
          <div className="hidden lg:block absolute top-1/2 right-[32%] w-4 h-4 rounded-full bg-teal-400 -translate-y-[28px] z-0 shadow-sm border-2 border-white"></div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: idx * 0.2, duration: 0.5 }}
                key={step.id}
                className="flex flex-col items-center text-center p-6 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md hover:border-teal-200 transition-all duration-300"
              >
                <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-teal-100">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm">
                    {step.id}
                  </span>
                  {step.title}
                </h3>
                <p className="text-slate-600 text-base">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <a
            href="#book"
            className="inline-flex justify-center items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] text-lg"
          >
            Bắt đầu Đặt khám <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
}