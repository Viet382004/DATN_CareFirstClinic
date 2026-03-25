using CareFirstClinic.API.Common;
using CareFirstClinic.API.DTOs;
using CareFirstClinic.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CareFirstClinic.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorController : ControllerBase
    {
        private readonly IDoctorService _doctorService;
        private readonly ILogger<DoctorController> _logger;

        public DoctorController(IDoctorService doctorService, ILogger<DoctorController> logger)
        {
            _doctorService = doctorService;
            _logger = logger;
        }

        // GET /api/doctor
        // GET /api/doctor?name=nguyen&specialtyId=xxx&page=1&pageSize=10&sortBy=name&sortDir=asc
        [HttpGet]
        [AllowAnonymous] // Patient chưa đăng nhập vẫn xem được danh sách bác sĩ
        public async Task<IActionResult> GetPaged([FromQuery] DoctorQueryParams query)
        {
            try { return Ok(await _doctorService.GetPagedAsync(query)); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetPaged Doctor.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // GET /api/doctor/me
        // Bác sĩ xem hồ sơ của chính mình
        // Đặt TRƯỚC {id} để tránh nhầm "me" thành Guid
        [HttpGet("me")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetMe()
        {
            try
            {
                var userId = GetUserIdFromClaim();
                if (userId is null)
                    return Unauthorized("Không xác định được tài khoản.");

                var doctor = await _doctorService.GetByUserIdAsync(userId.Value);
                if (doctor is null)
                    return NotFound("Không tìm thấy hồ sơ bác sĩ.");

                return Ok(doctor);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetMe doctor.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // GET /api/doctor/{id}
        // Public — xem chi tiết 1 bác sĩ
        [HttpGet("{id:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var doctor = await _doctorService.GetByIdAsync(id);
                if (doctor is null)
                    return NotFound($"Không tìm thấy bác sĩ với Id: {id}");

                return Ok(doctor);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetById doctor Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // GET /api/doctor/specialty/{specialtyId}
        // Public — lọc bác sĩ theo chuyên khoa
        [HttpGet("specialty/{specialtyId:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBySpecialty(Guid specialtyId)
        {
            try
            {
                var doctors = await _doctorService.GetBySpecialtyAsync(specialtyId);
                return Ok(doctors);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetBySpecialty specialtyId: {SpecialtyId}", specialtyId);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // POST /api/doctor
        // Chỉ Admin mới được tạo hồ sơ bác sĩ
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(CreateDoctorDTO dto)
        {
            try
            {
                var created = await _doctorService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, new
                {
                    message = "Tạo hồ sơ bác sĩ thành công.",
                    data = created
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message); // 404 — SpecialtyId không tồn tại
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message); // 409 — UserId đã có hồ sơ
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Create doctor.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        
        // PUT /api/doctor/me
        // Bác sĩ tự cập nhật hồ sơ của mình
        [HttpPut("me")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> UpdateMe(UpdateDoctorDTO dto)
        {
            try
            {
                var userId = GetUserIdFromClaim();
                if (userId is null)
                    return Unauthorized("Không xác định được tài khoản.");

                var existing = await _doctorService.GetByUserIdAsync(userId.Value);
                if (existing is null)
                    return NotFound("Không tìm thấy hồ sơ bác sĩ.");

                var updated = await _doctorService.UpdateAsync(existing.Id, dto);
                return Ok(new
                {
                    message = "Cập nhật hồ sơ thành công.",
                    data = updated
                });
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
                _logger.LogError(ex, "Lỗi UpdateMe doctor.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // PUT /api/doctor/{id}
        // Admin cập nhật hồ sơ bất kỳ bác sĩ
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(Guid id, UpdateDoctorDTO dto)
        {
            try
            {
                var updated = await _doctorService.UpdateAsync(id, dto);
                if (updated is null)
                    return NotFound($"Không tìm thấy bác sĩ với Id: {id}");

                return Ok(new
                {
                    message = "Cập nhật hồ sơ thành công.",
                    data = updated
                });
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
                _logger.LogError(ex, "Lỗi Update doctor Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // DELETE /api/doctor/{id}
        // Chỉ Admin — xóa mềm, chặn nếu còn lịch hẹn tương lai
        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var result = await _doctorService.DeleteAsync(id);
                if (!result)
                    return NotFound($"Không tìm thấy bác sĩ với Id: {id}");

                return Ok(new { message = "Xóa bác sĩ thành công." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message); // 409 — còn lịch hẹn tương lai
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Delete doctor Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // PATCH /api/doctor/{id}/toggle
        // Admin bật/tắt trạng thái bác sĩ
        [HttpPatch("{id:guid}/toggle")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Toggle(Guid id)
        {
            try
            {
                var isActive = await _doctorService.ToggleActiveAsync(id);
                return Ok(new
                {
                    message = isActive ? "Bác sĩ đã được kích hoạt." : "Bác sĩ đã bị vô hiệu hóa.",
                    isActive = isActive
                });
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
                _logger.LogError(ex, "Lỗi Toggle doctor Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        
        // HELPER — Lấy UserId từ JWT claim
        private Guid? GetUserIdFromClaim()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(claim, out var userId) ? userId : null;
        }
    }
}