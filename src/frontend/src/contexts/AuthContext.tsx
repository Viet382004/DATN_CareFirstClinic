import { useState, useEffect } from 'react';
import { authService } from '../services/authService.ts';
import { patientService } from '../services/patientService';
import { AuthContext } from './AuthContextCore';
import type { AuthContextType, AuthProviderProps, User } from './AuthContextTypes';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleLogout = () => {
      logout();
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);

      const rawRole = response.data.roleName
        || 'Patient';

      const newUser: User = {
        id: response.data.id || response.data.id || '',
        email: response.data.email || response.data.email || email,
        fullName: response.data.fullName || response.data.fullName || '',
        role: rawRole.toString().trim(),
      };

      // Lưu vào localStorage trước
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      // Cập nhật state
      setToken(response.accessToken);
      setUser(newUser);

      console.log('Login thành công!');
      console.log('   - Token:', response.accessToken ? 'Có' : 'Không');
      console.log('   - Role nhận được:', newUser.role);
      console.log('   - User object:', newUser);

      // Đợi state Context cập nhật xong trước khi navigate (rất quan trọng)
      await new Promise(resolve => setTimeout(resolve, 150));

      return { success: true, user: newUser, token: response.accessToken };
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  const register = async (data: {
    email: string;
    password: string;
    fullName: string;
    dateOfBirth: string;
    gender: 'Male' | 'Female' | 'Other';
    phoneNumber: string;
    address: string;
  }) => {
    setIsLoading(true);
    try {
      await authService.register(data);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authService.logout();
  };

  const verifyOtp = async (email: string, otp: string) => {
    setIsLoading(true);
    try {
      await authService.verifyOtp({ email, otpCode: otp });
      return; // Chỉ cần thành công
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      const message = error?.message || 'Xác thực OTP thất bại';
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email: string) => {
    // Don't set isLoading here to avoid disabling buttons
    try {
      await authService.resendOtp({ email });
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    verifyOtp,
    resendOtp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
