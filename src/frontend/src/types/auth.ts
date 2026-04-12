export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  phoneNumber: string;
  address: string;
}


export interface VerifyOtpRequest {
  email: string;
  otpCode: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  message: string;
  data: {
    id: string;
    email: string;
    fullName: string;
    roleName: string;
  };
}
export interface VerifyOtpResponse {
  message: string;
  token: string;
}

export interface RegisterResponse {
  message: string;
  email: string;
  patientId?: string;
  isAutoVerified?: boolean;
}

export interface ResendOtpResponse {
  message: string;
}

export interface ResendOtpRequest {
  email: string;
}