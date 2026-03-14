import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  ArrowLeft,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  Award,
  ChevronRight,
  Shield,
  Headphones,
  MessageSquare,
} from 'lucide-react';
import logo from "../../../../assets/logo.png";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../../contexts/AuthContext';
import styles from './SelectDoctor.module.css';

const NAV_ITEMS = [
  { name: "Trang chủ", path: "/" },
  { name: "Lịch hẹn", path: "/patient/booking" },
  { name: "Tin tức", path: "/news" },
  { name: "Liên hệ", path: "/contact" }
];
// ===== DATA =====
const DOCTORS = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    title: 'BSCKII',
    specialty: 'Nội Tổng Quát - Tim Mạch',
    experience: '15 năm kinh nghiệm làm việc tại BV Chợ Rẫy',
    rating: 5,
    reviews: 120,
    available: true,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
    tags: ['Tận tâm', 'Chuyên gia đầu ngành'],
    featured: true,
  },
  {
    id: '2',
    name: 'Lê Thị B',
    title: 'ThS.BS',
    specialty: 'Sản Phụ Khoa - Nhi Khoa',
    experience: '10 năm kinh nghiệm chuyên sâu về sức khỏe mẹ & bé',
    rating: 4.8,
    reviews: 84,
    available: true,
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop',
    tags: ['Nhẹ nhàng', 'Tư vấn kỹ'],
    featured: true,
  },
  {
    id: '3',
    name: 'Trần Văn C',
    title: 'BSCKI',
    specialty: 'Cơ Xương Khớp - Phục Hồi Chức Năng',
    experience: '20 năm kinh nghiệm - Chuyên gia đầu ngành',
    rating: 4.5,
    reviews: 215,
    available: false,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
    tags: ['Giàu kinh nghiệm'],
    featured: false,
  },
];

// ===== MAIN COMPONENT =====
const SelectDoctor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // Lọc bác sĩ theo tìm kiếm và bộ lọc
  const filteredDoctors = DOCTORS.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAvailable = showOnlyAvailable ? doc.available : true;
    return matchesSearch && matchesAvailable;
  });

  const handleSelect = (id) => {
    const doc = DOCTORS.find((d) => d.id === id);
    if (doc?.available) setSelectedId(id);
  };

  const handleContinue = () => {
    if (selectedId) {
      localStorage.setItem('selectedDoctor', selectedId);
      navigate('/patient/booking/time');
    }
  };

  const handleBack = () => {
    navigate('/patient/booking/specialty');
  };

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
            <div className={styles.searchBox}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Tìm bác sĩ, chuyên khoa..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
        {/* Progress Stepper */}
        <div className={styles.stepperContainer}>
          <div className={styles.stepperHeader}>
            <div>
              <span className={styles.stepperBadge}>Tiến trình đặt lịch</span>
              <h3 className={styles.stepperTitle}>Bước 2: Chọn Bác Sĩ</h3>
            </div>
            <span className={styles.stepperCount}>2 / 5 Hoàn tất</span>
          </div>

          <div className={styles.progressBar}>
            <motion.div
              initial={{ width: '20%' }}
              animate={{ width: '40%' }}
              className={styles.progressFill}
            />
          </div>

          <div className={styles.stepLabels}>
            {['CHUYÊN KHOA', 'BÁC SĨ', 'THỜI GIAN', 'THÔNG TIN', 'XÁC NHẬN'].map((step, i) => (
              <div
                key={step}
                className={`${styles.stepLabel} ${
                  i === 0
                    ? styles.stepLabelDone
                    : i === 1
                    ? styles.stepLabelActive
                    : ''
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* Hero Section */}
        <div className={styles.heroSection}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.heroTitle}
          >
            Chọn <span className={styles.heroHighlight}>bác sĩ</span> phù hợp với bạn
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={styles.heroDescription}
          >
            Đội ngũ bác sĩ chuyên môn cao, tận tâm — sẵn sàng đồng hành cùng bạn trên hành trình chăm sóc sức khỏe.
          </motion.p>

          {/* Filter Tabs */}
          <div className={styles.filterTabs}>
            <button
              className={`${styles.filterTab} ${!showOnlyAvailable ? styles.filterTabActive : ''}`}
              onClick={() => setShowOnlyAvailable(false)}
            >
              Tất cả bác sĩ
            </button>
            <button
              className={`${styles.filterTab} ${showOnlyAvailable ? styles.filterTabActive : ''}`}
              onClick={() => setShowOnlyAvailable(true)}
            >
              Còn lịch hôm nay
            </button>
          </div>
        </div>

        {/* Doctor List */}
        {filteredDoctors.length > 0 ? (
          <div className={styles.doctorList}>
            <AnimatePresence mode="popLayout">
              {filteredDoctors.map((doc, index) => {
                const isSelected = selectedId === doc.id;
                return (
                  <motion.div
                    layout
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelect(doc.id)}
                    className={`
                      ${styles.doctorCard}
                      ${isSelected ? styles.doctorCardSelected : ''}
                      ${!doc.available ? styles.doctorCardUnavailable : ''}
                    `}
                  >
                    <div className={styles.cardLayout}>
                      {/* Avatar */}
                      <div className={styles.avatarSection}>
                        <div className={styles.imageWrapper}>
                          <img
                            src={doc.avatar}
                            alt={doc.name}
                            className={styles.avatarImg}
                          />
                          {doc.available && <div className={styles.onlineBadge} />}
                        </div>
                      </div>

                      {/* Info */}
                      <div className={styles.infoSection}>
                        <div className={styles.topRow}>
                          <div className={styles.titleGroup}>
                            <span className={styles.docTitleTag}>{doc.title}</span>
                            <h4 className={styles.docName}>{doc.name}</h4>
                          </div>
                          <div className={styles.ratingBox}>
                            <Star size={14} fill="#ffb800" color="#ffb800" />
                            <span>{doc.rating}</span>
                            <small>({doc.reviews})</small>
                          </div>
                        </div>

                        <p className={styles.specialtyText}>{doc.specialty}</p>

                        <div className={styles.experienceBox}>
                          <Award size={14} className={styles.awardIcon} />
                          <span>{doc.experience}</span>
                        </div>

                        <div className={styles.tagGroup}>
                          {doc.tags.map((tag) => (
                            <span key={tag} className={styles.tag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action */}
                      <div className={styles.actionSection}>
                        {doc.available ? (
                          <div className={styles.statusAvailable}>
                            <Clock size={14} />
                            <span>Có lịch hôm nay</span>
                          </div>
                        ) : (
                          <div className={styles.statusBusy}>Hết lịch hôm nay</div>
                        )}
                        <button
                          className={styles.selectBtn}
                          disabled={!doc.available}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(doc.id);
                          }}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle2 size={16} /> Đã chọn
                            </>
                          ) : (
                            'Chọn bác sĩ'
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className={styles.noResults}>
            <Search size={48} className={styles.noResultsIcon} />
            <h3 className={styles.noResultsTitle}>Không tìm thấy bác sĩ</h3>
            <p className={styles.noResultsDesc}>
              Vui lòng thử lại với từ khóa khác hoặc liên hệ hotline để được tư vấn.
            </p>
          </div>
        )}

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
            whileHover={selectedId ? { scale: 1.02, y: -2 } : {}}
            whileTap={selectedId ? { scale: 0.98 } : {}}
            onClick={handleContinue}
            disabled={!selectedId}
            className={`${styles.continueButton} ${!selectedId ? styles.continueButtonDisabled : ''}`}
          >
            Tiếp theo
            <ArrowRight size={18} />
          </motion.button>
        </div>

        {/* Help Section */}
        <div className={styles.helpSection}>
          <div className={styles.helpIcon}>
            <Headphones size={24} />
          </div>
          <div className={styles.helpContent}>
            <h4 className={styles.helpTitle}>Cần hỗ trợ tư vấn?</h4>
            <p className={styles.helpText}>
              Hãy gọi Hotline{' '}
              <span className={styles.helpPhone}>1900 1234</span> để được nhân viên y tế
              hỗ trợ chọn đúng bác sĩ.
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
          <p className={styles.copyright}>
            © 2024 MediCare+ Hospital System. All rights reserved.
          </p>
          <div className={styles.footerLinks}>
            <a href="#" className={styles.footerLink}>
              Chính sách bảo mật
            </a>
            <a href="#" className={styles.footerLink}>
              Điều khoản sử dụng
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SelectDoctor;