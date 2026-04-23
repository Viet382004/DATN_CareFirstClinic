import React, { useState, useEffect } from "react";
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
  type LucideIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../../contexts/useAuth";
import styles from "./SelectSpecialty.module.css";
import { specialtyService } from "../../../services/specialtyService";
import Header from "../../home/components/Header";
import type { Specialty } from "../../../types/specialty";

// ===== ICON MAP =====
const IconMap: Record<string, LucideIcon> = {
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

// Extension of Specialty for UI purposes if needed, 
// though we should try to use the base type as much as possible.
interface SpecialtyUI extends Specialty {
  iconName?: string;
  color?: string;
  popular?: boolean;
}

const SelectSpecialty: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showOnlyPopular, setShowOnlyPopular] = useState<boolean>(false);

  const [specialties, setSpecialties] = useState<SpecialtyUI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const pageSize = 12;

  const fetchSpecialties = async (page: number = 1, search: string = "") => {
    try {
      setLoading(true);
      const response = await specialtyService.getPaged({
        page,
        pageSize,
        search
      });
      setSpecialties((response.items as SpecialtyUI[]) || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
      setCurrentPage(response.currentPage || 1);
    } catch (error) {
      console.error("Failed to fetch specialties:", error);
      setSpecialties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialties(1, searchTerm);
  }, [showOnlyPopular]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSpecialties(1, searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchSpecialties(newPage, searchTerm);
    }
  };

  const handleSelectSpecialty = (id: string) => {
    setSelectedSpecialty(id);
  };

  const handleContinue = () => {
    if (selectedSpecialty) {
      const sp = specialties.find(s => s.id === selectedSpecialty);
      localStorage.setItem("selectedSpecialty", selectedSpecialty);
      if (sp) {
        localStorage.setItem("selectedSpecialtyName", sp.name);
      }
      navigate("/patient/booking/doctor");
    }
  };

  const handleBack = () => {
    navigate("/");
  };

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

            {/* Filter Bar */}
            <div className={styles.filterBar}>
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

              <div className={styles.searchWrapper}>
                <Search className={styles.searchIcon} size={18} />
                <input
                  type="text"
                  placeholder="Tìm tên khoa, triệu chứng..."
                  className={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Specialties Grid */}
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner}></div>
              Đang tải danh sách chuyên khoa...
            </div>
          ) : specialties.length > 0 ? (
            <>
              <div className={styles.specialtiesGrid}>
                {specialties.map((specialty, index) => {
                  const Icon = (specialty.iconName && IconMap[specialty.iconName]) || (specialty.icon && IconMap[specialty.icon]) || Stethoscope;
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
                            className={`${styles.specialtyIcon} ${specialty.color ? styles[specialty.color] : ""}`}
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
                            {specialty.totalDoctors || 0} bác sĩ sẵn sàng
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.pageBtn}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ArrowLeft size={16} /> Trang trước
                  </button>
                  <span className={styles.pageInfo}>
                    Trang <strong>{currentPage}</strong> / {totalPages}
                  </span>
                  <button
                    className={styles.pageBtn}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Trang sau <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </>
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
    </>
  );
};

export default SelectSpecialty;
