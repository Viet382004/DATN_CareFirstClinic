using CareFirstClinic.API.DTOs;
using CareFirstClinic.API.DTOs.Specialty;
using CareFirstClinic.API.Models;
using CareFirstClinic.API.Repositories;

namespace CareFirstClinic.API.Services
{
    public class SpecialtyService : ISpecialtyService
    {
        private readonly ISpecialtyRepository _specialtyRepository;
        private readonly ILogger<SpecialtyService> _logger;

        public SpecialtyService(
            ISpecialtyRepository specialtyRepository,
            ILogger<SpecialtyService> logger)
        {
            _specialtyRepository = specialtyRepository;
            _logger = logger;
        }

        // GET ALL
        public async Task<List<SpecialtyDTO>> GetAllAsync()
        {
            try
            {
                var specialties = await _specialtyRepository.GetAllAsync();
                return specialties.Select(MapToDTO).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách chuyên khoa.");
                throw new ApplicationException("Không thể lấy danh sách chuyên khoa.", ex);
            }
        }

        // GET BY ID
        public async Task<SpecialtyDTO?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));

            try
            {
                var specialty = await _specialtyRepository.GetByIdAsync(id);
                return specialty is null ? null : MapToDTO(specialty);
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy chuyên khoa Id: {Id}", id);
                throw new ApplicationException("Không thể lấy thông tin chuyên khoa.", ex);
            }
        }

        // CREATE
        public async Task<SpecialtyDTO> CreateAsync(CreateSpecialtyDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            // Điều kiện: tên không được chỉ có khoảng trắng
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new ArgumentException("Tên chuyên khoa không được để trống.");

            try
            {
                var specialty = new Specialty
                {
                    Id = Guid.NewGuid(),
                    Name = dto.Name.Trim(),
                    Description = dto.Description?.Trim(),
                    IsActive = true
                };

                var created = await _specialtyRepository.AddAsync(specialty);
                return MapToDTO(created);
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (InvalidOperationException)
            {
                throw; // Tên trùng — để Controller trả 409
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo chuyên khoa: {Name}", dto.Name);
                throw new ApplicationException("Không thể tạo chuyên khoa.", ex);
            }
        }

        // UPDATE
        public async Task<SpecialtyDTO?> UpdateAsync(Guid id, UpdateSpecialtyDTO dto)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));

            ArgumentNullException.ThrowIfNull(dto);

            // Điều kiện: tên không được chỉ có khoảng trắng
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new ArgumentException("Tên chuyên khoa không được để trống.");

            try
            {
                var specialty = await _specialtyRepository.GetByIdAsync(id);

                // Điều kiện: chuyên khoa phải tồn tại
                if (specialty is null) return null;

                specialty.Name = dto.Name.Trim();
                specialty.Description = dto.Description?.Trim();

                var updated = await _specialtyRepository.UpdateAsync(specialty);
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
                throw; // Tên trùng hoặc xung đột — để Controller trả 409
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật chuyên khoa Id: {Id}", id);
                throw new ApplicationException("Không thể cập nhật chuyên khoa.", ex);
            }
        }

        // DELETE
        public async Task<bool> DeleteAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));

            try
            {
                return await _specialtyRepository.SoftDeleteAsync(id);
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (InvalidOperationException)
            {
                throw; // Còn bác sĩ active — để Controller trả 409
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa chuyên khoa Id: {Id}", id);
                throw new ApplicationException("Không thể xóa chuyên khoa.", ex);
            }
        }

        // TOGGLE ACTIVE
        public async Task<bool> ToggleActiveAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));

            try
            {
                return await _specialtyRepository.ToggleActiveAsync(id);
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
                throw; // Còn bác sĩ active — để Controller trả 409
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi toggle active chuyên khoa Id: {Id}", id);
                throw new ApplicationException("Không thể thay đổi trạng thái chuyên khoa.", ex);
            }
        }

        // HELPER — Map Specialty model → SpecialtyDTO
        private static SpecialtyDTO MapToDTO(Specialty s) => new()
        {
            Id = s.Id,
            Name = s.Name,
            Description = s.Description,
            IsActive = s.IsActive,
            TotalDoctors = s.Doctors?.Count ?? 0  // đếm bác sĩ active từ filtered include
        };
    }
}