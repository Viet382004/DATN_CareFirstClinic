using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.DTOs
{
    public class VerifyOtpDTO
    {
        [Required(ErrorMessage = "Email không được để trống.")]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mã OTP không được để trống.")]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "Mã OTP phải đúng 6 số.")]
        [RegularExpression(@"^\d{6}$", ErrorMessage = "Mã OTP chỉ gồm 6 chữ số.")]
        public string OtpCode { get; set; } = string.Empty;
    }

    public class ResendOtpDTO
    {
        [Required(ErrorMessage = "Email không được để trống.")]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}