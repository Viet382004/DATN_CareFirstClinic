/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import logo from "../../../assets/logo.png";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import {
  Hospital,
  Phone,
  Search,
  UserSearch,
  CalendarCheck,
  HeartPulse,
  ArrowRight,
  Stethoscope,
  Baby,
  Brain,
  Bone,
  Smile,
  Eye,
  Activity,
  UserRound,
  Bell,
  CalendarDays,
  Globe,
  Mail,
  Share2,
  MessageSquare,
  Menu,
  X,
  Star,
  Clock,
  MapPin,
  Shield,
  Award,
  Users,
  ThumbsUp,
  CheckCircle,
  ChevronRight,
  LogIn,
  Calendar,
  UserPlus,
  Ambulance,
} from "lucide-react";
import { motion } from "framer-motion";
import styles from "./Homepage.module.css";

const NAV_ITEMS = [
  { name: "Bác sĩ", path: "/" },
  { name: "Chuyên khoa", path: "/patient/booking" },
  { name: "Tin tức", path: "/news" },
  { name: "Liên hệ", path: "/contact" },
];

// ===== CONSTANTS =====
const specialties = [
  {
    id: 1,
    name: "Tim mạch",
    desc: "Sức khỏe tim mạch & Phẫu thuật",
    icon: Stethoscope,
    color: "cardiology",
  },
  {
    id: 2,
    name: "Nhi khoa",
    desc: "Chăm sóc sức khỏe trẻ em",
    icon: Baby,
    color: "pediatrics",
  },
  {
    id: 3,
    name: "Thần kinh",
    desc: "Não bộ & Hệ thần kinh",
    icon: Brain,
    color: "neurology",
  },
  {
    id: 4,
    name: "Chỉnh hình",
    desc: "Xương khớp & Chấn thương",
    icon: Bone,
    color: "orthopedics",
  },
  {
    id: 5,
    name: "Tâm lý",
    desc: "Sức khỏe tinh thần",
    icon: Smile,
    color: "psychiatry",
  },
  {
    id: 6,
    name: "Mắt",
    desc: "Thị lực & Phẫu thuật mắt",
    icon: Eye,
    color: "ophthalmology",
  },
  {
    id: 7,
    name: "Răng hàm mặt",
    desc: "Chăm sóc răng miệng",
    icon: Activity,
    color: "dentistry",
  },
  {
    id: 8,
    name: "Phụ sản",
    desc: "Sức khỏe phụ nữ",
    icon: UserRound,
    color: "gynecology",
  },
];

const steps = [
  {
    id: 1,
    title: "Tìm bác sĩ",
    desc: "Tìm kiếm bác sĩ chuyên khoa phù hợp với nhu cầu sức khỏe của bạn từ mạng lưới chuyên gia đã được xác thực.",
    icon: UserSearch,
  },
  {
    id: 2,
    title: "Chọn thời gian",
    desc: "Lựa chọn khung giờ thuận tiện nhất cho bạn. Đặt lịch hẹn trong ngày hoặc theo lịch trình của bạn.",
    icon: CalendarCheck,
  },
  {
    id: 3,
    title: "Khám chữa bệnh",
    desc: "Đến khám tại cơ sở hiện đại của chúng tôi và nhận được sự chăm sóc y tế đẳng cấp thế giới với sự tận tâm.",
    icon: HeartPulse,
  },
];

const topDoctors = [
  {
    id: 1,
    name: "BS. Nguyễn Thị Hương",
    specialty: "Tim mạch",
    rating: 4.9,
    reviews: 128,
    available: true,
    image: "H",
  },
  {
    id: 2,
    name: "BS. Trần Văn Đức",
    specialty: "Nhi khoa",
    rating: 4.95,
    reviews: 156,
    available: true,
    image: "Đ",
  },
  {
    id: 3,
    name: "BS. Lê Minh Tuấn",
    specialty: "Thần kinh",
    rating: 4.8,
    reviews: 94,
    available: false,
    image: "T",
  },
  {
    id: 4,
    name: "BS. Phạm Thị Lan",
    specialty: "Da liễu",
    rating: 4.9,
    reviews: 112,
    available: true,
    image: "L",
  },
];

const testimonials = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    role: "Bệnh nhân",
    content:
      "Tôi đã được chăm sóc tuyệt vời. Các bác sĩ dành thời gian giải thích mọi thứ và làm tôi cảm thấy thực sự được quan tâm.",
    rating: 5,
    date: "2 tuần trước",
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    role: "Người nhà bệnh nhân",
    content:
      "Mẹ tôi phẫu thuật tại đây và toàn bộ đội ngũ đã chuyên nghiệp, tử tế và hỗ trợ xuyên suốt quá trình hồi phục của bà.",
    rating: 5,
    date: "1 tháng trước",
  },
];

const stats = [
  { id: 1, label: "Chuyên gia", value: "500+", icon: Users },
  { id: 2, label: "Cấp cứu", value: "24/7", icon: Clock },
  { id: 3, label: "Bệnh nhân", value: "15k+", icon: ThumbsUp },
];

// ===== COMPONENTS =====

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  
  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <div className={styles.contactInfo}>
          <Phone className={styles.contactIcon} />
          <span>Cấp cứu 24/7: (028) 3829 8888</span>
        </div>
        <div className={styles.languageSelector}>
          <select className={styles.languageDropdown}>
            <option>Tiếng Việt</option>
            <option>English</option>
            <option>中文</option>
          </select>
        </div>
      </div>

      <div className={styles.navbar}>
        <div className={styles.logoContainer} onClick={() => navigate("/")}>
          <img src={logo} alt="CareFirst Clinic" className={styles.logoImg} />

          <h2 className={styles.logoText}>CareFirst Clinic</h2>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <Link key={item.name} to={item.path} className={styles.navLink}>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className={styles.navActions}>
          {!user ? (
            /* CHƯA ĐĂNG NHẬP: giữ nguyên */
            <>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")}
                className={styles.loginBtn}
              >
                <LogIn className={styles.loginIcon} />
                <span>Đăng nhập</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/patient/booking/specialty")}
                className={styles.bookBtn}
              >
                <Calendar className={styles.bookIcon} />
                <span>Đặt lịch hẹn</span>
                <div className={styles.btnSparkle}></div>
              </motion.button>
            </>
          ) : (
            /* ĐÃ ĐĂNG NHẬP: 3 icon */
            <div className={styles.iconActions}>
              {/* Lịch khám */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/patient/appointments")}
                className={styles.iconBtn}
                title="Lịch khám của tôi"
              >
                <CalendarDays size={20} />
              </motion.button>

              {/* Thông báo */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={styles.iconBtn}
                title="Thông báo"
              >
                <Bell size={20} />
              </motion.button>

              {/* Avatar → dropdown khi HOVER */}
              <div
                className={styles.userMenu}
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
              >
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  className={styles.avatarBtn}
                  title={user.fullName}
                >
                  <UserRound size={18} />
                </motion.button>

                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.dropdown}
                  >
                    <div className={styles.dropdownHeader}>
                      <div className={styles.dropdownAvatar}>
                        {(user.fullName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={styles.dropdownName}>{user.fullName}</p>
                        <p className={styles.dropdownRole}>
                          {user.role === 'patient' ? 'Bệnh nhân' : user.role}
                        </p>
                      </div>
                    </div>
                    <div className={styles.dropdownDivider} />
                    <button onClick={() => navigate("/patient/profile")}>
                      <UserRound size={14} /> Hồ sơ cá nhân
                    </button>
                    <button onClick={() => navigate("/patient/appointments")}>
                      <CalendarDays size={14} /> Lịch khám
                    </button>
                    <div className={styles.dropdownDivider} />
                    <button className={styles.logoutBtn} onClick={() => { logout(); navigate("/"); }}>
                      <LogIn size={14} /> Đăng xuất
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={styles.menuToggle}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </motion.button>

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={styles.mobileMenu}
          >
            <nav className={styles.mobileNav}>
              {["Bác sĩ", "Chuyên khoa", "Cơ sở", "Về chúng tôi"].map(
                (item) => (
                  <a
                    key={item}
                    href="#"
                    className={styles.mobileNavLink}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item}
                  </a>
                ),
              )}
              <div className={styles.mobileActions}>
                <motion.button
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    navigate("/login");
                    setIsMenuOpen(false);
                  }}
                  className={styles.mobileLoginBtn}
                >
                  <LogIn className={styles.mobileIcon} />
                  Đăng nhập
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    navigate("/patient");
                    setIsMenuOpen(false);
                  }}
                  className={styles.mobileBookBtn}
                >
                  <Calendar className={styles.mobileIcon} />
                  Đặt lịch hẹn
                </motion.button>
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
};

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className={styles.hero}>
      <div className={styles.heroPattern} />

      <div className={styles.heroContainer}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className={styles.heroContent}
        >
          <div className={styles.heroBadge}>
            <Shield className={styles.badgeIcon} />
            <span>Chăm sóc sức khỏe uy tín</span>
          </div>

          <h1 className={styles.heroTitle}>
            Sức khỏe của bạn là <br />
            <span className={styles.heroTitleHighlight}>niềm vui lớn nhất</span>
          </h1>

          <p className={styles.heroDescription}>
            Trải nghiệm dịch vụ chăm sóc tận tâm từ hơn 500 chuyên gia. Chúng
            tôi tận tụy hỗ trợ sức khỏe của bạn 24 giờ mỗi ngày.
          </p>

          <div className={styles.searchContainer}>
            <div className={styles.searchBox}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Tìm bác sĩ, chuyên khoa..."
                className={styles.searchInput}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={styles.searchBtn}
            >
              Tìm kiếm
            </motion.button>
          </div>

          <div className={styles.statsContainer}>
            {stats.map((stat) => (
              <motion.div
                key={stat.id}
                whileHover={{ y: -5 }}
                className={styles.statItem}
              >
                <stat.icon className={styles.statIcon} />
                <div>
                  <span className={styles.statValue}>{stat.value}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className={styles.accreditation}>
            <Award className={styles.accreditationIcon} />
            <span>Đạt chuẩn quốc tế về chất lượng bệnh viện</span>
          </div>

          <div className={styles.quickActions}>
            <motion.button
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/patient/booking/specialty")}
              className={styles.quickBookBtn}
            >
              <Calendar className={styles.quickIcon} />
              Đặt lịch ngay
              <div className={styles.btnPulse}></div>
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={styles.heroImageWrapper}
        >
          <div className={styles.heroImageContainer}>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAU3-dRvO6P_PD9V06ZudrRq5uFdnYQb-OU9cYIgUor7rqTtOqxdVK9ngyE-piiIk1klqns8ubp00DYe9TyFAVpFXxeVbZjYdbbca-a5g1-d7MUHKYXsvZefQu59Q-GHfBZzydd5JQY7ngJtTey45kB-4SqhTue0jbRS3UzE2X0KXFqARgP8ZLEyvHaYByX19uijmPKzgcHwWc3rYxjWS55SBXgba36_CM3DUR4uowEnPKuqph6HQ37Ww_Bx-p4oZHTvTgrB1DSFg"
              alt="Đội ngũ y bác sĩ"
              className={styles.heroImage}
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const HowItWorksSection = () => (
  <section className={styles.howItWorks}>
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Bắt đầu hành trình chữa bệnh</h2>
        <p className={styles.sectionSubtitle}>
          Các bước đơn giản để được chăm sóc y tế xứng đáng mà không phải lo
          lắng.
        </p>
      </div>

      <div className={styles.stepsGrid}>
        {steps.map((step, idx) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -10, scale: 1.02 }}
            className={styles.stepCard}
          >
            <div className={styles.stepIconWrapper}>
              <step.icon className={styles.stepIcon} />
            </div>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepDesc}>{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const SpecialtiesSection = () => (
  <section className={styles.specialties}>
    <div className={styles.sectionContainer}>
      <div className={styles.specialtiesHeader}>
        <div className={styles.specialtiesTitleGroup}>
          <h2 className={styles.sectionTitle}>Chuyên khoa của chúng tôi</h2>
          <p className={styles.sectionSubtitle}>
            Chuyên môn đẳng cấp thế giới trên mọi lĩnh vực y tế.
          </p>
        </div>
        <motion.button
          whileHover={{ x: 5 }}
          whileTap={{ scale: 0.95 }}
          className={styles.viewAllBtn}
        >
          Xem tất cả
          <ChevronRight className={styles.viewAllIcon} />
        </motion.button>
      </div>

      <div className={styles.specialtiesGrid}>
        {specialties.map((spec, idx) => (
          <motion.div
            key={spec.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className={`${styles.specialtyCard} ${styles[spec.color]}`}
          >
            <div className={styles.specialtyIconWrapper}>
              <spec.icon className={styles.specialtyIcon} />
            </div>
            <h4 className={styles.specialtyName}>{spec.name}</h4>
            <p className={styles.specialtyDesc}>{spec.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const DoctorsSection = () => (
  <section className={styles.doctors}>
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Bác sĩ hàng đầu</h2>
        <p className={styles.sectionSubtitle}>
          Gặp gỡ đội ngũ chuyên gia y tế giàu kinh nghiệm của chúng tôi.
        </p>
      </div>

      <div className={styles.doctorsGrid}>
        {topDoctors.map((doctor, idx) => (
          <motion.div
            key={doctor.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -10, scale: 1.02 }}
            className={styles.doctorCard}
          >
            <div className={styles.doctorAvatar}>
              <span>{doctor.image}</span>
            </div>
            <h3 className={styles.doctorName}>{doctor.name}</h3>
            <p className={styles.doctorSpecialty}>{doctor.specialty}</p>

            <div className={styles.doctorRating}>
              <Star className={styles.ratingIcon} />
              <span>{doctor.rating}</span>
              <span className={styles.reviewCount}>
                ({doctor.reviews} đánh giá)
              </span>
            </div>

            {doctor.available ? (
              <span className={styles.availableBadge}>
                <CheckCircle className={styles.badgeIcon} />
                Có lịch hôm nay
              </span>
            ) : (
              <span className={styles.unavailableBadge}>Có lịch: Ngày mai</span>
            )}

            <div className={styles.doctorActions}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={styles.viewProfileBtn}
              >
                Xem hồ sơ
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={styles.bookDoctorBtn}
              >
                Đặt lịch
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const TestimonialsSection = () => (
  <section className={styles.testimonials}>
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Chia sẻ từ bệnh nhân</h2>
        <p className={styles.sectionSubtitle}>
          Những trải nghiệm thực tế từ những người đã được chúng tôi chăm sóc.
        </p>
      </div>

      <div className={styles.testimonialsGrid}>
        {testimonials.map((testimonial, idx) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -8 }}
            className={styles.testimonialCard}
          >
            <div className={styles.testimonialHeader}>
              <div className={styles.testimonialAvatar}>
                {testimonial.name.charAt(0)}
              </div>
              <div className={styles.testimonialInfo}>
                <h4 className={styles.testimonialName}>{testimonial.name}</h4>
                <p className={styles.testimonialRole}>{testimonial.role}</p>
              </div>
              <div className={styles.testimonialRating}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`${styles.ratingStar} ${i < testimonial.rating ? styles.ratingStarFilled : ""}`}
                  />
                ))}
              </div>
            </div>
            <p className={styles.testimonialContent}>"{testimonial.content}"</p>
            <p className={styles.testimonialDate}>{testimonial.date}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const EmergencyBanner = () => (
  <section className={styles.emergency}>
    <div className={styles.emergencyContainer}>
      <div className={styles.emergencyPattern} />

      <div className={styles.emergencyContent}>
        <div className={styles.emergencyLeft}>
          <h2 className={styles.emergencyTitle}>Cần hỗ trợ khẩn cấp?</h2>
          <p className={styles.emergencyDesc}>
            Trung tâm hỗ trợ bệnh nhân 24/7 của chúng tôi luôn mở cửa. Nói
            chuyện với nhân viên hỗ trợ hoặc nhận hướng dẫn cấp cứu bất cứ lúc
            nào.
          </p>
          <div className={styles.emergencyActions}>
            <motion.a
              href="tel:+02838298888"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={styles.callBtn}
            >
              <Phone className={styles.btnIcon} />
              Gọi (028) 3829 8888
              <div className={styles.btnRing}></div>
            </motion.a>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={styles.chatBtn}
            >
              <MessageSquare className={styles.btnIcon} />
              Chat trực tuyến
              <div className={styles.btnPulse}></div>
            </motion.button>
          </div>
        </div>

        <div className={styles.emergencyRight}>
          <div className={styles.emergencyImageWrapper}>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRUUFkKjNk6Jm8oT0_Bd_1P3jzOqYHKeqYl6zqiwYnndNvr1FCSxBgnOdyR_s7ygXqLYzHyXENokBBPqzUS4hl_EXE8DVRuFW_k2t_CfZ5uGoAov4B5IEyL-MWUac8O3u3bXQRqgXq8r1KII5AUir-TqBItdIqmh4YDThkcfLf5w23hfHNs8L00ZmFnEk7W46h28TRPOJ44KNG2zyUsPOXYFVXRI87H9gib-LDaTEPRwdf63PyZjhxn_tht6g9dnQFaw3VVDJdrQ"
              alt="Khu vực cấp cứu"
              className={styles.emergencyImage}
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className={styles.footer}>
    <div className={styles.footerContainer}>
      <div className={styles.footerMain}>
        <div className={styles.footerBrand}>
          <div className={styles.footerLogo}>
            <Hospital className={styles.footerLogoIcon} />
            <h2 className={styles.footerLogoText}>CareFirst Clinic</h2>
          </div>
          <p className={styles.footerDesc}>
            Cung cấp dịch vụ chăm sóc y tế nhân đạo, đẳng cấp thế giới từ năm
            1978. Tận tụy vì sức khỏe của bạn và cộng đồng.
          </p>
          <div className={styles.footerSocial}>
            <motion.a
              href="#"
              whileHover={{ y: -5, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={styles.socialLink}
            >
              <Globe className={styles.socialIcon} />
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ y: -5, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={styles.socialLink}
            >
              <Mail className={styles.socialIcon} />
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ y: -5, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={styles.socialLink}
            >
              <Share2 className={styles.socialIcon} />
            </motion.a>
          </div>
        </div>

        <div className={styles.footerLinks}>
          <div className={styles.footerColumn}>
            <h4 className={styles.footerColumnTitle}>Bệnh viện</h4>
            <ul className={styles.footerList}>
              <li>
                <motion.a whileHover={{ x: 5 }} href="#">
                  Về chúng tôi
                </motion.a>
              </li>
              <li>
                <motion.a whileHover={{ x: 5 }} href="#">
                  Tuyển dụng
                </motion.a>
              </li>
              <li>
                <motion.a whileHover={{ x: 5 }} href="#">
                  Báo chí
                </motion.a>
              </li>
            </ul>
          </div>
          <div className={styles.footerColumn}>
            <h4 className={styles.footerColumnTitle}>Bệnh nhân</h4>
            <ul className={styles.footerList}>
              <li>
                <motion.a whileHover={{ x: 5 }} href="#">
                  Thanh toán viện phí
                </motion.a>
              </li>
              <li>
                <motion.a whileHover={{ x: 5 }} href="#">
                  Hồ sơ bệnh án
                </motion.a>
              </li>
              <li>
                <motion.a whileHover={{ x: 5 }} href="#">
                  Hỗ trợ
                </motion.a>
              </li>
            </ul>
          </div>
          <div className={styles.footerColumn}>
            <h4 className={styles.footerColumnTitle}>Pháp lý</h4>
            <ul className={styles.footerList}>
              <li>
                <motion.a whileHover={{ x: 5 }} href="#">
                  Chính sách bảo mật
                </motion.a>
              </li>
              <li>
                <motion.a whileHover={{ x: 5 }} href="#">
                  Điều khoản sử dụng
                </motion.a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>© 2024 CareFirst Clinic. Bảo lưu mọi quyền.</p>
        <div className={styles.footerBottomLinks}>
          <motion.a whileHover={{ color: "#ffffff" }} href="#">
            Chính sách bảo mật
          </motion.a>
          <motion.a whileHover={{ color: "#ffffff" }} href="#">
            Điều khoản sử dụng
          </motion.a>
          <motion.a whileHover={{ color: "#ffffff" }} href="#">
            Trợ năng
          </motion.a>
        </div>
      </div>
    </div>
  </footer>
);

// ===== MAIN COMPONENT =====
const Homepage = () => {
  return (
    <div className={styles.wrapper}>
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <SpecialtiesSection />
        <DoctorsSection />
        <TestimonialsSection />
        <EmergencyBanner />
      </main>
      <Footer />
    </div>
  );
};

export default Homepage;