namespace CareFirstClinic.API.Services.Background
{
    public class AppointmentAutoCancelService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<AppointmentAutoCancelService> _logger;
        private static readonly TimeSpan Interval = TimeSpan.FromMinutes(5);

        public AppointmentAutoCancelService(
            IServiceScopeFactory scopeFactory,
            ILogger<AppointmentAutoCancelService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("AppointmentAutoCancelService đã khởi động.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var appointmentService = scope.ServiceProvider.GetRequiredService<IAppointmentService>();
                    await appointmentService.AutoCancelExpiredPendingAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi khi auto-cancel lịch hẹn pending quá hạn.");
                }

                await Task.Delay(Interval, stoppingToken);
            }
        }
    }
}
