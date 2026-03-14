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
    public class ScheduleController : ControllerBase
    {
        private readonly IScheduleService _scheduleService;
        private readonly IDoctorService _doctorService;
        private readonly ILogger<ScheduleController> _logger;

        public ScheduleController(
            IScheduleService scheduleService,
            IDoctorService doctorService,
            ILogger<ScheduleController> logger)
        {
            _scheduleService = scheduleService;
            _doctorService = doctorService;
            _logger = logger;
        }

        // GET /api/schedule — Admin xem tất cả
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                return Ok(await _scheduleService.GetAllAsync());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetAll schedule.");
                return StatusCode(500, "Lỗi hệ thống.");
            }
        }

        // GET /api/schedule/{id}
        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var result = await _scheduleService.GetByIdAsync(id);
                return result is null ? NotFound($"Không tìm thấy lịch Id: {id}") : Ok(result);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetById schedule.");
                return StatusCode(500, "Lỗi hệ thống.");
            }
        }

        // GET /api/schedule/me — Bác sĩ xem lịch của mình
        [HttpGet("me")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetMySchedules()
        {
            try
            {
                var userId = GetUserId();
                if (userId is null) return Unauthorized();

                var doctor = await _doctorService.GetByUserIdAsync(userId.Value);
                if (doctor is null) return NotFound("Không tìm thấy hồ sơ bác sĩ.");

                return Ok(await _scheduleService.GetByDoctorIdAsync(doctor.Id));
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetMySchedules.");
                return StatusCode(500, "Lỗi hệ thống.");
            }
        }

        // GET /api/schedule/doctor/{doctorId} — Xem lịch của 1 bác sĩ
        [HttpGet("doctor/{doctorId:guid}")]
        [Authorize(Roles = "Admin,Doctor,Patient")]
        public async Task<IActionResult> GetByDoctorId(Guid doctorId)
        {
            try
            {
                return Ok(await _scheduleService.GetByDoctorIdAsync(doctorId));
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByDoctorId.");
                return StatusCode(500, "Lỗi hệ thống.");
            }
        }

        // GET /api/schedule/doctor/{doctorId}/available?fromDate=2025-01-01
        // Bệnh nhân xem lịch còn slot để đặt
        [HttpGet("doctor/{doctorId:guid}/available")]
        [Authorize(Roles = "Admin,Doctor,Patient")]
        public async Task<IActionResult> GetAvailable(Guid doctorId, [FromQuery] DateTime? fromDate)
        {
            try
            {
                var from = fromDate?.Date ?? DateTime.UtcNow.Date;
                return Ok(await _scheduleService.GetAvailableByDoctorIdAsync(doctorId, from));
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetAvailable.");
                return StatusCode(500, "Lỗi hệ thống.");
            }
        }

        // POST /api/schedule — Admin tạo lịch cho bác sĩ bất kỳ
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(CreateScheduleDTO dto)
        {
            try
            {
                var created = await _scheduleService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id },
                    new { message = "Tạo lịch làm việc thành công.", data = created });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (InvalidOperationException ex) { return Conflict(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Create schedule.");
                return StatusCode(500, "Lỗi hệ thống.");
            }
        }

        // POST /api/schedule/me — Bác sĩ tự tạo lịch của mình
        [HttpPost("me")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> CreateForMe(CreateScheduleDTO dto)
        {
            try
            {
                var userId = GetUserId();
                if (userId is null) return Unauthorized();

                var doctor = await _doctorService.GetByUserIdAsync(userId.Value);
                if (doctor is null) return NotFound("Không tìm thấy hồ sơ bác sĩ.");

                dto.DoctorId = doctor.Id; // bắt buộc là lịch của chính mình
                var created = await _scheduleService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id },
                    new { message = "Tạo lịch làm việc thành công.", data = created });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (InvalidOperationException ex) { return Conflict(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi CreateForMe schedule.");
                return StatusCode(500, "Lỗi hệ thống.");
            }
        }

        // PUT /api/schedule/{id} — Admin cập nhật
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(Guid id, UpdateScheduleDTO dto)
        {
            try
            {
                var updated = await _scheduleService.UpdateAsync(id, dto);
                return updated is null
                    ? NotFound($"Không tìm thấy lịch Id: {id}")
                    : Ok(new { message = "Cập nhật thành công.", data = updated });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
            catch (InvalidOperationException ex) { return Conflict(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Update schedule.");
                return StatusCode(500, "Lỗi hệ thống.");
            }
        }

        // PUT /api/schedule/me/{id} — Bác sĩ tự cập nhật lịch của mình
        [HttpPut("me/{id:guid}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> UpdateForMe(Guid id, UpdateScheduleDTO dto)
        {
            try
            {
                var userId = GetUserId();
                if (userId is null) return Unauthorized();

                var doctor = await _doctorService.GetByUserIdAsync(userId.Value);
                if (doctor is null) return NotFound("Không tìm thấy hồ sơ bác sĩ.");

                var schedule = await _scheduleService.GetByIdAsync(id);
                if (schedule is null) return NotFound($"Không tìm thấy lịch Id: {id}");
                if (schedule.DoctorId != doctor.Id) return Forbid();

                var updated = await _scheduleService.UpdateAsync(id, dto);
                return Ok(new { message = "Cập nhật thành công.", data = updated });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
            catch (InvalidOperationException ex) { return Conflict(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi UpdateForMe schedule.");
                return StatusCode(500, "Lỗi hệ thống.");
            }
        }

        // DELETE /api/schedule/{id} — Admin xóa mềm
        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var result = await _scheduleService.DeleteAsync(id);
                return result
                    ? Ok(new { message = "Xóa lịch làm việc thành công." })
                    : NotFound($"Không tìm thấy lịch Id: {id}");
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (InvalidOperationException ex) { return Conflict(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Delete schedule.");
                return StatusCode(500, "Lỗi hệ thống.");
            }
        }

        // HELPER 
        private Guid? GetUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(claim, out var id) ? id : null;
        }
    }
}