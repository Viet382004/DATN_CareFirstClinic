using CareFirstClinic.API.DTOs;
using CareFirstClinic.API.Models;
using CareFirstClinic.API.Repositories;

namespace CareFirstClinic.API.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IAppointmentRepository _appointmentRepo;
        private readonly ILogger<AppointmentService> _logger;

        public AppointmentService(IAppointmentRepository appointmentRepo, ILogger<AppointmentService> logger)
        {
            _appointmentRepo = appointmentRepo;
            _logger = logger;
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

                var created = await _appointmentRepo.AddAsync(appointment);

                // Reload để lấy đầy đủ navigation (Patient, TimeSlot, Doctor...)
                var result = await _appointmentRepo.GetByIdAsync(created.Id);
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

                // Chỉ chủ nhân mới được sửa
                if (appointment.PatientId != patientId)
                    throw new UnauthorizedAccessException("Bạn không có quyền chỉnh sửa lịch hẹn này.");

                // Chỉ sửa được khi còn Pending
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

        // Admin/Doctor xác nhận lịch hẹn
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

        // Doctor hoàn thành lịch hẹn sau khi khám xong
        public async Task<AppointmentDTO?> CompleteAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));
            try
            {
                var appointment = await _appointmentRepo.GetByIdAsync(id);
                if (appointment is null) return null;

                if (appointment.Status != AppointmentStatus.Confirmed)
                    throw new InvalidOperationException(
                        $"Không thể hoàn thành lịch hẹn đang ở trạng thái '{appointment.Status}'.");

                appointment.Status = AppointmentStatus.Completed;
                appointment.UpdatedAt = DateTime.UtcNow;

                var updated = await _appointmentRepo.UpdateAsync(appointment);
                return MapToDTO(updated);
            }
            catch (ArgumentException) { throw; }
            catch (InvalidOperationException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Complete appointment Id: {Id}", id);
                throw new ApplicationException("Không thể hoàn thành lịch hẹn.", ex);
            }
        }

        // Patient/Doctor/Admin hủy lịch hẹn
        public async Task<AppointmentDTO?> CancelAsync(Guid id, Guid requesterId, string requesterRole, CancelAppointmentDTO dto)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));
            ArgumentNullException.ThrowIfNull(dto);

            try
            {
                var appointment = await _appointmentRepo.GetByIdAsync(id);
                if (appointment is null) return null;

                // Patient chỉ được hủy lịch của mình
                if (requesterRole == "Patient" && appointment.PatientId != requesterId)
                    throw new UnauthorizedAccessException("Bạn không có quyền hủy lịch hẹn này.");

                // Không hủy lịch đã hoàn thành hoặc đã hủy
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



        // MAP
        private static AppointmentDTO MapToDTO(Appointment a) => new()
        {
            Id = a.Id,
            PatientId = a.PatientId,
            PatientName = a.Patient?.FullName ?? string.Empty,
            TimeSlotId = a.TimeSlotId,
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
