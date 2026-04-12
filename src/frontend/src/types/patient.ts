export interface Patient {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  age?: number;
  phoneNumber: string;
  email?: string;
  address?: string;
  medicalHistory?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePatientDTO {
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  phoneNumber?: string;
  address?: string;
  medicalHistory?: string;
}