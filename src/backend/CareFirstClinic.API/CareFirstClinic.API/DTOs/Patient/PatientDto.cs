namespace CareFirstClinic.API.DTOs
{
    public class PatientDTO
    {
        public Guid Id { get; set; }
        public string? AvatarUrl { get; set; }


        public string FullName { get; set; } = string.Empty;

        public DateTime DateOfBirth { get; set; }

        public int Age => DateOfBirth == default
            ? 0
            : DateTime.UtcNow.Year - DateOfBirth.Year
              - (DateTime.UtcNow.DayOfYear < DateOfBirth.DayOfYear ? 1 : 0);

        public string Gender { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public string? MedicalHistory { get; set; }

        public DateTime CreatedAt { get; set; }

        public Guid? UserId { get; set; }
        public string? UserEmail { get; set; }
    }
}