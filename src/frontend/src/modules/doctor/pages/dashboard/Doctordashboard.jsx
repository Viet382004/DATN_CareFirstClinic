import React, { useState } from 'react';
import styles from './DoctorDashboard.module.css';
import {
  LayoutDashboard, Calendar, Users, FileText, Bell, Settings,
  Search, Filter, Clock, MapPin, Phone, Star,
  TrendingUp, TrendingDown, CheckCircle2, XCircle, LogOut,
  Stethoscope, Activity, Eye, Edit2, Plus, Download,
  RefreshCw, User, Shield,
} from 'lucide-react';

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────
const DOCTOR = {
  name:      'BSCKII. Nguyễn Văn A',
  specialty: 'Tim mạch · Nội tổng quát',
  avatar:    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face',
  room:      'Phòng 201 · Tầng 2',
};

const STATS = [
  { label: 'Lịch hẹn hôm nay', value: 12,    sub: '+2 so với hôm qua', trend: 'up',      icon: Calendar,     color: '#0a7e8c', bg: '#f0fbfd' },
  { label: 'Bệnh nhân chờ',    value: 4,     sub: 'Cần xử lý ngay',    trend: 'neutral', icon: Users,        color: '#f59e0b', bg: '#fffbeb' },
  { label: 'Đã khám hôm nay',  value: 8,     sub: '67% hoàn thành',    trend: 'up',      icon: CheckCircle2, color: '#22c55e', bg: '#f0fdf4' },
  { label: 'Đánh giá TB',      value: '4.9', sub: 'Từ 120 đánh giá',   trend: 'up',      icon: Star,         color: '#8b5cf6', bg: '#faf5ff' },
];

const APPOINTMENTS = [
  { id: 'CF-001', time: '07:30', duration: 30, patient: 'Trần Thị Mai',   age: 42, gender: 'Nữ',  phone: '0912 345 678', reason: 'Đau ngực, khó thở',       status: 'waiting',     avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face' },
  { id: 'CF-002', time: '08:00', duration: 30, patient: 'Lê Văn Hùng',    age: 58, gender: 'Nam', phone: '0908 765 432', reason: 'Tái khám huyết áp cao',    status: 'in-progress', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face' },
  { id: 'CF-003', time: '08:30', duration: 30, patient: 'Phạm Thị Lan',   age: 35, gender: 'Nữ',  phone: '0937 111 222', reason: 'Kiểm tra tim định kỳ',     status: 'done',        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face' },
  { id: 'CF-004', time: '09:00', duration: 30, patient: 'Nguyễn Minh Tú', age: 67, gender: 'Nam', phone: '0901 234 567', reason: 'Suy tim độ II',             status: 'done',        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face' },
  { id: 'CF-005', time: '09:30', duration: 30, patient: 'Võ Thị Hoa',     age: 29, gender: 'Nữ',  phone: '0977 888 999', reason: 'Hồi hộp, tim đập nhanh',   status: 'upcoming',    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=60&h=60&fit=crop&crop=face' },
  { id: 'CF-006', time: '10:00', duration: 30, patient: 'Đinh Quốc Bảo',  age: 51, gender: 'Nam', phone: '0963 000 111', reason: 'Rối loạn nhịp tim',         status: 'upcoming',    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop&crop=face' },
  { id: 'CF-007', time: '10:30', duration: 30, patient: 'Bùi Thị Ngọc',   age: 44, gender: 'Nữ',  phone: '0919 222 333', reason: 'Tái khám sau phẫu thuật',  status: 'upcoming',    avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=60&h=60&fit=crop&crop=face' },
  { id: 'CF-008', time: '11:00', duration: 30, patient: 'Hoàng Văn Nam',  age: 73, gender: 'Nam', phone: '0888 444 555', reason: 'Xơ vữa động mạch',         status: 'cancelled',   avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=60&h=60&fit=crop&crop=face' },
];

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Tổng quan', id: 'dashboard'               },
  { icon: Calendar,        label: 'Lịch hẹn',  id: 'appointments', badge: 4  },
  { icon: Users,           label: 'Bệnh nhân', id: 'patients'                },
  { icon: FileText,        label: 'Hồ sơ',     id: 'records',      badge: 2  },
  { icon: Activity,        label: 'Thống kê',  id: 'stats'                   },
  { icon: Settings,        label: 'Cài đặt',   id: 'settings'                },
];

const STATUS_CONFIG = {
  'waiting':     { label: 'Đang chờ',  color: '#f59e0b', bg: '#fffbeb', border: '#fcd34d' },
  'in-progress': { label: 'Đang khám', color: '#0a7e8c', bg: '#f0fbfd', border: '#cef0f4' },
  'done':        { label: 'Hoàn tất',  color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0' },
  'upcoming':    { label: 'Sắp tới',   color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' },
  'cancelled':   { label: 'Đã huỷ',    color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0' },
};

const TABS = [
  { id: 'all',       label: 'Tất cả'     },
  { id: 'pending',   label: 'Đang xử lý' },
  { id: 'done',      label: 'Hoàn tất'   },
  { id: 'cancelled', label: 'Đã huỷ'     },
];

// ─────────────────────────────────────────────
// SUB-COMPONENT: Progress Ring
// ─────────────────────────────────────────────
const ProgressRing = ({ value, max, size = 56, stroke = 5, color = '#0a7e8c' }) => {
  const r      = (size - stroke * 2) / 2;
  const circ   = 2 * Math.PI * r;
  const pct    = Math.round((value / max) * 100);
  const offset = circ - (pct / 100) * circ;

  return (
    <div className={styles.progressRingWrap} style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} stroke="#f1f5f9" strokeWidth={stroke} fill="none" />
        <circle
          cx={size/2} cy={size/2} r={r}
          stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset .6s ease' }}
        />
      </svg>
      <div className={styles.progressLabel}>{pct}%</div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function DoctorDashboard() {
  const [activeNav,    setActiveNav]    = useState('dashboard');
  const [activeTab,    setActiveTab]    = useState('all');
  const [selectedAppt, setSelectedAppt] = useState(APPOINTMENTS[1]);
  const [searchQ,      setSearchQ]      = useState('');

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  });

  const filtered = APPOINTMENTS.filter(a => {
    const matchTab =
      activeTab === 'all'       ? true :
      activeTab === 'pending'   ? (a.status === 'waiting' || a.status === 'in-progress') :
      activeTab === 'done'      ? a.status === 'done' :
                                  a.status === 'cancelled';
    const q = searchQ.toLowerCase();
    return matchTab && (a.patient.toLowerCase().includes(q) || a.reason.toLowerCase().includes(q));
  });

  const counts = {
    all:       APPOINTMENTS.length,
    pending:   APPOINTMENTS.filter(a => a.status === 'waiting' || a.status === 'in-progress').length,
    done:      APPOINTMENTS.filter(a => a.status === 'done').length,
    cancelled: APPOINTMENTS.filter(a => a.status === 'cancelled').length,
  };

  const doneCount      = counts.done;
  const pendingCount   = counts.pending;
  const cancelledCount = counts.cancelled;

  return (
    <div className={styles.shell}>

      {/* ══ SIDEBAR ══ */}
      <aside className={styles.sidebar}>

        <div className={styles.sidebarBrand}>
          <div className={styles.brandIcon}><Shield size={14} /></div>
          <div>
            <div className={styles.brandText}>CareFirst</div>
            <div className={styles.brandSub}>Doctor Portal</div>
          </div>
        </div>

        <div className={styles.sidebarDoctor}>
          <img src={DOCTOR.avatar} alt={DOCTOR.name} className={styles.doctorAvatar} />
          <div>
            <div className={styles.doctorName}>{DOCTOR.name}</div>
            <div className={styles.doctorSpec}>{DOCTOR.specialty}</div>
            <div className={styles.doctorRoom}><MapPin size={9} />{DOCTOR.room}</div>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activeNav === item.id ? styles.active : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <item.icon size={16} />
              {item.label}
              {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn}><LogOut size={15} />Đăng xuất</button>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <div className={styles.mainWrap}>

        {/* TOPBAR */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <div>
              <div className={styles.pageTitle}>Tổng quan hôm nay</div>
              <div className={styles.pageDate}>{today}</div>
            </div>
          </div>
          <div className={styles.topbarRight}>
            <div className={styles.topbarSearch}>
              <Search size={13} color="#94a3b8" />
              <input
                placeholder="Tìm bệnh nhân, mã lịch…"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
              />
            </div>
            <button className={styles.iconBtn}><RefreshCw size={14} /></button>
            <button className={styles.iconBtn}>
              <Bell size={14} />
              <div className={styles.notifDot} />
            </button>
            <button className={styles.iconBtn}><Download size={14} /></button>
          </div>
        </header>

        {/* CONTENT */}
        <div className={styles.content}>

          {/* STATS */}
          <div className={styles.statsGrid}>
            {STATS.map((s, i) => (
              <div className={styles.statCard} key={i}>
                <div className={styles.statTop}>
                  <div className={styles.statIconWrap} style={{ background: s.bg }}>
                    <s.icon size={16} color={s.color} />
                  </div>
                  {s.trend === 'up' && (
                    <div className={`${styles.statTrend} ${styles.trendUp}`}>
                      <TrendingUp size={12} />{i === 3 ? '+0.2' : '+2'}
                    </div>
                  )}
                </div>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
                <div className={styles.statSub}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* MAIN GRID */}
          <div className={styles.mainGrid}>

            {/* LEFT: Appointment List */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <div className={styles.panelTitle}>Danh sách lịch hẹn</div>
                  <div className={styles.panelSub}>Thứ Hai, 09/06/2025 · {APPOINTMENTS.length} lịch</div>
                </div>
                <div className={styles.panelActions}>
                  <button className={styles.filterBtn}><Plus size={13} />Thêm lịch</button>
                  <button className={styles.filterBtn}><Filter size={12} />Lọc</button>
                </div>
              </div>

              <div className={styles.statusTabs}>
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    className={`${styles.statusTab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                    <span className={styles.tabCount}>{counts[tab.id]}</span>
                  </button>
                ))}
              </div>

              <div className={styles.apptList}>
                {filtered.length === 0 ? (
                  <div className={styles.empty}>
                    <Users size={28} />
                    <div className={styles.emptyTitle}>Không có lịch hẹn</div>
                    <div className={styles.emptySub}>Thử tìm kiếm với từ khóa khác</div>
                  </div>
                ) : filtered.map(appt => {
                  const sc = STATUS_CONFIG[appt.status];
                  const isSelected = selectedAppt?.id === appt.id;
                  return (
                    <div
                      key={appt.id}
                      className={[
                        styles.apptItem,
                        isSelected ? styles.apptSelected : '',
                        appt.status === 'cancelled' ? styles.apptCancelled : '',
                      ].join(' ')}
                      onClick={() => setSelectedAppt(appt)}
                    >
                      <div className={styles.apptTimeCol}>
                        <div className={styles.apptTime}>{appt.time}</div>
                        <div className={styles.apptDur}>{appt.duration}'</div>
                      </div>
                      <img src={appt.avatar} alt={appt.patient} className={styles.apptAvatar} />
                      <div className={styles.apptInfo}>
                        <div className={styles.apptName}>{appt.patient}</div>
                        <div className={styles.apptMeta}>{appt.age} tuổi · {appt.gender} · {appt.id}</div>
                        <div className={styles.apptReason}>{appt.reason}</div>
                      </div>
                      <div
                        className={styles.apptStatusBadge}
                        style={{ color: sc.color, background: sc.bg, borderColor: sc.border }}
                      >
                        {sc.label}
                      </div>
                      <div className={styles.apptActions} onClick={e => e.stopPropagation()}>
                        <button className={styles.apptActionBtn}><Eye size={12} /></button>
                        <button className={styles.apptActionBtn}><Edit2 size={12} /></button>
                        <button className={`${styles.apptActionBtn} ${styles.danger}`}><XCircle size={12} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COL */}
            <div className={styles.rightCol}>

              {/* Progress */}
              <div className={styles.miniPanel}>
                <div className={styles.miniHeader}>
                  <div className={styles.miniTitle}>Tiến độ hôm nay</div>
                  <Activity size={14} color="#0a7e8c" />
                </div>
                <div className={styles.progressSection}>
                  <div className={styles.progressRow}>
                    <ProgressRing value={doneCount} max={APPOINTMENTS.length} />
                    <div className={styles.progressText}>
                      <div className={styles.progressPctLabel}>{doneCount}/{APPOINTMENTS.length} lịch hẹn</div>
                      <div className={styles.progressPctSub}>Còn {APPOINTMENTS.length - doneCount} lịch chưa xử lý</div>
                    </div>
                  </div>
                  {[
                    { label: 'Hoàn tất',   value: doneCount,      color: '#22c55e' },
                    { label: 'Đang xử lý', value: pendingCount,   color: '#0a7e8c' },
                    { label: 'Đã huỷ',     value: cancelledCount, color: '#94a3b8' },
                  ].map(bar => (
                    <div className={styles.progressBarRow} key={bar.label}>
                      <div className={styles.progressBarLabel}>{bar.label}</div>
                      <div className={styles.progressBarTrack}>
                        <div
                          className={styles.progressBarFill}
                          style={{ width: `${(bar.value / APPOINTMENTS.length) * 100}%`, background: bar.color }}
                        />
                      </div>
                      <div className={styles.progressBarVal}>{bar.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Patient Detail */}
              {selectedAppt ? (
                <div className={styles.miniPanel}>
                  <div className={styles.miniHeader}>
                    <div className={styles.miniTitle}>Chi tiết bệnh nhân</div>
                    <span style={{ fontSize: '.65rem', color: '#0a7e8c', fontWeight: 700 }}>{selectedAppt.id}</span>
                  </div>
                  <div className={styles.patientDetail}>
                    <img src={selectedAppt.avatar} alt={selectedAppt.patient} className={styles.patientAvatarLg} />
                    <div className={styles.patientNameLg}>{selectedAppt.patient}</div>
                    <div className={styles.patientMetaLg}>{selectedAppt.age} tuổi · {selectedAppt.gender}</div>
                    <div className={styles.patientInfoRow}><Phone size={12} />{selectedAppt.phone}</div>
                    <div className={styles.patientInfoRow}><Clock size={12} />{selectedAppt.time} · {selectedAppt.duration} phút</div>
                    <div className={styles.reasonLabel}>Lý do khám</div>
                    <div className={styles.detailReason}>{selectedAppt.reason}</div>
                    <div className={styles.detailActions}>
                      <button className={`${styles.detailBtn} ${styles.primary}`}><Stethoscope size={14} />Bắt đầu khám</button>
                      <button className={`${styles.detailBtn} ${styles.outline}`}><FileText size={14} />Xem hồ sơ</button>
                      <button className={`${styles.detailBtn} ${styles.outline}`}><Phone size={14} />Liên hệ</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.miniPanel}>
                  <div className={styles.empty} style={{ padding: '2rem 1rem' }}>
                    <User size={24} />
                    <div className={styles.emptyTitle}>Chọn lịch hẹn</div>
                    <div className={styles.emptySub}>để xem chi tiết bệnh nhân</div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className={styles.miniPanel}>
                <div className={styles.miniHeader}>
                  <div className={styles.miniTitle}>Lịch trình buổi sáng</div>
                  <Clock size={13} color="#94a3b8" />
                </div>
                <div className={styles.timeline}>
                  {APPOINTMENTS.slice(0, 6).map(a => {
                    const sc = STATUS_CONFIG[a.status];
                    return (
                      <div
                        key={a.id}
                        className={styles.timelineItem}
                        style={{ background: selectedAppt?.id === a.id ? 'var(--primary-soft)' : '' }}
                        onClick={() => setSelectedAppt(a)}
                      >
                        <div className={styles.timelineDot} style={{ background: sc.color }} />
                        <div className={styles.timelineTime}>{a.time}</div>
                        <div className={styles.timelineName}>{a.patient}</div>
                        <div className={styles.timelineBadge} style={{ background: sc.bg, color: sc.color }}>
                          {sc.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}