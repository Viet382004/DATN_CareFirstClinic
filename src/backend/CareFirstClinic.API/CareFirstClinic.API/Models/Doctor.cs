using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.Models
{
    public class Doctor
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string? AvatarUrl { get; set; }

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string? AcademicTitle { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string? Position { get; set; } 

        [MaxLength(1000)]
        public string? Description { get; set; } 
        public int YearsOfExperience { get; set; }

        [Phone]
        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        
        public Guid SpecialtyId { get; set; }

        public Guid? UserId { get; set; }

        public Specialty? Specialty { get; set; }
        public User? User { get; set; }
        public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
        public ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
    }
}