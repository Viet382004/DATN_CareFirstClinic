import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Headphones,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sun,
  Sunset,
  Moon,
  Stethoscope,
  User,
} from 'lucide-react';
import logo from "../../../../assets/logo.png";
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
import { useAuth } from '../../../../contexts/AuthContext';
import styles from './SelectTime.module.css';

const NAV_ITEMS = [
  { name: "Trang chủ", path: "/" },
  { name: "Lịch hẹn", path: "/patient/booking" },
  { name: "Tin tức", path: "/news" },
  { name: "Liên hệ", path: "/contact" }
];
// ===== HELPERS =====
const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS = [
  'Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12',
];

// Giả lập slot đã đặt
const BOOKED_SLOTS = ['08:30', '10:00', '14:30'];

const TIME_PERIODS = [
  {
    id: 'morning',
    label: 'Buổi sáng',
    icon: Sun,
    slots: ['07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
  },
  {
    id: 'afternoon',
    label: 'Buổi chiều',
    icon: Sunset,
    slots: ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'],
  },
  {
    id: 'evening',
    label: 'Buổi tối',
    icon: Moon,
    slots: ['17:00', '17:30', '18:00', '18:30'],
  },
];

// Mock booking summary từ bước trước
const BOOKING_SUMMARY = {
  specialty: 'Tim mạch',
  doctor: 'BSCKII. Nguyễn Văn A',
  doctorSub: 'Nội Tổng Quát - Tim Mạch',
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

// ===== MAIN COMPONENT =====
const SelectTime = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const today = new Date();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isDisabled = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < t;
  };

  const isSelected = (day) =>
    selectedDate &&
    selectedDate.day === day &&
    selectedDate.month === viewMonth &&
    selectedDate.year === viewYear;

  const isToday = (day) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  const handleDayClick = (day) => {
    if (isDisabled(day)) return;
    setSelectedDate({ day, month: viewMonth, year: viewYear });
    setSelectedTime(null);
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return null;
    const d = new Date(selectedDate.year, selectedDate.month, selectedDate.day);
    const dow = ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'][d.getDay()];
    return `${dow}, ${String(selectedDate.day).padStart(2,'0')}/${String(selectedDate.month+1).padStart(2,'0')}/${selectedDate.year}`;
  };

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      localStorage.setItem('selectedDate', JSON.stringify(selectedDate));
      localStorage.setItem('selectedTime', selectedTime);
      navigate('/patient/booking/info');
    }
  };

  const handleBack = () => navigate('/patient/booking/doctor');

  const isReady = selectedDate && selectedTime;

  // Build calendar cells
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

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
              <span className={styles.stepperBadge}>Tiến trình đặt lịch</span>
              <h3 className={styles.stepperTitle}>Bước 3: Chọn Thời Gian</h3>
            </div>
            <span className={styles.stepperCount}>3 / 5 Hoàn tất</span>
          </div>

          <div className={styles.progressBar}>
            <motion.div
              initial={{ width: '40%' }}
              animate={{ width: '60%' }}
              className={styles.progressFill}
            />
          </div>

          <div className={styles.stepLabels}>
            {['CHUYÊN KHOA', 'BÁC SĨ', 'THỜI GIAN', 'THÔNG TIN', 'XÁC NHẬN'].map((step, i) => (
              <div
                key={step}
                className={`${styles.stepLabel} ${
                  i < 2 ? styles.stepLabelDone : i === 2 ? styles.stepLabelActive : ''
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* Hero */}
        <div className={styles.heroSection}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.heroTitle}
          >
            Chọn <span className={styles.heroHighlight}>ngày & giờ</span> khám
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={styles.heroDescription}
          >
            Chọn thời gian phù hợp với lịch của bạn. Mỗi slot khám kéo dài khoảng 30 phút.
          </motion.p>
        </div>

        {/* Content — 3 columns: Calendar | Time Slots | Summary */}
        <div className={styles.contentLayout}>

          {/* COL 1: Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={styles.calendarCard}
          >
            <div className={styles.calendarHeader}>
              <button className={styles.calendarNav} onClick={prevMonth}><ChevronLeft size={14} /></button>
              <span className={styles.calendarMonthLabel}>{MONTHS[viewMonth]} {viewYear}</span>
              <button className={styles.calendarNav} onClick={nextMonth}><ChevronRight size={14} /></button>
            </div>
            <div className={styles.calendarDow}>
              {DAYS_OF_WEEK.map((d) => (
                <div key={d} className={styles.calendarDowCell}>{d}</div>
              ))}
            </div>
            <div className={styles.calendarGrid}>
              {cells.map((day, idx) =>
                day === null ? (
                  <div key={`empty-${idx}`} className={`${styles.calendarDay} ${styles.calendarDayEmpty}`} />
                ) : (
                  <motion.button
                    key={day}
                    whileHover={isDisabled(day) ? {} : { scale: 1.08 }}
                    whileTap={isDisabled(day) ? {} : { scale: 0.94 }}
                    onClick={() => handleDayClick(day)}
                    className={`
                      ${styles.calendarDay}
                      ${isDisabled(day) ? styles.calendarDayDisabled : ''}
                      ${isToday(day) && !isSelected(day) ? styles.calendarDayToday : ''}
                      ${isSelected(day) ? styles.calendarDaySelected : ''}
                    `}
                  >
                    {day}
                  </motion.button>
                )
              )}
            </div>
          </motion.div>

          {/* COL 2: Time Slots */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={styles.timeSlotsCard}
          >
            {selectedDate ? (
              <>
                <div className={styles.timeSlotsSectionTitle}>
                  <Clock size={14} />
                  {formatSelectedDate()}
                </div>
                {TIME_PERIODS.map((period) => {
                  const Icon = period.icon;
                  return (
                    <div key={period.id} className={styles.timePeriod}>
                      <div className={styles.timePeriodLabel}><Icon size={12} />{period.label}</div>
                      <div className={styles.timeSlotGrid}>
                        {period.slots.map((slot) => {
                          const booked = BOOKED_SLOTS.includes(slot);
                          const sel = selectedTime === slot;
                          return (
                            <motion.button
                              key={slot}
                              whileHover={booked ? {} : { scale: 1.04 }}
                              whileTap={booked ? {} : { scale: 0.96 }}
                              onClick={() => !booked && setSelectedTime(slot)}
                              className={`${styles.timeSlot} ${sel ? styles.timeSlotSelected : ''} ${booked ? styles.timeSlotBooked : ''}`}
                            >
                              {slot}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                <div className={styles.timeSlotLegend}>
                  <div className={styles.legendItem}><div className={`${styles.legendDot} ${styles.legendDotAvailable}`} />Còn trống</div>
                  <div className={styles.legendItem}><div className={`${styles.legendDot} ${styles.legendDotSelected}`} />Đã chọn</div>
                  <div className={styles.legendItem}><div className={`${styles.legendDot} ${styles.legendDotBooked}`} />Đã đặt</div>
                </div>
              </>
            ) : (
              <div className={styles.timeSlotsEmpty}>
                <Clock size={32} />
                Chọn ngày để xem khung giờ trống
              </div>
            )}
          </motion.div>

          {/* COL 3: Summary */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={styles.summaryCard}
          >
            <h4 className={styles.summaryTitle}>Thông tin đặt lịch</h4>
            {[
              { icon: <Stethoscope size={13} />, label: 'Chuyên khoa', value: BOOKING_SUMMARY.specialty },
              { icon: <User size={13} />, label: 'Bác sĩ', value: BOOKING_SUMMARY.doctor, sub: BOOKING_SUMMARY.doctorSub },
            ].map((item) => (
              <div key={item.label} className={styles.summaryItem}>
                <div className={styles.summaryItemIcon}>{item.icon}</div>
                <div>
                  <div className={styles.summaryItemLabel}>{item.label}</div>
                  <div className={styles.summaryItemValue}>{item.value}</div>
                  {item.sub && <div className={styles.summaryItemSub}>{item.sub}</div>}
                </div>
              </div>
            ))}
            {isReady ? (
              <div className={styles.summarySelected}>
                <div className={styles.summarySelectedLabel}>Lịch đã chọn</div>
                <div className={styles.summarySelectedValue}>{formatSelectedDate()}</div>
                <div className={styles.summarySelectedTime}>{selectedTime}</div>
              </div>
            ) : (
              <div className={styles.summaryPlaceholder}>Chưa chọn ngày & giờ</div>
            )}
          </motion.div>

        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBack}
            className={styles.backButton}
          >
            <ArrowLeft size={18} />
            Quay lại
          </motion.button>

          <motion.button
            whileHover={isReady ? { scale: 1.02, y: -2 } : {}}
            whileTap={isReady ? { scale: 0.98 } : {}}
            onClick={handleContinue}
            disabled={!isReady}
            className={`${styles.continueButton} ${!isReady ? styles.continueButtonDisabled : ''}`}
          >
            Tiếp theo
            <ArrowRight size={18} />
          </motion.button>
        </div>

        {/* Help */}
        <div className={styles.helpSection}>
          <div className={styles.helpIcon}><Headphones size={24} /></div>
          <div className={styles.helpContent}>
            <h4 className={styles.helpTitle}>Cần hỗ trợ tư vấn?</h4>
            <p className={styles.helpText}>
              Hãy gọi Hotline <span className={styles.helpPhone}>1900 1234</span> để được nhân viên y tế hỗ trợ.
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

export default SelectTime;