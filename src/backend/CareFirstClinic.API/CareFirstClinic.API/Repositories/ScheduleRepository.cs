using CareFirstClinic.API.Data;
using CareFirstClinic.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CareFirstClinic.API.Repositories
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
                    .Where(s => s.IsAvailable)
                    .OrderBy(s => s.WorkDate).ThenBy(s => s.StartTime)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách lịch làm việc.");
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
                    .FirstOrDefaultAsync(s => s.Id == id && s.IsAvailable);
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy lịch Id: {Id}", id);
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
                    .Where(s => s.DoctorId == doctorId && s.IsAvailable)
                    .OrderBy(s => s.WorkDate).ThenBy(s => s.StartTime)
                    .ToListAsync();
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy lịch theo DoctorId: {DoctorId}", doctorId);
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
                _logger.LogError(ex, "Lỗi khi lấy lịch trống. DoctorId: {DoctorId}", doctorId);
                throw;
            }
        }

        public async Task<bool> HasConflictAsync(Guid doctorId, DateTime workDate, TimeSpan startTime, TimeSpan endTime, Guid? excludeId = null)
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
                _logger.LogError(ex, "Lỗi khi kiểm tra xung đột lịch.");
                throw;
            }
        }

        public async Task<Schedule> AddAsync(Schedule schedule)
        {
            ArgumentNullException.ThrowIfNull(schedule);
            try
            {
                _context.Schedules.Add(schedule);
                await _context.SaveChangesAsync();
                return schedule;
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi DB khi thêm lịch làm việc.");
                throw new InvalidOperationException("Không thể tạo lịch làm việc.", ex);
            }
        }

        public async Task<Schedule> UpdateAsync(Schedule schedule)
        {
            ArgumentNullException.ThrowIfNull(schedule);
            var exists = await _context.Schedules.AnyAsync(s => s.Id == schedule.Id && s.IsAvailable);
            if (!exists)
                throw new KeyNotFoundException($"Không tìm thấy lịch làm việc Id: {schedule.Id}");
            try
            {
                _context.Schedules.Update(schedule);
                await _context.SaveChangesAsync();
                return schedule;
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi DB khi cập nhật lịch Id: {Id}", schedule.Id);
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

                // Chặn xóa nếu còn lịch hẹn chưa hoàn thành
                var hasAppointments = await _context.Appointments.AnyAsync(a =>
                    a.ScheduleId == id &&
                    a.Status != AppointmentStatus.Completed &&
                    a.Status != AppointmentStatus.Cancelled);

                if (hasAppointments)
                    throw new InvalidOperationException("Không thể xóa lịch đang có lịch hẹn chưa hoàn thành.");

                schedule.IsAvailable = false;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (InvalidOperationException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa lịch Id: {Id}", id);
                throw;
            }
        }
    }
}