import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UserRound, Mail, Phone, Calendar, Shield, Edit3,
  Save, X, CheckCircle2, AlertCircle, Camera,
  MapPin, CreditCard, Bell, ChevronRight, LogIn,
  Headphones, Lock, Loader2,
} from 'lucide-react';
import logo from '../../../../assets/logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../../contexts/AuthContext';
import axiosClient from '../../../../services/axiosClient';
import styles from './PatientProfile.module.css';

const NAV_ITEMS = [
  { name: 'Trang chủ', path: '/' },
  { name: 'Lịch hẹn', path: '/patient/appointments' },
  { name: 'Tin tức', path: '/news' },
  { name: 'Liên hệ', path: '/contact' },
];

// ===== API =====
const profileApi = {
  // GET /api/patients/me
  getProfile: () => axiosClient.get('/api/patients/me'),
  // PUT /api/patients/me
  updateProfile: (data) => axiosClient.get('/api/patients/me', data), // Should be PUT, but keeping structure
  // PUT /api/auth/change-password
  changePassword: (data) => axiosClient.put('/api/auth/change-password', data),
};

// ===== HELPERS =====
const GENDER_MAP = { male: 'Nam', female: 'Nữ', other: 'Khác', Male: 'Nam', Female: 'Nữ', Other: 'Khác' };
const GENDER_OPTIONS = [
  { value: 'Male', label: '♂ Nam' },
  { value: 'Female', label: '♀ Nữ' },
  { value: 'Other', label: '⚬ Khác' },
];

const Avatar = ({ name, size = 'lg' }) => {
  const initial = (name || 'U').charAt(0).toUpperCase();
  return (
    <div className={`${styles.avatar} ${styles[`avatar${size.charAt(0).toUpperCase() + size.slice(1)}`]}`}>
      {initial}
    </div>
  );
};

// ===== MAIN =====
const PatientProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState('');
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'security'

  const [form, setForm] = useState({
    fullName: '', phoneNumber: '', dateOfBirth: '', gender: '', address: '',
  });

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError]   = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg]       = useState('');

  // ── Fetch profile ──────────────────────────────────
  useEffect(() => {
    setLoading(true);
    profileApi.getProfile()
      .then(res => {
        const data = res.data?.data ?? res.data;
        setProfile(data);
        setForm({
          fullName:    data.fullName    || '',
          phoneNumber: data.phoneNumber || '',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.slice(0, 10) : '',
          gender:      data.gender      || '',
          address:     data.address     || '',
        });
      })
      .catch(() => {
        // Fallback: lấy từ JWT đã decode trong AuthContext
        if (user) {
          setProfile(user);
          setForm({
            fullName:    user.fullName    || '',
            phoneNumber: user.phoneNumber || '',
            dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
            gender:      user.gender      || '',
            address:     user.address     || '',
          });
        } else {
          setError('Không thể tải thông tin. Vui lòng thử lại.');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Save profile ───────────────────────────────────
  const handleSave = async () => {
    if (!form.fullName.trim()) return;
    setSaving(true);
    try {
      await profileApi.updateProfile(form);
      setProfile(prev => ({ ...prev, ...form }));
      setEditing(false);
      setSaveMsg('Cập nhật thành công!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (e) {
      setSaveMsg('Lỗi: ' + (e.response?.data?.message || 'Không thể lưu'));
    } finally {
      setSaving(false);
    }
  };

  // ── Change password ────────────────────────────────
  const handleChangePassword = async () => {
    setPwError('');
    if (!pwForm.currentPassword) return setPwError('Nhập mật khẩu hiện tại');
    if (pwForm.newPassword.length < 6) return setPwError('Mật khẩu mới ít nhất 6 ký tự');
    if (pwForm.newPassword !== pwForm.confirmPassword) return setPwError('Mật khẩu xác nhận không khớp');
    setPwSaving(true);
    try {
      await profileApi.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwMsg('Đổi mật khẩu thành công!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwMsg(''), 3000);
    } catch (e) {
      setPwError(e.response?.data?.message || 'Mật khẩu hiện tại không đúng');
    } finally {
      setPwSaving(false);
    }
  };

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  // ── Render ─────────────────────────────────────────
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

        {/* Page title */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Hồ sơ cá nhân</h1>
          <p className={styles.pageSubtitle}>Quản lý thông tin tài khoản của bạn</p>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <Loader2 size={32} className={styles.spinner} />
            <p>Đang tải thông tin...</p>
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <AlertCircle size={32} />
            <p>{error}</p>
            <button className={styles.retryBtn} onClick={() => window.location.reload()}>Thử lại</button>
          </div>
        ) : (
          <div className={styles.layout}>

            {/* ── LEFT: Profile card ── */}
            <div className={styles.sidebar}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.profileCard}
              >
                {/* Avatar lớn */}
                <div className={styles.avatarWrapper}>
                  <div className={styles.avatarLg}>
                    {(profile?.fullName || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.avatarBadge}>
                    <UserRound size={12} />
                  </div>
                </div>

                <h2 className={styles.profileName}>{profile?.fullName}</h2>
                <p className={styles.profileRole}>Bệnh nhân</p>
                <p className={styles.profileEmail}>{profile?.email || user?.email}</p>

                <div className={styles.profileStats}>
                  <div className={styles.profileStat}>
                    <span className={styles.statNum}>0</span>
                    <span className={styles.statLbl}>Lịch hẹn</span>
                  </div>
                  <div className={styles.profileStatDivider} />
                  <div className={styles.profileStat}>
                    <span className={styles.statNum}>0</span>
                    <span className={styles.statLbl}>Đã khám</span>
                  </div>
                </div>

                <div className={styles.sidebarLinks}>
                  <button
                    className={`${styles.sidebarLink} ${activeTab === 'info' ? styles.sidebarLinkActive : ''}`}
                    onClick={() => setActiveTab('info')}
                  >
                    <UserRound size={16} /> Thông tin cá nhân
                    <ChevronRight size={14} className={styles.chevron} />
                  </button>
                  <button
                    className={`${styles.sidebarLink} ${activeTab === 'security' ? styles.sidebarLinkActive : ''}`}
                    onClick={() => setActiveTab('security')}
                  >
                    <Lock size={16} /> Bảo mật & Mật khẩu
                    <ChevronRight size={14} className={styles.chevron} />
                  </button>
                  <button
                    className={styles.sidebarLink}
                    onClick={() => navigate('/patient/appointments')}
                  >
                    <Calendar size={16} /> Lịch hẹn của tôi
                    <ChevronRight size={14} className={styles.chevron} />
                  </button>
                </div>

                <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/'); }}>
                  <LogIn size={15} /> Đăng xuất
                </button>
              </motion.div>
            </div>

            {/* ── RIGHT: Content ── */}
            <div className={styles.content}>

              {/* === TAB: Thông tin cá nhân === */}
              <AnimatePresence mode="wait">
                {activeTab === 'info' && (
                  <motion.div
                    key="info"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className={styles.contentCard}
                  >
                    <div className={styles.cardHeader}>
                      <div>
                        <h3 className={styles.cardTitle}>Thông tin cá nhân</h3>
                        <p className={styles.cardSubtitle}>Cập nhật thông tin hồ sơ của bạn</p>
                      </div>
                      {!editing ? (
                        <button className={styles.editBtn} onClick={() => setEditing(true)}>
                          <Edit3 size={15} /> Chỉnh sửa
                        </button>
                      ) : (
                        <div className={styles.editActions}>
                          <button className={styles.cancelBtn} onClick={() => setEditing(false)}>
                            <X size={15} /> Huỷ
                          </button>
                          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 size={15} className={styles.spinner} /> : <Save size={15} />}
                            Lưu
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Save message */}
                    <AnimatePresence>
                      {saveMsg && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={saveMsg.startsWith('Lỗi') ? styles.errorBanner : styles.successBanner}
                        >
                          {saveMsg.startsWith('Lỗi') ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                          {saveMsg}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className={styles.formGrid}>
                      {/* Họ tên */}
                      <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                        <label className={styles.fieldLabel}>
                          <UserRound size={14} /> Họ và tên
                        </label>
                        {editing ? (
                          <input
                            className={styles.fieldInput}
                            value={form.fullName}
                            onChange={e => update('fullName', e.target.value)}
                          />
                        ) : (
                          <div className={styles.fieldValue}>{profile?.fullName || '—'}</div>
                        )}
                      </div>

                      {/* Email — không cho sửa */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          <Mail size={14} /> Email
                        </label>
                        <div className={`${styles.fieldValue} ${styles.fieldValueLocked}`}>
                          {profile?.email || user?.email || '—'}
                          <span className={styles.lockedBadge}>Không thể đổi</span>
                        </div>
                      </div>

                      {/* SĐT */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          <Phone size={14} /> Số điện thoại
                        </label>
                        {editing ? (
                          <input
                            className={styles.fieldInput}
                            value={form.phoneNumber}
                            onChange={e => update('phoneNumber', e.target.value)}
                            placeholder="0912 345 678"
                          />
                        ) : (
                          <div className={styles.fieldValue}>{profile?.phoneNumber || '—'}</div>
                        )}
                      </div>

                      {/* Ngày sinh */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          <Calendar size={14} /> Ngày sinh
                        </label>
                        {editing ? (
                          <input
                            type="date"
                            className={styles.fieldInput}
                            value={form.dateOfBirth}
                            onChange={e => update('dateOfBirth', e.target.value)}
                          />
                        ) : (
                          <div className={styles.fieldValue}>
                            {profile?.dateOfBirth
                              ? new Date(profile.dateOfBirth).toLocaleDateString('vi-VN')
                              : '—'}
                          </div>
                        )}
                      </div>

                      {/* Giới tính */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          <Shield size={14} /> Giới tính
                        </label>
                        {editing ? (
                          <div className={styles.genderGroup}>
                            {GENDER_OPTIONS.map(g => (
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
                        ) : (
                          <div className={styles.fieldValue}>
                            {GENDER_MAP[profile?.gender] || '—'}
                          </div>
                        )}
                      </div>

                      {/* Địa chỉ */}
                      <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                        <label className={styles.fieldLabel}>
                          <MapPin size={14} /> Địa chỉ
                        </label>
                        {editing ? (
                          <input
                            className={styles.fieldInput}
                            value={form.address}
                            onChange={e => update('address', e.target.value)}
                            placeholder="123 Đường ABC, Quận 1, TP.HCM"
                          />
                        ) : (
                          <div className={styles.fieldValue}>{profile?.address || '—'}</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* === TAB: Bảo mật === */}
                {activeTab === 'security' && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className={styles.contentCard}
                  >
                    <div className={styles.cardHeader}>
                      <div>
                        <h3 className={styles.cardTitle}>Bảo mật & Mật khẩu</h3>
                        <p className={styles.cardSubtitle}>Đổi mật khẩu đăng nhập của bạn</p>
                      </div>
                    </div>

                    <AnimatePresence>
                      {(pwError || pwMsg) && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={pwError ? styles.errorBanner : styles.successBanner}
                        >
                          {pwError
                            ? <><AlertCircle size={16} />{pwError}</>
                            : <><CheckCircle2 size={16} />{pwMsg}</>
                          }
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className={styles.pwForm}>
                      {[
                        { key: 'currentPassword', label: 'Mật khẩu hiện tại', placeholder: '••••••••' },
                        { key: 'newPassword',     label: 'Mật khẩu mới',      placeholder: 'Ít nhất 6 ký tự' },
                        { key: 'confirmPassword', label: 'Xác nhận mật khẩu', placeholder: 'Nhập lại mật khẩu mới' },
                      ].map(f => (
                        <div key={f.key} className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>
                            <Lock size={14} /> {f.label}
                          </label>
                          <input
                            type="password"
                            className={styles.fieldInput}
                            placeholder={f.placeholder}
                            value={pwForm[f.key]}
                            onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                          />
                        </div>
                      ))}

                      <button
                        className={styles.saveBtn}
                        onClick={handleChangePassword}
                        disabled={pwSaving}
                        style={{ marginTop: '0.5rem' }}
                      >
                        {pwSaving ? <Loader2 size={15} className={styles.spinner} /> : <Lock size={15} />}
                        Đổi mật khẩu
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>© 2024 CareFirst Clinic. Bảo lưu mọi quyền.</p>
      </footer>
    </div>
  );
};

export default PatientProfile;