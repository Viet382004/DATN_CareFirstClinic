import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Activity, 
  DollarSign, 
  Tag, 
  Settings,
  X,
  Save,
  PlusCircle,
  Hash
} from 'lucide-react';
import { serviceOrderService } from '../../../services/serviceOrderService';
import { specialtyService } from '../../../services/specialtyService';
import type { Service, CreateServiceDTO } from '../../../types/serviceOrder';
import type { Specialty } from '../../../types/specialty';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';

const AdminServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [formData, setFormData] = useState<CreateServiceDTO>({
    name: '',
    price: 0,
    description: '',
    specialtyId: '',
    fields: []
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sData, specData] = await Promise.all([
        serviceOrderService.getAllServices(),
        specialtyService.getAll()
      ]);
      setServices(sData);
      setSpecialties((specData as any).items || specData);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        price: service.price,
        description: service.description || '',
        specialtyId: service.specialtyId || '',
        fields: service.fields.map(f => ({ 
          fieldName: f.fieldName, 
          unit: f.unit, 
          dataType: f.dataType || 'Text' 
        }))
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        price: 0,
        description: '',
        specialtyId: '',
        fields: []
      });
    }
    setShowModal(true);
  };

  const handleAddField = () => {
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, { fieldName: '', unit: '', dataType: 'Text' }]
    }));
  };

  const handleRemoveField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateField = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const newFields = [...prev.fields];
      newFields[index] = { ...newFields[index], [field]: value };
      return { ...prev, fields: newFields };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        await serviceOrderService.updateService(editingService.id, formData);
        toast.success("Cập nhật dịch vụ thành công!");
      } else {
        await serviceOrderService.createService(formData);
        toast.success("Tạo dịch vụ mới thành công!");
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error("Lỗi khi lưu dữ liệu.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa dịch vụ này?")) return;
    try {
      await serviceOrderService.deleteService(id);
      toast.success("Đã xóa dịch vụ.");
      fetchData();
    } catch (error) {
      toast.error("Lỗi khi xóa.");
    }
  };

  const filtered = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý Dịch vụ / Chuyên khoa</h1>
          <p className="text-slate-500 text-sm">Định nghĩa các hạng mục xét nghiệm và chẩn đoán theo chuyên khoa.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-sm transition-all"
        >
          <Plus size={18} /> Thêm dịch vụ mới
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm dịch vụ..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Tên dịch vụ</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Chuyên khoa</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Đơn giá</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Chỉ số (Fields)</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Đang tải dữ liệu...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Không tìm thấy dịch vụ nào.</td></tr>
              ) : (
                filtered.map(service => (
                  <tr key={service.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-800 text-sm">{service.name}</p>
                      <p className="text-xs text-slate-400">{service.description || 'Không có mô tả'}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-bold uppercase">
                        {specialties.find(s => s.id === service.specialtyId)?.name || 'Chưa phân khoa'}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-black text-emerald-600 text-sm">{service.price.toLocaleString('vi-VN')}đ</p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {service.fields.length > 0 ? (
                          service.fields.map((f, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold">
                              {f.fieldName}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-300 italic">Dữ liệu tự do</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(service)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(service.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">{editingService ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ mới'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tên dịch vụ / Hạng mục khám *</label>
                  <input 
                    type="text" required
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Siêu âm ổ bụng, Xét nghiệm máu..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Chuyên khoa phụ trách *</label>
                  <select 
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.specialtyId}
                    onChange={e => setFormData({ ...formData, specialtyId: e.target.value })}
                    required
                  >
                    <option value="">Chọn chuyên khoa...</option>
                    {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Đơn giá (VNĐ) *</label>
                  <input 
                    type="number" required
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mô tả dịch vụ</label>
                <textarea 
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-20"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase">Định nghĩa các chỉ số (Fields)</label>
                  <button 
                    type="button" onClick={handleAddField}
                    className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1"
                  >
                    <PlusCircle size={14} /> Thêm chỉ số
                  </button>
                </div>
                
                <div className="space-y-2">
                  {formData.fields.map((field, index) => (
                    <div key={index} className="flex gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                      <div className="flex-1">
                        <input 
                          type="text" placeholder="Tên chỉ số (VD: Glucose)"
                          className="w-full p-2 text-sm bg-white border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                          value={field.fieldName}
                          onChange={e => handleUpdateField(index, 'fieldName', e.target.value)}
                        />
                      </div>
                      <div className="w-24">
                        <input 
                          type="text" placeholder="Đơn vị"
                          className="w-full p-2 text-sm bg-white border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                          value={field.unit || ''}
                          onChange={e => handleUpdateField(index, 'unit', e.target.value)}
                        />
                      </div>
                      <div className="w-28">
                        <select 
                          className="w-full p-2 text-sm bg-white border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                          value={field.dataType}
                          onChange={e => handleUpdateField(index, 'dataType', e.target.value)}
                        >
                          <option value="Text">Văn bản</option>
                          <option value="Number">Số lượng</option>
                        </select>
                      </div>
                      <button 
                        type="button" onClick={() => handleRemoveField(index)}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {formData.fields.length === 0 && (
                    <p className="text-[10px] text-slate-400 italic text-center py-2">Chưa có chỉ số nào. Dịch vụ này sẽ sử dụng ô nhập liệu tự do.</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >Hủy bỏ</button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  <Save size={18} /> {editingService ? 'Lưu thay đổi' : 'Tạo dịch vụ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
