using CareFirstClinic.API.DTOs.TimeSlot;
using CareFirstClinic.API.Models;
using CareFirstClinic.API.Repositories;
using CareFirstClinic.API.Repositories.TimeSlotRepo;

namespace CareFirstClinic.API.Services
{
    public class TimeSlotService : ITimeSlotService
    {
        private readonly ITimeSlotRepository _timeSlotRepo;
        private readonly ILogger<TimeSlotService> _logger;

        public TimeSlotService(ITimeSlotRepository timeSlotRepo, ILogger<TimeSlotService> logger)
        {
            _timeSlotRepo = timeSlotRepo;
            _logger = logger;
        }

        public async Task<List<TimeSlotDTO>> GetByScheduleIdAsync(Guid scheduleId)
        {
            if (scheduleId == Guid.Empty)
                throw new ArgumentException("ScheduleId không được để trống.", nameof(scheduleId));
            try
            {
                var list = await _timeSlotRepo.GetByScheduleIdAsync(scheduleId);
                return list.Select(MapToDTO).ToList();
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByScheduleId: {ScheduleId}", scheduleId);
                throw new ApplicationException("Không thể lấy danh sách slot.", ex);
            }
        }

        public async Task<TimeSlotDTO?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));
            try
            {
                var slot = await _timeSlotRepo.GetByIdAsync(id);
                return slot is null ? null : MapToDTO(slot);
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetById Id: {Id}", id);
                throw new ApplicationException("Không thể lấy thông tin slot.", ex);
            }
        }

        // Thêm 1 slot lẻ vào Schedule có sẵn
        public async Task<TimeSlotDTO> AddSlotAsync(Guid scheduleId, TimeSpan startTime, TimeSpan endTime)
        {
            if (scheduleId == Guid.Empty)
                throw new ArgumentException("ScheduleId không được để trống.", nameof(scheduleId));
            if (endTime <= startTime)
                throw new ArgumentException("Giờ kết thúc phải sau giờ bắt đầu.");

            var existing = await _timeSlotRepo.GetByScheduleIdAsync(scheduleId);
            var hasConflict = existing.Any(t =>
                t.StartTime < endTime && t.EndTime > startTime);
            if (hasConflict)
                throw new InvalidOperationException("Slot mới bị trùng giờ với slot đã có trong lịch.");

            try
            {
                var slot = new TimeSlot
                {
                    Id = Guid.NewGuid(),
                    ScheduleId = scheduleId,
                    StartTime = startTime,
                    EndTime = endTime,
                    IsBooked = false
                };
                var created = await _timeSlotRepo.AddAsync(slot);
                // Reload để lấy navigation
                var result = await _timeSlotRepo.GetByIdAsync(created.Id);
                return MapToDTO(result!);
            }
            catch (ArgumentException) { throw; }
            catch (InvalidOperationException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi AddSlot.");
                throw new ApplicationException("Không thể thêm slot.", ex);
            }
        }

        // Bật/tắt trạng thái IsBooked — Admin dùng khi cần khóa/mở slot thủ công
        public async Task<TimeSlotDTO?> ToggleBookedAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));
            try
            {
                var slot = await _timeSlotRepo.GetByIdAsync(id);
                if (slot is null) return null;

                if (slot.Appointment is not null &&
                    slot.Appointment.Status != AppointmentStatus.Cancelled)
                    throw new InvalidOperationException(
                        "Không thể thay đổi slot đang có lịch hẹn chưa hoàn thành.");

                slot.IsBooked = !slot.IsBooked;
                var updated = await _timeSlotRepo.UpdateAsync(slot);
                return MapToDTO(updated);
            }
            catch (ArgumentException) { throw; }
            catch (InvalidOperationException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi ToggleBooked Id: {Id}", id);
                throw new ApplicationException("Không thể cập nhật trạng thái slot.", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));
            try
            {
                return await _timeSlotRepo.DeleteAsync(id);
            }
            catch (ArgumentException) { throw; }
            catch (InvalidOperationException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Delete Id: {Id}", id);
                throw new ApplicationException("Không thể xóa slot.", ex);
            }
        }

        private static TimeSlotDTO MapToDTO(TimeSlot t) => new()
        {
            Id = t.Id,
            ScheduleId = t.ScheduleId,
            WorkDate = t.Schedule?.WorkDate ?? default,
            StartTime = t.StartTime,
            EndTime = t.EndTime,
            IsBooked = t.IsBooked,
            DoctorName = t.Schedule?.Doctor?.FullName ?? string.Empty,
            SpecialtyName = t.Schedule?.Doctor?.Specialty?.Name ?? string.Empty
        };
    }
}