using CareFirstClinic.API.Data;
using CareFirstClinic.API.Models;
using CareFirstClinic.API.Repositories.MedicalRecordRepo;
using Microsoft.EntityFrameworkCore;

namespace CareFirstClinic.API.Repositories
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
                _context.MedicalRecords.Add(record);
                await _context.SaveChangesAsync();
                return record;
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi DB khi thêm MedicalRecord.");
                throw new InvalidOperationException("Không thể tạo hồ sơ bệnh án. Vui lòng thử lại.", ex);
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
    }
}