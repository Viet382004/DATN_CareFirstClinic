import { motion } from "framer-motion";
import { Search, ShieldCheck, CheckCircle2, HeartPulse, Award } from "lucide-react";

export function Hero() {
  return (
    <section className="relative bg-white py-20 lg:py-28 overflow-hidden" id="home">
      {/* Modern Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-teal-50 -skew-x-12 translate-x-1/4 pointer-events-none z-0"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-left"
        >
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-xs font-bold mb-6">
            <ShieldCheck size={16} />
            Phòng khám Đa khoa Tiêu chuẩn Quốc tế
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1]">
            Chăm sóc sức khỏe <br />
            <span className="text-teal-600">toàn diện</span> cho bạn
          </h1>
          <p className="text-lg text-slate-500 mb-10 max-w-lg leading-relaxed">
            CareFirst+ kết nối bạn với đội ngũ y bác sĩ giỏi, tận tâm. 
            Đặt lịch khám nhanh chóng, dịch vụ y tế chất lượng cao ngay tại phòng khám.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mb-8">
            <div className="bg-white p-2 rounded-2xl shadow-2xl flex items-center border border-slate-200">
              <div className="pl-4 pr-3 text-slate-500 hidden sm:block">
                <Search size={20} />
              </div>
              <input 
                type="text" 
                placeholder="Tìm bác sĩ, chuyên khoa, dịch vụ..." 
                className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-slate-800 font-medium py-3 px-4 sm:px-0 w-full"
              />
              <button className="bg-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-700 transition-all ml-2 shrink-0">
                Tìm kiếm
              </button>
            </div>
          </div>

          {/* Bullet Points */}
          <div className="flex flex-wrap gap-4 sm:gap-6 text-sm font-bold text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" />
              <span>Đặt khám nhanh</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" />
              <span>Đội ngũ Chuyên gia</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" />
              <span>Bảo mật thông tin</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative hidden md:block"
        >
          <div className="relative rounded-[40px] overflow-hidden shadow-2xl border-8 border-white">
            <img 
              src="https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=1200" 
              alt="Cơ sở vật chất hiện đại" 
              className="w-full h-[500px] object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
          </div>
          
          {/* Floating Cards */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 z-20"
          >
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <HeartPulse size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Sức khỏe</p>
              <p className="text-sm font-black text-slate-900">100% Tin cậy</p>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 z-20"
          >
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Award size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Chất lượng</p>
              <p className="text-sm font-black text-slate-900">Chuẩn quốc tế</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

