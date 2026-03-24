using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.DTOs
{
    public class CreateMedicalRecordDTO
    {
        [Required(ErrorMessage = "AppointmentId không được để trống.")]
        public Guid AppointmentId { get; set; }

        [Required(ErrorMessage = "Chẩn đoán không được để trống.")]
        [MaxLength(500)]
        public string Diagnosis { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Symptoms { get; set; }

        public float? BloodPressure { get; set; }
        public float? HeartRate { get; set; }
        public float? Temperature { get; set; }
        public float? Weight { get; set; }
        public float? Height { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        public DateTime? FollowUpDate { get; set; }
    }
}