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
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(
            IPaymentService paymentService,
            IPatientService patientService,
            ILogger<PaymentController> logger)
        {
            _paymentService = paymentService;
            _patientService = patientService;
            _logger = logger;
        }

        // GET /api/payment — Admin xem tất cả
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            try { return Ok(await _paymentService.GetAllAsync()); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetAll Payment.");
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

        // GET /api/payment/me — Patient xem lịch sử thanh toán
        [HttpGet("me")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetMyPayments()
        {
            try
            {
                var userId = GetUserIdFromClaim();
                if (userId is null) return Unauthorized("Không xác định được tài khoản.");

                var patient = await _patientService.GetByUserIdAsync(userId.Value);
                if (patient is null) return NotFound("Không tìm thấy hồ sơ bệnh nhân.");

                return Ok(await _paymentService.GetMyPaymentsAsync(patient.Id));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetMyPayments.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // POST /api/payment — Patient tạo thanh toán sau khi khám xong
        [HttpPost]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> Create(CreatePaymentDTO dto)
        {
            try
            {
                var userId = GetUserIdFromClaim();
                if (userId is null) return Unauthorized("Không xác định được tài khoản.");

                var patient = await _patientService.GetByUserIdAsync(userId.Value);
                if (patient is null) return NotFound("Không tìm thấy hồ sơ bệnh nhân.");

                var created = await _paymentService.CreateAsync(patient.Id, dto);
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