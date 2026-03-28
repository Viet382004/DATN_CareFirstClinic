using SendGrid;
using SendGrid.Helpers.Mail;
using System.Text;

namespace CareFirstClinic.API.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        // Lấy config từ appsettings.json
        private string ApiKey     => _config["SendGrid:ApiKey"]    ?? throw new InvalidOperationException("Chưa cấu hình SendGrid:ApiKey");
        private string FromEmail  => _config["SendGrid:FromEmail"] ?? "noreply@carefirstclinic.com";
        private string FromName   => _config["SendGrid:FromName"]  ?? "CareFirst Clinic";

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        // ── Hàm gửi chung — tất cả email đều dùng hàm này ──────────
        // Nhận subject + htmlContent, gửi qua SendGrid API
        private async Task SendAsync(string toEmail, string toName, string subject, string htmlContent)
        {
            try
            {
                var client  = new SendGridClient(ApiKey);
                var from    = new EmailAddress(FromEmail, FromName);
                var to      = new EmailAddress(toEmail, toName);
                var msg     = MailHelper.CreateSingleEmail(from, to, subject, null, htmlContent);

                var response = await client.SendEmailAsync(msg);

                if (!response.IsSuccessStatusCode)
                {
                    var body = await response.Body.ReadAsStringAsync();
                    _logger.LogError("SendGrid lỗi {Status}: {Body}", response.StatusCode, body);
                }
                else
                {
                    _logger.LogInformation("Đã gửi email '{Subject}' tới {Email}", subject, toEmail);
                }
            }
            catch (Exception ex)
            {
                // Không throw — lỗi email không được làm crash luồng chính
                _logger.LogError(ex, "Lỗi khi gửi email tới {Email}", toEmail);
            }
        }

        // ── 1. EMAIL ĐẶT LỊCH HẸN THÀNH CÔNG ───────────────────────
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
            var subject = "CareFirst Clinic — Đặt lịch hẹn thành công";
            var html = BuildAppointmentBookedHtml(
                patientName, doctorName, specialtyName,
                workDate, startTime, endTime, reason);

            await SendAsync(toEmail, patientName, subject, html);
        }

        // ── 2. EMAIL NHẮC LỊCH KHÁM (1 NGÀY TRƯỚC) ─────────────────
        public async Task SendAppointmentReminderAsync(
            string toEmail,
            string patientName,
            string doctorName,
            string specialtyName,
            DateTime workDate,
            TimeSpan startTime,
            TimeSpan endTime)
        {
            var subject = "CareFirst Clinic — Nhắc nhở lịch khám ngày mai";
            var html = BuildReminderHtml(
                patientName, doctorName, specialtyName,
                workDate, startTime, endTime);

            await SendAsync(toEmail, patientName, subject, html);
        }

        // ── 3. EMAIL GỬI ĐƠN THUỐC ──────────────────────────────────
        public async Task SendPrescriptionAsync(
            string toEmail,
            string patientName,
            string doctorName,
            DateTime issuedAt,
            List<PrescriptionEmailItem> details,
            string? notes)
        {
            var subject = "CareFirst Clinic — Đơn thuốc của bạn";
            var html = BuildPrescriptionHtml(
                patientName, doctorName, issuedAt, details, notes);

            await SendAsync(toEmail, patientName, subject, html);
        }

        // ════════════════════════════════════════════════════════════
        // HTML TEMPLATES
        // ════════════════════════════════════════════════════════════

        private string BuildAppointmentBookedHtml(
            string patientName, string doctorName, string specialtyName,
            DateTime workDate, TimeSpan startTime, TimeSpan endTime, string? reason)
        {
            return $@"
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'></head>
<body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;'>

  <div style='background: #1D9E75; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;'>
    <h1 style='color: white; margin: 0; font-size: 22px;'>CareFirst Clinic</h1>
    <p style='color: #E1F5EE; margin: 8px 0 0;'>Đặt lịch hẹn thành công</p>
  </div>

  <div style='background: #f9f9f9; padding: 24px; border: 1px solid #e0e0e0; border-top: none;'>
    <p>Xin chào <strong>{patientName}</strong>,</p>
    <p>Lịch hẹn khám của bạn đã được đặt thành công. Vui lòng xem thông tin chi tiết bên dưới:</p>

    <div style='background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 16px 0;'>
      <table style='width: 100%; border-collapse: collapse;'>
        <tr>
          <td style='padding: 8px 0; color: #666; width: 40%;'>Bác sĩ</td>
          <td style='padding: 8px 0; font-weight: bold;'>{doctorName}</td>
        </tr>
        <tr>
          <td style='padding: 8px 0; color: #666;'>Chuyên khoa</td>
          <td style='padding: 8px 0;'>{specialtyName}</td>
        </tr>
        <tr>
          <td style='padding: 8px 0; color: #666;'>Ngày khám</td>
          <td style='padding: 8px 0; font-weight: bold; color: #1D9E75;'>
            {workDate:dddd, dd/MM/yyyy}
          </td>
        </tr>
        <tr>
          <td style='padding: 8px 0; color: #666;'>Giờ khám</td>
          <td style='padding: 8px 0; font-weight: bold;'>
            {startTime:hh\\:mm} — {endTime:hh\\:mm}
          </td>
        </tr>
        {(string.IsNullOrWhiteSpace(reason) ? "" : $@"
        <tr>
          <td style='padding: 8px 0; color: #666;'>Lý do khám</td>
          <td style='padding: 8px 0;'>{reason}</td>
        </tr>")}
      </table>
    </div>

    <div style='background: #FFF8E1; border-left: 4px solid #FFA000; padding: 12px 16px; border-radius: 0 4px 4px 0; margin: 16px 0;'>
      <p style='margin: 0; font-size: 14px; color: #666;'>
        Vui lòng đến đúng giờ. Nếu cần hủy lịch, hãy thực hiện trước 24 giờ.
      </p>
    </div>

    <p style='color: #666; font-size: 13px;'>Trân trọng,<br><strong>CareFirst Clinic</strong></p>
  </div>

  <div style='text-align: center; padding: 16px; color: #999; font-size: 12px;'>
    Email này được gửi tự động, vui lòng không trả lời.
  </div>
</body>
</html>";
        }

        private string BuildReminderHtml(
            string patientName, string doctorName, string specialtyName,
            DateTime workDate, TimeSpan startTime, TimeSpan endTime)
        {
            return $@"
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'></head>
<body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;'>

  <div style='background: #185FA5; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;'>
    <h1 style='color: white; margin: 0; font-size: 22px;'>CareFirst Clinic</h1>
    <p style='color: #E6F1FB; margin: 8px 0 0;'>Nhắc nhở lịch khám</p>
  </div>

  <div style='background: #f9f9f9; padding: 24px; border: 1px solid #e0e0e0; border-top: none;'>
    <p>Xin chào <strong>{patientName}</strong>,</p>
    <p>Đây là lời nhắc nhở — bạn có lịch khám <strong>vào ngày mai</strong>:</p>

    <div style='background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 16px 0;'>
      <table style='width: 100%; border-collapse: collapse;'>
        <tr>
          <td style='padding: 8px 0; color: #666; width: 40%;'>Bác sĩ</td>
          <td style='padding: 8px 0; font-weight: bold;'>{doctorName}</td>
        </tr>
        <tr>
          <td style='padding: 8px 0; color: #666;'>Chuyên khoa</td>
          <td style='padding: 8px 0;'>{specialtyName}</td>
        </tr>
        <tr>
          <td style='padding: 8px 0; color: #666;'>Ngày khám</td>
          <td style='padding: 8px 0; font-weight: bold; color: #185FA5;'>
            {workDate:dddd, dd/MM/yyyy}
          </td>
        </tr>
        <tr>
          <td style='padding: 8px 0; color: #666;'>Giờ khám</td>
          <td style='padding: 8px 0; font-weight: bold; font-size: 18px; color: #185FA5;'>
            {startTime:hh\\:mm} — {endTime:hh\\:mm}
          </td>
        </tr>
      </table>
    </div>

    <div style='background: #E6F1FB; border-left: 4px solid #185FA5; padding: 12px 16px; border-radius: 0 4px 4px 0;'>
      <p style='margin: 0; font-size: 14px; color: #185FA5;'>
        Nhớ mang theo CMND/CCCD và các kết quả xét nghiệm trước đây (nếu có).
      </p>
    </div>

    <p style='color: #666; font-size: 13px; margin-top: 16px;'>Trân trọng,<br><strong>CareFirst Clinic</strong></p>
  </div>

  <div style='text-align: center; padding: 16px; color: #999; font-size: 12px;'>
    Email này được gửi tự động, vui lòng không trả lời.
  </div>
</body>
</html>";
        }

        private string BuildPrescriptionHtml(
            string patientName, string doctorName,
            DateTime issuedAt, List<PrescriptionEmailItem> details, string? notes)
        {
            // Build bảng thuốc
            var rows = new StringBuilder();
            foreach (var d in details)
            {
                rows.Append($@"
                <tr>
                  <td style='padding: 10px 12px; border-bottom: 1px solid #f0f0f0;'><strong>{d.MedicineName}</strong></td>
                  <td style='padding: 10px 12px; border-bottom: 1px solid #f0f0f0; text-align: center;'>{d.Quantity} {d.Unit}</td>
                  <td style='padding: 10px 12px; border-bottom: 1px solid #f0f0f0;'>{d.Frequency}</td>
                  <td style='padding: 10px 12px; border-bottom: 1px solid #f0f0f0; text-align: center;'>{d.DurationDays} ngày</td>
                  <td style='padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 13px;'>{d.Instructions ?? "—"}</td>
                </tr>");
            }

            return $@"
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'></head>
<body style='font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; color: #333;'>

  <div style='background: #534AB7; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;'>
    <h1 style='color: white; margin: 0; font-size: 22px;'>CareFirst Clinic</h1>
    <p style='color: #EEEDFE; margin: 8px 0 0;'>Đơn thuốc điện tử</p>
  </div>

  <div style='background: #f9f9f9; padding: 24px; border: 1px solid #e0e0e0; border-top: none;'>
    <p>Xin chào <strong>{patientName}</strong>,</p>
    <p>Bác sĩ <strong>{doctorName}</strong> đã kê đơn thuốc cho bạn sau buổi khám ngày <strong>{issuedAt:dd/MM/yyyy}</strong>.</p>

    <h3 style='margin: 20px 0 12px; font-size: 16px;'>Danh sách thuốc</h3>
    <div style='overflow-x: auto;'>
      <table style='width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;'>
        <thead>
          <tr style='background: #534AB7;'>
            <th style='padding: 12px; color: white; text-align: left; font-weight: 500;'>Tên thuốc</th>
            <th style='padding: 12px; color: white; text-align: center; font-weight: 500;'>Số lượng</th>
            <th style='padding: 12px; color: white; text-align: left; font-weight: 500;'>Liều dùng</th>
            <th style='padding: 12px; color: white; text-align: center; font-weight: 500;'>Số ngày</th>
            <th style='padding: 12px; color: white; text-align: left; font-weight: 500;'>Hướng dẫn</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>

    {(string.IsNullOrWhiteSpace(notes) ? "" : $@"
    <div style='background: #EEEDFE; border-left: 4px solid #534AB7; padding: 12px 16px; border-radius: 0 4px 4px 0; margin: 16px 0;'>
      <p style='margin: 0; font-size: 14px;'><strong>Lưu ý từ bác sĩ:</strong> {notes}</p>
    </div>")}

    <div style='background: #FFF8E1; border-left: 4px solid #FFA000; padding: 12px 16px; border-radius: 0 4px 4px 0; margin: 16px 0;'>
      <p style='margin: 0; font-size: 13px; color: #666;'>
        Uống thuốc đúng theo hướng dẫn. Nếu có triệu chứng bất thường, hãy liên hệ phòng khám ngay.
      </p>
    </div>

    <p style='color: #666; font-size: 13px;'>Trân trọng,<br><strong>CareFirst Clinic</strong></p>
  </div>

  <div style='text-align: center; padding: 16px; color: #999; font-size: 12px;'>
    Email này được gửi tự động, vui lòng không trả lời.
  </div>
</body>
</html>";
        }
    }
}