import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import SocialAuth from '../components/SocialAuth';
import { useAuth } from '../../../contexts/useAuth';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (error: any) {
      let message = 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.';
      if (error?.message) {
        message = error.message;
      }
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout
      title={<>Chăm sóc sức khỏe <br />bắt đầu từ <span className="italic font-normal text-primary-light drop-shadow-none">đăng nhập.</span></>}
      subtitle="Đăng nhập bằng tài khoản của bạn để tiếp tục đặt lịch và quản lý thông tin cá nhân."
      imageSrc="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=2069&auto=format&fit=crop"
    >
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <h2 className="font-headline text-3xl font-bold text-primary mb-2 italic">Đăng nhập</h2>
          <p className="text-slate-600 font-medium">Vui lòng nhập email và mật khẩu để truy cập.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
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
                onChange={(event) => setEmail(event.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors outline-none"
                id="email"
                placeholder="email@example.com"
                type="email"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-slate-700" htmlFor="password">
                Mật khẩu
              </label>
              <Link className="text-sm font-medium text-primary hover:text-primary-light transition-colors" to="/forgot-password">
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Lock size={20} strokeWidth={1.5} />
              </div>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full pl-12 pr-12 py-3 border border-slate-300 rounded-lg bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors outline-none"
                id="password"
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

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </form>

        <SocialAuth />

        <p className="mt-8 text-center text-slate-600">
          Chưa có tài khoản?
          <Link to="/register" className="text-primary font-semibold hover:text-primary-light transition-colors ml-2 underline underline-offset-4">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
