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
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { appointmentService, type Appointment } from '../../../services/appointmentService';
import Header from '../../home/components/Header';
import styles from './MyAppointments.module.css';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchAppointments = async (search?: string) => {
    setLoading(true);
    try {
      const response = await appointmentService.getMyAppointments({ 
        pageSize: 50, 
        sortBy: 'workDate', 
        sortDir: 'desc',
        search: search
      });
      setAppointments(response.items || []);
    } catch (err: any) {
      console.error('Failed to fetch appointments:', err);
      setError('Không thể tải danh sách lịch hẹn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchAppointments(searchTerm);
      } else {
        // Only fetch all if we were searching before or it's the first load
        fetchAppointments();
      }
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
      // Refresh list
      fetchAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể hủy lịch hẹn. Vui lòng liên hệ hỗ trợ.');
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return styles.statusPending;
      case 'CONFIRMED': return styles.statusConfirmed;
      case 'COMPLETED': return styles.statusCompleted;
      case 'CANCELLED': return styles.statusCancelled;
      default: return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'Chờ xác nhận';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'COMPLETED': return 'Đã hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      day: d.getDate(),
      month: `Tháng ${d.getMonth() + 1}`,
      full: d.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
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
              <div className={styles.searchWrapper}>
                <Search className={styles.searchIcon} size={18} />
                <input
                  type="text"
                  placeholder="Tìm theo tên bác sĩ, chuyên khoa..."
                  className={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Link to="/patient/booking" className={styles.bookBtn}>
                <Plus size={18} />
                Đặt lịch mới
              </Link>
            </div>
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
              <button onClick={fetchAppointments} className={styles.bookBtn}>Thử lại</button>
            </div>
          ) : appointments.length === 0 ? (
            <div className={styles.empty}>
              <Calendar size={48} color="#94a3b8" style={{ margin: '0 auto' }} />
              <h3 className={styles.emptyTitle}>Chưa có lịch hẹn nào</h3>
              <p className={styles.emptyDesc}>Bạn chưa thực hiện đặt lịch khám nào trên hệ thống.</p>
              <Link to="/patient/booking" className={styles.bookBtn}>Đặt lịch khám ngay</Link>
            </div>
          ) : (
            <div className={styles.list}>
              <AnimatePresence>
                {appointments.map((appt, i) => {
                  const dateInfo = formatDate(appt.workDate);
                  return (
                    <motion.div
                      key={appt.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={styles.card}
                    >
                      <div className={styles.dateCol}>
                        <span className={styles.day}>{dateInfo.day}</span>
                        <span className={styles.month}>{dateInfo.month}</span>
                      </div>

                      <div className={styles.infoCol}>
                        <h3 className={styles.doctorName}>BS. {appt.doctorName}</h3>
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
                          <div className={styles.metaItem} style={{ marginTop: '0.25rem' }}>
                            <span style={{ fontWeight: 600 }}>Lý do khám:</span> {appt.reason}
                          </div>
                        )}
                        {appt.status.toUpperCase() === 'CANCELLED' && appt.cancelReason && (
                          <div className={styles.metaItem} style={{ marginTop: '0.25rem', color: '#ef4444' }}>
                            <span style={{ fontWeight: 600 }}>Lý do hủy:</span> {appt.cancelReason}
                          </div>
                        )}
                      </div>

                      <div className={styles.actionCol}>
                        <span className={`${styles.status} ${getStatusClass(appt.status)}`}>
                          {getStatusLabel(appt.status)}
                        </span>
                        
                        {(appt.status.toUpperCase() === 'PENDING' || appt.status.toUpperCase() === 'CONFIRMED') && (
                          <button 
                            onClick={() => handleCancelClick(appt.id)}
                            className={styles.cancelBtn}
                          >
                            <XCircle size={14} />
                            Hủy lịch
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

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
