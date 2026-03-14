using CareFirstClinic.API.Data;
using CareFirstClinic.API.DTOs;
using CareFirstClinic.API.Models;
using Microsoft.EntityFrameworkCore;
using CareFirstClinic.API.Repositories;
using System.Runtime.CompilerServices;

namespace CareFirstClinic.API.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IAppointmentRepository _appointmentRepo;
        private readonly ILogger<AppointmentService> _logger;

        public AppointmentService(IAppointmentRepository appointmentRepo, ILogger<AppointmentService> logger)
        {
            _appointmentRepo = appointmentRepo;
            _logger = logger;
        }
    }
}
