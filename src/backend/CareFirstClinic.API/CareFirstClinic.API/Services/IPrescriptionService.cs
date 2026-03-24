using CareFirstClinic.API.DTOs;

namespace CareFirstClinic.API.Services
{
    public interface IPrescriptionService
    {
        Task<PrescriptionDTO?> GetByIdAsync(Guid id);
        Task<PrescriptionDTO?> GetByMedicalRecordIdAsync(Guid medicalRecordId);
        Task<PrescriptionDTO> CreateAsync(Guid doctorId, CreatePrescriptionDTO dto);
        Task<PrescriptionDTO?> DispenseAsync(Guid id);   // Phát thuốc — trừ tồn kho
        Task<PrescriptionDTO?> CancelAsync(Guid id);
    }
}