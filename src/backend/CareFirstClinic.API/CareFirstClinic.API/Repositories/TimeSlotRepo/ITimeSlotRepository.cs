using CareFirstClinic.API.Models;

namespace CareFirstClinic.API.Repositories.TimeSlotRepo
{
    public interface ITimeSlotRepository
    {
        Task<List<TimeSlot>> GetByScheduleIdAsync(Guid scheduleId);
        Task<TimeSlot?> GetByIdAsync(Guid id);
        Task<TimeSlot> AddAsync(TimeSlot timeSlot);
        Task<TimeSlot> UpdateAsync(TimeSlot timeSlot);
        Task<bool> DeleteAsync(Guid id);
    }
}