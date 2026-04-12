export interface Specialty {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  totalDoctors: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpecialtyDTO {
  name: string;
  description?: string;
  icon?: string;
}

export interface UpdateSpecialtyDTO {
  name?: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
}