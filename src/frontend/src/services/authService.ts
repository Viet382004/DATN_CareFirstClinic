import { apiPost, apiPatch } from './apiClient';
import type { LoginResponse, RegisterRequest, VerifyOtpRequest, VerifyOtpResponse, RegisterResponse, ResendOtpResponse, ResendOtpRequest } from '../types/auth';



export const authService = {
  /**
   * Đăng ký tài khoản mới
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return apiPost<RegisterResponse>('/auth/register', data);
  },

  /**
   * Đăng nhập - Email và Password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiPost<LoginResponse>('/auth/login', {
      email,
      password,
    });

    // Lưu token vào localStorage
    if (response.accessToken) {
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.id,
        email: response.data.email,
        fullName: response.data.fullName,
        role: response.data.roleName,
      }));
    }

    return response;
  },

  /**
   * Xác thực OTP
   */
  async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    console.log('Verifying OTP for email:', data.email);
    const response = await apiPost<VerifyOtpResponse>('/auth/verify-otp', data);

    console.log('OTP verification response:', response);

    // Lưu token nếu có
    if (response.token) {
      console.log('Token received, storing in localStorage');
      localStorage.setItem('token', response.token);
    } else {
      console.warn('No token in response:', response);
    }

    return response;
  },

  /**
   * Gửi lại OTP
   */
  async resendOtp(data: ResendOtpRequest): Promise<ResendOtpResponse> {
    console.log('Resending OTP for email:', data.email);
    return apiPost<ResendOtpResponse>('/auth/resend-otp', data);
  },

  /**
   * Xác thực nhanh tài khoản
   */
  async forceVerifyUser(userId: string): Promise<{ message: string }> {
    return apiPatch<{ message: string }>(`/auth/force-verify/${userId}`);
  },

  /**
   * Đăng xuất
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Lấy token hiện tại
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  /**
   * Kiểm tra đã đăng nhập
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  },

  /**
   * Lấy thông tin user
   */
  getUser(): {
    id: string;
    email: string;
    fullName: string;
    role: string;
  } | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};
