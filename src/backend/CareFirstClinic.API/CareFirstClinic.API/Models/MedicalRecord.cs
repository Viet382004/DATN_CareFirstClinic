namespace CareFirstClinic.API.Models
{
    public class MedicalRecord
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid PatientId { get; set; }
        public Guid DoctorId { get; set; }
        public Guid AppointmentId { get; set; }

        public string Diagnosis { get; set; } = string.Empty;  // Chẩn đoán
        public string? Symptoms { get; set; }                   // Triệu chứng
        public float? BloodPressure { get; set; }           // Huyết áp 
        public float? HeartRate { get; set; }               // Nhịp tim
        public float? Temperature { get; set; }             // Nhiệt độ
        public float? Weight { get; set; }                  // Cân nặng
        public float? Height { get; set; }                  // Chiều cao

        public string? Notes { get; set; }
        public DateTime? FollowUpDate { get; set; }         // Ngày tái khám

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public Patient? Patient { get; set; }
        public Doctor? Doctor { get; set; }
        public Appointment? Appointment { get; set; }
        public Prescription? Prescription { get; set; }
    }
}