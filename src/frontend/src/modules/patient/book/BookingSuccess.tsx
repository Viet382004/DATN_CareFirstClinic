import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
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
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/useAuth';
import styles from './Bookingsuccess.module.css';
import Header from '../../home/components/Header';

const getBookingData = () => {
  let patientName = '';
  let patientPhone = '';
  try {
    const rawInfo = localStorage.getItem('patientInfo');
    if (rawInfo) {
      const info = JSON.parse(rawInfo);
      patientName = info.fullName;
      patientPhone = info.phone;
    }
  } catch (e) { }

  return {
    code: localStorage.getItem('bookingCode') || 'CF-' + Date.now(),
    specialty: localStorage.getItem('selectedSpecialtyName') || localStorage.getItem('selectedDoctorSub') || 'Chuyên khoa',
    doctor: localStorage.getItem('selectedDoctorName') || 'Bác sĩ',
    doctorSub: localStorage.getItem('selectedDoctorSub') || '',
    date: localStorage.getItem('selectedDisplayDate') || 'Ngày khám',
    time: localStorage.getItem('selectedTime') || 'Giờ khám',
    location: 'CareFirst Clinic',
    locationSub: '123 Nguyễn Huệ, Q.1, TP.HCM',
    patient: patientName,
    phone: patientPhone,
  };
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

  const BOOKING = getBookingData();

  const handleCopy = () => {
    navigator.clipboard.writeText(BOOKING.code).catch(() => { });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Header />
      <div className={styles.container}>

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
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${BOOKING.code}-CAREFIRST-CLINIC`}
                  alt="Patient QR Code"
                  style={{ display: 'inline-block', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px', background: 'white' }}
                />
              </div>
              <p className={styles.qrDesc}>
                Xuất trình mã QR tại quầy lễ tân để check-in nhanh chóng, không cần xếp hàng.
              </p>
              <button
                className={styles.outlineButton}
                style={{ width: '100%' }}
                onClick={() => {
                  const url = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${BOOKING.code}-CAREFIRST-CLINIC`;
                  window.open(url, '_blank');
                }}
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
              onClick={() => { }}
            >
              <Download size={18} />
              Tải phiếu hẹn
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
    </>
  );
};

export default BookingSuccess;