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
    public class PrescriptionController : ControllerBase
    {
        private readonly IPrescriptionService _prescriptionService;
        private readonly IDoctorService _doctorService;
        private readonly ILogger<PrescriptionController> _logger;

        public PrescriptionController(
            IPrescriptionService prescriptionService,
            IDoctorService doctorService,
            ILogger<PrescriptionController> logger)
        {
            _prescriptionService = prescriptionService;
            _doctorService = doctorService;
            _logger = logger;
        }

        // GET /api/prescription/{id}
        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Admin,Doctor,Patient")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var p = await _prescriptionService.GetByIdAsync(id);
                return p is null ? NotFound($"Không tìm thấy đơn thuốc với Id: {id}") : Ok(p);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetById Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // GET /api/prescription/medicalrecord/{medicalRecordId}
        [HttpGet("medicalrecord/{medicalRecordId:guid}")]
        [Authorize(Roles = "Admin,Doctor,Patient")]
        public async Task<IActionResult> GetByMedicalRecordId(Guid medicalRecordId)
        {
            try
            {
                var p = await _prescriptionService.GetByMedicalRecordIdAsync(medicalRecordId);
                if (p is null) return NotFound("Hồ sơ này chưa có đơn thuốc.");
                return Ok(p);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByMedicalRecordId: {Id}", medicalRecordId);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // POST /api/prescription — Doctor kê đơn thuốc
        [HttpPost]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> Create(CreatePrescriptionDTO dto)
        {
            try
            {
                var userId = GetUserIdFromClaim();
                if (userId is null) return Unauthorized("Không xác định được tài khoản.");

                var doctor = await _doctorService.GetByUserIdAsync(userId.Value);
                if (doctor is null) return NotFound("Không tìm thấy hồ sơ bác sĩ.");

                var created = await _prescriptionService.CreateAsync(doctor.Id, dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id },
                    new { message = "Tạo đơn thuốc thành công.", data = created });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
            catch (InvalidOperationException ex) { return Conflict(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Create Prescription.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // PATCH /api/prescription/{id}/dispense — Admin phát thuốc + trừ kho
        [HttpPatch("{id:guid}/dispense")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Dispense(Guid id)
        {
            try
            {
                var updated = await _prescriptionService.DispenseAsync(id);
                if (updated is null) return NotFound($"Không tìm thấy đơn thuốc với Id: {id}");
                return Ok(new { message = "Phát thuốc thành công.", data = updated });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (InvalidOperationException ex) { return Conflict(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Dispense Prescription Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // PATCH /api/prescription/{id}/cancel — Doctor/Admin hủy đơn
        [HttpPatch("{id:guid}/cancel")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> Cancel(Guid id)
        {
            try
            {
                var updated = await _prescriptionService.CancelAsync(id);
                if (updated is null) return NotFound($"Không tìm thấy đơn thuốc với Id: {id}");
                return Ok(new { message = "Hủy đơn thuốc thành công.", data = updated });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (InvalidOperationException ex) { return Conflict(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Cancel Prescription Id: {Id}", id);
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