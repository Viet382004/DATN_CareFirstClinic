import React, { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Clock,
  User,
  CheckCircle2,
  Activity,
  Calendar,
  Microscope,
  Edit
} from 'lucide-react';
import { serviceOrderService } from '../../../services/serviceOrderService';
import type { ServiceOrder } from '../../../types/serviceOrder';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';
import ServiceResultModal from '../../../modules/doctor/components/ServiceResultModal';

const SpecialistQueue: React.FC = () => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      const data = await serviceOrderService.getQueue();
      setOrders(data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách chỉ định.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    // Poll every 30 seconds
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const filtered = orders.filter(o => 
    o.serviceName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Danh sách cận lâm sàng</h1>
          <p className="mt-1 text-xs font-bold text-slate-400 flex items-center gap-2 tracking-wide uppercase">
            <Microscope size={14} className="text-indigo-500" />
            Thực hiện xét nghiệm & chẩn đoán
          </p>
        </div>
      </div>

      <div className="bg-white p-4 border border-slate-200 rounded-sm shadow-sm flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm dịch vụ..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-sm text-sm font-bold focus:ring-1 focus:ring-indigo-500 outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center animate-pulse flex flex-col items-center gap-4">
           <div className="h-8 w-8 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang tải danh sách chờ...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-20 text-center rounded-sm border border-dashed border-slate-300">
          <Activity size={48} className="mx-auto text-slate-100 mb-4" />
          <p className="text-slate-400 font-black uppercase text-xs tracking-widest italic">Chưa có chỉ định nào đang chờ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(order => (
            <div key={order.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-sm bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                    <Microscope size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{order.serviceName}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{order.patientName || 'N/A'}</p>
                      <div className="h-1 w-1 bg-slate-300 rounded-full" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID: {order.id.split('-')[0]}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <span className={cn(
                  "px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-sm",
                  order.status === 'Pending' ? "bg-amber-50 text-amber-600" :
                  order.status === 'InProgress' ? "bg-blue-50 text-blue-600" :
                  "bg-emerald-50 text-emerald-600"
                )}>
                  {order.status === 'Pending' ? 'Đang chờ' : order.status === 'InProgress' ? 'Đang thực hiện' : 'Hoàn thành'}
                </span>
                
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-md hover:bg-slate-800 transition-colors"
                >
                  <Edit size={12} />
                  Nhập kết quả
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <ServiceResultModal 
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onComplete={() => {
            setSelectedOrder(null);
            fetchQueue();
          }}
        />
      )}
    </div>
  );
};

export default SpecialistQueue;
