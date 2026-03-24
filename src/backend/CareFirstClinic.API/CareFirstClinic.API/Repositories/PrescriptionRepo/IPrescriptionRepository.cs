using CareFirstClinic.API.Models;

namespace CareFirstClinic.API.Repositories
{
    public interface IPrescriptionRepository
    {
        Task<Prescription?> GetByIdAsync(Guid id);
        Task<Prescription?> GetByMedicalRecordIdAsync(Guid medicalRecordId);
        Task<bool> ExistsByMedicalRecordIdAsync(Guid medicalRecordId);
        Task<Prescription> AddAsync(Prescription prescription);
        Task<Prescription> UpdateStatusAsync(Guid id, PrescriptionStatus status);
    }
}