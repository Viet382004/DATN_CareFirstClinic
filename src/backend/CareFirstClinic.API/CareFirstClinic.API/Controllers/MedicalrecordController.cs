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
    public class MedicalRecordController : ControllerBase
    {
        private readonly IMedicalRecordService _medicalService;
        private readonly IPatientService _patientService;
        private readonly IDoctorService _doctorService;
        private readonly ILogger<MedicalRecordController> _logger;

        public MedicalRecordController(
            IMedicalRecordService medicalService,
            IPatientService patientService,
            IDoctorService doctorService,
            ILogger<MedicalRecordController> logger)
        {
            _medicalService = medicalService;
            _patientService = patientService;
            _doctorService = doctorService;
            _logger = logger;
        }

        // GET /api/medicalrecord
        // GET /api/medicalrecord?diagnosis=đau&hasFollowUp=true&sortBy=followUpDate&sortDir=asc
        [HttpGet]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> GetPaged([FromQuery] MedicalRecordQueryParams query)
        {
            try { return Ok(await _medicalService.GetPagedAsync(query)); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetPaged MedicalRecord.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // GET /api/medicalrecord/{id}
        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Admin,Doctor,Patient")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var r = await _medicalService.GetByIdAsync(id);
                if (r is null) return NotFound($"Không tìm thấy hồ sơ bệnh án với Id: {id}");

                // Patient chỉ xem được hồ sơ của mình
                if (User.IsInRole("Patient"))
                {
                    var userId = GetUserIdFromClaim();
                    var patient = await _patientService.GetByUserIdAsync(userId!.Value);
                    if (patient is null || r.PatientId != patient.Id) return Forbid();
                }

                // Doctor chỉ xem được hồ sơ mình tạo
                if (User.IsInRole("Doctor"))
                {
                    var userId = GetUserIdFromClaim();
                    var doctor = await _doctorService.GetByUserIdAsync(userId!.Value);
                    if (doctor is null || r.DoctorId != doctor.Id) return Forbid();
                }

                return Ok(r);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetById Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // GET /api/medicalrecord/appointment/{appointmentId}
        [HttpGet("appointment/{appointmentId:guid}")]
        [Authorize(Roles = "Admin,Doctor,Patient")]
        public async Task<IActionResult> GetByAppointmentId(Guid appointmentId)
        {
            try
            {
                var r = await _medicalService.GetByAppointmentIdAsync(appointmentId);
                if (r is null) return NotFound("Lịch hẹn này chưa có hồ sơ bệnh án.");
                return Ok(r);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByAppointmentId: {Id}", appointmentId);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // GET /api/medicalrecord/me?sortBy=createdAt&sortDir=desc
        [HttpGet("me")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetMyRecords([FromQuery] MedicalRecordQueryParams query)
        {
            try
            {
                var userId = GetUserIdFromClaim();
                if (userId is null) return Unauthorized("Không xác định được tài khoản.");

                var patient = await _patientService.GetByUserIdAsync(userId.Value);
                if (patient is null) return NotFound("Không tìm thấy hồ sơ bệnh nhân.");

                query.PatientId = patient.Id;
                return Ok(await _medicalService.GetPagedAsync(query));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetMyRecords.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // GET /api/medicalrecord/me/doctor?hasFollowUp=true
        [HttpGet("me/doctor")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetMyDoctorRecords([FromQuery] MedicalRecordQueryParams query)
        {
            try
            {
                var userId = GetUserIdFromClaim();
                if (userId is null) return Unauthorized("Không xác định được tài khoản.");

                var doctor = await _doctorService.GetByUserIdAsync(userId.Value);
                if (doctor is null) return NotFound("Không tìm thấy hồ sơ bác sĩ.");

                query.DoctorId = doctor.Id;
                return Ok(await _medicalService.GetPagedAsync(query));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetMyDoctorRecords.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // POST /api/medicalrecord — Doctor tạo hồ sơ sau khi khám
        [HttpPost]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> Create(CreateMedicalRecordDTO dto)
        {
            try
            {
                var userId = GetUserIdFromClaim();
                if (userId is null)
                    return Unauthorized("Không xác định được tài khoản.");

                var doctor = await _doctorService.GetByUserIdAsync(userId.Value);
                if (doctor is null)
                    return NotFound("Không tìm thấy hồ sơ bác sĩ.");

                var created = await _medicalService.CreateAsync(doctor.Id, dto);

                return CreatedAtAction(nameof(GetById), new { id = created.Id },
                    new { message = "Tạo hồ sơ bệnh án thành công.", data = created });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = "Lịch hẹn này đã có hồ sơ bệnh án, không thể tạo thêm.", detail = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Create MedicalRecord. Payload: {@Dto}", dto);
                return StatusCode(500, new
                {
                    message = "Lỗi hệ thống khi tạo hồ sơ bệnh án.",
                    error = ex.Message
                });
            }
        }

        // PUT /api/medicalrecord/{id} — Doctor cập nhật hồ sơ của mình
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<IActionResult> Update(Guid id, UpdateMedicalRecordDTO dto)
        {
            try
            {
                var userId = GetUserIdFromClaim();
                if (userId is null) return Unauthorized("Không xác định được tài khoản.");

                Guid doctorId;
                if (User.IsInRole("Admin"))
                {
                    var existing = await _medicalService.GetByIdAsync(id);
                    if (existing is null) return NotFound($"Không tìm thấy hồ sơ với Id: {id}");
                    doctorId = existing.DoctorId;
                }
                else
                {
                    var doctor = await _doctorService.GetByUserIdAsync(userId.Value);
                    if (doctor is null) return NotFound("Không tìm thấy hồ sơ bác sĩ.");
                    doctorId = doctor.Id;
                }

                var updated = await _medicalService.UpdateAsync(id, doctorId, dto);
                if (updated is null) return NotFound($"Không tìm thấy hồ sơ với Id: {id}");
                return Ok(new { message = "Cập nhật hồ sơ bệnh án thành công.", data = updated });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (UnauthorizedAccessException) { return Forbid(); }
            catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Update MedicalRecord Id: {Id}", id);
                return StatusCode(500, new { message = "Lỗi hệ thống khi cập nhật hồ sơ bệnh án.", error = ex.Message });
            }
        }

        private Guid? GetUserIdFromClaim()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(claim, out var id) ? id : null;
        }
    }
}
