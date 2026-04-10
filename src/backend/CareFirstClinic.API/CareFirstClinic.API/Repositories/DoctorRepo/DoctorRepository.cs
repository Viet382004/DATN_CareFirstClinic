using CareFirstClinic.API.Common;
using CareFirstClinic.API.Data;
using CareFirstClinic.API.Models;
using Microsoft.EntityFrameworkCore;
using CareFirstClinic.API.Common;


namespace CareFirstClinic.API.Repositories.DoctorRepo
{
    public class DoctorRepository : IDoctorRepository
    {
        private readonly CareFirstClinicDbContext _context;
        private readonly ILogger<DoctorRepository> _logger;

        public DoctorRepository(CareFirstClinicDbContext context, ILogger<DoctorRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET ALL — chỉ lấy bác sĩ còn active
        public async Task<List<Doctor>> GetAllAsync()
        {
            try
            {
                return await _context.Doctors
                    .Include(d => d.Specialty)
                    .Include(d => d.User)
                    .Where(d => d.User.IsActive)
                    .OrderBy(d => d.FullName)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách bác sĩ.");
                throw;
            }
        }

        
        // GET BY ID
        public async Task<Doctor?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không hợp lệ.", nameof(id));

            try
            {
                return await _context.Doctors
                    .Include(d => d.Specialty)
                    .Include(d => d.User)
                    .FirstOrDefaultAsync(d => d.Id == id && d.User.IsActive);
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy bác sĩ theo Id: {Id}", id);
                throw;
            }
        }

        // GET BY USER ID — Bác sĩ xem hồ sơ bản thân
        public async Task<Doctor?> GetByUserIdAsync(Guid userId)
        {
            if (userId == Guid.Empty)
                throw new ArgumentException("UserId không hợp lệ.", nameof(userId));

            try
            {
                return await _context.Doctors
                    .Include(d => d.Specialty)
                    .Include(d => d.User)
                    .FirstOrDefaultAsync(d => d.UserId == userId && d.User.IsActive);
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy bác sĩ theo UserId: {UserId}", userId);
                throw;
            }
        }

        // GET BY SPECIALTY — Lọc theo chuyên khoa
        public async Task<List<Doctor>> GetBySpecialtyAsync(Guid specialtyId, string? search = null)
        {
            if (specialtyId == Guid.Empty)
                throw new ArgumentException("SpecialtyId không hợp lệ.", nameof(specialtyId));

            try
            {
                var q = _context.Doctors
                    .Include(d => d.Specialty)
                    .Include(d => d.User)
                    .Where(d => d.SpecialtyId == specialtyId && d.User.IsActive);

                if (!string.IsNullOrWhiteSpace(search))
                {
                    var s = search.Trim().ToLower();
                    q = q.Where(d => d.FullName.ToLower().Contains(s) || (d.Specialty != null && d.Specialty.Name.ToLower().Contains(s)));
                }

                return await q
                    .OrderBy(d => d.FullName)
                    .ToListAsync();
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy bác sĩ theo SpecialtyId: {SpecialtyId}", specialtyId);
                throw;
            }
        }

        
        // ADD
        public async Task<Doctor> AddAsync(Doctor doctor)
        {
            ArgumentNullException.ThrowIfNull(doctor);

            // 1. Kiểm tra SpecialtyId
            var specialtyExists = await _context.Specialties
                .AnyAsync(s => s.Id == doctor.SpecialtyId);
            if (!specialtyExists)
                throw new KeyNotFoundException($"Không tìm thấy chuyên khoa với Id: {doctor.SpecialtyId}");

            // 2. Xử lý User account
            if (doctor.User != null)
            {
                // Kiểm tra email trùng
                if (await _context.Users.AnyAsync(u => u.Email == doctor.User.Email))
                    throw new InvalidOperationException("Email đã được sử dụng.");

                // Tìm role Doctor
                var doctorRole = await _context.Roles
                    .FirstOrDefaultAsync(r => r.Name == "Doctor" && r.IsActive);
                
                if (doctorRole == null)
                    throw new InvalidOperationException("Không tìm thấy role 'Doctor' trong hệ thống.");

                doctor.User.RoleId = doctorRole.Id;
            }
            else if (doctor.UserId.HasValue)
            {
                var exists = await _context.Doctors
                    .AnyAsync(d => d.UserId == doctor.UserId && d.User.IsActive);
                if (exists)
                    throw new InvalidOperationException($"UserId {doctor.UserId} đã có hồ sơ bác sĩ.");
            }

            try
            {
                _context.Doctors.Add(doctor);
                await _context.SaveChangesAsync();
                return doctor;
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi DB khi thêm bác sĩ mới.");
                var innerMsg = ex.InnerException?.Message ?? ex.Message;
                throw new InvalidOperationException($"Lỗi cơ sở dữ liệu: {innerMsg}", ex);
            }
        }

        // UPDATE
        public async Task<Doctor> UpdateAsync(Doctor doctor)
        {
            ArgumentNullException.ThrowIfNull(doctor);

            // Điều kiện: bác sĩ phải tồn tại và còn active
            var exists = await _context.Doctors
                .AnyAsync(d => d.Id == doctor.Id && d.User.IsActive);

            if (!exists)
                throw new KeyNotFoundException(
                    $"Không tìm thấy bác sĩ với Id: {doctor.Id}");

            // Điều kiện: SpecialtyId mới phải tồn tại
            var specialtyExists = await _context.Specialties
                .AnyAsync(s => s.Id == doctor.SpecialtyId);

            if (!specialtyExists)
                throw new KeyNotFoundException(
                    $"Không tìm thấy chuyên khoa với Id: {doctor.SpecialtyId}");

            try
            {
                _context.Doctors.Update(doctor);
                await _context.SaveChangesAsync();
                return doctor;
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, "Xung đột dữ liệu khi cập nhật bác sĩ Id: {Id}", doctor.Id);
                throw new InvalidOperationException("Dữ liệu đã bị thay đổi bởi người khác. Vui lòng tải lại.", ex);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi DB khi cập nhật bác sĩ Id: {Id}", doctor.Id);
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
                var doctor = await _context.Doctors
                    .Include(d => d.User)
                    .FirstOrDefaultAsync(d => d.Id == id && d.User.IsActive);

                if (doctor is null) return false;

                // Điều kiện: không xóa bác sĩ còn lịch hẹn trong tương lai
                var hasFutureAppointments = await _context.Schedules
                    .AnyAsync(s => s.DoctorId == id
                               && s.IsAvailable
                               && s.WorkDate.Date >= DateTime.UtcNow.Date);

                if (hasFutureAppointments)
                    throw new InvalidOperationException(
                        "Không thể xóa bác sĩ còn lịch hẹn trong tương lai.");

                doctor.User.IsActive = false;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (InvalidOperationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa mềm bác sĩ Id: {Id}", id);
                throw;
            }
        }

        // TOGGLE ACTIVE — Admin bật/tắt trạng thái
        public async Task<bool> ToggleActiveAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không hợp lệ.", nameof(id));

            try
            {
                var doctor = await _context.Doctors
                    .Include(d => d.User)
                    .FirstOrDefaultAsync(d => d.Id == id);

                if (doctor is null)
                    throw new KeyNotFoundException($"Không tìm thấy bác sĩ với Id: {id}");

                if (doctor.User == null)
                    throw new InvalidOperationException("Hồ sơ bác sĩ này không có tài khoản người dùng tương ứng.");

                doctor.User.IsActive = !doctor.User.IsActive;
                await _context.SaveChangesAsync();
                return doctor.User.IsActive; // Trả về trạng thái mới
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi toggle active bác sĩ Id: {Id}", id);
                throw;
            }
        }

        public async Task<(List<Doctor> Items, int Total)> GetPagedAsync(DoctorQueryParams query)
        {
            var q = _context.Doctors
                .Include(d => d.Specialty)
                .Include(d => d.User)
                .AsQueryable();

            // tìm kiếm 
            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.Trim().ToLower();
                q = q.Where(d => d.FullName.ToLower().Contains(search) || (d.Specialty != null && d.Specialty.Name.ToLower().Contains(search)));
            }
            else if (!string.IsNullOrWhiteSpace(query.Name))
            {
                var name = query.Name.Trim().ToLower();
                q = q.Where(d => d.FullName.ToLower().Contains(name));
            }

            // lọc theo chuyên khoa
            if (query.SpecialtyId.HasValue)
                q = q.Where(d => d.SpecialtyId == query.SpecialtyId.Value);

            var total = await q.CountAsync();

            // sort
            q = query.SortBy switch
            {
                "yearsOfExperience" => query.IsAscending
                    ? q.OrderBy(d => d.YearsOfExperience)
                    : q.OrderByDescending(d => d.YearsOfExperience),
                _ => query.IsAscending  
                    ? q.OrderBy(d => d.FullName)
                    : q.OrderByDescending(d => d.FullName)
            };

            // paging: Skip = bỏ qua N item đầu, Take = lấy PageSize item
            var items = await q
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            return (items, total);
        }
    }
}