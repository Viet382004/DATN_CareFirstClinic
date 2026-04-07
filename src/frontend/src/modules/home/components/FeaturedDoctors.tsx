import { useState, useEffect } from "react";
import { Star, Users, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { ImageWithFallback } from "../../../components/figma/ImageWithFallback";

const doctors = [
  {
    id: 1,
    name: "PGS.TS.BS Nguyễn Thị Lan",
    specialty: "Nội Tim Mạch",
    hospital: "Bệnh viện Đại học Y Dược",
    rating: "5.0",
    patients: "2k+",
    img: "https://images.unsplash.com/photo-1612944095914-33fd0a85fcfc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGZlbWFsZSUyMGRvY3RvciUyMHBvcnRyYWl0JTIwc21pbGluZ3xlbnwxfHx8fDE3NzU0ODU3NDZ8MA&ixlib=rb-4.1.0&q=80&w=400"
  },
  {
    id: 2,
    name: "ThS.BS Trần Hữu Khang",
    specialty: "Nội Thần Kinh",
    hospital: "Bệnh viện Chợ Rẫy",
    rating: "4.9",
    patients: "1.5k+",
    img: "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMG1hbGUlMjBkb2N0b3IlMjBwb3J0cmFpdCUyMHNtaWxpbmd8ZW58MXx8fHwxNzc1NDg1NzQ2fDA&ixlib=rb-4.1.0&q=80&w=400"
  },
  {
    id: 3,
    name: "BS.CKII Lê Minh Quân",
    specialty: "Cơ Xương Khớp",
    hospital: "Bệnh viện Chấn thương Chỉnh hình",
    rating: "4.8",
    patients: "3k+",
    img: "https://images.unsplash.com/photo-1642975967602-653d378f3b5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMG1hbGUlMjBkb2N0b3IlMjBwb3J0cmFpdCUyMGhvc3BpdGFsfGVufDF8fHx8MTc3NTQ4NTc0Nnww&ixlib=rb-4.1.0&q=80&w=400"
  },
  {
    id: 4,
    name: "TS.BS Phạm Hoàng Yến",
    specialty: "Nhi Khoa",
    hospital: "Bệnh viện Nhi Đồng 1",
    rating: "5.0",
    patients: "5k+",
    img: "https://images.unsplash.com/photo-1592393532405-fb1f165c4a1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHNlbmlvciUyMGZlbWFsZSUyMGRvY3RvciUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NTQ4NTc0Nnww&ixlib=rb-4.1.0&q=80&w=400"
  }
];

export function FeaturedDoctors() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Bác sĩ chuyên khoa</h2>
            <p className="text-slate-500 font-medium">Đội ngũ bác sĩ chuyên môn cao, tận tâm</p>
          </div>
          <button className="hidden sm:flex text-teal-600 font-bold items-center gap-1 hover:gap-2 transition-all">
            Xem tất cả <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm animate-pulse text-center">
                <div className="w-32 h-32 mx-auto rounded-full bg-slate-200 mb-4 border-4 border-slate-100"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto mb-3"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3 mx-auto mb-4"></div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center gap-4">
                  <div className="h-4 bg-slate-200 rounded w-12"></div>
                  <div className="h-4 bg-slate-200 rounded w-12"></div>
                </div>
              </div>
            ))
          ) : (
            doctors.map((doc, idx) => (
              <motion.div 
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer text-center relative group"
              >
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4 border-4 border-teal-50 group-hover:border-teal-100 transition-colors">
                  <ImageWithFallback 
                    src={doc.img} 
                    alt={doc.name} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <h4 className="font-bold text-slate-900 mb-1">{doc.name}</h4>
                <p className="text-xs font-bold text-teal-600 mb-3 uppercase tracking-wider">{doc.specialty}</p>
                <p className="text-xs text-slate-500 line-clamp-1">{doc.hospital}</p>
                
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center gap-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={14} fill="currentColor" />
                    <span className="text-xs font-bold">{doc.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Users size={14} />
                    <span className="text-xs font-bold">{doc.patients}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <a href="#book" className="block w-full py-2 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors">
                    Đặt khám ngay
                  </a>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <button className="text-teal-600 font-bold inline-flex items-center gap-1 hover:gap-2 transition-all">
            Xem tất cả <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

