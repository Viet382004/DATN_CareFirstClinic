namespace CareFirstClinic.API.Common
{
    public class ScheduleQueryParams : BaseQueryParams
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public Guid? DoctorId { get; set; }
        public bool? IsAvailable { get; set; }

        private DateTime? _fromDate;
        public DateTime? FromDate
        {
            get => _fromDate;
            set => _fromDate = value.HasValue
                ? DateTime.SpecifyKind(value.Value, DateTimeKind.Utc)
                : null;
        }

        private DateTime? _toDate;
        public DateTime? ToDate
        {
            get => _toDate;
            set => _toDate = value.HasValue
                ? DateTime.SpecifyKind(value.Value, DateTimeKind.Utc)
                : null;
        }

        public bool IsAscending { get; set; } = true;
        public new string SortBy { get; set; } = "workDate";

    }
}