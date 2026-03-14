namespace CareFirstClinic.API.Models
{
    public enum PrescriptionStatus
    {
        Issued,
        Dispensed,
        Cancelled,
        Expired
    }

    public class Prescription
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid MedicalRecordId { get; set; }

        public PrescriptionStatus Status { get; set; } = PrescriptionStatus.Issued;

        public string? Notes { get; set; }
        public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
        // Navigation
        public MedicalRecord? MedicalRecord { get; set; }
        public ICollection<PrescriptionDetail> Details { get; set; } = new List<PrescriptionDetail>();
    }
}