import Header from "../components/Header";
import {Footer} from "../components/Footer";

export default function GuidesPage() {
  const guides = [
    {
      id: 1,
      icon: "📅",
      title: "Hướng dẫn đặt lịch khám",
      steps: [
        "Đăng nhập vào hệ thống hoặc tạo tài khoản mới.",
        "Chọn chuyên khoa và bác sĩ bạn muốn khám.",
        "Chọn ngày và giờ phù hợp với lịch trình của bạn.",
        "Xác nhận thông tin và nhận tin nhắn SMS/Email thông báo."
      ]
    },
    {
      id: 2,
      icon: "🏥",
      title: "Cần chuẩn bị gì khi đi khám?",
      steps: [
        "Mang theo CMND/CCCD và Thẻ Bảo hiểm Y tế (nếu có).",
        "Nhịn ăn sáng nếu bạn có lịch xét nghiệm máu hoặc siêu âm.",
        "Mang theo các kết quả xét nghiệm, đơn thuốc cũ (nếu có).",
        "Đến trước 15 phút so với giờ hẹn để làm thủ tục check-in."
      ]
    },
    {
      id: 3,
      icon: "💳",
      title: "Quy trình thanh toán & Nhận thuốc",
      steps: [
        "Thanh toán chi phí khám ban đầu tại quầy thu ngân hoặc qua VNPay.",
        "Sau khi khám và làm xét nghiệm, quay lại phòng bác sĩ nghe kết luận.",
        "Nhận đơn thuốc, thanh toán phần thuốc tại quầy.",
        "Đến quầy Dược để nhận thuốc và nghe hướng dẫn sử dụng."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 container-page py-12 md:py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-teal-800 mb-4">Hướng Dẫn Cho Bệnh Nhân</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Quy trình khám bệnh tại CareFirstClinic được thiết kế tinh gọn, giúp bạn tiết kiệm thời gian và có trải nghiệm thoải mái nhất.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-8">
          {guides.map(guide => (
            <div key={guide.id} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-start">
              <div className="w-16 h-16 shrink-0 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl">
                {guide.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">{guide.title}</h3>
                <ul className="space-y-3">
                  {guide.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-sm font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-slate-600 leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
