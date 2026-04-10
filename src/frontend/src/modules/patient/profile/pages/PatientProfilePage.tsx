import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UserRound, Calendar, Shield, Edit3,
  Save, X, CheckCircle2, AlertCircle,
  ChevronRight, LogIn, Loader2, FileText, ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../../contexts/useAuth';
import { patientService, type Patient } from '../../../../services/patientService';
import { avatarService } from '../../../../services/avatarService';
import { medicalRecordService, type MedicalRecord } from '../../../../services/medicalRecordService';
import styles from '../styles/PatientProfile.module.css';

const NAV_ITEMS = [
  { name: 'Trang chủ', path: '/' },
  { name: 'Lịch hẹn', path: '/patient/appointments' },
  { name: 'Tin tức', path: '/news' },
  { name: 'Liên hệ', path: '/contact' },
];

const GENDER_MAP: Record<string, string> = {
  male: 'Nam', female: 'Nữ', other: 'Khác',
  Male: 'Nam', Female: 'Nữ', Other: 'Khác'
};

const GENDER_OPTIONS = [
  { value: 'Male', label: '♂ Nam' },
  { value: 'Female', label: '♀ Nữ' },
  { value: 'Other', label: '⚬ Khác' },
];

const DEFAULT_AVATAR_URL = '/assets/avatar-default.svg';

const PatientProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'history'>('info');

  const [medicalHistory, setMedicalHistory] = useState<MedicalRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwError, setPwError] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const profileEmail = profile?.email || user?.email || 'Chưa cập nhật';
  const profileInitial = (profile?.fullName || user?.fullName || 'U').charAt(0).toUpperCase();

  const loadProfile = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await patientService.getMe();
      setProfile(response);
      setAvatarUrl(response.avatarUrl || DEFAULT_AVATAR_URL);
      setForm({
        fullName: response.fullName || '',
        phoneNumber: response.phoneNumber || '',
        dateOfBirth: response.dateOfBirth ? response.dateOfBirth.slice(0, 10) : '',
        gender: response.gender || '',
        address: response.address || '',
      });
    } catch (err: unknown) {
      console.error('Error loading patient profile:', err);
      setError('Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  useEffect(() => {
    if (activeTab !== 'history') {
      return;
    }

    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const response = await medicalRecordService.getMyRecords({ pageSize: 10, sortBy: 'createdAt', sortDir: 'desc' });
        setMedicalHistory(response.items || []);
      } catch (err) {
        console.error('Error loading medical history:', err);
        setMedicalHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, [activeTab]);

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.fullName.trim()) {
      setError('Vui lòng nhập họ và tên.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const updated = await patientService.updateMe({
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        address: form.address,
      });

      if (avatarFile) {
        const uploadResult = await avatarService.uploadPatientAvatar(avatarFile);
        if (!uploadResult.avatarUrl) {
          throw new Error('Không nhận được đường dẫn ảnh đại diện từ server.');
        }
        setAvatarUrl(uploadResult.avatarUrl);
        setAvatarFile(null);
        updated.avatarUrl = uploadResult.avatarUrl;
      }

      setProfile(updated);
      setEditing(false);
      setSaveMsg('Cập nhật hồ sơ thành công!');
      await loadProfile();
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err: unknown) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Không thể cập nhật hồ sơ.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!profile) {
      return;
    }

    setForm({
      fullName: profile.fullName || '',
      phoneNumber: profile.phoneNumber || '',
      dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : '',
      gender: profile.gender || '',
      address: profile.address || '',
    });
    setEditing(false);
    setError('');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const handleChangePassword = async () => {
    setPwError('');

    if (!pwForm.currentPassword) {
      return setPwError('Vui lòng nhập mật khẩu hiện tại.');
    }
    if (pwForm.newPassword.length < 6) {
      return setPwError('Mật khẩu mới phải có ít nhất 6 ký tự.');
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return setPwError('Mật khẩu xác nhận không khớp.');
    }

    setPwSaving(true);
    setTimeout(() => {
      setPwError('Tính năng đổi mật khẩu đang được phát triển.');
      setPwSaving(false);
    }, 800);
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <Loader2 size={32} className={styles.spinner} />
        <p>Đang tải thông tin hồ sơ...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logoSection}>
            <img src="/assets/logo.png" alt="CareFirst" className={styles.logoImg} />
            <h2 className={styles.logoText}>CareFirst Clinic</h2>
          </Link>
          <nav className={styles.nav}>
            {NAV_ITEMS.map(item => (
              <Link key={item.name} to={item.path} className={styles.navLink}>{item.name}</Link>
            ))}
          </nav>
          <div className={styles.headerRight}>
            <div className={styles.headerAvatar}>{profileInitial}</div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <button className={styles.mainBackBtn} onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Quay lại
            </button>
            <div>
              <h1 className={styles.pageTitle}>Hồ sơ cá nhân</h1>
              <p className={styles.pageSubtitle}>Quản lý thông tin tài khoản của bạn</p>
            </div>
          </div>
        </div>

        {error ? (
          <div className={styles.errorState}>
            <AlertCircle size={32} />
            <p>{error}</p>
            <button className={styles.retryBtn} onClick={loadProfile}>Thử lại</button>
          </div>
        ) : (
          <div className={styles.layout}>
            <div className={styles.sidebar}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.profileCard}
              >
                <div className={styles.avatarWrapper}>
                  <img
                    src={avatarUrl || DEFAULT_AVATAR_URL}
                    alt="Avatar"
                    className={styles.avatarImg}
                    onError={(e) => {
                      if (e.currentTarget.src !== DEFAULT_AVATAR_URL) {
                        e.currentTarget.src = DEFAULT_AVATAR_URL;
                      }
                    }}
                  />
                </div>
                <h2 className={styles.profileName}>{profile?.fullName || 'Chưa cập nhật'}</h2>
                <p className={styles.profileRole}>Bệnh nhân</p>
                <p className={styles.profileEmail}>{profileEmail}</p>

                <div className={styles.profileStats}>
                  <div className={styles.profileStat}>
                    <span className={styles.statNum}>{medicalHistory.length}</span>
                    <span className={styles.statLbl}>Lần khám</span>
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
                    <Shield size={16} /> Bảo mật
                    <ChevronRight size={14} className={styles.chevron} />
                  </button>
                </div>

                <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/'); }}>
                  <LogIn size={15} /> Đăng xuất
                </button>
              </motion.div>
            </div>

            <div className={styles.content}>
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
                        <p className={styles.cardSubtitle}>Cập nhật thông tin chính xác để bác sĩ chăm sóc tốt hơn.</p>
                      </div>
                      <div className={styles.editActions}>
                        {editing ? (
                          <>
                            <button className={styles.cancelBtn} onClick={handleCancel}>
                              <X size={14} /> Hủy
                            </button>
                            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                              <Save size={14} /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                          </>
                        ) : (
                          <button className={styles.editBtn} onClick={() => setEditing(true)}>
                            <Edit3 size={14} /> Chỉnh sửa
                          </button>
                        )}
                      </div>
                    </div>

                    {saveMsg && (
                      <div className={styles.successBanner}>
                        <CheckCircle2 size={18} /> {saveMsg}
                      </div>
                    )}

                    <div className={styles.formGrid}>
                      <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                        <label className={styles.fieldLabel} htmlFor="avatar">Ảnh đại diện</label>
                        {editing ? (
                          <div className={styles.avatarUpload}>
                            <input
                              id="avatar"
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarChange}
                              className={styles.avatarInput}
                            />
                            {avatarUrl && (
                              <img src={avatarUrl} alt="Preview" className={styles.avatarPreview} />
                            )}
                          </div>
                        ) : (
                          <div className={styles.fieldValue}>
                          <img
                            src={avatarUrl || DEFAULT_AVATAR_URL}
                            alt="Avatar"
                            className={styles.avatarDisplay}
                            onError={(e) => {
                              if (e.currentTarget.src !== DEFAULT_AVATAR_URL) {
                                e.currentTarget.src = DEFAULT_AVATAR_URL;
                              }
                            }}
                          />
                        </div>
                        )}
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel} htmlFor="fullName">Họ và tên</label>
                        {editing ? (
                          <input
                            id="fullName"
                            className={styles.fieldInput}
                            value={form.fullName}
                            onChange={e => updateForm('fullName', e.target.value)}
                            placeholder="Nhập họ và tên"
                          />
                        ) : (
                          <div className={styles.fieldValue}>{profile?.fullName || 'Chưa cập nhật'}</div>
                        )}
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel} htmlFor="email">Email</label>
                        <div className={styles.fieldValue}>
                          {profileEmail}
                          <span className={styles.lockedBadge}>Không thể sửa</span>
                        </div>
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel} htmlFor="phoneNumber">Số điện thoại</label>
                        {editing ? (
                          <input
                            id="phoneNumber"
                            className={styles.fieldInput}
                            value={form.phoneNumber}
                            onChange={e => updateForm('phoneNumber', e.target.value)}
                            placeholder="Nhập số điện thoại"
                          />
                        ) : (
                          <div className={styles.fieldValue}>{profile?.phoneNumber || 'Chưa cập nhật'}</div>
                        )}
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel} htmlFor="dateOfBirth">Ngày sinh</label>
                        {editing ? (
                          <input
                            id="dateOfBirth"
                            type="date"
                            className={styles.fieldInput}
                            value={form.dateOfBirth}
                            onChange={e => updateForm('dateOfBirth', e.target.value)}
                          />
                        ) : (
                          <div className={styles.fieldValue}>{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</div>
                        )}
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel} htmlFor="gender">Giới tính</label>
                        {editing ? (
                          <select
                            id="gender"
                            className={styles.fieldInput}
                            value={form.gender}
                            onChange={e => updateForm('gender', e.target.value)}
                          >
                            <option value="">Chọn giới tính</option>
                            {GENDER_OPTIONS.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        ) : (
                          <div className={styles.fieldValue}>{GENDER_MAP[profile?.gender ?? ''] || 'Chưa cập nhật'}</div>
                        )}
                      </div>

                      <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                        <label className={styles.fieldLabel} htmlFor="address">Địa chỉ</label>
                        {editing ? (
                          <input
                            id="address"
                            className={styles.fieldInput}
                            value={form.address}
                            onChange={e => updateForm('address', e.target.value)}
                            placeholder="Nhập địa chỉ"
                          />
                        ) : (
                          <div className={styles.fieldValue}>{profile?.address || 'Chưa cập nhật'}</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

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
                        <h3 className={styles.cardTitle}>Bảo mật tài khoản</h3>
                        <p className={styles.cardSubtitle}>Cập nhật mật khẩu để bảo vệ tài khoản của bạn.</p>
                      </div>
                    </div>

                    {pwError && (
                      <div className={styles.errorBanner}>
                        <AlertCircle size={18} /> {pwError}
                      </div>
                    )}

                    <div className={styles.pwForm}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel} htmlFor="currentPassword">Mật khẩu hiện tại</label>
                        <input
                          id="currentPassword"
                          type="password"
                          className={styles.fieldInput}
                          value={pwForm.currentPassword}
                          onChange={e => setPwForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          placeholder="Nhập mật khẩu hiện tại"
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel} htmlFor="newPassword">Mật khẩu mới</label>
                        <input
                          id="newPassword"
                          type="password"
                          className={styles.fieldInput}
                          value={pwForm.newPassword}
                          onChange={e => setPwForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="Nhập mật khẩu mới"
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel} htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                        <input
                          id="confirmPassword"
                          type="password"
                          className={styles.fieldInput}
                          value={pwForm.confirmPassword}
                          onChange={e => setPwForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Xác nhận mật khẩu mới"
                        />
                      </div>
                      <button
                        className={styles.saveBtn}
                        onClick={handleChangePassword}
                        disabled={pwSaving}
                      >
                        <Save size={14} /> {pwSaving ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'history' && (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className={styles.contentCard}
                  >
                    <div className={styles.cardHeader}>
                      <div>
                        <h3 className={styles.cardTitle}>Lịch sử khám</h3>
                        <p className={styles.cardSubtitle}>Xem lại hồ sơ bệnh án và các chẩn đoán gần đây.</p>
                      </div>
                    </div>

                    {historyLoading ? (
                      <div className={styles.historyLoading}>
                        <Loader2 size={28} className={styles.spinner} />
                        <p>Đang tải lịch sử khám...</p>
                      </div>
                    ) : medicalHistory.length === 0 ? (
                      <div className={styles.emptyHistory}>
                        <FileText size={36} />
                        <p>Hiện chưa có hồ sơ khám nào.</p>
                      </div>
                    ) : (
                      <div className={styles.historyList}>
                        {medicalHistory.map(record => (
                          <article key={record.id} className={styles.historyItem}>
                            <div className={styles.historyHeader}>
                              <div className={styles.historyDate}>
                                <Calendar size={16} /> {record.createdAt ? new Date(record.createdAt).toLocaleDateString('vi-VN') : 'Ngày chưa xác định'}
                              </div>
                              <div className={styles.historyDoctor}>
                                <UserRound size={16} /> Bác sĩ: {record.doctorId || 'Chưa có thông tin'}
                              </div>
                            </div>
                            <div className={styles.historyBody}>
                              <div className={styles.historySection}>
                                <span className={styles.historyLabel}>Chẩn đoán</span>
                                <p className={styles.diagnosisText}>{record.diagnosis || 'Chưa có'}</p>
                              </div>
                              <div className={styles.historySection}>
                                <span className={styles.historyLabel}>Triệu chứng</span>
                                <p className={styles.historyText}>{record.symptoms || 'Không có dữ liệu'}</p>
                              </div>
                              <div className={styles.historySection}>
                                <span className={styles.historyLabel}>Phác đồ điều trị</span>
                                <p className={styles.historyText}>{record.treatment || 'Không có dữ liệu'}</p>
                              </div>
                              {record.notes && (
                                <div className={styles.historySection}>
                                  <span className={styles.historyLabel}>Ghi chú</span>
                                  <p className={styles.historyText}>{record.notes}</p>
                                </div>
                              )}
                              {record.followUpDate && (
                                <div className={styles.historySection}>
                                  <span className={styles.historyLabel}>Ngày tái khám</span>
                                  <p className={styles.historyText}>{new Date(record.followUpDate).toLocaleDateString('vi-VN')}</p>
                                </div>
                              )}
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientProfilePage;