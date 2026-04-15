using CareFirstClinic.API.DTOs;
using CareFirstClinic.API.Models;
using System.Threading.Tasks;

namespace CareFirstClinic.API.Services
{
    public interface IPatientService
    {
        Task<List<PatientDTO>> GetAllAsync();
        Task<PatientDTO?> GetByIdAsync(Guid id);
        Task<PatientDTO?> GetByUserIdAsync(Guid userId);
        Task<PatientDTO?> UpdateAsync(Guid id, UpdatePatientDTO dto);
        Task<PatientDTO> CreateAsync(CreatePatientDTO dto);
        Task<bool> DeleteAsync(Guid id);
        Task<PatientDTO?> UpdateAvatarAsync(Guid id, string? avatarUrl);
        Task<bool> ToggleActiveAsync(Guid id);
    }
}