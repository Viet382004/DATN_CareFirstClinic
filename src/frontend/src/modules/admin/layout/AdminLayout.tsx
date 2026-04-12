import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { 
  Bell, 
  Search, 
  Menu, 
  X,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../../contexts/useAuth';

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar with state pass-through if needed, but here we can just use the state for layout */}
      <Sidebar isOpen={isSidebarOpen} />

      {/* Main Content Wrapper */}
      <div className={`flex flex-1 flex-col transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-20'}`}>
        {/* Header / Topbar */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-500 hover:bg-slate-50 rounded-md transition-colors border border-transparent hover:border-slate-100"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-400">
               <span>Quản trị viên</span>
               <span className="h-4 w-px bg-slate-200"></span>
               <span className="text-slate-900 tracking-tight">Hệ thống tổng quan</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                className="w-80 rounded-md border-none bg-slate-100 py-1.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-indigo-600 focus:outline-none transition-all"
                placeholder="Tìm kiếm hồ sơ, bệnh nhân..."
              />
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

            <button className="relative rounded-md p-2 text-slate-500 hover:bg-slate-50 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
            </button>

            <div className="group relative flex items-center gap-3 pl-2 cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-900 leading-none">{user?.fullName || 'Admin'}</p>
                <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user?.role || 'Hệ thống'}</p>
              </div>
              <div className="h-8 w-8 rounded-md bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-sm shadow-indigo-100">
                 {user?.fullName?.substring(0, 1) || 'A'}
              </div>
              <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
