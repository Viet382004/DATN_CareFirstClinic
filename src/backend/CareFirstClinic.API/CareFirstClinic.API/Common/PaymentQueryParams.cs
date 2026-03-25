namespace CareFirstClinic.API.Common
{
    public class PaymentQueryParams : BaseQueryParams
    {
        public Guid? PatientId { get; set; }
        public string? Status { get; set; }
        public string? Method { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public new string SortBy { get; set; } = "createdAt";

    }
}