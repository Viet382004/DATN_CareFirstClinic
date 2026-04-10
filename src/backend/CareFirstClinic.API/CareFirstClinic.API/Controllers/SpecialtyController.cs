using CareFirstClinic.API.DTOs;
using CareFirstClinic.API.DTOs.Specialty;
using CareFirstClinic.API.Services;
using CareFirstClinic.API.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CareFirstClinic.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SpecialtyController : ControllerBase
    {
        private readonly ISpecialtyService _specialtyService;
        private readonly ILogger<SpecialtyController> _logger;

        public SpecialtyController(ISpecialtyService specialtyService, ILogger<SpecialtyController> logger)
        {
            _specialtyService = specialtyService;
            _logger = logger;
        }

        // GET /api/specialty/paged
        // Public — ai cũng xem được danh sách chuyên khoa phân trang
        [HttpGet("paged")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPaged([FromQuery] SpecialtyQueryParams query)
        {
            try
            {
                var result = await _specialtyService.GetPagedAsync(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetPaged specialties.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // GET /api/specialty
        // Public — ai cũng xem được danh sách chuyên khoa
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var specialties = await _specialtyService.GetAllAsync();
                return Ok(specialties);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetAll specialties.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // GET /api/specialty/{id}
        // Public — ai cũng xem được chi tiết chuyên khoa
        [HttpGet("{id:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var specialty = await _specialtyService.GetByIdAsync(id);
                if (specialty is null)
                    return NotFound($"Không tìm thấy chuyên khoa với Id: {id}");

                return Ok(specialty);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetById specialty Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // POST /api/specialty
        // Chỉ Admin mới được tạo chuyên khoa mới
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(CreateSpecialtyDTO dto)
        {
            try
            {
                var created = await _specialtyService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, new
                {
                    message = "Tạo chuyên khoa thành công.",
                    data = created
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message); // 409 — tên trùng
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Create specialty.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // PUT /api/specialty/{id}
        // Chỉ Admin mới được cập nhật chuyên khoa
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(Guid id, UpdateSpecialtyDTO dto)
        {
            try
            {
                var updated = await _specialtyService.UpdateAsync(id, dto);
                if (updated is null)
                    return NotFound($"Không tìm thấy chuyên khoa với Id: {id}");

                return Ok(new
                {
                    message = "Cập nhật chuyên khoa thành công.",
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
                return Conflict(ex.Message); // 409 — tên trùng hoặc xung đột
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Update specialty Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // DELETE /api/specialty/{id}
        // Chỉ Admin — xóa mềm, chặn nếu còn bác sĩ active
        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var result = await _specialtyService.DeleteAsync(id);
                if (!result)
                    return NotFound($"Không tìm thấy chuyên khoa với Id: {id}");

                return Ok(new { message = "Xóa chuyên khoa thành công." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message); // 409 — còn bác sĩ active
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Delete specialty Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // PATCH /api/specialty/{id}/toggle
        // Admin bật/tắt trạng thái chuyên khoa
        // Dùng PATCH vì chỉ thay đổi 1 field IsActive
        [HttpPatch("{id:guid}/toggle")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Toggle(Guid id)
        {
            try
            {
                var isActive = await _specialtyService.ToggleActiveAsync(id);
                return Ok(new
                {
                    message = isActive ? "Chuyên khoa đã được kích hoạt." : "Chuyên khoa đã bị vô hiệu hóa.",
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
                return Conflict(ex.Message); // 409 — còn bác sĩ active
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Toggle specialty Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }
    }
}