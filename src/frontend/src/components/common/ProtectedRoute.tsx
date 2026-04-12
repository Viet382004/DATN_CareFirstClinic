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
  const { isAuthenticated, user, isLoading, token } = useAuth();   // thêm token để kiểm tra
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Đợi Context ổn định sau navigate
    const timer = setTimeout(() => setIsReady(true), 150);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, token]);

  if (isLoading || !isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        Đang kiểm tra quyền truy cập...
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