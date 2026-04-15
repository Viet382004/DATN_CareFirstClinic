import React, { useEffect, useState, useCallback } from 'react';
import { patientService } from '../../../services/patientService';
import type { Patient, UpdatePatientDTO } from '../../../types/patient';
import {
  Search,
  Edit,
  Power,
  MoreVertical,
  Activity,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';
import { formatDate } from '../../../utils/format';
import { apiPost } from '../../../services/apiClient';
import { authService } from '../../../services/authService';

const DEFAULT_AVATAR_URL = '/default-avatar.png';

const AdminPatients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [query, setQuery] = useState({ page: 1, pageSize: 10 });
  
  // Modal state
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [editFormData, setEditFormData] = useState<UpdatePatientDTO & { email?: string, password?: string }>({});

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
      p.phoneNumber?.includes(searchTerm) ||
      p.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  const paginatedPatients = React.useMemo(() => {
    const start = (query.page - 1) * query.pageSize;
    const end = start + query.pageSize;
    return filteredPatients.slice(start, end);
  }, [filteredPatients, query]);

  const totalPages = Math.ceil(filteredPatients.length / query.pageSize);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setQuery(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleToggleStatus = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn thay đổi trạng thái của bệnh nhân ${name}?`)) return;
    try {
      await patientService.toggleActive(id);
      toast.success('Thay đổi trạng thái bệnh nhân thành công');
      fetchPatients();
    } catch (error) {
      toast.error('Lỗi khi thay đổi trạng thái bệnh nhân');
    }
  };

  const handleForceVerify = async (userId?: string) => {
    if (!userId) {
      toast.error("Không tìm thấy ID người dùng");
      return;
    }
    if (!window.confirm("Bạn có chắc chắn muốn xác thực tài khoản này?")) return;
    try {
      await authService.forceVerifyUser(userId);
      toast.success("Xác thực tài khoản thành công");
      fetchPatients();
    } catch {
      toast.error("Lỗi khi xác thực tài khoản");
    }
  };

  const handleOpenEdit = (p: Patient) => {
    setSelectedPatient(p);
    setIsAddingMode(false);
    setEditFormData({
      fullName: p.fullName,
      phoneNumber: p.phoneNumber,
      address: p.address || '',
      dateOfBirth: p.dateOfBirth,
      gender: p.gender || 'Khác',
      medicalHistory: p.medicalHistory || '',
    });
  };

  const handleOpenAdd = () => {
    setSelectedPatient(null);
    setIsAddingMode(true);
    setEditFormData({
      fullName: '',
      phoneNumber: '',
      address: '',
      dateOfBirth: '',
      email: '',
      password: '',
      gender: 'Nam',
      medicalHistory: ''
    });
  };

  const handleSave = async () => {
    try {
      if (isAddingMode) {
        // Create new patient via Auth Register
        if (!editFormData.email || !editFormData.password || !editFormData.fullName || !editFormData.phoneNumber || !editFormData.dateOfBirth) {
          toast.error('Vui lòng điền đầy đủ email, mật khẩu, họ tên, số điện thoại và ngày sinh');
          return;
        }
        await apiPost('/patient', {
           email: editFormData.email,
           password: editFormData.password,
           fullName: editFormData.fullName,
           phoneNumber: editFormData.phoneNumber,
           address: editFormData.address || 'Không có',
           dateOfBirth: new Date(editFormData.dateOfBirth).toISOString(),
           gender: editFormData.gender || 'Khác',
           medicalHistory: editFormData.medicalHistory || ''
        });
        toast.success('Thêm bệnh nhân thành công');
      } else {
        // Update existing patient
        if (!editFormData.fullName || !editFormData.phoneNumber) {
          toast.error('Họ tên và Số điện thoại không được để trống');
          return;
        }
        if (selectedPatient) {
           await patientService.updateById(selectedPatient.id, {
             fullName: editFormData.fullName,
             phoneNumber: editFormData.phoneNumber,
             address: editFormData.address || '',
             dateOfBirth: editFormData.dateOfBirth ? new Date(editFormData.dateOfBirth).toISOString() : undefined,
             gender: editFormData.gender,
             medicalHistory: editFormData.medicalHistory || ''
           });
           toast.success('Cập nhật bệnh nhân thành công');
        }
      }
      setSelectedPatient(null);
      setIsAddingMode(false);
      fetchPatients();
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi lưu dữ liệu');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Cơ sở dữ liệu bệnh nhân</h1>
          <p className="mt-1 text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Activity size={14} className="text-indigo-600" />
            Quản lý {patients.length} hồ sơ y tế
          </p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-3 bg-indigo-600 text-white px-6 py-3 rounded-[1.5rem] font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={18} />
          THÊM HỒ SƠ MỚI
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-5 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, số điện thoại, email hoặc ID..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-[1.8rem] text-sm font-bold focus:ring-2 focus:ring-indigo-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
          <p className="text-[10px] font-bold uppercase text-slate-400">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase">Avatar</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase">Họ tên</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase">Mã hồ sơ</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase">Email</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase">Liên hệ</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase">Ngày sinh</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase text-center">Trạng thái</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPatients.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <img
                      src={p.avatarUrl || DEFAULT_AVATAR_URL}
                      alt="Avatar"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-900">{p.fullName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-500 font-mono">{p.id.substring(0, 8).toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-700">{p.userEmail || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-700">{p.phoneNumber || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-600">{formatDate(p.dateOfBirth)}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {p.isEmailVerified == false ? (
                      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-600">
                        Chưa xác thực
                      </span>
                    ) : p.isActive && p.isEmailVerified ? (
                      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-600">
                        Hoạt động
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-600">
                        Không hoạt động
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => handleOpenEdit(p)} 
                        className="p-2 text-slate-400 hover:text-indigo-600 rounded-md"
                      >
                        <Edit size={16} />
                      </button>
                      {p.isEmailVerified === false ? (
                        <button
                          onClick={() => handleForceVerify(p.userId)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          title="Xác thực tài khoản"
                        >
                          <CheckCircle size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(p.id, p.fullName)}
                          className={cn(
                            "p-2 rounded-md transition-colors",
                            p.isActive ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                          )}
                          title="Bật/Tắt trạng thái hoạt động"
                        >
                          <Power size={16} />
                        </button>
                      )}
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

      {/* Pagination */}
      {!loading && filteredPatients.length > 0 && (
        <div className="mt-4 flex items-center justify-between bg-white px-6 py-4 rounded-lg border border-slate-200">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Hiển thị {paginatedPatients.length} / {filteredPatients.length} bệnh nhân
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(query.page - 1)}
              disabled={query.page === 1}
              className="h-8 px-3 rounded-md border border-slate-200 text-[10px] font-bold uppercase text-slate-600 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={cn(
                  "h-8 px-4 rounded-md text-[10px] font-bold uppercase",
                  query.page === i + 1 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(query.page + 1)}
              disabled={query.page === totalPages}
              className="h-8 px-3 rounded-md border border-slate-200 text-[10px] font-bold uppercase text-slate-600 disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal chi tiết/thêm bệnh nhân */}
      {(selectedPatient || isAddingMode) && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[500px]">
            <h2 className="text-xl font-bold mb-4">{isAddingMode ? 'Thêm bệnh nhân mới' : 'Chi tiết bệnh nhân'}</h2>
            
            <div className="space-y-4">
              {!isAddingMode && selectedPatient && (
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={selectedPatient.avatarUrl || DEFAULT_AVATAR_URL}
                    alt="Avatar"
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                     <span className="text-lg font-bold block">{selectedPatient.fullName}</span>
                     <span className="text-xs text-slate-500">Trạng thái: {selectedPatient.user?.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Họ và tên</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      value={editFormData.fullName || ''}
                      onChange={e => setEditFormData({...editFormData, fullName: e.target.value})}
                    />
                 </div>

                 {isAddingMode && (
                    <>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Email (Đăng nhập)</label>
                        <input 
                          type="email"
                          className="w-full px-3 py-2 border rounded-md text-sm"
                          value={editFormData.email || ''}
                          onChange={e => setEditFormData({...editFormData, email: e.target.value})}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Mật khẩu</label>
                        <input 
                          type="password"
                          className="w-full px-3 py-2 border rounded-md text-sm"
                          value={editFormData.password || ''}
                          onChange={e => setEditFormData({...editFormData, password: e.target.value})}
                        />
                      </div>
                    </>
                 )}

                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Số điện thoại</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      value={editFormData.phoneNumber || ''}
                      onChange={e => setEditFormData({...editFormData, phoneNumber: e.target.value})}
                    />
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Giới tính</label>
                    <select
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      value={editFormData.gender || 'Nam'}
                      onChange={e => setEditFormData({...editFormData, gender: e.target.value})}
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                 </div>
                 
                 <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Ngày sinh</label>
                    <input 
                      type="date"
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      value={editFormData.dateOfBirth ? new Date(editFormData.dateOfBirth).toISOString().split('T')[0] : ''}
                      onChange={e => setEditFormData({...editFormData, dateOfBirth: e.target.value})}
                    />
                 </div>

                 <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Địa chỉ</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      value={editFormData.address || ''}
                      onChange={e => setEditFormData({...editFormData, address: e.target.value})}
                    />
                 </div>

                 <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Tiền sử bệnh lý</label>
                    <textarea 
                      className="w-full px-3 py-2 border rounded-md text-sm min-h-[60px] resize-y"
                      value={editFormData.medicalHistory || ''}
                      onChange={e => setEditFormData({...editFormData, medicalHistory: e.target.value})}
                      placeholder="Các bệnh lý nền, dị ứng..."
                    />
                 </div>
              </div>

            </div>
            
            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedPatient(null);
                  setIsAddingMode(false);
                }}
                className="px-4 py-2 rounded-md bg-slate-200 text-slate-700 font-bold"
              >
                Đóng
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white font-bold"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPatients;
