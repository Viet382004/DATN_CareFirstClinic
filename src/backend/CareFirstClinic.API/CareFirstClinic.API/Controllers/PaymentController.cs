using CareFirstClinic.API.Common;
using CareFirstClinic.API.Data;
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
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly IPatientService _patientService;
        private readonly CareFirstClinicDbContext _context;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(
            IPaymentService paymentService,
            IPatientService patientService,
            CareFirstClinicDbContext context,
            ILogger<PaymentController> logger)
        {
            _paymentService = paymentService;
            _patientService = patientService;
            _context = context;
            _logger = logger;
        }

        // GET /api/payment
        // GET /api/payment?status=Completed&method=Cash&sortBy=amount&sortDir=desc
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPaged([FromQuery] PaymentQueryParams query)
        {
            try { return Ok(await _paymentService.GetPagedAsync(query)); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetPaged Payment.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // GET /api/payment/{id}
        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Admin,Patient")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var p = await _paymentService.GetByIdAsync(id);
                if (p is null) return NotFound($"Không tìm thấy thanh toán với Id: {id}");

                // Patient chỉ xem được của mình
                if (User.IsInRole("Patient"))
                {
                    var userId = GetUserIdFromClaim();
                    var patient = await _patientService.GetByUserIdAsync(userId!.Value);
                    if (patient is null || p.PatientId != patient.Id) return Forbid();
                }

                return Ok(p);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetById Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // GET /api/payment/appointment/{appointmentId}
        [HttpGet("appointment/{appointmentId:guid}")]
        [Authorize(Roles = "Admin,Doctor,Patient")]
        public async Task<IActionResult> GetByAppointmentId(Guid appointmentId)
        {
            try
            {
                var p = await _paymentService.GetByAppointmentIdAsync(appointmentId);
                if (p is null) return NotFound("Lịch hẹn này chưa có thanh toán.");
                return Ok(p);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByAppointmentId: {Id}", appointmentId);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // Patient xem lịch sử thanh toán của mình
        // GET /api/payment/me?status=Completed&page=1
        [HttpGet("me")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetMyPayments([FromQuery] PaymentQueryParams query)
        {
            try
            {
                var userId = GetUserIdFromClaim();
                if (userId is null) return Unauthorized("Không xác định được tài khoản.");

                var patient = await _patientService.GetByUserIdAsync(userId.Value);
                if (patient is null) return NotFound("Không tìm thấy hồ sơ bệnh nhân.");

                query.PatientId = patient.Id;
                return Ok(await _paymentService.GetPagedAsync(query));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetMyPayments.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // POST /api/payment — Patient tạo thanh toán sau khi khám xong
        [HttpPost]
        [Authorize(Roles = "Patient,Doctor,Admin")]
        public async Task<IActionResult> Create(CreatePaymentDTO dto)
        {
            try
            {
                var userId = GetUserIdFromClaim();
                if (userId is null) return Unauthorized("Không xác định được tài khoản.");

                Guid patientId;

                // ⭐ Xử lý cho Admin
                if (User.IsInRole("Admin"))
                {
                    // Admin có thể truyền PatientId trực tiếp trong DTO
                    if (!dto.PatientId.HasValue || dto.PatientId.Value == Guid.Empty)
                    {
                        return BadRequest("Admin cần cung cấp PatientId khi tạo thanh toán.");
                    }
                    patientId = dto.PatientId.Value;
                }
                else if (User.IsInRole("Patient"))
                {
                    var patient = await _patientService.GetByUserIdAsync(userId.Value);
                    if (patient is null) return NotFound("Không tìm thấy hồ sơ bệnh nhân.");
                    patientId = patient.Id;
                }
                else // Doctor role
                {
                    var appointment = await _context.Appointments.FindAsync(dto.AppointmentId);
                    if (appointment == null) return NotFound("Không tìm thấy lịch hẹn.");
                    patientId = appointment.PatientId;
                }

                var created = await _paymentService.CreateAsync(patientId, dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id },
                    new { message = "Tạo thanh toán thành công.", data = created });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
            catch (UnauthorizedAccessException) { return Forbid(); }
            catch (InvalidOperationException ex) { return Conflict(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Create Payment.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // PATCH /api/payment/{id}/complete?transactionId=xxx — Admin xác nhận
        [HttpPatch("{id:guid}/complete")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Complete(Guid id, [FromQuery] string? transactionId)
        {
            try
            {
                var updated = await _paymentService.CompleteAsync(id, transactionId);
                if (updated is null) return NotFound($"Không tìm thấy thanh toán với Id: {id}");
                return Ok(new { message = "Xác nhận thanh toán thành công.", data = updated });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (InvalidOperationException ex) { return Conflict(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Complete Payment Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // PATCH /api/payment/{id}/refund — Admin hoàn tiền
        [HttpPatch("{id:guid}/refund")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Refund(Guid id)
        {
            try
            {
                var updated = await _paymentService.RefundAsync(id);
                if (updated is null) return NotFound($"Không tìm thấy thanh toán với Id: {id}");
                return Ok(new { message = "Hoàn tiền thành công.", data = updated });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (InvalidOperationException ex) { return Conflict(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Refund Payment Id: {Id}", id);
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