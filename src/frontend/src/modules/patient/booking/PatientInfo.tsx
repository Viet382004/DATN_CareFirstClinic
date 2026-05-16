import React, { useEffect, useState } from 'react';
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
  CreditCard,
  Wallet,
} from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './Patientinfo.module.css';
import { appointmentService } from '../../../services/appointmentService';
import { patientService } from '../../../services/patientService';
import { paymentService } from '../../../services/paymentService';
import Header from '../../home/components/Header';
import type { CreateAppointmentDTO } from '../../../types/appointment';
import { formatDate } from '../../../utils/format';
import {
  getDefaultServiceType,
  getServiceTypeById,
  SERVICE_TYPE_OPTIONS,
  type ServiceTypeId,
} from '../../../constants/serviceTypes';

interface BookingSummary {
  specialty: string;
  doctor: string;
  date: string;
  time: string;
  location: string;
}

interface FormState {
  fullName: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  reason: string;
  notes: string;
}

interface FormErrors {
  reason?: string;
  [key: string]: string | undefined;
}

const getBookingSummary = (): BookingSummary => ({
  specialty: localStorage.getItem('selectedSpecialtyName') || 'Khám lâm sàng',
  doctor: localStorage.getItem('selectedDoctorName') || 'Bác sĩ',
  date: localStorage.getItem('selectedDisplayDate') || 'Ngày khám',
  time: localStorage.getItem('selectedTime') || 'Giờ khám',
  location: 'CareFirst Clinic',
});

const PatientInfo: React.FC = () => {
  const navigate = useNavigate();
  const bookingSummary = getBookingSummary();
  const defaultService = getDefaultServiceType(bookingSummary.specialty);

  const [form, setForm] = useState<FormState>({
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
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<ServiceTypeId>(
    () => (localStorage.getItem('selectedServiceTypeId') as ServiceTypeId) || defaultService.id
  );

  const selectedService = getServiceTypeById(selectedServiceTypeId);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const profile = await patientService.getMe();
        if (!profile) return;

        setForm((prev) => ({
          ...prev,
          fullName: profile.fullName || '',
          dob: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
          gender: profile.gender || '',
          phone: profile.phoneNumber || '',
          email: profile.userEmail || '',
        }));
      } catch (error) {
        console.error('Failed to fetch patient profile', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    void fetchProfile();
  }, []);

  const update = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    if (!form.reason.trim()) {
      nextErrors.reason = 'Vui lòng mô tả lý do khám.';
    }
    return nextErrors;
  };

  const handleContinue = async () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);

    try {
      const timeSlotId = localStorage.getItem('selectedTimeSlotId');
      if (!timeSlotId || timeSlotId === 'null' || timeSlotId === 'undefined') {
        throw new Error('Không tìm thấy khung giờ đã chọn.');
      }

      const normalizedGender = form.gender
        ? form.gender.charAt(0).toUpperCase() + form.gender.slice(1)
        : 'Male';

      const payload: CreateAppointmentDTO = {
        timeSlotId,
        reason: form.reason || selectedService.name,
        notes: form.notes || '',
        fullName: form.fullName,
        dob: form.dob,
        gender: normalizedGender,
        phone: form.phone,
        email: form.email,
        serviceName: selectedService.name,
        consultationFee: selectedService.consultationFee,
      };

      const appointmentResponse = await appointmentService.create(payload);
      const appointment = appointmentResponse.data;
      const bookingCode = appointment.id || `CF-${Date.now()}`;

      localStorage.setItem('selectedServiceTypeId', selectedService.id);
      localStorage.setItem('selectedServiceName', selectedService.name);
      localStorage.setItem('selectedServiceFee', String(selectedService.consultationFee));
      localStorage.setItem(
        'patientInfo',
        JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
        })
      );
      localStorage.setItem('bookingCode', bookingCode);

      const payment = await paymentService.createVNPayPayment(appointment.id);
      if (!payment.success || !payment.data?.paymentUrl) {
        throw new Error(payment.message || 'Không thể tạo thanh toán VNPay.');
      }

      sessionStorage.setItem('pendingOrderId', payment.data.orderId);
      sessionStorage.setItem('pendingPatientAppointmentId', appointment.id);
      sessionStorage.setItem('pendingBookingCode', bookingCode);
      window.location.href = payment.data.paymentUrl;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        'Đã có lỗi xảy ra khi tạo lịch hẹn.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate('/patient/booking/time');
  const isFormValid = Boolean(form.reason.trim()) && !loadingProfile;

  return (
    <>
      <Header />
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.stepperContainer}>
            <div className={styles.stepperHeader}>
              <div>
                <span className={styles.stepperBadge}>Tiến trình đặt lịch</span>
                <h3 className={styles.stepperTitle}>Bước 3: Thông Tin Bệnh Nhân</h3>
              </div>
              <span className={styles.stepperCount}>3 / 4 Hoàn tất</span>
            </div>

            <div className={styles.progressBar}>
              <motion.div initial={{ width: '50%' }} animate={{ width: '75%' }} className={styles.progressFill} />
            </div>

            <div className={styles.stepLabels}>
              {['BÁC SĨ', 'THỜI GIAN', 'THÔNG TIN', 'XÁC NHẬN'].map((step, index) => (
                <div
                  key={step}
                  className={`${styles.stepLabel} ${index < 2 ? styles.stepLabelDone : index === 2 ? styles.stepLabelActive : ''}`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.heroSection}>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.heroTitle}>
              Hoàn tất <span className={styles.heroHighlight}>thông tin</span> đặt lịch
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={styles.heroDescription}
            >
              Bạn cần thanh toán phí khám trước khi lịch hẹn được xác nhận.
            </motion.p>
          </div>

          <div className={styles.formWrapper}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={styles.formSection}>
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
                      <div>{form.dob ? formatDate(form.dob) : '---'}</div>
                    </div>
                    <div className={styles.summaryInfoItem}>
                      <label>Giới tính</label>
                      <div>{form.gender || '---'}</div>
                    </div>
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className={styles.formSection}
              >
                <h3 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}><CreditCard size={18} /></span>
                  Dịch vụ và thanh toán
                </h3>

                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {SERVICE_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedServiceTypeId(option.id)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        borderRadius: '16px',
                        border: selectedServiceTypeId === option.id ? '2px solid #2563eb' : '1px solid #dbe4f0',
                        background: selectedServiceTypeId === option.id ? '#eff6ff' : '#ffffff',
                        padding: '1rem 1.1rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{option.name}</div>
                          <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>{option.description}</div>
                        </div>
                        <div style={{ fontWeight: 900, color: '#2563eb', whiteSpace: 'nowrap' }}>
                          {option.consultationFee.toLocaleString('vi-VN')}d
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    style={{
                      borderRadius: '16px',
                      border: '2px solid #2563eb',
                      background: '#eff6ff',
                      padding: '1rem',
                      fontWeight: 800,
                      color: '#1d4ed8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <CreditCard size={18} />
                    VNPay
                  </button>
                  <div
                    style={{
                      borderRadius: '16px',
                      border: '1px dashed #dbe4f0',
                      background: '#f8fafc',
                      padding: '1rem',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontWeight: 700
                    }}
                  >
                    <Wallet size={18} />
                    Đặt lịch online chỉ hỗ trợ VNPay
                  </div>
                </div>
              </motion.div>

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
                      onChange={(event) => update('reason', event.target.value)}
                    />
                    {errors.reason && <span className={styles.fieldError}>{errors.reason}</span>}
                  </div>

                  <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                    <label className={styles.fieldLabel}>Ghi chú thêm</label>
                    <textarea
                      placeholder="Dị ứng thuốc, tiền sử bệnh hoặc yêu cầu đặc biệt..."
                      className={styles.fieldTextarea}
                      value={form.notes}
                      onChange={(event) => update('notes', event.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={styles.summaryCard}
            >
              <h4 className={styles.summaryTitle}>Tóm tắt lịch hẹn</h4>

              {[
                { icon: <CreditCard size={16} />, label: 'Dịch vụ', value: selectedService.name },
                { icon: <CheckCircle2 size={16} />, label: 'Phí khám', value: `${selectedService.consultationFee.toLocaleString('vi-VN')}d` },
                { icon: <Stethoscope size={16} />, label: 'Chuyên khoa', value: bookingSummary.specialty },
                { icon: <User size={16} />, label: 'Bác sĩ', value: bookingSummary.doctor },
                { icon: <CalendarDays size={16} />, label: 'Ngày khám', value: bookingSummary.date },
                { icon: <Clock size={16} />, label: 'Giờ khám', value: bookingSummary.time },
                { icon: <CheckCircle2 size={16} />, label: 'Địa điểm', value: bookingSummary.location },
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
                Cần thanh toán trước để hệ thống giữ slot và xác nhận lịch hẹn.
              </div>
            </motion.div>
          </div>

          <div className={styles.actionButtons}>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleBack} className={styles.backButton}>
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
              {loading ? 'Đang xử lý...' : `Thanh toán ${selectedService.consultationFee.toLocaleString('vi-VN')}d`}
              <ArrowRight size={18} />
            </motion.button>
          </div>

          <div className={styles.helpSection}>
            <div className={styles.helpIcon}><Headphones size={24} /></div>
            <div className={styles.helpContent}>
              <h4 className={styles.helpTitle}>Cần hỗ trợ tư vấn?</h4>
              <p className={styles.helpText}>
                Gọi Hotline <span className={styles.helpPhone}>1900 1234</span> để được hỗ trợ.
              </p>
            </div>
          </div>
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <p className={styles.copyright}>© 2024 CareFirst Clinic. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default PatientInfo;
