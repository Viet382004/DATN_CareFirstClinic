import { useState, type ReactNode } from "react";
import {
  Menu,
  X,
  Phone,
  Smartphone,
  UserCircle,
  ChevronDown,
  Music2,
  MessageCircle,
  PlayCircle,
} from "lucide-react";

type TopNavLinkProps = {
  children: ReactNode;
};

const TopNavLink = ({ children }: TopNavLinkProps) => (
  <a
    href="#"
    className="flex items-center gap-1 transition-colors hover:text-teal-600"
  >
    {children}
  </a>
);

type NavMenuItemProps = {
  children: ReactNode;
  hasSubmenu?: boolean;
};

const NavMenuItem = ({
  children,
  hasSubmenu = false,
}: NavMenuItemProps) => (
  <a
    href="#"
    className="flex items-center gap-1 whitespace-nowrap text-sm font-bold text-slate-900 transition-colors hover:text-teal-600"
  >
    {children}
    {hasSubmenu && <ChevronDown size={14} />}
  </a>
);

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
      {/* TOP BAR */}
      <div className="hidden lg:block border-b border-slate-100">
        <div className="container-page flex h-10 items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <TopNavLink>
              <Music2 size={14} /> Tiktok
            </TopNavLink>
            <span className="text-slate-300">|</span>

            <TopNavLink>
              <MessageCircle size={14} /> Facebook
            </TopNavLink>
            <span className="text-slate-300">|</span>

            <TopNavLink>
              <MessageCircle size={14} /> Zalo
            </TopNavLink>
            <span className="text-slate-300">|</span>

            <TopNavLink>
              <PlayCircle size={14} /> Youtube
            </TopNavLink>
          </div>

          <div className="ml-8 flex items-center gap-5 xl:ml-10">
  <button className="flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:bg-amber-600 hover:shadow-md">
    <Smartphone size={16} />
    Tải ứng dụng
  </button>

  <button className="flex items-center gap-2 rounded-full border border-teal-600 px-5 py-2 text-sm font-bold text-teal-600 shadow-sm transition-all duration-300 hover:bg-teal-50 hover:shadow-md">
    <UserCircle size={16} />
    Tài khoản
  </button>

  <div className="flex cursor-pointer items-center gap-2 pl-2 transition-colors hover:text-teal-600">
    <img
      src="https://flagcdn.com/w20/vn.png"
      alt="VN"
      className="h-4 w-6 rounded-sm object-cover shadow-sm"
    />
    <ChevronDown size={14} />
  </div>
</div>
        </div>
      </div>

      {/* MAIN NAVBAR */}
      <div className="container-page flex h-20 items-center justify-between">
        <div className="flex items-center gap-8 xl:gap-12">
          <a href="/" className="flex items-center">
            <span className="tracking-tighter text-3xl font-black text-teal-600">
              CareFirst
              <span className="text-amber-500">+</span>
            </span>
          </a>

          <div className="hidden items-center gap-3 md:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
              <Phone size={20} fill="currentColor" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase leading-none text-slate-500">
                Tư vấn/Đặt khám
              </p>
              <p className="mt-1 text-xl font-black leading-none text-amber-500">
                1900 2115
              </p>
            </div>
          </div>
        </div>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-6 lg:flex">
          <NavMenuItem hasSubmenu>Cơ sở y tế</NavMenuItem>
          <NavMenuItem hasSubmenu>Dịch vụ y tế</NavMenuItem>
          <NavMenuItem>Khám sức khỏe</NavMenuItem>
          <NavMenuItem hasSubmenu>Tin tức</NavMenuItem>
          <NavMenuItem hasSubmenu>Hướng dẫn</NavMenuItem>
        </nav>

        {/* MOBILE MENU BUTTON */}
        <div className="flex items-center gap-4 lg:hidden">
          <a
            href="#book"
            className="rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-white"
          >
            Đặt khám
          </a>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-500 transition-colors hover:text-slate-700"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="absolute left-0 w-full border-t border-slate-100 bg-white shadow-lg lg:hidden">
          <div className="container-page flex flex-col space-y-4 py-4">
            <a
              href="#"
              className="border-b border-slate-50 py-2 font-bold text-slate-800"
            >
              Cơ sở y tế
            </a>

            <a
              href="#"
              className="border-b border-slate-50 py-2 font-bold text-slate-800"
            >
              Dịch vụ y tế
            </a>

            <a
              href="#"
              className="border-b border-slate-50 py-2 font-bold text-slate-800"
            >
              Khám sức khỏe
            </a>

            <a
              href="#"
              className="border-b border-slate-50 py-2 font-bold text-slate-800"
            >
              Tin tức
            </a>

            <div className="flex items-center justify-between pt-4">
              <button className="flex items-center gap-2 rounded-full border border-teal-600 px-4 py-2 font-bold text-teal-600">
                <UserCircle size={18} /> Đăng nhập
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <Phone size={20} fill="currentColor" />
                </div>

                <div>
                  <p className="text-xl font-black leading-none text-amber-500">
                    1900 2115
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TICKER BAR */}
      <div className="relative flex h-10 w-full items-center overflow-hidden bg-amber-50">
        <div className="animate-[ticker_20s_linear_infinite] flex items-center gap-8 whitespace-nowrap text-sm font-bold text-amber-600">
          <span>📞 Gọi ngay 1900 2115!</span>
          <span>
            ✨ Đặt lịch trực tuyến nhanh chóng, tiết kiệm thời gian chờ đợi.
          </span>
          <span>📞 Hỗ trợ tư vấn 24/7!</span>
          <span>
            ✨ Khám tổng quát chuyên sâu với trang thiết bị hiện đại.
          </span>
          <span>📞 Gọi ngay 1900 2115!</span>
          <span>
            ✨ Đặt lịch trực tuyến nhanh chóng, tiết kiệm thời gian chờ đợi.
          </span>
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes ticker {
                0% { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
              }
            `,
          }}
        />
      </div>
    </header>
  );
};

export default Header;