import React, { useState, useEffect, useCallback } from 'react';
import { 
    X, User, History, Clipboard, Plus, Trash2, Activity, Search, Pill, Clock, ArrowRight, Info, Stethoscope 
} from 'lucide-react';
import { appointmentService } from '../../../services/appointmentService';
import { medicalRecordService, type CreateMedicalRecordDTO } from '../../../services/medicalRecordService';
import { prescriptionService, type CreatePrescriptionDetailDTO } from '../../../services/prescriptionService';
import { stockService, type Stock } from '../../../services/stockService';
import { toast } from 'sonner';
import type { Appointment } from '../../../types/appointment';

interface ExaminationModalProps {
    appointment: Appointment;
    onClose: () => void;
    onComplete: () => void;
}

const ExaminationModal: React.FC<ExaminationModalProps> = ({ appointment, onClose, onComplete }) => {
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [patientHistory, setPatientHistory] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);

    // Medicine Selection (giữ nguyên)
    const [medicines, setMedicines] = useState<Stock[]>([]);
    const [searchingMedicines, setSearchingMedicines] = useState(false);
    const [medicineSearch, setMedicineSearch] = useState('');

    // Form states - ĐÃ THÊM 2 TRƯỜNG MỚI
    const [recordForm, setRecordForm] = useState<CreateMedicalRecordDTO>({
        appointmentId: appointment.id,
        diagnosis: '',
        symptoms: '',
        bloodPressure: undefined,
        heartRate: undefined,
        temperature: undefined,
        weight: undefined,
        height: undefined,
        notes: '',           // ← Thêm trường Ghi chú
        followUpDate: undefined, // ← Thêm trường Ngày tái khám
    });

    const [prescriptionDetails, setPrescriptionDetails] = useState<CreatePrescriptionDetailDTO[]>([]);

    // Fetch History
    const fetchHistory = useCallback(async () => {
        try {
            setLoadingHistory(true);
            const res = await medicalRecordService.getList({
                patientId: appointment.patientId,
                pageSize: 10,
                sortBy: 'createdAt',
                sortDir: 'desc'
            });
            const items = (res as any).data?.items || res.items || [];
            setPatientHistory(items);
        } catch (error) {
            console.error("History fetch error:", error);
        } finally {
            setLoadingHistory(false);
        }
    }, [appointment.patientId]);

    // Load bệnh án cũ nếu là Completed
    const loadExistingRecord = useCallback(async () => {
        if (appointment.status !== 'Completed') return;

        try {
            const record = await medicalRecordService.getByAppointmentId(appointment.id);
            if (record) {
                setRecordForm({
                    appointmentId: appointment.id,
                    diagnosis: record.diagnosis || '',
                    symptoms: record.symptoms || '',
                    bloodPressure: record.bloodPressure,
                    heartRate: record.heartRate,
                    temperature: record.temperature,
                    weight: record.weight,
                    height: record.height,
                    notes: record.notes || '',
                    followUpDate: record.followUpDate ? record.followUpDate.split('T')[0] : undefined,
                });
            }
        } catch (error) {
            console.log("Chưa có bệnh án cho lịch hẹn này");
        }
    }, [appointment]);

    const searchMedicines = useCallback(async (q: string) => {
        try {
            setSearchingMedicines(true);
            const res = await stockService.getList({ name: q, pageSize: 15, isActive: true });
            const items = (res as any).data?.items || res.items || [];
            setMedicines(items);
        } catch (error) {
            console.error("Medicine search error:", error);
        } finally {
            setSearchingMedicines(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
        loadExistingRecord();        // ← Thêm dòng này
        searchMedicines('');
    }, [fetchHistory, loadExistingRecord, searchMedicines]);

    // Các hàm addMedicine, removeMedicine, updateDetail giữ nguyên như cũ của bạn
    const addMedicine = (stock: Stock) => {
        if (prescriptionDetails.some(d => d.stockId === stock.id)) {
            return toast.info("Thuốc này đã có trong đơn.");
        }
        const newDetail: CreatePrescriptionDetailDTO = {
            stockId: stock.id,
            frequency: 'Ngày 2 lần, sáng/tối sau ăn',
            durationDays: 7,
            quantity: 14,
            instructions: ''
        };
        (newDetail as any).medicineName = stock.medicineName;
        (newDetail as any).unit = stock.unit;

        setPrescriptionDetails([...prescriptionDetails, newDetail]);
    };

    const removeMedicine = (id: string) => {
        setPrescriptionDetails(prescriptionDetails.filter(d => d.stockId !== id));
    };

    const updateDetail = (stockId: string, field: keyof CreatePrescriptionDetailDTO, value: any) => {
        setPrescriptionDetails(prescriptionDetails.map(d =>
            d.stockId === stockId ? { ...d, [field]: value } : d
        ));
    };

    const handleSubmit = async () => {
        if (!recordForm.diagnosis?.trim()) {
            return toast.error("Vui lòng nhập chẩn đoán bệnh.");
        }

        try {
            setSubmitting(true);

            const payload: CreateMedicalRecordDTO = {
                appointmentId: recordForm.appointmentId,
                diagnosis: recordForm.diagnosis.trim(),
                symptoms: recordForm.symptoms?.trim() || undefined,
                bloodPressure: recordForm.bloodPressure,
                heartRate: recordForm.heartRate,
                temperature: recordForm.temperature,
                weight: recordForm.weight,
                height: recordForm.height,
                notes: recordForm.notes?.trim() || undefined,
                followUpDate: recordForm.followUpDate,
            };

            const recordRes = await medicalRecordService.create(payload);
            const medicalRecordId = recordRes?.data?.id || (recordRes as any)?.id || (recordRes as any)?.data?.id;

            if (prescriptionDetails.length > 0 && medicalRecordId) {
                await prescriptionService.create({
                    medicalRecordId,
                    details: prescriptionDetails,
                    notes: "Kê đơn tự động qua hệ thống khám bệnh"
                });
            }

            await appointmentService.complete(appointment.id);

            toast.success("Ca khám đã được lưu thành công!");
            onComplete();
        } catch (error: any) {
            console.error("Submit Error:", error);
            toast.error(error?.message || "Lỗi khi lưu ca khám. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-[1400px] h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden border border-slate-200">

                {/* Unified Header - Giữ nguyên */}
                <div className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 bg-indigo-500 rounded flex items-center justify-center">
                            <Stethoscope size={18} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-wider">Không gian làm việc lâm sàng</h2>
                            <p className="text-[10px] text-slate-400 font-medium">Bệnh nhân: <span className="text-white">{appointment.patientName}</span> | {appointment.startTime} - {appointment.specialtyName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Main Side-by-Side Workspace - GIỮ NGUYÊN LAYOUT CỦA BẠN */}
                <div className="flex-1 flex overflow-hidden">

                    {/* LEFT PANEL - Giữ nguyên 100% code cũ của bạn */}
                    <div className="w-[35%] border-r border-slate-200 bg-slate-50 flex flex-col overflow-hidden">
                        <div className="p-5 flex-1 overflow-y-auto space-y-6 scrollbar-thin">
                            {/* Patient Context, Vitals, History Timeline - GIỮ NGUYÊN */}
                            {/* Bạn copy phần này từ file cũ của bạn vào đây */}
                        </div>
                    </div>

                    {/* RIGHT PANEL - Clinical Work - CHỈ THÊM 2 TRƯỜNG */}
                    <div className="flex-1 bg-white flex flex-col overflow-hidden">
                        <div className="flex-1 p-6 overflow-y-auto space-y-8 scrollbar-thin">

                            {/* Diagnosis Form - Giữ nguyên */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <Clipboard size={16} className="text-indigo-600" /> Kết luận & Chẩn đoán
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Triệu chứng lâm sàng</label>
                                        <textarea 
                                            value={recordForm.symptoms} 
                                            onChange={e => setRecordForm({ ...recordForm, symptoms: e.target.value })}
                                            placeholder="Ghi chú triệu chứng từ bệnh nhân..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-xs font-medium focus:ring-1 focus:ring-indigo-500 min-h-[100px] outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest pl-1">Kết luận chẩn đoán *</label>
                                        <textarea 
                                            required
                                            value={recordForm.diagnosis} 
                                            onChange={e => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                                            placeholder="Nhập chẩn đoán chính xác..."
                                            className="w-full bg-indigo-50/20 border border-indigo-200 rounded p-3 text-xs font-bold text-indigo-900 focus:ring-1 focus:ring-indigo-500 min-h-[100px] outline-none placeholder:text-indigo-300"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* === THÊM 2 TRƯỜNG MỚI Ở ĐÂY === */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Ghi chú của bác sĩ</label>
                                    <textarea 
                                        value={recordForm.notes} 
                                        onChange={e => setRecordForm({ ...recordForm, notes: e.target.value })}
                                        placeholder="Ghi chú thêm, hướng dẫn cho bệnh nhân..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-xs min-h-[100px] outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Ngày tái khám (nếu có)</label>
                                    <input 
                                        type="date"
                                        value={recordForm.followUpDate || ''}
                                        onChange={e => setRecordForm({ ...recordForm, followUpDate: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Prescription Work - GIỮ NGUYÊN PHẦN CŨ CỦA BẠN */}
                            {/* ... dán lại toàn bộ phần Prescription Work từ file cũ của bạn vào đây ... */}

                        </div>

                        {/* Final Footer Actions - Giữ nguyên */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className={`h-2 w-2 rounded-full ${recordForm.diagnosis ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Kết luận</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`h-2 w-2 rounded-full ${prescriptionDetails.length > 0 ? 'bg-amber-500' : 'bg-slate-300'}`} />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Đơn thuốc ({prescriptionDetails.length})</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={onClose} className="px-5 py-2 text-[11px] font-bold text-slate-500 hover:bg-slate-200 rounded transition-colors uppercase">Hủy bỏ</button>
                                <button
                                    disabled={submitting}
                                    onClick={handleSubmit}
                                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-2 rounded text-[11px] font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                >
                                    {submitting ? 'ĐANG LƯU HỆ THỐNG...' : 'XÁC NHẬN & LƯU KẾT QUẢ'} <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Internal Components (giữ nguyên)
const InfoBox = ({ label, value }: { label: string, value: string }) => (
    <div>
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{label}</p>
        <p className="text-[11px] font-bold text-slate-800 leading-tight">{value}</p>
    </div>
);

const SmallVital = ({ label, unit, value, onChange }: any) => (
    <div className="space-y-1">
        <label className="text-[8px] font-bold text-slate-500 uppercase px-1">{label}</label>
        <div className="relative group">
            <input 
                type="number" step="0.1"
                value={value || ''}
                onChange={e => onChange(parseFloat(e.target.value) || undefined)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-bold text-slate-700 text-center focus:bg-white focus:ring-1 focus:ring-rose-500 outline-none transition-all"
                placeholder="--"
            />
            <span className="absolute right-1 bottom-1 text-[7px] text-slate-300 font-bold uppercase">{unit}</span>
        </div>
    </div>
);

export default ExaminationModal;