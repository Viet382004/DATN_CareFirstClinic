import React from 'react';
import { 
  Settings, 
  Globe, 
  ShieldCheck, 
  Bell, 
  Database, 
  Languages, 
  Save, 
  Building2, 
  PhoneCall, 
  Clock,
  MapPin
} from 'lucide-react';

const AdminSettings: React.FC = () => {
  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cài đặt hệ thống</h1>
        <p className="mt-1 text-slate-500">Quản lý các cấu hình chung, thông tin phòng khám và bảo mật.</p>
      </div>

      {/* Tabs Simulation */}
      <div className="flex gap-1 border-b border-slate-200">
        {['Chung', 'Phòng khám', 'Thông báo', 'Bảo mật'].map((tab, i) => (
          <button 
            key={tab}
            className={`px-6 py-3 text-sm font-bold transition-all ${i === 0 ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Clinic Info Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-600" />
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Thông tin phòng khám</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Tên phòng khám</label>
              <input 
                type="text" 
                defaultValue="CareFirst Clinic Central"
                className="w-full rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Hotline tiếp nhận</label>
              <input 
                type="text" 
                defaultValue="0987 654 321"
                className="w-full rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Địa chỉ trụ sở</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  defaultValue="123 Đường ABC, Quận X, TP. Hồ Chí Minh"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Operating Hours Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Thời gian hoạt động</h3>
          </div>
          
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-sm font-bold text-slate-700">Thứ 2 - Thứ 6</span>
              <div className="flex items-center gap-2">
                 <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg uppercase">07:30 - 18:00</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-sm font-bold text-slate-700">Thứ 7</span>
              <div className="flex items-center gap-2">
                 <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg uppercase">08:00 - 16:30</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-bold text-slate-700">Chủ Nhật</span>
              <div className="flex items-center gap-2">
                 <span className="text-xs font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-lg uppercase">Nghỉ</span>
              </div>
            </div>
          </div>
        </section>

        {/* System & Security Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-indigo-600" />
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Hệ thống & Ngôn ngữ</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center text-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <Languages className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">Tiếng Việt</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Ngôn ngữ chính</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center text-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">Bật 2FA</p>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Bảo mật cao</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center text-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">Sao lưu tự động</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Hàng ngày (03:00)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Save Bar */}
        <div className="flex justify-end gap-3 pt-6">
          <button className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">Hủy bỏ</button>
          <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-2.5 text-sm font-black text-white shadow-xl shadow-indigo-600/30 transition-all hover:bg-indigo-700 active:scale-95">
            <Save className="h-4 w-4" />
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
