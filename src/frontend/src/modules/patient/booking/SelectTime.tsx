import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
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
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/useAuth';
import styles from './Selecttime.module.css';
import { scheduleService } from '../../../services/scheduleService';
import type { Schedule } from '../../../types/schedule';
import { appointmentService } from '../../../services/appointmentService';
import Header from '../../home/components/Header';
import { formatDate } from '../../../utils/format';


const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];



const getBookingSummary = () => ({
  specialty: localStorage.getItem('selectedDoctorSub') || 'Chuyên khoa',
  doctor: localStorage.getItem('selectedDoctorName') || 'Bác sĩ',
  doctorSub: localStorage.getItem('selectedDoctorSub') || '',
});

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

const SelectTime = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const today = new Date();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const BOOKING_SUMMARY = getBookingSummary();

  useEffect(() => {
    if (!selectedDate) return;

    const fetchAvailableSlots = async () => {
      setLoadingSlots(true);
      try {
        const doctorId = localStorage.getItem('selectedDoctor');
        if (!doctorId) return;

        // Format date: YYYY-MM-DD
        const dateStr = `${selectedDate.year}-${String(selectedDate.month + 1).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;

        // Gọi API
        const schedules = await scheduleService.getAvailableByDoctorAndDate(doctorId, dateStr);

        let mergedSlots = [];
        if (schedules && schedules.length > 0) {
          schedules.forEach(schedule => {
            if (schedule.timeSlots && schedule.timeSlots.length > 0) {
              schedule.timeSlots.forEach(slot => {
                if (!slot.isBooked) { 
                  mergedSlots.push({
                    id: slot.id,
                    time: slot.startTime.substring(0, 5) 
                  });
                }
              });
            }
          });
        }

        // Sắp xếp theo giờ
        mergedSlots.sort((a, b) => a.time.localeCompare(b.time));
        setAvailableSlots(mergedSlots);

      } catch (error) {
        console.error("Failed to fetch slots:", error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDate]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
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
    setSelectedTimeSlot(null);
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return null;
    const d = new Date(selectedDate.year, selectedDate.month, selectedDate.day);
    return formatDate(d);
  };

  // Lưu thông tin và chuyển sang bước Nhập thông tin (Step 4)
  const handleContinue = () => {
    if (!selectedDate || !selectedTimeSlot) return;

    const dateStr = `${selectedDate.year}-${String(selectedDate.month + 1).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;

    // Lưu thông tin vào localStorage để bước sau sử dụng
    localStorage.setItem('selectedTimeSlotId', selectedTimeSlot.id);
    localStorage.setItem('selectedDate', dateStr);
    localStorage.setItem('selectedDisplayDate', formatSelectedDate());
    localStorage.setItem('selectedTime', selectedTimeSlot.time);

    // Chuyển sang bước tiếp theo
    navigate('/patient/booking/info');
  };

  const handleBack = () => navigate('/patient/booking/doctor');

  const isReady = selectedDate && selectedTimeSlot;

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

     return (
    <>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className={styles.container}>
        <main className={styles.main}>
          {/* Progress Stepper */}
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
          </div>

          {/* Hero Section */}
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
              Chọn thời gian phù hợp với lịch của bạn.
            </motion.p>
          </div>

          {/* Content Layout */}
          <div className={styles.contentLayout}>
            {/* Calendar Column - giữ nguyên code của bạn */}
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

            {/* Time Slots Column */}
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

                    {loadingSlots ? (
                    <div className={styles.timeSlotsEmpty}>Đang tải khung giờ...</div>
                  ) : (
                    <div className={styles.timePeriodsList}>
                      {[
                        { id: 'morning', label: 'Buổi sáng', icon: Sun, filter: (h) => h < 12 },
                        { id: 'afternoon', label: 'Buổi chiều', icon: Sunset, filter: (h) => h >= 12 && h < 18 },
                        { id: 'evening', label: 'Buổi tối', icon: Moon, filter: (h) => h >= 18 }
                      ].map((period) => {
                        const Icon = period.icon;
                        const validSlots = availableSlots.filter(s => {
                          const [h, m] = s.time.split(':').map(Number);
                          
                          // Check period
                          if (!period.filter(h)) return false;

                          const isTodaySelected = selectedDate.day === today.getDate() &&
                                                 selectedDate.month === today.getMonth() &&
                                                 selectedDate.year === today.getFullYear();
                          if (isTodaySelected) {
                            const slotTime = new Date();
                            slotTime.setHours(h, m, 0, 0);
                            return slotTime > new Date();
                          }
                          return true;
                        });

                        if (validSlots.length === 0) return null;

                        return (
                          <div key={period.id} className={styles.timePeriod}>
                            <div className={styles.timePeriodLabel}><Icon size={12} />{period.label}</div>
                            <div className={styles.timeSlotGrid}>
                              {validSlots.map((slotObj) => {
                                const isSlotSelected = selectedTimeSlot?.id === slotObj.id;
                                return (
                                  <motion.button
                                    key={slotObj.id}
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => setSelectedTimeSlot(slotObj)}
                                    className={`
                                      ${styles.timeSlot}
                                      ${isSlotSelected ? styles.timeSlotSelected : ''}
                                    `}
                                  >
                                    {slotObj.time}
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {!loadingSlots && (
                    <div className={styles.timeSlotLegend}>
                      <div className={styles.legendItem}><div className={`${styles.legendDot} ${styles.legendDotAvailable}`} />Còn trống</div>
                      <div className={styles.legendItem}><div className={`${styles.legendDot} ${styles.legendDotSelected}`} />Đã chọn</div>
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.timeSlotsEmpty}>
                  <Clock size={32} />
                  Chọn ngày để xem khung giờ trống
                </div>
              )}
            </motion.div>

            {/* Summary Column */}
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
                  <div className={styles.summarySelectedTime}>{selectedTimeSlot.time}</div>
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
              disabled={!isReady || loadingSlots}
              className={`${styles.continueButton} ${(!isReady || loadingSlots) ? styles.continueButtonDisabled : ''}`}
            >
              {loadingSlots ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
              <ArrowRight size={18} />
            </motion.button>
          </div>

          {/* Help Section */}
          <div className={styles.helpSection}>
            <div className={styles.helpIcon}><Headphones size={24} /></div>
            <div className={styles.helpContent}>
              <h4 className={styles.helpTitle}>Cần hỗ trợ tư vấn?</h4>
              <p className={styles.helpText}>
                Hãy gọi Hotline <span className={styles.helpPhone}>1900 1234</span> để được hỗ trợ.
              </p>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={styles.chatButton}>
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

export default SelectTime;