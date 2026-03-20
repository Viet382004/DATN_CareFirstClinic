namespace CareFirstClinic.API.DTOs
{
    public class StockDTO
    {
        public Guid Id { get; set; }
        public string MedicineName { get; set; } = string.Empty;
        public string? MedicineCode { get; set; }
        public string? Unit { get; set; }
        public string? Manufacturer { get; set; }
        public int Quantity { get; set; }
        public int MinQuantity { get; set; }
        public decimal UnitPrice { get; set; }
        public bool IsActive { get; set; }
        // Cảnh báo sắp hết hàng
        public bool IsLowStock => Quantity <= MinQuantity;
    }
}