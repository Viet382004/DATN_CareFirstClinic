using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.DTOs
{
    public class UpdateScheduleDTO
    {
        [Required(ErrorMessage = "Giờ bắt đầu không được để trống.")]
        public TimeSpan StartTime { get; set; }

        [Required(ErrorMessage = "Giờ kết thúc không được để trống.")]
        public TimeSpan EndTime { get; set; }

        [Range(10, 120, ErrorMessage = "Thời gian mỗi slot phải từ 10 đến 120 phút.")]
        public int SlotDurationMinutes { get; set; } = 30;

        public bool IsAvailable { get; set; } = true;

        [MaxLength(200)]
        public string? Note { get; set; }
    }
}