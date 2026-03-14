namespace CareFirstClinic.API.Models
{
    public class Stock
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public string MedicineName { get; set; } = string.Empty;
        public string? MedicineCode { get; set; }       // Mã thuốc
        public string? Unit { get; set; }               // Đơn vị: viên, ml, gói
        public string? Manufacturer { get; set; }       // Nhà sản xuất

        public int Quantity { get; set; }               // Tồn kho hiện tại
        public int MinQuantity { get; set; } = 10;      // Ngưỡng cảnh báo hết hàng
        public decimal UnitPrice { get; set; }          // Giá hiện tại

        public bool IsActive { get; set; } = true;

        // Navigation
        public ICollection<PrescriptionDetail> PrescriptionDetails { get; set; }
            = new List<PrescriptionDetail>();
    }
}