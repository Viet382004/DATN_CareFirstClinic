import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Users, 
  UserRound, 
  Stethoscope, 
  Package, 
  CreditCard, 
  BarChart3, 
  CalendarClock, 
  Settings,
  UserPlus,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../../lib/utils';

interface SidebarProps {
  isOpen: boolean;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: CalendarCheck, label: 'Lịch hẹn', path: '/admin/appointments' },
  { icon: Users, label: 'Bệnh nhân', path: '/admin/patients' },
  { icon: UserRound, label: 'Bác sĩ', path: '/admin/doctors' },
  { icon: Stethoscope, label: 'Chuyên khoa', path: '/admin/specialties' },
  { icon: UserPlus, label: 'Đặt lịch tại quầy', path: '/admin/walk-in' },
  { icon: Package, label: 'Kho thuốc', path: '/admin/inventory' },
  { icon: CreditCard, label: 'Hóa đơn', path: '/admin/billing' },
  { icon: BarChart3, label: 'Doanh thu', path: '/admin/reports' },
  { icon: CalendarClock, label: 'Lịch trực', path: '/admin/schedule' },
  { icon: Settings, label: 'Cài đặt', path: '/admin/settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-slate-200 bg-white transition-all duration-300 flex flex-col",
        isOpen ? "w-64" : "w-20"
      )}
    >
      <div className="flex h-full flex-col overflow-y-auto scrollbar-none px-3 py-4">
        {/* Logo Section */}
        <div className={cn("mb-8 flex items-center px-2 py-4 border-b border-slate-50 transition-all", isOpen ? "justify-start" : "justify-center")}>
          <div className="flex aspect-square h-8 items-center justify-center rounded-md bg-indigo-600 font-bold text-white shadow-sm shrink-0">
            CP
          </div>
          {isOpen && (
            <span className="ml-3 text-lg font-bold tracking-tight text-slate-800 animate-in fade-in slide-in-from-left-2 duration-300">
              CareFirst <span className="text-indigo-600">Admin</span>
            </span>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'group flex items-center rounded-md px-3 py-2 text-sm font-bold transition-all duration-200 relative',
                  isActive
                    ? 'bg-slate-100 text-indigo-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                )
              }
            >
              <item.icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-colors duration-200',
                  isOpen ? "mr-3" : "mx-auto"
                )}
              />
              {isOpen && (
                <span className="animate-in fade-in slide-in-from-left-2 duration-300 truncate tracking-tight">
                  {item.label}
                </span>
              )}
              {isOpen && (
                 <ChevronRight 
                   className="ml-auto h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" 
                 />
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer info */}
        {isOpen && (
          <div className="mt-auto p-3 rounded-md bg-slate-50 border border-slate-100">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Clinic Center</p>
            <p className="text-xs font-black text-slate-800 tracking-tight">CareFirst v2.0</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
