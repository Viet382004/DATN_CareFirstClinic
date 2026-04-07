// Export tất cả services
export * from './apiClient';
export * from './authService';
export * from './doctorService';
export * from './patientService';
export { appointmentService, type Appointment, type CreateAppointmentDTO, type UpdateAppointmentDTO, type CancelAppointmentDTO, type AppointmentQueryParams } from './appointmentService';
export { paymentService, type Payment, type CreatePaymentDTO, type PaymentQueryParams } from './paymentService';
export * from './specialtyService';
export { scheduleService, type TimeSlot, type Schedule, type CreateScheduleDTO, type UpdateScheduleDTO, type ScheduleQueryParams } from './scheduleService';
export { medicalRecordService, type MedicalRecord, type CreateMedicalRecordDTO, type UpdateMedicalRecordDTO, type MedicalRecordQueryParams } from './medicalRecordService';
export * from './prescriptionService';
export { stockService, type Stock, type CreateStockDTO, type UpdateStockDTO, type ImportStockDTO, type StockQueryParams } from './stockService';
