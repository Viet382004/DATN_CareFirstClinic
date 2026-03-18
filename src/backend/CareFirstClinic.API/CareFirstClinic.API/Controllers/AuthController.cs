using CareFirstClinic.API.Data;
using CareFirstClinic.API.DTOs.Auth;
using CareFirstClinic.API.Models;
using CareFirstClinic.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace CareFirstClinic.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly CareFirstClinicDbContext _context;
        private readonly JwtService _jwtService;

        public AuthController(CareFirstClinicDbContext context, JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        // ĐĂNG KÝ
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDTO dto)
        {
            // Kiểm tra email trùng
            if (await _context.Users.AnyAsync(x => x.Email == dto.Email))
                return BadRequest("Email đã được sử dụng.");

            // Kiểm tra username trùng
            if (await _context.Users.AnyAsync(x => x.UserName == dto.UserName))
                return BadRequest("Tên đăng nhập đã tồn tại.");

            // Kiểm tra RoleId hợp lệ (chỉ cho phép đăng ký role Patient)
            var patientRole = await _context.Roles
                .FirstOrDefaultAsync(r => r.Name == "Patient" && r.IsActive);

            if (patientRole == null)
                return StatusCode(500, "Không tìm thấy role mặc định.");

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            // Bắt đầu transaction để đảm bảo tạo đủ cả User và Patient
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var user = new User
                {
                    UserName = dto.UserName,
                    PasswordHash = passwordHash,
                    Email = dto.Email,
                    FullName = dto.FullName,
                    RoleId = patientRole.Id,
                    IsActive = true
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Tự động tạo hồ sơ bệnh nhân (Patient)
                var patient = new Patient
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    FullName = user.FullName,
                    DateOfBirth = dto.DateOfBirth,
                    Gender = dto.Gender,
                    PhoneNumber = "",
                    CreatedAt = DateTime.UtcNow,
                };

                _context.Patients.Add(patient);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return CreatedAtAction(nameof(Register), new { id = user.Id }, new
                {
                    status = "success",
                    message = "Đăng ký thành công, vui lòng đăng nhập",
                    data = new
                    {
                        userId = user.Id,
                        userName = user.UserName,
                        password = user.PasswordHash,
                        email = user.Email,
                        dateofbirth = patient.DateOfBirth,
                        gender = dto.Gender,
                    }
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();

                return StatusCode(500, new
                {
                    message = ex.Message,
                    inner = ex.InnerException?.Message
                });
            }
        }

        // ĐĂNG NHẬP
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDTO dto)
        {
            var user = await _context.Users
                .Include(x => x.Role)
                .FirstOrDefaultAsync(x => x.Email == dto.Email);

            // Trả cùng 1 thông báo để tránh lộ thông tin tài khoản
            if (user == null || !user.IsActive)
                return BadRequest("Thông tin đăng nhập không hợp lệ.");

            bool validPassword = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);

            if (!validPassword)
                return BadRequest("Thông tin đăng nhập không hợp lệ.");

            var token = _jwtService.GenerateToken(user);

            return Ok(new
            {
                accessToken = token,
                tokenType = "Bearer",
                message = "Đăng nhập thành công",
                data = new
                {
                    user.Id,
                    user.UserName,
                    user.Email,
                    user.FullName,
                    RoleName = user.Role?.Name
                }
            });
        }
    }
}