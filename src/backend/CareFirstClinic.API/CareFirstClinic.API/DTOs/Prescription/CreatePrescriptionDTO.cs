using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.DTOs
{
    public class CreatePrescriptionDTO
    {
        [Required(ErrorMessage = "MedicalRecordId không được để trống.")]
        public Guid MedicalRecordId { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        [Required(ErrorMessage = "Đơn thuốc phải có ít nhất 1 loại thuốc.")]
        [MinLength(1)]
        public List<CreatePrescriptionDetailDTO> Details { get; set; } = new();
    }

    public class CreatePrescriptionDetailDTO
    {
        [Required(ErrorMessage = "StockId không được để trống.")]
        public Guid StockId { get; set; }

        [Required(ErrorMessage = "Tần suất dùng thuốc không được để trống.")]
        [MaxLength(100)]
        public string Frequency { get; set; } = string.Empty;

        [Range(1, 365, ErrorMessage = "Số ngày dùng phải từ 1 đến 365.")]
        public int DurationDays { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0.")]
        public int Quantity { get; set; }

        [MaxLength(300)]
        public string? Instructions { get; set; }
    }
}