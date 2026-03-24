using CareFirstClinic.API.Models;

namespace CareFirstClinic.API.Repositories.MedicalRecordRepo
{
    public interface IMedicalRecordRepository
    {
        Task<List<MedicalRecord>> GetAllAsync();
        Task<MedicalRecord?> GetByIdAsync(Guid id);
        Task<MedicalRecord?> GetByAppointmentIdAsync(Guid appointmentId);
        Task<List<MedicalRecord>> GetByPatientIdAsync(Guid patientId);
        Task<List<MedicalRecord>> GetByDoctorIdAsync(Guid doctorId);
        Task<bool> ExistsByAppointmentIdAsync(Guid appointmentId);
        Task<MedicalRecord> AddAsync(MedicalRecord record);
        Task<MedicalRecord> UpdateAsync(MedicalRecord record);
    }
}