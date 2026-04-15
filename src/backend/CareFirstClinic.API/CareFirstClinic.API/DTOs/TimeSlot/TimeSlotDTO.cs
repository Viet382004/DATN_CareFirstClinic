namespace CareFirstClinic.API.DTOs.TimeSlot
{
    public class TimeSlotDTO
    {
        public Guid Id { get; set; }
        public Guid ScheduleId { get; set; }
        public DateTime WorkDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsBooked { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string SpecialtyName { get; set; } = string.Empty;
        public Guid? AppointmentId { get; set; }
        public string? PatientName { get; set; }
        public string? PatientPhone { get; set; }
        public string? Status { get; set; }
        public string? Reason { get; set; }
    }
}
