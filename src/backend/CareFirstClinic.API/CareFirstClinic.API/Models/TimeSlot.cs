namespace CareFirstClinic.API.Models
{
    public class TimeSlot
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid ScheduleId { get; set; }

        public TimeSpan StartTime { get; set; }

        public TimeSpan EndTime { get; set; }

        public bool IsBooked { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Schedule? Schedule { get; set; }

        public Appointment? Appointment { get; set; }
    }
}