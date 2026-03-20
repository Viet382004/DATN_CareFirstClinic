using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.DTOs
{
    public class UpdateStockDTO
    {
        [Required(ErrorMessage = "Tên thuốc không được để trống.")]
        [MaxLength(200)]
        public string MedicineName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? MedicineCode { get; set; }

        [MaxLength(20)]
        public string? Unit { get; set; }

        [MaxLength(200)]
        public string? Manufacturer { get; set; }

        [Range(0, int.MaxValue)]
        public int MinQuantity { get; set; } = 10;

        [Range(0.01, double.MaxValue, ErrorMessage = "Giá phải lớn hơn 0.")]
        public decimal UnitPrice { get; set; }

        public bool IsActive { get; set; } = true;
    }
}