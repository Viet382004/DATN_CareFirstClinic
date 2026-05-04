using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.DTOs
{
    public class UpdateMedicalRecordDTO
    {
        [Required(ErrorMessage = "Chẩn đoán không được để trống.")]
        [MaxLength(500)]
        public string Diagnosis { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Symptoms { get; set; }


        [MaxLength(500)]
        public string? Notes { get; set; }

        public DateTime? FollowUpDate { get; set; }
    }
}