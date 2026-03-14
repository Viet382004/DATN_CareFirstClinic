using CareFirstClinic.API.DTOs;
using CareFirstClinic.API.Models;
using CareFirstClinic.API.Repositories;

namespace CareFirstClinic.API.Services
{
    public class ScheduleService : IScheduleService
    {
        private readonly IScheduleRepository _repo;
        private readonly ILogger<ScheduleService> _logger;

        public ScheduleService(IScheduleRepository repo, ILogger<ScheduleService> logger)
        {
            _repo = repo;
            _logger = logger;
        }

        public async Task<List<ScheduleDTO>> GetAllAsync()
        {
            try
            {
                var list = await _repo.GetAllAsync();
                return list.Select(MapToDTO).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetAllAsync schedule.");
                throw new ApplicationException("Không thể lấy danh sách lịch làm việc.", ex);
            }
        }

        public async Task<ScheduleDTO?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));
            try
            {
                var s = await _repo.GetByIdAsync(id);
                return s is null ? null : MapToDTO(s);
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByIdAsync schedule Id: {Id}", id);
                throw new ApplicationException("Không thể lấy thông tin lịch làm việc.", ex);
            }
        }

        public async Task<List<ScheduleDTO>> GetByDoctorIdAsync(Guid doctorId)
        {
            if (doctorId == Guid.Empty)
                throw new ArgumentException("DoctorId không được để trống.", nameof(doctorId));
            try
            {
                var list = await _repo.GetByDoctorIdAsync(doctorId);
                return list.Select(MapToDTO).ToList();
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByDoctorIdAsync. DoctorId: {DoctorId}", doctorId);
                throw new ApplicationException("Không thể lấy lịch của bác sĩ.", ex);
            }
        }

        public async Task<List<ScheduleDTO>> GetAvailableByDoctorIdAsync(Guid doctorId, DateTime fromDate)
        {
            if (doctorId == Guid.Empty)
                throw new ArgumentException("DoctorId không được để trống.", nameof(doctorId));
            if (fromDate.Date < DateTime.UtcNow.Date)
                throw new ArgumentException("Ngày bắt đầu không được ở quá khứ.");
            try
            {
                var list = await _repo.GetAvailableByDoctorIdAsync(doctorId, fromDate);
                return list.Select(MapToDTO).ToList();
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetAvailableByDoctorIdAsync. DoctorId: {DoctorId}", doctorId);
                throw new ApplicationException("Không thể lấy lịch còn trống.", ex);
            }
        }

        public async Task<ScheduleDTO> CreateAsync(CreateScheduleDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            if (dto.WorkDate.Date < DateTime.UtcNow.Date)
                throw new ArgumentException("Ngày làm việc không được ở quá khứ.");

            if (dto.EndTime <= dto.StartTime)
                throw new ArgumentException("Giờ kết thúc phải sau giờ bắt đầu.");

            if ((dto.EndTime - dto.StartTime).TotalMinutes < 60)
                throw new ArgumentException("Ca làm việc phải có ít nhất 1 tiếng.");

            var hasConflict = await _repo.HasConflictAsync(dto.DoctorId, dto.WorkDate, dto.StartTime, dto.EndTime);
            if (hasConflict)
                throw new InvalidOperationException("Bác sĩ đã có lịch làm việc trong khung giờ này.");

            var totalSlots = (int)((dto.EndTime - dto.StartTime).TotalMinutes / dto.SlotDurationMinutes);

            try
            {
                var schedule = new Schedule
                {
                    Id = Guid.NewGuid(),
                    DoctorId = dto.DoctorId,
                    WorkDate = dto.WorkDate.Date,
                    StartTime = dto.StartTime,
                    EndTime = dto.EndTime,
                    SlotDurationMinutes = dto.SlotDurationMinutes,
                    TotalSlots = totalSlots,
                    AvailableSlots = totalSlots,
                    IsAvailable = true,
                    Note = dto.Note?.Trim()
                };
                var created = await _repo.AddAsync(schedule);
                return MapToDTO(created);
            }
            catch (ArgumentException) { throw; }
            catch (InvalidOperationException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi CreateAsync schedule.");
                throw new ApplicationException("Không thể tạo lịch làm việc.", ex);
            }
        }

        public async Task<ScheduleDTO?> UpdateAsync(Guid id, UpdateScheduleDTO dto)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));
            ArgumentNullException.ThrowIfNull(dto);

            if (dto.EndTime <= dto.StartTime)
                throw new ArgumentException("Giờ kết thúc phải sau giờ bắt đầu.");

            if ((dto.EndTime - dto.StartTime).TotalMinutes < 60)
                throw new ArgumentException("Ca làm việc phải có ít nhất 1 tiếng.");

            try
            {
                var schedule = await _repo.GetByIdAsync(id);
                if (schedule is null) return null;

                if (schedule.WorkDate.Date < DateTime.UtcNow.Date)
                    throw new InvalidOperationException("Không thể chỉnh sửa lịch làm việc đã qua.");

                var hasConflict = await _repo.HasConflictAsync(
                    schedule.DoctorId, schedule.WorkDate, dto.StartTime, dto.EndTime, excludeId: id);
                if (hasConflict)
                    throw new InvalidOperationException("Bác sĩ đã có lịch làm việc trong khung giờ này.");

                var totalSlots = (int)((dto.EndTime - dto.StartTime).TotalMinutes / dto.SlotDurationMinutes);
                var bookedSlots = schedule.TotalSlots - schedule.AvailableSlots;

                if (totalSlots < bookedSlots)
                    throw new InvalidOperationException(
                        $"Không thể giảm slot xuống {totalSlots} vì đã có {bookedSlots} slot được đặt.");

                schedule.StartTime = dto.StartTime;
                schedule.EndTime = dto.EndTime;
                schedule.SlotDurationMinutes = dto.SlotDurationMinutes;
                schedule.TotalSlots = totalSlots;
                schedule.AvailableSlots = totalSlots - bookedSlots;
                schedule.IsAvailable = dto.IsAvailable;
                schedule.Note = dto.Note?.Trim();

                var updated = await _repo.UpdateAsync(schedule);
                return MapToDTO(updated);
            }
            catch (ArgumentException) { throw; }
            catch (KeyNotFoundException) { throw; }
            catch (InvalidOperationException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi UpdateAsync schedule Id: {Id}", id);
                throw new ApplicationException("Không thể cập nhật lịch làm việc.", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));
            try
            {
                return await _repo.DeleteAsync(id);
            }
            catch (ArgumentException) { throw; }
            catch (InvalidOperationException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi DeleteAsync schedule Id: {Id}", id);
                throw new ApplicationException("Không thể xóa lịch làm việc.", ex);
            }
        }

        // MAPPER 
        private static ScheduleDTO MapToDTO(Schedule s) => new()
        {
            Id = s.Id,
            DoctorId = s.DoctorId,
            DoctorName = s.Doctor?.FullName ?? string.Empty,
            SpecialtyName = s.Doctor?.Specialty?.Name ?? string.Empty,
            WorkDate = s.WorkDate,
            StartTime = s.StartTime,
            EndTime = s.EndTime,
            SlotDurationMinutes = s.SlotDurationMinutes,
            TotalSlots = s.TotalSlots,
            AvailableSlots = s.AvailableSlots,
            IsAvailable = s.IsAvailable,
            Note = s.Note
        };
    }
}