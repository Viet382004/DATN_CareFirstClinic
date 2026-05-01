import Header from "../components/Header";
import {Footer} from "../components/Footer";

export default function NewsPage() {
  const news = [
    {
      id: 1,
      title: "CareFirstClinic khai trương cơ sở mới tại Gò Vấp",
      date: "24/04/2026",
      category: "Tin Hoạt Động",
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800",
      excerpt: "Nhằm đáp ứng nhu cầu khám chữa bệnh ngày càng cao, CareFirstClinic chính thức khai trương cơ sở thứ 3 tại Gò Vấp với nhiều ưu đãi hấp dẫn."
    },
    {
      id: 2,
      title: "Cảnh báo dịch sốt xuất huyết đang bùng phát",
      date: "20/04/2026",
      category: "Tin Y Tế",
      image: "https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&q=80&w=800",
      excerpt: "Theo Bộ Y tế, số ca mắc sốt xuất huyết đang tăng nhanh. Hãy cùng tìm hiểu các biện pháp phòng tránh và dấu hiệu nhận biết sớm."
    },
    {
      id: 3,
      title: "Tọa đàm: Dinh dưỡng cho trẻ trong mùa hè",
      date: "15/04/2026",
      category: "Sự Kiện",
      image: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=800",
      excerpt: "Mời quý phụ huynh tham gia buổi tọa đàm miễn phí cùng bác sĩ chuyên khoa nhi tại CareFirstClinic Quận 1 vào cuối tuần này."
    },
    {
      id: 4,
      title: "Chương trình khám sức khỏe doanh nghiệp 2026",
      date: "10/04/2026",
      category: "Khuyến Mãi",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800",
      excerpt: "CareFirstClinic tung gói khám sức khỏe định kỳ cho doanh nghiệp với mức chiết khấu lên đến 30% khi đăng ký trước tháng 6."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 container-page py-12 md:py-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black text-teal-800 mb-2">Tin Tức Y Tế</h1>
            <p className="text-slate-600">Cập nhật những thông tin mới nhất về sức khỏe và các hoạt động của phòng khám.</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {news.map(item => (
            <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group cursor-pointer flex flex-col">
              <div className="relative overflow-hidden h-48">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-4 left-4 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {item.category}
                </span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <p className="text-slate-400 text-sm mb-2">{item.date}</p>
                <h3 className="text-lg font-bold text-slate-800 mb-3 group-hover:text-teal-600 transition-colors">{item.title}</h3>
                <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-1">{item.excerpt}</p>
                <button className="text-teal-600 font-bold text-sm text-left hover:text-teal-700">Đọc tiếp →</button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
