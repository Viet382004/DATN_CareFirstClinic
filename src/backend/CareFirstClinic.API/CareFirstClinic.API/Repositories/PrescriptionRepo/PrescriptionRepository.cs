using CareFirstClinic.API.Data;
using CareFirstClinic.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CareFirstClinic.API.Repositories
{
    public class PrescriptionRepository : IPrescriptionRepository
    {
        private readonly CareFirstClinicDbContext _context;
        private readonly ILogger<PrescriptionRepository> _logger;

        public PrescriptionRepository(CareFirstClinicDbContext context, ILogger<PrescriptionRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        private IQueryable<Prescription> BaseQuery() =>
            _context.Prescriptions
                .Include(p => p.MedicalRecord)
                .Include(p => p.Details)
                    .ThenInclude(d => d.Stock);

        public async Task<Prescription?> GetByIdAsync(Guid id)
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

        public async Task<Prescription?> GetByMedicalRecordIdAsync(Guid medicalRecordId)
        {
            if (medicalRecordId == Guid.Empty)
                throw new ArgumentException("MedicalRecordId không hợp lệ.", nameof(medicalRecordId));
            try
            {
                return await BaseQuery()
                    .FirstOrDefaultAsync(p => p.MedicalRecordId == medicalRecordId);
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByMedicalRecordId: {Id}", medicalRecordId);
                throw;
            }
        }

        public async Task<bool> ExistsByMedicalRecordIdAsync(Guid medicalRecordId)
        {
            try
            {
                return await _context.Prescriptions
                    .AnyAsync(p => p.MedicalRecordId == medicalRecordId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi ExistsByMedicalRecordId: {Id}", medicalRecordId);
                throw;
            }
        }

        public async Task<Prescription> AddAsync(Prescription prescription)
        {
            ArgumentNullException.ThrowIfNull(prescription);
            try
            {
                _context.Prescriptions.Add(prescription);
                await _context.SaveChangesAsync();
                return prescription;
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi DB khi thêm Prescription.");
                throw new InvalidOperationException("Không thể tạo đơn thuốc. Vui lòng thử lại.", ex);
            }
        }

        public async Task<Prescription> UpdateStatusAsync(Guid id, PrescriptionStatus status)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không hợp lệ.", nameof(id));
            try
            {
                var prescription = await _context.Prescriptions
                    .Include(p => p.Details).ThenInclude(d => d.Stock)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (prescription is null)
                    throw new KeyNotFoundException($"Không tìm thấy đơn thuốc với Id: {id}");

                prescription.Status = status;
                await _context.SaveChangesAsync();
                return prescription;
            }
            catch (ArgumentException) { throw; }
            catch (KeyNotFoundException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi UpdateStatus Prescription Id: {Id}", id);
                throw;
            }
        }
    }
}