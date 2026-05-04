using CareFirstClinic.API.Models;

namespace CareFirstClinic.API.Repositories.ClinicalServiceRepo
{
    public interface IServiceOrderRepository
    {
        Task<IEnumerable<ServiceOrder>> GetByAppointmentIdAsync(Guid appointmentId);
        Task<ServiceOrder?> GetByIdAsync(Guid id);
        Task<IEnumerable<ServiceOrder>> GetPendingOrdersAsync(Guid? specialtyId = null);
        Task AddRangeAsync(IEnumerable<ServiceOrder> orders);
        Task UpdateAsync(ServiceOrder order);
        Task<bool> LockOrderAsync(Guid orderId, Guid doctorId);
        Task<bool> UnlockOrderAsync(Guid orderId);
    }
}
