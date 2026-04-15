using CareFirstClinic.API.DTOs;
using CareFirstClinic.API.Models;
using CareFirstClinic.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CareFirstClinic.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PatientController : ControllerBase
    {
        private readonly IPatientService _patientService;
        private readonly ILogger<PatientController> _logger;

        public PatientController(IPatientService patientService, ILogger<PatientController> logger)
        {
            _patientService = patientService;
            _logger = logger;
        }

        // GET /api/patient — Admin xem tất cả
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var patients = await _patientService.GetAllAsync();
                return Ok(patients);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetAll patients.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // GET /api/patient/me — Bệnh nhân xem hồ sơ bản thân
        [HttpGet("me")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetMe()
        {
            try
            {
                var userId = GetUserIdFromClaim();
                if (userId is null)
                    return Unauthorized("Không xác định được tài khoản.");

                var patient = await _patientService.GetByUserIdAsync(userId.Value);
                if (patient is null)
                    return NotFound("Không tìm thấy hồ sơ bệnh nhân.");

                return Ok(patient);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetMe patient.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // GET /api/patient/{id} — Admin, Doctor xem chi tiết
        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var patient = await _patientService.GetByIdAsync(id);
                if (patient is null)
                    return NotFound($"Không tìm thấy bệnh nhân với Id: {id}");

                return Ok(patient);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetById patient Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // POST /api/patient — Admin tạo mới (thường sẽ tạo User trước, sau đó mới tạo Patient liên kết)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(CreatePatientDTO dto)
        {
            try
            {
                var created = await _patientService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Create patient.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }


        // PUT /api/patient/me — Bệnh nhân tự cập nhật hồ sơ
        [HttpPut("me")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> UpdateMe(UpdatePatientDTO dto)
        {
            try
            {
                var userId = GetUserIdFromClaim();
                if (userId is null)
                    return Unauthorized("Không xác định được tài khoản.");

                // Lấy PatientId từ UserId
                var existing = await _patientService.GetByUserIdAsync(userId.Value);
                if (existing is null)
                    return NotFound("Không tìm thấy hồ sơ bệnh nhân.");

                var updated = await _patientService.UpdateAsync(existing.Id, dto);
                return Ok(new { message = "Cập nhật hồ sơ thành công.", data = updated });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message); // 409 — xung đột dữ liệu
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi UpdateMe patient.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // PUT /api/patient/{id} — Admin cập nhật bất kỳ
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(Guid id, UpdatePatientDTO dto)
        {
            try
            {
                var updated = await _patientService.UpdateAsync(id, dto);
                if (updated is null)
                    return NotFound($"Không tìm thấy bệnh nhân với Id: {id}");

                return Ok(new { message = "Cập nhật hồ sơ thành công.", data = updated });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Update patient Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // DELETE /api/patient/{id} — Admin xóa mềm
        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var result = await _patientService.DeleteAsync(id);
                if (!result)
                    return NotFound($"Không tìm thấy bệnh nhân với Id: {id}");

                return Ok(new { message = "Xóa bệnh nhân thành công." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Delete patient Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // PATCH /api/patient/{id}/toggle — Admin toggle
        [HttpPatch("{id:guid}/toggle")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Toggle([FromServices] CareFirstClinic.API.Data.CareFirstClinicDbContext context, Guid id)
        {
            try
            {
                var patient = await context.Patients.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == id);
                if (patient == null || patient.User == null)
                    return NotFound($"Không tìm thấy bệnh nhân với Id: {id}");

                patient.User.IsActive = !patient.User.IsActive;
                await context.SaveChangesAsync();

                return Ok(new { message = "Cập nhật trạng thái thành công." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Toggle patient Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // HELPER — Lấy UserId từ JWT claim, tránh lặp code
        private Guid? GetUserIdFromClaim()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(claim, out var userId) ? userId : null;
        }
    }
}