import React, { useState } from 'react';
import { X, Save, Activity, Microscope } from 'lucide-react';
import { serviceOrderService } from '../../../services/serviceOrderService';
import type { ServiceOrder } from '../../../types/serviceOrder';
import { toast } from 'sonner';

interface Props {
  order: ServiceOrder;
  onClose: () => void;
  onComplete: () => void;
}

const ServiceResultModal: React.FC<Props> = ({ order, onClose, onComplete }) => {
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    try {
      return order.resultData ? JSON.parse(order.resultData) : {};
    } catch {
      return { generalResult: order.resultData || '' };
    }
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (order.serviceFields && order.serviceFields.length > 0) {
      const missingFields = order.serviceFields.filter(f => !formData[f.fieldName] || formData[f.fieldName].trim() === '');
      if (missingFields.length > 0) {
        return toast.error(`Vui lòng nhập đầy đủ các chỉ số: ${missingFields.map(f => f.fieldName).join(', ')}`);
      }
    }
    
    if (!formData.specialistConclusion || formData.specialistConclusion.trim() === '') {
      return toast.error("Vui lòng nhập kết luận chuyên môn cuối cùng.");
    }
    try {
      setLoading(true);
      await serviceOrderService.saveResult(order.id, { resultData: JSON.stringify(formData) });
      toast.success("Đã lưu kết quả cận lâm sàng!");
      onComplete();
    } catch (error) {
      toast.error("Lỗi khi lưu kết quả.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
              <Microscope size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">{order.serviceName}</h2>
              <p className="text-xs text-slate-500 font-medium">Mã phiếu: {order.id.split('-')[0]}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Activity size={16} className="text-indigo-500" /> Nhập kết quả chuyên môn
            </h3>

            {order.serviceFields && order.serviceFields.length > 0 && (
              <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-4">
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Activity size={14} /> Chỉ số xét nghiệm/Kỹ thuật
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {order.serviceFields.map(field => (
                    <div key={field.id} className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 block">
                        {field.fieldName} {field.unit && <span className="text-slate-400 font-medium ml-1">({field.unit})</span>}
                      </label>
                      {field.dataType === 'Number' ? (
                        <input
                          type="number"
                          className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-bold text-indigo-900"
                          value={formData[field.fieldName] || ''}
                          onChange={e => updateField(field.fieldName, e.target.value)}
                          placeholder={`Nhập ${field.fieldName}...`}
                        />
                      ) : (
                        <input
                          type="text"
                          className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-bold text-indigo-900"
                          value={formData[field.fieldName] || ''}
                          onChange={e => updateField(field.fieldName, e.target.value)}
                          placeholder={`Nhập ${field.fieldName}...`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                Kết luận chuyên môn cuối cùng *
              </label>
              <textarea
                className="w-full h-32 p-4 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-white font-medium"
                placeholder="Nhập chẩn đoán hình ảnh, kết luận xét nghiệm hoặc lưu ý chuyên môn..."
                value={formData.specialistConclusion || ''}
                onChange={e => updateField('specialistConclusion', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2.5 rounded-lg text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              {loading ? 'Đang lưu...' : 'Lưu kết quả'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceResultModal;
