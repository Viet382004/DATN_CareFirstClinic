using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.DTOs.Auth
{
    public class RegisterDTO
    {

        [Required(ErrorMessage = "Mật khẩu không được để trống.")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự.")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email không được để trống.")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Họ tên không được để trống.")]
        [MaxLength(100, ErrorMessage = "Họ tên tối đa 100 ký tự.")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Ngày sinh không được để trống.")]
        public DateTime DateOfBirth { get; set; }

        [Required(ErrorMessage = "Giới tính không được để trống.")]
        [MaxLength(10, ErrorMessage = "Giới tính tối đa 10 ký tự.")]
        public string Gender { get; set; } = string.Empty;

        [Required(ErrorMessage = "Số điện thoại không được để trống.")]
        [Phone(ErrorMessage = "Số điện thoại không hợp lệ.")]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "Địa chỉ không được để trống.")]
        public string Address { get; set; } = string.Empty;

        // RoleId đã bị xóa — server tự gán role Patient để tránh leo thang đặc quyền
    }
}