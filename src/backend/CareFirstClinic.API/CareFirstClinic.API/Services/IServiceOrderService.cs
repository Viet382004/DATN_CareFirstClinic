using CareFirstClinic.API.DTOs.ClinicalService;

namespace CareFirstClinic.API.Services
{
    public interface IServiceOrderService
    {
        Task<IEnumerable<ServiceOrderDTO>> GetOrdersByAppointmentIdAsync(Guid appointmentId);
        Task<IEnumerable<ServiceOrderDTO>> GetQueueAsync(Guid? specialtyId = null);
        Task<bool> OrderServicesAsync(Guid appointmentId, List<Guid> serviceIds, Guid clinicalDoctorId);
        Task<bool> LockOrderAsync(Guid orderId, Guid doctorId);
        Task<bool> UnlockOrderAsync(Guid orderId);
        Task<bool> SaveResultAsync(Guid orderId, string resultData);
        Task<IEnumerable<ServiceDTO>> GetAvailableServicesAsync();
    }
}
