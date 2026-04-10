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

  // Listen for logout events (e.g., from 401 responses)
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
      setToken(response.accessToken);
      setUser({
        id: response.data.id,
        email: response.data.email,
        fullName: response.data.fullName,
        role: response.data.roleName,
      });
    } finally {
      setIsLoading(false);
    }
  };
  const register = async (data: {
    email: string;
    password: string;
    fullName: string;
    dateOfBirth: string;
    gender: string;
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
    const response = await authService.verifyOtp({ email, otpCode: otp });

    if (response.token) {
      // Store token in localStorage và state
      localStorage.setItem('token', response.token);
      setToken(response.token);

      // Small delay để ensure token được update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Load patient profile after OTP verification
      try {
        const profile = await patientService.getMe();
        const newUser: User = {
          id: profile.userId ?? profile.id ?? '',
          email: email,
          fullName: profile.fullName,
          role: 'Patient',
        };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
      } catch (profileError) {
        console.error('Error loading patient profile:', profileError);
        // Create user from OTP data if profile load fails
        const newUser: User = {
          id: '',
          email,
          fullName: '',
          role: 'Patient',
        };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
      }
    } else {
      throw new Error('Không nhận được token từ server');
    }

    return;
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
