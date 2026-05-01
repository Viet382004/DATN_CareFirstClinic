import Header from "../components/Header";
import {Footer} from "../components/Footer";

export default function CheckupsPage() {
  const packages = [
    {
      id: "basic",
      name: "Gói Khám Cơ Bản",
      target: "Người dưới 30 tuổi",
      price: "1.200.000đ",
      features: [
        "Khám nội tổng quát",
        "Đo huyết áp, BMI",
        "Xét nghiệm máu (Đường, Mỡ, Gan, Thận)",
        "Tổng phân tích nước tiểu",
        "Chụp X-quang tim phổi"
      ],
      popular: false
    },
    {
      id: "advanced",
      name: "Gói Khám Chuyên Sâu",
      target: "Người trên 30 tuổi",
      price: "2.500.000đ",
      features: [
        "Tất cả danh mục của gói Cơ Bản",
        "Siêu âm ổ bụng màu",
        "Siêu âm tuyến giáp",
        "Điện tâm đồ (ECG)",
        "Tầm soát ung thư (1 dấu ấn)",
        "Khám chuyên khoa mắt/răng miệng"
      ],
      popular: true
    },
    {
      id: "vip",
      name: "Gói Tầm Soát Ung Thư VIP",
      target: "Người có nguy cơ cao",
      price: "4.800.000đ",
      features: [
        "Tất cả danh mục của gói Chuyên Sâu",
        "Siêu âm tim màu",
        "Tầm soát ung thư toàn diện (5 dấu ấn)",
        "Nội soi dạ dày (gây mê)",
        "Tư vấn dinh dưỡng chuyên sâu"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 container-page py-12 md:py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-teal-800 mb-4">Các Gói Khám Sức Khỏe</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Phòng bệnh hơn chữa bệnh. Khám sức khỏe định kỳ giúp phát hiện sớm các rủi ro, bảo vệ sức khỏe cho bạn và người thân.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.map(pkg => (
            <div key={pkg.id} className={`bg-white rounded-3xl p-8 relative flex flex-col ${pkg.popular ? 'ring-4 ring-amber-400 shadow-2xl scale-105 z-10' : 'shadow-md border border-slate-100'}`}>
              {pkg.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-bold tracking-wider">
                  ĐƯỢC CHỌN NHIỀU NHẤT
                </div>
              )}
              
              <div className="text-center mb-8">
                <p className="text-sm font-bold text-teal-600 uppercase tracking-widest mb-2">{pkg.target}</p>
                <h3 className="text-2xl font-black text-slate-800 mb-4">{pkg.name}</h3>
                <div className="text-4xl font-black text-slate-900">{pkg.price}</div>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-teal-500 mt-1">✓</span>
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className={`w-full py-3 px-6 rounded-full font-bold text-center transition-all ${pkg.popular ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}>
                Đặt gói khám này
              </button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
