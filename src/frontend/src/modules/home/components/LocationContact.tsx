import { MapPin, Clock, Phone, Mail, Car, Send } from "lucide-react";

const LocationContact = () => {
  return (
    <section
      id="contact"
      className="border-t border-slate-100 bg-slate-50 py-16 lg:py-24"
    >
      <div className="container-page">
        {/* SECTION HEADER */}
        <div className="mb-16 text-center">
          <h2 className="section-title mb-4">Vị trí & Liên hệ</h2>

          <p className="mx-auto max-w-2xl text-base font-medium text-slate-500">
            Phòng khám tọa lạc tại vị trí thuận tiện, có bãi đỗ xe miễn phí cho
            bệnh nhân.
          </p>
        </div>

        {/* MAIN CARD */}
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col lg:flex-row">
            {/* LEFT SIDE */}
            <div className="relative flex flex-col justify-center p-8 lg:w-1/2 lg:p-12">
              <h3 className="mb-8 text-2xl font-bold text-slate-900">
                Thông tin Phòng khám
              </h3>

              <div className="space-y-8">
                {/* ADDRESS */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50">
                    <MapPin className="h-6 w-6 text-teal-600" />
                  </div>

                  <div>
                    <p className="mb-1 font-bold text-slate-900">Địa chỉ</p>
                    <p className="text-sm leading-relaxed text-slate-600">
                      123 Nguyễn Văn Linh
                      <br />
                      Quận 7, TP. Hồ Chí Minh
                    </p>
                  </div>
                </div>

                {/* TIME */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50">
                    <Clock className="h-6 w-6 text-teal-600" />
                  </div>

                  <div>
                    <p className="mb-1 font-bold text-slate-900">
                      Giờ làm việc
                    </p>
                    <p className="text-sm text-slate-600">
                      Thứ 2 - Thứ 7: 7:30 - 20:00
                    </p>
                    <p className="text-sm text-slate-600">
                      Chủ Nhật: 8:00 - 12:00
                    </p>
                  </div>
                </div>

                {/* HOTLINE */}
                <div className="group flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 transition-colors group-hover:bg-amber-500">
                    <Phone className="h-6 w-6 text-amber-600 transition-colors group-hover:text-white" />
                  </div>

                  <div>
                    <p className="mb-1 font-bold text-slate-900">
                      Hotline (24/7)
                    </p>
                    <a
                      href="tel:19002115"
                      className="text-lg font-black text-amber-600 hover:underline"
                    >
                      1900 2115
                    </a>
                  </div>
                </div>

                {/* EMAIL */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50">
                    <Mail className="h-6 w-6 text-teal-600" />
                  </div>

                  <div>
                    <p className="mb-1 font-bold text-slate-900">Email</p>
                    <a
                      href="mailto:care@medicareplus.com"
                      className="text-sm text-slate-600 transition-colors hover:text-teal-600"
                    >
                      care@medicareplus.com
                    </a>
                  </div>
                </div>

                {/* PARKING */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50">
                    <Car className="h-6 w-6 text-teal-600" />
                  </div>

                  <div>
                    <p className="mb-1 font-bold text-slate-900">Bãi đỗ xe</p>
                    <p className="text-sm text-slate-600">
                      Miễn phí đỗ xe ô tô và xe máy
                    </p>
                  </div>
                </div>
              </div>

              {/* MAP */}
              <div className="mt-12 h-64 w-full overflow-hidden rounded-2xl bg-slate-200 shadow-inner">
                <iframe
                  title="Clinic Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.0242203799636!2d106.71183767512702!3d10.732613260002821!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f82ba1abeb9%3A0xc35fc6d5b0c950a7!2s123%20Nguy%E1%BB%85n%20V%C4%83n%20Linh%2C%20Qu%E1%BA%ADn%207%2C%20H%E1%BB%93%20Ch%C3%AD%20Minh%2C%20Vietnam!5e0!3m2!1sen!2s!4v1707328905333!5m2!1sen!2s"
                  width="100%"
                  height="100%"
                  style={{
                    border: 0,
                    filter: "grayscale(100%) contrast(90%)",
                  }}
                  loading="lazy"
                />
              </div>
            </div>

            {/* RIGHT FORM */}
            <div className="flex flex-col bg-slate-900 p-8 text-white lg:w-1/2 lg:p-12">
              <h3 className="mb-3 break-words text-2xl font-bold leading-tight">
                Gửi tin nhắn cho chúng tôi
              </h3>

              <p className="mb-8 text-sm leading-6 text-slate-400">
                Bạn có câu hỏi về dịch vụ hoặc cần hỗ trợ tìm bác sĩ? Chúng tôi
                sẽ phản hồi trong vòng 2 giờ.
              </p>

              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Tin nhắn đã được gửi!");
                }}
              >
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    Địa chỉ Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nguyenvana@example.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    Tin nhắn
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Bạn cần chúng tôi giúp gì?"
                    className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-4 font-bold text-white shadow-md transition-all duration-200 hover:bg-teal-500 hover:shadow-lg"
                >
                  Gửi Tin Nhắn <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationContact;
