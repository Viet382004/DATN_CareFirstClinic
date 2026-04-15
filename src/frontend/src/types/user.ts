export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'Patient' | 'Doctor' | 'Admin';
  isActive: boolean;
  isEmailVerified: boolean;
}