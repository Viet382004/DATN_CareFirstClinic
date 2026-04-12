import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Calendar, Eye, EyeOff, ArrowRight, Phone, MapPin } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import SocialAuth from '../components/SocialAuth';
import { useAuth } from '../../../contexts/useAuth';

export default function RegisterPage() {
  const { register, verifyOtp, resendOtp, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'register' | 'verify'>('register');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    dateOfBirth: '',
    phoneNumber: '',
    address: '',
    gender: 'Male',
  });

  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        gender: formData.gender as 'Male' | 'Female' | 'Other',
      });

      setStep('verify');
      setSuccess('Đăng ký thành công! Mã xác thực (OTP) đã được gửi đến email của bạn.');
    } catch (err: any) {
      setError(err?.message || 'Đăng ký không thành công. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError('Mã OTP phải là 6 chữ số.');
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyOtp(formData.email, otp);
      setSuccess('Xác thực thành công! Chuyển đến trang đăng nhập...');
      setTimeout(() => {
        navigate('/login', { state: { email: formData.email, justRegistered: true } });
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Xác thực OTP không thành công. Vui lòng kiểm tra lại.');
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    setResendDisabled(true);

    try {
      await resendOtp(formData.email);
      setSuccess('Mã xác thực mới đã được gửi. Vui lòng kiểm tra email của bạn!');
      setTimeout(() => setResendDisabled(false), 30000);
    } catch (err: any) {
      setResendDisabled(false);
      setError(err?.message || 'Gửi lại OTP thất bại. Vui lòng thử lại sau.');
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout
      title={
        <>Đăng ký <br />tài khoản <span className="italic font-normal text-primary-light drop-shadow-none">CareFirst.</span></>
      }
      subtitle="Tạo tài khoản và xác thực email để trải nghiệm đặt lịch khám nhanh chóng."
      imageSrc="https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop"
    >
      <div className="mb-8">
        <h2 className="font-headline text-3xl font-bold text-primary mb-2 italic">Đăng ký</h2>
        <p className="text-slate-600 font-medium">Nhập thông tin để tạo tài khoản mới.</p>
      </div>

      {step === 'register' ? (
        <form className="space-y-5" onSubmit={handleRegister}>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="fullName">
                Họ và tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User size={20} strokeWidth={1.5} />
                </div>
                <input
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors outline-none"
                  id="fullName"
                  name="fullName"
                  placeholder="Nguyễn Văn A"
                  type="text"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={20} strokeWidth={1.5} />
                </div>
                <input
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors outline-none"
                  id="email"
                  name="email"
                  placeholder="email@example.com"
                  type="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="phoneNumber">
                Số điện thoại
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Phone size={20} strokeWidth={1.5} />
                </div>
                <input
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors outline-none"
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="0987xxxxxx"
                  type="tel"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700" htmlFor="dateOfBirth">
                  Ngày sinh
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Calendar size={20} strokeWidth={1.5} />
                  </div>
                  <input
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors outline-none"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700" htmlFor="gender">
                  Giới tính
                </label>
                <select
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors outline-none"
                  id="gender"
                  name="gender"
                  required
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Other">Khác</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="address">
                Địa chỉ
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <MapPin size={20} strokeWidth={1.5} />
                </div>
                <input
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors outline-none"
                  id="address"
                  name="address"
                  placeholder="Địa chỉ"
                  type="text"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="password">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={20} strokeWidth={1.5} />
                </div>
                <input
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-12 py-3 border border-slate-300 rounded-lg bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors outline-none"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="confirmPassword">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={20} strokeWidth={1.5} />
                </div>
                <input
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-12 py-3 border border-slate-300 rounded-lg bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors outline-none"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký (Nhận mã OTP)'}
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Xác thực OTP</h3>
            <p className="text-slate-600 mb-2">
              Chúng tôi đã gửi mã xác thực tới <strong>{formData.email}</strong>.<br />
              Vui lòng kiểm tra hộp thư đến hoặc hộp thư rác (spam).
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleVerifyOtp}>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-700 font-medium">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="otp">
                Nhập mã OTP (6 số)
              </label>
              <input
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(val);
                }}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors outline-none text-center text-2xl font-mono tracking-[0.5em] font-bold text-slate-800"
                id="otp"
                placeholder="000000"
                type="text"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading || otp.length < 6}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              {isSubmitting ? 'Đang xác thực...' : 'Xác thực tài khoản'}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="text-center space-y-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendDisabled}
              className="text-primary hover:text-primary-light font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendDisabled ? 'Vui lòng chờ 30 giây' : 'Gửi lại mã OTP'}
            </button>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setStep('register')}
                className="text-slate-500 hover:text-slate-800 font-medium transition-colors text-sm"
              >
                ← Quay lại màn hình đăng ký
              </button>
            </div>
          </div>
        </div>
      )}

      <SocialAuth />

      <p className="mt-8 text-center text-slate-600">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-primary font-semibold hover:text-primary-light transition-colors ml-2 underline underline-offset-4">
          Đăng nhập ngay
        </Link>
      </p>
    </AuthLayout>
  );
}