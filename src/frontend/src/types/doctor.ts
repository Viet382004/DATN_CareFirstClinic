export interface Doctor {
  id: string;
  avatarUrl?: string;
  fullName: string;
  specialtyName: string;
  academicTitle: string;
  position: string;
  description: string;
  yearsOfExperience: number;
  phoneNumber: string;
  email?: string;
  totalAppointments: number;
  averageRating: number;
  userId?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  user?: {
    id: string;
    email: string;
    isActive: boolean;
    isEmailVerified: boolean;
  };
}


export interface CreateDoctorDTO {
  fullName: string;
  specialtyId: string;
  academicTitle: string;
  position: string;
  description?: string;
  yearsOfExperience: number;
  phoneNumber: string;
  email: string;
  userName: string;
  password: string;
  userId?: string;
}


export interface UpdateDoctorDTO {
  fullName?: string;
  specialtyId?: string;
  academicTitle?: string;
  position?: string;
  description?: string;
  yearsOfExperience?: number;
  phoneNumber?: string;
  email?: string;
}

export interface DoctorQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  specialtyId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}