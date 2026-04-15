export interface Patient {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  age?: number;
  phoneNumber: string;
  userEmail?: string;
  address?: string;
  medicalHistory?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isEmailVerified: boolean;
  user?: {
    id: string;
    email: string;
    isActive: boolean;
    isEmailVerified: boolean;
  };
}

export interface UpdatePatientDTO {
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  phoneNumber?: string;
  address?: string;
  medicalHistory?: string;
}