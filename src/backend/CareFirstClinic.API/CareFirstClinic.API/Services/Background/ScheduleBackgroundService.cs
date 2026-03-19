using CareFirstClinic.API.Services.ScheduleSeeder;

namespace CareFirstClinic.API.Services.Background
{
    public class ScheduleBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;

        public ScheduleBackgroundService(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = _serviceProvider.CreateScope();

                var seeder = scope.ServiceProvider
                    .GetRequiredService<IScheduleSeeder>();

                await seeder.SeedAsync();

                await Task.Delay(TimeSpan.FromDays(1), stoppingToken);
            }
        }
    }
}
