import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold tracking-tight text-blue-600"
        >
          CareFirstClinic
        </Link>

        {/* Menu */}
        <nav className="hidden gap-8 md:flex">
          <Link to="/" className="font-medium text-slate-700 hover:text-blue-600">
            Trang chủ
          </Link>
          <Link
            to="/specialties"
            className="font-medium text-slate-700 hover:text-blue-600"
          >
            Chuyên khoa
          </Link>
          <Link
            to="/doctors"
            className="font-medium text-slate-700 hover:text-blue-600"
          >
            Bác sĩ
          </Link>
          <Link
            to="/patient/booking/select-specialty"
            className="font-medium text-slate-700 hover:text-blue-600"
          >
            Đặt lịch
          </Link>
          <Link
            to="/contact"
            className="font-medium text-slate-700 hover:text-blue-600"
          >
            Liên hệ
          </Link>
        </nav>

        {/* CTA */}
        <button
          onClick={() => navigate("/patient/booking/select-specialty")}
          className="rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white"
        >
          Đặt lịch ngay
        </button>
      </div>
    </header>
  );
};

export default Navbar;