namespace CareFirstClinic.API.DTOs.Specialty
{
    public class SpecialtyDTO
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public bool IsActive { get; set; }

        // Thống kê nhanh
        public int TotalDoctors { get; set; } // Số bác sĩ thuộc chuyên khoa này
    }
}
