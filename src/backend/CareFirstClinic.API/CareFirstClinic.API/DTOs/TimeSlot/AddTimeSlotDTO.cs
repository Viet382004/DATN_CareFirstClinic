using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.DTOs.TimeSlot
{
    public class AddTimeSlotDTO
    {
        [Required(ErrorMessage = "Giờ bắt đầu không được để trống.")]
        public TimeSpan StartTime { get; set; }

        [Required(ErrorMessage = "Giờ kết thúc không được để trống.")]
        public TimeSpan EndTime { get; set; }
    }
}
