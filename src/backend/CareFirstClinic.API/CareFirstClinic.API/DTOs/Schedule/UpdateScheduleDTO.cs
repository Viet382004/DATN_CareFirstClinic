using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.DTOs
{
    public class UpdateScheduleDTO
    {
        [MaxLength(200)]
        public string? Note { get; set; }

        public bool IsAvailable { get; set; } = true;
    }
}