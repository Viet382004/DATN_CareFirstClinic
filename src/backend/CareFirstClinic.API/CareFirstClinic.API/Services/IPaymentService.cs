using CareFirstClinic.API.Common;
using CareFirstClinic.API.DTOs;
using CareFirstClinic.API.DTOs.Payment;

namespace CareFirstClinic.API.Services
{
    public interface IPaymentService
    {
        Task<List<PaymentDTO>> GetAllAsync();
        Task<PaymentDTO?> GetByIdAsync(Guid id);
        Task<PaymentDTO?> GetByAppointmentIdAsync(Guid appointmentId);
        Task<List<PaymentDTO>> GetMyPaymentsAsync(Guid patientId);
        Task<PaymentDTO> CreateAsync(Guid patientId, CreatePaymentDTO dto);
        Task<PaymentDTO?> CompleteAsync(Guid id, string? transactionId);
        Task<PaymentDTO?> RefundAsync(Guid id);
        Task<PagedResult<PaymentDTO>> GetPagedAsync(PaymentQueryParams query);
    }
}