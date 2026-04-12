using CareFirstClinic.API.Data;
using CareFirstClinic.API.Models;
using CareFirstClinic.API.Repositories.MedicalRecordRepo;
using Microsoft.EntityFrameworkCore;
using CareFirstClinic.API.Common;

namespace CareFirstClinic.API.Repositories.MedicalRecordRepo
{
    public class MedicalRecordRepository : IMedicalRecordRepository
    {
        private readonly CareFirstClinicDbContext _context;
        private readonly ILogger<MedicalRecordRepository> _logger;

        public MedicalRecordRepository(CareFirstClinicDbContext context, ILogger<MedicalRecordRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        private IQueryable<MedicalRecord> BaseQuery() =>
            _context.MedicalRecords
                .Include(m => m.Patient)
                .Include(m => m.Doctor)
                .Include(m => m.Appointment)
                .Include(m => m.Prescription);

        public async Task<List<MedicalRecord>> GetAllAsync()
        {
            try
            {
                return await BaseQuery()
                    .OrderByDescending(m => m.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetAll MedicalRecord.");
                throw;
            }
        }

        public async Task<MedicalRecord?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không hợp lệ.", nameof(id));
            try
            {
                return await BaseQuery()
                    .FirstOrDefaultAsync(m => m.Id == id);
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetById Id: {Id}", id);
                throw;
            }
        }

        public async Task<MedicalRecord?> GetByAppointmentIdAsync(Guid appointmentId)
        {
            if (appointmentId == Guid.Empty)
                throw new ArgumentException("AppointmentId không hợp lệ.", nameof(appointmentId));
            try
            {
                return await BaseQuery()
                    .FirstOrDefaultAsync(m => m.AppointmentId == appointmentId);
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByAppointmentId: {Id}", appointmentId);
                throw;
            }
        }

        public async Task<List<MedicalRecord>> GetByPatientIdAsync(Guid patientId)
        {
            if (patientId == Guid.Empty)
                throw new ArgumentException("PatientId không hợp lệ.", nameof(patientId));
            try
            {
                return await BaseQuery()
                    .Where(m => m.PatientId == patientId)
                    .OrderByDescending(m => m.CreatedAt)
                    .ToListAsync();
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByPatientId: {Id}", patientId);
                throw;
            }
        }

        public async Task<List<MedicalRecord>> GetByDoctorIdAsync(Guid doctorId)
        {
            if (doctorId == Guid.Empty)
                throw new ArgumentException("DoctorId không hợp lệ.", nameof(doctorId));
            try
            {
                return await BaseQuery()
                    .Where(m => m.DoctorId == doctorId)
                    .OrderByDescending(m => m.CreatedAt)
                    .ToListAsync();
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByDoctorId: {Id}", doctorId);
                throw;
            }
        }

        public async Task<bool> ExistsByAppointmentIdAsync(Guid appointmentId)
        {
            try
            {
                return await _context.MedicalRecords
                    .AnyAsync(m => m.AppointmentId == appointmentId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi ExistsByAppointmentId: {Id}", appointmentId);
                throw;
            }
        }

        public async Task<MedicalRecord> AddAsync(MedicalRecord record)
        {
            ArgumentNullException.ThrowIfNull(record);

            try
            {
                // Log chi tiết record trước khi lưu
                _logger.LogInformation("Đang thêm MedicalRecord. AppointmentId: {AppointmentId}, Diagnosis: {Diagnosis}, FollowUpDate: {FollowUpDate}, CreatedAt Kind: {Kind}",
                    record.AppointmentId, record.Diagnosis, record.FollowUpDate, record.CreatedAt.Kind);

                _context.MedicalRecords.Add(record);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Thêm MedicalRecord thành công. Id mới: {Id}", record.Id);
                return record;
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "DbUpdateException khi thêm MedicalRecord. InnerException: {Inner}", ex.InnerException?.Message);
                throw new InvalidOperationException($"Không thể lưu hồ sơ bệnh án vào database. Chi tiết: {ex.InnerException?.Message ?? ex.Message}", ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi không xác định khi thêm MedicalRecord.");
                throw;
            }
        }

        public async Task<MedicalRecord> UpdateAsync(MedicalRecord record)
        {
            ArgumentNullException.ThrowIfNull(record);
            var exists = await _context.MedicalRecords.AnyAsync(m => m.Id == record.Id);
            if (!exists)
                throw new KeyNotFoundException($"Không tìm thấy hồ sơ bệnh án với Id: {record.Id}");
            try
            {
                _context.MedicalRecords.Update(record);
                await _context.SaveChangesAsync();
                return record;
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, "Xung đột dữ liệu MedicalRecord Id: {Id}", record.Id);
                throw new InvalidOperationException("Dữ liệu đã bị thay đổi. Vui lòng tải lại.", ex);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi DB khi cập nhật MedicalRecord Id: {Id}", record.Id);
                throw new InvalidOperationException("Không thể cập nhật hồ sơ bệnh án. Vui lòng thử lại.", ex);
            }
        }
        public async Task<(List<MedicalRecord> Items, int Total)> GetPagedAsync(MedicalRecordQueryParams query)
        {
            var q = BaseQuery();

            // lọc theo bệnh nhân
            if (query.PatientId.HasValue)
                q = q.Where(m => m.PatientId == query.PatientId.Value);

            // lọc theo bác sĩ
            if (query.DoctorId.HasValue)
                q = q.Where(m => m.DoctorId == query.DoctorId.Value);

            // tìm theo chẩn đoán
            if (!string.IsNullOrWhiteSpace(query.Diagnosis))
            {
                var diag = query.Diagnosis.Trim().ToLower();
                q = q.Where(m => m.Diagnosis.ToLower().Contains(diag));
            }

            // lọc khoảng ngày tạo
            if (query.FromDate.HasValue)
                q = q.Where(m => m.CreatedAt.Date >= query.FromDate.Value.Date);

            if (query.ToDate.HasValue)
                q = q.Where(m => m.CreatedAt.Date <= query.ToDate.Value.Date);

            // lọc có/không có ngày tái khám
            if (query.HasFollowUp == true)
                q = q.Where(m => m.FollowUpDate != null);
            else if (query.HasFollowUp == false)
                q = q.Where(m => m.FollowUpDate == null);

            var total = await q.CountAsync();

            // sort
            q = query.SortBy switch
            {
                "followUpDate" => query.IsAscending
                    ? q.OrderBy(m => m.FollowUpDate)
                    : q.OrderByDescending(m => m.FollowUpDate),
                "diagnosis" => query.IsAscending
                    ? q.OrderBy(m => m.Diagnosis)
                    : q.OrderByDescending(m => m.Diagnosis),
                _ => query.IsAscending
                    ? q.OrderBy(m => m.CreatedAt)
                    : q.OrderByDescending(m => m.CreatedAt)
            };

            var items = await q
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            return (items, total);
        }
    }
}