using CareFirstClinic.API.Data;
using CareFirstClinic.API.Services;

namespace CareFirstClinic.API.Repositories
{
    public class AppointmentRepository : IAppointmentRepository
    {
        private readonly CareFirstClinicDbContext _context;
        private readonly ILogger<AppointmentRepository> _logger;

        public AppointmentRepository(CareFirstClinicDbContext context,ILogger<AppointmentRepository> logger)
            {
                _context = context;
                _logger = logger;
        }
    }

}
