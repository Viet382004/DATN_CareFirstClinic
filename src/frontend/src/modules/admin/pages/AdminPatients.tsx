import React, { useEffect, useState, useCallback } from 'react';
import { patientService } from '../../../services/patientService';
import type { Patient } from '../../../types/patient';
import {
  Search,
  User,
  Phone,
  Calendar,
  MapPin,
  Mail,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Activity,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';
import { formatDate } from '../../../utils/format';

const AdminPatients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [query, setQuery] = useState({ page: 1, pageSize: 9 });

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await patientService.getAll();
      setPatients(res);
    } catch (error) {
      toast.error('Không thể lấy danh sách bệnh nhân');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filteredPatients = React.useMemo(() => {
    return patients.filter(p =>
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phoneNumber.includes(searchTerm) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn hồ sơ của bệnh nhân ${name}?`)) return;

    try {
      await patientService.delete(id);
      toast.success('Xóa bệnh nhân thành công');
      setPatients(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      toast.error('Lỗi khi xóa bệnh nhân');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
      {/* Header Layer */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Cơ sở dữ liệu bệnh nhân</h1>
          <p className="mt-1 text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Activity size={14} className="text-indigo-600" />
            Quản lý {patients.length} hồ sơ y tế tập trung
          </p>
        </div>
        <button className="flex items-center gap-3 bg-indigo-600 text-white px-6 py-3 rounded-[1.5rem] font-black text-sm shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all">
          <Plus size={18} />
          THÊM HỒ SƠ MỚI
        </button>
      </div>

      {/* Toolbar Layer */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-5 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên bệnh nhân, số điện thoại hoặc mã định danh (ID)..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-[1.8rem] text-sm font-bold focus:ring-2 focus:ring-indigo-600 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main List Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Đang tải dữ liệu hồ sơ...</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg py-20 text-center flex flex-col items-center">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Không tìm thấy bệnh nhân nào</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Họ tên bệnh nhân</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Mã hồ sơ</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Liên hệ</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Ngày sinh</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Trạng thái hồ sơ</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                        {p.fullName.substring(0, 1)}
                      </div>
                      <span className="text-sm font-bold text-slate-900">{p.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-500 font-mono">{p.id.substring(0, 8).toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-slate-700">{p.phoneNumber || 'N/A'}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[150px]">{p.email || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-600">{formatDate(p.dateOfBirth)}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={cn("h-1.5 w-1.5 rounded-full", p.phoneNumber ? "bg-emerald-500" : "bg-amber-500")}></span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {p.phoneNumber ? 'Hoàn thiện' : 'Cần cập nhật'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-md">
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.fullName)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-md"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 rounded-md">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Container */}
      {!loading && filteredPatients.length > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white px-6 py-4 rounded-lg border border-slate-200">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Hiển thị {filteredPatients.length} bệnh nhân
          </p>

          <div className="flex items-center gap-2">
            <button className="h-8 px-3 rounded-md border border-slate-200 text-[10px] font-bold uppercase text-slate-300 disabled:opacity-50" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="h-8 px-4 rounded-md bg-indigo-600 text-[10px] font-bold uppercase text-white">01</button>
            <button className="h-8 px-3 rounded-md border border-slate-200 text-[10px] font-bold uppercase text-slate-300 disabled:opacity-50" disabled>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPatients;
