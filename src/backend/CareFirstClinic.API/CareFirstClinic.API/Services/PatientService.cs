using CareFirstClinic.API.DTOs;
using CareFirstClinic.API.Models;
using CareFirstClinic.API.Repositories.PatientRepo;

namespace CareFirstClinic.API.Services
{
    public class PatientService : IPatientService
    {
        private readonly IPatientRepository _patientRepository;
        private readonly ILogger<PatientService> _logger;

        public PatientService(IPatientRepository patientRepository, ILogger<PatientService> logger)
        {
            _patientRepository = patientRepository;
            _logger = logger;
        }

        // GET ALL
        public async Task<List<PatientDTO>> GetAllAsync()
        {
            try
            {
                var patients = await _patientRepository.GetAllAsync();
                return patients.Select(MapToDTO).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách bệnh nhân.");
                throw new ApplicationException("Không thể lấy danh sách bệnh nhân.", ex);
            }
        }

        // GET BY ID
        public async Task<PatientDTO?> GetByIdAsync(Guid id)
        {
            // Điều kiện: id hợp lệ
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));

            try
            {
                var patient = await _patientRepository.GetByIdAsync(id);
                return patient is null ? null : MapToDTO(patient);
            }
            catch (ArgumentException)
            {
                throw; // Ném lại lỗi validation để Controller trả 400
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy bệnh nhân Id: {Id}", id);
                throw new ApplicationException("Không thể lấy thông tin bệnh nhân.", ex);
            }
        }

        // GET BY USER ID
        public async Task<PatientDTO?> GetByUserIdAsync(Guid userId)
        {
            if (userId == Guid.Empty)
                throw new ArgumentException("UserId không được để trống.", nameof(userId));

            try
            {
                var patient = await _patientRepository.GetByUserIdAsync(userId);
                return patient is null ? null : MapToDTO(patient);
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy bệnh nhân theo UserId: {UserId}", userId);
                throw new ApplicationException("Không thể lấy hồ sơ bệnh nhân.", ex);
            }
        }

        // UPDATE
        public async Task<PatientDTO?> UpdateAsync(Guid id, UpdatePatientDTO dto)
        {
            // Điều kiện 1: id hợp lệ
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));

            // Điều kiện 2: dto không null
            ArgumentNullException.ThrowIfNull(dto);

            // Điều kiện 3: ngày sinh không được ở tương lai
            if (dto.DateOfBirth > DateTime.UtcNow)
                throw new ArgumentException("Ngày sinh không được lớn hơn ngày hiện tại.");

            // Điều kiện 4: tuổi hợp lý (không quá 150 tuổi)
            if (dto.DateOfBirth < DateTime.UtcNow.AddYears(-150))
                throw new ArgumentException("Ngày sinh không hợp lệ.");

            try
            {
                var patient = await _patientRepository.GetByIdAsync(id);

                // Điều kiện 5: bệnh nhân phải tồn tại
                if (patient is null)
                    return null;

                patient.FullName = dto.FullName.Trim();
                patient.DateOfBirth = dto.DateOfBirth;
                patient.Gender = dto.Gender;
                patient.PhoneNumber = dto.PhoneNumber.Trim();
                patient.Address = dto.Address.Trim();
                patient.MedicalHistory = dto.MedicalHistory?.Trim();

                var updated = await _patientRepository.UpdateAsync(patient);
                return MapToDTO(updated);
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (KeyNotFoundException)
            {
                throw; // Để Controller bắt và trả 404
            }
            catch (InvalidOperationException)
            {
                throw; // Concurrency hoặc DB error đã có message rõ
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật bệnh nhân Id: {Id}", id);
                throw new ApplicationException("Không thể cập nhật hồ sơ bệnh nhân.", ex);
            }
        }

        // SOFT DELETE
        public async Task<bool> DeleteAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));

            try
            {
                return await _patientRepository.SoftDeleteAsync(id);
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa bệnh nhân Id: {Id}", id);
                throw new ApplicationException("Không thể xóa bệnh nhân.", ex);
            }
        }

        // HELPER
        private static PatientDTO MapToDTO(Patient p) => new()
        {
            Id = p.Id,
            FullName = p.FullName,
            DateOfBirth = p.DateOfBirth,
            Gender = p.Gender,
            PhoneNumber = p.PhoneNumber,
            Address = p.Address,
            MedicalHistory = p.MedicalHistory,
            CreatedAt = p.CreatedAt,
            UserId = p.UserId,
            UserEmail = p.User?.Email
        };
    }
}