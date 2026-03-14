import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Headphones,
  MessageSquare,
  User,
  Phone,
  Mail,
  FileText,
  CreditCard,
  Stethoscope,
  Clock,
  CalendarDays,
  CheckCircle2,
  UserRound,
} from 'lucide-react';
import logo from "../../../../assets/logo.png";
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
import { useAuth } from '../../../../contexts/AuthContext';
import styles from './PatientInfo.module.css';

const NAV_ITEMS = [
  { name: "Trang chủ", path: "/" },
  { name: "Lịch hẹn", path: "/patient/booking" },
  { name: "Tin tức", path: "/news" },
  { name: "Liên hệ", path: "/contact" }
];
// ===== MOCK DATA từ các bước trước =====
const BOOKING_SUMMARY = {
  specialty: 'Tim mạch',
  doctor: 'BSCKII. Nguyễn Văn A',
  date: 'Thứ Hai, 09/06/2025',
  time: '09:00 – 09:30',
  location: 'Phòng khám 201, Tầng 2',
};

// ===== MAIN COMPONENT =====
const PatientInfo = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    dob: '',
    gender: '',
    phone: '',
    email: '',
    idNumber: '',
    insurance: '',
    reason: '',
    notes: '',
  });

  // Tự điền thông tin từ user đã đăng nhập
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: user.fullName || '',
        email:    user.email    || '',
        dob:      user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
        gender:   user.gender?.toLowerCase() === 'male'   ? 'male'
                : user.gender?.toLowerCase() === 'female' ? 'female'
                : user.gender?.toLowerCase() === 'other'  ? 'other'
                : '',
      }));
    }
  }, [user]);

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!form.dob) newErrors.dob = 'Vui lòng chọn ngày sinh';
    if (!form.gender) newErrors.gender = 'Vui lòng chọn giới tính';
    if (!form.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^[0-9]{9,11}$/.test(form.phone.replace(/\s/g, '')))
      newErrors.phone = 'Số điện thoại không hợp lệ';
    if (!form.reason.trim()) newErrors.reason = 'Vui lòng mô tả lý do khám';
    return newErrors;
  };

  const handleContinue = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    localStorage.setItem('patientInfo', JSON.stringify(form));
    navigate('/patient/booking/success');
  };

  const handleBack = () => navigate('/patient/booking/time');
  // bước trước là SelectTime

  const isFormValid =
    form.fullName && form.dob && form.gender && form.phone && form.reason;

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
            <div className={styles.userAvatar}>
              {user
                ? <span className={styles.avatarInitial}>{(user.fullName || 'U').charAt(0).toUpperCase()}</span>
                : <UserRound size={20} className={styles.avatarIcon} />
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
              <h3 className={styles.stepperTitle}>Bước 4: Thông Tin Bệnh Nhân</h3>
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

        {/* Hero */}
        <div className={styles.heroSection}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.heroTitle}
          >
            Điền <span className={styles.heroHighlight}>thông tin</span> của bạn
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={styles.heroDescription}
          >
            Thông tin của bạn giúp bác sĩ chuẩn bị tốt nhất cho buổi khám. Mọi dữ liệu đều được bảo mật tuyệt đối.
          </motion.p>
        </div>

        {/* Form + Summary */}
        <div className={styles.formWrapper}>
          {/* Left: Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Section 1: Thông tin cá nhân */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className={styles.formSection}
            >
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}><User size={18} /></span>
                Thông tin cá nhân
              </h3>
              <div className={styles.formGrid}>
                {/* Họ tên */}
                <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                  <label className={styles.fieldLabel}>
                    Họ và tên<span className={styles.fieldRequired}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className={`${styles.fieldInput} ${errors.fullName ? styles.fieldInputError : ''}`}
                    value={form.fullName}
                    onChange={(e) => update('fullName', e.target.value)}
                  />
                  {errors.fullName && <span className={styles.fieldError}>{errors.fullName}</span>}
                </div>

                {/* Ngày sinh */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    Ngày sinh<span className={styles.fieldRequired}>*</span>
                  </label>
                  <input
                    type="date"
                    className={`${styles.fieldInput} ${errors.dob ? styles.fieldInputError : ''}`}
                    value={form.dob}
                    onChange={(e) => update('dob', e.target.value)}
                  />
                  {errors.dob && <span className={styles.fieldError}>{errors.dob}</span>}
                </div>

                {/* Giới tính */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    Giới tính<span className={styles.fieldRequired}>*</span>
                  </label>
                  <div className={styles.genderGroup}>
                    {[
                      { value: 'male', label: '♂ Nam' },
                      { value: 'female', label: '♀ Nữ' },
                      { value: 'other', label: '⚬ Khác' },
                    ].map((g) => (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => update('gender', g.value)}
                        className={`${styles.genderBtn} ${form.gender === g.value ? styles.genderBtnActive : ''}`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                  {errors.gender && <span className={styles.fieldError}>{errors.gender}</span>}
                </div>
              </div>
            </motion.div>

            {/* Section 2: Liên hệ */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={styles.formSection}
            >
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}><Phone size={18} /></span>
                Thông tin liên hệ
              </h3>
              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    Số điện thoại<span className={styles.fieldRequired}>*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="0912 345 678"
                    className={`${styles.fieldInput} ${errors.phone ? styles.fieldInputError : ''}`}
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                  />
                  {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Email</label>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    className={styles.fieldInput}
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                  />
                </div>
              </div>
            </motion.div>

            {/* Section 3: CMND / BHYT */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className={styles.formSection}
            >
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}><CreditCard size={18} /></span>
                Giấy tờ & Bảo hiểm
              </h3>
              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>CMND / CCCD</label>
                  <input
                    type="text"
                    placeholder="012 345 678 901"
                    className={styles.fieldInput}
                    value={form.idNumber}
                    onChange={(e) => update('idNumber', e.target.value)}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Số thẻ BHYT</label>
                  <input
                    type="text"
                    placeholder="HS4-1234-5678-9012"
                    className={styles.fieldInput}
                    value={form.insurance}
                    onChange={(e) => update('insurance', e.target.value)}
                  />
                </div>
              </div>
            </motion.div>

            {/* Section 4: Lý do khám */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={styles.formSection}
            >
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}><FileText size={18} /></span>
                Thông tin khám bệnh
              </h3>
              <div className={styles.formGrid}>
                <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                  <label className={styles.fieldLabel}>
                    Lý do / triệu chứng<span className={styles.fieldRequired}>*</span>
                  </label>
                  <textarea
                    placeholder="Mô tả ngắn các triệu chứng hoặc lý do bạn muốn khám..."
                    className={`${styles.fieldTextarea} ${errors.reason ? styles.fieldInputError : ''}`}
                    value={form.reason}
                    onChange={(e) => update('reason', e.target.value)}
                  />
                  {errors.reason && <span className={styles.fieldError}>{errors.reason}</span>}
                </div>

                <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                  <label className={styles.fieldLabel}>Ghi chú thêm</label>
                  <textarea
                    placeholder="Dị ứng thuốc, tiền sử bệnh, hoặc yêu cầu đặc biệt (nếu có)..."
                    className={styles.fieldTextarea}
                    value={form.notes}
                    onChange={(e) => update('notes', e.target.value)}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={styles.summaryCard}
          >
            <h4 className={styles.summaryTitle}>📋 Thông tin đặt lịch</h4>

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
              ✅ Vui lòng đến trước giờ hẹn <strong>15 phút</strong> để hoàn tất thủ tục đăng ký tại quầy lễ tân.
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
            disabled={!isFormValid}
            className={`${styles.continueButton} ${!isFormValid ? styles.continueButtonDisabled : ''}`}
          >
            Xác nhận đặt lịch
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

export default PatientInfo;