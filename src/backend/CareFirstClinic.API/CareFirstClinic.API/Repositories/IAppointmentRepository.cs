using CareFirstClinic.API.Models;

namespace CareFirstClinic.API.Repositories
{
    public interface IAppointmentRepository
    {
        Task<List<Appointment>> GetAllAsync();
        Task<Appointment?> GetByIdAsync(Guid id);
        Task<List<Appointment>> GetByPatientIdAsync(Guid patientId);
        Task<List<Appointment>> GetByDoctorIdAsync(Guid doctorId);
        Task<Appointment> AddAsync(Appointment appointment);
        Task<Appointment> UpdateAsync(Appointment appointment);
    }
}