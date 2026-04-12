import React, { useEffect, useState, useCallback } from "react";
import { doctorService } from "../../../services/doctorService";
import type { Doctor, DoctorQueryParams } from "../../../types/doctor";
import { specialtyService } from "../../../services/specialtyService";
import type { Specialty } from "../../../types/specialty";
import {
  Search,
  Filter,
  Phone,
  Mail,
  Edit,
  Power,
  Trash2,
  Plus,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../../lib/utils";

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

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bác sĩ ${name}?`)) return;

    try {
      await doctorService.delete(id);
      toast.success("Xóa bác sĩ thành công");
      fetchData();
    } catch {
      toast.error("Lỗi khi xóa bác sĩ");
    }
  };

  // ✅ SAFE PAGINATION
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

        <button className="flex items-center gap-3 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-black text-white shadow-xl shadow-indigo-200 transition-all hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95">
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
                  <th className="px-6 py-4 text-xs font-black">Bác sĩ</th>
                  <th className="px-6 py-4 text-xs font-black">
                    Chuyên khoa
                  </th>
                  <th className="px-6 py-4 text-xs font-black">Liên hệ</th>
                  <th className="px-6 py-4 text-xs font-black text-center">
                    Kinh nghiệm
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-center">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-right">
                    Thao tác
                  </th>
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
                          <p className="text-sm font-bold">{doc.fullName}</p>
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
                        <div className="flex items-center gap-2 text-xs">
                          <Phone size={12} />
                          {doc.phoneNumber}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Mail size={12} />
                          {doc.email}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      {doc.yearsOfExperience} năm
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(doc.id)}
                        className={cn(
                          "px-3 py-1 rounded-md text-xs font-bold",
                          doc.isActive
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-400"
                        )}
                      >
                        <Power size={12} className="inline mr-1" />
                        {doc.isActive ? "Hoạt động" : "Đã khóa"}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 hover:text-indigo-600">
                          <Edit size={16} />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(doc.id, doc.fullName)
                          }
                          className="p-2 hover:text-rose-600"
                        >
                          <Trash2 size={16} />
                        </button>

                        <button className="p-2">
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
              Tổng cộng: {safeTotalItems} bác sĩ
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
                className="px-3 py-2 border rounded-md disabled:opacity-30"
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
                    "h-8 w-8 rounded-md border text-xs font-bold",
                    currentPage === i + 1
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-slate-200"
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
                className="px-3 py-2 border rounded-md disabled:opacity-30"
              >
                Sau
              </button>
            </div>
          </div>
        </>
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