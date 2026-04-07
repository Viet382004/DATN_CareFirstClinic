import { useNavigate } from "react-router-dom";

const QuickBookingCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="rounded-3xl bg-blue-600 px-8 py-12 text-white">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Sẵn sàng đặt lịch khám?</h2>
          <p className="mt-2 text-blue-100">Chỉ mất 1 phút để hoàn tất.</p>
        </div>
        <button
          onClick={() => navigate("/patient/booking/select-specialty")}
          className="rounded-xl bg-white px-6 py-3 font-semibold text-blue-600"
        >
          Bắt đầu ngay
        </button>
      </div>
    </section>
  );
};

export default QuickBookingCTA;