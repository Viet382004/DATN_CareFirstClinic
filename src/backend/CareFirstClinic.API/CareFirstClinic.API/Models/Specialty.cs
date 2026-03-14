using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.Models
{
    public class Specialty
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation
        public ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
    }
}