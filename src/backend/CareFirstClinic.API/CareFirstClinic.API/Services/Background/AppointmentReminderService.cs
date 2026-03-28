using CareFirstClinic.API.Data;
using CareFirstClinic.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CareFirstClinic.API.Services.Background
{
    /// <summary>
    /// Chạy ngầm mỗi ngày lúc 8:00 sáng
    /// Tìm tất cả lịch hẹn ngày mai và gửi email nhắc nhở
    /// </summary>
    public class AppointmentReminderService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<AppointmentReminderService> _logger;

        // Chạy lúc 8:00 sáng mỗi ngày
        private readonly TimeSpan _runAt = new TimeSpan(8, 0, 0);

        public AppointmentReminderService(
            IServiceScopeFactory scopeFactory,
            ILogger<AppointmentReminderService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger       = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("AppointmentReminderService đã khởi động.");

            while (!stoppingToken.IsCancellationRequested)
            {
                // Tính thời gian delay đến 8:00 sáng hôm sau
                var now       = DateTime.Now;
                var nextRun   = DateTime.Today.Add(_runAt);
                if (now > nextRun)
                    nextRun = nextRun.AddDays(1);

                var delay = nextRun - now;
                _logger.LogInformation("Nhắc lịch sẽ chạy lúc {Time}", nextRun);

                await Task.Delay(delay, stoppingToken);

                if (!stoppingToken.IsCancellationRequested)
                    await SendRemindersAsync(stoppingToken);
            }
        }

        private async Task SendRemindersAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Đang gửi email nhắc lịch khám...");

            // Dùng scope vì DbContext và IEmailService là Scoped
            using var scope       = _scopeFactory.CreateScope();
            var context           = scope.ServiceProvider.GetRequiredService<CareFirstClinicDbContext>();
            var emailService      = scope.ServiceProvider.GetRequiredService<IEmailService>();

            try
            {
                var tomorrow = DateTime.UtcNow.Date.AddDays(1);

                // Lấy tất cả lịch hẹn ngày mai đã Confirmed
                var appointments = await context.Appointments
                    .Include(a => a.Patient).ThenInclude(p => p!.User)
                    .Include(a => a.TimeSlot)
                        .ThenInclude(ts => ts!.Schedule)
                            .ThenInclude(s => s!.Doctor)
                                .ThenInclude(d => d!.Specialty)
                    .Where(a => a.Status == AppointmentStatus.Confirmed
                             && a.TimeSlot != null
                             && a.TimeSlot.Schedule != null
                             && a.TimeSlot.Schedule.WorkDate.Date == tomorrow)
                    .ToListAsync(stoppingToken);

                _logger.LogInformation("Tìm thấy {Count} lịch hẹn cần nhắc.", appointments.Count);

                foreach (var appointment in appointments)
                {
                    // Lấy email từ User của Patient
                    var email       = appointment.Patient?.User?.Email;
                    var patientName = appointment.Patient?.FullName;
                    var doctorName  = appointment.TimeSlot?.Schedule?.Doctor?.FullName;
                    var specialty   = appointment.TimeSlot?.Schedule?.Doctor?.Specialty?.Name;
                    var workDate    = appointment.TimeSlot!.Schedule!.WorkDate;
                    var startTime   = appointment.TimeSlot.StartTime;
                    var endTime     = appointment.TimeSlot.EndTime;

                    if (string.IsNullOrWhiteSpace(email)) continue;

                    await emailService.SendAppointmentReminderAsync(
                        email, patientName!, doctorName!, specialty!,
                        workDate, startTime, endTime);
                }

                _logger.LogInformation("Đã gửi xong email nhắc lịch.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gửi email nhắc lịch.");
            }
        }
    }
}