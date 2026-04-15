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
        public int SlotDurationMinutes { get; set; }
        public int TotalSlots { get; set; }
        public int AvailableSlots { get; set; }
        public bool IsAvailable { get; set; }
        public string? Note { get; set; }
        public List<TimeSlotDTO> TimeSlots { get; set; } = new();
    }

    public class TimeSlotDTO
    {
        public Guid Id { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsBooked { get; set; }
        public Guid? AppointmentId { get; set; }
        public string? PatientName { get; set; }
        public string? PatientPhone { get; set; }
        public string? Status { get; set; }
        public string? Reason { get; set; }
    }
}