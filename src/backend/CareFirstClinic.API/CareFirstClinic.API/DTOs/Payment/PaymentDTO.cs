namespace CareFirstClinic.API.DTOs.Payment
{
    public class PaymentDTO
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public Guid AppointmentId { get; set; }
        public string OrderId { get; set; } = string.Empty;  // ⭐ Thêm OrderId
        public decimal Amount { get; set; }
        public string Method { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;  
        public string? TransactionId { get; set; }
        public string? BankCode { get; set; }  
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? PaidAt { get; set; }
    }
}