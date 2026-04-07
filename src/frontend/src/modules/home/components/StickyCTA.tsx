import { HeartPulse } from "lucide-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";

export function StickyCTA() {
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 500) {
      setShow(true);
    } else {
      setShow(false);
    }
  });

  return (
    <AnimatePresence>
      {show && (
        <motion.a
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          href="#book"
          className="md:hidden fixed bottom-24 right-4 z-40 bg-amber-500 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:bg-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
          aria-label="Đặt Khám"
        >
          <div className="absolute -top-1 -right-1 bg-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white animate-pulse">
            Đặt
          </div>
          <HeartPulse className="w-6 h-6" />
        </motion.a>
      )}
    </AnimatePresence>
  );
}