import React, { useEffect, useState, useCallback } from "react";
import { doctorService } from "../../../services/doctorService";
import type { Doctor, DoctorQueryParams, CreateDoctorDTO, UpdateDoctorDTO } from "../../../types/doctor";
import { specialtyService } from "../../../services/specialtyService";
import type { Specialty } from "../../../types/specialty";
import {
  Search,
  Filter,
  Phone,
  Mail,
  Edit,
  Power,
  Plus,
  MoreVertical,
  X,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../../lib/utils";
import { authService } from "../../../services/authService";

const AdminDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const [query, setQuery] = useState<DoctorQueryParams>({
    page: 1,
    pageSize: 8,
    sortBy: "fullName",
    sortOrder: "asc",
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState<Partial<CreateDoctorDTO & UpdateDoctorDTO>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [docRes, specRes] = await Promise.all([
        doctorService.getList(query),
        specialtyService.getAll(),
      ]);

      setDoctors(docRes?.items || []);
      setTotalItems(docRes?.totalCount || 0);
      setSpecialties(specRes || []);
    } catch (error) {
      toast.error("Không thể lấy dữ liệu bác sĩ");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleActive = async (id: string) => {
    try {
      await doctorService.toggleActive(id);
      toast.success("Cập nhật trạng thái bác sĩ thành công");
      fetchData();
    } catch {
      toast.error("Lỗi khi thay đổi trạng thái");
    }
  };

  const handleForceVerify = async (userId?: string) => {
    if (!userId) {
      toast.error("Không tìm thấy dữ liệu tài khoản");
      return;
    }
    if (!window.confirm("Bạn có chắc chắn muốn xác thực tài khoản?")) return;
    try {
      await authService.forceVerifyUser(userId);
      toast.success("Xác thực tài khoản thành công");
      fetchData();
    } catch {
      toast.error("Lỗi khi xác thực tài khoản");
    }
  };

  const handleOpenModal = (doctor?: Doctor) => {
    if (doctor) {
      setSelectedDoctor(doctor);
      // For editing, we pick only necessary fields matching UpdateDoctorDTO.
      // E.g., we look up specialtyId from specialtyName if needed, but we don't have specialtyId in Doctor by default. 
      // We will try finding it from specialties list by matching name.
      const matchedSpec = specialties.find(s => s.name === doctor.specialtyName);
      setFormData({
        fullName: doctor.fullName,
        specialtyId: matchedSpec?.id || "",
        academicTitle: doctor.academicTitle,
        position: doctor.position,
        description: doctor.description,
        yearsOfExperience: doctor.yearsOfExperience,
        phoneNumber: doctor.phoneNumber,
        email: doctor.email || ""
      });
    } else {
      setSelectedDoctor(null);
      setFormData({
        fullName: "",
        specialtyId: specialties.length > 0 ? specialties[0].id : "",
        academicTitle: "",
        position: "",
        description: "",
        yearsOfExperience: 0,
        phoneNumber: "",
        email: "",
        userName: "",
        password: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.fullName || !formData.specialtyId || !formData.phoneNumber) {
        toast.error("Vui lòng điền các trường bắt buộc (Tên, Chuyên khoa, SĐT)");
        return;
      }
      if (selectedDoctor) {
        await doctorService.update(selectedDoctor.id, formData as UpdateDoctorDTO);
        toast.success("Cập nhật bác sĩ thành công");
      } else {
        if (!formData.userName || !formData.password || !formData.email) {
          toast.error("Thêm mới bác sĩ yêu cầu Username, Password và Email");
          return;
        }
        await doctorService.create(formData as CreateDoctorDTO);
        toast.success("Thêm mới bác sĩ thành công");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Lỗi khi lưu dữ liệu bác sĩ");
    }
  };

  const currentPage = Math.max(query.page || 1, 1);
  const pageSize = Math.max(query.pageSize || 8, 1);
  const safeTotalItems = Math.max(Number(totalItems) || 0, 0);
  const totalPages = Math.max(1, Math.ceil(safeTotalItems / pageSize));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Quản lý bác sĩ
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Quản lý đội ngũ y bác sĩ và chuyên môn của phòng khám.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-3 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-black text-white shadow-xl shadow-indigo-200 transition-all hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          THÊM BÁC SĨ MỚI
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên bác sĩ..."
            className="w-full rounded-2xl bg-slate-50 py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none"
            onChange={(e) =>
              setQuery((prev) => ({
                ...prev,
                search: e.target.value,
                page: 1,
              }))
            }
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-2xl">
          <Filter className="h-5 w-5 text-slate-400" />
          <select
            className="bg-transparent text-sm font-black text-slate-700 outline-none cursor-pointer"
            onChange={(e) =>
              setQuery((prev) => ({
                ...prev,
                specialtyId: e.target.value || undefined,
                page: 1,
              }))
            }
          >
            <option value="">Tất cả chuyên khoa</option>
            {specialties.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-400">
            Đang tải dữ liệu bác sĩ...
          </p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg py-20 text-center">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Không có dữ liệu bác sĩ
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-slate-700">Bác sĩ</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-700">Chuyên khoa</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-700">Liên hệ</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-700 text-center">Kinh nghiệm</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-700 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-700 text-right">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {doctors.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-md bg-slate-100 border border-slate-200 overflow-hidden">
                          {doc.avatarUrl ? (
                            <img
                              src={doc.avatarUrl}
                              alt={doc.fullName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-300">
                              <UserIcon className="h-6 w-6" />
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-bold block">{doc.fullName}</p>
                          <p className="text-xs text-slate-400">
                            {doc.academicTitle || "Bác sĩ"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                        {doc.specialtyName}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                          <Phone size={12} className="text-slate-400" />
                          {doc.phoneNumber}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                          <Mail size={12} className="text-slate-400" />
                          {doc.email || "N/A"}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-slate-700">{doc.yearsOfExperience}</span> <span className="text-xs text-slate-500">năm</span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-md text-xs font-bold",
                          !doc.isEmailVerified
                            ? "bg-amber-50 text-amber-600"
                            : doc.isActive && doc.isEmailVerified
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-slate-100 text-slate-400"
                        )}
                      >
                        {!doc.isEmailVerified
                          ? "Chưa xác thực"
                          : doc.isActive && doc.isEmailVerified
                            ? "Hoạt động"
                            : "Đã khóa"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(doc)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Chỉnh sửa bác sĩ"
                        >
                          <Edit size={16} />
                        </button>

                        {!doc.isEmailVerified ? (
                          <button
                            onClick={() => handleForceVerify(doc.userId)}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Xác thực tài khoản"
                          >
                            <CheckCircle size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleActive(doc.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Khóa/Mở khóa bác sĩ"
                          >
                            <Power size={16} />
                          </button>
                        )}


                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between bg-white px-6 py-4 rounded-lg border border-slate-200">
            <p className="text-xs font-bold text-slate-400">
              Tổng cộng: <span className="text-slate-700">{safeTotalItems}</span> bác sĩ
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setQuery((prev) => ({
                    ...prev,
                    page: currentPage - 1,
                  }))
                }
                disabled={currentPage <= 1}
                className="px-3 py-2 border rounded-md disabled:opacity-30 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() =>
                    setQuery((prev) => ({
                      ...prev,
                      page: i + 1,
                    }))
                  }
                  className={cn(
                    "h-8 w-8 rounded-md border text-xs font-bold transition-colors",
                    currentPage === i + 1
                      ? "bg-indigo-600 text-white border-indigo-600 cursor-default"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() =>
                  setQuery((prev) => ({
                    ...prev,
                    page: currentPage + 1,
                  }))
                }
                disabled={currentPage >= totalPages}
                className="px-3 py-2 border rounded-md disabled:opacity-30 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal create/edit doctor */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {selectedDoctor ? 'Cập nhật bác sĩ' : 'Thêm bác sĩ mới'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Họ và tên <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={formData.fullName || ''}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 placeholder:text-slate-400 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                {!selectedDoctor && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tên đăng nhập <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        value={formData.userName || ''}
                        onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                        className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 placeholder:text-slate-400 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mật khẩu <span className="text-rose-500">*</span></label>
                      <input
                        type="password"
                        value={formData.password || ''}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 placeholder:text-slate-400 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chuyên khoa <span className="text-rose-500">*</span></label>
                  <select
                    value={formData.specialtyId || ''}
                    onChange={(e) => setFormData({ ...formData, specialtyId: e.target.value })}
                    className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  >
                    <option value="" disabled>Chọn chuyên khoa</option>
                    {specialties.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email {(!selectedDoctor ? <span className="text-rose-500">*</span> : null)}</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 placeholder:text-slate-400 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Số điện thoại <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={formData.phoneNumber || ''}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 placeholder:text-slate-400 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Năm kinh nghiệm</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.yearsOfExperience || 0}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                    className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 placeholder:text-slate-400 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Học hàm / Học vị</label>
                  <input
                    type="text"
                    value={formData.academicTitle || ''}
                    onChange={(e) => setFormData({ ...formData, academicTitle: e.target.value })}
                    className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 placeholder:text-slate-400 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="VD: ThS. BS."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chức vụ</label>
                  <input
                    type="text"
                    value={formData.position || ''}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 placeholder:text-slate-400 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="VD: Trưởng khoa"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mô tả thêm</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full min-h-[80px] text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 placeholder:text-slate-400 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-slate-50/50 rounded-b-2xl">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                {selectedDoctor ? 'CẬP NHẬT' : 'LƯU BÁC SĨ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default AdminDoctors;