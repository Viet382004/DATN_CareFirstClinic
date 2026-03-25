namespace CareFirstClinic.API.Common
{
    public class StockQueryParams : BaseQueryParams
    {
        public string? Name { get; set; }

        public string? MedicineCode { get; set; }

        public bool? IsLowStock { get; set; }

        public bool? IsActive { get; set; }

        public new string SortBy { get; set; } = "name";

    }
}