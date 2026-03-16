using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.DTOs
{
    public class UpdateAppointmentDTO
    {
        [MaxLength(500)]
        public string? Reason { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }
    }
}