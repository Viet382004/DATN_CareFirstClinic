import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  ArrowLeft,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  Award,
  Headphones,
  MessageSquare,
} from 'lucide-react';
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/useAuth';
import styles from './SelectDoctor.module.css';
import { doctorService } from '../../../services/doctorService';
import { specialtyService } from '../../../services/specialtyService';
import Header from '../../../modules/home/components/Header';


const DEFAULT_AVATAR_URL = '/assets/avatar-default.svg';

const SelectDoctor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 8;

  const loadDoctors = async (search = "", page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const selectedSpecialtyId = localStorage.getItem("selectedSpecialty");
      if (!selectedSpecialtyId || selectedSpecialtyId === 'null' || selectedSpecialtyId === 'undefined') {
        setError("Không tìm thấy chuyên khoa đã chọn. Vui lòng quay lại.");
        return;
      }

      console.log(`Đang tải bác sĩ cho chuyên khoa ID: ${selectedSpecialtyId} với search: ${search}, page: ${page}`);

      const result = await doctorService.getBySpecialty(selectedSpecialtyId, {
        page,
        pageSize,
        search: search
      });

      // Backend returns PagedResult
      const doctorData = result.items || [];
      setTotalPages(result.totalPages || 1);
      setTotalCount(result.totalCount || 0);
      setCurrentPage(result.currentPage || 1);

      if (doctorData.length === 0 && !search) {
        setError(`Hiện chưa có bác sĩ nào thuộc chuyên khoa này.`);
        setDoctors([]);
        return;
      }

      const formatted = doctorData.map(doc => ({
        id: doc.id,
        name: doc.fullName,
        title: doc.academicTitle || "BS",
        specialty: doc.specialtyName || "Bác sĩ chuyên khoa",
        experience: `${doc.yearsOfExperience || 0} năm kinh nghiệm`,
        rating: doc.averageRating || 5.0,
        reviews: doc.totalAppointments || 0,
        available: true,
        isActive: doc.isActive,
        tags: [doc.position || "Tận tâm", "Chuyên môn cao"],
        avatar: doc.avatarUrl || DEFAULT_AVATAR_URL,
      }));

      setDoctors(formatted);
      setError(null);

    } catch (err) {
      console.error("Lỗi loadDoctors:", err);
      setError("Không thể kết nối với server hoặc có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors("", 1);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadDoctors(searchTerm, 1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      loadDoctors(searchTerm, newPage);
    }
  };

  const handleSelect = (id) => {
    setSelectedId(id);
  };

  const handleContinue = () => {
    if (selectedId) {
      const doctor = doctors.find(d => d.id === selectedId);
      localStorage.setItem("selectedDoctor", selectedId);
      if (doctor) {
        localStorage.setItem("selectedDoctorName", `${doctor.title}. ${doctor.name}`);
      }
      navigate("/patient/booking/time");
    }
  };

  const handleBack = () => {
    navigate("/patient/booking");
  };

  // Filter local for online status, search is backend-side
  const filteredDoctors = doctors.filter(doc => !showOnlyAvailable || doc.available);

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
                <h3 className={styles.stepperTitle}>Bước 2: Chọn bác sĩ điều trị</h3>
              </div>
              <span className={styles.stepperCount}>2 / 5 Hoàn tất</span>
            </div>

            <div className={styles.progressBar}>
              <motion.div
                initial={{ width: "20%" }}
                animate={{ width: "40%" }}
                className={styles.progressFill}
              />
            </div>

            <div className={styles.stepLabels}>
              {["CHUYÊN KHOA", "BÁC SĨ", "THỜI GIAN", "THÔNG TIN", "XÁC NHẬN"].map((step, i) => (
                <div key={step} className={`${styles.stepLabel} ${i < 1 ? styles.stepLabelDone : i === 1 ? styles.stepLabelActive : ''}`}>
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
              Đội ngũ bác sĩ chuyên môn cao, tận tâm — sẵn sàng đồng hành cùng bạn.
            </motion.p>

            <div className={styles.filterBar}>
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

              <div className={styles.searchWrapper}>
                <Search className={styles.searchIcon} size={18} />
                <input
                  type="text"
                  placeholder="Tìm bác sĩ theo tên..."
                  className={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Doctor List */}
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner}></div>
              Đang tải danh sách bác sĩ...
            </div>
          ) : error ? (
            <div className={styles.errorState}>{error}</div>
          ) : filteredDoctors.length > 0 ? (
            <>
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
                          <div className={styles.avatarSection}>
                            <div className={styles.imageWrapper}>
                              <img
                                src={doc.avatar}
                                alt={doc.name}
                                className={styles.avatarImg}
                                onError={(e) => {
                                  if (e.currentTarget.src !== DEFAULT_AVATAR_URL) {
                                    e.currentTarget.src = DEFAULT_AVATAR_URL;
                                  }
                                }}
                              />
                              {doc.available && <div className={styles.onlineBadge} />}
                            </div>
                          </div>

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
                              {doc.tags && Array.isArray(doc.tags) && doc.tags.map((tag) => (
                                <span key={tag} className={styles.tag}>{tag}</span>
                              ))}
                            </div>
                          </div>

                          <div className={styles.actionSection}>
                            <div className={styles.statusAvailable}>
                              <Clock size={14} />
                              <span>Có lịch hôm nay</span>
                            </div>
                            <button
                              className={`${styles.selectBtn} ${isSelected ? styles.selectBtnActive : ''}`}
                            >
                              {isSelected ? 'Đã chọn' : 'Chọn bác sĩ'}
                              <CheckCircle2 size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
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
              <h3 className={styles.noResultsTitle}>Không tìm thấy bác sĩ</h3>
              <p className={styles.noResultsDesc}>
                Vui lòng thử lại với từ khóa khác hoặc quay lại chọn chuyên khoa khác.
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
              Quay lại bước 1
            </motion.button>

            <motion.button
              whileHover={selectedId ? { scale: 1.02, y: -2 } : {}}
              whileTap={selectedId ? { scale: 0.98 } : {}}
              onClick={handleContinue}
              disabled={!selectedId}
              className={`${styles.continueButton} ${!selectedId ? styles.continueButtonDisabled : ""}`}
            >
              Tiếp theo: Chọn giờ
              <ArrowRight size={18} />
            </motion.button>
          </div>

          {/* Help Section */}
          <div className={styles.helpSection}>
            <div className={styles.helpIcon}>
              <Headphones size={24} />
            </div>
            <div className={styles.helpContent}>
              <h4 className={styles.helpTitle}>Bạn đang phân vân chọn bác sĩ?</h4>
              <p className={styles.helpText}>
                Đội ngũ tư vấn sẽ giúp bạn chọn bác sĩ phù hợp nhất. Gọi hotline <span className={styles.helpPhone}>1900 1234</span>
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={styles.chatButton}
            >
              <MessageSquare size={16} />
              Tư vấn ngay
            </motion.button>
          </div>
        </main>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <p className={styles.copyright}>© 2024 CareFirst Clinic Hospital. All rights reserved.</p>
            <div className={styles.footerLinks}>
              <a href="#" className={styles.footerLink}>Chính sách bảo mật</a>
              <a href="#" className={styles.footerLink}>Điều khoản dịch vụ</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default SelectDoctor;