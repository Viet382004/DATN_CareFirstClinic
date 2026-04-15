using CareFirstClinic.API.Common;
using CareFirstClinic.API.Data;
using CareFirstClinic.API.DTOs;
using CareFirstClinic.API.DTOs.Payment;
using CareFirstClinic.API.Models;
using CareFirstClinic.API.Repositories.PaymentRepo;
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
        public async Task<PaymentDTO?> GetByOrderIdAsync(string orderId)
        {
            if (string.IsNullOrEmpty(orderId))
                throw new ArgumentException("OrderId không được để trống.", nameof(orderId));
            try
            {
                var payment = await _paymentRepo.GetByOrderIdAsync(orderId);
                return payment is null ? null : MapToDTO(payment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByOrderId: {OrderId}", orderId);
                throw new ApplicationException("Không thể lấy thông tin thanh toán.", ex);
            }
        }
        public async Task<PaymentDTO?> FailAsync(Guid id, string? errorCode)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));
            try
            {
                var payment = await _paymentRepo.GetByIdAsync(id);
                if (payment is null) return null;

                if (payment.Status != PaymentStatus.Pending)
                    throw new InvalidOperationException(
                        $"Không thể đánh dấu thất bại cho thanh toán đang ở trạng thái '{payment.Status}'.");

                payment.Status = PaymentStatus.Failed;
                payment.Notes = $"{payment.Notes} | Failed: {errorCode}";

                var updated = await _paymentRepo.UpdateAsync(payment);
                return MapToDTO(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Fail Payment Id: {Id}", id);
                throw new ApplicationException("Không thể đánh dấu thanh toán thất bại.", ex);
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

            var exists = await _paymentRepo.ExistsByAppointmentIdAndTypeAsync(dto.AppointmentId, dto.Type);
            if (exists)
                throw new InvalidOperationException("Lịch hẹn này đã có thanh toán cho loại phí tương ứng.");

            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == dto.AppointmentId);
            if (appointment is null)
                throw new KeyNotFoundException("Không tìm thấy lịch hẹn.");

            if (appointment.PatientId != dto.PatientId)
                throw new UnauthorizedAccessException("Patient không khớp với lịch hẹn.");

            if (appointment.Status == AppointmentStatus.Cancelled)
                throw new InvalidOperationException("Không thể thanh toán cho lịch hẹn đã bị hủy.");

            if (dto.Type == PaymentType.ConsultationFee)
            {
                if (appointment.IsConsultationPaid)
                    throw new InvalidOperationException("Phí khám đã được thanh toán.");
                
                // Fallback if fee is 0 due to previous bug
                if (appointment.ConsultationFee <= 0)
                {
                    appointment.ConsultationFee = 200000;
                    _context.Appointments.Update(appointment);
                    await _context.SaveChangesAsync();
                }

                if (dto.Amount <= 0) dto.Amount = appointment.ConsultationFee;

                if (dto.Amount != appointment.ConsultationFee)
                    throw new InvalidOperationException("Số tiền phí khám không khớp với lịch hẹn.");
            }
            else if (dto.Type == PaymentType.MedicineFee)
            {
                if (!appointment.IsConsultationPaid)
                    throw new InvalidOperationException("Vui lòng thanh toán phí khám trước khi thanh toán phí thuốc.");
                if (appointment.Status != AppointmentStatus.Completed)
                    throw new InvalidOperationException("Chỉ được thanh toán phí thuốc sau khi bác sĩ hoàn thành khám.");
                if (appointment.IsMedicinePaid)
                    throw new InvalidOperationException("Phí thuốc đã được thanh toán.");
                if (appointment.MedicineFee <= 0)
                    throw new InvalidOperationException("Không có phí thuốc cần thanh toán.");
                if (dto.Amount != appointment.MedicineFee)
                    throw new InvalidOperationException("Số tiền phí thuốc không khớp với lịch hẹn.");
            }

            // Parse PaymentMethod
            if (!Enum.TryParse<PaymentMethod>(dto.Method, ignoreCase: true, out var method))
                throw new ArgumentException(
                    $"Phương thức thanh toán '{dto.Method}' không hợp lệ. " +
                    "Chấp nhận: Cash, CreditCard, VNPay, BankTransfer.");

            try
            {
                var payment = new Payment
                {
                    Id = Guid.NewGuid(),
                    PatientId = patientId,
                    AppointmentId = dto.AppointmentId,
                    OrderId = GenerateOrderId(patientId),
                    Amount = dto.Amount,
                    Type = dto.Type,
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
        public async Task<PaymentDTO?> CompleteAsync(Guid id, string? transactionId, string? bankCode = null)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));
            try
            {
                var payment = await _paymentRepo.GetByIdAsync(id);
                if (payment is null) return null;

                if (payment.Status == PaymentStatus.Completed)
                    return MapToDTO(payment);

                if (payment.Status != PaymentStatus.Pending)
                    throw new InvalidOperationException(
                        $"Không thể xác nhận thanh toán đang ở trạng thái '{payment.Status}'.");

                payment.Status = PaymentStatus.Completed;
                payment.TransactionId = transactionId?.Trim();
                payment.BankCode = bankCode;  // ⭐ Lưu bankCode
                payment.PaidAt = DateTime.UtcNow;

                // ⭐ Cập nhật Appointment nếu cần
                var appointment = await _context.Appointments.FindAsync(payment.AppointmentId);
                if (appointment != null)
                {
                    if (payment.Type == PaymentType.ConsultationFee)
                    {
                        appointment.IsConsultationPaid = true;
                        if (appointment.Status == AppointmentStatus.Pending)
                        {
                            appointment.Status = AppointmentStatus.Confirmed;
                        }
                    }
                    else if (payment.Type == PaymentType.MedicineFee)
                    {
                        appointment.IsMedicinePaid = true;
                    }
                    appointment.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }

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
            OrderId = p.OrderId,
            Amount = p.Amount,
            Method = p.Method.ToString(),
            Status = p.Status.ToString(),
            Type = p.Type.ToString(),
            TransactionId = p.TransactionId,
            BankCode = p.BankCode,
            Notes = p.Notes,
            CreatedAt = p.CreatedAt,
            PaidAt = p.PaidAt
        };

        private string GenerateOrderId(Guid patientId)
        {
            // VNPAY.NET yêu cầu TxnRef là số (long), nên tạo mã đơn numeric.
            var unixMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var random = Random.Shared.Next(100, 999);
            return $"{unixMs}{random}";
        }
    }
}