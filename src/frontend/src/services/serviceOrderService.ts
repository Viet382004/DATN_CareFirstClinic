import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';
import type { ServiceOrder, Service, UpdateServiceOrderResultDTO, CreateServiceDTO } from '../types/serviceOrder';

export const serviceOrderService = {
  getOrdersByAppointmentId: async (appointmentId: string): Promise<ServiceOrder[]> => {
    return apiGet<ServiceOrder[]>(`/ServiceOrder/appointment/${appointmentId}`);
  },

  getQueue: async (): Promise<ServiceOrder[]> => {
    return apiGet<ServiceOrder[]>('/ServiceOrder/queue');
  },

  orderServices: async (appointmentId: string, serviceIds: string[]): Promise<{ message: string }> => {
    return apiPost<{ message: string }>(`/ServiceOrder/order/${appointmentId}`, serviceIds);
  },

  lockOrder: async (orderId: string): Promise<{ message: string }> => {
    return apiPost<{ message: string }>(`/ServiceOrder/${orderId}/lock`);
  },

  unlockOrder: async (orderId: string): Promise<{ message: string }> => {
    return apiPost<{ message: string }>(`/ServiceOrder/${orderId}/unlock`);
  },

  saveResult: async (orderId: string, data: UpdateServiceOrderResultDTO): Promise<{ message: string }> => {
    return apiPost<{ message: string }>(`/ServiceOrder/${orderId}/result`, data);
  },

  getAvailableServices: async (): Promise<Service[]> => {
    return apiGet<Service[]>('/ServiceOrder/services');
  },

  // Admin CRUD
  getAllServices: async (): Promise<Service[]> => {
    return apiGet<Service[]>('/Service');
  },

  createService: async (data: CreateServiceDTO): Promise<Service> => {
    return apiPost<Service>('/Service', data);
  },

  updateService: async (id: string, data: CreateServiceDTO): Promise<{ message: string }> => {
    return apiPut<{ message: string }>(`/Service/${id}`, data);
  },

  deleteService: async (id: string): Promise<{ message: string }> => {
    return apiDelete<{ message: string }>(`/Service/${id}`);
  }
};
