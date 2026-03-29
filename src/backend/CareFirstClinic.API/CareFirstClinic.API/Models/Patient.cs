using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.Models
{

    public class Patient
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string? AvatarUrl { get; set; }

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        public DateTime DateOfBirth { get; set; }

        [Required]
        [MaxLength(10)]
        public string Gender { get; set; } = string.Empty;

        [Phone]
        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        [MaxLength(250)]
        public string Address { get; set; } = string.Empty;

        public string? MedicalHistory { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Guid? UserId { get; set; }

        // Navigation
        public User? User { get; set; }
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}