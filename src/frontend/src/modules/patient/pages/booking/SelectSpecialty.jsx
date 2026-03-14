/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Baby,
  Brain,
  Bone,
  Eye,
  Activity,
  User,
  Stethoscope,
  Search,
  ArrowLeft,
  ArrowRight,
  Headphones,
  MessageSquare,
  ChevronRight,
  Sparkles,
  Droplets,
  Pill,
  Ear,
} from "lucide-react";
import logo from "../../../../assets/logo.png";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../../../contexts/AuthContext";
import styles from "./SelectSpecialty.module.css";

// ===== CONSTANTS =====
const SPECIALTIES = [
  {
    id: "tim-mach",
    name: "Tim mạch",
    nameEn: "Cardiology",
    description: "Khám và điều trị các bệnh về tim mạch, huyết áp",
    iconName: "Heart",
    color: "cardiology",
    doctorsAvailable: 12,
    description_full:
      "Chuyên sâu về các bệnh lý tim mạch, tăng huyết áp, suy tim, rối loạn nhịp tim và các bệnh lý liên quan đến hệ tim mạch.",
    popular: true,
  },
  {
    id: "nhi-khoa",
    name: "Nhi khoa",
    nameEn: "Pediatrics",
    description: "Chăm sóc sức khỏe toàn diện cho trẻ em",
    iconName: "Baby",
    color: "pediatrics",
    doctorsAvailable: 8,
    description_full:
      "Khám và điều trị các bệnh lý ở trẻ em từ sơ sinh đến 15 tuổi, bao gồm tiêm chủng, dinh dưỡng và các bệnh nhi khoa thường gặp.",
    popular: true,
  },
  {
    id: "than-kinh",
    name: "Thần kinh",
    nameEn: "Neurology",
    description: "Khám và điều trị các bệnh về não bộ, thần kinh",
    iconName: "Brain",
    color: "neurology",
    doctorsAvailable: 6,
    description_full:
      "Chuyên sâu về các bệnh lý thần kinh như đau đầu, động kinh, tai biến mạch máu não, Parkinson và các rối loạn thần kinh khác.",
    popular: false,
  },
  {
    id: "co-xuong-khop",
    name: "Cơ xương khớp",
    nameEn: "Orthopedics",
    description: "Khám và điều trị các bệnh về xương khớp, cột sống",
    iconName: "Bone",
    color: "orthopedics",
    doctorsAvailable: 10,
    description_full:
      "Chuyên sâu về các bệnh lý xương khớp, thoái hóa khớp, thoát vị đĩa đệm, loãng xương và chấn thương chỉnh hình.",
    popular: true,
  },
  {
    id: "mat",
    name: "Mắt",
    nameEn: "Ophthalmology",
    description: "Khám và điều trị các bệnh về mắt, thị lực",
    iconName: "Eye",
    color: "ophthalmology",
    doctorsAvailable: 5,
    description_full:
      "Khám và điều trị các tật khúc xạ, đục thủy tinh thể, glocom, các bệnh lý võng mạc và phẫu thuật mắt.",
    popular: false,
  },
];

// ===== ICON MAP =====
const IconMap = {
  Heart,
  Baby,
  Brain,
  Bone,
  Eye,
  Activity,
  User,
  Stethoscope,
  Sparkles,
  Droplets,
  Pill,
  Ear,
};
const NAV_ITEMS = [
  { name: "Trang chủ", path: "/" },
  { name: "Lịch hẹn", path: "/patient/booking" },
  { name: "Tin tức", path: "/news" },
  { name: "Liên hệ", path: "/contact" },
];
// ===== MAIN COMPONENT =====
const SelectSpecialty = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedSpecialty, setSelectedSpecialty] = useState(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyPopular, setShowOnlyPopular] = useState(false);

  // Lọc danh sách chuyên khoa theo tìm kiếm và bộ lọc
  const filteredSpecialties = SPECIALTIES.filter((specialty) => {
    const matchesSearch =
      specialty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialty.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialty.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPopular = showOnlyPopular ? specialty.popular : true;
    return matchesSearch && matchesPopular;
  });

  // Xử lý khi chọn chuyên khoa
  const handleSelectSpecialty = (id) => {
    setSelectedSpecialty(id);
  };

  // Xử lý khi nhấn nút tiếp theo
  const handleContinue = () => {
    if (selectedSpecialty) {
      // Lưu thông tin chuyên khoa đã chọn vào localStorage hoặc state management
      localStorage.setItem("selectedSpecialty", selectedSpecialty);
      // Chuyển đến trang chọn bác sĩ
      navigate("/patient/booking/doctor");
    }
  };

  // Xử lý quay lại
  const handleBack = () => {
    navigate("/");
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
                placeholder="Tìm chuyên khoa..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className={styles.userAvatar}>
              {user
                ? <span className={styles.avatarInitial}>{(user.fullName || 'U').charAt(0).toUpperCase()}</span>
                : <User size={20} />
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
              <h3 className={styles.stepperTitle}>Bước 1: Chọn Chuyên Khoa</h3>
            </div>
            <span className={styles.stepperCount}>1 / 5 Hoàn tất</span>
          </div>

          <div className={styles.progressBar}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "20%" }}
              className={styles.progressFill}
            />
          </div>

          <div className={styles.stepLabels}>
            {[
              "CHUYÊN KHOA",
              "BÁC SĨ",
              "THỜI GIAN",
              "THÔNG TIN",
              "XÁC NHẬN",
            ].map((step, i) => (
              <div
                key={step}
                className={`${styles.stepLabel} ${i === 0 ? styles.stepLabelActive : ""}`}
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
            {user ? `Chào ${user.fullName?.split(' ').pop()}, ` : 'Chào bạn, '}
            mình cần khám{" "}
            <span className={styles.heroHighlight}>khoa nào</span> ?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={styles.heroDescription}
          >
            Vui lòng lựa chọn chuyên khoa phù hợp để chúng tôi sắp xếp bác sĩ
            chuyên môn tốt nhất cho bạn.
          </motion.p>

          {/* Filter Tabs */}
          <div className={styles.filterTabs}>
            <button
              className={`${styles.filterTab} ${!showOnlyPopular ? styles.filterTabActive : ""}`}
              onClick={() => setShowOnlyPopular(false)}
            >
              Tất cả khoa
            </button>
            <button
              className={`${styles.filterTab} ${showOnlyPopular ? styles.filterTabActive : ""}`}
              onClick={() => setShowOnlyPopular(true)}
            >
              Phổ biến
            </button>
          </div>
        </div>

        {/* Specialties Grid */}
        {filteredSpecialties.length > 0 ? (
          <div className={styles.specialtiesGrid}>
            {filteredSpecialties.map((specialty, index) => {
              const Icon = IconMap[specialty.iconName] || Stethoscope;
              const isSelected = selectedSpecialty === specialty.id;

              return (
                <motion.div
                  key={specialty.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ y: -6 }}
                  onClick={() => handleSelectSpecialty(specialty.id)}
                  className={`${styles.specialtyCard} ${isSelected ? styles.specialtyCardSelected : ""}`}
                >
                  <div className={styles.specialtyCardInner}>
                    <div className={styles.specialtyIconWrapper}>
                      <div
                        className={`${styles.specialtyIcon} ${styles[specialty.color]}`}
                      >
                        <Icon size={28} />
                      </div>
                    </div>

                    <div className={styles.specialtyContent}>
                      <div className={styles.specialtyHeader}>
                        <h3 className={styles.specialtyName}>
                          {specialty.name}
                        </h3>
                        {specialty.popular && (
                          <span className={styles.popularBadge}>Phổ biến</span>
                        )}
                      </div>
                      <p className={styles.specialtyDesc}>
                        {specialty.description}
                      </p>
                      <p className={styles.specialtyDoctors}>
                        {specialty.doctorsAvailable} bác sĩ sẵn sàng
                      </p>
                      <p className={styles.specialtyFullDesc}>
                        {specialty.description_full}
                      </p>
                      <div
                        className={`${styles.selectIndicator} ${isSelected ? styles.selectIndicatorVisible : ""}`}
                      >
                        Chọn khoa <ChevronRight size={14} strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className={styles.noResults}>
            <Search size={48} className={styles.noResultsIcon} />
            <h3 className={styles.noResultsTitle}>
              Không tìm thấy chuyên khoa
            </h3>
            <p className={styles.noResultsDesc}>
              Vui lòng thử lại với từ khóa khác hoặc liên hệ hotline để được tư
              vấn.
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
            whileHover={selectedSpecialty ? { scale: 1.02, y: -2 } : {}}
            whileTap={selectedSpecialty ? { scale: 0.98 } : {}}
            onClick={handleContinue}
            disabled={!selectedSpecialty}
            className={`${styles.continueButton} ${!selectedSpecialty ? styles.continueButtonDisabled : ""}`}
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
              Hãy gọi Hotline{" "}
              <span className={styles.helpPhone}>1900 1234</span> để được nhân
              viên y tế hỗ trợ chọn đúng chuyên khoa.
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

export default SelectSpecialty;