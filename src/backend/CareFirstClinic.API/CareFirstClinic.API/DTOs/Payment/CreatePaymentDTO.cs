using CareFirstClinic.API.Models;
using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.DTOs
{
    public class CreatePaymentDTO
    {
        [Required(ErrorMessage = "AppointmentId không được để trống.")]
        public Guid AppointmentId { get; set; }

        [Required(ErrorMessage = "Số tiền không được để trống.")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Số tiền phải lớn hơn 0.")]
        public decimal Amount { get; set; }
        public Guid? PatientId { get; set; }

        [Required(ErrorMessage = "Phương thức thanh toán không được để trống.")]
        public string Method { get; set; } = "Cash";
        public PaymentType Type { get; set; } = PaymentType.ConsultationFee;
        [MaxLength(200)]
        public string? Notes { get; set; }
    }
}