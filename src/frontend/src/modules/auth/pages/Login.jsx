import { useState } from "react";
import logo from "../../../assets/logo.png";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  LogIn,
  ShieldCheck,
  Lock,
} from "lucide-react";
import styles from "./Login.module.css";

// ===== PHOTO ILLUSTRATION =====
const MedicalIllustration = ({ className }) => (
  <img
    className={className}
    src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=85&fit=crop&crop=faces,center"
    alt="Bác sĩ tư vấn cho bệnh nhân tại phòng khám CareFirst"
    loading="lazy"
  />
);

// ===== COMPONENT =====
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Vui lòng nhập email";
    else if (!form.email.includes("@")) e.email = "Email không hợp lệ";
    if (!form.password) e.password = "Vui lòng nhập mật khẩu";
    else if (form.password.length < 6) e.password = "Mật khẩu ít nhất 6 ký tự";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({}); // Xóa lỗi cũ trước khi gọi API

    try {
      // Gọi hàm login từ context → gọi API thật
      await login(form);
      navigate("/"); // Chuyển về trang chủ sau khi đăng nhập thành công
    } catch (err) {
      // Lấy message lỗi từ backend (nếu có) hoặc fallback
      const errorMessage =
        err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại email/mật khẩu.";
      setErrors({ form: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      {/* ===== LEFT — FORM ===== */}
      <div className={styles.leftSide}>
        <div className={styles.formWrapper}>
          {/* Logo */}
          <div className={styles.logoContainer} onClick={() => navigate("/")}>
            <img src={logo} alt="CareFirst Clinic" className={styles.logoImg} />
            <h1 className={styles.welcomeHeading}>Chào mừng trở lại </h1>
          </div>

          <p className={styles.welcomeSubheading}>
            Đăng nhập để quản lý lịch khám của bạn
          </p>

          {/* Form error */}
          {errors.form && (
            <div className={styles.errorBanner}>
              <AlertCircle size={16} />
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="email">
                Email
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

            {/* Password */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="password">
                Mật khẩu
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`${styles.input} ${styles.passwordInput} ${errors.password ? styles.inputError : ""}`}
                  placeholder="••••••"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span className={styles.fieldError}>{errors.password}</span>
              )}
            </div>

            {/* Remember / Forgot */}
            <div className={styles.rememberForgot}>
              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  className={styles.checkbox}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="rememberMe" className={styles.checkboxLabel}>
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/forgot-password");
                }}
                className={styles.forgotLink}
              >
                Quên mật khẩu?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={styles.signInButton}
              disabled={isLoading}
            >
              {isLoading ? (
                "Đang đăng nhập..."
              ) : (
                <>
                  Đăng nhập
                  <LogIn size={18} className={styles.signInIcon} />
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

          {/* Sign up */}
          <div className={styles.signUpSection}>
            Chưa có tài khoản?
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/register");
              }}
              className={styles.signUpLink}
            >
              Tạo tài khoản
            </a>
          </div>

          <div className={styles.supportSection}>
            <a href="#" className={styles.supportLink}>
              Cần hỗ trợ? Liên hệ chúng tôi
            </a>
          </div>

          {/* Footer */}
          <br />
          <br />
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
        <MedicalIllustration className={styles.bgPhoto} />
        {/* Dark gradient overlay */}
        <div className={styles.photoOverlay} />

        {/* Content overlay at bottom */}
        <div className={styles.visualContent}>
          <h2 className={styles.visualHeading}>
            Sức khỏe của bạn,
            <br />
            <span>ưu tiên của chúng tôi</span>
          </h2>
          <p className={styles.visualSubheading}>
            Đặt lịch khám, theo dõi hồ sơ y tế và kết nối với bác sĩ — mọi lúc,
            mọi nơi.
          </p>

          {/* Stats */}
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>500+</span>
              <span className={styles.statLabel}>Bác sĩ</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>50K+</span>
              <span className={styles.statLabel}>Bệnh nhân</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>99.9%</span>
              <span className={styles.statLabel}>Uptime</span>
            </div>
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

export default Login;
