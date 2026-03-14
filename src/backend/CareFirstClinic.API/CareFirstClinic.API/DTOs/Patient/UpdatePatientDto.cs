using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.DTOs
{
    /// Dùng để nhận dữ liệu từ client khi cập nhật hồ sơ bệnh nhân (request)
    public class UpdatePatientDTO
    {
        [Required(ErrorMessage = "Họ tên không được để trống.")]
        [MaxLength(100, ErrorMessage = "Họ tên tối đa 100 ký tự.")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Ngày sinh không được để trống.")]
        public DateTime DateOfBirth { get; set; }

        [Required(ErrorMessage = "Giới tính không được để trống.")]
        [RegularExpression("^(Male|Female|Other)$",
            ErrorMessage = "Giới tính chỉ được là: Male, Female, Other.")]
        public string Gender { get; set; } = string.Empty;

        [Phone(ErrorMessage = "Số điện thoại không hợp lệ.")]
        [MaxLength(15, ErrorMessage = "Số điện thoại tối đa 15 ký tự.")]
        public string PhoneNumber { get; set; } = string.Empty;

        [MaxLength(250, ErrorMessage = "Địa chỉ tối đa 250 ký tự.")]
        public string Address { get; set; } = string.Empty;

        // Không [Required] vì tiền sử bệnh có thể để trống
        public string? MedicalHistory { get; set; }
    }
}