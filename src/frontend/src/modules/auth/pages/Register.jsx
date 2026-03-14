import { useState } from "react";
import logo from "../../../assets/logo.png";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  CalendarCheck,
  UserCheck,
  FileText,
  UserPlus,
  ShieldCheck,
  Lock,
} from "lucide-react";
import styles from "./Register.module.css";

// ===== PHOTO ILLUSTRATION =====
const RegisterIllustration = ({ className }) => (
  <img
    className={className}
    src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=85&fit=crop&crop=center"
    alt="Đội ngũ y tế chuyên nghiệp tại CareFirst Clinic"
    loading="lazy"
  />
);

// ===== PASSWORD STRENGTH =====
const getStrength = (pwd) => {
  if (!pwd) return null;
  let score = 0;
  if (pwd.length >= 6) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { level: "weak", label: "Yếu" };
  if (score <= 2) return { level: "medium", label: "Trung bình" };
  return { level: "strong", label: "Mạnh" };
};

// ===== COMPONENT =====
const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    userName: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Vui lòng nhập họ tên";
    else if (form.fullName.trim().length < 2)
      e.fullName = "Họ tên ít nhất 2 ký tự";
    
    if (!form.userName.trim()) e.userName = "Vui lòng nhập tên đăng nhập";
    else if (form.userName.trim().length < 3)
      e.userName = "Tên đăng nhập ít nhất 3 ký tự";

    if (!form.email.trim()) e.email = "Vui lòng nhập email";
    else if (!form.email.includes("@")) e.email = "Email không hợp lệ";

    if (!form.dateOfBirth) e.dateOfBirth = "Vui lòng chọn ngày sinh";
    if (!form.gender) e.gender = "Vui lòng chọn giới tính";

    if (!form.password) e.password = "Vui lòng nhập mật khẩu";
    else if (form.password.length < 6) e.password = "Mật khẩu ít nhất 6 ký tự";

    if (!form.confirmPassword) e.confirmPassword = "Vui lòng xác nhận mật khẩu";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Mật khẩu không khớp";

    if (!agreedToTerms) e.terms = "Bạn cần đồng ý với điều khoản sử dụng";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({}); // Xóa lỗi cũ trước khi gọi API

    try {
      // Gọi hàm register từ context với dữ liệu đã chuẩn hoá
      await register({
        fullName: form.fullName,
        userName: form.userName,
        email: form.email,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        password: form.password,
      });

      // Thành công → redirect về login (hoặc auto-login nếu backend trả token)
      navigate("/");
    } catch (err) {
      // Lấy message lỗi từ backend
      const errorMessage =
        err.message || "Đăng ký thất bại. Có thể email đã tồn tại.";
      setErrors({ form: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const strength = getStrength(form.password);

  return (
    <div className={styles.registerContainer}>
      {/* ===== LEFT — FORM ===== */}
      <div className={styles.leftSide}>
        <div className={styles.formWrapper}>
          {/* Logo */}
          <div className={styles.logoContainer} onClick={() => navigate("/")}>
            <img src={logo} alt="CareFirst Clinic" className={styles.logoImg} />
            <h1 className={styles.registerHeading}>Tạo tài khoản </h1>
          </div>
          <p className={styles.registerSubheading}>
            Tham gia cộng đồng chăm sóc sức khỏe của chúng tôi
          </p>

          {errors.form && (
            <div className={styles.errorBanner}>
              <AlertCircle size={16} />
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="fullName">
                Họ và tên <span className={styles.labelRequired}>*</span>
              </label>
              <input
                id="fullName"
                type="text"
                className={`${styles.input} ${errors.fullName ? styles.inputError : ""}`}
                placeholder="Nguyễn Văn A"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                autoComplete="name"
              />
              {errors.fullName && (
                <span className={styles.fieldError}>{errors.fullName}</span>
              )}
            </div>

            {/* User Name */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="userName">
                Tên đăng nhập <span className={styles.labelRequired}>*</span>
              </label>
              <input
                id="userName"
                type="text"
                className={`${styles.input} ${errors.userName ? styles.inputError : ""}`}
                placeholder="Username123"
                value={form.userName}
                onChange={(e) => update("userName", e.target.value)}
              />
              {errors.userName && (
                <span className={styles.fieldError}>{errors.userName}</span>
              )}
            </div>

            {/* Email */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="email">
                Email <span className={styles.labelRequired}>*</span>
              </label>
              <input
                id="email"
                type="email"
                className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                placeholder="example@email.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                autoComplete="email"
              />
              {errors.email && (
                <span className={styles.fieldError}>{errors.email}</span>
              )}
            </div>

            {/* Date of Birth & Gender Row */}
            <div className={styles.row}>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label className={styles.label} htmlFor="dateOfBirth">
                  Ngày sinh <span className={styles.labelRequired}>*</span>
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  className={`${styles.input} ${errors.dateOfBirth ? styles.inputError : ""}`}
                  value={form.dateOfBirth}
                  onChange={(e) => update("dateOfBirth", e.target.value)}
                />
                {errors.dateOfBirth && (
                  <span className={styles.fieldError}>{errors.dateOfBirth}</span>
                )}
              </div>

              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label className={styles.label} htmlFor="gender">
                  Giới tính <span className={styles.labelRequired}>*</span>
                </label>
                <select
                  id="gender"
                  className={`${styles.input} ${errors.gender ? styles.inputError : ""}`}
                  value={form.gender}
                  onChange={(e) => update("gender", e.target.value)}
                >
                  <option value="">Chọn...</option>
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Other">Khác</option>
                </select>
                {errors.gender && (
                  <span className={styles.fieldError}>{errors.gender}</span>
                )}
              </div>
            </div>


            {/* Password */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="password">
                Mật khẩu <span className={styles.labelRequired}>*</span>
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`${styles.input} ${styles.passwordInput} ${errors.password ? styles.inputError : ""}`}
                  placeholder="••••••"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.password && strength && (
                <div className={styles.passwordStrength}>
                  <div className={styles.strengthBar}>
                    <div
                      className={`${styles.strengthFill} ${styles[`strength${strength.level.charAt(0).toUpperCase() + strength.level.slice(1)}`]}`}
                    />
                  </div>
                  <span
                    className={`${styles.strengthLabel} ${styles[strength.level]}`}
                  >
                    {strength.label}
                  </span>
                </div>
              )}
              {errors.password && (
                <span className={styles.fieldError}>{errors.password}</span>
              )}
            </div>

            {/* Confirm Password */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="confirmPassword">
                Xác nhận mật khẩu{" "}
                <span className={styles.labelRequired}>*</span>
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className={`${styles.input} ${styles.passwordInput} ${errors.confirmPassword ? styles.inputError : ""}`}
                  placeholder="••••••"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className={styles.fieldError}>
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            {/* Terms */}
            <div className={styles.termsGroup}>
              <input
                type="checkbox"
                id="terms"
                className={styles.checkbox}
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              <label htmlFor="terms" className={styles.termsLabel}>
                Tôi đồng ý với{" "}
                <a href="#" className={styles.termsLink}>
                  Điều khoản dịch vụ
                </a>{" "}
                và{" "}
                <a href="#" className={styles.termsLink}>
                  Chính sách bảo mật
                </a>
              </label>
            </div>
            {errors.terms && (
              <span
                className={styles.fieldError}
                style={{ display: "block", marginBottom: "0.75rem" }}
              >
                {errors.terms}
              </span>
            )}

            {/* Submit */}
            <button
              type="submit"
              className={styles.registerButton}
              disabled={isLoading}
            >
              {isLoading ? (
                "Đang tạo tài khoản..."
              ) : (
                <>
                  Tạo tài khoản
                  <UserPlus size={18} className={styles.registerIcon} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className={styles.divider}>
            <div className={styles.dividerLine} />
            <span className={styles.dividerText}>hoặc tiếp tục với</span>
            <div className={styles.dividerLine} />
          </div>

          {/* Social */}
          <div className={styles.socialButtons}>
            <button className={styles.socialButton}>
              <svg className={styles.socialIconImg} viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            <button className={styles.socialButton}>
              <svg className={styles.socialIconImg} viewBox="0 0 24 24">
                <path fill="#00a4ef" d="M11.5 0H0v11.5h11.5V0z" />
                <path fill="#ffb900" d="M24 0H12.5v11.5H24V0z" />
                <path fill="#7fba00" d="M11.5 12.5H0V24h11.5V12.5z" />
                <path fill="#f25022" d="M24 12.5H12.5V24H24V12.5z" />
              </svg>
              Microsoft
            </button>
          </div>

          <div className={styles.signInSection}>
            Đã có tài khoản?
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
              className={styles.signInLink}
            >
              Đăng nhập
            </a>
          </div>

          <div className={styles.supportSection}>
            <a href="#" className={styles.supportLink}>
              Cần hỗ trợ? Liên hệ chúng tôi
            </a>
          </div>

          <div className={styles.footerRow}>
            <span>© 2024 CareFirst Clinic</span>
            <a href="#" className={styles.footerLink}>
              Bảo mật
            </a>
            <a href="#" className={styles.footerLink}>
              Điều khoản
            </a>
          </div>
        </div>
      </div>

      {/* ===== RIGHT — VISUAL ===== */}
      <div className={styles.rightSide}>
        {/* Full bleed background photo */}
        <RegisterIllustration className={styles.bgPhoto} />
        {/* Dark gradient overlay */}
        <div className={styles.photoOverlay} />

        {/* Content on top of photo */}
        <div className={styles.visualContent}>
          <h2 className={styles.visualHeading}>
            Bắt đầu hành trình
            <br />
            <span>chăm sóc sức khỏe</span>
          </h2>
          <p className={styles.visualSubheading}>
            Đăng ký miễn phí và trải nghiệm dịch vụ y tế hiện đại, tiện lợi.
          </p>

          {/* Feature list */}
          <div className={styles.featureList}>
            {[
              {
                icon: <CalendarCheck size={15} color="white" />,
                text: "Đặt lịch khám nhanh chóng, tiện lợi",
              },
              {
                icon: <UserCheck size={15} color="white" />,
                text: "Đội ngũ bác sĩ chuyên môn cao",
              },
              {
                icon: <FileText size={15} color="white" />,
                text: "Hồ sơ sức khỏe được lưu trữ an toàn",
              },
            ].map((item, i) => (
              <div key={i} className={styles.featureItem}>
                <div className={styles.featureIcon}>{item.icon}</div>
                <span className={styles.featureText}>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Security badges */}
          <div className={styles.badgeRow}>
            <div className={styles.securityBadge}>
              <ShieldCheck size={15} />
              <span>Tuân thủ HIPAA</span>
            </div>
            <div className={styles.securityBadge}>
              <Lock size={15} />
              <span>Mã hoá SSL 256-bit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;