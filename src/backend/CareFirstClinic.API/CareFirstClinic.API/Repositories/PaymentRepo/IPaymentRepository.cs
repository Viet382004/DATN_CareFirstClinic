using CareFirstClinic.API.Models;

namespace CareFirstClinic.API.Repositories
{
    public interface IPaymentRepository
    {
        Task<List<Payment>> GetAllAsync();
        Task<Payment?> GetByIdAsync(Guid id);
        Task<Payment?> GetByAppointmentIdAsync(Guid appointmentId);
        Task<List<Payment>> GetByPatientIdAsync(Guid patientId);
        Task<bool> ExistsByAppointmentIdAsync(Guid appointmentId);
        Task<Payment> AddAsync(Payment payment);
        Task<Payment> UpdateAsync(Payment payment);
    }
}