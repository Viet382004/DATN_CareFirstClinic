using CareFirstClinic.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CareFirstClinic.API.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(CareFirstClinicDbContext context)
        {
            await context.Database.MigrateAsync();

            // 1. Create Roles

            if (!context.Roles.Any())
            {
                var roles = new List<Role>
                {
                    new Role
                    {
                        Id = Guid.NewGuid(),
                        Name = "Admin",
                        IsActive = true
                    },
                    new Role
                    {
                        Id = Guid.NewGuid(),
                        Name = "Doctor",
                        IsActive = true
                    },
                    new Role
                    {
                        Id = Guid.NewGuid(),
                        Name = "Patient",
                        IsActive = true
                    }
                };

                context.Roles.AddRange(roles);
                await context.SaveChangesAsync();
            }

            // 2. Create Admin Account

            if (!context.Users.Any(u => u.Email == "admin@clinic.com"))
            {
                var adminRole = await context.Roles
                    .FirstAsync(r => r.Name == "Admin");

                var adminUser = new User
                {
                    Id = Guid.NewGuid(),
                    Email = "admin@clinic.com",
                    FullName = "System Admin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                    RoleId = adminRole.Id,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                context.Users.Add(adminUser);
                await context.SaveChangesAsync();
            }
        }
    }
}