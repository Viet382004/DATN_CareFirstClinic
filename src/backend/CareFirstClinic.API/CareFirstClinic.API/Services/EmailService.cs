using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using System.Text;

namespace CareFirstClinic.API.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        // ===============================
        // SMTP CONFIG
        // ===============================
        private string SmtpHost =>
            Environment.GetEnvironmentVariable("EMAIL_SMTP_HOST")
            ?? _config["Email:SmtpHost"]
            ?? "smtp.gmail.com";

        private int SmtpPort =>
            int.TryParse(
                Environment.GetEnvironmentVariable("EMAIL_SMTP_PORT")
                ?? _config["Email:SmtpPort"],
                out var port) ? port : 587;

        private string SmtpUser =>
            Environment.GetEnvironmentVariable("EMAIL_SMTP_USER")
            ?? _config["Email:SmtpUser"]
            ?? string.Empty;

        private string SmtpPass =>
            Environment.GetEnvironmentVariable("EMAIL_SMTP_PASS")
            ?? _config["Email:SmtpPass"]
            ?? string.Empty;

        private string FromEmail =>
            Environment.GetEnvironmentVariable("EMAIL_FROM")
            ?? _config["Email:FromEmail"]
            ?? SmtpUser;

        private string FromName =>
            Environment.GetEnvironmentVariable("EMAIL_FROM_NAME")
            ?? _config["Email:FromName"]
            ?? "CareFirst Clinic";

        // ===============================
        // COMMON SEND METHOD
        // ===============================
        private async Task SendAsync(
            string toEmail,
            string toName,
            string subject,
            string htmlContent)
        {
            if (string.IsNullOrWhiteSpace(SmtpUser) ||
                string.IsNullOrWhiteSpace(SmtpPass))
            {
                _logger.LogError("SMTP credentials chưa được cấu hình.");
                return;
            }

            if (string.IsNullOrWhiteSpace(toEmail))
            {
                _logger.LogWarning("Email người nhận trống.");
                return;
            }

            try
            {
                var message = new MimeMessage();

                message.From.Add(new MailboxAddress(FromName, FromEmail));
                message.To.Add(new MailboxAddress(toName ?? toEmail, toEmail));
                message.Subject = subject;

                var builder = new BodyBuilder
                {
                    HtmlBody = htmlContent
                };

                message.Body = builder.ToMessageBody();

                using var smtp = new SmtpClient();

                smtp.Timeout = 10000;

                _logger.LogInformation(
                    "SMTP đang kết nối {Host}:{Port} -> {ToEmail}",
                    SmtpHost, SmtpPort, toEmail);

                await smtp.ConnectAsync(
                    SmtpHost,
                    SmtpPort,
                    SecureSocketOptions.StartTls);

                await smtp.AuthenticateAsync(SmtpUser, SmtpPass);

                await smtp.SendAsync(message);

                await smtp.DisconnectAsync(true);

                _logger.LogInformation(
                    "✅ Email gửi thành công -> {ToEmail}",
                    toEmail);
            }
            catch (AuthenticationException ex)
            {
                _logger.LogError(ex,
                    "❌ SMTP auth failed. Kiểm tra EMAIL_SMTP_USER/PASS");
            }
            catch (SmtpCommandException ex)
            {
                _logger.LogError(ex,
                    "❌ SMTP command lỗi: {StatusCode}",
                    ex.StatusCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "❌ Lỗi gửi email -> {ToEmail}",
                    toEmail);
            }
        }

        // ════════════════════════════════════════════════════════
        // 1. GỬI OTP
        // ════════════════════════════════════════════════════════
        public async Task SendOtpAsync(string toEmail, string userName, string otpCode)
        {
            var subject = "CareFirst Clinic — Mã xác thực tài khoản";
            var html = $@"
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'><meta name='viewport' content='width=device-width'></head>
<body style='margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;'>
  <table width='100%' cellpadding='0' cellspacing='0'>
    <tr><td align='center' style='padding:40px 20px;'>
      <table width='560' cellpadding='0' cellspacing='0'
             style='background:white;border-radius:8px;overflow:hidden;
                    box-shadow:0 2px 8px rgba(0,0,0,0.08);'>

        <tr><td style='background:#534AB7;padding:32px;text-align:center;'>
          <h1 style='color:white;margin:0;font-size:24px;letter-spacing:1px;'>
            CareFirst Clinic
          </h1>
          <p style='color:#EEEDFE;margin:8px 0 0;font-size:14px;'>Xác thực tài khoản</p>
        </td></tr>

        <tr><td style='padding:32px;'>
          <p style='color:#333;font-size:16px;margin-top:0;'>
            Xin chào <strong>{userName}</strong>,
          </p>
          <p style='color:#555;line-height:1.6;'>
            Cảm ơn bạn đã đăng ký tại <strong>CareFirst Clinic</strong>.
            Vui lòng nhập mã bên dưới để xác thực tài khoản:
          </p>

          <div style='text-align:center;margin:32px 0;'>
            <div style='display:inline-block;background:#534AB7;color:white;
                        font-size:42px;font-weight:bold;letter-spacing:14px;
                        padding:18px 36px;border-radius:12px;'>
              {otpCode}
            </div>
          </div>

          <table width='100%' cellpadding='12' cellspacing='0'>
            <tr><td style='background:#FFF8E1;border-left:4px solid #FFA000;border-radius:0 4px 4px 0;'>
              <p style='margin:0;font-size:14px;color:#666;'>
                ⏱ Mã có hiệu lực trong <strong>10 phút</strong>.
                Không chia sẻ mã này với bất kỳ ai.
              </p>
            </td></tr>
          </table>

          <p style='color:#999;font-size:13px;margin-top:24px;'>
            Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.
          </p>
          <p style='color:#555;'>Trân trọng,<br><strong>CareFirst Clinic</strong></p>
        </td></tr>

        <tr><td style='background:#f9f9f9;padding:16px;text-align:center;border-top:1px solid #eee;'>
          <p style='margin:0;color:#bbb;font-size:12px;'>Email tự động — vui lòng không trả lời</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>";
            await SendAsync(toEmail, userName, subject, html);
        }

        // ════════════════════════════════════════════════════════
        // 2. ĐẶT LỊCH THÀNH CÔNG
        // ════════════════════════════════════════════════════════
        public async Task SendAppointmentBookedAsync(
            string toEmail, string patientName, string doctorName,
            string specialtyName, DateTime workDate,
            TimeSpan startTime, TimeSpan endTime, string? reason)
        {
            var subject = "CareFirst Clinic — Đặt lịch hẹn thành công";
            var reasonRow = string.IsNullOrWhiteSpace(reason) ? "" : $@"
              <tr>
                <td style='padding:10px 0;color:#888;width:40%;font-size:14px;'>Lý do khám</td>
                <td style='padding:10px 0;font-size:14px;'>{reason}</td>
              </tr>";

            var html = $@"
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'></head>
<body style='margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;'>
  <table width='100%' cellpadding='0' cellspacing='0'>
    <tr><td align='center' style='padding:40px 20px;'>
      <table width='560' cellpadding='0' cellspacing='0'
             style='background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);'>

        <tr><td style='background:#1D9E75;padding:32px;text-align:center;'>
          <h1 style='color:white;margin:0;font-size:24px;'>CareFirst Clinic</h1>
          <p style='color:#E1F5EE;margin:8px 0 0;font-size:14px;'>Đặt lịch hẹn thành công ✓</p>
        </td></tr>

        <tr><td style='padding:32px;'>
          <p style='color:#333;'>Xin chào <strong>{patientName}</strong>,</p>
          <p style='color:#555;'>Lịch hẹn của bạn đã được đặt thành công:</p>

          <table width='100%' cellpadding='0' cellspacing='0'
                 style='background:#f9f9f9;border-radius:8px;padding:20px;margin:16px 0;border:1px solid #eee;'>
            <tr>
              <td style='padding:10px 0;color:#888;width:40%;font-size:14px;'>Bác sĩ</td>
              <td style='padding:10px 0;font-weight:bold;'>{doctorName}</td>
            </tr>
            <tr>
              <td style='padding:10px 0;color:#888;font-size:14px;'>Chuyên khoa</td>
              <td style='padding:10px 0;'>{specialtyName}</td>
            </tr>
            <tr>
              <td style='padding:10px 0;color:#888;font-size:14px;'>Ngày khám</td>
              <td style='padding:10px 0;font-weight:bold;color:#1D9E75;font-size:15px;'>
                {workDate:dd/MM/yyyy}
              </td>
            </tr>
            <tr>
              <td style='padding:10px 0;color:#888;font-size:14px;'>Giờ khám</td>
              <td style='padding:10px 0;font-weight:bold;font-size:16px;'>
                {startTime:hh\\:mm} — {endTime:hh\\:mm}
              </td>
            </tr>
            {reasonRow}
          </table>

          <table width='100%' cellpadding='12' cellspacing='0'>
            <tr><td style='background:#FFF8E1;border-left:4px solid #FFA000;border-radius:0 4px 4px 0;'>
              <p style='margin:0;font-size:14px;color:#666;'>
                Vui lòng đến đúng giờ. Nếu cần hủy, hãy thực hiện trước 24 giờ.
              </p>
            </td></tr>
          </table>
          <p style='color:#555;margin-top:24px;'>Trân trọng,<br><strong>CareFirst Clinic</strong></p>
        </td></tr>

        <tr><td style='background:#f9f9f9;padding:16px;text-align:center;border-top:1px solid #eee;'>
          <p style='margin:0;color:#bbb;font-size:12px;'>Email tự động — vui lòng không trả lời</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>";
            await SendAsync(toEmail, patientName, subject, html);
        }

        // ════════════════════════════════════════════════════════
        // 3. NHẮC LỊCH KHÁM
        // ════════════════════════════════════════════════════════
        public async Task SendAppointmentReminderAsync(
            string toEmail, string patientName, string doctorName,
            string specialtyName, DateTime workDate,
            TimeSpan startTime, TimeSpan endTime)
        {
            var subject = "CareFirst Clinic — Nhắc lịch khám ngày mai";
            var html = $@"
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'></head>
<body style='margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;'>
  <table width='100%' cellpadding='0' cellspacing='0'>
    <tr><td align='center' style='padding:40px 20px;'>
      <table width='560' cellpadding='0' cellspacing='0'
             style='background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);'>

        <tr><td style='background:#185FA5;padding:32px;text-align:center;'>
          <h1 style='color:white;margin:0;font-size:24px;'>CareFirst Clinic</h1>
          <p style='color:#E6F1FB;margin:8px 0 0;font-size:14px;'>Nhắc nhở lịch khám ngày mai 📅</p>
        </td></tr>

        <tr><td style='padding:32px;'>
          <p style='color:#333;'>Xin chào <strong>{patientName}</strong>,</p>
          <p style='color:#555;'>Bạn có lịch khám <strong>vào ngày mai</strong>. Đừng quên nhé!</p>

          <table width='100%' cellpadding='0' cellspacing='0'
                 style='background:#f9f9f9;border-radius:8px;padding:20px;margin:16px 0;border:1px solid #eee;'>
            <tr>
              <td style='padding:10px 0;color:#888;width:40%;font-size:14px;'>Bác sĩ</td>
              <td style='padding:10px 0;font-weight:bold;'>{doctorName}</td>
            </tr>
            <tr>
              <td style='padding:10px 0;color:#888;font-size:14px;'>Chuyên khoa</td>
              <td style='padding:10px 0;'>{specialtyName}</td>
            </tr>
            <tr>
              <td style='padding:10px 0;color:#888;font-size:14px;'>Ngày khám</td>
              <td style='padding:10px 0;font-weight:bold;color:#185FA5;font-size:15px;'>
                {workDate:dd/MM/yyyy}
              </td>
            </tr>
            <tr>
              <td style='padding:10px 0;color:#888;font-size:14px;'>Giờ khám</td>
              <td style='padding:10px 0;font-weight:bold;font-size:20px;color:#185FA5;'>
                {startTime:hh\\:mm} — {endTime:hh\\:mm}
              </td>
            </tr>
          </table>

          <table width='100%' cellpadding='12' cellspacing='0'>
            <tr><td style='background:#E6F1FB;border-left:4px solid #185FA5;border-radius:0 4px 4px 0;'>
              <p style='margin:0;font-size:14px;color:#185FA5;'>
                Nhớ mang CMND/CCCD và kết quả xét nghiệm trước đây nếu có.
              </p>
            </td></tr>
          </table>
          <p style='color:#555;margin-top:24px;'>Trân trọng,<br><strong>CareFirst Clinic</strong></p>
        </td></tr>

        <tr><td style='background:#f9f9f9;padding:16px;text-align:center;border-top:1px solid #eee;'>
          <p style='margin:0;color:#bbb;font-size:12px;'>Email tự động — vui lòng không trả lời</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>";
            await SendAsync(toEmail, patientName, subject, html);
        }

        // ════════════════════════════════════════════════════════
        // 4. GỬI ĐƠN THUỐC
        // ════════════════════════════════════════════════════════
        public async Task SendPrescriptionAsync(
            string toEmail, string patientName, string doctorName,
            DateTime issuedAt, List<PrescriptionEmailItem> details, string? notes)
        {
            var subject = "CareFirst Clinic — Đơn thuốc của bạn";
            var rows = new StringBuilder();
            foreach (var d in details)
            {
                rows.Append($@"
                <tr>
                  <td style='padding:10px 12px;border-bottom:1px solid #f0f0f0;'>
                    <strong>{d.MedicineName}</strong>
                  </td>
                  <td style='padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;'>
                    {d.Quantity} {d.Unit}
                  </td>
                  <td style='padding:10px 12px;border-bottom:1px solid #f0f0f0;'>{d.Frequency}</td>
                  <td style='padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;'>
                    {d.DurationDays} ngày
                  </td>
                  <td style='padding:10px 12px;border-bottom:1px solid #f0f0f0;color:#666;font-size:13px;'>
                    {d.Instructions ?? "—"}
                  </td>
                </tr>");
            }

            var notesHtml = string.IsNullOrWhiteSpace(notes) ? "" : $@"
            <table width='100%' cellpadding='12' cellspacing='0' style='margin-top:16px;'>
              <tr><td style='background:#EEEDFE;border-left:4px solid #534AB7;border-radius:0 4px 4px 0;'>
                <p style='margin:0;font-size:14px;'>
                  <strong>Lưu ý từ bác sĩ:</strong> {notes}
                </p>
              </td></tr>
            </table>";

            var html = $@"
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'></head>
<body style='margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;'>
  <table width='100%' cellpadding='0' cellspacing='0'>
    <tr><td align='center' style='padding:40px 20px;'>
      <table width='620' cellpadding='0' cellspacing='0'
             style='background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);'>

        <tr><td style='background:#534AB7;padding:32px;text-align:center;'>
          <h1 style='color:white;margin:0;font-size:24px;'>CareFirst Clinic</h1>
          <p style='color:#EEEDFE;margin:8px 0 0;font-size:14px;'>
            Đơn thuốc điện tử — {issuedAt:dd/MM/yyyy}
          </p>
        </td></tr>

        <tr><td style='padding:32px;'>
          <p style='color:#333;'>Xin chào <strong>{patientName}</strong>,</p>
          <p style='color:#555;'>
            Bác sĩ <strong>{doctorName}</strong> đã kê đơn thuốc sau buổi khám ngày
            <strong>{issuedAt:dd/MM/yyyy}</strong>.
          </p>

          <table width='100%' cellpadding='0' cellspacing='0'
                 style='border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;margin:16px 0;'>
            <tr style='background:#534AB7;'>
              <th style='padding:12px;color:white;text-align:left;font-weight:500;font-size:13px;'>Tên thuốc</th>
              <th style='padding:12px;color:white;text-align:center;font-weight:500;font-size:13px;'>Số lượng</th>
              <th style='padding:12px;color:white;text-align:left;font-weight:500;font-size:13px;'>Liều dùng</th>
              <th style='padding:12px;color:white;text-align:center;font-weight:500;font-size:13px;'>Số ngày</th>
              <th style='padding:12px;color:white;text-align:left;font-weight:500;font-size:13px;'>Hướng dẫn</th>
            </tr>
            {rows}
          </table>

          {notesHtml}

          <table width='100%' cellpadding='12' cellspacing='0' style='margin-top:16px;'>
            <tr><td style='background:#FFF8E1;border-left:4px solid #FFA000;border-radius:0 4px 4px 0;'>
              <p style='margin:0;font-size:13px;color:#666;'>
                Uống thuốc đúng theo hướng dẫn. Nếu có triệu chứng bất thường hãy liên hệ phòng khám ngay.
              </p>
            </td></tr>
          </table>
          <p style='color:#555;margin-top:24px;'>Trân trọng,<br><strong>CareFirst Clinic</strong></p>
        </td></tr>

        <tr><td style='background:#f9f9f9;padding:16px;text-align:center;border-top:1px solid #eee;'>
          <p style='margin:0;color:#bbb;font-size:12px;'>Email tự động — vui lòng không trả lời</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>";
            await SendAsync(toEmail, patientName, subject, html);
        }
    }
}