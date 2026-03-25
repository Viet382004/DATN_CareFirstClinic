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
    [Authorize]
    public class AppointmentController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;
        private readonly IPatientService _patientService;
        private readonly IDoctorService _doctorService;
        private readonly ILogger<AppointmentController> _logger;

        public AppointmentController(
            IAppointmentService appointmentService,
            IPatientService patientService,
            IDoctorService doctorService,
            ILogger<AppointmentController> logger)
        {
            _appointmentService = appointmentService;
            _patientService = patientService;
            _doctorService = doctorService;
            _logger = logger;
        }

        // GET /api/appointment
        // GET /api/appointment?today=true&status=Confirmed&sortBy=workDate&sortDir=asc
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPaged([FromQuery] AppointmentQueryParams query)
        {
            try { return Ok(await _appointmentService.GetPagedAsync(query)); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetPaged Appointment.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // GET /api/appointment/{id}
        // Admin xem tất cả, Doctor/Patient chỉ xem được nếu liên quan đến lịch đó
        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Admin,Doctor,Patient")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var a = await _appointmentService.GetByIdAsync(id);
                if (a is null) return NotFound($"Không tìm thấy lịch hẹn với Id: {id}");

                // đúng patient từ UserId
                if (User.IsInRole("Patient"))
                {
                    var userId = GetUserIdFromClaim();
                    var patient = await _patientService.GetByUserIdAsync(userId!.Value);
                    if (patient is null || a.PatientId != patient.Id) return Forbid();
                }

                // Doctor chỉ xem được lịch của mình
                if (User.IsInRole("Doctor"))
                {
                    var userId = GetUserIdFromClaim();
                    var doctor = await _doctorService.GetByUserIdAsync(userId!.Value);
                    if (doctor is null || a.DoctorId != doctor.Id) return Forbid();
                }

                return Ok(a);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetById Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // GET /api/appointment/me — Patient xem lịch của mình
        [HttpGet("me")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetMyAppointments([FromQuery] AppointmentQueryParams query)
        {
            try
            {
                var userId = GetUserIdFromClaim();
                if (userId is null) return Unauthorized("Không xác định được tài khoản.");

                var patient = await _patientService.GetByUserIdAsync(userId.Value);
                if (patient is null) return NotFound("Không tìm thấy hồ sơ bệnh nhân.");

                // gán PatientId từ token
                query.PatientId = patient.Id;

                return Ok(await _appointmentService.GetPagedAsync(query));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetMyAppointments.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // GET /api/appointment/me/doctor — Doctor xem lịch hẹn của mình
        [HttpGet("me/doctor")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetMyDoctorAppointments([FromQuery] AppointmentQueryParams query)
        {
            try
            {
                var userId = GetUserIdFromClaim();
                if (userId is null) return Unauthorized("Không xác định được tài khoản.");

                var doctor = await _doctorService.GetByUserIdAsync(userId.Value);
                if (doctor is null) return NotFound("Không tìm thấy hồ sơ bác sĩ.");

                // gán DoctorId từ token 
                query.DoctorId = doctor.Id;

                return Ok(await _appointmentService.GetPagedAsync(query));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetMyDoctorAppointments.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // GET /api/appointment/doctor/{doctorId} — Admin xem lịch hẹn của 1 bác sĩ
        [HttpGet("doctor/{doctorId:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetByDoctorId(Guid doctorId)
        {
            try { return Ok(await _appointmentService.GetByDoctorIdAsync(doctorId)); }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByDoctorId: {DoctorId}", doctorId);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // POST /api/appointment — Patient đặt lịch
        [HttpPost]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> Create(CreateAppointmentDTO dto)
        {
            try
            {
                var userId = GetUserIdFromClaim();
                if (userId is null) return Unauthorized("Không xác định được tài khoản.");

                var patient = await _patientService.GetByUserIdAsync(userId.Value);
                if (patient is null) return NotFound("Không tìm thấy hồ sơ bệnh nhân.");

                var created = await _appointmentService.CreateAsync(patient.Id, dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id },
                    new { message = "Đặt lịch hẹn thành công.", data = created });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
            catch (InvalidOperationException ex) { return Conflict(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Create appointment.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // PUT /api/appointment/{id} — Patient sửa lý do/ghi chú khi còn Pending
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> Update(Guid id, UpdateAppointmentDTO dto)
        {
            try
            {
                var userId = GetUserIdFromClaim();
                if (userId is null) return Unauthorized("Không xác định được tài khoản.");

                var patient = await _patientService.GetByUserIdAsync(userId.Value);
                if (patient is null) return NotFound("Không tìm thấy hồ sơ bệnh nhân.");

                var updated = await _appointmentService.UpdateAsync(id, patient.Id, dto);
                if (updated is null) return NotFound($"Không tìm thấy lịch hẹn với Id: {id}");
                return Ok(new { message = "Cập nhật lịch hẹn thành công.", data = updated });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (UnauthorizedAccessException) { return Forbid(); }
            catch (InvalidOperationException ex) { return Conflict(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Update appointment Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // PATCH /api/appointment/{id}/confirm — Admin/Doctor xác nhận
        [HttpPatch("{id:guid}/confirm")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> Confirm(Guid id)
        {
            try
            {
                var updated = await _appointmentService.ConfirmAsync(id);
                if (updated is null) return NotFound($"Không tìm thấy lịch hẹn với Id: {id}");
                return Ok(new { message = "Xác nhận lịch hẹn thành công.", data = updated });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (InvalidOperationException ex) { return Conflict(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Confirm appointment Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // PATCH /api/appointment/{id}/complete — Doctor hoàn thành
        [HttpPatch("{id:guid}/complete")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> Complete(Guid id)
        {
            try
            {
                var userId = GetUserIdFromClaim();
                if (userId is null) return Unauthorized("Không xác định được tài khoản.");

                // Truyền doctorId vào để Service verify ownership
                var doctor = await _doctorService.GetByUserIdAsync(userId.Value);
                if (doctor is null) return NotFound("Không tìm thấy hồ sơ bác sĩ.");

                var updated = await _appointmentService.CompleteAsync(id, doctor.Id);
                if (updated is null) return NotFound($"Không tìm thấy lịch hẹn với Id: {id}");
                return Ok(new { message = "Hoàn thành lịch hẹn thành công.", data = updated });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (UnauthorizedAccessException) { return Forbid(); }
            catch (InvalidOperationException ex) { return Conflict(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Complete appointment Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // PATCH /api/appointment/{id}/cancel — Patient/Doctor/Admin hủy
        [HttpPatch("{id:guid}/cancel")]
        [Authorize(Roles = "Admin,Doctor,Patient")]
        public async Task<IActionResult> Cancel(Guid id, CancelAppointmentDTO dto)
        {
            try
            {
                var userId = GetUserIdFromClaim();
                if (userId is null) return Unauthorized("Không xác định được tài khoản.");

                var role = GetRole();
                Guid requesterId;

                switch (role)
                {
                    case "Patient":
                        var patient = await _patientService.GetByUserIdAsync(userId.Value);
                        if (patient is null) return NotFound("Không tìm thấy hồ sơ bệnh nhân.");
                        requesterId = patient.Id;
                        break;

                    case "Doctor":
                        // Doctor dùng Doctor.Id để check ownership trong Service
                        var doctor = await _doctorService.GetByUserIdAsync(userId.Value);
                        if (doctor is null) return NotFound("Không tìm thấy hồ sơ bác sĩ.");
                        requesterId = doctor.Id;
                        break;

                    default:
                        requesterId = userId.Value; // Admin dùng UserId, không check ownership
                        break;
                }

                var updated = await _appointmentService.CancelAsync(id, requesterId, role, dto);
                if (updated is null) return NotFound($"Không tìm thấy lịch hẹn với Id: {id}");
                return Ok(new { message = "Hủy lịch hẹn thành công.", data = updated });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (UnauthorizedAccessException) { return Forbid(); }
            catch (InvalidOperationException ex) { return Conflict(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Cancel appointment Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        //  HELPERS 
        private Guid? GetUserIdFromClaim()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(claim, out var id) ? id : null;
        }

        private string GetRole() =>
            User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
    }
}