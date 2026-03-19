using CareFirstClinic.API.Models;
using System.Threading.Tasks;

namespace CareFirstClinic.API.Repositories.ScheduleRepo
{
    public interface IScheduleRepository
    {
        Task<List<Schedule>> GetAllAsync();
        Task<Schedule?> GetByIdAsync(Guid id);
        Task<List<Schedule>> GetByDoctorIdAsync(Guid doctorId);
        Task<List<Schedule>> GetAvailableByDoctorIdAsync(Guid doctorId, DateTime fromDate);
        Task<List<Schedule>> GetByDoctorAndDateAsync(Guid doctorId, DateTime workDate);
        Task<List<Schedule>> GetAvailableByDoctorAndDateAsync(Guid doctorId, DateTime date);

        Task<bool> HasConflictAsync(Guid doctorId, DateTime workDate, TimeSpan startTime, TimeSpan endTime, Guid? excludeId = null);
        Task<Schedule> AddAsync(Schedule schedule, List<TimeSlot> timeSlots);
        Task<Schedule> UpdateAsync(Schedule schedule);
        Task<bool> DeleteAsync(Guid id);
        Task BulkInsertAsync(List<Schedule> schedules, List<TimeSlot> timeSlots);
        Task<DateTime?> GetMaxDateAsync();
    }
}