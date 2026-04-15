using CareFirstClinic.API.Models;
using CareFirstClinic.API.Repositories.DoctorRepo;
using CareFirstClinic.API.Repositories.ScheduleRepo;
using CareFirstClinic.API.Services.ScheduleSeeder;

public class ScheduleSeeder : IScheduleSeeder
{
    private readonly IScheduleRepository _scheduleRepo;
    private readonly IDoctorRepository _doctorRepo;
    private readonly ILogger<ScheduleSeeder> _logger;

    public ScheduleSeeder(
        IScheduleRepository scheduleRepo,
        IDoctorRepository doctorRepo,
        ILogger<ScheduleSeeder> logger)
    {
        _scheduleRepo = scheduleRepo;
        _doctorRepo = doctorRepo;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        var today = DateTime.UtcNow.Date;

        var maxDate = await _scheduleRepo.GetMaxDateAsync();

        DateTime startDate = maxDate == null
            ? today
            : maxDate.Value.AddDays(1);

        var endDate = today.AddMonths(3);

        if (maxDate != null && maxDate >= endDate)
        {
            _logger.LogInformation("Schedule đã đủ 3 tháng, skip seed.");
            return;
        }

        var doctors = await _doctorRepo.GetAllAsync();

        var schedules = new List<Schedule>();
        var timeSlots = new List<TimeSlot>();

        foreach (var doctor in doctors)
        {
            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                // Bỏ qua ngày làm chủ nhật
                if (date.DayOfWeek == DayOfWeek.Sunday)
                    continue;

                //  CA SÁNG 
                CreateScheduleWithSlots(
                    doctor.Id,
                    date,
                    new TimeSpan(8, 0, 0),
                    new TimeSpan(11, 30, 0),
                    schedules,
                    timeSlots
                );

                //  CA CHIỀU 
                CreateScheduleWithSlots(
                    doctor.Id,
                    date,
                    new TimeSpan(13, 30, 0),
                    new TimeSpan(17, 0, 0),
                    schedules,
                    timeSlots
                );
                //  CA TỐI
                CreateScheduleWithSlots(
                    doctor.Id,
                    date,
                    new TimeSpan(18, 30, 0),
                    new TimeSpan(23, 0, 0),
                    schedules,
                    timeSlots
                );
            }
        }

        await _scheduleRepo.BulkInsertAsync(schedules, timeSlots);

        _logger.LogInformation("Seeded {ScheduleCount} schedules & {SlotCount} slots",
            schedules.Count, timeSlots.Count);
    }

    //  Hàm tạo schedule + slot
    private void CreateScheduleWithSlots(
        Guid doctorId,
        DateTime date,
        TimeSpan start,
        TimeSpan end,
        List<Schedule> schedules,
        List<TimeSlot> slots)
    {
        var scheduleId = Guid.NewGuid();

        var slotList = GenerateSlots(scheduleId, start, end, 30);

        schedules.Add(new Schedule
        {
            Id = scheduleId,
            DoctorId = doctorId,
            WorkDate = DateTime.SpecifyKind(date, DateTimeKind.Utc),
            StartTime = start,
            EndTime = end,
            SlotDurationMinutes = 30,
            TotalSlots = slotList.Count,
            AvailableSlots = slotList.Count,
            IsAvailable = true,
        });

        slots.AddRange(slotList);
    }

    // Generate TimeSlot
    private List<TimeSlot> GenerateSlots(
        Guid scheduleId,
        TimeSpan start,
        TimeSpan end,
        int durationMinutes)
    {
        var result = new List<TimeSlot>();
        var current = start;
        var span = TimeSpan.FromMinutes(durationMinutes);

        while (current + span <= end)
        {
            result.Add(new TimeSlot
            {
                Id = Guid.NewGuid(),
                ScheduleId = scheduleId,
                StartTime = current,
                EndTime = current + span,
                IsBooked = false,
                CreatedAt = DateTime.UtcNow
            });

            current += span;
        }

        return result;
    }
}