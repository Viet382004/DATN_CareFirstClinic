using CareFirstClinic.API.DTOs;
using CareFirstClinic.API.DTOs.TimeSlot;
using CareFirstClinic.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CareFirstClinic.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TimeSlotController : ControllerBase
    {
        private readonly ITimeSlotService _timeSlotService;
        private readonly ILogger<TimeSlotController> _logger;

        public TimeSlotController(ITimeSlotService timeSlotService, ILogger<TimeSlotController> logger)
        {
            _timeSlotService = timeSlotService;
            _logger = logger;
        }

        // GET /api/timeslot/schedule/{scheduleId} — Xem tất cả slot của 1 Schedule
        [HttpGet("schedule/{scheduleId:guid}")]
        [Authorize(Roles = "Admin,Doctor,Patient")]
        public async Task<IActionResult> GetByScheduleId(Guid scheduleId)
        {
            try { return Ok(await _timeSlotService.GetByScheduleIdAsync(scheduleId)); }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByScheduleId: {ScheduleId}", scheduleId);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // GET /api/timeslot/{id} — Chi tiết 1 slot
        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Admin,Doctor,Patient")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var slot = await _timeSlotService.GetByIdAsync(id);
                return slot is null ? NotFound($"Không tìm thấy slot với Id: {id}") : Ok(slot);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetById Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // POST /api/timeslot/schedule/{scheduleId} — Thêm 1 slot lẻ vào Schedule
        [HttpPost("schedule/{scheduleId:guid}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> AddSlot(Guid scheduleId, [FromBody] AddTimeSlotDTO dto)
        {
            try
            {
                var created = await _timeSlotService.AddSlotAsync(
                    scheduleId, dto.StartTime, dto.EndTime);
                return CreatedAtAction(nameof(GetById), new { id = created.Id },
                    new { message = "Thêm slot thành công.", data = created });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (InvalidOperationException ex) { return Conflict(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi AddSlot ScheduleId: {ScheduleId}", scheduleId);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // PATCH /api/timeslot/{id}/toggle — Admin bật/tắt slot thủ công
        [HttpPatch("{id:guid}/toggle")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Toggle(Guid id)
        {
            try
            {
                var updated = await _timeSlotService.ToggleBookedAsync(id);
                if (updated is null) return NotFound($"Không tìm thấy slot với Id: {id}");
                var state = updated.IsBooked ? "khóa" : "mở";
                return Ok(new { message = $"Đã {state} slot thành công.", data = updated });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (InvalidOperationException ex) { return Conflict(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Toggle Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // DELETE /api/timeslot/{id} — Admin/Doctor xóa slot chưa được đặt
        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var result = await _timeSlotService.DeleteAsync(id);
                if (!result) return NotFound($"Không tìm thấy slot với Id: {id}");
                return Ok(new { message = "Xóa slot thành công." });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (InvalidOperationException ex) { return Conflict(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Delete Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // GET /api/timeslot/doctor/{doctorId}/date/{date}
        [HttpGet("doctor/{doctorId:guid}/date/{date}")]
        [Authorize(Roles = "Admin,Doctor,Patient")]
        public async Task<IActionResult> GetByDoctorAndDate(Guid doctorId, DateTime date)
        {
            try
            {
                return Ok(await _timeSlotService.GetByDoctorAndDateAsync(doctorId, date));
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByDoctorAndDate: {DoctorId}, Date: {Date}", doctorId, date);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }
    }
}