import { useState, useEffect } from "react";
import  Header  from "../components/Header";
import { Hero } from "../components/Hero";
import { QuickActions } from "../components/QuickActions";
import Services from "../components/Services";
import { FeaturedDoctors } from "../components/FeaturedDoctors";
import { HowItWorks } from "../components/HowItWorks";
import { Pricing } from "../components/Pricing";
import { Testimonials } from "../components/Testimonials";
import { BookingWidget } from "../components/BookingWidget";
import  LocationContact  from "../components/LocationContact";
import { Footer } from "../components/Footer";
import { StickyCTA } from "../components/StickyCTA";
import { AIChat } from "../components/AIChat";
import { motion, useScroll } from "framer-motion";
import { ChevronUp } from "lucide-react";

export default function App() {
  const { scrollYProgress } = useScroll();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full font-['Inter',sans-serif] bg-gray-50 text-slate-800 min-h-screen relative overflow-x-hidden selection:bg-teal-100 selection:text-teal-900">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-teal-600 z-50 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Emergency Banner */}
      <div className="bg-amber-400 text-slate-900 text-sm font-bold py-2 px-4 text-center z-40 relative">
        🚨 Cấp cứu y tế? Gọi 115 ngay lập tức. Để được hỗ trợ nhanh,{" "}
        <a href="#contact" className="underline text-teal-800">
          bấm vào đây
        </a>
        .
      </div>

      <Header />
      
      <main>
        <Hero />
        <QuickActions />
        <Services />
        <FeaturedDoctors />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <div className="w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24" id="book">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col lg:flex-row border border-slate-100">
             <div className="lg:w-1/2 p-8 lg:p-12 bg-teal-600 text-white flex flex-col justify-center relative overflow-hidden">
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-700 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-x-1/2 translate-y-1/2"></div>
                
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold mb-4">Đặt Lịch Khám Trực Tuyến</h2>
                  <p className="text-teal-100 mb-8 text-lg">
                    Không còn phải xếp hàng chờ đợi. Chủ động thời gian, đặt lịch dễ dàng chỉ trong 2 phút.
                  </p>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 bg-teal-700/30 p-4 rounded-2xl backdrop-blur-sm">
                      <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center shadow-inner">
                         <span className="text-2xl">👩‍⚕️</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold">1. Chọn Chuyên khoa</h4>
                        <p className="text-sm text-teal-100">Tìm bác sĩ phù hợp với triệu chứng</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-teal-700/30 p-4 rounded-2xl backdrop-blur-sm">
                      <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center shadow-inner">
                         <span className="text-2xl">📅</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold">2. Chọn Thời gian</h4>
                        <p className="text-sm text-teal-100">Lựa chọn ngày giờ thuận tiện cho bạn</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-teal-700/30 p-4 rounded-2xl backdrop-blur-sm">
                      <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center shadow-inner">
                         <span className="text-2xl">✅</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold">3. Nhận Xác nhận</h4>
                        <p className="text-sm text-teal-100">Tin nhắn SMS xác nhận lịch hẹn</p>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
             <div className="lg:w-1/2 p-8 lg:p-12 bg-white relative z-10">
                <BookingWidget />
             </div>
          </div>
        </div>
        <LocationContact />
      </main>

      <Footer />
      <StickyCTA />
      <AIChat />

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-4 md:bottom-8 md:right-8 bg-slate-800 text-white p-3 rounded-full shadow-lg hover:bg-slate-700 transition-colors z-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
          aria-label="Back to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}

      {/* Admin Preview Optional - skipping for simplicity unless needed, it says optional */}
    </div>
  );
}
