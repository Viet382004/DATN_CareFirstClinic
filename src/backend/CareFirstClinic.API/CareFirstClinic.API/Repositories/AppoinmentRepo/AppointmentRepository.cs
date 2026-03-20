using CareFirstClinic.API.Data;
using CareFirstClinic.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CareFirstClinic.API.Repositories.AppoinmentRepo
{
    public class AppointmentRepository : IAppointmentRepository
    {
        private readonly CareFirstClinicDbContext _context;
        private readonly ILogger<AppointmentRepository> _logger;

        public AppointmentRepository(CareFirstClinicDbContext context, ILogger<AppointmentRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Hàm Include dùng chung - tránh lặp code
        private IQueryable<Appointment> BaseQuery() =>
            _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.TimeSlot)
                    .ThenInclude(ts => ts.Schedule)
                        .ThenInclude(s => s.Doctor)
                            .ThenInclude(d => d.Specialty);

        // GET ALL
        public async Task<List<Appointment>> GetAllAsync()
        {
            try
            {
                return await BaseQuery()
                    .OrderByDescending(a => a.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách appoinment");
                throw;
            }
        }

        // GET BY ID
        public async Task<Appointment?> GetByIdAsync(Guid id)
        {
            if(id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));

            try
            {
                return await BaseQuery()
                    .FirstOrDefaultAsync(a => a.Id == id);
            }
            catch(ArgumentException) 
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy appointment theo id: {Id}", id);
                throw;
            }
        }

        //GET BY PATIENT ID
        public async Task<List<Appointment>> GetByPatientIdAsync(Guid patientId)
        {
            if (patientId == Guid.Empty)
                throw new ArgumentException("PatientId không được để trống.", nameof(patientId));

            try
            {
                return await BaseQuery()
                    .Where(a => a.PatientId == patientId)
                    .OrderByDescending(a => a.CreatedAt)
                    .ToListAsync();
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách appointment theo patientId: {PatientId}", patientId);
                throw;
            }
        }

        // GET BY DOCTOR ID
        public async Task<List<Appointment>> GetByDoctorIdAsync(Guid doctorId)
        {
            if(doctorId == Guid.Empty)
                throw new ArgumentException("DoctorId không được để trống.", nameof(doctorId));

            try
            {
                return await BaseQuery()
                    .Where(a => a.TimeSlot != null &&
                                a.TimeSlot.Schedule != null &&
                                a.TimeSlot.Schedule.DoctorId == doctorId)
                    .OrderByDescending(a => a.CreatedAt)
                    .ToListAsync();
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách appointment theo doctorId: {DoctorId}", doctorId);
                throw;
            }
        }

        // ADD
        // Nhận timeslot để update IsBooked trong cùng 1 transaction,
        // tránh trường hợp tạo appointment thành công nhưng update timeslot bị lỗi
        // => timeslot vẫn bị khóa nhưng không có appointment nào
        public async Task<Appointment> AddAsync(Appointment appointment, TimeSlot timeSlot)
        {
            ArgumentNullException.ThrowIfNull(appointment, nameof(appointment));
            ArgumentNullException.ThrowIfNull(timeSlot, nameof(timeSlot));

            //Dùng transaction - Tạo Appoinment và đánh dấu slot đã được đặt là 1 atomic aperation
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                //Re-check slot trong transaction để tránh race condition
                var slot = await _context.TimeSlots
                    .FirstOrDefaultAsync(ts => ts.Id == timeSlot.Id);

                if (slot == null)
                    throw new KeyNotFoundException($"Không tìm thấy TimeSlot với id: {timeSlot.Id}");

                if (slot.IsBooked)
                    throw new InvalidOperationException("TimeSlot đã được đặt. Vui lòng chọn slot khác.");

                slot.IsBooked = true;
                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return appointment;
            }
            catch(KeyNotFoundException) 
            {
                await transaction.RollbackAsync();
                throw;
            }
            catch(InvalidOperationException) 
            {
                await transaction.RollbackAsync();
                throw;
            }
            catch (DbUpdateException ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Lỗi DB khi thêm appointment mới.");
                throw new InvalidOperationException("Không thể tạo lịch hẹn , vui lòng thử lại.", ex);
            }
            catch (Exception ex)
            {
                 await transaction.RollbackAsync();
                 _logger.LogError(ex, "Lỗi không xác định khi thêm appointment mới.");
                 throw new ApplicationException("Đã xảy ra lỗi khi tạo lịch hẹn.", ex);
            }
        }

        // UPDATE
        public async Task<Appointment> UpdateAsync(Appointment appointment)
        {
            ArgumentNullException.ThrowIfNull(appointment, nameof(appointment));
            
            var exists = await _context.Appointments
                .AnyAsync(a => a.Id == appointment.Id);

            if (!exists)
                throw new KeyNotFoundException($"Không tìm thấy appointment với id: {appointment.Id}");
            try
            {
                _context.Appointments.Update(appointment);
                await _context.SaveChangesAsync();
                return appointment;
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, "Xung đột dữ liệu khi cập nhật appointment Id: {Id}", appointment.Id);
                throw new InvalidOperationException("Dữ liệu đã bị thay đổi bởi người khác. Vui lòng tải lại.", ex);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi DB khi cập nhật appointment Id: {Id}", appointment.Id);
                throw new InvalidOperationException("Không thể cập nhật lịch hẹn. Vui lòng thử lại.", ex);
            }
        }
    }

}
