using CareFirstClinic.API.DTOs.ClinicalService;
using CareFirstClinic.API.Models;
using CareFirstClinic.API.Repositories.AppoinmentRepo;
using CareFirstClinic.API.Repositories.ClinicalServiceRepo;

namespace CareFirstClinic.API.Services
{
    public class ServiceOrderService : IServiceOrderService
    {
        private readonly IServiceOrderRepository _orderRepo;
        private readonly IServiceRepository _serviceRepo;
        private readonly IAppointmentRepository _appointmentRepo;

        public ServiceOrderService(
            IServiceOrderRepository orderRepo,
            IServiceRepository serviceRepo,
            IAppointmentRepository appointmentRepo)
        {
            _orderRepo = orderRepo;
            _serviceRepo = serviceRepo;
            _appointmentRepo = appointmentRepo;
        }

        public async Task<IEnumerable<ServiceOrderDTO>> GetOrdersByAppointmentIdAsync(Guid appointmentId)
        {
            var orders = await _orderRepo.GetByAppointmentIdAsync(appointmentId);
            return orders.Select(MapToDTO);
        }

        public async Task<IEnumerable<ServiceOrderDTO>> GetQueueAsync(Guid? specialtyId = null)
        {
            var orders = await _orderRepo.GetPendingOrdersAsync(specialtyId);
            return orders.Select(MapToDTO);
        }

        public async Task<bool> OrderServicesAsync(Guid appointmentId, List<Guid> serviceIds, Guid clinicalDoctorId)
        {
            var appointment = await _appointmentRepo.GetByIdAsync(appointmentId);
            if (appointment == null) return false;

            var newOrders = new List<ServiceOrder>();
            decimal totalServiceFee = appointment.ServiceFee;

            foreach (var serviceId in serviceIds)
            {
                var service = await _serviceRepo.GetByIdAsync(serviceId);
                if (service != null)
                {
                    newOrders.Add(new ServiceOrder
                    {
                        AppointmentId = appointmentId,
                        ServiceId = serviceId,
                        PriceAtOrder = service.Price,
                        Status = ServiceOrderStatus.Pending
                    });
                    totalServiceFee += service.Price;
                }
            }

            if (newOrders.Any())
            {
                await _orderRepo.AddRangeAsync(newOrders);
                
                // Update appointment status and fee
                appointment.Status = AppointmentStatus.InProgress;
                appointment.ServiceFee = totalServiceFee;
                appointment.UpdatedAt = DateTime.UtcNow;
                
                await _appointmentRepo.UpdateAsync(appointment);
                return true;
            }

            return false;
        }

        public async Task<bool> LockOrderAsync(Guid orderId, Guid doctorId)
        {
            return await _orderRepo.LockOrderAsync(orderId, doctorId);
        }

        public async Task<bool> UnlockOrderAsync(Guid orderId)
        {
            return await _orderRepo.UnlockOrderAsync(orderId);
        }

        public async Task<bool> SaveResultAsync(Guid orderId, string resultData)
        {
            var order = await _orderRepo.GetByIdAsync(orderId);
            if (order == null) return false;

            order.ResultData = resultData;
            order.Status = ServiceOrderStatus.Completed;
            order.LockedByDoctorId = null; // Auto unlock on completion
            order.LockedAt = null;

            await _orderRepo.UpdateAsync(order);
            return true;
        }

        public async Task<IEnumerable<ServiceDTO>> GetAvailableServicesAsync()
        {
            var services = await _serviceRepo.GetAllAsync();
            return services.Select(s => new ServiceDTO
            {
                Id = s.Id,
                Name = s.Name,
                Price = s.Price,
                Description = s.Description,
                IsActive = s.IsActive,
                Fields = s.Fields.Select(f => new ServiceFieldDTO
                {
                    Id = f.Id,
                    FieldName = f.FieldName,
                    Unit = f.Unit,
                    DataType = f.DataType
                }).ToList()
            });
        }

        private ServiceOrderDTO MapToDTO(ServiceOrder so)
        {
            return new ServiceOrderDTO
            {
                Id = so.Id,
                AppointmentId = so.AppointmentId,
                ServiceId = so.ServiceId,
                ServiceName = so.Service?.Name ?? "N/A",
                PriceAtOrder = so.PriceAtOrder,
                Status = so.Status.ToString(),
                LockedByDoctorId = so.LockedByDoctorId,
                LockedByDoctorName = so.LockedByDoctor?.FullName,
                LockedAt = so.LockedAt,
                ResultData = so.ResultData,
                PatientName = so.Appointment?.Patient?.FullName,
                ServiceFields = so.Service?.Fields.Select(f => new ServiceFieldDTO
                {
                    Id = f.Id,
                    FieldName = f.FieldName,
                    Unit = f.Unit,
                    DataType = f.DataType
                }).ToList() ?? new List<ServiceFieldDTO>()
            };
        }
    }
}
