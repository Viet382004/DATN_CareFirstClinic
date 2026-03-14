// contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosClient from '../services/axiosClient';

const AuthContext = createContext();

// ─── DECODE JWT (không cần thư viện) ──────────────────
// Backend nhúng id, role, fullName vào token luôn
const decodeJwt = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── HELPER: lưu token + decode user + gắn header ────
  const applyToken = (accessToken) => {
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
    axiosClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    // Decode JWT → lấy { id, role, fullName } luôn, không cần gọi /me
    const payload = decodeJwt(accessToken);
    if (payload) {
      setUser({
        id:       payload.id,
        fullName: payload.fullName,
        role:     payload.role,
      });
    }
  };

  // ─── LOGIN ────────────────────────────────────────────
  // Response: { status, message, data: { accessToken } }
  const login = async (credentials) => {
    try {
      const response = await axiosClient.post('/api/auth/login', credentials);
      const accessToken = response.data.accessToken;
      applyToken(accessToken);
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
      );
    }
  };

  // ─── REGISTER ─────────────────────────────────────────
  const register = async (userData) => {
    try {
      const response = await axiosClient.post('/api/auth/register', userData);

      // Nếu backend trả accessToken sau khi đăng ký → auto-login
      const accessToken = response.data?.accessToken;
      if (accessToken) {
        applyToken(accessToken);
        return { success: true, message: 'Đăng ký thành công!' };
      }

      // Không trả token → chỉ thông báo, user cần login thủ công
      return {
        success: true,
        message: response.data.message || 'Đăng ký thành công! Vui lòng đăng nhập.',
      };
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Đăng ký thất bại. Có thể email đã tồn tại.'
      );
    }
  };

  // ─── LOGOUT ───────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axiosClient.defaults.headers.common['Authorization'];
  };

  // ─── RESTORE SESSION KHI REFRESH TRANG ───────────────
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      applyToken(storedToken); // decode JWT → set user luôn
    }
    setLoading(false);
  }, []);

  const value = {
    user,           // { id, fullName, role }
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng trong AuthProvider');
  }
  return context;
};