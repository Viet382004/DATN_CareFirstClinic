using CareFirstClinic.API.Common;
using CareFirstClinic.API.Data;
using CareFirstClinic.API.DTOs;
using CareFirstClinic.API.DTOs.Payment;
using CareFirstClinic.API.Models;
using CareFirstClinic.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CareFirstClinic.API.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository _paymentRepo;
        private readonly CareFirstClinicDbContext _context;
        private readonly ILogger<PaymentService> _logger;

        public PaymentService(
            IPaymentRepository paymentRepo,
            CareFirstClinicDbContext context,
            ILogger<PaymentService> logger)
        {
            _paymentRepo = paymentRepo;
            _context = context;
            _logger = logger;
        }

        public async Task<List<PaymentDTO>> GetAllAsync()
        {
            try
            {
                var list = await _paymentRepo.GetAllAsync();
                return list.Select(MapToDTO).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetAll Payment.");
                throw new ApplicationException("Không thể lấy danh sách thanh toán.", ex);
            }
        }

        public async Task<PaymentDTO?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));
            try
            {
                var p = await _paymentRepo.GetByIdAsync(id);
                return p is null ? null : MapToDTO(p);
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetById Id: {Id}", id);
                throw new ApplicationException("Không thể lấy thông tin thanh toán.", ex);
            }
        }

        public async Task<PaymentDTO?> GetByAppointmentIdAsync(Guid appointmentId)
        {
            if (appointmentId == Guid.Empty)
                throw new ArgumentException("AppointmentId không được để trống.", nameof(appointmentId));
            try
            {
                var p = await _paymentRepo.GetByAppointmentIdAsync(appointmentId);
                return p is null ? null : MapToDTO(p);
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByAppointmentId: {Id}", appointmentId);
                throw new ApplicationException("Không thể lấy thông tin thanh toán.", ex);
            }
        }

        public async Task<List<PaymentDTO>> GetMyPaymentsAsync(Guid patientId)
        {
            if (patientId == Guid.Empty)
                throw new ArgumentException("PatientId không được để trống.", nameof(patientId));
            try
            {
                var list = await _paymentRepo.GetByPatientIdAsync(patientId);
                return list.Select(MapToDTO).ToList();
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetMyPayments PatientId: {Id}", patientId);
                throw new ApplicationException("Không thể lấy lịch sử thanh toán.", ex);
            }
        }

        public async Task<PaymentDTO> CreateAsync(Guid patientId, CreatePaymentDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);
            if (patientId == Guid.Empty)
                throw new ArgumentException("PatientId không hợp lệ.", nameof(patientId));

            var exists = await _paymentRepo.ExistsByAppointmentIdAsync(dto.AppointmentId);
            if (exists)
                throw new InvalidOperationException("Lịch hẹn này đã có thanh toán.");

            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == dto.AppointmentId);
            if (appointment is null)
                throw new KeyNotFoundException("Không tìm thấy lịch hẹn.");

            if (appointment.Status != AppointmentStatus.Completed)
                throw new InvalidOperationException(
                    "Chỉ có thể thanh toán cho lịch hẹn đã hoàn thành.");

            if (appointment.PatientId != patientId)
                throw new UnauthorizedAccessException("Bạn không có quyền thanh toán lịch hẹn này.");

            // Parse PaymentMethod
            if (!Enum.TryParse<PaymentMethod>(dto.Method, ignoreCase: true, out var method))
                throw new ArgumentException(
                    $"Phương thức thanh toán '{dto.Method}' không hợp lệ. " +
                    "Chấp nhận: Cash, CreditCard, BankTransfer, EWallet.");

            try
            {
                var payment = new Payment
                {
                    Id = Guid.NewGuid(),
                    PatientId = patientId,
                    AppointmentId = dto.AppointmentId,
                    Amount = dto.Amount,
                    Method = method,
                    Status = PaymentStatus.Pending,
                    Notes = dto.Notes?.Trim(),
                    CreatedAt = DateTime.UtcNow
                };

                var created = await _paymentRepo.AddAsync(payment);
                var result = await _paymentRepo.GetByIdAsync(created.Id);
                return MapToDTO(result!);
            }
            catch (KeyNotFoundException) { throw; }
            catch (InvalidOperationException) { throw; }
            catch (UnauthorizedAccessException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Create Payment.");
                throw new ApplicationException("Không thể tạo thanh toán.", ex);
            }
        }

        // Admin xác nhận đã nhận tiền
        public async Task<PaymentDTO?> CompleteAsync(Guid id, string? transactionId)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));
            try
            {
                var payment = await _paymentRepo.GetByIdAsync(id);
                if (payment is null) return null;

                if (payment.Status != PaymentStatus.Pending)
                    throw new InvalidOperationException(
                        $"Không thể xác nhận thanh toán đang ở trạng thái '{payment.Status}'.");

                payment.Status = PaymentStatus.Completed;
                payment.TransactionId = transactionId?.Trim();
                payment.PaidAt = DateTime.UtcNow;

                var updated = await _paymentRepo.UpdateAsync(payment);
                return MapToDTO(updated);
            }
            catch (ArgumentException) { throw; }
            catch (InvalidOperationException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Complete Payment Id: {Id}", id);
                throw new ApplicationException("Không thể xác nhận thanh toán.", ex);
            }
        }

        // Admin hoàn tiền
        public async Task<PaymentDTO?> RefundAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));
            try
            {
                var payment = await _paymentRepo.GetByIdAsync(id);
                if (payment is null) return null;

                if (payment.Status != PaymentStatus.Completed)
                    throw new InvalidOperationException(
                        "Chỉ có thể hoàn tiền cho thanh toán đã hoàn thành.");

                payment.Status = PaymentStatus.Refunded;

                var updated = await _paymentRepo.UpdateAsync(payment);
                return MapToDTO(updated);
            }
            catch (ArgumentException) { throw; }
            catch (InvalidOperationException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Refund Payment Id: {Id}", id);
                throw new ApplicationException("Không thể hoàn tiền.", ex);
            }
        }
        public async Task<PagedResult<PaymentDTO>> GetPagedAsync(PaymentQueryParams query)
        {
            try
            {
                var (items, total) = await _paymentRepo.GetPagedAsync(query);
                return new PagedResult<PaymentDTO>
                {
                    Items = items.Select(MapToDTO).ToList(),
                    Page = query.Page,
                    PageSize = query.PageSize,
                    TotalItems = total
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetPaged Payment.");
                throw new ApplicationException("Không thể lấy danh sách thanh toán.", ex);
            }
        }
        private static PaymentDTO MapToDTO(Payment p) => new()
        {
            Id = p.Id,
            PatientId = p.PatientId,
            PatientName = p.Patient?.FullName ?? string.Empty,
            AppointmentId = p.AppointmentId,
            Amount = p.Amount,
            Method = p.Method.ToString(),
            Status = p.Status.ToString(),
            TransactionId = p.TransactionId,
            Notes = p.Notes,
            CreatedAt = p.CreatedAt,
            PaidAt = p.PaidAt
        };
    }
}