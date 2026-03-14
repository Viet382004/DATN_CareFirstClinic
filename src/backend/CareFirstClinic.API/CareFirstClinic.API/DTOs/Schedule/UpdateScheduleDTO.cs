using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.DTOs
{
    public class UpdateScheduleDTO
    {
        [Required(ErrorMessage = "Ngày làm việc không được để trống.")]
        public DateTime WorkDate { get; set; }

        [Required(ErrorMessage = "Giờ bắt đầu không được để trống.")]
        public TimeSpan StartTime { get; set; }

        [Required(ErrorMessage = "Giờ kết thúc không được để trống.")]
        public TimeSpan EndTime { get; set; }

        [MaxLength(200)]
        public string? Note { get; set; }

        public bool IsAvailable { get; set; } = true;
    }
}