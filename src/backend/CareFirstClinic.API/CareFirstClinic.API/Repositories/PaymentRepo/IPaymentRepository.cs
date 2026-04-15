using CareFirstClinic.API.Common;
using CareFirstClinic.API.Models;

namespace CareFirstClinic.API.Repositories.PaymentRepo
{
    public interface IPaymentRepository
    {
        Task<List<Payment>> GetAllAsync();
        Task<Payment?> GetByIdAsync(Guid id);
        Task<Payment?> GetByAppointmentIdAsync(Guid appointmentId);
        Task<List<Payment>> GetByPatientIdAsync(Guid patientId);
        Task<Payment?> GetByOrderIdAsync(string orderId);
        Task<bool> ExistsByAppointmentIdAsync(Guid appointmentId);
        Task<bool> ExistsByAppointmentIdAndTypeAsync(Guid appointmentId, PaymentType type);
        Task<Payment> AddAsync(Payment payment);
        Task<Payment> UpdateAsync(Payment payment);
        Task<(List<Payment> Items, int Total)> GetPagedAsync(PaymentQueryParams query);
    }
}