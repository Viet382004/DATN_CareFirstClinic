import { apiPost } from './apiClient';

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  message: string;
  isVerified: boolean;
}

export interface ResendOtpRequest {
  email: string;
}

export const authService = {
  /**
   * Đăng ký tài khoản mới
   */
  async register(data: RegisterRequest): Promise<any> {
    return apiPost('/auth/register', data);
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
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  /**
   * Xác thực OTP
   */
  async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    return apiPost('/auth/verify-otp', data);
  },

  /**
   * Gửi lại OTP
   */
  async resendOtp(data: ResendOtpRequest): Promise<any> {
    return apiPost('/auth/resend-otp', data);
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
  getUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};
