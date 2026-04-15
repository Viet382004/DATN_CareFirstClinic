using CareFirstClinic.API.Data;
using CareFirstClinic.API.Models;
using CareFirstClinic.API.Repositories.PatientRepo;
using Microsoft.EntityFrameworkCore;
using CareFirstClinic.API.Common;

namespace CareFirstClinic.API.Repositories.PaymentRepo
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly CareFirstClinicDbContext _context;
        private readonly ILogger<PaymentRepository> _logger;

        public PaymentRepository(CareFirstClinicDbContext context, ILogger<PaymentRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        private IQueryable<Payment> BaseQuery() =>
            _context.Payments
                .Include(p => p.Patient)
                .Include(p => p.Appointment);

        public async Task<List<Payment>> GetAllAsync()
        {
            try
            {
                return await BaseQuery()
                    .OrderByDescending(p => p.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetAll Payment.");
                throw;
            }
        }

        public async Task<Payment?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không hợp lệ.", nameof(id));
            try
            {
                return await BaseQuery().FirstOrDefaultAsync(p => p.Id == id);
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetById Id: {Id}", id);
                throw;
            }
        }

        public async Task<Payment?> GetByAppointmentIdAsync(Guid appointmentId)
        {
            if (appointmentId == Guid.Empty)
                throw new ArgumentException("AppointmentId không hợp lệ.", nameof(appointmentId));
            try
            {
                return await BaseQuery()
                    .FirstOrDefaultAsync(p => p.AppointmentId == appointmentId);
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByAppointmentId: {Id}", appointmentId);
                throw;
            }
        }
        public async Task<Payment?> GetByOrderIdAsync(string orderId)
        {
            return await _context.Payments
                .Include(p => p.Patient)
                .Include(p => p.Appointment)
                .FirstOrDefaultAsync(p => p.OrderId == orderId);
        }
        public async Task<List<Payment>> GetByPatientIdAsync(Guid patientId)
        {
            if (patientId == Guid.Empty)
                throw new ArgumentException("PatientId không hợp lệ.", nameof(patientId));
            try
            {
                return await BaseQuery()
                    .Where(p => p.PatientId == patientId)
                    .OrderByDescending(p => p.CreatedAt)
                    .ToListAsync();
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByPatientId: {Id}", patientId);
                throw;
            }
        }

        public async Task<bool> ExistsByAppointmentIdAsync(Guid appointmentId)
        {
            try
            {
                return await _context.Payments
                    .AnyAsync(p => p.AppointmentId == appointmentId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi ExistsByAppointmentId: {Id}", appointmentId);
                throw;
            }
        }

        public async Task<bool> ExistsByAppointmentIdAndTypeAsync(Guid appointmentId, PaymentType type)
        {
            try
            {
                return await _context.Payments
                    .AnyAsync(p => p.AppointmentId == appointmentId && p.Type == type);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi ExistsByAppointmentIdAndType: {Id} - {Type}", appointmentId, type);
                throw;
            }
        }

        public async Task<Payment> AddAsync(Payment payment)
        {
            ArgumentNullException.ThrowIfNull(payment);
            try
            {
                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();
                return payment;
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi DB khi thêm Payment.");
                throw new InvalidOperationException("Không thể tạo thanh toán. Có thể Appointment này đã có Payment.", ex);
            }
        }

        public async Task<Payment> UpdateAsync(Payment payment)
        {
            ArgumentNullException.ThrowIfNull(payment);
            var exists = await _context.Payments.AnyAsync(p => p.Id == payment.Id);
            if (!exists)
                throw new KeyNotFoundException($"Không tìm thấy thanh toán với Id: {payment.Id}");
            try
            {
                _context.Payments.Update(payment);
                await _context.SaveChangesAsync();
                return payment;
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, "Xung đột dữ liệu Payment Id: {Id}", payment.Id);
                throw new InvalidOperationException("Dữ liệu đã bị thay đổi. Vui lòng tải lại.", ex);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Xung đột dữ liệu Payment Id: {Id}", payment.Id);
                throw new InvalidOperationException("Thanh toán đã bị thay đổi hoặc xóa bởi người khác, vui lòng tải lại.", ex);
            }
        }
        public async Task<(List<Payment> Items, int Total)> GetPagedAsync(PaymentQueryParams query)
        {
            var q = BaseQuery(); 

            if (query.PatientId.HasValue)
                q = q.Where(p => p.PatientId == query.PatientId.Value);

            if (!string.IsNullOrWhiteSpace(query.Status) &&
                Enum.TryParse<PaymentStatus>(query.Status, true, out var status))
                q = q.Where(p => p.Status == status);

            if (!string.IsNullOrWhiteSpace(query.Method) &&
                Enum.TryParse<PaymentMethod>(query.Method, true, out var method))
                q = q.Where(p => p.Method == method);

            if (query.FromDate.HasValue)
                q = q.Where(p => p.CreatedAt.Date >= query.FromDate.Value.Date);

            if (query.ToDate.HasValue)
                q = q.Where(p => p.CreatedAt.Date <= query.ToDate.Value.Date);

            var total = await q.CountAsync();

            // sort
            q = query.SortBy switch
            {
                "amount" => query.IsAscending
                    ? q.OrderBy(p => p.Amount)
                    : q.OrderByDescending(p => p.Amount),
                "paidAt" => query.IsAscending
                    ? q.OrderBy(p => p.PaidAt)
                    : q.OrderByDescending(p => p.PaidAt),
                _ => query.IsAscending
                    ? q.OrderBy(p => p.CreatedAt)
                    : q.OrderByDescending(p => p.CreatedAt)
            };

            var items = await q
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            return (items, total);
        }
    }
}