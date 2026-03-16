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
    }
}