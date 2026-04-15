export type ServiceTypeId = 'general-consultation' | 'specialty-consultation' | 'follow-up';

export interface ServiceTypeOption {
  id: ServiceTypeId;
  name: string;
  consultationFee: number;
  description: string;
}

export const SERVICE_TYPE_OPTIONS: ServiceTypeOption[] = [
  {
    id: 'general-consultation',
    name: 'Khám tổng quát',
    consultationFee: 200000,
    description: 'Khám sàng lọc sức khỏe tổng quát ban đầu.'
  },
  {
    id: 'specialty-consultation',
    name: 'Khám chuyên khoa',
    consultationFee: 250000,
    description: 'Khám chuyên sâu theo chuyên khoa đã chọn.'
  },
  {
    id: 'follow-up',
    name: 'Tái khám',
    consultationFee: 150000,
    description: 'Tái khám theo lịch hẹn hoặc chỉ định của bác sĩ.'
  }
];

export const DEFAULT_SERVICE_TYPE_ID: ServiceTypeId = 'specialty-consultation';

export function getServiceTypeById(id?: string | null): ServiceTypeOption {
  return (
    SERVICE_TYPE_OPTIONS.find((option) => option.id === id) ??
    SERVICE_TYPE_OPTIONS.find((option) => option.id === DEFAULT_SERVICE_TYPE_ID) ??
    SERVICE_TYPE_OPTIONS[0]
  );
}

export function getDefaultServiceType(specialtyName?: string | null): ServiceTypeOption {
  if (!specialtyName) {
    return getServiceTypeById(DEFAULT_SERVICE_TYPE_ID);
  }

  return getServiceTypeById('specialty-consultation');
}
