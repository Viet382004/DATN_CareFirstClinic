using CareFirstClinic.API.Data;
using CareFirstClinic.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CareFirstClinic.API.Repositories.PatientRepo;

public class PatientRepository : IPatientRepository
{
    private readonly CareFirstClinicDbContext _context;
    private readonly ILogger<PatientRepository> _logger;

    public PatientRepository(CareFirstClinicDbContext context, ILogger<PatientRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET ALL
    public async Task<List<Patient>> GetAllAsync()
    {
        try
        {
            return await _context.Patients
                .Include(p => p.User)
                .Where(p => p.User.IsActive)
                .OrderBy(p => p.FullName)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách bệnh nhân.");
            throw; // Ném lên để Service bắt và xử lý
        }
    }

    // GET BY ID
    public async Task<Patient?> GetByIdAsync(Guid id)
    {
        // Điều kiện: id không được là Guid rỗng
        if (id == Guid.Empty)
            throw new ArgumentException("Id không hợp lệ.", nameof(id));

        try
        {
            return await _context.Patients
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == id && p.User.IsActive);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy bệnh nhân theo Id: {Id}", id);
            throw;
        }
    }

    // GET BY USER ID
    public async Task<Patient?> GetByUserIdAsync(Guid userId)
    {
        if (userId == Guid.Empty)
            throw new ArgumentException("UserId không hợp lệ.", nameof(userId));

        try
        {
            return await _context.Patients
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId && p.User.IsActive);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy bệnh nhân theo UserId: {UserId}", userId);
            throw;
        }
    }

    // ADD
    public async Task<Patient> AddAsync(Patient patient)
    {
        ArgumentNullException.ThrowIfNull(patient);

        // Điều kiện: không cho tạo 2 hồ sơ cho cùng 1 UserId
        if (patient.UserId.HasValue)
        {
            var exists = await _context.Patients
                .AnyAsync(p => p.UserId == patient.UserId && p.User.IsActive);

            if (exists)
                throw new InvalidOperationException(
                    $"UserId {patient.UserId} đã có hồ sơ bệnh nhân.");
        }

        try
        {
            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();
            return patient;
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Lỗi DB khi thêm bệnh nhân mới.");
            throw new InvalidOperationException("Không thể tạo hồ sơ bệnh nhân. Vui lòng thử lại.", ex);
        }
    }

    // UPDATE
    public async Task<Patient> UpdateAsync(Patient patient)
    {
        ArgumentNullException.ThrowIfNull(patient);

        // Điều kiện: bệnh nhân phải tồn tại và còn active
        var exists = await _context.Patients
            .AnyAsync(p => p.Id == patient.Id && p.User.IsActive);

        if (!exists)
            throw new KeyNotFoundException(
                $"Không tìm thấy bệnh nhân với Id: {patient.Id}");

        try
        {
            _context.Patients.Update(patient);
            await _context.SaveChangesAsync();
            return patient;
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogError(ex, "Xung đột dữ liệu khi cập nhật bệnh nhân Id: {Id}", patient.Id);
            throw new InvalidOperationException("Dữ liệu đã bị thay đổi bởi người khác. Vui lòng tải lại.", ex);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Lỗi DB khi cập nhật bệnh nhân Id: {Id}", patient.Id);
            throw new InvalidOperationException("Không thể cập nhật hồ sơ. Vui lòng thử lại.", ex);
        }
    }

    // SOFT DELETE
    public async Task<bool> SoftDeleteAsync(Guid id)
    {
        if (id == Guid.Empty)
            throw new ArgumentException("Id không hợp lệ.", nameof(id));

        try
        {
            var patient = await _context.Patients
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == id && p.User.IsActive);

            if (patient is null) return false;

            patient.User.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa mềm bệnh nhân Id: {Id}", id);
            throw;
        }
    }
}