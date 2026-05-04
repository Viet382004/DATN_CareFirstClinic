using CareFirstClinic.API.Services.ScheduleSeeder;

namespace CareFirstClinic.API.Services.Background
{
    public class ScheduleBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ScheduleBackgroundService> _logger;

        public ScheduleBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<ScheduleBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("ScheduleBackgroundService started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();

                    var seeder = scope.ServiceProvider
                        .GetRequiredService<IScheduleSeeder>();

                    await seeder.SeedAsync();

                    _logger.LogInformation("Seed schedule success");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error while seeding schedule");
                }

                try
                {
                    await Task.Delay(TimeSpan.FromDays(1), stoppingToken);
                }
                catch (TaskCanceledException)
                {
                    _logger.LogInformation("ScheduleBackgroundService stopping...");
                    break;
                }
            }

            _logger.LogInformation("ScheduleBackgroundService stopped");
        }
    }
}