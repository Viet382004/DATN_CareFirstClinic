namespace CareFirstClinic.API.DTOs
{
    public class DoctorDTO
    {
        public Guid Id { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string SpecialtyName { get; set; } = string.Empty; // Lấy từ navigation Specialty

        public int YearsOfExperience { get; set; }

        public string PhoneNumber { get; set; } = string.Empty;

        public bool IsActive { get; set; }

        // Thông tin tài khoản liên kết
        public Guid? UserId { get; set; }
        public string? Email { get; set; }

        // Thống kê nhanh
        public int TotalAppointments { get; set; }
        public double AverageRating { get; set; }
    }
}