using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.Models
{
    public class Doctor
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        public int YearsOfExperience { get; set; }

        [Phone]
        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        
        public Guid SpecialtyId { get; set; }

        public Guid? UserId { get; set; }

        // Navigation
        public Specialty? Specialty { get; set; }
        public User? User { get; set; }
        public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
        public ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
    }
}