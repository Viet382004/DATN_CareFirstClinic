import { Check, ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

const packages = [
  {
    id: 1,
    title: "Khám Tổng Quát",
    price: "500,000",
    currency: "VNĐ",
    desc: "Khám sức khỏe định kỳ cơ bản hàng năm.",
    features: [
      "Khám lâm sàng tổng quát",
      "Kiểm tra huyết áp & BMI",
      "Xét nghiệm máu cơ bản (CBC)",
      "Xét nghiệm nước tiểu",
    ],
    bestFor: "Kiểm tra hàng năm",
    highlight: false,
    buttonStyle: "border-2 border-teal-600 text-teal-700 hover:bg-teal-50",
  },
  {
    id: 2,
    title: "Gói Executive Gold",
    price: "1,200,000",
    currency: "VNĐ",
    desc: "Tầm soát chuyên sâu dành cho người bận rộn.",
    features: [
      "Bao gồm tất cả Gói Tổng Quát",
      "Tầm soát tim mạch (Điện tâm đồ)",
      "Kiểm tra chức năng Gan & Thận",
      "Tư vấn dinh dưỡng & chế độ ăn",
    ],
    bestFor: "Nhân viên văn phòng",
    highlight: true,
    badge: "Phổ Biến Nhất",
    buttonStyle: "bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg",
  },
  {
    id: 3,
    title: "Gói Gia Đình",
    price: "2,500,000",
    currency: "VNĐ",
    desc: "Gói chăm sóc toàn diện cho gia đình 4 người.",
    features: [
      "Gói Executive Gold cho 4 người",
      "Giảm 10% chi phí thuốc",
      "Hỗ trợ đặt lịch khám ưu tiên",
      "Miễn phí khám nhi (1 bé)",
    ],
    bestFor: "Gia đình",
    highlight: false,
    buttonStyle: "border-2 border-teal-600 text-teal-700 hover:bg-teal-50",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-16 lg:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-slate-900 mb-4">
            Bảng Giá Gói Khám Sức Khỏe
          </h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">
            Chi phí minh bạch, không phí ẩn. Lựa chọn gói chăm sóc phù hợp cho bạn và gia đình.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {packages.map((pkg, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: idx * 0.2, duration: 0.5 }}
              key={pkg.id}
              className={`relative bg-white rounded-3xl p-8 flex flex-col h-full ${
                pkg.highlight
                  ? "border-2 border-teal-600 shadow-xl scale-100 md:scale-105 z-10"
                  : "border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              }`}
            >
              {pkg.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm flex items-center gap-1 uppercase tracking-wider">
                  <Zap className="h-4 w-4" /> {pkg.badge}
                </div>
              )}

              <div className="mb-6 flex flex-col h-full">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{pkg.title}</h3>
                <p className="text-slate-500 text-sm mb-6 h-10">{pkg.desc}</p>
                <div className="flex items-baseline gap-1 text-slate-900 mt-auto">
                  <span className="text-4xl font-black text-teal-600">{pkg.price}</span>
                  <span className="text-lg font-bold text-slate-500">{pkg.currency}</span>
                </div>
                {pkg.title === "Gói Gia Đình" && <p className="text-xs text-slate-500 mt-1 font-medium">Tổng phí cho 4 người</p>}
              </div>

              <div className="space-y-4 mb-8 flex-grow border-t border-slate-100 pt-6">
                <p className="font-bold text-slate-900 text-sm mb-4">Bao gồm:</p>
                {pkg.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-teal-50 p-1">
                      <Check className="h-3 w-3 text-teal-600" strokeWidth={3} />
                    </div>
                    <span className="text-slate-600 text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-6 border-t border-slate-100">
                <p className="text-sm font-medium text-slate-500 mb-4">
                  Phù hợp với: <span className="text-slate-900 font-bold">{pkg.bestFor}</span>
                </p>
                <a
                  href="#book"
                  className={`w-full flex justify-center items-center gap-2 py-3.5 rounded-xl font-bold transition-all duration-200 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 ${pkg.buttonStyle}`}
                >
                  Chọn Gói <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
