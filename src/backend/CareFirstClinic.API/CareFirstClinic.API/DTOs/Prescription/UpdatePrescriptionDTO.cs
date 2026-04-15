using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.DTOs
{
    public class UpdatePrescriptionDTO
    {
        public string? Notes { get; set; }

        [Required]
        public List<UpdatePrescriptionDetailDTO> Details { get; set; } = new();
    }

    public class UpdatePrescriptionDetailDTO
    {
        [Required]
        public Guid StockId { get; set; }

        [Required]
        public string Frequency { get; set; } = string.Empty;

        [Required]
        public int DurationDays { get; set; }

        [Required]
        public int Quantity { get; set; }

        public string? Instructions { get; set; }
    }
}
