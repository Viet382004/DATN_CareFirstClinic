namespace CareFirstClinic.API.Models
{
    public enum AppointmentStatus
    {
        Pending,
        Confirmed,
        Waiting,
        InProgress,
        Completed,
        Cancelled
    }

    public class Appointment
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid PatientId { get; set; }

        public Guid TimeSlotId { get; set; }

        public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;

        public string? Reason { get; set; }

        public string? CancelReason { get; set; }

        public DateTime? CancelledAt { get; set; }

        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public Patient? Patient { get; set; }

        public TimeSlot? TimeSlot { get; set; }

        public MedicalRecord? MedicalRecord { get; set; }

        public Payment? Payment { get; set; }
    }
}