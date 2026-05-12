using CareFirstClinic.API.Models;

namespace CareFirstClinic.API.DTOs.Dashboard
{
    public class RevenueReportDTO
    {
        public decimal TotalRevenue { get; set; }
        public decimal PreviousPeriodRevenue { get; set; }
        public double GrowthRate { get; set; }
        public List<RevenueByDayDTO> RevenueByDay { get; set; } = new();
        public List<RevenueByTypeDTO> RevenueByType { get; set; } = new();
        public List<RevenueByMethodDTO> RevenueByMethod { get; set; } = new();
        public int TotalAppointments { get; set; }
        public int SuccessfulAppointments { get; set; }
    }

    public class RevenueByDayDTO
    {
        public string Date { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int Count { get; set; }
    }

    public class RevenueByTypeDTO
    {
        public string Type { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public double Percentage { get; set; }
    }

    public class RevenueByMethodDTO
    {
        public string Method { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public double Percentage { get; set; }
    }
}
