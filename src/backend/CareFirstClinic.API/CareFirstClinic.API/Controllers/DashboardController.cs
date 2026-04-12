using CareFirstClinic.API.Data;
using CareFirstClinic.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
            var today = DateTime.UtcNow.Date;
            
            // 1. Tổng bệnh nhân
            var totalPatients = await _context.Patients.CountAsync();

            // 2. Lịch hẹn hôm nay
            var todayAppointments = await _context.Appointments
                .Include(a => a.TimeSlot)
                    .ThenInclude(ts => ts.Schedule)
                .CountAsync(a => a.TimeSlot!.Schedule!.WorkDate.Date == today);

            // 3. Doanh thu tháng hiện tại
            var firstDayOfMonth = new DateTime(today.Year, today.Month, 1);
            var monthlyRevenue = await _context.Payments
                .Where(p => p.Status == PaymentStatus.Completed && p.PaidAt >= firstDayOfMonth)
                .SumAsync(p => p.Amount);

            // 4. Tỉ lệ hoàn thành (Completed / Total của tháng này)
            var monthlyAppointments = await _context.Appointments
                .Include(a => a.TimeSlot)
                    .ThenInclude(ts => ts.Schedule)
                .Where(a => a.TimeSlot!.Schedule!.WorkDate.Date >= firstDayOfMonth)
                .ToListAsync();

            var completedCount = monthlyAppointments.Count(a => a.Status == AppointmentStatus.Completed);
            var totalMonthlyCount = monthlyAppointments.Count;
            var completionRate = totalMonthlyCount > 0 ? (double)completedCount / totalMonthlyCount * 100 : 0;

            // 5. Thống kê nhanh theo trạng thái (cho Today)
            var statsToday = await _context.Appointments
                 .Include(a => a.TimeSlot)
                     .ThenInclude(ts => ts.Schedule)
                 .Where(a => a.TimeSlot!.Schedule!.WorkDate.Date == today)
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

        [HttpGet("charts")]
        public async Task<IActionResult> GetCharts()
        {
            var today = DateTime.UtcNow.Date;
            var sevenDaysAgo = today.AddDays(-6);

            // Thống kê lịch hẹn theo ngày (7 ngày qua)
            var appointmentsData = await _context.Appointments
                .Include(a => a.TimeSlot)
                    .ThenInclude(ts => ts.Schedule)
                .Where(a => a.TimeSlot!.Schedule!.WorkDate.Date >= sevenDaysAgo && a.TimeSlot!.Schedule!.WorkDate.Date <= today)
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
                    Revenue = revAmount / 1000000 // Chuyển sang triệu VNĐ cho dễ nhìn trên biểu đồ
                });
            }

            return Ok(result);
        }
    }
}
