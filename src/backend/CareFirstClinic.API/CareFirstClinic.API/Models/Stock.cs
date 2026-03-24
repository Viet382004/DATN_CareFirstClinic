namespace CareFirstClinic.API.Models
{
    public class Stock
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public string MedicineName { get; set; } = string.Empty;
        public string? MedicineCode { get; set; }       
        public string? Unit { get; set; }               
        public string? Manufacturer { get; set; }      

        public int Quantity { get; set; }               
        public int MinQuantity { get; set; } = 10;      
        public decimal UnitPrice { get; set; }          

        public bool IsActive { get; set; } = true;

        // Navigation
        public ICollection<PrescriptionDetail> PrescriptionDetails { get; set; }
            = new List<PrescriptionDetail>();
    }
}