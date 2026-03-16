namespace CareFirstClinic.API.DTOs
{
    public class AppointmentDTO
    {
        public Guid Id { get; set; }

        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;

        public Guid TimeSlotId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string SpecialtyName { get; set; } = string.Empty;
        public DateTime WorkDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }

        public string Status { get; set; } = string.Empty;
        public string? Reason { get; set; }
        public string? CancelReason { get; set; }
        public DateTime? CancelledAt { get; set; }
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}