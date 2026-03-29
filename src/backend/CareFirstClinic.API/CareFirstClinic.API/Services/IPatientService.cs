using CareFirstClinic.API.DTOs;

namespace CareFirstClinic.API.Services
{
    public interface IPatientService
    {
        Task<List<PatientDTO>> GetAllAsync();
        Task<PatientDTO?> GetByIdAsync(Guid id);
        Task<PatientDTO?> GetByUserIdAsync(Guid userId);
        Task<PatientDTO?> UpdateAsync(Guid id, UpdatePatientDTO dto);
        Task<bool> DeleteAsync(Guid id);
        Task<PatientDTO?> UpdateAvatarAsync(Guid id, string? avatarUrl);
    }
}