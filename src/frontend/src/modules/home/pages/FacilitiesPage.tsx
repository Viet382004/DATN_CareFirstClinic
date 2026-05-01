import Header from "../components/Header";
import { Footer } from "../components/Footer";

export default function FacilitiesPage() {
  const facilities = [
    {
      id: 1,
      name: "CareFirstClinic Quận 1 (Trụ Sở Chính)",
      address: "123 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM",
      image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
      phone: "1900 2115",
      hours: "7:30 - 17:00",
      features: ["Khám tổng quát", "Chẩn đoán hình ảnh", "Xét nghiệm", "Nhà thuốc"]
    },
    {
      id: 2,
      name: "CareFirstClinic Quận 7",
      address: "456 Nguyễn Văn Linh, Phường Tân Phú, Quận 7, TP.HCM",
      image: "https://images.unsplash.com/photo-1538108149393-cebb47acddb2?auto=format&fit=crop&q=80&w=800",
      phone: "1900 2116",
      hours: "7:30 - 17:00",
      features: ["Khám tổng quát", "Khám nhi", "Siêu âm"]
    },
    {
      id: 3,
      name: "CareFirstClinic Gò Vấp",
      address: "789 Quang Trung, Phường 10, Gò Vấp, TP.HCM",
      image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=800",
      phone: "1900 2117",
      hours: "8:00 - 18:00",
      features: ["Nha khoa", "Tai Mũi Họng", "Tiêm chủng"]
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 pt-[180px] lg:pt-[220px] container-page py-12 md:py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-teal-800 mb-4">Hệ Thống Cơ Sở Y Tế</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            CareFirstClinic tự hào mang đến hệ thống phòng khám hiện đại, khang trang, đạt chuẩn quốc tế, phủ sóng tại các quận trung tâm giúp khách hàng dễ dàng tiếp cận dịch vụ y tế chất lượng cao.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facilities.map(f => (
            <div key={f.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
              <img src={f.image} alt={f.name} className="w-full h-56 object-cover hover:scale-105 transition-transform duration-500" />
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-slate-800 mb-3">{f.name}</h3>
                <div className="space-y-2 mb-4 text-sm text-slate-600 flex-1">
                  <p className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">📍</span>
                    <span>{f.address}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-amber-500">📞</span>
                    <span>{f.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-amber-500">🕒</span>
                    <span>{f.hours}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-100">
                  {f.features.map((feature, idx) => (
                    <span key={idx} className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded-md font-medium">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
