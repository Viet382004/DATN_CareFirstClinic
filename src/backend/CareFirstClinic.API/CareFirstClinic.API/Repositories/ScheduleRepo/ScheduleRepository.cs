using CareFirstClinic.API.Data;
using CareFirstClinic.API.Models;
using Microsoft.EntityFrameworkCore;
using CareFirstClinic.API.Common;

namespace CareFirstClinic.API.Repositories.ScheduleRepo
{
    public class ScheduleRepository : IScheduleRepository
    {
        private readonly CareFirstClinicDbContext _context;
        private readonly ILogger<ScheduleRepository> _logger;

        public ScheduleRepository(CareFirstClinicDbContext context, ILogger<ScheduleRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<Schedule>> GetAllAsync()
        {
            try
            {
                return await _context.Schedules
                    .Include(s => s.Doctor).ThenInclude(d => d.Specialty)
                    .Include(s => s.TimeSlots)
                    .Where(s => s.IsAvailable)
                    .OrderBy(s => s.WorkDate).ThenBy(s => s.StartTime)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetAllAsync schedule.");
                throw;
            }
        }

        public async Task<Schedule?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không hợp lệ.", nameof(id));
            try
            {
                return await _context.Schedules
                    .Include(s => s.Doctor).ThenInclude(d => d.Specialty)
                    .Include(s => s.TimeSlots)
                    .FirstOrDefaultAsync(s => s.Id == id && s.IsAvailable);
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByIdAsync schedule Id: {Id}", id);
                throw;
            }
        }

        public async Task<List<Schedule>> GetByDoctorIdAsync(Guid doctorId)
        {
            if (doctorId == Guid.Empty)
                throw new ArgumentException("DoctorId không hợp lệ.", nameof(doctorId));
            try
            {
                return await _context.Schedules
                    .Include(s => s.Doctor).ThenInclude(d => d.Specialty)
                    .Include(s => s.TimeSlots)
                    .Where(s => s.DoctorId == doctorId && s.IsAvailable)
                    .OrderBy(s => s.WorkDate).ThenBy(s => s.StartTime)
                    .ToListAsync();
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByDoctorIdAsync. DoctorId: {DoctorId}", doctorId);
                throw;
            }
        }

        public async Task<List<Schedule>> GetAvailableByDoctorIdAsync(Guid doctorId, DateTime fromDate)
        {
            if (doctorId == Guid.Empty)
                throw new ArgumentException("DoctorId không hợp lệ.", nameof(doctorId));
            try
            {
                return await _context.Schedules
                    .Include(s => s.Doctor).ThenInclude(d => d.Specialty)
                    .Include(s => s.TimeSlots)
                    .Where(s => s.DoctorId == doctorId
                             && s.WorkDate.Date >= fromDate.Date
                             && s.IsAvailable
                             && s.AvailableSlots > 0)
                    .OrderBy(s => s.WorkDate).ThenBy(s => s.StartTime)
                    .ToListAsync();
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetAvailableByDoctorIdAsync. DoctorId: {DoctorId}", doctorId);
                throw;
            }
        }
        public async Task<List<Schedule>> GetByDoctorAndDateAsync(Guid doctorId, DateTime workDate)
        {
            if (doctorId == Guid.Empty)
                throw new ArgumentException("DoctorId không hợp lệ.", nameof(doctorId));

            var date = workDate.Date;

            try
            {
                return await _context.Schedules
                    .Include(s => s.TimeSlots)
                    .Include(s => s.Doctor)
                        .ThenInclude(d => d.Specialty)
                    .Where(s => s.DoctorId == doctorId
                             && s.IsAvailable
                             && s.WorkDate.Date == date) 
                    .OrderBy(s => s.StartTime)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByDoctorAndDateAsync. DoctorId: {DoctorId}, Date: {Date}",
                    doctorId, workDate);
                throw;
            }
        }

        public async Task<List<Schedule>> GetAvailableByDoctorAndDateAsync(Guid doctorId, DateTime date)
        {
            if (doctorId == Guid.Empty)
                throw new ArgumentException("DoctorId không hợp lệ.", nameof(doctorId));

            var targetDate = date.Date;
            var nextDay = targetDate.AddDays(1);

            try
            {
                return await _context.Schedules
                    .Include(s => s.Doctor)
                        .ThenInclude(d => d.Specialty)
                    .Include(s => s.TimeSlots
                        .Where(ts => !ts.IsBooked)) 
                    .Where(s => s.DoctorId == doctorId
                             && s.IsAvailable
                             && s.WorkDate >= targetDate
                             && s.WorkDate < nextDay
                             && s.AvailableSlots > 0)  
                    .OrderBy(s => s.StartTime)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetAvailableByDoctorAndDateAsync. DoctorId: {DoctorId}, Date: {Date}",
                    doctorId, date);
                throw;
            }
        }

        public async Task<bool> HasConflictAsync(Guid doctorId, DateTime workDate,
            TimeSpan startTime, TimeSpan endTime, Guid? excludeId = null)
        {
            try
            {
                return await _context.Schedules.AnyAsync(s =>
                    s.DoctorId == doctorId &&
                    s.WorkDate.Date == workDate.Date &&
                    s.IsAvailable &&
                    (excludeId == null || s.Id != excludeId) &&
                    s.StartTime < endTime && s.EndTime > startTime);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi HasConflictAsync.");
                throw;
            }
        }

        public async Task<Schedule> AddAsync(Schedule schedule, List<TimeSlot> timeSlots)
        {
            ArgumentNullException.ThrowIfNull(schedule);

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Schedules.Add(schedule);
                await _context.SaveChangesAsync();

                foreach (var slot in timeSlots)
                    slot.ScheduleId = schedule.Id;

                _context.TimeSlots.AddRange(timeSlots);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return (await GetByIdAsync(schedule.Id))!;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Lỗi AddAsync schedule — rollback.");
                throw new InvalidOperationException("Không thể tạo lịch làm việc.", ex);
            }
        }

        public async Task<Schedule> UpdateAsync(Schedule schedule)
        {
            ArgumentNullException.ThrowIfNull(schedule);
            var exists = await _context.Schedules.AnyAsync(s => s.Id == schedule.Id && s.IsAvailable);
            if (!exists)
                throw new KeyNotFoundException($"Không tìm thấy lịch Id: {schedule.Id}");
            try
            {
                _context.Schedules.Update(schedule);
                await _context.SaveChangesAsync();
                return schedule;
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi UpdateAsync schedule Id: {Id}", schedule.Id);
                throw new InvalidOperationException("Không thể cập nhật lịch làm việc.", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không hợp lệ.", nameof(id));
            try
            {
                var schedule = await _context.Schedules
                    .FirstOrDefaultAsync(s => s.Id == id && s.IsAvailable);
                if (schedule is null) return false;

                var hasBooked = await _context.TimeSlots
                    .AnyAsync(ts => ts.ScheduleId == id && ts.IsBooked);
                if (hasBooked)
                    throw new InvalidOperationException(
                        "Không thể xóa lịch đang có slot đã được đặt.");

                schedule.IsAvailable = false;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (InvalidOperationException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi DeleteAsync schedule Id: {Id}", id);
                throw;
            }
        }

        public async Task BulkInsertAsync(List<Schedule> schedules, List<TimeSlot> timeSlots)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                await _context.Schedules.AddRangeAsync(schedules);
                await _context.SaveChangesAsync();

                await _context.TimeSlots.AddRangeAsync(timeSlots);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<DateTime?> GetMaxDateAsync()
        {
            return await _context.Schedules
                .MaxAsync(x => (DateTime?)x.WorkDate);
        }
        public async Task<(List<Schedule> Items, int Total)> GetPagedAsync(ScheduleQueryParams query)
        {
            var q = _context.Schedules
                .Include(s => s.Doctor).ThenInclude(d => d.Specialty)
                .Include(s => s.TimeSlots)
                .AsQueryable();

            if (query.DoctorId.HasValue)
                q = q.Where(s => s.DoctorId == query.DoctorId.Value);

            if (query.IsAvailable.HasValue)
                q = q.Where(s => s.IsAvailable == query.IsAvailable.Value);
            else
                q = q.Where(s => s.IsAvailable);

            if (query.FromDate.HasValue)
                q = q.Where(s => s.WorkDate.Date >= query.FromDate.Value.Date);

            if (query.ToDate.HasValue)
                q = q.Where(s => s.WorkDate.Date <= query.ToDate.Value.Date);

            var total = await q.CountAsync();

            // sort
            q = query.IsAscending
                ? q.OrderBy(s => s.WorkDate).ThenBy(s => s.StartTime)
                : q.OrderByDescending(s => s.WorkDate).ThenByDescending(s => s.StartTime);

            var items = await q
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            return (items, total);
        }
    }
}