using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace CareFirstClinic.API.Models
{
    public class ServiceField
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ServiceId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string FieldName { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string? Unit { get; set; }
        
        [MaxLength(50)]
        public string DataType { get; set; } = "Text"; // Text, Number

        [JsonIgnore]
        public Service? Service { get; set; }
    }
}
