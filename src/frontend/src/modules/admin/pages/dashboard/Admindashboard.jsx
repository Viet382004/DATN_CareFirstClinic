import React, { useState } from 'react';
import styles from './AdminDashboard.module.css';
import {
  LayoutDashboard, Users, Calendar, FileText, Settings, Bell,
  Search, Filter, TrendingUp, TrendingDown, DollarSign,
  Stethoscope, Star, Eye, Edit2, Trash2, Plus, Download,
  RefreshCw, Shield, LogOut, Activity, UserCheck, AlertCircle,
  CheckCircle2, Clock, MapPin, ChevronRight, BarChart2,
  UserPlus, ClipboardList, Database, Zap, Lock, HelpCircle,
} from 'lucide-react';

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────
const ADMIN = {
  name:   'Nguyễn Quản Trị',
  role:   'Super Admin',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
};

const KPIS = [
  { label: 'Tổng bệnh nhân',   value: '12,480', sub: '+340 tháng này',   trend: 'up',   pct: '+2.8%', icon: Users,       color: '#0a7e8c', bg: '#f0fbfd', variant: 'colorTeal'   },
  { label: 'Lịch hẹn tháng',   value: '3,241',  sub: '+18% so tháng trước', trend: 'up', pct: '+18%',icon: Calendar,    color: '#22c55e', bg: '#f0fdf4', variant: 'colorGreen'  },
  { label: 'Doanh thu (tr.đ)', value: '842',    sub: '+12% so tháng trước', trend: 'up', pct: '+12%',icon: DollarSign,  color: '#f59e0b', bg: '#fffbeb', variant: 'colorAmber'  },
  { label: 'Tổng bác sĩ',      value: '48',     sub: '3 mới tháng này',   trend: 'up',   pct: '+3',   icon: Stethoscope, color: '#8b5cf6', bg: '#faf5ff', variant: 'colorPurple' },
];

const DOCTORS = [
  { id: 'BS-001', name: 'BSCKII. Nguyễn Văn A', specialty: 'Tim mạch',      patients: 1240, rating: 4.9, appts: 12, status: 'active',   avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=60&h=60&fit=crop&crop=face' },
  { id: 'BS-002', name: 'ThS.BS. Trần Thị Bình', specialty: 'Nhi khoa',      patients: 980,  rating: 4.8, appts: 9,  status: 'active',   avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=60&h=60&fit=crop&crop=face' },
  { id: 'BS-003', name: 'BS. Lê Minh Cường',      specialty: 'Thần kinh',     patients: 760,  rating: 4.7, appts: 8,  status: 'active',   avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=60&h=60&fit=crop&crop=face' },
  { id: 'BS-004', name: 'BSCK1. Phạm Thị Dung',   specialty: 'Da liễu',       patients: 1120, rating: 4.9, appts: 14, status: 'active',   avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=60&h=60&fit=crop&crop=face' },
  { id: 'BS-005', name: 'ThS.BS. Võ Quốc Hùng',   specialty: 'Cơ xương khớp', patients: 620,  rating: 4.6, appts: 0,  status: 'leave',    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=60&h=60&fit=crop&crop=face' },
  { id: 'BS-006', name: 'BS. Đinh Thị Hoa',         specialty: 'Sản phụ khoa',  patients: 890,  rating: 4.8, appts: 11, status: 'active',   avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=60&h=60&fit=crop&crop=face' },
  { id: 'BS-007', name: 'BSCKII. Hoàng Văn Đức',   specialty: 'Tiêu hoá',      patients: 540,  rating: 4.5, appts: 0,  status: 'inactive', avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=60&h=60&fit=crop&crop=face' },
];

const RECENT_APPTS = [
  { time: '08:00', patient: 'Trần Thị Mai',    doctor: 'BS. Nguyễn Văn A', status: 'in-progress', color: '#0a7e8c' },
  { time: '08:30', patient: 'Lê Văn Hùng',     doctor: 'BS. Phạm Thị Dung', status: 'waiting',    color: '#f59e0b' },
  { time: '09:00', patient: 'Phạm Thị Lan',    doctor: 'BS. Trần Thị Bình', status: 'waiting',    color: '#f59e0b' },
  { time: '09:30', patient: 'Nguyễn Minh Tú',  doctor: 'BS. Đinh Thị Hoa',  status: 'upcoming',   color: '#6366f1' },
  { time: '10:00', patient: 'Võ Thị Hoa',      doctor: 'BS. Lê Minh Cường', status: 'upcoming',   color: '#6366f1' },
];

const ACTIVITIES = [
  { icon: UserPlus,      iconColor: '#0a7e8c', iconBg: '#f0fbfd', msg: 'Bác sĩ mới ThS.BS. Nguyễn Lan Anh vừa được thêm vào hệ thống',        time: '5 phút trước'   },
  { icon: Calendar,      iconColor: '#22c55e', iconBg: '#f0fdf4', msg: '340 lịch hẹn đã được xác nhận cho tuần tới',                          time: '20 phút trước'  },
  { icon: AlertCircle,   iconColor: '#f59e0b', iconBg: '#fffbeb', msg: 'Phòng khám 305 báo cáo sự cố thiết bị siêu âm cần bảo trì',           time: '1 giờ trước'    },
  { icon: CheckCircle2,  iconColor: '#22c55e', iconBg: '#f0fdf4', msg: 'Hệ thống backup dữ liệu hoàn tất — 12,480 hồ sơ đã được lưu trữ',    time: '2 giờ trước'    },
  { icon: DollarSign,    iconColor: '#8b5cf6', iconBg: '#faf5ff', msg: 'Báo cáo doanh thu tháng 5/2025 đã được xuất thành công',              time: '3 giờ trước'    },
];

const SPECIALTIES = [
  { name: 'Tim mạch',      pct: 22, color: '#0a7e8c' },
  { name: 'Nhi khoa',      pct: 18, color: '#22c55e' },
  { name: 'Da liễu',       pct: 15, color: '#f59e0b' },
  { name: 'Sản phụ khoa',  pct: 14, color: '#8b5cf6' },
  { name: 'Thần kinh',     pct: 11, color: '#6366f1' },
  { name: 'Khác',          pct: 20, color: '#94a3b8' },
];

const REVENUE_DATA = [
  { month: 'T1', clinic: 60, online: 30 },
  { month: 'T2', clinic: 72, online: 38 },
  { month: 'T3', clinic: 65, online: 42 },
  { month: 'T4', clinic: 80, online: 50 },
  { month: 'T5', clinic: 90, online: 55 },
  { month: 'T6', clinic: 85, online: 60 },
];

const QUICK_ACTIONS = [
  { icon: UserPlus,     label: 'Thêm bác sĩ',      color: '#0a7e8c', bg: '#f0fbfd' },
  { icon: ClipboardList,label: 'Tạo báo cáo',       color: '#22c55e', bg: '#f0fdf4' },
  { icon: Calendar,     label: 'Quản lý lịch',      color: '#f59e0b', bg: '#fffbeb' },
  { icon: Database,     label: 'Backup dữ liệu',    color: '#8b5cf6', bg: '#faf5ff' },
  { icon: Lock,         label: 'Phân quyền',         color: '#6366f1', bg: '#eef2ff' },
  { icon: Download,     label: 'Xuất báo cáo',       color: '#94a3b8', bg: '#f8fafc' },
];

const SYSTEM_STATUS = [
  { name: 'API Server',       status: 'online',  label: 'Hoạt động' },
  { name: 'Database',         status: 'online',  label: 'Hoạt động' },
  { name: 'Backup Service',   status: 'online',  label: 'Hoạt động' },
  { name: 'Email Gateway',    status: 'warning', label: 'Chậm (420ms)' },
  { name: 'Payment Gateway',  status: 'online',  label: 'Hoạt động' },
  { name: 'SMS Service',      status: 'offline', label: 'Lỗi kết nối' },
];

const NAV = [
  {
    section: 'Tổng quan',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard',    id: 'dashboard' },
      { icon: BarChart2,       label: 'Thống kê',     id: 'analytics' },
    ],
  },
  {
    section: 'Quản lý',
    items: [
      { icon: Stethoscope, label: 'Bác sĩ',       id: 'doctors',      badge: 3  },
      { icon: Users,       label: 'Bệnh nhân',    id: 'patients'               },
      { icon: Calendar,    label: 'Lịch hẹn',     id: 'appointments', badge: 12 },
      { icon: FileText,    label: 'Hồ sơ',        id: 'records'                },
      { icon: DollarSign,  label: 'Doanh thu',    id: 'revenue'                },
    ],
  },
  {
    section: 'Hệ thống',
    items: [
      { icon: UserCheck,  label: 'Phân quyền', id: 'roles'    },
      { icon: Database,   label: 'Dữ liệu',    id: 'database' },
      { icon: Activity,   label: 'Nhật ký',    id: 'logs'     },
      { icon: Settings,   label: 'Cài đặt',    id: 'settings' },
    ],
  },
];

const STATUS_MAP = {
  active:   { label: 'Hoạt động', cls: 'badgeActive'   },
  inactive: { label: 'Tạm ngưng', cls: 'badgeInactive' },
  leave:    { label: 'Nghỉ phép', cls: 'badgeLeave'    },
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [searchQ,   setSearchQ]   = useState('');

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  });

  const filteredDoctors = DOCTORS.filter(d =>
    d.name.toLowerCase().includes(searchQ.toLowerCase()) ||
    d.specialty.toLowerCase().includes(searchQ.toLowerCase())
  );

  const maxRevenue = Math.max(...REVENUE_DATA.map(d => d.clinic + d.online));

  return (
    <div className={styles.shell}>

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside className={styles.sidebar}>

        {/* Brand */}
        <div className={styles.sidebarBrand}>
          <div className={styles.brandIcon}><Shield size={15} /></div>
          <div>
            <div className={styles.brandText}>CareFirst</div>
            <div className={styles.brandSub}>Admin Portal</div>
          </div>
          <div className={styles.brandBadge}>ADMIN</div>
        </div>

        {/* Admin Info */}
        <div className={styles.sidebarAdmin}>
          <img src={ADMIN.avatar} alt={ADMIN.name} className={styles.adminAvatar} />
          <div>
            <div className={styles.adminName}>{ADMIN.name}</div>
            <div className={styles.adminRole}><Shield size={9} />{ADMIN.role}</div>
          </div>
        </div>

        {/* Nav Groups */}
        <nav className={styles.sidebarNav}>
          {NAV.map((group, gi) => (
            <React.Fragment key={gi}>
              {gi > 0 && <div className={styles.navDivider} />}
              <div className={styles.sidebarSection}>{group.section}</div>
              {group.items.map(item => (
                <button
                  key={item.id}
                  className={`${styles.navItem} ${activeNav === item.id ? styles.active : ''}`}
                  onClick={() => setActiveNav(item.id)}
                >
                  <item.icon size={15} />
                  {item.label}
                  {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
                </button>
              ))}
            </React.Fragment>
          ))}
        </nav>

        {/* Footer */}
        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn}><LogOut size={15} />Đăng xuất</button>
        </div>
      </aside>

      {/* ══════════════ MAIN ══════════════ */}
      <div className={styles.mainWrap}>

        {/* TOPBAR */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <div>
              <div className={styles.pageTitle}>Bảng điều khiển</div>
              <div className={styles.pageDate}>{today}</div>
            </div>
          </div>
          <div className={styles.topbarRight}>
            <div className={styles.topbarSearch}>
              <Search size={13} color="#94a3b8" />
              <input
                placeholder="Tìm bác sĩ, bệnh nhân, mã..."
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
            <button className={styles.topbarUser}>
              <img src={ADMIN.avatar} alt="" className={styles.topbarUserAvatar} />
              <span className={styles.topbarUserName}>{ADMIN.name}</span>
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <div className={styles.content}>

          {/* KPI GRID */}
          <div className={styles.sectionTitle}>Tổng quan hệ thống</div>
          <div className={styles.kpiGrid}>
            {KPIS.map((k, i) => (
              <div className={`${styles.kpiCard} ${styles[k.variant]}`} key={i}>
                <div className={styles.kpiTop}>
                  <div className={styles.kpiIconWrap} style={{ background: k.bg }}>
                    <k.icon size={18} color={k.color} />
                  </div>
                  <div className={`${styles.kpiTrend} ${k.trend === 'up' ? styles.trendUp : styles.trendDown}`}>
                    {k.trend === 'up' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    {k.pct}
                  </div>
                </div>
                <div className={styles.kpiValue}>{k.value}</div>
                <div className={styles.kpiLabel}>{k.label}</div>
                <div className={styles.kpiSub}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* MAIN GRID */}
          <div className={styles.mainGrid}>

            {/* LEFT: DOCTOR TABLE */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <div className={styles.panelTitle}>Danh sách bác sĩ</div>
                  <div className={styles.panelSub}>{filteredDoctors.length} bác sĩ · cập nhật vừa xong</div>
                </div>
                <div className={styles.panelActions}>
                  <button className={styles.btnOutline}><Filter size={12} />Lọc</button>
                  <button className={styles.btnOutline}><Download size={12} />Xuất</button>
                  <button className={styles.btnPrimary}><Plus size={13} />Thêm bác sĩ</button>
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Bác sĩ</th>
                      <th>Chuyên khoa</th>
                      <th>Bệnh nhân</th>
                      <th>Đánh giá</th>
                      <th>Lịch hôm nay</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDoctors.map(doc => {
                      const s = STATUS_MAP[doc.status];
                      return (
                        <tr key={doc.id}>
                          <td>
                            <div className={styles.doctorCell}>
                              <img src={doc.avatar} alt={doc.name} className={styles.doctorThumb} />
                              <div>
                                <div className={styles.doctorName}>{doc.name}</div>
                                <div className={styles.doctorSpec}>{doc.id}</div>
                              </div>
                            </div>
                          </td>
                          <td>{doc.specialty}</td>
                          <td>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>
                              {doc.patients.toLocaleString()}
                            </span>
                          </td>
                          <td>
                            <div className={styles.starRow}>
                              <Star size={13} fill="#f59e0b" color="#f59e0b" />
                              {doc.rating}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: doc.appts > 0 ? '#0a7e8c' : '#94a3b8' }}>
                              {doc.appts > 0 ? `${doc.appts} lịch` : '—'}
                            </span>
                          </td>
                          <td>
                            <span className={`${styles.badge} ${styles[s.cls]}`}>{s.label}</span>
                          </td>
                          <td>
                            <div className={styles.actionGroup}>
                              <button className={styles.actionBtn}><Eye size={12} /></button>
                              <button className={styles.actionBtn}><Edit2 size={12} /></button>
                              <button className={`${styles.actionBtn} ${styles.danger}`}><Trash2 size={12} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT COL */}
            <div className={styles.rightCol}>

              {/* Revenue Chart */}
              <div className={styles.miniPanel}>
                <div className={styles.miniHeader}>
                  <div className={styles.miniTitle}>Doanh thu 6 tháng (tr.đ)</div>
                  <BarChart2 size={14} color="#0a7e8c" />
                </div>
                <div className={styles.revenueChart}>
                  <div className={styles.chartLegend}>
                    <div className={styles.legendItem}>
                      <div className={styles.legendDot} style={{ background: '#0a7e8c' }} />
                      Tại phòng khám
                    </div>
                    <div className={styles.legendItem}>
                      <div className={styles.legendDot} style={{ background: '#cef0f4' }} />
                      Trực tuyến
                    </div>
                  </div>
                  <div className={styles.barChart}>
                    {REVENUE_DATA.map((d, i) => {
                      const total = d.clinic + d.online;
                      const h = (total / maxRevenue) * 100;
                      const hClinic = (d.clinic / total) * h;
                      const hOnline = (d.online / total) * h;
                      return (
                        <div className={styles.barGroup} key={i}>
                          <div className={styles.barPair}>
                            <div
                              className={styles.bar}
                              style={{ height: hClinic, background: '#0a7e8c' }}
                              title={`Tại phòng: ${d.clinic}tr`}
                            />
                            <div
                              className={styles.bar}
                              style={{ height: hOnline, background: '#cef0f4' }}
                              title={`Trực tuyến: ${d.online}tr`}
                            />
                          </div>
                          <div className={styles.barLabel}>{d.month}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recent Appointments */}
              <div className={styles.miniPanel}>
                <div className={styles.miniHeader}>
                  <div className={styles.miniTitle}>Lịch hẹn hôm nay</div>
                  <span style={{ fontSize: '.68rem', fontWeight: 700, color: '#0a7e8c' }}>Xem tất cả →</span>
                </div>
                <div className={styles.apptSummaryList}>
                  {RECENT_APPTS.map((a, i) => (
                    <div className={styles.apptSummaryItem} key={i}>
                      <div className={styles.apptDot} style={{ background: a.color }} />
                      <div className={styles.apptTime}>{a.time}</div>
                      <div>
                        <div className={styles.apptPatient}>{a.patient}</div>
                        <div className={styles.apptDoctorName}>{a.doctor}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* BOTTOM GRID */}
          <div className={styles.bottomGrid}>

            {/* Specialty Distribution */}
            <div className={styles.miniPanel}>
              <div className={styles.miniHeader}>
                <div className={styles.miniTitle}>Phân bổ chuyên khoa</div>
                <Activity size={13} color="#94a3b8" />
              </div>
              <div className={styles.specialtyList}>
                {SPECIALTIES.map((s, i) => (
                  <div className={styles.specialtyItem} key={i}>
                    <div className={styles.specialtyLabel}>{s.name}</div>
                    <div className={styles.specialtyBar}>
                      <div
                        className={styles.specialtyFill}
                        style={{ width: `${s.pct}%`, background: s.color }}
                      />
                    </div>
                    <div className={styles.specialtyPct}>{s.pct}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.miniPanel}>
              <div className={styles.miniHeader}>
                <div className={styles.miniTitle}>Thao tác nhanh</div>
                <Zap size={13} color="#f59e0b" />
              </div>
              <div className={styles.quickActions}>
                {QUICK_ACTIONS.map((qa, i) => (
                  <button className={styles.quickAction} key={i}>
                    <div className={styles.quickActionIcon} style={{ background: qa.bg }}>
                      <qa.icon size={15} color={qa.color} />
                    </div>
                    {qa.label}
                  </button>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className={styles.miniPanel}>
              <div className={styles.miniHeader}>
                <div className={styles.miniTitle}>Trạng thái hệ thống</div>
                <div style={{ width: '.45rem', height: '.45rem', borderRadius: '50%', background: '#22c55e' }} />
              </div>
              <div className={styles.statusList}>
                {SYSTEM_STATUS.map((s, i) => (
                  <div className={styles.statusRow} key={i}>
                    <div className={styles.statusName}>{s.name}</div>
                    <div className={styles.statusIndicator}>
                      <div className={
                        s.status === 'online'  ? styles.dotOnline  :
                        s.status === 'warning' ? styles.dotWarning :
                                                  styles.dotOffline
                      } />
                      <span style={{
                        fontSize: '.7rem', fontWeight: 700,
                        color: s.status === 'online' ? '#22c55e' : s.status === 'warning' ? '#d97706' : '#ef4444',
                      }}>
                        {s.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RECENT ACTIVITY */}
          <div style={{ marginTop: '1rem' }}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <div className={styles.panelTitle}>Hoạt động gần đây</div>
                  <div className={styles.panelSub}>Nhật ký sự kiện hệ thống · hôm nay</div>
                </div>
                <button className={styles.btnOutline}><ChevronRight size={13} />Xem nhật ký đầy đủ</button>
              </div>
              <div className={styles.activityList}>
                {ACTIVITIES.map((a, i) => (
                  <div className={styles.activityItem} key={i}>
                    <div className={styles.activityIcon} style={{ background: a.iconBg }}>
                      <a.icon size={15} color={a.iconColor} />
                    </div>
                    <div className={styles.activityText}>
                      <div className={styles.activityMsg}>{a.msg}</div>
                      <div className={styles.activityTime}>{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>{/* end content */}
      </div>{/* end mainWrap */}
    </div>
  );
}