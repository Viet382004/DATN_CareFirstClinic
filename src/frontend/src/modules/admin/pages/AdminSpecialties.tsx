import React, { useEffect, useState } from 'react';
import { specialtyService } from '../../../services/specialtyService';
import type { Specialty, CreateSpecialtyDTO, UpdateSpecialtyDTO } from '../../../types/specialty';
import {
  Plus,
  Search,
  Edit,
  Power,
  Stethoscope,
  MoreVertical,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';


const AdminSpecialties: React.FC = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [formData, setFormData] = useState<CreateSpecialtyDTO | UpdateSpecialtyDTO>({
    name: '',
    description: ''
  });

  const fetchSpecialties = async () => {
    setLoading(true);
    try {
      const res = await specialtyService.getAll();
      setSpecialties(res);
    } catch (error) {
      toast.error('Không thể lấy danh sách chuyên khoa');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const filteredSpecialties = specialties.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = async (id: string) => {
    try {
      await specialtyService.toggle(id);
      toast.success('Cập nhật trạng thái chuyên khoa thành công');
      fetchSpecialties();
    } catch (error) {
      toast.error('Lỗi khi thay đổi trạng thái');
    }
  };

  const handleOpenModal = (specialty?: Specialty) => {
    if (specialty) {
      setSelectedSpecialty(specialty);
      setFormData({
        name: specialty.name,
        description: specialty.description || ''
      });
    } else {
      setSelectedSpecialty(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name) {
        toast.error('Vui lòng nhập tên chuyên khoa');
        return;
      }

      if (selectedSpecialty) {
        await specialtyService.update(selectedSpecialty.id, formData as UpdateSpecialtyDTO);
        toast.success('Cập nhật chuyên khoa thành công');
      } else {
        await specialtyService.create(formData as CreateSpecialtyDTO);
        toast.success('Thêm chuyên khoa thành công');
      }
      setIsModalOpen(false);
      fetchSpecialties();
    } catch (error) {
      toast.error('Lỗi khi lưu chuyên khoa');
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Quản lý chuyên môn</h1>
          <p className="mt-1 text-xs font-bold text-slate-400 uppercase tracking-widest">Danh mục khoa phòng và dịch vụ</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition-all"
        >
          <Plus className="h-4 w-4" />
          THÊM KHOA PHÒNG
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm mã hoặc tên khoa..."
            className="w-full rounded-md border-none bg-slate-50 py-2 pl-10 pr-4 text-sm font-bold text-slate-700 focus:ring-1 focus:ring-indigo-600 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Phòng khám: {specialties.length} đơn vị chuyên môn
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
          <p className="text-[10px] font-black uppercase text-slate-300">Đang đồng bộ dữ liệu...</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Tên chuyên khoa</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Mô tả chi tiết</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Trạng thái</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSpecialties.map((spec) => (
                <tr key={spec.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                        <Stethoscope size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{spec.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono uppercase">ID: {spec.id.substring(0, 8)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-md">
                    <p className="text-xs text-slate-500 truncate">{spec.description || 'Chưa cập nhật mô tả.'}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggle(spec.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all",
                        spec.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                      )}
                    >
                      <Power size={12} />
                      {spec.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(spec)}
                        className="p-2 text-slate-400 hover:text-indigo-600 rounded-md"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleToggle(spec.id)}
                        className={cn(
                          "p-2 rounded-md transition-colors",
                          spec.isActive ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                        )}
                        title="Bật/Tắt trạng thái hoạt động"
                      >
                        <Power size={16} />
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
          {filteredSpecialties.length === 0 && (
            <div className="p-10 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Không có dữ liệu hiển thị</p>
            </div>
          )}
        </div>
      )}

      {/* Modal create/edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[500px]">
            <h2 className="text-xl font-bold mb-4">
              {selectedSpecialty ? 'Cập nhật chuyên khoa' : 'Thêm chuyên khoa'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tên chuyên khoa</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Khoa Nội, Khoa Nhi..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Mô tả chi tiết</label>
                <textarea
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none min-h-[100px]"
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả chức năng, dịch vụ của chuyên khoa..."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-md bg-slate-200 text-slate-700 font-bold"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white font-bold"
              >
                {selectedSpecialty ? 'Lưu thay đổi' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSpecialties;
