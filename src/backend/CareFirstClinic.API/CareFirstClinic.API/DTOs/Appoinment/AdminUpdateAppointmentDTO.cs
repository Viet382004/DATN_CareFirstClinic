namespace CareFirstClinic.API.DTOs
{
    public class AdminUpdateAppointmentDTO
    {
        public Guid TimeSlotId { get; set; }
        public string? Notes { get; set; }
    }
}
