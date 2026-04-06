using CareFirstClinic.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace CareFirstClinic.API.Controllers
{
    // ════════════════════════════════════════════════════════════
    // CONTROLLER NÀY CHỈ DÙNG ĐỂ TEST — XÓA SAU KHI KIỂM TRA XONG
    // ════════════════════════════════════════════════════════════
    [ApiController]
    [Route("api/test-email")]
    public class EmailTestController : ControllerBase
    {
        private readonly IEmailService _emailService;

        public EmailTestController(IEmailService emailService)
        {
            _emailService = emailService;
        }

        // Test gửi OTP
        // GET /api/test-email/otp?email=your@email.com
        [HttpGet("otp")]
        public async Task<IActionResult> TestOtp([FromQuery] string email)
        {
            await _emailService.SendOtpAsync(email, "Nguyen Van A", "123456");
            return Ok("Đã gửi email OTP test. Kiểm tra hộp thư của bạn.");
        }

        // Test gửi xác nhận lịch hẹn
        // GET /api/test-email/appointment?email=your@email.com
        [HttpGet("appointment")]
        public async Task<IActionResult> TestAppointment([FromQuery] string email)
        {
            await _emailService.SendAppointmentBookedAsync(
                email, "Nguyen Van A", "BS. Tran Thi B",
                "Nội khoa", DateTime.Now.AddDays(3),
                new TimeSpan(8, 30, 0), new TimeSpan(9, 0, 0),
                "Đau bụng");
            return Ok("Đã gửi email lịch hẹn test.");
        }

        // Test gửi đơn thuốc
        // GET /api/test-email/prescription?email=your@email.com
        [HttpGet("prescription")]
        public async Task<IActionResult> TestPrescription([FromQuery] string email)
        {
            var items = new List<PrescriptionEmailItem>
            {
                new() { MedicineName = "Paracetamol", Unit = "viên", Frequency = "2 lần/ngày", DurationDays = 5, Quantity = 10, Instructions = "Uống sau ăn" },
                new() { MedicineName = "Amoxicillin", Unit = "viên", Frequency = "3 lần/ngày", DurationDays = 7, Quantity = 21, Instructions = "Uống trước ăn 30 phút" }
            };
            await _emailService.SendPrescriptionAsync(
                email, "Nguyen Van A", "BS. Tran Thi B",
                DateTime.Now, items, "Uống đủ liều, không bỏ thuốc giữa chừng.");
            return Ok("Đã gửi email đơn thuốc test.");
        }
    }
}