using CareFirstClinic.API.Models;

public class Schedule
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid DoctorId { get; set; }

    public DateTime WorkDate { get; set; }

    public TimeSpan StartTime { get; set; }

    public TimeSpan EndTime { get; set; }

    public int SlotDurationMinutes { get; set; }

    public int TotalSlots { get; set; }
    public int AvailableSlots { get; set; }

    public bool IsAvailable { get; set; } = true;

    public string? Note { get; set; }

    // Navigation
    public Doctor? Doctor { get; set; }
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}