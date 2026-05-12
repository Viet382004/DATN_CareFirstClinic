using CareFirstClinic.API.Data;
using CareFirstClinic.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CareFirstClinic.API.DTOs.Dashboard;

namespace CareFirstClinic.API.Controllers
{
    [Authorize(Roles = "Admin,SystemAdmin")]
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly CareFirstClinicDbContext _context;

        public DashboardController(CareFirstClinicDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            try
            {
                // ⭐ Đảm bảo DateTime có Kind = UTC
                var today = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc);
                var firstDayOfMonth = DateTime.SpecifyKind(new DateTime(today.Year, today.Month, 1), DateTimeKind.Utc);

                // 1. Tổng bệnh nhân
                var totalPatients = await _context.Patients.CountAsync();

                // 2. Lịch hẹn hôm nay
                var todayAppointments = await _context.Appointments
                    .Include(a => a.TimeSlot)
                        .ThenInclude(ts => ts.Schedule)
                    .Where(a => a.TimeSlot != null && a.TimeSlot.Schedule != null && a.TimeSlot.Schedule.WorkDate.Date == today)
                    .CountAsync();

                // 3. Doanh thu tháng hiện tại
                var monthlyRevenue = await _context.Payments
                    .Where(p => p.Status == PaymentStatus.Completed && p.PaidAt >= firstDayOfMonth)
                    .SumAsync(p => (decimal?)p.Amount) ?? 0;

                // 4. Tỉ lệ hoàn thành
                var monthlyAppointments = await _context.Appointments
                    .Include(a => a.TimeSlot)
                        .ThenInclude(ts => ts.Schedule)
                    .Where(a => a.TimeSlot != null && a.TimeSlot.Schedule != null && a.TimeSlot.Schedule.WorkDate.Date >= firstDayOfMonth)
                    .ToListAsync();

                var completedCount = monthlyAppointments.Count(a => a.Status == AppointmentStatus.Completed);
                var totalMonthlyCount = monthlyAppointments.Count;
                var completionRate = totalMonthlyCount > 0 ? (double)completedCount / totalMonthlyCount * 100 : 0;

                // 5. Thống kê nhanh theo trạng thái
                var statsToday = await _context.Appointments
                    .Include(a => a.TimeSlot)
                        .ThenInclude(ts => ts.Schedule)
                    .Where(a => a.TimeSlot != null && a.TimeSlot.Schedule != null && a.TimeSlot.Schedule.WorkDate.Date == today)
                    .GroupBy(a => a.Status)
                    .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
                    .ToListAsync();

                return Ok(new
                {
                    TotalPatients = totalPatients,
                    TodayAppointments = todayAppointments,
                    MonthlyRevenue = monthlyRevenue,
                    CompletionRate = Math.Round(completionRate, 1),
                    StatsToday = statsToday
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message, detail = ex.InnerException?.Message });
            }
        }

        [HttpGet("charts")]
        public async Task<IActionResult> GetCharts()
        {
            try
            {
                // ⭐ Đảm bảo DateTime có Kind = UTC
                var today = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc);
                var sevenDaysAgo = DateTime.SpecifyKind(today.AddDays(-6), DateTimeKind.Utc);

                // Thống kê lịch hẹn theo ngày (7 ngày qua)
                var appointmentsData = await _context.Appointments
                    .Include(a => a.TimeSlot)
                        .ThenInclude(ts => ts.Schedule)
                    .Where(a => a.TimeSlot != null && a.TimeSlot.Schedule != null && a.TimeSlot.Schedule.WorkDate.Date >= sevenDaysAgo && a.TimeSlot.Schedule.WorkDate.Date <= today)
                    .GroupBy(a => a.TimeSlot!.Schedule!.WorkDate.Date)
                    .Select(g => new
                    {
                        Date = g.Key,
                        Count = g.Count()
                    })
                    .OrderBy(x => x.Date)
                    .ToListAsync();

                // Thống kê doanh thu theo ngày (7 ngày qua)
                var revenueData = await _context.Payments
                    .Where(p => p.Status == PaymentStatus.Completed && p.PaidAt >= sevenDaysAgo)
                    .GroupBy(p => p.PaidAt!.Value.Date)
                    .Select(g => new
                    {
                        Date = g.Key,
                        Amount = g.Sum(p => p.Amount)
                    })
                    .OrderBy(x => x.Date)
                    .ToListAsync();

                // Format lại data cho Recharts
                var result = new List<object>();
                for (var i = 0; i < 7; i++)
                {
                    var date = sevenDaysAgo.AddDays(i);
                    var appCount = appointmentsData.FirstOrDefault(x => x.Date == date)?.Count ?? 0;
                    var revAmount = revenueData.FirstOrDefault(x => x.Date == date)?.Amount ?? 0;

                    result.Add(new
                    {
                        Name = date.ToString("dd/MM"),
                        Appointments = appCount,
                        Revenue = revAmount / 1000000 // Chuyển sang triệu VNĐ
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message, detail = ex.InnerException?.Message });
            }
        }

        [HttpGet("revenue-report")]
        public async Task<IActionResult> GetRevenueReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            try
            {
                var end = endDate ?? DateTime.UtcNow;
                var start = startDate ?? end.AddDays(-30);
                
                // Đảm bảo UTC
                start = DateTime.SpecifyKind(start.Date, DateTimeKind.Utc);
                end = DateTime.SpecifyKind(end.Date.AddDays(1).AddTicks(-1), DateTimeKind.Utc);

                var periodDuration = end - start;
                var previousStart = start.Add(-periodDuration);
                var previousEnd = start.AddTicks(-1);

                // 1. Lấy tất cả payment trong kỳ và kỳ trước
                var allPayments = await _context.Payments
                    .Where(p => p.Status == PaymentStatus.Completed && p.PaidAt >= previousStart && p.PaidAt <= end)
                    .ToListAsync();

                var currentPayments = allPayments.Where(p => p.PaidAt >= start && p.PaidAt <= end).ToList();
                var previousPayments = allPayments.Where(p => p.PaidAt >= previousStart && p.PaidAt <= previousEnd).ToList();

                var totalRevenue = currentPayments.Sum(p => p.Amount);
                var previousRevenue = previousPayments.Sum(p => p.Amount);
                var growthRate = previousRevenue > 0 ? (double)((totalRevenue - previousRevenue) / previousRevenue * 100) : 0;

                // 2. Thống kê theo ngày
                var revenueByDay = currentPayments
                    .GroupBy(p => p.PaidAt!.Value.Date)
                    .Select(g => new RevenueByDayDTO
                    {
                        Date = g.Key.ToString("yyyy-MM-dd"),
                        Amount = g.Sum(p => p.Amount),
                        Count = g.Count()
                    })
                    .OrderBy(x => x.Date)
                    .ToList();

                // 3. Thống kê theo loại (Type)
                var revenueByType = currentPayments
                    .GroupBy(p => p.Type)
                    .Select(g => new RevenueByTypeDTO
                    {
                        Type = g.Key.ToString(),
                        Amount = g.Sum(p => p.Amount),
                        Percentage = totalRevenue > 0 ? (double)(g.Sum(p => p.Amount) / totalRevenue * 100) : 0
                    })
                    .ToList();

                // 4. Thống kê theo phương thức (Method)
                var revenueByMethod = currentPayments
                    .GroupBy(p => p.Method)
                    .Select(g => new RevenueByMethodDTO
                    {
                        Method = g.Key.ToString(),
                        Amount = g.Sum(p => p.Amount),
                        Percentage = totalRevenue > 0 ? (double)(g.Sum(p => p.Amount) / totalRevenue * 100) : 0
                    })
                    .ToList();

                // 5. Thống kê lịch hẹn trong kỳ
                var appointments = await _context.Appointments
                    .Include(a => a.TimeSlot)
                        .ThenInclude(ts => ts.Schedule)
                    .Where(a => a.CreatedAt >= start && a.CreatedAt <= end)
                    .ToListAsync();

                return Ok(new RevenueReportDTO
                {
                    TotalRevenue = totalRevenue,
                    PreviousPeriodRevenue = previousRevenue,
                    GrowthRate = Math.Round(growthRate, 2),
                    RevenueByDay = revenueByDay,
                    RevenueByType = revenueByType,
                    RevenueByMethod = revenueByMethod,
                    TotalAppointments = appointments.Count,
                    SuccessfulAppointments = appointments.Count(a => a.Status == AppointmentStatus.Completed)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message, detail = ex.InnerException?.Message });
            }
        }
    }
}