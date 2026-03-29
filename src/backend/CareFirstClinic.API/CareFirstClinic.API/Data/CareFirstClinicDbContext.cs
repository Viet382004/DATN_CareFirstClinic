using CareFirstClinic.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CareFirstClinic.API.Data
{
    public class CareFirstClinicDbContext : DbContext
    {
        public CareFirstClinicDbContext(DbContextOptions<CareFirstClinicDbContext> options)
            : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<Specialty> Specialties { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Schedule> Schedules { get; set; }
        public DbSet<MedicalRecord> MedicalRecords { get; set; }
        public DbSet<Prescription> Prescriptions { get; set; }
        public DbSet<PrescriptionDetail> PrescriptionDetails { get; set; }
        public DbSet<Stock> Stocks { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<TimeSlot> TimeSlots { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // TIMESLOT
            modelBuilder.Entity<TimeSlot>(e =>
            {
                e.HasKey(x => x.Id);

                e.Property(x => x.StartTime).IsRequired();
                e.Property(x => x.EndTime).IsRequired();
                e.Property(x => x.IsBooked).HasDefaultValue(false);

                e.HasOne(x => x.Schedule)
                    .WithMany(s => s.TimeSlots)
                    .HasForeignKey(x => x.ScheduleId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ROLE
            modelBuilder.Entity<Role>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.Name).IsRequired().HasMaxLength(50);
                e.Property(x => x.Description).HasMaxLength(200);
                e.Property(x => x.IsActive).HasDefaultValue(true);
            });

            // USER
            modelBuilder.Entity<User>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.UserName).IsRequired().HasMaxLength(50);
                e.Property(x => x.Email).IsRequired().HasMaxLength(150);
                e.HasIndex(x => x.Email).IsUnique();
                e.Property(x => x.FullName).IsRequired().HasMaxLength(100);
                e.Property(x => x.PasswordHash).IsRequired().HasColumnType("text");
                e.Property(x => x.IsActive).HasDefaultValue(true);
                e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                // User → Role (N-1)
                e.HasOne(x => x.Role)
                    .WithMany(r => r.Users)
                    .HasForeignKey(x => x.RoleId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // DOCTOR
            modelBuilder.Entity<Doctor>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.AvatarUrl).HasMaxLength(500);
                e.Property(x => x.FullName).IsRequired().HasMaxLength(100);
                e.Property(x => x.AcademicTitle).IsRequired().HasMaxLength(100);
                e.Property(x => x.Position).IsRequired().HasMaxLength(100);
                e.Property(x => x.PhoneNumber).HasMaxLength(20);
                e.Property(x => x.YearsOfExperience).IsRequired();
                e.Property(x => x.Description).HasMaxLength(1000);

                // Doctor → Specialty (N-1)
                e.HasOne(x => x.Specialty)
                    .WithMany(s => s.Doctors)
                    .HasForeignKey(x => x.SpecialtyId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Doctor → User (1-1)
                e.HasOne(x => x.User)
                    .WithOne(u => u.Doctor)
                    .HasForeignKey<Doctor>(x => x.UserId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // PATIENT
            modelBuilder.Entity<Patient>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.AvatarUrl).HasMaxLength(500);
                e.Property(x => x.FullName).IsRequired().HasMaxLength(100);
                e.Property(x => x.Gender).IsRequired().HasMaxLength(10);
                e.Property(x => x.PhoneNumber).HasMaxLength(20);
                e.Property(x => x.Address).HasMaxLength(250);
                e.Property(x => x.MedicalHistory).HasColumnType("text");
                e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                // Patient → User (1-1)
                e.HasOne(x => x.User)
                    .WithOne(u => u.Patient)
                    .HasForeignKey<Patient>(x => x.UserId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // SPECIALTY
            modelBuilder.Entity<Specialty>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.Name).IsRequired().HasMaxLength(100);
                e.Property(x => x.Description).HasMaxLength(500);
                e.Property(x => x.IsActive).HasDefaultValue(true);
            });

            // SCHEDULE
            modelBuilder.Entity<Schedule>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.WorkDate).IsRequired();
                e.Property(x => x.StartTime).IsRequired();
                e.Property(x => x.EndTime).IsRequired();
                e.Property(x => x.IsAvailable).HasDefaultValue(true);
                e.Property(x => x.Note).HasMaxLength(500);

                // Schedule → Doctor (N-1)
                e.HasOne(x => x.Doctor)
                    .WithMany(d => d.Schedules)
                    .HasForeignKey(x => x.DoctorId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Appointment>(e =>
            {
                e.HasKey(x => x.Id);

                e.Property(x => x.Reason).HasMaxLength(500);
                e.Property(x => x.CancelReason).HasMaxLength(500);
                e.Property(x => x.Notes).HasMaxLength(1000);

                e.Property(x => x.Status)
                    .HasConversion<string>()
                    .HasMaxLength(20);

                e.Property(x => x.CreatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                e.HasOne(x => x.Patient)
                    .WithMany(p => p.Appointments)
                    .HasForeignKey(x => x.PatientId)
                    .OnDelete(DeleteBehavior.Restrict);

                e.HasOne(x => x.TimeSlot)
                    .WithOne(t => t.Appointment)
                    .HasForeignKey<Appointment>(x => x.TimeSlotId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // MEDICAL RECORD
            modelBuilder.Entity<MedicalRecord>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.Diagnosis).IsRequired().HasColumnType("text");
                e.Property(x => x.Symptoms).HasColumnType("text");
                e.Property(x => x.Notes).HasColumnType("text");
                e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                // MedicalRecord → Appointment (1-1)
                e.HasOne(x => x.Appointment)
                    .WithOne(a => a.MedicalRecord)
                    .HasForeignKey<MedicalRecord>(x => x.AppointmentId)
                    .OnDelete(DeleteBehavior.Cascade);

                // MedicalRecord → Patient (N-1)
                e.HasOne(x => x.Patient)
                    .WithMany(p => p.MedicalRecords)
                    .HasForeignKey(x => x.PatientId)
                    .OnDelete(DeleteBehavior.Restrict);

                // MedicalRecord → Doctor (N-1)
                e.HasOne(x => x.Doctor)
                    .WithMany(d => d.MedicalRecords)
                    .HasForeignKey(x => x.DoctorId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // PRESCRIPTION
            modelBuilder.Entity<Prescription>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.Status)
                    .IsRequired()
                    .HasConversion<string>()
                    .HasMaxLength(20);
                e.Property(x => x.Notes).HasMaxLength(500);
                e.Property(x => x.IssuedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                // Prescription → MedicalRecord (1-1)
                e.HasOne(x => x.MedicalRecord)
                    .WithOne(m => m.Prescription)
                    .HasForeignKey<Prescription>(x => x.MedicalRecordId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // PRESCRIPTION DETAIL
            modelBuilder.Entity<PrescriptionDetail>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.Frequency).IsRequired().HasMaxLength(100);
                e.Property(x => x.Instructions).HasMaxLength(500);

                // PrescriptionDetail → Prescription (N-1)
                e.HasOne(x => x.Prescription)
                    .WithMany(p => p.Details)
                    .HasForeignKey(x => x.PrescriptionId)
                    .OnDelete(DeleteBehavior.Cascade);

                // PrescriptionDetail → Stock (N-1)
                e.HasOne(x => x.Stock)
                    .WithMany(s => s.PrescriptionDetails)
                    .HasForeignKey(x => x.StockId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // STOCK
            modelBuilder.Entity<Stock>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.MedicineName).IsRequired().HasMaxLength(200);
                e.Property(x => x.MedicineCode).HasMaxLength(50);
                e.Property(x => x.Unit).HasMaxLength(50);
                e.Property(x => x.Manufacturer).HasMaxLength(200);
                e.Property(x => x.UnitPrice).HasColumnType("numeric(18,2)");
                e.Property(x => x.IsActive).HasDefaultValue(true);
            });

            // PAYMENT
            modelBuilder.Entity<Payment>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.Amount).HasColumnType("numeric(18,2)");
                e.Property(x => x.Method).HasConversion<string>().HasMaxLength(50);
                e.Property(x => x.Status).HasConversion<string>().HasMaxLength(50);
                e.Property(x => x.TransactionId).HasMaxLength(100);
                e.Property(x => x.Notes).HasMaxLength(500);

                // Payment -> Patient (N-1)
                e.HasOne(p => p.Patient)
                    .WithMany(patient => patient.Payments)
                    .HasForeignKey(p => p.PatientId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Payment -> Appointment (1-1)
                e.HasOne(p => p.Appointment)
                    .WithOne(a => a.Payment)
                    .HasForeignKey<Payment>(p => p.AppointmentId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}