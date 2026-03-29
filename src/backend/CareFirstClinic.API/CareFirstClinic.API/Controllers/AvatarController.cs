using CareFirstClinic.API.DTOs;
using CareFirstClinic.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CareFirstClinic.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AvatarController : ControllerBase
    {
        private readonly IImageService _imageService;
        private readonly IDoctorService _doctorService;
        private readonly IPatientService _patientService;
        private readonly ILogger<AvatarController> _logger;

        public AvatarController(
            IImageService imageService,
            IDoctorService doctorService,
            IPatientService patientService,
            ILogger<AvatarController> logger)
        {
            _imageService = imageService;
            _doctorService = doctorService;
            _patientService = patientService;
            _logger = logger;
        }

        // POST /api/avatar/doctor
        [HttpPost("doctor")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<IActionResult> UploadDoctorAvatar(IFormFile file)
        {
            try
            {
                var userId = GetUserIdFromClaim();
                if (userId is null) return Unauthorized("Không xác định được tài khoản.");

                DoctorDTO? doctor;

                if (User.IsInRole("Admin"))
                {
                    return BadRequest("Admin dùng endpoint POST /api/avatar/doctor/{doctorId}");
                }
                else
                {
                    doctor = await _doctorService.GetByUserIdAsync(userId.Value);
                    if (doctor is null) return NotFound("Không tìm thấy hồ sơ bác sĩ.");
                }

                await _imageService.DeleteAvatarAsync(doctor.AvatarUrl);

                var avatarUrl = await _imageService.UploadAvatarAsync(file, "doctor");

                var updated = await _doctorService.UpdateAvatarAsync(doctor.Id, avatarUrl);

                return Ok(new
                {
                    message = "Cập nhật ảnh đại diện thành công.",
                    avatarUrl = updated?.AvatarUrl
                });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi upload avatar doctor.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // Admin upload avatar cho bác sĩ cụ thể
        // POST /api/avatar/doctor/{doctorId}
        [HttpPost("doctor/{doctorId:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UploadDoctorAvatarById(Guid doctorId, IFormFile file)
        {
            try
            {
                var doctor = await _doctorService.GetByIdAsync(doctorId);
                if (doctor is null) return NotFound($"Không tìm thấy bác sĩ với Id: {doctorId}");

                await _imageService.DeleteAvatarAsync(doctor.AvatarUrl);
                var avatarUrl = await _imageService.UploadAvatarAsync(file, "doctor");
                var updated = await _doctorService.UpdateAvatarAsync(doctorId, avatarUrl);

                return Ok(new
                {
                    message = "Cập nhật ảnh đại diện thành công.",
                    avatarUrl = updated?.AvatarUrl
                });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi upload avatar doctor {DoctorId}", doctorId);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // POST /api/avatar/patient
        [HttpPost("patient")]
        [Authorize(Roles = "Patient,Admin")]
        public async Task<IActionResult> UploadPatientAvatar(IFormFile file)
        {
            try
            {
                var userId = GetUserIdFromClaim();
                if (userId is null) return Unauthorized("Không xác định được tài khoản.");

                PatientDTO? patient;

                if (User.IsInRole("Admin"))
                    return BadRequest("Admin dùng endpoint POST /api/avatar/patient/{patientId}");

                patient = await _patientService.GetByUserIdAsync(userId.Value);
                if (patient is null) return NotFound("Không tìm thấy hồ sơ bệnh nhân.");

                await _imageService.DeleteAvatarAsync(patient.AvatarUrl);
                var avatarUrl = await _imageService.UploadAvatarAsync(file, "patient");
                var updated = await _patientService.UpdateAvatarAsync(patient.Id, avatarUrl);

                return Ok(new
                {
                    message = "Cập nhật ảnh đại diện thành công.",
                    avatarUrl = updated?.AvatarUrl
                });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi upload avatar patient.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // Admin upload avatar cho bệnh nhân cụ thể
        // POST /api/avatar/patient/{patientId}
        [HttpPost("patient/{patientId:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UploadPatientAvatarById(Guid patientId, IFormFile file)
        {
            try
            {
                var patient = await _patientService.GetByIdAsync(patientId);
                if (patient is null) return NotFound($"Không tìm thấy bệnh nhân với Id: {patientId}");

                await _imageService.DeleteAvatarAsync(patient.AvatarUrl);
                var avatarUrl = await _imageService.UploadAvatarAsync(file, "patient");
                var updated = await _patientService.UpdateAvatarAsync(patientId, avatarUrl);

                return Ok(new
                {
                    message = "Cập nhật ảnh đại diện thành công.",
                    avatarUrl = updated?.AvatarUrl
                });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi upload avatar patient {PatientId}", patientId);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // DELETE /api/avatar/doctor
        [HttpDelete("doctor")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<IActionResult> DeleteDoctorAvatar()
        {
            try
            {
                var userId = GetUserIdFromClaim();
                if (userId is null) return Unauthorized("Không xác định được tài khoản.");

                var doctor = await _doctorService.GetByUserIdAsync(userId.Value);
                if (doctor is null) return NotFound("Không tìm thấy hồ sơ bác sĩ.");

                await _imageService.DeleteAvatarAsync(doctor.AvatarUrl);
                await _doctorService.UpdateAvatarAsync(doctor.Id, null);

                return Ok(new { message = "Đã xóa ảnh đại diện." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi xóa avatar doctor.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // DELETE /api/avatar/patient
        [HttpDelete("patient")]
        [Authorize(Roles = "Patient,Admin")]
        public async Task<IActionResult> DeletePatientAvatar()
        {
            try
            {
                var userId = GetUserIdFromClaim();
                if (userId is null) return Unauthorized("Không xác định được tài khoản.");

                var patient = await _patientService.GetByUserIdAsync(userId.Value);
                if (patient is null) return NotFound("Không tìm thấy hồ sơ bệnh nhân.");

                await _imageService.DeleteAvatarAsync(patient.AvatarUrl);
                await _patientService.UpdateAvatarAsync(patient.Id, null);

                return Ok(new { message = "Đã xóa ảnh đại diện." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi xóa avatar patient.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        private Guid? GetUserIdFromClaim()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(claim, out var id) ? id : null;
        }
    }
}