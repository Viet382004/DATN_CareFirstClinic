using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace CareFirstClinic.API.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;
        private readonly IHttpClientFactory _httpClientFactory;

        public EmailService(
        IConfiguration config,
        ILogger<EmailService> logger,
        IHttpClientFactory httpClientFactory)   // ← Sửa ở đây
        {
            _config = config;
            _logger = logger;
            _httpClientFactory = httpClientFactory;
        }

        // Lấy API key từ env hoặc config, có log chi tiết
        private string GetBrevoApiKey()
        {
            var key = Environment.GetEnvironmentVariable("BREVO_API_KEY") ?? _config["Brevo:ApiKey"];
            if (string.IsNullOrEmpty(key))
            {
                _logger.LogError("BREVO_API_KEY không được tìm thấy trong Environment hoặc appsettings.json");
                throw new Exception("BREVO_API_KEY chưa được cấu hình.");
            }
            _logger.LogInformation("BREVO_API_KEY đã được tìm thấy, 5 ký tự đầu: {Prefix}", key.Substring(0, Math.Min(5, key.Length)));
            return key;
        }

        private string GetBrevoSenderEmail()
        {
            var email = Environment.GetEnvironmentVariable("BREVO_SENDER_EMAIL") ?? _config["Brevo:SenderEmail"];
            if (string.IsNullOrEmpty(email))
            {
                _logger.LogError("BREVO_SENDER_EMAIL không được tìm thấy");
                throw new Exception("BREVO_SENDER_EMAIL chưa được cấu hình.");
            }
            _logger.LogInformation("Sender Email: {Email}", email);
            return email;
        }

        private string GetBrevoSenderName()
        {
            return Environment.GetEnvironmentVariable("BREVO_SENDER_NAME")
                   ?? _config["Brevo:SenderName"]
                   ?? "CareFirst Clinic";
        }

        private async Task SendAsync(string toEmail, string subject, string htmlContent)
        {
            _logger.LogInformation("=== BẮT ĐẦU GỬI EMAIL QUA BREVO ===");

            var apiKey = GetBrevoApiKey();
            var senderEmail = GetBrevoSenderEmail();
            var senderName = GetBrevoSenderName();

            var payload = new
            {
                sender = new { email = senderEmail, name = senderName },
                to = new[] { new { email = toEmail } },
                subject = subject,
                htmlContent = htmlContent
            };

            try
            {
                // Tạo HttpClient mới mỗi lần gửi → tránh disposed
                using var client = _httpClientFactory.CreateClient();

                client.DefaultRequestHeaders.Clear();
                client.DefaultRequestHeaders.Add("api-key", apiKey);
                client.DefaultRequestHeaders.Add("accept", "application/json");

                var response = await client.PostAsJsonAsync("https://api.brevo.com/v3/smtp/email", payload);
                var responseBody = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Brevo gửi email thành công đến {ToEmail}", toEmail);
                }
                else
                {
                    _logger.LogError("Brevo thất bại. Status: {StatusCode} | Body: {Body}",
                        response.StatusCode, responseBody);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi ngoại lệ khi gọi Brevo API đến {ToEmail}", toEmail);
            }
        }

// 1. GỬI OTP
public async Task SendOtpAsync(string toEmail, string userName, string otpCode)
        {
            var subject = "CareFirst Clinic - Mã xác thực tài khoản";

            var html = $@"
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'></head>
<body style='margin:0; padding:0; background:#f8f9fa; font-family:Arial, Helvetica, sans-serif;'>
  <table width='100%' cellpadding='0' cellspacing='0'>
    <tr><td align='center' style='padding:40px 20px;'>
      <table width='600' cellpadding='0' cellspacing='0' style='background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.05);'>
        
        <tr><td style='background:#0d6efd; padding:30px; text-align:center;'>
          <h1 style='color:#ffffff; margin:0; font-size:26px;'>CareFirst Clinic</h1>
        </td></tr>

        <tr><td style='padding:40px 30px;'>
          <p style='font-size:16px; color:#333333; margin:0 0 20px 0;'>Xin chào <strong>{userName}</strong>,</p>
          <p style='font-size:16px; color:#555555; line-height:1.6;'>
            Cảm ơn bạn đã đăng ký tại CareFirst Clinic. Đây là mã xác thực tài khoản của bạn:
          </p>
          
          <div style='text-align:center; margin:30px 0;'>
            <div style='display:inline-block; background:#f8f9fa; border:2px solid #0d6efd; border-radius:10px; padding:20px 50px; font-size:36px; font-weight:700; letter-spacing:6px; color:#0d6efd;'>
              {otpCode}
            </div>
          </div>

          <p style='font-size:14px; color:#666666; text-align:center;'>
            Mã này có hiệu lực trong <strong>10 phút</strong>.<br>
            <strong>Vui lòng không chia sẻ mã này với bất kỳ ai.</strong>
          </p>
        </td></tr>

        <tr><td style='background:#f8f9fa; padding:25px; text-align:center; border-top:1px solid #eeeeee;'>
          <p style='font-size:13px; color:#888888; margin:0;'>
            Nếu bạn không yêu cầu mã xác thực này, vui lòng bỏ qua email.<br>
            © 2026 CareFirst Clinic - Phòng khám chăm sóc sức khỏe
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>";

            await SendAsync(toEmail, subject, html);
        }

        // 2. ĐẶT LỊCH THÀNH CÔNG
        public async Task SendAppointmentBookedAsync(
    string toEmail,
    string patientName,
    string doctorName,
    string specialtyName,
    DateTime workDate,
    TimeSpan startTime,
    TimeSpan endTime,
    string? reason)
        {
            var subject = "CareFirst Clinic - Đặt lịch hẹn thành công";

            // === SỬA Ở ĐÂY: Format TimeSpan đúng cách ===
            string startTimeStr = startTime.ToString(@"hh\:mm");
            string endTimeStr = endTime.ToString(@"hh\:mm");

            var reasonRow = string.IsNullOrWhiteSpace(reason)
                ? ""
                : $"<tr><td style='padding:10px 0;color:#555555;width:40%;'>Lý do khám</td><td style='padding:10px 0;'>{reason}</td></tr>";

            var html = $@"
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'></head>
<body style='margin:0; padding:0; background:#f8f9fa; font-family:Arial, Helvetica, sans-serif;'>
  <table width='100%' cellpadding='0' cellspacing='0'>
    <tr><td align='center' style='padding:40px 20px;'>
      <table width='600' cellpadding='0' cellspacing='0' style='background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.05);'>
        
        <tr><td style='background:#0d6efd; padding:30px; text-align:center;'>
          <h1 style='color:#ffffff; margin:0; font-size:26px;'>CareFirst Clinic</h1>
        </td></tr>
        
        <tr><td style='padding:40px 30px;'>
          <p style='font-size:16px; color:#333333; margin:0 0 20px 0;'>Xin chào <strong>{patientName}</strong>,</p>
          <p style='font-size:16px; color:#555555; line-height:1.6;'>
            Lịch hẹn của bạn đã được đặt thành công với thông tin sau:
          </p>
         
          <table width='100%' cellpadding='0' cellspacing='0' style='background:#f8f9fa; border-radius:8px; padding:20px; margin:20px 0; border:1px solid #e9ecef;'>
            <tr><td style='padding:10px 0; color:#555555; width:40%;'>Bác sĩ</td>
                <td style='padding:10px 0; font-weight:600;'>{doctorName}</td></tr>
            <tr><td style='padding:10px 0; color:#555555;'>Chuyên khoa</td>
                <td style='padding:10px 0;'>{specialtyName}</td></tr>
            <tr><td style='padding:10px 0; color:#555555;'>Ngày khám</td>
                <td style='padding:10px 0; font-weight:600;'>{workDate:dd/MM/yyyy}</td></tr>
            <tr><td style='padding:10px 0; color:#555555;'>Giờ khám</td>
                <td style='padding:10px 0; font-weight:600;'>{startTimeStr} - {endTimeStr}</td></tr>
            {reasonRow}
          </table>

          <p style='font-size:14px; color:#666666;'>Vui lòng đến đúng giờ. Nếu cần thay đổi hoặc hủy lịch, vui lòng thực hiện trước 24 giờ.</p>
        </td></tr>

        <tr><td style='background:#f8f9fa; padding:25px; text-align:center; border-top:1px solid #eeeeee;'>
          <p style='font-size:13px; color:#888888; margin:0;'>
            © 2026 CareFirst Clinic - Phòng khám chăm sóc sức khỏe
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>";

            await SendAsync(toEmail, subject, html);
        }

        // 3. NHẮC LỊCH KHÁM
        public async Task SendAppointmentReminderAsync(string toEmail, string patientName, string doctorName,
            string specialtyName, DateTime workDate, TimeSpan startTime, TimeSpan endTime)
        {
            var subject = "CareFirst Clinic - Nhắc lịch khám ngày mai";

            var html = $@"
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'></head>
<body style='margin:0; padding:0; background:#f8f9fa; font-family:Arial, Helvetica, sans-serif;'>
  <table width='100%' cellpadding='0' cellspacing='0'>
    <tr><td align='center' style='padding:40px 20px;'>
      <table width='600' cellpadding='0' cellspacing='0' style='background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.05);'>
        <tr><td style='background:#0d6efd; padding:30px; text-align:center;'>
          <h1 style='color:#ffffff; margin:0; font-size:26px;'>CareFirst Clinic</h1>
        </td></tr>
        <tr><td style='padding:40px 30px;'>
          <p style='font-size:16px; color:#333333;'>Xin chào <strong>{patientName}</strong>,</p>
          <p style='font-size:16px; color:#555555;'>Bạn có lịch khám vào ngày mai. Dưới đây là thông tin chi tiết:</p>
          
          <table width='100%' cellpadding='0' cellspacing='0' style='background:#f8f9fa; border-radius:8px; padding:20px; margin:20px 0; border:1px solid #e9ecef;'>
            <tr><td style='padding:10px 0; color:#555555; width:40%;'>Bác sĩ</td><td style='padding:10px 0; font-weight:600;'>{doctorName}</td></tr>
            <tr><td style='padding:10px 0; color:#555555;'>Chuyên khoa</td><td style='padding:10px 0;'>{specialtyName}</td></tr>
            <tr><td style='padding:10px 0; color:#555555;'>Ngày khám</td><td style='padding:10px 0; font-weight:600;'>{workDate:dd/MM/yyyy}</td></tr>
            <tr><td style='padding:10px 0; color:#555555;'>Giờ khám</td><td style='padding:10px 0; font-weight:600;'>{startTime:hh\\:mm} - {endTime:hh\\:mm}</td></tr>
          </table>

          <p style='font-size:14px; color:#666666;'>Vui lòng đến đúng giờ và mang theo giấy tờ cá nhân.</p>
        </td></tr>
        <tr><td style='background:#f8f9fa; padding:25px; text-align:center; border-top:1px solid #eeeeee;'>
          <p style='font-size:13px; color:#888888; margin:0;'>© 2026 CareFirst Clinic - Phòng khám chăm sóc sức khỏe</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>";

            await SendAsync(toEmail, subject, html);
        }

        // 4. GỬI ĐƠN THUỐC
        public async Task SendPrescriptionAsync(string toEmail, string patientName, string doctorName,
            DateTime issuedAt, List<PrescriptionEmailItem> details, string? notes)
        {
            var subject = "CareFirst Clinic - Đơn thuốc của bạn";

            var rows = new StringBuilder();
            foreach (var d in details)
            {
                rows.Append($@"
                <tr>
                  <td style='padding:12px; border-bottom:1px solid #eee;'><strong>{d.MedicineName}</strong></td>
                  <td style='padding:12px; border-bottom:1px solid #eee; text-align:center;'>{d.Quantity} {d.Unit}</td>
                  <td style='padding:12px; border-bottom:1px solid #eee;'>{d.Frequency}</td>
                  <td style='padding:12px; border-bottom:1px solid #eee; text-align:center;'>{d.DurationDays} ngày</td>
                  <td style='padding:12px; border-bottom:1px solid #eee; color:#555; font-size:14px;'>{d.Instructions ?? "—"}</td>
                </tr>");
            }

            var notesHtml = string.IsNullOrWhiteSpace(notes) ? "" : $@"
            <p style='margin-top:20px; padding:15px; background:#f8f9fa; border-left:4px solid #0d6efd; font-size:14px;'>
              <strong>Lưu ý từ bác sĩ:</strong> {notes}
            </p>";

            var html = $@"
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'></head>
<body style='margin:0; padding:0; background:#f8f9fa; font-family:Arial, Helvetica, sans-serif;'>
  <table width='100%' cellpadding='0' cellspacing='0'>
    <tr><td align='center' style='padding:40px 20px;'>
      <table width='620' cellpadding='0' cellspacing='0' style='background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.05);'>
        <tr><td style='background:#0d6efd; padding:30px; text-align:center;'>
          <h1 style='color:#ffffff; margin:0; font-size:26px;'>CareFirst Clinic</h1>
        </td></tr>
        <tr><td style='padding:40px 30px;'>
          <p style='font-size:16px; color:#333333;'>Xin chào <strong>{patientName}</strong>,</p>
          <p style='font-size:16px; color:#555555;'>Bác sĩ <strong>{doctorName}</strong> đã kê đơn thuốc cho bạn ngày {issuedAt:dd/MM/yyyy}.</p>
          
          <table width='100%' cellpadding='0' cellspacing='0' style='border:1px solid #e9ecef; border-radius:8px; margin:20px 0;'>
            <tr style='background:#0d6efd;'>
              <th style='padding:12px; color:white; text-align:left;'>Tên thuốc</th>
              <th style='padding:12px; color:white; text-align:center;'>Số lượng</th>
              <th style='padding:12px; color:white; text-align:left;'>Liều dùng</th>
              <th style='padding:12px; color:white; text-align:center;'>Số ngày</th>
              <th style='padding:12px; color:white; text-align:left;'>Hướng dẫn</th>
            </tr>
            {rows}
          </table>

          {notesHtml}

          <p style='font-size:14px; color:#666666;'>Vui lòng uống thuốc đúng theo hướng dẫn. Nếu có triệu chứng bất thường, hãy liên hệ phòng khám ngay.</p>
        </td></tr>
        <tr><td style='background:#f8f9fa; padding:25px; text-align:center; border-top:1px solid #eeeeee;'>
          <p style='font-size:13px; color:#888888; margin:0;'>© 2026 CareFirst Clinic - Phòng khám chăm sóc sức khỏe</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>";

            await SendAsync(toEmail, subject, html);
        }
    }
}