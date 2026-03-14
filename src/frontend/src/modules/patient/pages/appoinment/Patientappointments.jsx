import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CalendarDays, Clock, MapPin, UserRound, Stethoscope,
  Search, Filter, ChevronRight, X, CheckCircle2, AlertCircle,
  XCircle, RefreshCw, Plus, Loader2, LogIn, Bell,
  CalendarX, FileText,
} from 'lucide-react';
import logo from '../../../../assets/logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../../contexts/AuthContext';
import axiosClient from '../../../../services/axiosClient';
import styles from './PatientAppointments.module.css';

const NAV_ITEMS = [
  { name: 'Trang chủ', path: '/' },
  { name: 'Đặt lịch', path: '/patient/booking/specialty' },
  { name: 'Tin tức', path: '/news' },
  { name: 'Liên hệ', path: '/contact' },
];

// ===== API (giả định — chờ backend) =====
const appointmentApi = {
  // GET /api/patient/appointments?status=&page=&size=
  getAll: (params) => axiosClient.get('/api/patient/appointments', { params }),
  // GET /api/patient/appointments/:id
  getById: (id) => axiosClient.get(`/api/patient/appointments/${id}`),
  // PUT /api/patient/appointments/:id/cancel
  cancel: (id, reason) => axiosClient.put(`/api/patient/appointments/${id}/cancel`, { reason }),
};

// ===== CONSTANTS =====
const STATUS_CONFIG = {
  PENDING:   { label: 'Chờ xác nhận', color: 'pending',   icon: Clock },
  CONFIRMED: { label: 'Đã xác nhận',  color: 'confirmed', icon: CheckCircle2 },
  COMPLETED: { label: 'Đã khám',      color: 'completed', icon: CheckCircle2 },
  CANCELLED: { label: 'Đã huỷ',       color: 'cancelled', icon: XCircle },
};

const TABS = [
  { key: 'all',       label: 'Tất cả' },
  { key: 'UPCOMING',  label: 'Sắp tới' },
  { key: 'COMPLETED', label: 'Đã khám' },
  { key: 'CANCELLED', label: 'Đã huỷ' },
];

// ===== APPOINTMENT CARD =====
const AppointmentCard = ({ appt, onCancel, onDetail }) => {
  const status = STATUS_CONFIG[appt.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = status.icon;
  const canCancel = appt.status === 'PENDING' || appt.status === 'CONFIRMED';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={styles.apptCard}
    >
      {/* Header row */}
      <div className={styles.apptHeader}>
        <div className={styles.apptCode}>
          <FileText size={14} />
          {appt.bookingCode || appt.appointmentId?.slice(0, 8).toUpperCase()}
        </div>
        <span className={`${styles.statusBadge} ${styles[`status_${status.color}`]}`}>
          <StatusIcon size={12} />
          {status.label}
        </span>
      </div>

      {/* Body */}
      <div className={styles.apptBody}>
        {/* Doctor */}
        <div className={styles.apptRow}>
          <div className={styles.apptDoctorAvatar}>
            {(appt.doctorName || 'B').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className={styles.apptDoctorName}>{appt.doctorName || '—'}</div>
            <div className={styles.apptSpecialty}>{appt.specialtyName || '—'}</div>
          </div>
        </div>

        {/* Info grid */}
        <div className={styles.apptInfo}>
          <div className={styles.apptInfoItem}>
            <CalendarDays size={14} />
            <span>{appt.appointmentDate
              ? new Date(appt.appointmentDate).toLocaleDateString('vi-VN', {
                  weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'
                })
              : '—'
            }</span>
          </div>
          <div className={styles.apptInfoItem}>
            <Clock size={14} />
            <span>{appt.slotTime || '—'}</span>
          </div>
          <div className={styles.apptInfoItem}>
            <MapPin size={14} />
            <span>{appt.location || 'CareFirst Clinic'}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.apptActions}>
        <button className={styles.detailBtn} onClick={() => onDetail(appt)}>
          Xem chi tiết <ChevronRight size={14} />
        </button>
        {canCancel && (
          <button className={styles.cancelBtn} onClick={() => onCancel(appt)}>
            <X size={14} /> Huỷ lịch
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ===== CANCEL MODAL =====
const CancelModal = ({ appt, onConfirm, onClose, loading }) => {
  const [reason, setReason] = useState('');
  return (
    <motion.div
      className={styles.modalOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modal}
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Huỷ lịch hẹn</h3>
          <button className={styles.modalClose} onClick={onClose}><X size={18} /></button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.modalWarning}>
            <AlertCircle size={20} />
            <div>
              <p><strong>Bạn có chắc muốn huỷ lịch hẹn này?</strong></p>
              <p>Mã: {appt.bookingCode} — {appt.doctorName}</p>
            </div>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Lý do huỷ (tuỳ chọn)</label>
            <textarea
              className={styles.fieldTextarea}
              placeholder="Bận đột xuất, cần đổi lịch khác..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.modalCancelBtn} onClick={onClose}>Không, giữ lịch</button>
          <button
            className={styles.modalConfirmBtn}
            onClick={() => onConfirm(appt.appointmentId, reason)}
            disabled={loading}
          >
            {loading ? <Loader2 size={15} className={styles.spinner} /> : <XCircle size={15} />}
            Xác nhận huỷ
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ===== DETAIL MODAL =====
const DetailModal = ({ appt, onClose }) => (
  <motion.div
    className={styles.modalOverlay}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div
      className={styles.modal}
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.92, opacity: 0 }}
      onClick={e => e.stopPropagation()}
    >
      <div className={styles.modalHeader}>
        <h3 className={styles.modalTitle}>Chi tiết lịch hẹn</h3>
        <button className={styles.modalClose} onClick={onClose}><X size={18} /></button>
      </div>
      <div className={styles.modalBody}>
        {[
          { label: 'Mã lịch hẹn',   value: appt.bookingCode || appt.appointmentId },
          { label: 'Bác sĩ',        value: appt.doctorName },
          { label: 'Chuyên khoa',   value: appt.specialtyName },
          { label: 'Ngày khám',     value: appt.appointmentDate ? new Date(appt.appointmentDate).toLocaleDateString('vi-VN') : '—' },
          { label: 'Giờ khám',      value: appt.slotTime },
          { label: 'Địa điểm',      value: appt.location || 'CareFirst Clinic – 123 Nguyễn Huệ, Q.1' },
          { label: 'Bệnh nhân',     value: appt.patientName },
          { label: 'Lý do khám',    value: appt.reason },
          { label: 'Ghi chú',       value: appt.notes || '—' },
        ].map(row => (
          <div key={row.label} className={styles.detailRow}>
            <span className={styles.detailLabel}>{row.label}</span>
            <span className={styles.detailValue}>{row.value || '—'}</span>
          </div>
        ))}
      </div>
      <div className={styles.modalFooter}>
        <button className={styles.modalCancelBtn} onClick={onClose}>Đóng</button>
      </div>
    </motion.div>
  </motion.div>
);

// ===== MAIN =====
const PatientAppointments = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [activeTab, setActiveTab]       = useState('all');
  const [search, setSearch]             = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [detailTarget, setDetailTarget] = useState(null);

  // ── Fetch ────────────────────────────────────────
  const fetchAppointments = () => {
    setLoading(true);
    setError('');
    const params = activeTab !== 'all' ? { status: activeTab } : {};
    appointmentApi.getAll(params)
      .then(res => {
        const list = res.data?.data ?? res.data ?? [];
        setAppointments(Array.isArray(list) ? list : []);
      })
      .catch(() => setError('Không thể tải danh sách lịch hẹn. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppointments(); }, [activeTab]);

  // ── Cancel ───────────────────────────────────────
  const handleCancelConfirm = async (id, reason) => {
    setCancelLoading(true);
    try {
      await appointmentApi.cancel(id, reason);
      setAppointments(prev =>
        prev.map(a => a.appointmentId === id ? { ...a, status: 'CANCELLED' } : a)
      );
      setCancelTarget(null);
    } catch (e) {
      alert(e.response?.data?.message || 'Không thể huỷ lịch. Vui lòng thử lại.');
    } finally {
      setCancelLoading(false);
    }
  };

  // ── Filter local search ──────────────────────────
  const filtered = appointments.filter(a =>
    !search ||
    a.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
    a.specialtyName?.toLowerCase().includes(search.toLowerCase()) ||
    a.bookingCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logoSection}>
            <img src={logo} alt="CareFirst" className={styles.logoImg} />
            <h2 className={styles.logoText}>CareFirst Clinic</h2>
          </Link>
          <nav className={styles.nav}>
            {NAV_ITEMS.map(item => (
              <Link key={item.name} to={item.path} className={styles.navLink}>{item.name}</Link>
            ))}
          </nav>
          <div className={styles.headerRight}>
            <div className={styles.headerAvatar}>
              {(user?.fullName || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>

        {/* Page header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Lịch hẹn của tôi</h1>
            <p className={styles.pageSubtitle}>
              Xin chào <strong>{user?.fullName}</strong>, đây là danh sách lịch khám của bạn
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className={styles.bookNewBtn}
            onClick={() => navigate('/patient/booking/specialty')}
          >
            <Plus size={16} /> Đặt lịch mới
          </motion.button>
        </div>

        {/* Tabs + Search */}
        <div className={styles.toolbar}>
          <div className={styles.tabs}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                {tab.key === 'all' && appointments.length > 0 && (
                  <span className={styles.tabCount}>{appointments.length}</span>
                )}
              </button>
            ))}
          </div>

          <div className={styles.searchBox}>
            <Search size={15} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm theo bác sĩ, mã lịch..."
              className={styles.searchInput}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.searchClear} onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>

          <button className={styles.refreshBtn} onClick={fetchAppointments} title="Làm mới">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className={styles.loadingState}>
            <Loader2 size={32} className={styles.spinner} />
            <p>Đang tải lịch hẹn...</p>
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <AlertCircle size={32} />
            <p>{error}</p>
            <button className={styles.retryBtn} onClick={fetchAppointments}>Thử lại</button>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.emptyState}
          >
            <CalendarX size={56} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>
              {search ? 'Không tìm thấy kết quả' : 'Chưa có lịch hẹn nào'}
            </h3>
            <p className={styles.emptyDesc}>
              {search
                ? 'Thử tìm với từ khoá khác'
                : 'Bắt đầu đặt lịch khám để chăm sóc sức khoẻ của bạn'
              }
            </p>
            {!search && (
              <button
                className={styles.bookNewBtn}
                onClick={() => navigate('/patient/booking/specialty')}
              >
                <Plus size={16} /> Đặt lịch ngay
              </button>
            )}
          </motion.div>
        ) : (
          <div className={styles.apptList}>
            <AnimatePresence>
              {filtered.map(appt => (
                <AppointmentCard
                  key={appt.appointmentId}
                  appt={appt}
                  onCancel={setCancelTarget}
                  onDetail={setDetailTarget}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {cancelTarget && (
          <CancelModal
            appt={cancelTarget}
            onConfirm={handleCancelConfirm}
            onClose={() => setCancelTarget(null)}
            loading={cancelLoading}
          />
        )}
        {detailTarget && (
          <DetailModal
            appt={detailTarget}
            onClose={() => setDetailTarget(null)}
          />
        )}
      </AnimatePresence>

      <footer className={styles.footer}>
        <p>© 2024 CareFirst Clinic. Bảo lưu mọi quyền.</p>
      </footer>
    </div>
  );
};

export default PatientAppointments;