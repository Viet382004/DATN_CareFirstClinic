namespace CareFirstClinic.API.Common
{
    public class AppointmentQueryParams : BaseQueryParams
    {
        public string? Status { get; set; }
        public Guid? PatientId { get; set; }
        public Guid? DoctorId { get; set; }
        public bool? Today { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }

        public new string SortBy { get; set; } = "workDate";

    }
}