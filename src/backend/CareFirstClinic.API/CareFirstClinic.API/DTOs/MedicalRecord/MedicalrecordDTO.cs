using CareFirstClinic.API.DTOs.ClinicalService;
 
namespace CareFirstClinic.API.DTOs
{
    public class MedicalRecordDTO
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public Guid DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public Guid AppointmentId { get; set; }

        public string Diagnosis { get; set; } = string.Empty;
        public string? Symptoms { get; set; }

        public string? Notes { get; set; }
        public DateTime? FollowUpDate { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Có đơn thuốc chưa
        public bool HasPrescription { get; set; }
        public List<ServiceOrderDTO> ServiceResults { get; set; } = new();
    }
}