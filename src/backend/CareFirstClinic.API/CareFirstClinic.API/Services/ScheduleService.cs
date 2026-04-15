using CareFirstClinic.API.Common;
using CareFirstClinic.API.DTOs;
using CareFirstClinic.API.Models;
using CareFirstClinic.API.Repositories.ScheduleRepo;

namespace CareFirstClinic.API.Services
{
    public class ScheduleService : IScheduleService
    {
        private readonly IScheduleRepository _Schedulerepo;
        private readonly ILogger<ScheduleService> _logger;

        public ScheduleService(IScheduleRepository repo, ILogger<ScheduleService> logger)
        {
            _Schedulerepo = repo;
            _logger = logger;
        }

        public async Task<List<ScheduleDTO>> GetAllAsync()
        {
            try
            {
                return (await _Schedulerepo.GetAllAsync()).Select(MapToDTO).ToList();
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
                var s = await _Schedulerepo.GetByIdAsync(id);
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
                return (await _Schedulerepo.GetByDoctorIdAsync(doctorId)).Select(MapToDTO).ToList();
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByDoctorIdAsync. DoctorId: {DoctorId}", doctorId);
                throw new ApplicationException("Không thể lấy lịch của bác sĩ.", ex);
            }
        }

        public async Task<List<ScheduleDTO>> GetByDoctorAndDateAsync(Guid doctorId, DateTime workDate)
        {
            if (doctorId == Guid.Empty)
                throw new ArgumentException("DoctorId không được để trống.", nameof(doctorId));

            try
            {
                var utcDate = DateTime.SpecifyKind(workDate.Date, DateTimeKind.Utc);

                var schedules = await _Schedulerepo.GetByDoctorAndDateAsync(doctorId, utcDate);

                return schedules.Select(MapToDTO).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Lỗi GetByDoctorAndDateAsync. DoctorId: {DoctorId}, Date: {Date}",
                    doctorId, workDate);

                throw new ApplicationException("Không thể lấy lịch theo ngày.", ex);
            }
        }

        public async Task<List<ScheduleDTO>> GetAvailableByDoctorAndDateAsync(Guid doctorId, DateTime date)
        {
            if (doctorId == Guid.Empty)
                throw new ArgumentException("DoctorId không được để trống.", nameof(doctorId));

            if (date.Date < DateTime.UtcNow.Date)
                throw new ArgumentException("Không thể xem lịch trong quá khứ.");

            try
            {
                var utcDate = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);
                var schedules = await _Schedulerepo.GetAvailableByDoctorAndDateAsync(doctorId, utcDate);

                var availableSchedules = schedules
                    .Where(s => s.TimeSlots.Any(ts => !ts.IsBooked)) 
                    .Select(MapToDTO)
                    .ToList();

                return availableSchedules;
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetAvailableByDoctorAndDateAsync. DoctorId: {DoctorId}, Date: {Date}",
                    doctorId, date);
                throw new ApplicationException("Không thể lấy lịch trống theo ngày.", ex);
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
                var utcDate = DateTime.SpecifyKind(fromDate.Date, DateTimeKind.Utc);
                return (await _Schedulerepo.GetAvailableByDoctorIdAsync(doctorId, utcDate)).Select(MapToDTO).ToList();
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetAvailableByDoctorIdAsync.");
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

            var hasConflict = await _Schedulerepo.HasConflictAsync(
                dto.DoctorId, dto.WorkDate, dto.StartTime, dto.EndTime);
            if (hasConflict)
                throw new InvalidOperationException("Bác sĩ đã có lịch làm việc trong khung giờ này.");

            //  Sinh danh sách TimeSlot tự động

            var timeSlots = new List<TimeSlot>();
            var current = dto.StartTime;
            var slotSpan = TimeSpan.FromMinutes(dto.SlotDurationMinutes);

            while (current + slotSpan <= dto.EndTime)
            {
                timeSlots.Add(new TimeSlot
                {
                    Id = Guid.NewGuid(),
                    StartTime = current,
                    EndTime = current + slotSpan,
                    IsBooked = false,
                    CreatedAt = DateTime.UtcNow
                });
                current += slotSpan;
            }

            var totalSlots = timeSlots.Count;

            try
            {
                var schedule = new Schedule
                {
                    Id = Guid.NewGuid(),
                    DoctorId = dto.DoctorId,
                    WorkDate = DateTime.SpecifyKind(dto.WorkDate.Date, DateTimeKind.Utc),
                    StartTime = dto.StartTime,
                    EndTime = dto.EndTime,
                    SlotDurationMinutes = dto.SlotDurationMinutes,
                    TotalSlots = totalSlots,
                    AvailableSlots = totalSlots,
                    IsAvailable = true,
                    Note = dto.Note?.Trim()
                };

                var created = await _Schedulerepo.AddAsync(schedule, timeSlots);
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

            try
            {
                var schedule = await _Schedulerepo.GetByIdAsync(id);
                if (schedule is null) return null;

                if (schedule.WorkDate.Date < DateTime.UtcNow.Date)
                    throw new InvalidOperationException("Không thể chỉnh sửa lịch làm việc đã qua.");

                schedule.Note = dto.Note?.Trim();
                schedule.IsAvailable = dto.IsAvailable;

                var updated = await _Schedulerepo.UpdateAsync(schedule);
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
                return await _Schedulerepo.DeleteAsync(id);
            }
            catch (ArgumentException) { throw; }
            catch (InvalidOperationException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi DeleteAsync schedule Id: {Id}", id);
                throw new ApplicationException("Không thể xóa lịch làm việc.", ex);
            }
        }
        public async Task<PagedResult<ScheduleDTO>> GetPagedAsync(ScheduleQueryParams query)
        {
            try
            {
                var (items, total) = await _Schedulerepo.GetPagedAsync(query);
                return new PagedResult<ScheduleDTO>
                {
                    Items = items.Select(MapToDTO).ToList(),
                    Page = query.Page,
                    PageSize = query.PageSize,
                    TotalItems = total
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetPaged Schedule.");
                throw new ApplicationException("Không thể lấy danh sách lịch làm việc.", ex);
            }
        }

        //  MAPPER 
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
            Note = s.Note,
            TimeSlots = s.TimeSlots
                .OrderBy(ts => ts.StartTime)
                .Select(ts => new TimeSlotDTO
                {
                    Id = ts.Id,
                    StartTime = ts.StartTime,
                    EndTime = ts.EndTime,
                    IsBooked = ts.IsBooked,
                    AppointmentId = ts.Appointment?.Id,
                    PatientName = ts.Appointment?.Patient?.FullName,
                    PatientPhone = ts.Appointment?.Patient?.PhoneNumber,
                    Status = ts.Appointment?.Status.ToString(),
                    Reason = ts.Appointment?.Reason
                }).ToList()
        };
    }
}