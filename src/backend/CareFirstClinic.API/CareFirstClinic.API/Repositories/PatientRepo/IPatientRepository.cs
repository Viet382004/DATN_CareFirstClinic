using CareFirstClinic.API.Models;
namespace CareFirstClinic.API.Repositories.PatientRepo
{
    public interface IPatientRepository
    {
        Task<List<Patient>> GetAllAsync();
        Task<Patient?> GetByIdAsync(Guid id);
        Task<Patient?> GetByUserIdAsync(Guid userId);
        Task<Patient> AddAsync(Patient patient);
        Task<Patient> UpdateAsync(Patient patient);
        Task<bool> SoftDeleteAsync(Guid id);
    }
}