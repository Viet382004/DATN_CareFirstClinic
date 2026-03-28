namespace CareFirstClinic.API.Services
{
    public interface IEmailService
    {
        // Gửi email đặt lịch hẹn thành công
        Task SendAppointmentBookedAsync(
            string toEmail,
            string patientName,
            string doctorName,
            string specialtyName,
            DateTime workDate,
            TimeSpan startTime,
            TimeSpan endTime,
            string? reason);

        // Gửi email nhắc lịch khám (1 ngày trước)
        Task SendAppointmentReminderAsync(
            string toEmail,
            string patientName,
            string doctorName,
            string specialtyName,
            DateTime workDate,
            TimeSpan startTime,
            TimeSpan endTime);

        // Gửi đơn thuốc sau khi khám
        Task SendPrescriptionAsync(
            string toEmail,
            string patientName,
            string doctorName,
            DateTime issuedAt,
            List<PrescriptionEmailItem> details,
            string? notes);
    }

    // DTO nhỏ dùng cho email đơn thuốc
    public class PrescriptionEmailItem
    {
        public string MedicineName { get; set; } = string.Empty;
        public string? Unit { get; set; }
        public string Frequency { get; set; } = string.Empty;
        public int DurationDays { get; set; }
        public int Quantity { get; set; }
        public string? Instructions { get; set; }
    }
}