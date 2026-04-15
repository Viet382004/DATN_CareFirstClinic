import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Search,
  Plus,
  FileText,
  Pill,
  Receipt,
  Info,
  ChevronRight,
  Printer,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Appointment } from '../../../types/appointment';
import { appointmentService } from '../../../services/appointmentService';
import type { MedicalRecord } from '../../../types/medicalRecord';
import { medicalRecordService } from '../../../services/medicalRecordService';
import type { Prescription } from '../../../types/prescription';
import { prescriptionService } from '../../../services/prescriptionService';
import type { Payment } from '../../../types/payment';
import { paymentService } from '../../../services/paymentService';
import { formatDate as formatGlobalDate } from '../../../utils/format';
import Header from '../../home/components/Header';
import styles from './MyAppointments.module.css';

const TABS = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'CONFIRMED', label: 'Sắp tới' },
  { id: 'COMPLETED', label: 'Đã hoàn thành' },
  { id: 'CANCELLED', label: 'Đã hủy' },
];

const MyAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState<string>('');

  // Modal states
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Detail Modal states
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);

  const fetchAppointments = async (search?: string, status?: string) => {
    setLoading(true);
    try {
      const params: any = {
        pageSize: 50,
        sortBy: 'workDate',
        sortDir: 'desc',
        search: search
      };

      if (status && status !== 'ALL') {
        params.status = status;
      }

      if (filterDate) {
        params.fromDate = `${filterDate}T00:00:00Z`;
        params.toDate = `${filterDate}T23:59:59Z`;
      }

      const response = await appointmentService.getMyAppointments(params);
      setAppointments(response.items || []);
    } catch (err: any) {
      console.error('Failed to fetch appointments:', err);
      setError('Không thể tải danh sách lịch hẹn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(searchTerm, activeTab);
  }, [activeTab, filterDate]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAppointments(searchTerm, activeTab);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCancelClick = (id: string) => {
    setCancellingId(id);
    setIsCancelModalOpen(true);
    setCancelReason('');
  };

  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Vui lòng nhập lý do hủy lịch.');
      return;
    }
    if (!cancellingId) return;

    setCancelLoading(true);
    try {
      await appointmentService.cancel(cancellingId, { cancelReason: cancelReason.trim() });
      setIsCancelModalOpen(false);
      setCancellingId(null);
      fetchAppointments(searchTerm, activeTab);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể hủy lịch hẹn. Vui lòng liên hệ hỗ trợ.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleViewDetail = async (appt: Appointment) => {
    setSelectedAppt(appt);
    setDetailModalOpen(true);
    setDetailLoading(true);
    setMedicalRecord(null);
    setPrescription(null);
    setPayment(null);

    try {
      // Fetch medical record
      const record = await medicalRecordService.getByAppointmentId(appt.id);
      setMedicalRecord(record);

      if (record) {
        // Fetch prescription if exists
        try {
          const presc = await prescriptionService.getByMedicalRecordId(record.id);
          setPrescription(presc);
        } catch (e) {
          console.log('No prescription found or failed to fetch');
        }
      }

      // Fetch payment
      try {
        const pay = await paymentService.getByAppointmentId(appt.id);
        setPayment(pay);
      } catch (e) {
        console.log('No payment found or failed to fetch');
      }
    } catch (err) {
      console.error('Failed to fetch details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return styles.statusPending;
      case 'CONFIRMED': return styles.statusConfirmed;
      case 'WAITING': return styles.statusWaiting;
      case 'EXAMINING': return styles.statusExamining;
      case 'COMPLETED': return styles.statusCompleted;
      case 'CANCELLED': return styles.statusCancelled;
      default: return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'Chờ xác nhận';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'WAITING': return 'Đang chờ khám';
      case 'EXAMINING': return 'Đang khám';
      case 'COMPLETED': return 'Đã hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  const formatDateInfo = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      day: d.getDate().toString().padStart(2, '0'),
      month: `Tháng ${(d.getMonth() + 1).toString().padStart(2, '0')}`,
      year: d.getFullYear(),
      weekday: d.toLocaleDateString('vi-VN', { weekday: 'short' }),
      full: formatGlobalDate(dateStr)
    };
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Lịch hẹn của tôi</h1>
              <p className={styles.subtitle}>Quản lý và theo dõi lịch khám bệnh của bạn</p>
            </div>

            <div className={styles.headerActions}>
              <div className={styles.filterGroup}>
                <div className={styles.searchWrapper}>
                  <Search className={styles.searchIcon} size={18} />
                  <input
                    type="text"
                    placeholder="Tìm bác sĩ, chuyên khoa..."
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className={styles.dateFilterWrapper}>
                  <Calendar className={styles.dateIcon} size={18} />
                  <input
                    type="date"
                    className={styles.dateInput}
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                  />
                  {filterDate && (
                    <button className={styles.clearDate} onClick={() => setFilterDate('')}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <Link to="/patient/booking" className={styles.bookBtn}>
                <Plus size={18} />
                Đặt lịch mới
              </Link>
            </div>
          </div>

          <div className={styles.tabs}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className={styles.loading}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <span>Đang tải lịch hẹn...</span>
            </div>
          ) : error ? (
            <div className={styles.empty}>
              <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto' }} />
              <h3 className={styles.emptyTitle}>Rất tiếc!</h3>
              <p className={styles.emptyDesc}>{error}</p>
              <button onClick={() => fetchAppointments(searchTerm, activeTab)} className={styles.bookBtn}>Thử lại</button>
            </div>
          ) : appointments.length === 0 ? (
            <div className={styles.empty}>
              <Calendar size={48} color="#94a3b8" style={{ margin: '0 auto' }} />
              <h3 className={styles.emptyTitle}>Chưa có lịch hẹn nào</h3>
              <p className={styles.emptyDesc}>
                {activeTab === 'ALL'
                  ? 'Bạn chưa thực hiện đặt lịch khám nào trên hệ thống.'
                  : `Không có lịch hẹn nào ở trạng thái ${TABS.find(t => t.id === activeTab)?.label.toLowerCase()}.`}
              </p>
              <Link to="/patient/booking" className={styles.bookBtn}>Đặt lịch khám ngay</Link>
            </div>
          ) : (
            <div className={styles.list}>
              <AnimatePresence mode="popLayout">
                {appointments.map((appt, i) => {
                  const dateInfo = formatDateInfo(appt.workDate);
                  return (
                    <motion.div
                      key={appt.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={styles.card}
                    >
                      <div className={styles.dateCol}>
                        <span className={styles.weekday}>{dateInfo.weekday}</span>
                        <span className={styles.day}>{dateInfo.day}</span>
                        <span className={styles.month}>{dateInfo.month}</span>
                      </div>

                      <div className={styles.infoCol}>
                        <div className={styles.doctorHeader}>
                          <h3 className={styles.doctorName}>BS. {appt.doctorName}</h3>
                          <span className={`${styles.statusBadge} ${getStatusClass(appt.status)}`}>
                            {getStatusLabel(appt.status)}
                          </span>
                        </div>
                        <div className={styles.specialty}>
                          <Stethoscope size={14} />
                          {appt.specialtyName}
                        </div>
                        <div className={styles.meta}>
                          <div className={styles.metaItem}>
                            <Clock size={14} />
                            {appt.startTime.substring(0, 5)} - {appt.endTime.substring(0, 5)}
                          </div>
                          <div className={styles.metaItem}>
                            <Calendar size={14} />
                            {dateInfo.full}
                          </div>
                        </div>
                        {appt.reason && (
                          <div className={styles.reasonBox}>
                            <span className={styles.reasonLabel}>Lý do khám:</span> {appt.reason}
                          </div>
                        )}
                        {appt.status.toUpperCase() === 'CANCELLED' && appt.cancelReason && (
                          <div className={`${styles.cancelReasonBox} ${appt.cancelReason === 'Không được xác thực' ? styles.autoCancel : ''}`}>
                            <AlertCircle size={14} />
                            <span>
                              <span className={styles.reasonLabel}>Lý do hủy:</span>
                              {appt.cancelReason}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className={styles.actionCol}>
                        {appt.status.toUpperCase() === 'COMPLETED' ? (
                          <button
                            onClick={() => handleViewDetail(appt)}
                            className={styles.detailBtn}
                          >
                            <FileText size={16} />
                            Xem kết quả
                          </button>
                        ) : (appt.status.toUpperCase() === 'PENDING' || appt.status.toUpperCase() === 'CONFIRMED') ? (
                          <button
                            onClick={() => handleCancelClick(appt.id)}
                            className={styles.cancelBtn}
                          >
                            <XCircle size={14} />
                            Hủy lịch
                          </button>
                        ) : null}
                        <Link to={`/patient/booking?doctorId=${appt.doctorId}`} className={styles.rebookBtn}>
                          Đặt lại
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailModalOpen && selectedAppt && (
          <div className={styles.modalOverlay} onClick={() => setDetailModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={styles.detailModal}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div>
                  <h2 className={styles.modalTitle}>Chi tiết kết quả khám</h2>
                  <p className={styles.modalSubtitle}>Mã lịch hẹn: #{selectedAppt.id.substring(0, 8).toUpperCase()}</p>
                </div>
                <button className={styles.closeBtn} onClick={() => setDetailModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              {detailLoading ? (
                <div className={styles.modalLoading}>
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
                  <p>Đang tải thông tin chi tiết...</p>
                </div>
              ) : (
                <div className={styles.modalScroll}>
                  {/* Doctor & Time Info */}
                  <div className={styles.infoGrid}>
                    <div className={styles.infoCard}>
                      <div className={styles.infoIcon}><Stethoscope size={20} /></div>
                      <div>
                        <h3>Bác sĩ phụ trách</h3>
                        <p>BS. {selectedAppt.doctorName}</p>
                        <span>{selectedAppt.specialtyName}</span>
                      </div>
                    </div>
                    <div className={styles.infoCard}>
                      <div className={styles.infoIcon}><Calendar size={20} /></div>
                      <div>
                        <h3>Thời gian khám</h3>
                        <p>{formatGlobalDate(selectedAppt.workDate)}</p>
                        <span>{selectedAppt.startTime.substring(0, 5)} - {selectedAppt.endTime.substring(0, 5)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Medical Record */}
                  {medicalRecord ? (
                    <div className={styles.detailSection}>
                      <div className={styles.sectionTitle}>
                        <FileText size={18} />
                        Kết quả chẩn đoán
                      </div>
                      <div className={styles.recordContent}>
                        <div className={styles.diagnosisBox}>
                          <label>Chẩn đoán:</label>
                          <p>{medicalRecord.diagnosis}</p>
                        </div>
                        {medicalRecord.symptoms && (
                          <div className={styles.detailItem}>
                            <label>Triệu chứng:</label>
                            <p>{medicalRecord.symptoms}</p>
                          </div>
                        )}
                        <div className={styles.vitalsGrid}>
                          <div className={styles.vital}>
                            <label>Huyết áp</label>
                            <p>{medicalRecord.bloodPressure || '--'} mmHg</p>
                          </div>
                          <div className={styles.vital}>
                            <label>Nhịp tim</label>
                            <p>{medicalRecord.heartRate || '--'} bpm</p>
                          </div>
                          <div className={styles.vital}>
                            <label>Nhiệt độ</label>
                            <p>{medicalRecord.temperature || '--'} °C</p>
                          </div>
                          <div className={styles.vital}>
                            <label>Cân nặng</label>
                            <p>{medicalRecord.weight || '--'} kg</p>
                          </div>
                        </div>
                        {medicalRecord.notes && (
                          <div className={styles.notesBox}>
                            <label>Lời dặn của bác sĩ:</label>
                            <p>{medicalRecord.notes}</p>
                          </div>
                        )}
                        {medicalRecord.followUpDate && (
                          <div className={styles.followUp}>
                            <Calendar size={14} />
                            Hẹn tái khám: {formatGlobalDate(medicalRecord.followUpDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className={styles.noData}>Chưa có thông tin hồ sơ bệnh án.</div>
                  )}

                  {/* Prescription */}
                  {prescription && (
                    <div className={styles.detailSection}>
                      <div className={styles.sectionTitle}>
                        <Pill size={18} />
                        Đơn thuốc kèm theo
                      </div>
                      <div className={styles.prescriptionList}>
                        <table className={styles.medicineTable}>
                          <thead>
                            <tr>
                              <th>Tên thuốc</th>
                              <th>Số lượng</th>
                              <th>Cách dùng</th>
                            </tr>
                          </thead>
                          <tbody>
                            {prescription.details.map((m, idx) => (
                              <tr key={idx}>
                                <td>
                                  <strong>{m.medicineName}</strong>
                                  {m.medicineCode && <span>({m.medicineCode})</span>}
                                </td>
                                <td>{m.quantity} {m.unit}</td>
                                <td>{m.instructions || m.frequency}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {prescription.notes && (
                          <div className={styles.prescNotes}>
                            <strong>Lưu ý:</strong> {prescription.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment / Invoice */}
                  {payment && (
                    <div className={styles.detailSection}>
                      <div className={styles.sectionTitle}>
                        <Receipt size={18} />
                        Thông tin hóa đơn
                      </div>
                      <div className={styles.invoiceCard}>
                        <div className={styles.invoiceRow}>
                          <span>Phí khám bệnh</span>
                          <span>{payment.amount.toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div className={styles.invoiceRow}>
                          <span>Giảm giá</span>
                          <span>0 đ</span>
                        </div>
                        <div className={styles.invoiceTotal}>
                          <span>Tổng cộng</span>
                          <span>{payment.amount.toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div className={styles.invoiceMeta}>
                          <div>Phương thức: <strong>{payment.method.toString() === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}</strong></div>
                          <div className={payment.status.toString() === 'COMPLETED' ? styles.paid : styles.unpaid}>
                            Trạng thái: <strong>{payment.status.toString() === 'COMPLETED' ? 'Đã thanh toán' : 'Chờ thanh toán'}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className={styles.modalFooter}>
                <button className={styles.printBtn} onClick={() => window.print()}>
                  <Printer size={16} />
                  In kết quả
                </button>
                <button className={styles.closeModalBtn} onClick={() => setDetailModalOpen(false)}>
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancellation Modal */}
      <AnimatePresence>
        {isCancelModalOpen && (
          <div className={styles.modalOverlay}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={styles.modalContent}
            >
              <h2 className={styles.modalTitle}>Hủy lịch hẹn</h2>
              <p className={styles.modalSubtitle}>Vui lòng cho biết lý do bạn muốn hủy lịch hẹn này.</p>

              <div className={styles.modalField}>
                <label>Lý do hủy lịch <span style={{ color: '#ef4444' }}>*</span></label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ví dụ: Tôi có việc đột xuất, Tôi bận việc riêng..."
                  autoFocus
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  className={styles.modalCancelBtn}
                  onClick={() => setIsCancelModalOpen(false)}
                  disabled={cancelLoading}
                >
                  Đóng
                </button>
                <button
                  className={styles.modalConfirmBtn}
                  onClick={handleConfirmCancel}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? 'Đang xử lý...' : 'Xác nhận hủy'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MyAppointments;
