namespace CareFirstClinic.API.Common
{
    public class DoctorQueryParams : BaseQueryParams
    {
        public string? Name { get; set; }

        public Guid? SpecialtyId { get; set; }
        public new string SortBy { get; set; } = "name";

    }
}