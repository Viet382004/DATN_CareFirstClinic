using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.DTOs
{
    public class CancelAppointmentDTO
    {
        [Required(ErrorMessage = "Lý do hủy không được để trống.")]
        [MaxLength(500, ErrorMessage = "Lý do hủy tối đa 500 ký tự.")]
        public string CancelReason { get; set; } = string.Empty;
    }
}