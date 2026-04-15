import React, { useEffect, useState, useCallback } from 'react';
import { stockService } from '../../../services/stockService';
import type { Stock, StockQueryParams } from '../../../services/stockService';
import {
  Search,
  Plus,
  AlertTriangle,
  Package,
  TrendingUp,
  History,
  Edit,
  Power,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  X
} from 'lucide-react';
import { toast } from 'sonner';

const AdminInventory: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [query, setQuery] = useState<StockQueryParams>({
    page: 1,
    pageSize: 10,
    sortBy: 'medicineName',
    sortDir: 'asc'
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [formData, setFormData] = useState<Partial<Stock>>({
      medicineName: '',
      medicineCode: '',
      unit: 'Viên',
      manufacturer: '',
      quantity: 0,
      minQuantity: 10,
      unitPrice: 0,
  });

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await stockService.getList({
        ...query,
        isLowStock: showLowStockOnly || undefined
      });
      setStocks(res.items);
      setTotalItems(res.totalCount);
    } catch (error) {
      toast.error('Không thể lấy danh sách kho thuốc');
    } finally {
      setLoading(false);
    }
  }, [query, showLowStockOnly]);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  const handleToggle = async (id: string) => {
    try {
      await stockService.toggle(id);
      toast.success('Cập nhật trạng thái thuốc thành công');
      fetchStocks();
    } catch (error) {
      toast.error('Lỗi khi thay đổi trạng thái');
    }
  };

  const handleImport = async (id: string, name: string) => {
    const qtyStr = window.prompt(`Nhập số lượng nhập kho cho thuốc ${name}:`);
    if (qtyStr === null) return;

    const qty = parseInt(qtyStr);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Số lượng nhập không hợp lệ');
      return;
    }

    try {
      await stockService.import(id, { quantity: qty });
      toast.success(`Đã nhập thêm ${qty} đơn vị cho ${name}`);
      fetchStocks();
    } catch (error) {
      toast.error('Lỗi khi nhập kho');
    }
  };

  const handleOpenModal = (stock?: Stock) => {
    if (stock) {
      setSelectedStock(stock);
      setFormData({
         medicineName: stock.medicineName,
         medicineCode: stock.medicineCode,
         unit: stock.unit,
         manufacturer: stock.manufacturer,
         quantity: stock.quantity,
         minQuantity: stock.minQuantity,
         unitPrice: stock.unitPrice
      });
    } else {
      setSelectedStock(null);
      setFormData({
         medicineName: '',
         medicineCode: '',
         unit: 'Viên',
         manufacturer: '',
         quantity: 0,
         minQuantity: 10,
         unitPrice: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.medicineName || formData.quantity === undefined || formData.unitPrice === undefined) {
       toast.error("Vui lòng điền đầy đủ Tên thuốc, Số lượng và Đơn giá");
       return;
    }
    
    try {
      if (selectedStock) {
         await stockService.update(selectedStock.id, formData as any);
         toast.success("Cập nhật thuốc thành công");
      } else {
         await stockService.create(formData as any);
         toast.success("Thêm thuốc thành công");
      }
      setIsModalOpen(false);
      fetchStocks();
    } catch {
       toast.error("Lỗi khi lưu thông tin thuốc");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý kho thuốc</h1>
          <p className="mt-1 text-slate-500">Theo dõi tồn kho, nhập hàng và quản lý danh mục dược phẩm.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">
            <Download className="h-4 w-4" />
            Xuất báo cáo
          </button>
          <button 
             onClick={() => handleOpenModal()}
             className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Thêm thuốc mới
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Tổng danh mục</p>
              <p className="text-2xl font-bold text-slate-900">{totalItems}</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          className={`cursor-pointer rounded-2xl border transition-all p-6 shadow-sm ${showLowStockOnly ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/20' : 'border-slate-200 bg-white hover:border-amber-200'}`}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Sắp hết hàng</p>
              <p className="text-2xl font-bold text-amber-600">5</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Giá trị kho</p>
              <p className="text-2xl font-bold text-slate-900">42.5M</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tên thuốc, mã thuốc..."
              className="w-full rounded-xl border-none bg-slate-50 py-2 pl-10 pr-4 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
              onChange={(e) => setQuery({ ...query, name: e.target.value, page: 1 })}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100">
              <Filter className="h-4 w-4" />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100">
              <History className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-xs font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-6 py-4">Dược phẩm</th>
                <th className="px-6 py-4">Đơn vị</th>
                <th className="px-6 py-4">Tồn kho</th>
                <th className="px-6 py-4">Đơn giá</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                      <p className="font-semibold text-slate-400">Đang kiểm kê kho...</p>
                    </div>
                  </td>
                </tr>
              ) : stocks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <p className="font-semibold text-slate-400">Kho thuốc trống.</p>
                  </td>
                </tr>
              ) : (
                stocks.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-slate-50/50 group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900 underline decoration-slate-200 decoration-dotted underline-offset-4">{item.medicineName}</p>
                        <p className="mt-0.5 text-[10px] font-black uppercase tracking-tighter text-slate-400">CODE: {item.medicineCode || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600 font-medium">{item.unit || 'Viên'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${item.quantity <= item.minQuantity ? 'text-amber-600' : 'text-slate-900'}`}>
                          {item.quantity}
                        </span>
                        {item.quantity <= item.minQuantity && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-50 text-amber-500 animate-pulse">
                            <AlertTriangle className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-semibold text-slate-400">Min: {item.minQuantity}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {item.unitPrice.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${item.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        {item.isActive ? 'Kinh doanh' : 'Ngừng bán'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleImport(item.id, item.medicineName)}
                          className="rounded-lg bg-indigo-50 p-2 text-indigo-600 hover:bg-indigo-100 transition-colors"
                          title="Nhập thêm hàng"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenModal(item)}
                          className="rounded-lg bg-slate-50 p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                          title="Chỉnh sửa thông tin"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggle(item.id)}
                          className={`rounded-lg p-2 transition-colors ${item.isActive ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3">
          <p className="text-xs font-semibold text-slate-500">
            Trang {query.page} / {Math.ceil(totalItems / (query.pageSize || 10))}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setQuery({ ...query, page: (query.page || 1) - 1 })}
              disabled={query.page === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setQuery({ ...query, page: (query.page || 1) + 1 })}
              disabled={stocks.length < (query.pageSize || 10)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-xl font-bold">{selectedStock ? 'Cập nhật thông tin' : 'Thêm danh mục mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2">
                    <label className="mb-1 block text-sm font-bold text-slate-700">Tên dược phẩm</label>
                    <input 
                      type="text" 
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none" 
                      value={formData.medicineName || ''}
                      onChange={e => setFormData({...formData, medicineName: e.target.value})}
                    />
                 </div>
                 
                 <div>
                    <label className="mb-1 block text-sm font-bold text-slate-700">Mã CODE</label>
                    <input 
                      type="text" 
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none uppercase font-mono" 
                      value={formData.medicineCode || ''}
                      onChange={e => setFormData({...formData, medicineCode: e.target.value})}
                    />
                 </div>
                 
                 <div>
                    <label className="mb-1 block text-sm font-bold text-slate-700">Đơn vị</label>
                    <input 
                      type="text" 
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none" 
                      value={formData.unit || ''}
                      onChange={e => setFormData({...formData, unit: e.target.value})}
                    />
                 </div>
                 
                 <div className="col-span-2">
                    <label className="mb-1 block text-sm font-bold text-slate-700">Nhà sản xuất</label>
                    <input 
                      type="text" 
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none" 
                      value={formData.manufacturer || ''}
                      onChange={e => setFormData({...formData, manufacturer: e.target.value})}
                    />
                 </div>

                 <div>
                    <label className="mb-1 block text-sm font-bold text-slate-700">Số lượng</label>
                    <input 
                      type="number" 
                      min="0"
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none disabled:bg-slate-50" 
                      value={formData.quantity || 0}
                      onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                      disabled={!!selectedStock} // Sửa kho không tự ý đổi lượng tồn, phải dùng tính năng nhập kho (import)
                    />
                 </div>
                 
                 <div>
                    <label className="mb-1 block text-sm font-bold text-slate-700">Mức tối thiểu</label>
                    <input 
                      type="number" 
                      min="0"
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none" 
                      value={formData.minQuantity || 0}
                      onChange={e => setFormData({...formData, minQuantity: Number(e.target.value)})}
                    />
                 </div>

                 <div className="col-span-2">
                    <label className="mb-1 block text-sm font-bold text-slate-700">Đơn giá bán</label>
                    <input 
                      type="number" 
                      min="0"
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none" 
                      value={formData.unitPrice || 0}
                      onChange={e => setFormData({...formData, unitPrice: Number(e.target.value)})}
                    />
                 </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 rounded-b-2xl bg-slate-50 px-6 py-4 border-t">
              <button 
                 onClick={() => setIsModalOpen(false)}
                 className="rounded-lg bg-white px-4 py-2 font-bold text-slate-600 border hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button 
                 onClick={handleSave}
                 className="rounded-lg bg-indigo-600 px-4 py-2 font-bold text-white shadow-lg hover:bg-indigo-700"
              >
                Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminInventory;
