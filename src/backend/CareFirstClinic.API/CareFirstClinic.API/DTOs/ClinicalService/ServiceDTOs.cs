using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.DTOs.ClinicalService
{
    public class ServiceDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public List<ServiceFieldDTO> Fields { get; set; } = new();
    }

    public class ServiceFieldDTO
    {
        public Guid Id { get; set; }
        public string FieldName { get; set; } = string.Empty;
        public string? Unit { get; set; }
        public string DataType { get; set; } = "Text";
    }

    public class CreateServiceDTO
    {
        [Required(ErrorMessage = "Tên dịch vụ không được để trống")]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Range(0, 100000000, ErrorMessage = "Giá dịch vụ không hợp lệ")]
        public decimal Price { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn chuyên khoa")]
        public Guid? SpecialtyId { get; set; }
        
        public List<CreateServiceFieldDTO> Fields { get; set; } = new();
    }

    public class CreateServiceFieldDTO
    {
        [Required(ErrorMessage = "Tên chỉ số không được để trống")]
        [MaxLength(100)]
        public string FieldName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? Unit { get; set; }

        [MaxLength(50)]
        public string DataType { get; set; } = "Text";
    }

    public class ServiceOrderDTO
    {
        public Guid Id { get; set; }
        public Guid AppointmentId { get; set; }
        public Guid ServiceId { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public decimal PriceAtOrder { get; set; }
        public string Status { get; set; } = string.Empty;
        public Guid? LockedByDoctorId { get; set; }
        public string? LockedByDoctorName { get; set; }
        public DateTime? LockedAt { get; set; }
        public string? ResultData { get; set; }
        public string? PatientName { get; set; }
        public List<ServiceFieldDTO> ServiceFields { get; set; } = new();
    }

    public class CreateServiceOrderDTO
    {
        public Guid ServiceId { get; set; }
    }

    public class UpdateServiceOrderResultDTO
    {
        public string ResultData { get; set; } = string.Empty; // JSON
    }
}
