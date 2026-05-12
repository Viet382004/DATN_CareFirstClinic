import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  fallbackPath = '/login',
}) => {
  const { isAuthenticated, user, isLoading, token } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Chỉ chạy timer này 1 lần khi isLoading chuyển sang false
    if (!isLoading) {
      const timer = setTimeout(() => setIsReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isLoading || (!isReady && !isAuthenticated)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
           <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">
             Đang xác thực quyền...
           </p>
        </div>
      </div>
    );
  }

  // Kiểm tra chặt chẽ hơn
  if (!isAuthenticated || !user || !token) {
    console.log('ProtectedRoute: Chưa đăng nhập hoặc thiếu token → redirect về login');
    return <Navigate to={fallbackPath} replace />;
  }

  const userRole = user.role.toLowerCase().trim();
  const requiredLower = requiredRoles.map(r => r.toLowerCase().trim());

  if (requiredRoles.length > 0 && !requiredLower.includes(userRole)) {
    console.log(`ProtectedRoute: Role không khớp → User: "${userRole}", Required: ${requiredLower}`);
    return <Navigate to="/" replace />;
  }

  console.log(`ProtectedRoute: ✅ Cho phép truy cập thành công - Role: ${userRole}`);
  return <>{children}</>;
};