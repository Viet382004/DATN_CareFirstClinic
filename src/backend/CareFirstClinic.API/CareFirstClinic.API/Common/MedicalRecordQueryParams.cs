namespace CareFirstClinic.API.Common
{
    public class MedicalRecordQueryParams : BaseQueryParams
    {
        public Guid? PatientId { get; set; }

        public Guid? DoctorId { get; set; }

        public string? Diagnosis { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public bool? HasFollowUp { get; set; }
        public new string SortBy { get; set; } = "createdAt";
    }
}