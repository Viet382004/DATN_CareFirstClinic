using CareFirstClinic.API.Models;
using CareFirstClinic.API.Common;

namespace CareFirstClinic.API.Repositories.SpecialtyRepo
{
    public interface ISpecialtyRepository
    {
        Task<List<Specialty>> GetAllAsync();
        Task<Specialty?> GetByIdAsync(Guid id);
        Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null);
        Task<Specialty> AddAsync(Specialty specialty);
        Task<Specialty> UpdateAsync(Specialty specialty);
        Task<bool> SoftDeleteAsync(Guid id);
        Task<bool> ToggleActiveAsync(Guid id);
        Task<(List<Specialty> Items, int Total)> GetPagedAsync(SpecialtyQueryParams query);
    }
}