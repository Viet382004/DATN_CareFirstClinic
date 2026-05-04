using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.Models
{
    public enum ServiceOrderStatus { Pending, InProgress, Completed, Cancelled }

    public class ServiceOrder
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid AppointmentId { get; set; }
        public Guid ServiceId { get; set; }
        
        public decimal PriceAtOrder { get; set; }
        public ServiceOrderStatus Status { get; set; } = ServiceOrderStatus.Pending;
        
        // Locking mechanism
        public Guid? LockedByDoctorId { get; set; }
        public DateTime? LockedAt { get; set; }
        
        public string? ResultData { get; set; } // JSON results
        
        public Appointment? Appointment { get; set; }
        public Service? Service { get; set; }
        public Doctor? LockedByDoctor { get; set; }
    }
}
