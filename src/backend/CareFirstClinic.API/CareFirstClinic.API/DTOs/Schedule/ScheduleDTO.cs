namespace CareFirstClinic.API.DTOs
{
    public class ScheduleDTO
    {
        public Guid Id { get; set; }
        public Guid DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string SpecialtyName { get; set; } = string.Empty;
        public DateTime WorkDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsAvailable { get; set; }
        public string? Note { get; set; }
        // Slot này đã được đặt chưa
        public bool IsBooked { get; set; }
    }
}