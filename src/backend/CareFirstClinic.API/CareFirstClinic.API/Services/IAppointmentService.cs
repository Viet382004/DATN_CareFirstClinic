using CareFirstClinic.API.DTOs;

namespace CareFirstClinic.API.Services
{
    public interface IAppointmentService
    {
        Task<List<AppointmentDTO>> GetAllAsync();
        Task<AppointmentDTO?> GetByIdAsync(Guid id);
        Task<List<AppointmentDTO>> GetMyAppointmentsAsync(Guid patientId);
        Task<List<AppointmentDTO>> GetByDoctorIdAsync(Guid doctorId);
        Task<AppointmentDTO> CreateAsync(Guid patientId, CreateAppointmentDTO dto);
        Task<AppointmentDTO?> UpdateAsync(Guid id, Guid patientId, UpdateAppointmentDTO dto);
        Task<AppointmentDTO?> ConfirmAsync(Guid id);
        Task<AppointmentDTO?> CompleteAsync(Guid id, Guid doctorId);
        Task<AppointmentDTO?> CancelAsync(Guid id, Guid requesterId, string requesterRole, CancelAppointmentDTO dto);
    }
}