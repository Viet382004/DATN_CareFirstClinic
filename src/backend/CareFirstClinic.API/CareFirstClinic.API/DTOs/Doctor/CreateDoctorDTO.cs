using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.DTOs
{
    public class CreateDoctorDTO
    {
        [Required(ErrorMessage = "Họ tên không được để trống.")]
        [MaxLength(100, ErrorMessage = "Họ tên tối đa 100 ký tự.")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Chuyên khoa không được để trống.")]
        public Guid SpecialtyId { get; set; }

        [Required(ErrorMessage = "Trình độ không được để trống.")]
        public string AcademicTitle { get; set; }

        [Required(ErrorMessage = "Vị trí không được để trống.")]
        public string Position { get; set; }

        public string Description { get; set; }

        [Range(0, 60, ErrorMessage = "Số năm kinh nghiệm phải từ 0 đến 60.")]
        public int YearsOfExperience { get; set; }

        [Phone(ErrorMessage = "Số điện thoại không hợp lệ.")]
        [MaxLength(15, ErrorMessage = "Số điện thoại tối đa 15 ký tự.")]
        public string PhoneNumber { get; set; } = string.Empty;


        public Guid? UserId { get; set; }

        [Required(ErrorMessage = "Email không được để trống.")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tên đăng nhập không được để trống.")]
        [MaxLength(50)]
        public string UserName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu không được để trống.")]
        public string Password { get; set; } = string.Empty;
    }
}