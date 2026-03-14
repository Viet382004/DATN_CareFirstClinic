namespace CareFirstClinic.API.Repositories
{
    public interface IScheduleRepository
    {
        Task<List<Schedule>> GetAllAsync();
        Task<Schedule?> GetByIdAsync(Guid id);
        Task<List<Schedule>> GetByDoctorIdAsync(Guid doctorId);
        Task<List<Schedule>> GetAvailableByDoctorIdAsync(Guid doctorId, DateTime fromDate);
        Task<bool> HasConflictAsync(Guid doctorId, DateTime workDate, TimeSpan start, TimeSpan end, Guid? excludeId = null);
        Task<Schedule> AddAsync(Schedule schedule);
        Task<Schedule> UpdateAsync(Schedule schedule);
        Task<bool> DeleteAsync(Guid id);
    }
}