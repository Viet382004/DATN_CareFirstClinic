namespace CareFirstClinic.API.Models
{
    public enum AppointmentStatus
    {
        Pending,
        Confirmed,
        Completed,
        Cancelled
    }

    public class Appointment
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid PatientId { get; set; }       
        public Guid ScheduleId { get; set; }     

        public DateTime AppointmentDate { get; set; } 
        public TimeSpan StartTime { get; set; }       
        public TimeSpan EndTime { get; set; }          

        public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;

        public string? Reason { get; set; }
        public string? CancelReason { get; set; }  // Lý do hủy
        public DateTime? CancelledAt { get; set; }
        public string? Notes { get; set; }         

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public Patient? Patient { get; set; }
        public Schedule? Schedule { get; set; }
        public MedicalRecord? MedicalRecord { get; set; }
        public Payment? Payment { get; set; }
    }
}