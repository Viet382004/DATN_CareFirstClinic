using CareFirstClinic.API.Data;
using CareFirstClinic.API.Models;
using Microsoft.EntityFrameworkCore;
using CareFirstClinic.API.Common;

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

        private IQueryable<Appointment> BaseQuery() =>
            _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.TimeSlot)
                    .ThenInclude(ts => ts.Schedule)
                        .ThenInclude(s => s.Doctor)
                            .ThenInclude(d => d.Specialty);

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

                var schedule = await _context.Schedules.FindAsync(slot.ScheduleId);
                if (schedule != null)
                {
                    schedule.AvailableSlots = Math.Max(0, schedule.AvailableSlots - 1);
                    _context.Schedules.Update(schedule);
                }

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

        public async Task<Appointment> CancelAsync(Appointment appointment, TimeSlot timeSlot)
        {
            ArgumentNullException.ThrowIfNull(appointment, nameof(appointment));
            ArgumentNullException.ThrowIfNull(timeSlot, nameof(timeSlot));

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Giải phóng TimeSlot
                var slot = await _context.TimeSlots.FindAsync(timeSlot.Id);
                if (slot != null)
                {
                    slot.IsBooked = false;
                    _context.TimeSlots.Update(slot);
                }

                // 2. Tăng lại AvailableSlots trong Schedule
                var schedule = await _context.Schedules.FindAsync(timeSlot.ScheduleId);
                if (schedule != null)
                {
                    schedule.AvailableSlots += 1;
                    // Đảm bảo schedule ở trạng thái IsAvailable nếu trước đó bị hết chỗ
                    schedule.IsAvailable = true;
                    _context.Schedules.Update(schedule);
                }

                // 3. Cập nhật trạng thái Appointment
                _context.Appointments.Update(appointment);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return appointment;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Lỗi khi hủy lịch hẹn và phục hồi slot: {Id}", appointment.Id);
                throw new InvalidOperationException("Không thể xử lý yêu cầu hủy lịch. Vui lòng thử lại.", ex);
            }
        }

        public async Task<(List<Appointment> Items, int Total)> GetPagedAsync(AppointmentQueryParams query)
        {
            var q = BaseQuery();

            // tìm kiếm (doctor name, specialty name, reason)
            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var s = query.Search.Trim().ToLower();
                q = q.Where(a => 
                    (a.TimeSlot != null && a.TimeSlot.Schedule != null && a.TimeSlot.Schedule.Doctor != null && a.TimeSlot.Schedule.Doctor.FullName.ToLower().Contains(s)) ||
                    (a.TimeSlot != null && a.TimeSlot.Schedule != null && a.TimeSlot.Schedule.Doctor != null && a.TimeSlot.Schedule.Doctor.Specialty != null && a.TimeSlot.Schedule.Doctor.Specialty.Name.ToLower().Contains(s)) ||
                    (a.Reason != null && a.Reason.ToLower().Contains(s))
                );
            }

            // lọc theo lịch hôm nay — ưu tiên hơn FromDate/ToDate
            if (query.Today == true)
            {
                var today = DateTime.UtcNow.Date;
                q = q.Where(a => a.TimeSlot != null &&
                                 a.TimeSlot.Schedule != null &&
                                 a.TimeSlot.Schedule.WorkDate.Date == today);
            }
            else
            {
                if (query.FromDate.HasValue)
                    q = q.Where(a => a.TimeSlot!.Schedule!.WorkDate.Date >= query.FromDate.Value.Date);

                if (query.ToDate.HasValue)
                    q = q.Where(a => a.TimeSlot!.Schedule!.WorkDate.Date <= query.ToDate.Value.Date);
            }

            // lọc theo trạng thái
            if (!string.IsNullOrWhiteSpace(query.Status) &&
                Enum.TryParse<AppointmentStatus>(query.Status, true, out var status))
                q = q.Where(a => a.Status == status);

            // lọc theo bệnh nhân
            if (query.PatientId.HasValue)
                q = q.Where(a => a.PatientId == query.PatientId.Value);

            // lọc theo bác sĩ (qua TimeSlot → Schedule)
            if (query.DoctorId.HasValue)
                q = q.Where(a => a.TimeSlot!.Schedule!.DoctorId == query.DoctorId.Value);

            var total = await q.CountAsync();

            // sort
            q = query.SortBy switch
            {
                "status" => query.IsAscending
                    ? q.OrderBy(a => a.Status)
                    : q.OrderByDescending(a => a.Status),
                _ => query.IsAscending  // mặc định sort theo workDate + giờ khám
                    ? q.OrderBy(a => a.TimeSlot!.Schedule!.WorkDate)
                        .ThenBy(a => a.TimeSlot!.StartTime)
                    : q.OrderByDescending(a => a.TimeSlot!.Schedule!.WorkDate)
                        .ThenByDescending(a => a.TimeSlot!.StartTime)
            };

            var items = await q
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            return (items, total);
        }
    }

}
