namespace CareFirstClinic.API.DTOs
{
    public class CreatePatientDTO
    {
        public Guid UserId { get; set; }
        public string FullName { get; set; } = null!;
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = null!;
        public string? PhoneNumber { get; set; } = null!;
        public string? Address { get; set; } = null!;
        public string? MedicalHistory { get; set; } = null!;
        public string? Email { get; set; }
         public string? Password { get; set; }


    }
}
