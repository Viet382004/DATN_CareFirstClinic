export interface Stock {
  id: string;
  medicineName: string;
  medicineCode?: string;
  unit?: string;
  manufacturer?: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStockDTO {
  medicineName: string;
  medicineCode?: string;
  unit?: string;
  manufacturer?: string;
  quantity: number;
  minQuantity?: number;
  unitPrice: number;
}

export interface UpdateStockDTO {
  medicineName?: string;
  medicineCode?: string;
  unit?: string;
  manufacturer?: string;
  quantity?: number;
  minQuantity?: number;
  unitPrice?: number;
  isActive?: boolean;
}

export interface ImportStockDTO {
  quantity: number;
}