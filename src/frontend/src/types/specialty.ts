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

export interface SpecialtyQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: string;
  search?: string;
  isActive?: boolean;
}

export interface SpecialtyResponse {
  success: boolean;
  message: string;
  data: {
    items: Specialty[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
}
