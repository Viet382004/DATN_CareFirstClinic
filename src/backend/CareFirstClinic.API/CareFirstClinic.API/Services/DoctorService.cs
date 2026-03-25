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

        // GET BY USER ID — Bác sĩ xem hồ sơ bản thân
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

            // Điều kiện: email không được để trống
            if (string.IsNullOrWhiteSpace(dto.Email))
                throw new ArgumentException("Email không được để trống.");

            // Điều kiện: năm kinh nghiệm hợp lệ
            if (dto.YearsOfExperience < 0 || dto.YearsOfExperience > 60)
                throw new ArgumentException("Số năm kinh nghiệm phải từ 0 đến 60.");

            // Lấy DbContext từ repository (giả định DoctorRepository dùng chung context)
            // Vì repository pattern hiện tại không lộ context, ta sẽ xử lý trực tiếp qua repo.
            // Tuy nhiên, việc tạo User cần logic phức tạp hơn. 
            // Ta sẽ giả định repository có phương thức hỗ trợ hoặc Service sẽ điều phối.

            try
            {
                var doctor = new Doctor
                {
                    Id = Guid.NewGuid(),
                    FullName = dto.FullName.Trim(),
                    SpecialtyId = dto.SpecialtyId,
                    YearsOfExperience = dto.YearsOfExperience,
                    PhoneNumber = dto.PhoneNumber?.Trim() ?? string.Empty,
                };

                // Nếu không truyền UserId, tự động tạo User account
                if (dto.UserId == null)
                {
                    // Hash mật khẩu
                    string passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

                    doctor.User = new User
                    {
                        Id = Guid.NewGuid(),
                        UserName = dto.UserName,
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

            // Điều kiện: năm kinh nghiệm hợp lệ
            if (dto.YearsOfExperience < 0 || dto.YearsOfExperience > 60)
                throw new ArgumentException("Số năm kinh nghiệm phải từ 0 đến 60.");

        

            try
            {
                var doctor = await _doctorRepository.GetByIdAsync(id);

                // Điều kiện: bác sĩ phải tồn tại
                if (doctor is null) return null;

                doctor.FullName = dto.FullName.Trim();
                doctor.SpecialtyId = dto.SpecialtyId;
                doctor.YearsOfExperience = dto.YearsOfExperience;
                doctor.PhoneNumber = dto.PhoneNumber.Trim();

                var updated = await _doctorRepository.UpdateAsync(doctor);
                return MapToDTO(updated);
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (KeyNotFoundException)
            {
                throw; // Để Controller trả 404
            }
            catch (InvalidOperationException)
            {
                throw; // Xung đột dữ liệu — để Controller trả 409
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
                throw; // Còn lịch hẹn tương lai — để Controller trả 409
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
            FullName = d.FullName,
            SpecialtyName = d.Specialty?.Name ?? string.Empty,
            YearsOfExperience = d.YearsOfExperience,
            PhoneNumber = d.PhoneNumber,
            UserId = d.UserId,
            Email = d.User?.Email,
            TotalAppointments = d.Schedules.Count(s => s.IsAvailable) 
        };
    }
}