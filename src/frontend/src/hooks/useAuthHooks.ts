import { useAuth } from '../contexts/AuthContext';

/**
 * Hook để kiểm tra xem người dùng có đã đăng nhập và có đủ role không
 */
export const useRequireAuth = (requiredRoles?: string[]) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return { isAllowed: null, user, isLoading }; // Loading state
  }

  if (!isAuthenticated) {
    return { isAllowed: false, user: null, isLoading: false };
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return { isAllowed: false, user, isLoading: false };
  }

  return { isAllowed: true, user, isLoading: false };
};

/**
 * Hook để lấy access token cho requests thêm
 */
export const useAccessToken = () => {
  const { token } = useAuth();
  return token;
};
