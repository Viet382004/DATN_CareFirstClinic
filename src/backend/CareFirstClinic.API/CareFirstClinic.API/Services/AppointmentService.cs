using CareFirstClinic.API.Common;
using CareFirstClinic.API.Data;
using CareFirstClinic.API.DTOs;
using CareFirstClinic.API.Models;
using CareFirstClinic.API.Repositories;
using CareFirstClinic.API.Repositories.AppoinmentRepo;
using Microsoft.EntityFrameworkCore;

namespace CareFirstClinic.API.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IAppointmentRepository _appointmentRepo;
        private readonly CareFirstClinicDbContext _context;
        private readonly ILogger<AppointmentService> _logger;
        private readonly IEmailService _emailService;

        public AppointmentService(IAppointmentRepository appointmentRepo, CareFirstClinicDbContext context, ILogger<AppointmentService> logger, IEmailService emailService)
        {
            _appointmentRepo = appointmentRepo;
            _context = context;
            _logger = logger;
            _emailService = emailService;
        }
        public async Task<List<AppointmentDTO>> GetAllAsync()
        {
            try
            {
                var list = await _appointmentRepo.GetAllAsync();
                return list.Select(MapToDTO).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetAll appointments.");
                throw new ApplicationException("Không thể lấy danh sách lịch hẹn.", ex);
            }
        }

        public async Task<AppointmentDTO?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));
            try
            {
                var a = await _appointmentRepo.GetByIdAsync(id);
                return a is null ? null : MapToDTO(a);
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetById Id: {Id}", id);
                throw new ApplicationException("Không thể lấy thông tin lịch hẹn.", ex);
            }
        }

        public async Task<List<AppointmentDTO>> GetMyAppointmentsAsync(Guid patientId)
        {
            if (patientId == Guid.Empty)
                throw new ArgumentException("PatientId không được để trống.", nameof(patientId));
            try
            {
                var list = await _appointmentRepo.GetByPatientIdAsync(patientId);
                return list.Select(MapToDTO).ToList();
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetMyAppointments PatientId: {PatientId}", patientId);
                throw new ApplicationException("Không thể lấy lịch hẹn.", ex);
            }
        }

        public async Task<List<AppointmentDTO>> GetByDoctorIdAsync(Guid doctorId)
        {
            if (doctorId == Guid.Empty)
                throw new ArgumentException("DoctorId không được để trống.", nameof(doctorId));
            try
            {
                var list = await _appointmentRepo.GetByDoctorIdAsync(doctorId);
                return list.Select(MapToDTO).ToList();
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByDoctorId: {DoctorId}", doctorId);
                throw new ApplicationException("Không thể lấy lịch hẹn của bác sĩ.", ex);
            }
        }

        public async Task<AppointmentDTO> CreateAsync(Guid patientId, CreateAppointmentDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);
            if (patientId == Guid.Empty)
                throw new ArgumentException("PatientId không hợp lệ.", nameof(patientId));

            // Kiểm tra TimeSlot tồn tại và còn trống
            var timeSlot = await _context.TimeSlots
                .Include(t => t.Schedule)
                .FirstOrDefaultAsync(t => t.Id == dto.TimeSlotId);

            if (timeSlot is null)
                throw new ArgumentException("TimeSlotId không tồn tại.", nameof(dto.TimeSlotId));

            if (!timeSlot.Schedule!.IsAvailable)
                throw new InvalidOperationException("Lịch làm việc này không còn khả dụng. Vui lòng chọn slot khác.");

            if (timeSlot.IsBooked)
                throw new InvalidOperationException("Lịch làm việc này đã được đặt . Vui lòng chọn slot khác.");

            var slotDateTime = timeSlot.Schedule.WorkDate.Date + timeSlot.StartTime;

            if (slotDateTime < DateTime.UtcNow)
                throw new InvalidOperationException("Không thể đặt lịch cho slot đã qua.");

            try
            {
                var appointment = new Appointment
                {
                    Id = Guid.NewGuid(),
                    PatientId = patientId,
                    TimeSlotId = dto.TimeSlotId,
                    Status = AppointmentStatus.Pending,
                    Reason = dto.Reason?.Trim(),
                    Notes = dto.Notes?.Trim(),
                    CreatedAt = DateTime.UtcNow
                };

                var created = await _appointmentRepo.AddAsync(appointment, timeSlot);

                var result = await _appointmentRepo.GetByIdAsync(created.Id);

                // Gửi email xác nhận — dùng _ để không await (fire and forget)
                _ = Task.Run(async () =>
                {
                    try
                    {
                        var email = result!.Patient?.User?.Email;
                        var patientName = result.Patient?.FullName;
                        var doctorName = result.TimeSlot?.Schedule?.Doctor?.FullName;
                        var specialty = result.TimeSlot?.Schedule?.Doctor?.Specialty?.Name;
                        var workDate = result.TimeSlot!.Schedule!.WorkDate;
                        var startTime = result.TimeSlot.StartTime;
                        var endTime = result.TimeSlot.EndTime;

                        if (!string.IsNullOrWhiteSpace(email))
                        {
                            await _emailService.SendAppointmentBookedAsync(
                                email, patientName!, doctorName!, specialty!,
                                workDate, startTime, endTime, result.Reason);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Lỗi gửi email đặt lịch AppointmentId: {Id}", created.Id);
                    }
                });
                return MapToDTO(result!);
            }
            catch (ArgumentException) { throw; }
            catch (InvalidOperationException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Create appointment.");
                throw new ApplicationException("Không thể tạo lịch hẹn.", ex);
            }
        }

        public async Task<AppointmentDTO?> UpdateAsync(Guid id, Guid patientId, UpdateAppointmentDTO dto)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));
            ArgumentNullException.ThrowIfNull(dto);

            try
            {
                var appointment = await _appointmentRepo.GetByIdAsync(id);
                if (appointment is null) return null;

                if (appointment.PatientId != patientId)
                    throw new UnauthorizedAccessException("Bạn không có quyền chỉnh sửa lịch hẹn này.");

                if (appointment.Status != AppointmentStatus.Pending)
                    throw new InvalidOperationException("Chỉ có thể chỉnh sửa lịch hẹn đang chờ xác nhận.");

                appointment.Reason = dto.Reason?.Trim();
                appointment.Notes = dto.Notes?.Trim();
                appointment.UpdatedAt = DateTime.UtcNow;

                var updated = await _appointmentRepo.UpdateAsync(appointment);
                return MapToDTO(updated);
            }
            catch (ArgumentException) { throw; }
            catch (UnauthorizedAccessException) { throw; }
            catch (InvalidOperationException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Update appointment Id: {Id}", id);
                throw new ApplicationException("Không thể cập nhật lịch hẹn.", ex);
            }
        }

        public async Task<AppointmentDTO?> ConfirmAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));
            try
            {
                var appointment = await _appointmentRepo.GetByIdAsync(id);
                if (appointment is null) return null;

                if (appointment.Status != AppointmentStatus.Pending)
                    throw new InvalidOperationException(
                        $"Không thể xác nhận lịch hẹn đang ở trạng thái '{appointment.Status}'.");

                appointment.Status = AppointmentStatus.Confirmed;
                appointment.UpdatedAt = DateTime.UtcNow;

                var updated = await _appointmentRepo.UpdateAsync(appointment);
                return MapToDTO(updated);
            }
            catch (ArgumentException) { throw; }
            catch (InvalidOperationException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Confirm appointment Id: {Id}", id);
                throw new ApplicationException("Không thể xác nhận lịch hẹn.", ex);
            }
        }

        public async Task<AppointmentDTO?> CompleteAsync(Guid id, Guid doctorId)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));

            try
            {
                var appointment = await _appointmentRepo.GetByIdAsync(id);
                if (appointment is null) return null;

                // Chỉ bác sĩ của lịch hẹn mới được hoàn thành
                var appointmentDoctorId = appointment.TimeSlot?.Schedule?.DoctorId;

                if (appointmentDoctorId != doctorId)
                    throw new UnauthorizedAccessException("Bạn không có quyền hoàn thành lịch hẹn này.");

                if (appointment.Status != AppointmentStatus.Confirmed)
                    throw new InvalidOperationException($"Không thể hoàn thành lịch hẹn đang ở trạng thái '{appointment.Status}'.");


                appointment.Status = AppointmentStatus.Completed;
                appointment.UpdatedAt = DateTime.UtcNow;

                var updated = await _appointmentRepo.UpdateAsync(appointment);
                return MapToDTO(updated);
            }
            catch (ArgumentException) { throw; }
            catch (UnauthorizedAccessException) { throw; }
            catch (InvalidOperationException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Complete appointment Id: {Id}", id);
                throw new ApplicationException("Không thể hoàn thành lịch hẹn.", ex);
            }
        }

        public async Task<AppointmentDTO?> CancelAsync(Guid id, Guid requesterId, string requesterRole, CancelAppointmentDTO dto)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));
            ArgumentNullException.ThrowIfNull(dto);

            try
            {
                var appointment = await _appointmentRepo.GetByIdAsync(id);
                if (appointment is null) return null;

                switch (requesterRole)
                {
                    case "Patient":
                        if (appointment.PatientId != requesterId)
                            throw new UnauthorizedAccessException("Bạn không có quyền hủy lịch hẹn này.");
                        break;

                    case "Doctor":
                        var doctorId = appointment.TimeSlot?.Schedule?.DoctorId;
                        if (doctorId != requesterId)
                            throw new UnauthorizedAccessException("Bạn không có quyền hủy lịch hẹn này.");
                        break;

                        // Admin có quyền hủy tất cả
                }


                if (appointment.Status == AppointmentStatus.Completed ||
                    appointment.Status == AppointmentStatus.Cancelled)
                    throw new InvalidOperationException(
                        $"Không thể hủy lịch hẹn đang ở trạng thái '{appointment.Status}'.");

                appointment.Status = AppointmentStatus.Cancelled;
                appointment.CancelReason = dto.CancelReason.Trim();
                appointment.CancelledAt = DateTime.UtcNow;
                appointment.UpdatedAt = DateTime.UtcNow;

                var updated = await _appointmentRepo.UpdateAsync(appointment);
                return MapToDTO(updated);
            }
            catch (ArgumentException) { throw; }
            catch (UnauthorizedAccessException) { throw; }
            catch (InvalidOperationException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Cancel appointment Id: {Id}", id);
                throw new ApplicationException("Không thể hủy lịch hẹn.", ex);
            }
        }

        public async Task<PagedResult<AppointmentDTO>> GetPagedAsync(AppointmentQueryParams query)
        {
            try
            {
                var (items, total) = await _appointmentRepo.GetPagedAsync(query);
                return new PagedResult<AppointmentDTO>
                {
                    Items = items.Select(MapToDTO).ToList(),
                    Page = query.Page,
                    PageSize = query.PageSize,
                    TotalItems = total
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetPaged Appointment.");
                throw new ApplicationException("Không thể lấy danh sách lịch hẹn.", ex);
            }
        }

        // MAP
        private static AppointmentDTO MapToDTO(Appointment a) => new()
        {
            Id = a.Id,
            PatientId = a.PatientId,
            PatientName = a.Patient?.FullName ?? string.Empty,
            TimeSlotId = a.TimeSlotId,
            DoctorId = a.TimeSlot?.Schedule?.DoctorId ?? Guid.Empty, // ✅ Thêm DoctorId
            DoctorName = a.TimeSlot?.Schedule?.Doctor?.FullName ?? string.Empty,
            SpecialtyName = a.TimeSlot?.Schedule?.Doctor?.Specialty?.Name ?? string.Empty,
            WorkDate = a.TimeSlot?.Schedule?.WorkDate ?? default,
            StartTime = a.TimeSlot?.StartTime ?? default,
            EndTime = a.TimeSlot?.EndTime ?? default,
            Status = a.Status.ToString(),
            Reason = a.Reason,
            CancelReason = a.CancelReason,
            CancelledAt = a.CancelledAt,
            Notes = a.Notes,
            CreatedAt = a.CreatedAt,
            UpdatedAt = a.UpdatedAt
        };
    }
}
