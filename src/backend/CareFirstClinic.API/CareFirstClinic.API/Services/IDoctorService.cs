using CareFirstClinic.API.Common;
using CareFirstClinic.API.DTOs;

namespace CareFirstClinic.API.Services
{
    public interface IDoctorService
    {
        Task<List<DoctorDTO>> GetAllAsync();
        Task<DoctorDTO?> GetByIdAsync(Guid id);
        Task<DoctorDTO?> GetByUserIdAsync(Guid userId);
        Task<List<DoctorDTO>> GetBySpecialtyAsync(Guid specialtyId);
        Task<DoctorDTO> CreateAsync(CreateDoctorDTO dto);
        Task<DoctorDTO?> UpdateAsync(Guid id, UpdateDoctorDTO dto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> ToggleActiveAsync(Guid id);
        Task<PagedResult<DoctorDTO>> GetPagedAsync(DoctorQueryParams query);
    }
}