export interface ServiceField {
  id: string;
  fieldName: string;
  unit?: string;
  dataType?: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  description?: string;
  specialtyId?: string;
  isActive: boolean;
  fields: ServiceField[];
}

export interface ServiceOrder {
  id: string;
  appointmentId: string;
  serviceId: string;
  serviceName: string;
  priceAtOrder: number;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
  lockedByDoctorId?: string;
  lockedByDoctorName?: string;
  lockedAt?: string;
  resultData?: string; // JSON string containing { [fieldName]: string | number }
  patientName?: string;
  serviceFields?: ServiceField[];
}

export interface UpdateServiceOrderResultDTO {
  resultData: string;
}

export interface CreateServiceDTO {
  name: string;
  price: number;
  description?: string;
  specialtyId?: string;
  fields: { fieldName: string; unit?: string; dataType: string }[];
}
