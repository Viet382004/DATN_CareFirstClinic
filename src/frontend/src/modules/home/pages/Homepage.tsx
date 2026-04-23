import { useState, useEffect } from "react";
import Header from "../components/Header";
import { Hero } from "../components/Hero";
import { QuickActions } from "../components/QuickActions";
import Services from "../components/Services";
import { FeaturedDoctors } from "../components/FeaturedDoctors";
import { HowItWorks } from "../components/HowItWorks";
import { Pricing } from "../components/Pricing";
import { Testimonials } from "../components/Testimonials";
import LocationContact from "../components/LocationContact";
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
