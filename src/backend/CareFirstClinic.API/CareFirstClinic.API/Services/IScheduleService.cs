using CareFirstClinic.API.Common;
using CareFirstClinic.API.DTOs;

namespace CareFirstClinic.API.Services
{
    public interface IScheduleService
    {
        Task<List<ScheduleDTO>> GetAllAsync();
        Task<ScheduleDTO?> GetByIdAsync(Guid id);
        Task<List<ScheduleDTO>> GetByDoctorIdAsync(Guid doctorId);
        Task<List<ScheduleDTO>> GetByDoctorAndDateAsync(Guid doctorId, DateTime workDate);
        Task<List<ScheduleDTO>> GetAvailableByDoctorAndDateAsync(Guid doctorId, DateTime date);
        Task<List<ScheduleDTO>> GetAvailableByDoctorIdAsync(Guid doctorId, DateTime fromDate);
        Task<ScheduleDTO> CreateAsync(CreateScheduleDTO dto);
        Task<ScheduleDTO?> UpdateAsync(Guid id, UpdateScheduleDTO dto);
        Task<bool> DeleteAsync(Guid id);
        Task<PagedResult<ScheduleDTO>> GetPagedAsync(ScheduleQueryParams query);
    }
}