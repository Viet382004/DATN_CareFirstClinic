namespace CareFirstClinic.API.DTOs
{
    public class DoctorDTO
    {
        public Guid Id { get; set; }
        public string? AvatarUrl { get; set; }


        public string FullName { get; set; } = string.Empty;

        public string SpecialtyName { get; set; } = string.Empty;
        public string AcademicTitle { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public int YearsOfExperience { get; set; }

        public string PhoneNumber { get; set; } = string.Empty;

        public bool IsActive { get; set; }

        public Guid? UserId { get; set; }
        public string? Email { get; set; }

        public int TotalAppointments { get; set; }
        public double AverageRating { get; set; }
    }
}