using CareFirstClinic.API.DTOs.TimeSlot;

namespace CareFirstClinic.API.Services
{
    public interface ITimeSlotService
    {
        Task<List<TimeSlotDTO>> GetByScheduleIdAsync(Guid scheduleId);
        Task<TimeSlotDTO?> GetByIdAsync(Guid id);
        Task<TimeSlotDTO> AddSlotAsync(Guid scheduleId, TimeSpan startTime, TimeSpan endTime);
        Task<TimeSlotDTO?> ToggleBookedAsync(Guid id);
        Task<bool> DeleteAsync(Guid id);
    }
}