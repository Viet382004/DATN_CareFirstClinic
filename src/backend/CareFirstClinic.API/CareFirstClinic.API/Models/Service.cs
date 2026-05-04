using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.Models
{
    public class Service
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        public decimal Price { get; set; }
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public Guid? SpecialtyId { get; set; }
        public Specialty? Specialty { get; set; }
        
        public ICollection<ServiceField> Fields { get; set; } = new List<ServiceField>();
        public ICollection<ServiceOrder> ServiceOrders { get; set; } = new List<ServiceOrder>();
    }
}
