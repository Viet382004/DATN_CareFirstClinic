import { ReactNode } from 'react';

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

export interface AuthProviderProps {
  children: ReactNode;
}
