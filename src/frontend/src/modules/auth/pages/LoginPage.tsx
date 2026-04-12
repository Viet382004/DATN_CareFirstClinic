import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import SocialAuth from '../components/SocialAuth';
import { useAuth } from '../../../contexts/useAuth';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy email từ state (sau khi đăng ký) hoặc để trống
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    location.state?.justRegistered ? '✅ Đăng ký thành công! Vui lòng đăng nhập.' : ''
  );

  // Tự động xóa thông báo sau 5 giây
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Chuyển hướng sau khi đăng nhập thành công
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const role = user.role.toLowerCase().trim();
      console.log(`[LoginPage] Role nhận được: "${role}"`);

      let targetPath = '/'; // Mặc định về trang chủ
      if (role === 'doctor') targetPath = '/doctor/dashboard';
      else if (role === 'admin') targetPath = '/admin/dashboard';
      // patient thì về trang chủ

      console.log(`→ Đang navigate đến: ${targetPath}`);
      navigate(targetPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      // Không navigate ở đây, useEffect sẽ xử lý
    } catch (err: any) {
      setError(err?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Nếu đã đăng nhập, redirect (tránh trường hợp đã login rồi mà vẫn vào login)
  if (isAuthenticated && user?.role) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout
      title={
        <>Chăm sóc sức khỏe <br />
          bắt đầu từ <span className="italic font-normal text-primary-light drop-shadow-none">đăng nhập.</span>
        </>
      }
      subtitle="Đăng nhập bằng tài khoản của bạn để tiếp tục đặt lịch và quản lý thông tin cá nhân."
      imageSrc="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=2069&auto=format&fit=crop"
    >
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <h2 className="font-headline text-3xl font-bold text-primary mb-2 italic">Đăng nhập</h2>
          <p className="text-slate-600 font-medium">Vui lòng nhập email và mật khẩu để truy cập.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {successMessage && (
            <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-700 font-medium">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Mail size={20} strokeWidth={1.5} />
              </div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors outline-none"
                id="email"
                placeholder="email@example.com"
                type="email"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-slate-700" htmlFor="password">
                Mật khẩu
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-light transition-colors">
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Lock size={20} strokeWidth={1.5} />
              </div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 border border-slate-300 rounded-lg bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors outline-none"
                id="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang xử lý...
              </span>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        <SocialAuth />

        <p className="mt-8 text-center text-slate-600">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-primary font-semibold hover:text-primary-light transition-colors underline underline-offset-4">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}