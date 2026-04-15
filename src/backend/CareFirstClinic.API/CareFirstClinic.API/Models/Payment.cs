namespace CareFirstClinic.API.Models
{
    public enum PaymentStatus
    {
        Pending,
        Completed,
        Failed,
        Refunded
    }

    public enum PaymentMethod
    {
        Cash,
        CreditCard,
        VNPay,
        BankTransfer
    }

    public enum PaymentType
    {
        ConsultationFee,
        MedicineFee
    }

    public class Payment
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid PatientId { get; set; }
        public Guid AppointmentId { get; set; }

        public string OrderId { get; set; } = string.Empty;
        public decimal Amount { get; set; }

        public PaymentType Type { get; set; }   
        public PaymentMethod Method { get; set; } = PaymentMethod.Cash;
        public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

        public string? TransactionId { get; set; }
        public string? BankCode { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PaidAt { get; set; }

        public string? Notes { get; set; }

        public Patient? Patient { get; set; }
        public Appointment? Appointment { get; set; }
    }
}