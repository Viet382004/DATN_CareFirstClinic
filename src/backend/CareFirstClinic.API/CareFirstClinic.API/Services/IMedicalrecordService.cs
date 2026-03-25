using CareFirstClinic.API.Common;
using CareFirstClinic.API.DTOs;

namespace CareFirstClinic.API.Services
{
    public interface IMedicalRecordService
    {
        Task<List<MedicalRecordDTO>> GetAllAsync();
        Task<MedicalRecordDTO?> GetByIdAsync(Guid id);
        Task<MedicalRecordDTO?> GetByAppointmentIdAsync(Guid appointmentId);
        Task<List<MedicalRecordDTO>> GetMyRecordsAsync(Guid patientId);
        Task<List<MedicalRecordDTO>> GetByDoctorIdAsync(Guid doctorId);
        Task<MedicalRecordDTO> CreateAsync(Guid doctorId, CreateMedicalRecordDTO dto);
        Task<MedicalRecordDTO?> UpdateAsync(Guid id, Guid doctorId, UpdateMedicalRecordDTO dto);
        Task<PagedResult<MedicalRecordDTO>> GetPagedAsync(MedicalRecordQueryParams query);
    }
}