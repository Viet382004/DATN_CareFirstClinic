import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Headphones,
  FileText,
  Stethoscope,
  Clock,
  CalendarDays,
  CheckCircle2,
  UserRound,
  User,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/useAuth';
import styles from './Patientinfo.module.css';
import { appointmentService } from '../../../services/appointmentService';
import { patientService } from '../../../services/patientService';
import Header from '../../../modules/home/components/Header';

const getBookingSummary = () => {
  return {
    specialty: localStorage.getItem('selectedSpecialtyName') || localStorage.getItem('selectedDoctorSub') || 'Chuyên khoa',
    doctor: localStorage.getItem('selectedDoctorName') || 'Bác sĩ',
    date: localStorage.getItem('selectedDisplayDate') || 'Ngày khám',
    time: localStorage.getItem('selectedTime') || 'Giờ khám',
    location: 'CareFirst Clinic',
  };
};

const PatientInfo = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    dob: '',
    gender: '',
    phone: '',
    email: '',
    reason: '',
    notes: '',
  });
  
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loading, setLoading] = useState(false);
  const BOOKING_SUMMARY = getBookingSummary();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const profile = await patientService.getMe();
        if (profile) {
          setForm(prev => ({
            ...prev,
            fullName: profile.fullName || '',
            dob: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
            gender: profile.gender || '',
            phone: profile.phoneNumber || '',
            email: profile.email || '',
          }));
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin bệnh nhân:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.reason.trim()) newErrors.reason = 'Vui lòng mô tả lý do khám';
    return newErrors;
  };

  const handleContinue = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const timeSlotId = localStorage.getItem('selectedTimeSlotId');
      if (!timeSlotId || timeSlotId === 'null' || timeSlotId === 'undefined') {
        alert("Không tìm thấy khung giờ đã chọn. Vui lòng quay lại bước trước.");
        return;
      }

      // Normalize gender to match backend
      const normalizedGender = form.gender.charAt(0).toUpperCase() + form.gender.slice(1);

      const payload = {
        timeSlotId: timeSlotId,
        reason: form.reason || "Khám tổng quát",
        notes: form.notes || "",
        fullName: form.fullName,
        dob: form.dob,
        gender: normalizedGender,
        phone: form.phone,
        email: form.email
      };

      const res = await appointmentService.create(payload);
      const appointmentData = res.data || res;
      const bookingCode = appointmentData.id || appointmentData.bookingCode || 'CF-' + Date.now();
      
      localStorage.setItem('bookingCode', bookingCode);
      navigate('/patient/booking/success');
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Đã có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate('/patient/booking/time');
  const isFormValid = form.reason && !loadingProfile;

  return (
    <>
      <Header />
      <div className={styles.container}>
        <main className={styles.main}>
          {/* Progress Stepper */}
          <div className={styles.stepperContainer}>
            <div className={styles.stepperHeader}>
              <div>
                <span className={styles.stepperBadge}>Tiến trình đặt lịch</span>
                <h3 className={styles.stepperTitle}>Bước 4: Thông Tin Đặt Lịch</h3>
              </div>
              <span className={styles.stepperCount}>4 / 5 Hoàn tất</span>
            </div>

            <div className={styles.progressBar}>
              <motion.div
                initial={{ width: '60%' }}
                animate={{ width: '80%' }}
                className={styles.progressFill}
              />
            </div>

            <div className={styles.stepLabels}>
              {['CHUYÊN KHOA', 'BÁC SĨ', 'THỜI GIAN', 'THÔNG TIN', 'XÁC NHẬN'].map((step, i) => (
                <div
                  key={step}
                  className={`${styles.stepLabel} ${
                    i < 3 ? styles.stepLabelDone : i === 3 ? styles.stepLabelActive : ''
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.heroSection}>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.heroTitle}
            >
              Hoàn tất <span className={styles.heroHighlight}>thông tin</span> đặt lịch
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={styles.heroDescription}
            >
              Vui lòng cung cấp lý do khám và ghi chú thêm để bác sĩ chuẩn bị tốt nhất.
            </motion.p>
          </div>

          <div className={styles.formWrapper}>
            {/* Left: Form Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
              
              {/* Profile Summary (Read-only) */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.formSection}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 className={styles.sectionTitle} style={{ margin: 0 }}>
                    <span className={styles.sectionIcon}><UserRound size={18} /></span>
                    Thông tin bệnh nhân
                  </h3>
                  <Link to="/patient/profile" className={styles.editLink} style={{ fontSize: '0.85rem', color: '#3b82f6', textDecoration: 'none' }}>
                    Chỉnh sửa hồ sơ
                  </Link>
                </div>

                {loadingProfile ? (
                  <div className={styles.loadingProfile}>Đang lấy thông tin...</div>
                ) : (
                  <div className={styles.profileSummaryGrid}>
                    <div className={styles.summaryInfoItem}>
                      <label>Họ và tên</label>
                      <div>{form.fullName}</div>
                    </div>
                    <div className={styles.summaryInfoItem}>
                      <label>Số điện thoại</label>
                      <div>{form.phone}</div>
                    </div>
                    <div className={styles.summaryInfoItem}>
                      <label>Ngày sinh</label>
                      <div>{form.dob ? new Date(form.dob).toLocaleDateString('vi-VN') : '---'}</div>
                    </div>
                    <div className={styles.summaryInfoItem}>
                      <label>Giới tính</label>
                      <div>{form.gender === 'male' ? 'Nam' : form.gender === 'female' ? 'Nữ' : 'Khác'}</div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Editable Section: Reason */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={styles.formSection}
              >
                <h3 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}><FileText size={18} /></span>
                  Chi tiết cuộc hẹn
                </h3>
                <div className={styles.formGrid}>
                  <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                    <label className={styles.fieldLabel}>
                      Lý do / triệu chứng<span className={styles.fieldRequired}>*</span>
                    </label>
                    <textarea
                      placeholder="Mô tả ngắn triệu chứng hoặc lý do bạn muốn khám..."
                      className={`${styles.fieldTextarea} ${errors.reason ? styles.fieldInputError : ''}`}
                      value={form.reason}
                      onChange={(e) => update('reason', e.target.value)}
                    />
                    {errors.reason && <span className={styles.fieldError}>{errors.reason}</span>}
                  </div>

                  <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                    <label className={styles.fieldLabel}>Ghi chú thêm</label>
                    <textarea
                      placeholder="Dị ứng thuốc, tiền sử bệnh hoặc yêu cầu đặc biệt (nếu có)..."
                      className={styles.fieldTextarea}
                      value={form.notes}
                      onChange={(e) => update('notes', e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Summary Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={styles.summaryCard}
            >
              <h4 className={styles.summaryTitle}>📋 Tóm tắt lịch hẹn</h4>

              {[
                { icon: <Stethoscope size={16} />, label: 'Chuyên khoa', value: BOOKING_SUMMARY.specialty },
                { icon: <User size={16} />, label: 'Bác sĩ', value: BOOKING_SUMMARY.doctor },
                { icon: <CalendarDays size={16} />, label: 'Ngày khám', value: BOOKING_SUMMARY.date },
                { icon: <Clock size={16} />, label: 'Giờ khám', value: BOOKING_SUMMARY.time },
                { icon: <CheckCircle2 size={16} />, label: 'Địa điểm', value: BOOKING_SUMMARY.location },
              ].map((item) => (
                <div key={item.label} className={styles.summaryItem}>
                  <div className={styles.summaryItemIcon}>{item.icon}</div>
                  <div>
                    <div className={styles.summaryItemLabel}>{item.label}</div>
                    <div className={styles.summaryItemValue}>{item.value}</div>
                  </div>
                </div>
              ))}

              <div className={styles.summaryNote}>
                ✅ Vui lòng đến trước giờ hẹn <strong>15 phút</strong> để hoàn tất thủ tục đăng ký.
              </div>
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
              whileHover={isFormValid ? { scale: 1.02, y: -2 } : {}}
              whileTap={isFormValid ? { scale: 0.98 } : {}}
              onClick={handleContinue}
              disabled={!isFormValid || loading}
              className={`${styles.continueButton} ${(!isFormValid || loading) ? styles.continueButtonDisabled : ''}`}
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
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
          </div>
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <p className={styles.copyright}>© 2024 MediCare+ Hospital System. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default PatientInfo;