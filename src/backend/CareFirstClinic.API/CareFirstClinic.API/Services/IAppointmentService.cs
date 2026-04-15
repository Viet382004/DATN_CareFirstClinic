using CareFirstClinic.API.Common;
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
        Task<AppointmentDTO> CreateForPatientAsync(Guid patientId, CreateAppointmentDTO dto);
        Task<AppointmentDTO?> UpdateAsync(Guid id, Guid patientId, UpdateAppointmentDTO dto);
        Task<AppointmentDTO?> ConfirmAsync(Guid id, string requesterRole, Guid? requesterDoctorId = null);
        Task<AppointmentDTO?> ToWaitingAsync(Guid id);
        Task<AppointmentDTO?> StartExaminationAsync(Guid id, Guid doctorId);
        Task<AppointmentDTO?> CompleteAsync(Guid id, Guid doctorId);
        Task<AppointmentDTO?> UpdateMedicineFeeAsync(Guid id, Guid doctorId, decimal medicineFee);
        Task<AppointmentDTO?> CancelAsync(Guid id, Guid requesterId, string requesterRole, CancelAppointmentDTO dto);
        Task<int> AutoCancelExpiredPendingAsync();
        Task<PagedResult<AppointmentDTO>> GetPagedAsync(AppointmentQueryParams query);
    }
}