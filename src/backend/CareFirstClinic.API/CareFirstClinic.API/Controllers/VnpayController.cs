using CareFirstClinic.API.Data;
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
    public class VNPayController : ControllerBase
    {
        private readonly IVNPayService _vnpayService;
        private readonly IPaymentService _paymentService;
        private readonly CareFirstClinicDbContext _context;
        private readonly ILogger<VNPayController> _logger;
        private readonly IConfiguration _configuration;

        public VNPayController(
            IVNPayService vnpayService,
            IPaymentService paymentService,
            CareFirstClinicDbContext context,
            ILogger<VNPayController> logger,
            IConfiguration configuration)
        {
            _vnpayService = vnpayService;
            _paymentService = paymentService;
            _context = context;
            _logger = logger;
            _configuration = configuration;
        }

        // ═══════════════════════════════════════════════════════════════════════
        // 1. THANH TOÁN TIỀN KHÁM
        // POST: /api/vnpay/pay-consultation
        // ═══════════════════════════════════════════════════════════════════════
        [HttpPost("pay-consultation")]
        [Authorize(Roles = "Patient,Admin")]
        public async Task<IActionResult> PayConsultationFee([FromBody] PayConsultationRequest request)
        {
            if (request == null || request.AppointmentId == Guid.Empty)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Thông tin thanh toán không hợp lệ"
                });
            }

            try
            {
                Guid patientId;

                if (User.IsInRole("Admin"))
                {
                    if (!request.PatientId.HasValue || request.PatientId.Value == Guid.Empty)
                    {
                        return BadRequest(new ApiResponse<object>
                        {
                            Success = false,
                            Message = "Admin cần cung cấp PatientId"
                        });
                    }
                    patientId = request.PatientId.Value;
                }
                else
                {
                    var userId = User.GetUserId();
                    var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userId);
                    if (patient == null)
                    {
                        return NotFound(new ApiResponse<object>
                        {
                            Success = false,
                            Message = "Không tìm thấy thông tin bệnh nhân"
                        });
                    }
                    patientId = patient.Id;
                }

                var appointment = await _context.Appointments
                    .FirstOrDefaultAsync(a => a.Id == request.AppointmentId && a.PatientId == patientId);

                if (appointment == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Không tìm thấy lịch hẹn"
                    });
                }

                if (appointment.IsConsultationPaid)
                {
                    return Conflict(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Tiền khám đã được thanh toán trước đó"
                    });
                }

                // Fallback if fee is 0 due to previous bug
                if (appointment.ConsultationFee <= 0)
                {
                    appointment.ConsultationFee = 200000;
                    _context.Appointments.Update(appointment);
                    await _context.SaveChangesAsync();
                }

                var createPaymentDto = new CreatePaymentDTO
                {
                    AppointmentId = request.AppointmentId,
                    PatientId = patientId,
                    Amount = appointment.ConsultationFee,
                    Method = "VNPay",
                    Type = PaymentType.ConsultationFee,
                    Notes = $"Thanh toán tiền khám - {appointment.ServiceName}"
                };

                var payment = await _paymentService.CreateAsync(patientId, createPaymentDto);

                var ipAddress = GetClientIpAddress();
                var vnpayRequest = new VNPayPaymentRequest
                {
                    OrderId = payment.OrderId,
                    Amount = appointment.ConsultationFee,
                    Description = $"Thanh toán tiền khám {appointment.ServiceName}"
                };

                var paymentUrl = _vnpayService.CreatePaymentUrl(vnpayRequest, ipAddress);

                return Ok(new ApiResponse<CreatePaymentResponse>
                {
                    Success = true,
                    Message = "Tạo link thanh toán tiền khám thành công",
                    Data = new CreatePaymentResponse
                    {
                        PaymentUrl = paymentUrl,
                        OrderId = payment.OrderId,
                        PaymentId = payment.Id,
                        Amount = appointment.ConsultationFee,
                        ExpiresInMinutes = 15
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi thanh toán tiền khám cho Appointment {AppointmentId}", request.AppointmentId);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Có lỗi xảy ra khi tạo thanh toán"
                });
            }
        }

        // ═══════════════════════════════════════════════════════════════════════
        // 2. THANH TOÁN TIỀN THUỐC
        // POST: /api/vnpay/pay-medicine
        // ═══════════════════════════════════════════════════════════════════════
        [HttpPost("pay-medicine")]
        [Authorize(Roles = "Patient,Admin")]
        public async Task<IActionResult> PayMedicineFee([FromBody] PayMedicineRequest request)
        {
            if (request == null || request.AppointmentId == Guid.Empty)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Thông tin thanh toán không hợp lệ"
                });
            }

            try
            {
                Guid patientId;

                if (User.IsInRole("Admin"))
                {
                    if (!request.PatientId.HasValue || request.PatientId.Value == Guid.Empty)
                    {
                        return BadRequest(new ApiResponse<object>
                        {
                            Success = false,
                            Message = "Admin cần cung cấp PatientId"
                        });
                    }
                    patientId = request.PatientId.Value;
                }
                else
                {
                    var userId = User.GetUserId();
                    var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userId);
                    if (patient == null)
                    {
                        return NotFound(new ApiResponse<object>
                        {
                            Success = false,
                            Message = "Không tìm thấy thông tin bệnh nhân"
                        });
                    }
                    patientId = patient.Id;
                }

                var appointment = await _context.Appointments
                    .Include(a => a.MedicalRecord)
                    .ThenInclude(mr => mr.Prescription)
                    .FirstOrDefaultAsync(a => a.Id == request.AppointmentId && a.PatientId == patientId);

                if (appointment == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Không tìm thấy lịch hẹn"
                    });
                }

                if (!appointment.IsConsultationPaid)
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Vui lòng thanh toán tiền khám trước"
                    });
                }

                if (appointment.Status != AppointmentStatus.Completed)
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Chỉ có thể thanh toán tiền thuốc sau khi bác sĩ khám xong"
                    });
                }

                if (appointment.MedicalRecord?.Prescription == null)
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Chưa có đơn thuốc. Vui lòng đợi bác sĩ kê đơn."
                    });
                }

                if (appointment.IsMedicinePaid)
                {
                    return Conflict(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Tiền thuốc đã được thanh toán"
                    });
                }

                if (appointment.MedicineFee <= 0)
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Không có thuốc cần thanh toán"
                    });
                }

                var createPaymentDto = new CreatePaymentDTO
                {
                    AppointmentId = request.AppointmentId,
                    PatientId = patientId,
                    Amount = appointment.MedicineFee,
                    Method = "VNPay",
                    Type = PaymentType.MedicineFee,
                    Notes = $"Thanh toán tiền thuốc - Đơn thuốc ngày {DateTime.UtcNow:dd/MM/yyyy}"
                };

                var payment = await _paymentService.CreateAsync(patientId, createPaymentDto);

                var ipAddress = GetClientIpAddress();
                var vnpayRequest = new VNPayPaymentRequest
                {
                    OrderId = payment.OrderId,
                    Amount = appointment.MedicineFee,
                    Description = "Thanh toán tiền thuốc"
                };

                var paymentUrl = _vnpayService.CreatePaymentUrl(vnpayRequest, ipAddress);

                return Ok(new ApiResponse<CreatePaymentResponse>
                {
                    Success = true,
                    Message = "Tạo link thanh toán tiền thuốc thành công",
                    Data = new CreatePaymentResponse
                    {
                        PaymentUrl = paymentUrl,
                        OrderId = payment.OrderId,
                        PaymentId = payment.Id,
                        Amount = appointment.MedicineFee,
                        ExpiresInMinutes = 15
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi thanh toán tiền thuốc cho Appointment {AppointmentId}", request.AppointmentId);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Có lỗi xảy ra khi tạo thanh toán"
                });
            }
        }

        // ═══════════════════════════════════════════════════════════════════════
        // 3. IPN - VNPay gọi server-to-server
        // GET: /api/vnpay/ipn
        // ═══════════════════════════════════════════════════════════════════════
        [HttpGet("ipn")]
        [AllowAnonymous]
        public async Task<IActionResult> PaymentIpn()
        {
            try
            {
                var query = HttpContext.Request.Query;
                _logger.LogInformation("VNPay IPN received");

                var isValidSignature = _vnpayService.ValidateSignature(query, out var transactionStatus);

                if (!isValidSignature)
                {
                    _logger.LogWarning("VNPay IPN: Invalid signature");
                    return Ok(new IpnResponse { RspCode = "97", Message = "Invalid signature" });
                }

                var parsed = _vnpayService.ParseReturnUrl(query);
                var orderId = parsed.OrderId;
                var vnpayTranId = parsed.TransactionId;
                var responseCode = parsed.ResponseCode;
                var bankCode = parsed.BankCode;

                if (string.IsNullOrEmpty(orderId))
                {
                    return Ok(new IpnResponse { RspCode = "01", Message = "Order ID is empty" });
                }

                var payment = await _paymentService.GetByOrderIdAsync(orderId);
                if (payment == null)
                {
                    _logger.LogWarning("VNPay IPN: Payment not found for OrderId: {OrderId}", orderId);
                    return Ok(new IpnResponse { RspCode = "01", Message = "Order not found" });
                }

                if (payment.Status == "Completed")
                {
                    return Ok(new IpnResponse { RspCode = "02", Message = "Order already confirmed" });
                }

                if (payment.Amount != parsed.Amount)
                {
                    return Ok(new IpnResponse { RspCode = "04", Message = "Invalid amount" });
                }

                var isSuccess = parsed.IsSuccess && transactionStatus == "00";

                if (isSuccess)
                {
                    await _paymentService.CompleteAsync(payment.Id, vnpayTranId, bankCode);
                }
                else
                {
                    await _paymentService.FailAsync(payment.Id, responseCode);
                }

                return Ok(new IpnResponse { RspCode = "00", Message = "Confirm Success" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "VNPay IPN: Unexpected error");
                return Ok(new IpnResponse { RspCode = "99", Message = "Unknown error" });
            }
        }

        // ═══════════════════════════════════════════════════════════════════════
        // 4. RETURN URL - VNPay redirect về
        // GET: /api/vnpay/return
        // ═══════════════════════════════════════════════════════════════════════
        [HttpGet("return")]
        [AllowAnonymous]
        public async Task<IActionResult> PaymentReturn()
        {
            try
            {
                var query = HttpContext.Request.Query;
                var isValidSignature = _vnpayService.ValidateSignature(query, out _);
                if (!isValidSignature)
                {
                    _logger.LogWarning("VNPay Return: Invalid signature");
                    return Redirect(GetFrontendUrl("/payment/failed?code=97&message=Invalid%20signature"));
                }

                var result = _vnpayService.ParseReturnUrl(query);
                var orderId = string.IsNullOrWhiteSpace(result.OrderId)
                    ? query["vnp_TxnRef"].FirstOrDefault() ?? string.Empty
                    : result.OrderId;

                if (result.IsSuccess)
                {
                    var payment = await _paymentService.GetByOrderIdAsync(orderId);
                    if (payment != null && payment.Status == "Pending")
                    {
                        await _paymentService.CompleteAsync(payment.Id, result.TransactionId, result.BankCode);
                    }
                }

                if (result.IsSuccess)
                {
                    return Redirect(GetFrontendUrl($"/payment/success?orderId={orderId}&transactionId={result.TransactionId}&amount={result.Amount}"));
                }
                else
                {
                    return Redirect(GetFrontendUrl($"/payment/failed?orderId={orderId}&code={result.ResponseCode}&message={GetResponseMessage(result.ResponseCode)}"));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi xử lý VNPay return URL");
                return Redirect(GetFrontendUrl($"/payment/error?error={Uri.EscapeDataString(ex.Message)}"));
            }
        }

        // ═══════════════════════════════════════════════════════════════════════
        // 5. KIỂM TRA TRẠNG THÁI THANH TOÁN
        // GET: /api/vnpay/status/{orderId}
        // ═══════════════════════════════════════════════════════════════════════
        [HttpGet("status/{orderId}")]
        [Authorize]
        public async Task<IActionResult> GetPaymentStatus(string orderId)
        {
            try
            {
                if (string.IsNullOrEmpty(orderId))
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "OrderId không hợp lệ"
                    });
                }

                var payment = await _paymentService.GetByOrderIdAsync(orderId);
                if (payment == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Không tìm thấy giao dịch"
                    });
                }

                return Ok(new ApiResponse<PaymentStatusResponse>
                {
                    Success = true,
                    Message = "Lấy trạng thái thành công",
                    Data = new PaymentStatusResponse
                    {
                        OrderId = payment.OrderId,
                        PaymentId = payment.Id,
                        Status = payment.Status.ToString(),
                        Amount = payment.Amount,
                        TransactionId = payment.TransactionId,
                        BankCode = payment.BankCode,
                        PaidAt = payment.PaidAt,
                        CreatedAt = payment.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi kiểm tra trạng thái payment cho OrderId: {OrderId}", orderId);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Có lỗi xảy ra khi kiểm tra trạng thái"
                });
            }
        }

        // ═══════════════════════════════════════════════════════════════════════
        // PRIVATE METHODS
        // ═══════════════════════════════════════════════════════════════════════

        private string GetClientIpAddress()
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            if (string.IsNullOrEmpty(ipAddress) || ipAddress == "::1")
            {
                ipAddress = "127.0.0.1";
            }
            if (HttpContext.Request.Headers.ContainsKey("X-Forwarded-For"))
            {
                ipAddress = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            }
            return ipAddress ?? "127.0.0.1";
        }

        private string GetFrontendUrl(string path)
        {
            var frontendUrl = _configuration["Frontend:Url"] ?? "https://localhost:3000";
            return $"{frontendUrl}{path}";
        }

        private static string GetResponseMessage(string code) => code switch
        {
            "00" => "Giao dịch thành công",
            "07" => "Trừ tiền thành công nhưng giao dịch bị nghi ngờ (cần đối soát)",
            "09" => "Thẻ/Tài khoản chưa đăng ký dịch vụ Internet Banking",
            "10" => "Xác thực thông tin thẻ/tài khoản quá 3 lần",
            "11" => "Đã hết hạn chờ thanh toán",
            "12" => "Thẻ/Tài khoản bị khóa",
            "13" => "Sai mật khẩu OTP",
            "24" => "Giao dịch bị hủy",
            "51" => "Tài khoản không đủ số dư",
            "65" => "Vượt hạn mức giao dịch trong ngày",
            "75" => "Ngân hàng thanh toán đang bảo trì",
            "79" => "Sai mật khẩu thanh toán quá số lần quy định",
            _ => "Lỗi không xác định, vui lòng liên hệ hỗ trợ"
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DTOs
    // ═══════════════════════════════════════════════════════════════════════

    public class PayConsultationRequest
    {
        public Guid AppointmentId { get; set; }
        public Guid? PatientId { get; set; }
    }

    public class PayMedicineRequest
    {
        public Guid AppointmentId { get; set; }
        public Guid? PatientId { get; set; }
    }

    public class CreatePaymentResponse
    {
        public string PaymentUrl { get; set; } = string.Empty;
        public string OrderId { get; set; } = string.Empty;
        public Guid PaymentId { get; set; }
        public decimal Amount { get; set; }
        public int ExpiresInMinutes { get; set; }
    }

    public class PaymentStatusResponse
    {
        public string OrderId { get; set; } = string.Empty;
        public Guid PaymentId { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? TransactionId { get; set; }
        public string? BankCode { get; set; }
        public DateTime? PaidAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class IpnResponse
    {
        public string RspCode { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
    }

    public static class ClaimsPrincipalExtensions
    {
        public static Guid GetUserId(this ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
        }
    }
}