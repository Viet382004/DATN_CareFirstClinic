using CareFirstClinic.API.Common;
using CareFirstClinic.API.Models;

namespace CareFirstClinic.API.Repositories.AppoinmentRepo
{
    public interface IAppointmentRepository
    {
        Task<List<Appointment>> GetAllAsync();
        Task<Appointment?> GetByIdAsync(Guid id);
        Task<List<Appointment>> GetByPatientIdAsync(Guid patientId);
        Task<List<Appointment>> GetByDoctorIdAsync(Guid doctorId);
        Task<Appointment> AddAsync(Appointment appointment, TimeSlot timeSlot);
        Task<Appointment> UpdateAsync(Appointment appointment);
        Task<(List<Appointment> Items, int Total)> GetPagedAsync(AppointmentQueryParams query);
    }
}