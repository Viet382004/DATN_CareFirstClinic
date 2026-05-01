import Header from "../components/Header";
import { Footer } from "../components/Footer";

export default function ServicesPage() {
  const services = [
    {
      id: 1,
      icon: "🩺",
      title: "Khám Tổng Quát",
      description: "Dịch vụ khám sức khỏe toàn diện, tầm soát bệnh lý mạn tính cho mọi lứa tuổi.",
      price: "Từ 200.000đ"
    },
    {
      id: 2,
      icon: "👶",
      title: "Nhi Khoa",
      description: "Khám và điều trị các bệnh lý trẻ em, tư vấn dinh dưỡng và phát triển.",
      price: "Từ 300.000đ"
    },
    {
      id: 3,
      icon: "🩸",
      title: "Xét Nghiệm Y Khoa",
      description: "Hệ thống máy xét nghiệm tự động, trả kết quả nhanh chóng, chính xác (máu, nước tiểu, sinh hóa).",
      price: "Theo chỉ định"
    },
    {
      id: 4,
      icon: "🖥️",
      title: "Chẩn Đoán Hình Ảnh",
      description: "Siêu âm màu 4D, X-Quang kỹ thuật số, đo điện tim đồ.",
      price: "Từ 250.000đ"
    },
    {
      id: 5,
      icon: "🦷",
      title: "Nha Khoa",
      description: "Chăm sóc răng miệng, nhổ răng, trám răng, cạo vôi răng, và chỉnh nha cơ bản.",
      price: "Từ 150.000đ"
    },
    {
      id: 6,
      icon: "💉",
      title: "Tiêm Chủng",
      description: "Cung cấp các loại vắc-xin cho trẻ em và người lớn (viêm gan B, cúm, HPV...).",
      price: "Theo loại vắc-xin"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 container-page py-12 md:py-20 pt-[180px] lg:pt-[220px]">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-teal-800 mb-4">Các Dịch Vụ Y Tế</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Chúng tôi cung cấp đa dạng các dịch vụ y tế chất lượng cao, đáp ứng nhu cầu chăm sóc sức khỏe toàn diện cho bạn và gia đình.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <div key={service.id} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-slate-100 group">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{service.title}</h3>
              <p className="text-slate-600 mb-6 line-clamp-3">{service.description}</p>
              <div className="flex items-center justify-between mt-auto border-t border-slate-100 pt-4">
                <span className="text-sm font-semibold text-slate-500">Chi phí dự kiến:</span>
                <span className="text-amber-600 font-bold">{service.price}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
