import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Shield,
  Headphones,
  MessageSquare,
  CalendarDays,
  Clock,
  MapPin,
  User,
  Stethoscope,
  Download,
  Home,
  Copy,
  QrCode,
  Bell,
} from 'lucide-react';
import logo from "../../../../assets/logo.png";
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
import { useAuth } from '../../../../contexts/AuthContext';
import styles from './BookingSuccess.module.css';

const NAV_ITEMS = [
  { name: "Trang chủ", path: "/" },
  { name: "Lịch hẹn", path: "/patient/booking" },
  { name: "Tin tức", path: "/news" },
  { name: "Liên hệ", path: "/contact" }
];
// ===== MOCK DATA =====
const BOOKING = {
  code: 'CF-20250609-0042',
  specialty: 'Tim mạch',
  doctor: 'BSCKII. Nguyễn Văn A',
  doctorSub: 'Nội Tổng Quát - Tim Mạch',
  date: 'Thứ Hai, 09/06/2025',
  time: '09:00 – 09:30',
  location: 'Phòng khám 201, Tầng 2',
  locationSub: 'CareFirst Clinic – 123 Nguyễn Huệ, Q.1, TP.HCM',
  patient: 'Nguyễn Thị B',
  phone: '0912 345 678',
};

const REMINDERS = [
  'Mang theo CMND/CCCD và thẻ BHYT (nếu có).',
  'Đến trước giờ hẹn ít nhất 15 phút để hoàn tất thủ tục.',
  'Không ăn uống trong vòng 4 tiếng nếu có xét nghiệm máu.',
  'Mang theo kết quả xét nghiệm hoặc hồ sơ bệnh án cũ (nếu có).',
];

// ===== MAIN COMPONENT =====
const BookingSuccess = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(BOOKING.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
                    <Link to="/" className={styles.logoSection}>
            <img src={logo} alt="CareFirst Clinic" className={styles.logoImg} />
            <h2 className={styles.logoText}>CareFirst Clinic</h2>
          </Link>
        
          <nav className={styles.nav}>
            {NAV_ITEMS.map((item) => (
              <Link key={item.name} to={item.path} className={styles.navLink}>
                {item.name}
              </Link>
            ))}
          </nav>

          <div className={styles.userSection}>
            {/* Avatar */}
            <div className={styles.userAvatar}>
              {user
                ? <span className={styles.avatarInitial}>{(user.fullName || 'U').charAt(0).toUpperCase()}</span>
                : <span className={styles.avatarInitial}>?</span>
              }
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Stepper */}
        <div className={styles.stepperContainer}>
          <div className={styles.stepperHeader}>
            <div>
              <span className={styles.stepperBadge}>✅ Đặt lịch thành công</span>
              <h3 className={styles.stepperTitle}>Bước 5: Xác Nhận</h3>
            </div>
            <span className={styles.stepperCount}>5 / 5 Hoàn tất 🎉</span>
          </div>

          <div className={styles.progressBar}>
            <motion.div
              initial={{ width: '80%' }}
              animate={{ width: '100%' }}
              className={styles.progressFill}
            />
          </div>

          <div className={styles.stepLabels}>
            {['CHUYÊN KHOA', 'BÁC SĨ', 'THỜI GIAN', 'THÔNG TIN', 'XÁC NHẬN'].map((step) => (
              <div key={step} className={`${styles.stepLabel} ${styles.stepLabelDone}`}>
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* Success Hero */}
        <div className={styles.successHero}>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className={styles.successIconRing}
          >
            <div className={styles.successIconInner}>
              <CheckCircle2 size={40} strokeWidth={2.5} />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={styles.successTitle}
          >
            Đặt lịch <span className={styles.successHighlight}>thành công</span>!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={styles.successDescription}
          >
            Lịch hẹn của bạn đã được xác nhận. Chúng tôi sẽ gửi nhắc nhở qua SMS và email trước buổi khám.
          </motion.p>

          {/* Booking Code */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className={styles.bookingCodeWrapper}
          >
            <div>
              <div className={styles.bookingCodeLabel}>Mã đặt lịch</div>
              <div className={styles.bookingCode}>{BOOKING.code}</div>
            </div>
            <button className={styles.copyBtn} onClick={handleCopy}>
              <Copy size={14} />
              {copied ? 'Đã sao chép!' : 'Sao chép'}
            </button>
          </motion.div>
        </div>

        {/* Detail + QR Grid */}
        <div className={styles.contentGrid}>
          {/* Left column: booking details + reminder */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Booking Details */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className={styles.detailCard}
            >
              <h3 className={styles.cardTitle}>
                <span className={styles.cardTitleIcon}><CalendarDays size={18} /></span>
                Chi tiết lịch hẹn
              </h3>

              {[
                { icon: <Stethoscope size={16} />, label: 'Chuyên khoa', value: BOOKING.specialty },
                { icon: <User size={16} />, label: 'Bác sĩ', value: BOOKING.doctor, sub: BOOKING.doctorSub },
                { icon: <CalendarDays size={16} />, label: 'Ngày khám', value: BOOKING.date },
                { icon: <Clock size={16} />, label: 'Giờ khám', value: BOOKING.time },
                { icon: <MapPin size={16} />, label: 'Địa điểm', value: BOOKING.location, sub: BOOKING.locationSub },
                { icon: <User size={16} />, label: 'Bệnh nhân', value: BOOKING.patient, sub: BOOKING.phone },
              ].map((row) => (
                <div key={row.label} className={styles.detailRow}>
                  <div className={styles.detailRowIcon}>{row.icon}</div>
                  <div>
                    <div className={styles.detailRowLabel}>{row.label}</div>
                    <div className={styles.detailRowValue}>{row.value}</div>
                    {row.sub && <div className={styles.detailRowSub}>{row.sub}</div>}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Reminder */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className={styles.reminderCard}
            >
              <div className={styles.reminderTitle}>
                <Bell size={18} />
                Lưu ý trước khi đến khám
              </div>
              <div className={styles.reminderList}>
                {REMINDERS.map((r, i) => (
                  <div key={i} className={styles.reminderItem}>
                    <div className={styles.reminderDot} />
                    {r}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right column: QR */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className={styles.qrCard}
          >
            <h3 className={styles.cardTitle} style={{ borderBottom: 'none', marginBottom: 0 }}>
              <span className={styles.cardTitleIcon}><QrCode size={18} /></span>
              Mã QR Check-in
            </h3>
            <div className={styles.qrPlaceholder}>
              <QrCode size={48} />
              <div className={styles.qrPlaceholderText}>QR sẽ hiển thị<br />sau khi xác nhận</div>
            </div>
            <p className={styles.qrDesc}>
              Xuất trình mã QR tại quầy lễ tân để check-in nhanh chóng, không cần xếp hàng.
            </p>
            <button
              className={styles.outlineButton}
              style={{ width: '100%' }}
              onClick={() => {}}
            >
              <Download size={16} />
              Tải QR về máy
            </button>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={styles.outlineButton}
            onClick={() => {}}
          >
            <Download size={18} />
            Tải phiếu hẹn
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={styles.outlineButton}
            onClick={() => {}}
          >
            <CalendarDays size={18} />
            Thêm vào lịch
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className={styles.primaryButton}
          >
            <Home size={18} />
            Về trang chủ
          </motion.button>
        </div>

        {/* Help */}
        <div className={styles.helpSection}>
          <div className={styles.helpIcon}><Headphones size={24} /></div>
          <div className={styles.helpContent}>
            <h4 className={styles.helpTitle}>Cần hỗ trợ hoặc thay đổi lịch hẹn?</h4>
            <p className={styles.helpText}>
              Hãy gọi Hotline <span className={styles.helpPhone}>1900 1234</span> ít nhất 4 tiếng trước giờ hẹn để được hỗ trợ đổi lịch.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={styles.chatButton}
          >
            <MessageSquare size={16} />
            Chat trực tuyến
          </motion.button>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.copyright}>© 2024 MediCare+ Hospital System. All rights reserved.</p>
          <div className={styles.footerLinks}>
            <a href="#" className={styles.footerLink}>Chính sách bảo mật</a>
            <a href="#" className={styles.footerLink}>Điều khoản sử dụng</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BookingSuccess;