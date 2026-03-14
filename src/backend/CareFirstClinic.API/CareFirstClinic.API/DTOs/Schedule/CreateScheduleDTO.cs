using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.DTOs
{
    public class CreateScheduleDTO
    {
        [Required(ErrorMessage = "DoctorId không được để trống.")]
        public Guid DoctorId { get; set; }

        [Required(ErrorMessage = "Ngày làm việc không được để trống.")]
        public DateTime WorkDate { get; set; }

        [Required(ErrorMessage = "Giờ bắt đầu không được để trống.")]
        public TimeSpan StartTime { get; set; }

        [Required(ErrorMessage = "Giờ kết thúc không được để trống.")]
        public TimeSpan EndTime { get; set; }

        [Range(10, 120, ErrorMessage = "Thời gian mỗi slot phải từ 10 đến 120 phút.")]
        public int SlotDurationMinutes { get; set; } = 30;

        [MaxLength(200)]
        public string? Note { get; set; }
    }
}