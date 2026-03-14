using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.DTOs.Specialty
{
    public class UpdateSpecialtyDTO
    {
        [Required(ErrorMessage = "Tên chuyên khoa không được để trống.")]
        [MaxLength(100, ErrorMessage = "Tên chuyên khoa tối đa 100 ký tự.")]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500, ErrorMessage = "Mô tả tối đa 500 ký tự.")]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
