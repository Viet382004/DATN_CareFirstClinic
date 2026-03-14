using CareFirstClinic.API.DTOs.Specialty;
using System.Threading.Tasks;

namespace CareFirstClinic.API.Services
{
    public interface ISpecialtyService
    {
        Task<List<SpecialtyDTO>> GetAllAsync();
        Task<SpecialtyDTO?> GetByIdAsync(Guid id);
        Task<SpecialtyDTO> CreateAsync(CreateSpecialtyDTO dto);
        Task<SpecialtyDTO> UpdateAsync(Guid id, UpdateSpecialtyDTO dto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> ToggleActiveAsync(Guid id);
    }
}