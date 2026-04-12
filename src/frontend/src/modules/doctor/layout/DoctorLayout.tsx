import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  UserCircle, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  Search,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { doctorService } from '../../../services/doctorService';
import type { Doctor } from '../../../types/doctor';

const DoctorLayout: React.FC = () => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    doctorService.getMe().then(setDoctor).catch(() => navigate('/login'));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { path: '/doctor/dashboard', icon: <LayoutDashboard size={18} />, label: 'Tổng quan' },
    { path: '/doctor/appointments', icon: <ClipboardList size={18} />, label: 'Hàng chờ khám' },
    { path: '/doctor/schedule', icon: <Calendar size={18} />, label: 'Lịch làm việc' },
    { path: '/doctor/profile', icon: <UserCircle size={18} />, label: 'Hồ sơ cá nhân' },
  ];

  const currentPath = location.pathname;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-slate-200 transition-all duration-200 flex flex-col z-30`}
      >
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="h-8 w-8 bg-indigo-600 rounded flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          {isSidebarOpen && <span className="font-bold text-slate-800 tracking-tight">CareFirst <span className="text-indigo-600">Doctor</span></span>}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>{item.icon}</span>
                {isSidebarOpen && <span className="text-sm">{item.label}</span>}
                {isActive && isSidebarOpen && <ChevronRight size={14} className="ml-auto opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-md transition-colors"
          >
            <LogOut size={18} />
            {isSidebarOpen && <span className="text-sm font-medium">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-500 hover:bg-slate-50 rounded-md"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="font-semibold text-slate-700 text-sm hidden md:block">
               {navItems.find(n => n.path === currentPath)?.label || 'Bác sĩ'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Tìm bệnh nhân..." 
                    className="bg-slate-100 border-none rounded-md pl-10 pr-4 py-1.5 text-sm w-64 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
             </div>
             <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-md relative transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 border-2 border-white rounded-full"></span>
             </button>
             <div className="h-8 w-px bg-slate-200 mx-1"></div>
             <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden md:block">
                    <p className="text-xs font-bold text-slate-900">{doctor?.fullName || 'Đang tải...'}</p>
                    <p className="text-[10px] text-slate-500 font-medium">Bác sĩ chuyên khoa</p>
                </div>
                <img 
                    src={doctor?.avatarUrl || `https://ui-avatars.com/api/?name=${doctor?.fullName}&background=4f46e5&color=fff`} 
                    alt="avatar" 
                    className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                />
             </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
           <div className="max-w-[1600px] mx-auto">
              <Outlet />
           </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;
