namespace CareFirstClinic.API.DTOs
{
    public class PrescriptionDTO
    {
        public Guid Id { get; set; }
        public Guid MedicalRecordId { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public DateTime IssuedAt { get; set; }
        public List<PrescriptionDetailDTO> Details { get; set; } = new();
    }

    public class PrescriptionDetailDTO
    {
        public Guid Id { get; set; }
        public Guid StockId { get; set; }
        public string MedicineName { get; set; } = string.Empty;
        public string? MedicineCode { get; set; }
        public string? Unit { get; set; }
        public string Frequency { get; set; } = string.Empty;
        public int DurationDays { get; set; }
        public int Quantity { get; set; }
        public string? Instructions { get; set; }
        public decimal UnitPrice { get; set; }          
        public decimal TotalPrice => UnitPrice * Quantity;
    }
}