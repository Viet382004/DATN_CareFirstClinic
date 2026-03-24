using CareFirstClinic.API.Data;
using CareFirstClinic.API.DTOs;
using CareFirstClinic.API.Models;
using CareFirstClinic.API.Repositories;
using CareFirstClinic.API.Repositories.MedicalRecordRepo;
using Microsoft.EntityFrameworkCore;

namespace CareFirstClinic.API.Services
{
    public class MedicalRecordService : IMedicalRecordService
    {
        private readonly IMedicalRecordRepository _medicalRepo;
        private readonly CareFirstClinicDbContext _context;
        private readonly ILogger<MedicalRecordService> _logger;

        public MedicalRecordService(
            IMedicalRecordRepository medicalRepo,
            CareFirstClinicDbContext context,
            ILogger<MedicalRecordService> logger)
        {
            _medicalRepo = medicalRepo;
            _context = context;
            _logger = logger;
        }

        public async Task<List<MedicalRecordDTO>> GetAllAsync()
        {
            try
            {
                var list = await _medicalRepo.GetAllAsync();
                return list.Select(MapToDTO).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetAll MedicalRecord.");
                throw new ApplicationException("Không thể lấy danh sách hồ sơ bệnh án.", ex);
            }
        }

        public async Task<MedicalRecordDTO?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));
            try
            {
                var r = await _medicalRepo.GetByIdAsync(id);
                return r is null ? null : MapToDTO(r);
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetById Id: {Id}", id);
                throw new ApplicationException("Không thể lấy hồ sơ bệnh án.", ex);
            }
        }

        public async Task<MedicalRecordDTO?> GetByAppointmentIdAsync(Guid appointmentId)
        {
            if (appointmentId == Guid.Empty)
                throw new ArgumentException("AppointmentId không được để trống.", nameof(appointmentId));
            try
            {
                var r = await _medicalRepo.GetByAppointmentIdAsync(appointmentId);
                return r is null ? null : MapToDTO(r);
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByAppointmentId: {Id}", appointmentId);
                throw new ApplicationException("Không thể lấy hồ sơ bệnh án.", ex);
            }
        }

        public async Task<List<MedicalRecordDTO>> GetMyRecordsAsync(Guid patientId)
        {
            if (patientId == Guid.Empty)
                throw new ArgumentException("PatientId không được để trống.", nameof(patientId));
            try
            {
                var list = await _medicalRepo.GetByPatientIdAsync(patientId);
                return list.Select(MapToDTO).ToList();
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetMyRecords: {Id}", patientId);
                throw new ApplicationException("Không thể lấy hồ sơ bệnh án.", ex);
            }
        }

        public async Task<List<MedicalRecordDTO>> GetByDoctorIdAsync(Guid doctorId)
        {
            if (doctorId == Guid.Empty)
                throw new ArgumentException("DoctorId không được để trống.", nameof(doctorId));
            try
            {
                var list = await _medicalRepo.GetByDoctorIdAsync(doctorId);
                return list.Select(MapToDTO).ToList();
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByDoctorId: {Id}", doctorId);
                throw new ApplicationException("Không thể lấy hồ sơ bệnh án.", ex);
            }
        }

        public async Task<MedicalRecordDTO> CreateAsync(Guid doctorId, CreateMedicalRecordDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);
            if (doctorId == Guid.Empty)
                throw new ArgumentException("DoctorId không hợp lệ.", nameof(doctorId));

            // 1 Appointment chỉ có 1 MedicalRecord
            var exists = await _medicalRepo.ExistsByAppointmentIdAsync(dto.AppointmentId);
            if (exists)
                throw new InvalidOperationException("Lịch hẹn này đã có hồ sơ bệnh án.");

            // Lấy PatientId từ Appointment
            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == dto.AppointmentId);
            if (appointment is null)
                throw new KeyNotFoundException("Không tìm thấy lịch hẹn.");

            // Appointment phải ở trạng thái Confirmed
            if (appointment.Status != AppointmentStatus.Confirmed)
                throw new InvalidOperationException(
                    "Chỉ có thể tạo hồ sơ bệnh án cho lịch hẹn đã được xác nhận.");

            try
            {
                var record = new MedicalRecord
                {
                    Id = Guid.NewGuid(),
                    AppointmentId = dto.AppointmentId,
                    PatientId = appointment.PatientId,
                    DoctorId = doctorId,
                    Diagnosis = dto.Diagnosis.Trim(),
                    Symptoms = dto.Symptoms?.Trim(),
                    BloodPressure = dto.BloodPressure,
                    HeartRate = dto.HeartRate,
                    Temperature = dto.Temperature,
                    Weight = dto.Weight,
                    Height = dto.Height,
                    Notes = dto.Notes?.Trim(),
                    FollowUpDate = dto.FollowUpDate,
                    CreatedAt = DateTime.UtcNow
                };

                var created = await _medicalRepo.AddAsync(record);
                var result = await _medicalRepo.GetByIdAsync(created.Id);
                return MapToDTO(result!);
            }
            catch (KeyNotFoundException) { throw; }
            catch (InvalidOperationException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Create MedicalRecord.");
                throw new ApplicationException("Không thể tạo hồ sơ bệnh án.", ex);
            }
        }

        public async Task<MedicalRecordDTO?> UpdateAsync(Guid id, Guid doctorId, UpdateMedicalRecordDTO dto)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));
            ArgumentNullException.ThrowIfNull(dto);

            try
            {
                var record = await _medicalRepo.GetByIdAsync(id);
                if (record is null) return null;

                // Chỉ bác sĩ tạo mới được sửa
                if (record.DoctorId != doctorId)
                    throw new UnauthorizedAccessException("Bạn không có quyền chỉnh sửa hồ sơ này.");

                record.Diagnosis = dto.Diagnosis.Trim();
                record.Symptoms = dto.Symptoms?.Trim();
                record.BloodPressure = dto.BloodPressure;
                record.HeartRate = dto.HeartRate;
                record.Temperature = dto.Temperature;
                record.Weight = dto.Weight;
                record.Height = dto.Height;
                record.Notes = dto.Notes?.Trim();
                record.FollowUpDate = dto.FollowUpDate;
                record.UpdatedAt = DateTime.UtcNow;

                var updated = await _medicalRepo.UpdateAsync(record);
                return MapToDTO(updated);
            }
            catch (ArgumentException) { throw; }
            catch (UnauthorizedAccessException) { throw; }
            catch (KeyNotFoundException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Update MedicalRecord Id: {Id}", id);
                throw new ApplicationException("Không thể cập nhật hồ sơ bệnh án.", ex);
            }
        }

        private static MedicalRecordDTO MapToDTO(MedicalRecord m) => new()
        {
            Id = m.Id,
            PatientId = m.PatientId,
            PatientName = m.Patient?.FullName ?? string.Empty,
            DoctorId = m.DoctorId,
            DoctorName = m.Doctor?.FullName ?? string.Empty,
            AppointmentId = m.AppointmentId,
            Diagnosis = m.Diagnosis,
            Symptoms = m.Symptoms,
            BloodPressure = m.BloodPressure,
            HeartRate = m.HeartRate,
            Temperature = m.Temperature,
            Weight = m.Weight,
            Height = m.Height,
            Notes = m.Notes,
            FollowUpDate = m.FollowUpDate,
            CreatedAt = m.CreatedAt,
            UpdatedAt = m.UpdatedAt,
            HasPrescription = m.Prescription is not null
        };
    }
}