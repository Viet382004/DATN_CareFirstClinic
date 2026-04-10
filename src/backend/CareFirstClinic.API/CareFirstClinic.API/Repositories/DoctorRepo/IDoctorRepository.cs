using CareFirstClinic.API.Common;
using CareFirstClinic.API.Models;

namespace CareFirstClinic.API.Repositories.DoctorRepo
{
    public interface IDoctorRepository
    {
        Task<List<Doctor>> GetAllAsync();
        Task<Doctor?> GetByIdAsync(Guid id);
        Task<Doctor?> GetByUserIdAsync(Guid userId);
        Task<List<Doctor>> GetBySpecialtyAsync(Guid specialtyId, string? search = null);
        Task<Doctor> AddAsync(Doctor doctor);
        Task<Doctor> UpdateAsync(Doctor doctor);
        Task<bool> SoftDeleteAsync(Guid id);
        Task<bool> ToggleActiveAsync(Guid id);
        Task<(List<Doctor> Items, int Total)> GetPagedAsync(DoctorQueryParams query);
    }
}