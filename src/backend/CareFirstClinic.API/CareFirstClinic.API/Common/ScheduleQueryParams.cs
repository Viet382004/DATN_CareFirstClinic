namespace CareFirstClinic.API.Common
{
    public class ScheduleQueryParams : BaseQueryParams
    {
        public Guid? DoctorId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public bool? IsAvailable { get; set; }
        public new string SortBy { get; set; } = "workDate";

    }
}