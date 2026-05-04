using CareFirstClinic.API.Data;
using CareFirstClinic.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CareFirstClinic.API.Repositories.ClinicalServiceRepo
{
    public class ServiceOrderRepository : IServiceOrderRepository
    {
        private readonly CareFirstClinicDbContext _context;

        public ServiceOrderRepository(CareFirstClinicDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ServiceOrder>> GetByAppointmentIdAsync(Guid appointmentId)
        {
            return await _context.ServiceOrders
                .Include(so => so.Service)
                .Include(so => so.LockedByDoctor)
                .Where(so => so.AppointmentId == appointmentId)
                .ToListAsync();
        }

        public async Task<ServiceOrder?> GetByIdAsync(Guid id)
        {
            return await _context.ServiceOrders
                .Include(so => so.Service)
                .Include(so => so.LockedByDoctor)
                .Include(so => so.Appointment)
                .FirstOrDefaultAsync(so => so.Id == id);
        }

        public async Task<IEnumerable<ServiceOrder>> GetPendingOrdersAsync(Guid? specialtyId = null)
        {
            var query = _context.ServiceOrders
                .Include(so => so.Service)
                .Include(so => so.Appointment)
                    .ThenInclude(a => a!.Patient)
                .Include(so => so.LockedByDoctor)
                .Where(so => so.Status != ServiceOrderStatus.Completed && so.Status != ServiceOrderStatus.Cancelled);

            if (specialtyId.HasValue)
            {
                query = query.Where(so => so.Service!.SpecialtyId == specialtyId.Value);
            }

            return await query
                .OrderBy(so => so.Appointment!.CreatedAt)
                .ToListAsync();
        }

        public async Task AddRangeAsync(IEnumerable<ServiceOrder> orders)
        {
            await _context.ServiceOrders.AddRangeAsync(orders);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(ServiceOrder order)
        {
            _context.ServiceOrders.Update(order);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> LockOrderAsync(Guid orderId, Guid doctorId)
        {
            var order = await _context.ServiceOrders.FindAsync(orderId);
            if (order == null) return false;

            // If already locked by someone else, return false
            if (order.LockedByDoctorId != null && order.LockedByDoctorId != doctorId)
                return false;

            order.LockedByDoctorId = doctorId;
            order.LockedAt = DateTime.UtcNow;
            order.Status = ServiceOrderStatus.InProgress;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UnlockOrderAsync(Guid orderId)
        {
            var order = await _context.ServiceOrders.FindAsync(orderId);
            if (order == null) return false;

            order.LockedByDoctorId = null;
            order.LockedAt = null;
            if (order.Status == ServiceOrderStatus.InProgress)
                order.Status = ServiceOrderStatus.Pending;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
