import React, { useState, useEffect, useCallback } from 'react';
import {
    X, User, Calendar, Phone, Mail, MapPin,
    History, Clipboard, Activity, Pill, Clock,
    ChevronDown, ChevronUp, FileText, AlertCircle
} from 'lucide-react';
import { patientService } from '../../../services/patientService';
import { medicalRecordService } from '../../../services/medicalRecordService';
import { prescriptionService } from '../../../services/prescriptionService';
import type { Patient } from '../../../types/patient';
import type { MedicalRecord } from '../../../types/medicalRecord';
import type { Prescription } from '../../../types/prescription';
import { toast } from 'sonner';
import { formatDate } from '../../../utils/format';

interface PatientDetailsModalProps {
    patientId: string;
    onClose: () => void;
}

const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({ patientId, onClose }) => {
    const [patient, setPatient] = useState<Patient | null>(null);
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
    const [prescriptions, setPrescriptions] = useState<Record<string, Prescription>>({});
    const [loadingPrescription, setLoadingPrescription] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [patientData, recordsData] = await Promise.all([
                patientService.getById(patientId),
                medicalRecordService.getList({ patientId, pageSize: 50, sortBy: 'createdAt', sortDir: 'desc' })
            ]);

            setPatient(patientData);
            setRecords(recordsData.items || []);
        } catch (error) {
            console.error("Error fetching patient details:", error);
            toast.error("Không thể tải thông tin bệnh nhân.");
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const toggleRecord = async (recordId: string) => {
        if (expandedRecordId === recordId) {
            setExpandedRecordId(null);
            return;
        }

        setExpandedRecordId(recordId);

        // Fetch prescription if not already loaded and if it exists
        const record = records.find(r => r.id === recordId);
        if (record?.hasPrescription && !prescriptions[recordId]) {
            try {
                setLoadingPrescription(recordId);
                const prescription = await prescriptionService.getByMedicalRecordId(recordId);
                setPrescriptions(prev => ({ ...prev, [recordId]: prescription }));
            } catch (error) {
                console.error("Error fetching prescription:", error);
            } finally {
                setLoadingPrescription(null);
            }
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center gap-4">
                    <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-slate-600 text-center uppercase tracking-widest">Đang tải hồ sơ...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-8">
            <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">

                {/* Header */}
                <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <User size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Hồ sơ bệnh nhân chi tiết</h2>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Mã BN: {patient?.id.split('-')[0]}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">

                    {/* Left: Patient Info Sidebar */}
                    <div className="w-full md:w-80 bg-white border-r border-slate-200 p-6 overflow-y-auto shrink-0">
                        <div className="flex flex-col items-center mb-8">
                            <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-md">
                                {patient?.avatarUrl ? (
                                    <img src={patient.avatarUrl} alt={patient.fullName} className="h-full w-full rounded-full object-cover" />
                                ) : (
                                    <User size={48} className="text-slate-300" />
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 text-center">{patient?.fullName}</h3>
                            <span className={`mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${patient?.gender === 'Male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                {patient?.gender === 'Male' ? 'Nam' : 'Nữ'}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <InfoItem icon={<Calendar size={14} />} label="Ngày sinh" value={formatDate(patient?.dateOfBirth)} />
                            <InfoItem icon={<Phone size={14} />} label="Số điện thoại" value={patient?.phoneNumber || 'N/A'} />
                            <InfoItem icon={<Mail size={14} />} label="Email" value={patient?.userEmail || 'N/A'} />
                            <InfoItem icon={<MapPin size={14} />} label="Địa chỉ" value={patient?.address || 'N/A'} />
                        </div>

                        <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100">
                            <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <AlertCircle size={14} /> Tiền sử bệnh lý
                            </h4>
                            <p className="text-xs font-medium text-amber-900 leading-relaxed italic">
                                {patient?.medicalHistory || 'Chưa cập nhật tiền sử bệnh lý.'}
                            </p>
                        </div>
                    </div>

                    {/* Right: Medical History Timeline */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                <History size={18} className="text-indigo-600" /> Lịch sử khám bệnh ({records.length})
                            </h3>
                        </div>

                        {records.length === 0 ? (
                            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
                                <FileText size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-400 font-bold">Chưa có dữ liệu lịch sử khám bệnh.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {records.map((record) => (
                                    <div key={record.id} className={`bg-white border rounded-xl overflow-hidden transition-all ${expandedRecordId === record.id ? 'border-indigo-300 shadow-md ring-1 ring-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                        {/* Record Header (Clickable) */}
                                        <div
                                            onClick={() => toggleRecord(record.id)}
                                            className="p-4 cursor-pointer flex items-center justify-between hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-500 shrink-0">
                                                    <span className="text-[10px] font-black">{new Date(record.createdAt).toLocaleDateString('vi-VN', { month: 'short' })}</span>
                                                    <span className="text-sm font-bold leading-none">{new Date(record.createdAt).getDate()}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-sm">{record.diagnosis}</h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[10px] text-slate-400 font-medium">Bác sĩ: <span className="text-slate-600 font-bold">{record.doctorName}</span></span>
                                                        <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                                                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                                            <Clock size={10} /> {new Date(record.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {record.hasPrescription && (
                                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                                                        Kèm đơn thuốc
                                                    </span>
                                                )}
                                                {expandedRecordId === record.id ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                                            </div>
                                        </div>

                                        {/* Expanded Context */}
                                        {expandedRecordId === record.id && (
                                            <div className="px-4 pb-4 bg-white animate-in slide-in-from-top-2 duration-200">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-100">

                                                    {/* Clinical Findings */}
                                                    <div className="space-y-4">
                                                        <div>
                                                            <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                                <Clipboard size={12} className="text-indigo-500" /> Triệu chứng & Ghi chú
                                                            </h5>
                                                            <div className="bg-slate-50 p-3 rounded-lg text-xs font-medium text-slate-600 leading-relaxed min-h-[60px]">
                                                                {record.symptoms || 'Không có ghi nhận triệu chứng.'}
                                                                {record.notes && (
                                                                    <p className="mt-2 pt-2 border-t border-slate-200 text-slate-500 italic">
                                                                        <span className="font-bold">Ghi chú:</span> {record.notes}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                                <Activity size={12} className="text-rose-500" /> Chỉ số sinh tồn
                                                            </h5>
                                                            <div className="grid grid-cols-3 gap-2">
                                                                <VitalSmall label="Huyết áp" value={record.bloodPressure?.toString()} unit="mmHg" />
                                                                <VitalSmall label="Nhịp tim" value={record.heartRate?.toString()} unit="bpm" />
                                                                <VitalSmall label="Nhiệt độ" value={record.temperature?.toString()} unit="°C" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Prescription Details */}
                                                    <div>
                                                        <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                            <Pill size={12} className="text-emerald-500" /> Đơn thuốc
                                                        </h5>

                                                        {!record.hasPrescription ? (
                                                            <div className="bg-slate-50 p-4 rounded-lg text-center font-bold text-slate-400 text-[10px] uppercase">
                                                                Không kê đơn thuốc
                                                            </div>
                                                        ) : loadingPrescription === record.id ? (
                                                            <div className="py-8 text-center animate-pulse text-indigo-400 text-[10px] font-bold">ĐANG TẢI ĐƠN THUỐC...</div>
                                                        ) : prescriptions[record.id] ? (
                                                            <div className="space-y-2">
                                                                {prescriptions[record.id].details.map((med, idx) => (
                                                                    <div key={idx} className="bg-emerald-50/30 border border-emerald-100 p-2.5 rounded-lg flex justify-between items-start gap-3">
                                                                        <div className="flex-1">
                                                                            <h6 className="text-[11px] font-bold text-slate-800">{med.medicineName}</h6>
                                                                            <p className="text-[10px] text-slate-500 mt-0.5">{med.frequency} · {med.durationDays} ngày</p>
                                                                            {med.instructions && <p className="text-[10px] text-indigo-600 italic mt-1">{med.instructions}</p>}
                                                                        </div>
                                                                        <div className="text-[10px] font-bold text-emerald-600 bg-white px-2 py-0.5 rounded border border-emerald-100">
                                                                            SL: {med.quantity}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {prescriptions[record.id].notes && (
                                                                    <p className="text-[10px] text-slate-400 mt-2 px-1 italic">
                                                                        * {prescriptions[record.id].notes}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-components
const InfoItem = ({ icon, label, value }: any) => (
    <div className="flex items-start gap-3 group">
        <div className="mt-0.5 p-1.5 bg-slate-50 text-slate-400 rounded group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
            {icon}
        </div>
        <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{label}</p>
            <p className="text-[11px] font-bold text-slate-700">{value}</p>
        </div>
    </div>
);

const VitalSmall = ({ label, value, unit }: any) => (
    <div className="bg-white border border-slate-200 p-2 rounded-lg text-center">
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">{label}</p>
        <div className="flex items-baseline justify-center gap-0.5">
            <span className="text-xs font-black text-slate-800">{value || '--'}</span>
            <span className="text-[8px] font-bold text-slate-400">{unit}</span>
        </div>
    </div>
);

export default PatientDetailsModal;
