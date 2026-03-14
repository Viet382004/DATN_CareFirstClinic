namespace CareFirstClinic.API.Models
{
    public class PrescriptionDetail
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid PrescriptionId { get; set; }
        public Guid StockId { get; set; }
        public string Frequency { get; set; } = string.Empty;   // Tần suất: 2 lần/ngày
        public int DurationDays { get; set; }                    // Số ngày dùng
        public int Quantity { get; set; }                        // Số lượng xuất kho
        public string? Instructions { get; set; }                // Uống trước/sau ăn

        // Navigation
        public Prescription? Prescription { get; set; }
        public Stock? Stock { get; set; }
    }
}