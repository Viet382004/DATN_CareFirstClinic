using CareFirstClinic.API.Common;
using CareFirstClinic.API.DTOs;
using CareFirstClinic.API.Models;
using CareFirstClinic.API.Repositories.DoctorRepo;
using CareFirstClinic.API.Common;

namespace CareFirstClinic.API.Services
{
    public class DoctorService : IDoctorService
    {
        private readonly IDoctorRepository _doctorRepository;
        private readonly ILogger<DoctorService> _logger;

        public DoctorService(IDoctorRepository doctorRepository, ILogger<DoctorService> logger)
        {
            _doctorRepository = doctorRepository;
            _logger = logger;
        }
        public async Task<DoctorDTO?> UpdateAvatarAsync(Guid id, string? avatarUrl)
        {
            try
            {
                var doctor = await _doctorRepository.GetByIdAsync(id);
                if (doctor is null) return null;

                doctor.AvatarUrl = avatarUrl;
                var updated = await _doctorRepository.UpdateAsync(doctor);
                return MapToDTO(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi UpdateAvatar Doctor Id: {Id}", id);
                throw new ApplicationException("Không thể cập nhật ảnh đại diện.", ex);
            }
        }
        // GET ALL
        public async Task<List<DoctorDTO>> GetAllAsync()
        {
            try
            {
                var doctors = await _doctorRepository.GetAllAsync();
                return doctors.Select(MapToDTO).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách bác sĩ.");
                throw new ApplicationException("Không thể lấy danh sách bác sĩ.", ex);
            }
        }

        // GET BY ID
        public async Task<DoctorDTO?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));

            try
            {
                var doctor = await _doctorRepository.GetByIdAsync(id);
                return doctor is null ? null : MapToDTO(doctor);
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy bác sĩ Id: {Id}", id);
                throw new ApplicationException("Không thể lấy thông tin bác sĩ.", ex);
            }
        }

        // GET BY USER ID 
        public async Task<DoctorDTO?> GetByUserIdAsync(Guid userId)
        {
            if (userId == Guid.Empty)
                throw new ArgumentException("UserId không được để trống.", nameof(userId));

            try
            {
                var doctor = await _doctorRepository.GetByUserIdAsync(userId);
                return doctor is null ? null : MapToDTO(doctor);
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy bác sĩ theo UserId: {UserId}", userId);
                throw new ApplicationException("Không thể lấy hồ sơ bác sĩ.", ex);
            }
        }

        // GET BY SPECIALTY
        public async Task<List<DoctorDTO>> GetBySpecialtyAsync(Guid specialtyId)
        {
            if (specialtyId == Guid.Empty)
                throw new ArgumentException("SpecialtyId không được để trống.", nameof(specialtyId));

            try
            {
                var doctors = await _doctorRepository.GetBySpecialtyAsync(specialtyId);
                return doctors.Select(MapToDTO).ToList();
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy bác sĩ theo SpecialtyId: {SpecialtyId}", specialtyId);
                throw new ApplicationException("Không thể lấy danh sách bác sĩ theo chuyên khoa.", ex);
            }
        }

        // CREATE
        public async Task<DoctorDTO> CreateAsync(CreateDoctorDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            if (string.IsNullOrWhiteSpace(dto.Email))
                throw new ArgumentException("Email không được để trống.");

            if (dto.YearsOfExperience < 0 || dto.YearsOfExperience > 60)
                throw new ArgumentException("Số năm kinh nghiệm phải từ 0 đến 60.");


            try
            {
                var doctor = new Doctor
                {
                    Id = Guid.NewGuid(),
                    FullName = dto.FullName.Trim(),
                    AcademicTitle = dto.AcademicTitle,
                    Description = dto.Description,
                    Position = dto.Position,
                    SpecialtyId = dto.SpecialtyId,
                    YearsOfExperience = dto.YearsOfExperience,
                    PhoneNumber = dto.PhoneNumber?.Trim() ?? string.Empty,
                };

                if (dto.UserId == null)
                {
                    // Hash mật khẩu
                    string passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

                    doctor.User = new User
                    {
                        Id = Guid.NewGuid(),
                        Email = dto.Email,
                        FullName = dto.FullName,
                        PasswordHash = passwordHash,
                        IsActive = true,
                    };
                }
                else
                {
                    doctor.UserId = dto.UserId;
                }

                var created = await _doctorRepository.AddAsync(doctor);
                return MapToDTO(created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo bác sĩ: {FullName}", dto.FullName);
                throw;
            }
        }

        
        // UPDATE
        public async Task<DoctorDTO?> UpdateAsync(Guid id, UpdateDoctorDTO dto)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));

            ArgumentNullException.ThrowIfNull(dto);

            if (dto.YearsOfExperience < 0 || dto.YearsOfExperience > 60)
                throw new ArgumentException("Số năm kinh nghiệm phải từ 0 đến 60.");

        

            try
            {
                var doctor = await _doctorRepository.GetByIdAsync(id);

                if (doctor is null) return null;

                doctor.FullName = dto.FullName.Trim();
                doctor.AcademicTitle = dto.AcademicTitle.ToString();
                doctor.Position = dto.Position.ToString();
                doctor.SpecialtyId = dto.SpecialtyId;
                doctor.YearsOfExperience = dto.YearsOfExperience;
                doctor.PhoneNumber = dto.PhoneNumber.Trim();
                doctor.Description = dto.Description.ToString();

                var updated = await _doctorRepository.UpdateAsync(doctor);
                return MapToDTO(updated);
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (KeyNotFoundException)
            {
                throw; 
            }
            catch (InvalidOperationException)
            {
                throw; 
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật bác sĩ Id: {Id}", id);
                throw new ApplicationException("Không thể cập nhật hồ sơ bác sĩ.", ex);
            }
        }

       
        // DELETE
        public async Task<bool> DeleteAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));

            try
            {
                return await _doctorRepository.SoftDeleteAsync(id);
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (InvalidOperationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa bác sĩ Id: {Id}", id);
                throw new ApplicationException("Không thể xóa bác sĩ.", ex);
            }
        }

        // TOGGLE ACTIVE
        public async Task<bool> ToggleActiveAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));

            try
            {
                return await _doctorRepository.ToggleActiveAsync(id);
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi toggle active bác sĩ Id: {Id}", id);
                throw new ApplicationException("Không thể thay đổi trạng thái bác sĩ.", ex);
            }
        }
        public async Task<PagedResult<DoctorDTO>> GetPagedAsync(DoctorQueryParams query)
        {
            try
            {
                var (items, total) = await _doctorRepository.GetPagedAsync(query);
                return new PagedResult<DoctorDTO>
                {
                    Items = items.Select(MapToDTO).ToList(),
                    Page = query.Page,
                    PageSize = query.PageSize,
                    TotalItems = total
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetPaged Doctor.");
                throw new ApplicationException("Không thể lấy danh sách bác sĩ.", ex);
            }
        }

        // HELPER — Map Doctor model → DoctorDTO
        private static DoctorDTO MapToDTO(Doctor d) => new()
        {
            Id = d.Id,
            AvatarUrl = d.AvatarUrl,
            FullName = d.FullName,
            AcademicTitle = d.AcademicTitle,
            Position = d.Position,
            SpecialtyName = d.Specialty?.Name ?? string.Empty,
            YearsOfExperience = d.YearsOfExperience,
            PhoneNumber = d.PhoneNumber,
            Description = d.Description,
            UserId = d.UserId,
            Email = d.User?.Email,
            TotalAppointments = d.Schedules.Count(s => s.IsAvailable) 
        };
    }
}