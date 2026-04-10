using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.DTOs
{
    public class CreateAppointmentDTO
    {
        [Required(ErrorMessage = "TimeSlotId không được để trống.")]
        public Guid TimeSlotId { get; set; }

        [MaxLength(500, ErrorMessage = "Lý do khám tối đa 500 ký tự.")]
        public string? Reason { get; set; }

        [MaxLength(500, ErrorMessage = "Ghi chú tối đa 500 ký tự.")]
        public string? Notes { get; set; }

        // Fields to sync patient profile
        [Required(ErrorMessage = "Họ tên không được để trống.")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Ngày sinh không được để trống.")]
        public DateTime Dob { get; set; }

        [Required(ErrorMessage = "Giới tính không được để trống.")]
        public string Gender { get; set; } = string.Empty;

        [Required(ErrorMessage = "Số điện thoại không được để trống.")]
        public string Phone { get; set; } = string.Empty;

        public string? Email { get; set; }
    }
}