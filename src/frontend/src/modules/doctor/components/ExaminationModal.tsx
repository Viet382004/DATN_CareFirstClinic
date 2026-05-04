import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X, User, History, Clipboard, Plus, Trash2, Activity, Search, Pill, Clock,
  ArrowRight, Info, Stethoscope, CreditCard, Save, Calendar, AlertTriangle,
  ChevronRight, ArrowLeft
} from 'lucide-react';
import { appointmentService } from '../../../services/appointmentService';
import { medicalRecordService } from '../../../services/medicalRecordService';
import type { MedicalRecord, CreateMedicalRecordDTO, UpdateMedicalRecordDTO } from '../../../types/medicalRecord';
import { prescriptionService } from '../../../services/prescriptionService';
import type { CreatePrescriptionDetailDTO } from '../../../types/prescription';
import { stockService } from '../../../services/stockService';
import type { Stock } from '../../../types/stock';
import { serviceOrderService } from '../../../services/serviceOrderService';
import type { Service, ServiceOrder } from '../../../types/serviceOrder';
import { toast } from 'sonner';
import type { Appointment } from '../../../types/appointment';
import { formatDate } from '../../../utils/format';
import { cn } from '../../../lib/utils';
import { exportElementToPDF } from '../../../utils/exportUtils';
import { Download as DownloadIcon } from 'lucide-react';

interface ExaminationModalProps {
  appointment: Appointment;
  onClose: () => void;
  onComplete: () => void;
}

const ExaminationModal: React.FC<ExaminationModalProps> = ({ appointment, onClose, onComplete }) => {
  const [activeTab, setActiveTab] = useState<'exam' | 'history'>('exam');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [patientHistory, setPatientHistory] = useState<MedicalRecord[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [existingRecord, setExistingRecord] = useState<MedicalRecord | null>(null);
  const [existingPrescription, setExistingPrescription] = useState<any>(null);

  // Medicine Selection
  const [medicines, setMedicines] = useState<Stock[]>([]);
  const [searchingMedicines, setSearchingMedicines] = useState(false);
  const [medicineSearch, setMedicineSearch] = useState('');

  // Service search state
  const [serviceSearch, setServiceSearch] = useState('');

  // Form states
  const [recordForm, setRecordForm] = useState<CreateMedicalRecordDTO>({
    appointmentId: appointment.id,
    diagnosis: '',
    symptoms: '',

    notes: '',
    followUpDate: undefined,
  });

  const [prescriptionDetails, setPrescriptionDetails] = useState<(CreatePrescriptionDetailDTO & { medicineName?: string; unit?: string; unitPrice?: number })[]>([]);

  // Services State
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [existingServiceOrders, setExistingServiceOrders] = useState<ServiceOrder[]>([]);

  // Calculate Total Billing
  const medicineTotal = useMemo(
    () => prescriptionDetails.reduce((sum, item) => sum + (item.quantity * (item.unitPrice || 0)), 0),
    [prescriptionDetails]
  );
  const serviceTotal = useMemo(() => {
    return existingServiceOrders.reduce((sum, order) => sum + (order.priceAtOrder || 0), 0);
  }, [existingServiceOrders]);

  const totalAmount = useMemo(() => medicineTotal + (appointment.consultationFee || 0) + serviceTotal, [medicineTotal, appointment.consultationFee, serviceTotal]);

  // Check if editable (within 24h)
  const isEditable = useMemo(() => {
    if (appointment.status !== 'Completed' || !existingRecord) return true;
    const createdAt = new Date(existingRecord.createdAt).getTime();
    const now = new Date().getTime();
    return (now - createdAt) < 24 * 60 * 60 * 1000;
  }, [appointment.status, existingRecord]);

  const fetchHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const res = await medicalRecordService.getList({
        patientId: appointment.patientId,
        pageSize: 50,
        sortBy: 'createdAt',
        sortDir: 'desc'
      });
      const items = (res as any).items || [];
      setPatientHistory(items);
    } catch (error) {
      console.error("History fetch error:", error);
    } finally {
      setLoadingHistory(false);
    }
  }, [appointment.patientId]);

  const loadExistingRecord = useCallback(async () => {
    try {
      setExistingRecord(null);
      setExistingPrescription(null);
      setPrescriptionDetails([]);

      const record = await medicalRecordService.getByAppointmentId(appointment.id);

      if (!record) return;

      setExistingRecord(record);

      setRecordForm({
        appointmentId: appointment.id,
        diagnosis: record.diagnosis || '',
        symptoms: record.symptoms || '',
        notes: record.notes || '',
        followUpDate: record.followUpDate
          ? record.followUpDate.split('T')[0]
          : undefined,
      });

      try {
        const prescription = await prescriptionService.getByMedicalRecordId(record.id);

        if (!prescription) return;

        setExistingPrescription(prescription);

        setPrescriptionDetails(
          prescription.details.map((d: any) => ({
            stockId: d.stockId,
            medicineName: d.medicineName,
            unit: d.unit,
            unitPrice: d.unitPrice,
            frequency: d.frequency,
            durationDays: d.durationDays,
            quantity: d.quantity,
            instructions: d.instructions || '',
          }))
        );
      } catch {
        console.log('No prescription found');
      }
    } catch {
      console.log('No existing record');
    }
  }, [appointment.id]);

  const loadServicesAndOrders = useCallback(async () => {
    try {
      const services = await serviceOrderService.getAvailableServices();
      setAvailableServices(services.filter(s => s.isActive));

      const orders = await serviceOrderService.getOrdersByAppointmentId(appointment.id);
      setExistingServiceOrders(orders);
      
      // Select orders that are pending
      setSelectedServices(orders.map(o => o.serviceId));
    } catch (error) {
      console.error("Failed to load services or orders", error);
    }
  }, [appointment.id]);

  const searchMedicines = useCallback(async (q: string) => {
    try {
      setSearchingMedicines(true);
      const res = await stockService.getList({ name: q, pageSize: 5, isActive: true });
      const items = (res as any).items || [];
      setMedicines(items);
    } catch (error) {
      console.error("Medicine search error:", error);
    } finally {
      setSearchingMedicines(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    loadExistingRecord();
    loadServicesAndOrders();
  }, [fetchHistory, loadExistingRecord, loadServicesAndOrders]);

  useEffect(() => {
    if (medicineSearch) {
      searchMedicines(medicineSearch);
    }
  }, [medicineSearch, searchMedicines]);
  const addMedicine = (stock: Stock) => {
    if (!isEditable) return;
    if (prescriptionDetails.some(d => d.stockId === stock.id)) {
      return toast.info("Thuốc này đã có trong đơn.");
    }
    const newDetail = {
      stockId: stock.id,
      medicineName: stock.medicineName,
      unit: stock.unit,
      unitPrice: stock.unitPrice,
      frequency: 'Ngày 2 lần, sáng/tối sau ăn',
      durationDays: 7,
      quantity: 14,
      instructions: ''
    };
    setPrescriptionDetails([...prescriptionDetails, newDetail]);
  };

  const removeMedicine = (id: string) => {
    if (!isEditable) return;

    setPrescriptionDetails(prev =>
      prev.filter(d => d.stockId !== id)
    );
  };

  const updateDetail = (
    stockId: string,
    field: string,
    value: any
  ) => {
    if (!isEditable) return;

    setPrescriptionDetails(prev =>
      prev.map(d =>
        d.stockId === stockId ? { ...d, [field]: value } : d
      )
    );
  };

  const handleSaveServices = async () => {
    if (!isEditable) return;
    const newServiceIds = selectedServices.filter(id => !existingServiceOrders.some(o => o.serviceId === id));
    
    if (newServiceIds.length === 0) {
      return toast.info("Không có dịch vụ mới nào được chọn.");
    }

    try {
      setSubmitting(true);
      await serviceOrderService.orderServices(appointment.id, newServiceIds);
      toast.success("Đã lưu và gửi chỉ định dịch vụ thành công!");
      await loadServicesAndOrders();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi chỉ định dịch vụ.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!isEditable) return;
    
    if (!recordForm.diagnosis?.trim()) {
      return toast.error("Vui lòng nhập chẩn đoán bệnh.");
    }

    if (prescriptionDetails.length === 0) {
      return toast.error("Vui lòng kê đơn thuốc trước khi hoàn tất ca khám.");
    }

    const hasPendingServices = existingServiceOrders.some(o => o.status !== 'Completed' && o.status !== 'Cancelled');
    if (hasPendingServices) {
      return toast.error("Các dịch vụ đã chỉ định chưa có kết quả. Vui lòng đợi hoàn tất trước khi kết thúc ca khám.");
    }

    try {
      setSubmitting(true);

      const payload = {
        appointmentId: recordForm.appointmentId,
        diagnosis: recordForm.diagnosis.trim(),
        symptoms: recordForm.symptoms?.trim() || undefined,
        notes: recordForm.notes?.trim() || undefined,
        followUpDate: recordForm.followUpDate,
      };

      let currentRecordId = existingRecord?.id;

      if (existingRecord) {
        // Kiểm tra xem có thay đổi không trước khi update
        const hasChanges = () => {
          return (
            payload.diagnosis !== existingRecord.diagnosis ||
            payload.symptoms !== existingRecord.symptoms ||
            payload.notes !== existingRecord.notes ||
            payload.followUpDate !== existingRecord.followUpDate?.split('T')[0]
          );
        };

        if (hasChanges()) {
          try {
            console.log('Updating record with ID:', existingRecord.id);
            await medicalRecordService.update(existingRecord.id, payload as UpdateMedicalRecordDTO);
            console.log('Update success');
          } catch (updateError: any) {
            console.error('Update failed:', updateError);
            // Nếu update thất bại do 404, có thể record không thuộc về doctor này
            if (updateError.status === 404) {
              toast.error("Không thể cập nhật hồ sơ. Bạn không có quyền sửa hồ sơ này.");
              return;
            }
            throw updateError;
          }
        }
        currentRecordId = existingRecord.id;
      } else {
        // Tạo mới Medical Record
        const recordRes = await medicalRecordService.create(payload);
        currentRecordId = recordRes.data?.id || recordRes.data.id;
        console.log('Created new record with ID:', currentRecordId);
      }

      if (prescriptionDetails.length > 0 && currentRecordId) {
        const pPayload = {
          notes: existingPrescription ? "Cập nhật đơn thuốc" : "Kê đơn bệnh án",
          details: prescriptionDetails.map(({ medicineName, unit, unitPrice, ...rest }) => rest)
        };

        try {
          if (existingPrescription) {
            // Cập nhật đơn thuốc cũ
            console.log('Updating prescription:', existingPrescription.id);
            await prescriptionService.update(existingPrescription.id, pPayload);
            console.log('Prescription updated');
          } else {
            // Tạo đơn thuốc mới
            console.log('Creating new prescription for record:', currentRecordId);
            await prescriptionService.create({
              medicalRecordId: currentRecordId,
              ...pPayload
            });
            console.log('Prescription created');
          }
        } catch (prescriptionError: any) {
          console.error('Prescription error:', prescriptionError);
          toast.error("Hồ sơ đã lưu nhưng có lỗi khi xử lý đơn thuốc. Vui lòng kiểm tra lại tồn kho.");
        }
      } else if (existingPrescription && prescriptionDetails.length === 0) {
        console.log('Prescription cleared but keeping existing');
      }

      await appointmentService.updateMedicineFee(appointment.id, medicineTotal);

      // Save service orders if changed (only add new ones)
      const newServiceIds = selectedServices.filter(id => !existingServiceOrders.some(o => o.serviceId === id));
      if (newServiceIds.length > 0) {
        try {
          await serviceOrderService.orderServices(appointment.id, newServiceIds);
          console.log('Ordered new services:', newServiceIds);
        } catch (err) {
          console.error('Failed to order services', err);
          toast.error("Lỗi khi chỉ định dịch vụ.");
        }
      }

      // Chuyển trạng thái Appointment thành Completed
      if (appointment.status !== 'Completed') {
        try {
          // Nếu đang ở trạng thái Waiting (chưa nhấn Bắt đầu khám), thì phải Start trước
          if (appointment.status === 'Waiting') {
            await appointmentService.startExamination(appointment.id);
          }
          await appointmentService.complete(appointment.id);
          console.log('Appointment completed successfully');
        } catch (statusError) {
          console.error('Failed to update appointment status:', statusError);
          // Vẫn cho qua nếu record đã lưu, nhưng cảnh báo
        }
      }

      toast.success(existingRecord ? "Cập nhật kết quả thành công!" : "Hoàn tất ca khám thành công!");
      onComplete();
    } catch (error: any) {
      console.error("Examination submit error:", error);
      toast.error(error.response?.data?.message || error.message || "Lỗi khi xử lý ca khám.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-0">
      <div className="bg-white w-full h-full md:h-[95vh] md:max-w-[1500px] md:rounded-none shadow-2xl flex flex-col overflow-hidden">

        {/* Professional Clinical Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-600 rounded-sm flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <Stethoscope size={20} />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Khu vực làm việc lâm sàng</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 font-bold rounded-sm uppercase tracking-tighter">
                    {appointment.specialtyName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Lịch hẹn: {appointment.startTime} | {formatDate(appointment.workDate)}</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-8 pl-8 border-l border-slate-100">
              <HeaderInfoItem icon={<User size={14} />} label="Bệnh nhân" value={appointment.patientName} />
              <HeaderInfoItem icon={<Activity size={14} />} label="Trạng thái" value={appointment.status} status />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-sm">
              <button
                onClick={() => setActiveTab('exam')}
                className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-sm transition-all", activeTab === 'exam' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >Khám bệnh</button>
              <button
                onClick={() => setActiveTab('history')}
                className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-sm transition-all", activeTab === 'history' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >Lịch sử ({patientHistory.length})</button>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-sm text-slate-400"><X size={20} /></button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {activeTab === 'exam' ? (
            <>
              {/* LEFT: Examination Forms */}
              <div id="clinical-work-area" className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-8 bg-slate-50/30">



                {/* Clinical Findings */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <SectionTitle icon={<Clipboard className="text-amber-500" />} title="Triệu chứng & Ghi chú" />
                    <textarea
                      value={recordForm.symptoms}
                      onChange={e => setRecordForm({ ...recordForm, symptoms: e.target.value })}
                      placeholder="Nhập các triệu chứng lâm sàng ghi nhận..."
                      className="w-full h-32 p-4 text-xs font-medium border border-slate-200 rounded-sm bg-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none"
                      disabled={!isEditable}
                    />
                  </div>
                  <div className="space-y-4">
                    <SectionTitle icon={<Stethoscope className="text-indigo-600" />} title="Chẩn đoán bệnh *" />
                    <textarea
                      value={recordForm.diagnosis}
                      onChange={e => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                      placeholder="Chẩn đoán xác định của bác sĩ..."
                      className="w-full h-32 p-4 text-xs font-black border border-indigo-100 rounded-sm bg-indigo-50/10 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none text-indigo-900"
                      disabled={!isEditable}
                    />
                  </div>
                </section>

                {/* Service Orders Section */}
                <section>
                  <div className="flex justify-between items-end mb-4">
                    <SectionTitle icon={<Activity className="text-blue-500" />} title="Chỉ định dịch vụ / Xét nghiệm" />
                    <div className="flex gap-2 items-center">
                      <div className="relative w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                          type="text"
                          placeholder="Tìm dịch vụ..."
                          className="w-full pl-9 pr-4 py-1.5 text-[10px] font-bold border border-slate-200 rounded-sm outline-none focus:border-indigo-500"
                          value={serviceSearch}
                          onChange={e => setServiceSearch(e.target.value)}
                        />
                      </div>
                      {isEditable && (
                        <button 
                          onClick={handleSaveServices}
                          disabled={submitting}
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase rounded-sm shadow-sm transition-all whitespace-nowrap disabled:opacity-50"
                        >
                          Lưu & Gửi chỉ định
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-sm p-4">
                    {availableServices.length === 0 ? (
                      <div className="py-8 text-center border border-dashed border-slate-200 rounded-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                          Không tìm thấy dịch vụ/xét nghiệm nào khả dụng.
                        </p>
                        <p className="text-[9px] text-slate-300 mt-1">Vui lòng cấu hình dịch vụ trong trang quản trị.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {availableServices
                          .filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase()))
                          .map(service => {
                          const order = existingServiceOrders.find(o => o.serviceId === service.id);
                          const isOrdered = !!order;
                          const isSelected = selectedServices.includes(service.id);
                          return (
                            <div key={service.id} className="flex flex-col gap-2">
                              <label 
                                className={cn(
                                  "flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-all",
                                  isSelected ? "bg-indigo-50 border-indigo-200" : "bg-slate-50 border-slate-200 hover:border-indigo-300",
                                  isOrdered ? "opacity-75" : ""
                                )}
                              >
                                <input
                                  type="checkbox"
                                  className="mt-1"
                                  checked={isSelected}
                                  disabled={isOrdered || !isEditable}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedServices(prev => [...prev, service.id]);
                                    } else {
                                      setSelectedServices(prev => prev.filter(id => id !== service.id));
                                    }
                                  }}
                                />
                                <div className="flex-1">
                                  <p className="text-[11px] font-black text-slate-800">{service.name}</p>
                                  <p className="text-[10px] font-bold text-slate-500">{service.price.toLocaleString('vi-VN')}đ</p>
                                  {isOrdered && (
                                    <span className={cn(
                                      "text-[9px] font-black mt-1 uppercase block",
                                      order.status === 'Completed' ? "text-emerald-600" : "text-amber-600"
                                    )}>
                                      {order.status === 'Completed' ? 'Đã có kết quả' : 'Đang xử lý / Chờ'}
                                    </span>
                                  )}
                                </div>
                              </label>

                              {isOrdered && order.status === 'Completed' && order.resultData && (
                                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-md text-[10px]">
                                  <p className="font-black text-emerald-800 mb-2 uppercase flex items-center gap-1">
                                    <Activity size={12} /> Kết quả xét nghiệm
                                  </p>
                                  <div className="space-y-3">
                                    {(() => {
                                      try {
                                        const data = JSON.parse(order.resultData);
                                        const conclusion = data.specialistConclusion;
                                        const fields = Object.entries(data).filter(([k]) => k !== 'specialistConclusion');

                                        return (
                                          <>
                                            {fields.length > 0 && (
                                              <ul className="space-y-1">
                                                {fields.map(([k, v]) => (
                                                  <li key={k} className="flex justify-between border-b border-emerald-100/30 pb-0.5 items-end">
                                                    <span className="text-emerald-700 font-bold">{k}:</span>
                                                    <span className="text-emerald-900 font-black ml-2 text-right">{String(v)}</span>
                                                  </li>
                                                ))}
                                              </ul>
                                            )}
                                            {conclusion && (
                                              <div className="mt-2 p-2 bg-emerald-100/50 rounded border border-emerald-200">
                                                <span className="text-[9px] font-black text-emerald-800 uppercase block mb-0.5">Kết luận chuyên môn:</span>
                                                <p className="text-emerald-900 font-bold leading-tight">{conclusion}</p>
                                              </div>
                                            )}
                                          </>
                                        );
                                      } catch (e) {
                                        return <p className="text-emerald-900 font-black">{order.resultData}</p>;
                                      }
                                    })()}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>

                {/* Prescription Section */}
                <section>
                  <div className="flex justify-between items-end mb-4">
                    <SectionTitle icon={<Pill className="text-emerald-500" />} title="Kê đơn thuốc" />
                    {isEditable && (
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                          type="text"
                          placeholder="Tìm thuốc nhanh..."
                          className="w-full pl-9 pr-4 py-1.5 text-[10px] font-bold border border-slate-200 rounded-sm outline-none focus:border-indigo-500"
                          value={medicineSearch}
                          onChange={e => {
                            setMedicineSearch(e.target.value);
                            searchMedicines(e.target.value);
                          }}
                        />
                        {medicineSearch && medicines.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-sm z-50 max-h-60 overflow-y-auto">
                            {medicines.map(m => (
                              <button
                                key={m.id}
                                onClick={() => {
                                  addMedicine(m);
                                  setMedicineSearch('');
                                }}
                                className="w-full flex items-center justify-between p-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors"
                              >
                                <div className="text-left">
                                  <p className="text-[11px] font-black text-slate-800">{m.medicineName}</p>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase">{m.unit} | {m.unitPrice.toLocaleString('vi-VN')}đ</p>
                                </div>
                                <Plus size={14} className="text-indigo-600" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <tr>
                          <th className="px-4 py-3">Tên thuốc</th>
                          <th className="px-4 py-3 w-28">Số lượng</th>
                          <th className="px-4 py-3 w-48">Liều dùng</th>
                          <th className="px-4 py-3 w-24">Đơn giá</th>
                          <th className="px-4 py-3 w-24">Thành tiền</th>
                          <th className="px-4 py-3 w-10 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 italic">
                        {prescriptionDetails.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-12 text-center text-slate-400 font-medium text-xs not-italic">Chưa có thuốc nào được chọn.</td>
                          </tr>
                        ) : (
                          prescriptionDetails.map(item => (
                            <tr key={item.stockId} className="hover:bg-slate-50/50 not-italic">
                              <td className="px-4 py-3">
                                <p className="text-xs font-black text-slate-800">{item.medicineName}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">{item.unit}</p>
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={e => updateDetail(item.stockId, 'quantity', parseInt(e.target.value) || 0)}
                                  className="w-full bg-slate-100/50 border-none rounded-sm p-1.5 text-xs font-bold text-center outline-none focus:ring-1 focus:ring-indigo-500"
                                  disabled={!isEditable}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  value={item.frequency}
                                  onChange={e => updateDetail(item.stockId, 'frequency', e.target.value)}
                                  placeholder="Cách dùng..."
                                  className="w-full bg-slate-100/50 border-none rounded-sm p-1.5 text-xs font-medium outline-none focus:ring-1 focus:ring-indigo-500"
                                  disabled={!isEditable}
                                />
                              </td>
                              <td className="px-4 py-3 text-xs font-bold text-slate-500">{(item.unitPrice || 0).toLocaleString('vi-VN')}đ</td>
                              <td className="px-4 py-3 text-xs font-black text-indigo-600">{(item.quantity * (item.unitPrice || 0)).toLocaleString('vi-VN')}đ</td>
                              <td className="px-4 py-3">
                                {isEditable && (
                                  <button onClick={() => removeMedicine(item.stockId)} className="text-slate-300 hover:text-rose-600 transition-colors">
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Follow up & Notes */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <SectionTitle icon={<Save className="text-indigo-600" />} title="Thông tin bổ sung" />
                    <textarea
                      value={recordForm.notes}
                      onChange={e => setRecordForm({ ...recordForm, notes: e.target.value })}
                      placeholder="Ghi chú thêm về cuộc khám..."
                      className="w-full h-24 p-4 text-xs font-medium border border-slate-200 rounded-sm bg-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none"
                      disabled={!isEditable}
                    />
                  </div>
                  <div className="space-y-4">
                    <SectionTitle icon={<Calendar className="text-indigo-600" />} title="Lịch hẹn tái khám" />
                    <input
                      type="date"
                      value={recordForm.followUpDate || ''}
                      onChange={e => setRecordForm({ ...recordForm, followUpDate: e.target.value })}
                      className="w-full p-4 text-sm font-bold border border-slate-200 rounded-sm bg-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      disabled={!isEditable}
                    />
                    <p className="text-[10px] text-slate-400 font-medium italic">* Để trống nếu không cần tái khám.</p>
                  </div>
                </section>

              </div>

              {/* RIGHT: Billing Summary Sidebar */}
              <aside className="w-80 border-l border-slate-200 bg-white p-6 flex flex-col shrink-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto scrollbar-none space-y-8">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-6 pb-2 border-b border-slate-100 flex items-center gap-2">
                      <CreditCard size={16} className="text-indigo-600" /> Tóm tắt hóa đơn
                    </h3>

                    <div className="space-y-4">
                      <BillingItem label="Phí khám bệnh" value={appointment.consultationFee || 0} />
                      <BillingItem label={`Hạng mục thuốc (${prescriptionDetails.length})`} value={medicineTotal} />
                      <BillingItem label={`Dịch vụ cận lâm sàng (${existingServiceOrders.length})`} value={serviceTotal} />

                      <div className="pt-4 border-t border-slate-100 mt-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng cộng dự kiến</p>
                        <p className="text-3xl font-black text-indigo-600 tabular-nums">{totalAmount.toLocaleString('vi-VN')}<span className="text-sm ml-1 uppercase">đ</span></p>
                      </div>
                    </div>
                  </div>

                  {!isEditable && (
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-sm">
                      <div className="flex items-center gap-2 text-rose-600 mb-2">
                        <AlertTriangle size={16} />
                        <span className="text-[10px] font-black uppercase">Chế độ chỉ xem</span>
                      </div>
                      <p className="text-[10px] font-medium text-rose-500 leading-relaxed italic">
                        Hồ sơ bệnh án đã quá 24 giờ kể từ lúc tạo, không thể chỉnh sửa dữ liệu để đảm bảo tính minh bạch của hệ thống.
                      </p>
                    </div>
                  )}

                  <div className="bg-indigo-50/30 p-4 rounded-sm border border-indigo-100">
                    <div className="flex items-center gap-2 text-indigo-600 mb-2">
                      <Info size={16} />
                      <span className="text-[10px] font-black uppercase">Quy trình</span>
                    </div>
                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic">
                      Sau khi nhấn "Xác nhận & Lưu kết quả", hệ thống sẽ tự động gửi thông báo cho bệnh nhân và chuyển yêu cầu thanh toán sang quầy Thu ngân.
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-3 shrink-0">
                  <button
                    onClick={onClose}
                    className="w-full py-3 text-[11px] font-black text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-sm transition-all uppercase tracking-widest"
                  >Hủy bỏ</button>
                  <button
                    disabled={submitting || !isEditable}
                    onClick={handleSubmit}
                    className={cn(
                      "w-full py-4 text-[11px] font-black text-white rounded-sm transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest flex items-center justify-center gap-2 group",
                      isEditable ? "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]" : "bg-slate-300 cursor-not-allowed"
                    )}
                  >
                    {submitting ? 'ĐANG XỬ LÝ...' : (appointment.status === 'Completed' ? 'CẬP NHẬT KẾT QUẢ' : 'XÁC NHẬN & HOÀN TẤT KHÁM')}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  {existingRecord && (
                    <button
                      onClick={() => exportElementToPDF('clinical-work-area', `Ket-Qua-Kham-${appointment.id.substring(0,8)}`)}
                      className="w-full py-3 text-[11px] font-black text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded-sm transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <DownloadIcon size={14} /> Tải hồ sơ PDF
                    </button>
                  )}
                </div>
              </aside>
            </>
          ) : (
            /* HISTORY TAB CONTENTS */
            <div className="flex-1 overflow-hidden flex bg-slate-50/30">
              <div className="flex-1 p-8 overflow-y-auto scrollbar-thin">
                {loadingHistory ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-300 gap-4">
                    <div className="h-8 w-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Đang trích xuất dữ liệu...</span>
                  </div>
                ) : patientHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-300 gap-2">
                    <History size={48} className="opacity-20" />
                    <span className="text-xs font-bold italic">Không có lịch sử khám bệnh trước đây.</span>
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto space-y-6">
                    {patientHistory.map((record) => (
                      <HistoryRecordItem key={record.id} record={record} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// UI HELPER COMPONENTS
interface HeaderInfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  status?: boolean;
}

const HeaderInfoItem: React.FC<HeaderInfoItemProps> = ({ icon, label, value, status }) => (
  <div className="flex items-center gap-3">
    <div className="p-2 bg-slate-100 text-slate-400 rounded-sm italic">{icon}</div>
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">{label}</p>
      <p className={cn("text-xs font-black", status ? "text-indigo-600" : "text-slate-700")}>{value}</p>
    </div>
  </div>
);

interface SectionTitleProps {
  icon: React.ReactNode;
  title: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ icon, title }) => (
  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
    <span className="p-1 bg-white rounded-sm shadow-sm border border-slate-50">{icon}</span>
    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">{title}</h3>
  </div>
);

interface VitalInputProps {
  label: string;
  unit: string;
  value?: number;
  onChange: (val?: number) => void;
  disabled?: boolean;
}

const VitalInput: React.FC<VitalInputProps> = ({ label, unit, value, onChange, disabled }) => (
  <div className="bg-white p-4 border border-slate-200 rounded-sm space-y-2 group focus-within:border-indigo-500 transition-colors">
    <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-tight">
      <span>{label}</span>
      <span className="opacity-40 italic">{unit}</span>
    </div>
    <input
      type="number"
      step="0.1"
      value={value || ''}
      onChange={e => onChange(parseFloat(e.target.value) || undefined)}
      className="w-full text-base font-black text-slate-800 bg-transparent outline-none focus:text-indigo-600 tabular-nums disabled:opacity-50"
      placeholder="--"
      disabled={disabled}
    />
  </div>
);

const BillingItem = ({ label, value }: any) => (
  <div className="flex justify-between items-center text-[11px]">
    <span className="text-slate-500 font-bold tracking-tight">{label}</span>
    <span className="text-slate-800 font-black tabular-nums">{value.toLocaleString('vi-VN')}đ</span>
  </div>
);

const HistoryRecordItem = ({ record }: { record: MedicalRecord }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-sm overflow-hidden transition-all hover:shadow-md">
      <div
        className="p-5 flex justify-between items-center cursor-pointer hover:bg-slate-50 group"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-6">
          <div className="text-center w-16 px-3 py-2 border-r border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">
              {new Date(record.createdAt).toLocaleDateString('vi-VN', { month: 'short' })}
            </p>
            <p className="text-xl font-black text-slate-800 leading-none">{new Date(record.createdAt).getDate()}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{record.doctorName}</span>
              <div className="h-1 w-1 bg-slate-300 rounded-full" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">{record.id.slice(0, 8)}</span>
            </div>
            <p className="text-xs font-black text-slate-800 line-clamp-1">{record.diagnosis}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {record.hasPrescription && (
            <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-tighter italic">Có đơn thuốc</span>
          )}
          <button className="text-slate-400 p-2 group-hover:text-slate-800 transition-colors">
            {expanded ? <X size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-50 bg-slate-50/10 pt-5 text-xs animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">Triệu chứng lâm sàng</h4>
                <p className="text-slate-600 font-medium leading-relaxed italic">{record.symptoms || '-- Không ghi nhận --'}</p>
              </div>
              <div>
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">Bác sĩ chẩn đoán</h4>
                <p className="text-indigo-900 font-black tracking-tight">{record.diagnosis}</p>
              </div>
              {record.notes && (
                <div>
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">Chỉ dẫn & Ghi chú</h4>
                  <p className="text-slate-500 font-bold leading-relaxed italic">{record.notes}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">


              {(record as any).serviceResults && (record as any).serviceResults.length > 0 && (
                <div>
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">Kết quả chuyên khoa / Cận lâm sàng</h4>
                  <div className="space-y-3">
                    {(record as any).serviceResults.map((res: any, idx: number) => {
                      let parsedData = {};
                      try { parsedData = JSON.parse(res.resultData || '{}'); } catch { parsedData = { 'Kết quả': res.resultData }; }
                      return (
                        <div key={idx} className="bg-white p-3 border border-slate-100 rounded-sm">
                          <p className="text-[10px] font-black text-indigo-600 mb-2 border-b border-indigo-50 pb-1 flex justify-between">
                            {res.serviceName}
                            <span className="text-[8px] text-slate-400 uppercase italic">Hoàn tất</span>
                          </p>
                          <div className="grid grid-cols-1 gap-2">
                            {Object.entries(parsedData).map(([key, val]: any) => (
                              <div key={key} className="flex justify-between items-start text-[10px]">
                                <span className="text-slate-500 font-bold">{key}:</span>
                                <span className="text-slate-800 font-black text-right">{val}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {record.followUpDate && (
                <div className="bg-white p-3 border border-indigo-100 rounded-sm">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter mb-1">Lịch tái khám</p>
                  <p className="font-black text-indigo-600 text-sm">{formatDate(record.followUpDate)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const VitalHistoryItem = ({ label, value, unit }: any) => (
  <div className="bg-white p-2 border border-slate-100 rounded-sm">
    <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">{label}</p>
    <p className="font-black text-slate-800 tabular-nums">{value || '--'}<span className="text-[7px] ml-0.5 text-slate-400">{unit}</span></p>
  </div>
);

export default ExaminationModal;