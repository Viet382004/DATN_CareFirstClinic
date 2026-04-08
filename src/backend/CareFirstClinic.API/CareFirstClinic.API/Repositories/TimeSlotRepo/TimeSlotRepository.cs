using CareFirstClinic.API.Data;
using CareFirstClinic.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CareFirstClinic.API.Repositories.TimeSlotRepo
{
    public class TimeSlotRepository : ITimeSlotRepository
    {
        private readonly CareFirstClinicDbContext _context;
        private readonly ILogger<TimeSlotRepository> _logger;

        public TimeSlotRepository(CareFirstClinicDbContext context, ILogger<TimeSlotRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<TimeSlot>> GetByScheduleIdAsync(Guid scheduleId)
        {
            if (scheduleId == Guid.Empty)
                throw new ArgumentException("ScheduleId không hợp lệ.", nameof(scheduleId));
            try
            {
                return await _context.TimeSlots
                    .Include(t => t.Schedule)
                        .ThenInclude(s => s.Doctor)
                            .ThenInclude(d => d.Specialty)
                    .Where(t => t.ScheduleId == scheduleId)
                    .OrderBy(t => t.StartTime)
                    .ToListAsync();
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByScheduleId: {ScheduleId}", scheduleId);
                throw;
            }
        }

        public async Task<TimeSlot?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không hợp lệ.", nameof(id));
            try
            {
                return await _context.TimeSlots
                    .Include(t => t.Schedule)
                        .ThenInclude(s => s.Doctor)
                            .ThenInclude(d => d.Specialty)
                    .FirstOrDefaultAsync(t => t.Id == id);
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetById Id: {Id}", id);
                throw;
            }
        }

        public async Task<TimeSlot> AddAsync(TimeSlot timeSlot)
        {
            ArgumentNullException.ThrowIfNull(timeSlot);
            try
            {
                _context.TimeSlots.Add(timeSlot);
                await _context.SaveChangesAsync();
                return timeSlot;
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi DB khi thêm TimeSlot.");
                throw new InvalidOperationException("Không thể thêm slot. Vui lòng thử lại.", ex);
            }
        }

        public async Task<TimeSlot> UpdateAsync(TimeSlot timeSlot)
        {
            ArgumentNullException.ThrowIfNull(timeSlot);
            var exists = await _context.TimeSlots.AnyAsync(t => t.Id == timeSlot.Id);
            if (!exists)
                throw new KeyNotFoundException($"Không tìm thấy slot với Id: {timeSlot.Id}");
            try
            {
                _context.TimeSlots.Update(timeSlot);
                await _context.SaveChangesAsync();
                return timeSlot;
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, "Xung đột dữ liệu khi cập nhật TimeSlot Id: {Id}", timeSlot.Id);
                throw new InvalidOperationException("Dữ liệu đã bị thay đổi. Vui lòng tải lại.", ex);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi DB khi cập nhật TimeSlot Id: {Id}", timeSlot.Id);
                throw new InvalidOperationException("Không thể cập nhật slot. Vui lòng thử lại.", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không hợp lệ.", nameof(id));
            try
            {
                var slot = await _context.TimeSlots
                    .Include(t => t.Appointment)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (slot is null) return false;

                // Không xóa slot đã được đặt
                if (slot.IsBooked)
                    throw new InvalidOperationException("Không thể xóa slot đã được đặt lịch.");

                _context.TimeSlots.Remove(slot);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (InvalidOperationException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Delete TimeSlot Id: {Id}", id);
                throw;
            }
        }
    }
}