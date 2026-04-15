namespace CareFirstClinic.API.Models
{
    public enum PrescriptionStatus
    {
        Issued, // Ð? ðý?c bác s? kê ðõn nhýng chýa ðý?c nhà thu?c x? l?
        Dispensed, // Nhà thu?c ð? c?p phát thu?c cho b?nh nhân
        Cancelled, // Ðõn thu?c ð? b? h?y b?i bác s? ho?c nhà thu?c
        Expired // Ðõn thu?c ð? h?t h?n (thý?ng là sau m?t kho?ng th?i gian nh?t ð?nh k? t? ngày kê ðõn)
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