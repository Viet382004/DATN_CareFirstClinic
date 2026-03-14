using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.Models
{
    public class Role
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}