import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/authService';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    userName: string;
    email: string;
    password: string;
    fullName: string;
    dateOfBirth: string;
    gender: string;
  }) => Promise<void>;
  logout: () => void;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

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
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    userName: string;
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
      await authService.verifyOtp({ email, otp });
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email: string) => {
    setIsLoading(true);
    try {
      await authService.resendOtp({ email });
    } finally {
      setIsLoading(false);
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
