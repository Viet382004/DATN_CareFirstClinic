using CareFirstClinic.API.Data;
using CareFirstClinic.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CareFirstClinic.API.Repositories.SpecialtyRepo
{
    public class SpecialtyRepository : ISpecialtyRepository
    {
        private readonly CareFirstClinicDbContext _context;
        private readonly ILogger<SpecialtyRepository> _logger;

        public SpecialtyRepository(CareFirstClinicDbContext context, ILogger<SpecialtyRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET ALL
        public async Task<List<Specialty>> GetAllAsync()
        {
            try
            {
                return await _context.Specialties
                    .Include(s => s.Doctors.Where(d => d.User.IsActive)) // Chỉ đếm bác sĩ còn active
                    .Where(s => s.IsActive)
                    .OrderBy(s => s.Name)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách chuyên khoa.");
                throw;
            }
        }

        // GET BY ID
        public async Task<Specialty?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không hợp lệ.", nameof(id));

            try
            {
                return await _context.Specialties
                    .Include(s => s.Doctors.Where(d => d.User.IsActive))
                    .FirstOrDefaultAsync(s => s.Id == id && s.IsActive);
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy chuyên khoa Id: {Id}", id);
                throw;
            }
        }

        // EXISTS BY NAME — Kiểm tra trùng tên
        // excludeId dùng khi update (bỏ qua chính nó)
        public async Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Tên chuyên khoa không được để trống.", nameof(name));

            try
            {
                return await _context.Specialties
                    .AnyAsync(s => s.Name.ToLower() == name.ToLower().Trim()
                               && s.IsActive
                               && (!excludeId.HasValue || s.Id != excludeId.Value));
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi kiểm tra tên chuyên khoa: {Name}", name);
                throw;
            }
        }

        // ADD
        public async Task<Specialty> AddAsync(Specialty specialty)
        {
            ArgumentNullException.ThrowIfNull(specialty);

            try
            {
                _context.Specialties.Add(specialty);
                await _context.SaveChangesAsync();
                return specialty;
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi DB khi thêm chuyên khoa: {Name}", specialty.Name);
                throw new InvalidOperationException("Không thể tạo chuyên khoa. Vui lòng thử lại.", ex);
            }
        }

        // UPDATE
        public async Task<Specialty> UpdateAsync(Specialty specialty)
        {
            ArgumentNullException.ThrowIfNull(specialty);

            var exists = await _context.Specialties
                .AnyAsync(s => s.Id == specialty.Id && s.IsActive);

            if (!exists)
                throw new KeyNotFoundException(
                    $"Không tìm thấy chuyên khoa với Id: {specialty.Id}");

            try
            {
                _context.Specialties.Update(specialty);
                await _context.SaveChangesAsync();
                return specialty;
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, "Xung đột dữ liệu khi cập nhật chuyên khoa Id: {Id}", specialty.Id);
                throw new InvalidOperationException("Dữ liệu đã bị thay đổi bởi người khác. Vui lòng tải lại.", ex);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi DB khi cập nhật chuyên khoa Id: {Id}", specialty.Id);
                throw new InvalidOperationException("Không thể cập nhật chuyên khoa. Vui lòng thử lại.", ex);
            }
        }

        // SOFT DELETE
        public async Task<bool> SoftDeleteAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không hợp lệ.", nameof(id));

            try
            {
                var specialty = await _context.Specialties
                    .FirstOrDefaultAsync(s => s.Id == id && s.IsActive);

                if (specialty is null) return false;

                // Điều kiện: không xóa nếu còn bác sĩ đang dùng chuyên khoa này
                var hasDoctors = await _context.Doctors
                    .AnyAsync(d => d.SpecialtyId == id && d.User.IsActive);

                if (hasDoctors)
                    throw new InvalidOperationException(
                        "Không thể xóa chuyên khoa đang có bác sĩ hoạt động.");

                specialty.IsActive = false;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (InvalidOperationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa mềm chuyên khoa Id: {Id}", id);
                throw;
            }
        }

        // TOGGLE ACTIVE - Kích hoạt hoặc hủy kích hoạt chuyên khoa
        public async Task<bool> ToggleActiveAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không hợp lệ.", nameof(id));

            try
            {
                var specialty = await _context.Specialties
                    .FirstOrDefaultAsync(s => s.Id == id);

                if (specialty is null)
                    throw new KeyNotFoundException($"Không tìm thấy chuyên khoa với Id: {id}");

                specialty.IsActive = !specialty.IsActive;
                await _context.SaveChangesAsync();
                return specialty.IsActive;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi toggle active chuyên khoa Id: {Id}", id);
                throw;
            }
        }
    }
}