import { Star, Quote, CheckCircle2 } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ImageWithFallback } from "../../../components/figma/ImageWithFallback";

const testimonials = [
  {
    id: 1,
    name: "Trần Minh Hoàng",
    rating: 5,
    condition: "Điều trị Cao huyết áp",
    quote: "Tôi được khám ngay trong vòng 15 phút. Bác sĩ giải thích rất rõ ràng và đưa ra phác đồ điều trị huyết áp vô cùng thực tế.",
    avatar: "https://images.unsplash.com/photo-1738566061505-556830f8b8f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHByb2Zlc3Npb25hbCUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NTQ0OTE2OHww&ixlib=rb-4.1.0&q=80&w=200",
  },
  {
    id: 2,
    name: "Lê Ngọc Hân",
    rating: 5,
    condition: "Khám Nhi",
    quote: "Bác sĩ nhi khoa rất tuyệt vời với con gái tôi, giúp bé cảm thấy hoàn toàn thoải mái. Không gian phòng khám rất thân thiện với trẻ em.",
    avatar: "https://images.unsplash.com/photo-1764967411658-64b8bdecb0be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMG1vdGhlciUyMGFuZCUyMGNoaWxkJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzc1NDg1NzQ3fDA&ixlib=rb-4.1.0&q=80&w=200",
  },
  {
    id: 3,
    name: "Phạm Văn Long",
    rating: 4,
    condition: "Khám Tổng quát Định kỳ",
    quote: "Quy trình rất hiệu quả. Tôi đặt lịch trực tuyến, đến khám và hoàn tất mọi xét nghiệm trong chưa đầy một giờ. Rất khuyên dùng gói Executive Gold.",
    avatar: "https://images.unsplash.com/photo-1642975967602-653d378f3b5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMG1hbGUlMjBkb2N0b3IlMjBwb3J0cmFpdCUyMGhvc3BpdGFsfGVufDF8fHx8MTc3NTQ4NTc0Nnww&ixlib=rb-4.1.0&q=80&w=200",
  },
  {
    id: 4,
    name: "Nguyễn Thị Thảo",
    rating: 5,
    condition: "Khám Cơ Xương Khớp",
    quote: "Sau nhiều tháng đau đầu gối, bác sĩ chuyên khoa ở đây cuối cùng đã chẩn đoán chính xác và đưa ra phác đồ điều trị. Bây giờ tôi cảm thấy tốt hơn rất nhiều.",
    avatar: "https://images.unsplash.com/photo-1765248149073-69113caaa253?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGVsZGVybHklMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NTQ4NTc0N3ww&ixlib=rb-4.1.0&q=80&w=200",
  }
];

export function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" }, [
    Autoplay({ delay: 5000, stopOnInteraction: true })
  ]);

  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900 mb-4">
            Đánh giá từ Bệnh nhân
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto font-medium">
            Được cộng đồng tin tưởng hơn một thập kỷ. Lắng nghe những chia sẻ chân thực từ bệnh nhân của chúng tôi.
          </p>
        </div>

        <div className="relative group">
          <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
            <div className="flex gap-6 py-4 px-2">
              {testimonials.map((test) => (
                <div key={test.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0">
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative h-full flex flex-col">
                    <Quote className="absolute top-6 left-6 h-12 w-12 text-teal-600 opacity-10" />
                    
                    <div className="flex items-center gap-1 mb-6 relative z-10">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < test.rating ? 'fill-amber-500 text-amber-500' : 'fill-slate-200 text-slate-200'}`} />
                      ))}
                    </div>

                    <p className="text-slate-700 italic mb-8 relative z-10 flex-grow text-[15px] leading-relaxed">
                      "{test.quote}"
                    </p>

                    <div className="flex items-center gap-4 mt-auto border-t border-slate-50 pt-6">
                      <ImageWithFallback 
                        src={test.avatar} 
                        alt={test.name} 
                        className="w-12 h-12 rounded-full object-cover shadow-sm border-2 border-white"
                        loading="lazy"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1">
                          {test.name} 
                          <span className="flex items-center gap-0.5 text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-bold ml-1 border border-blue-100">
                            <CheckCircle2 size={10} /> Đã khám
                          </span>
                        </h4>
                        <p className="text-teal-600 text-xs font-bold mt-0.5">{test.condition}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-8">
             {testimonials.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => emblaApi?.scrollTo(idx)}
                  className="w-2.5 h-2.5 rounded-full bg-slate-300 hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 transition-colors"
                  aria-label={`Go to slide ${idx + 1}`}
                />
             ))}
          </div>
        </div>
      </div>
    </section>
  );
}
