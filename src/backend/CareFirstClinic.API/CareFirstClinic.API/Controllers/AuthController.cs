using CareFirstClinic.API.Data;
using CareFirstClinic.API.DTOs;
using CareFirstClinic.API.DTOs.Auth;
using CareFirstClinic.API.Models;
using CareFirstClinic.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareFirstClinic.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly CareFirstClinicDbContext _context;
        private readonly JwtService _jwtService;
        private readonly IEmailService _emailService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            CareFirstClinicDbContext context,
            JwtService jwtService,
            IEmailService emailService,
            ILogger<AuthController> logger)
        {
            _context = context;
            _jwtService = jwtService;
            _emailService = emailService;
            _logger = logger;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register(RegisterDTO dto)
        {
            if (await _context.Users.AnyAsync(x => x.Email == dto.Email))
                return BadRequest("Email đã được sử dụng.");

            var patientRole = await _context.Roles
                .FirstOrDefaultAsync(r => r.Name == "Patient" && r.IsActive);

            if (patientRole == null)
                return StatusCode(500, "Không tìm thấy role mặc định.");

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var otp = GenerateOtp();

                var user = new User
                {
                    PasswordHash = passwordHash,
                    Email = dto.Email,
                    FullName = dto.FullName,
                    RoleId = patientRole.Id,
                    IsActive = false,
                    IsEmailVerified = false,
                    OtpCode = otp,
                    OtpExpiredAt = DateTime.UtcNow.AddMinutes(10)
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                var patient = new Patient
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    FullName = user.FullName,
                    DateOfBirth = DateTime.SpecifyKind(dto.DateOfBirth, DateTimeKind.Utc),
                    Gender = dto.Gender,
                    PhoneNumber = "",
                    CreatedAt = DateTime.UtcNow,
                };

                _context.Patients.Add(patient);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                // Gửi email OTP (fire and forget)
                _ = Task.Run(async () =>
                {
                    try
                    {
                        await _emailService.SendOtpAsync(user.Email, user.FullName, otp);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Lỗi gửi OTP sau khi đăng ký | Email: {Email}", user.Email);
                    }
                });

                return Ok(new
                {
                    message = "Đăng ký thành công. Vui lòng kiểm tra email để xác thực OTP.",
                    email = user.Email
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Lỗi register | Email: {Email}", dto.Email);
                return StatusCode(500, new
                {
                    message = "Đăng ký thất bại.",
                    error = ex.Message,
                    inner = ex.InnerException?.Message
                });
            }
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login(LoginDTO dto)
        {
            var user = await _context.Users
                .Include(x => x.Role)
                .FirstOrDefaultAsync(x => x.Email == dto.Email);

            if (user == null)
                return BadRequest("Thông tin đăng nhập không hợp lệ.");

            if (!user.IsEmailVerified)
            {
                return Unauthorized(new
                {
                    message = "Tài khoản chưa xác thực OTP.",
                    email = user.Email
                });
            }

            if (!user.IsActive)
                return BadRequest("Tài khoản chưa được kích hoạt.");

            bool validPassword = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
            if (!validPassword)
                return BadRequest("Thông tin đăng nhập không hợp lệ.");

            if (!user.IsEmailVerified)
            {
                return Unauthorized(new
                {
                    message = "Tài khoản chưa được xác thực. Vui lòng kiểm tra email.",
                    isVerified = false,
                    email = user.Email
                });
            }

            var token = _jwtService.GenerateToken(user);

            return Ok(new
            {
                accessToken = token,
                tokenType = "Bearer",
                message = "Đăng nhập thành công",
                data = new
                {
                    user.Id,
                    user.Email,
                    user.FullName,
                    RoleName = user.Role?.Name
                }
            });
        }

        [HttpPost("verify-otp")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyOtp(VerifyOtpDTO dto)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == dto.Email);

                if (user is null)
                    return NotFound("Không tìm thấy tài khoản.");

                if (user.IsEmailVerified)
                    return BadRequest("Tài khoản đã được xác thực rồi.");

                if (user.OtpCode != dto.OtpCode)
                    return BadRequest("Mã OTP không chính xác.");

                if (user.OtpExpiredAt is null || user.OtpExpiredAt < DateTime.UtcNow)
                    return BadRequest("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");

                // Xác thực thành công
                user.IsEmailVerified = true;
                user.IsActive = true;
                user.OtpCode = null;
                user.OtpExpiredAt = null;

                await _context.SaveChangesAsync();

                // Tạo token luôn để user có thể login ngay
                var token = _jwtService.GenerateToken(user);

                return Ok(new
                {
                    message = "Xác thực tài khoản thành công.",
                    token
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi VerifyOtp | Email: {Email}", dto.Email);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        [HttpPost("resend-otp")]
        [AllowAnonymous]
        public async Task<IActionResult> ResendOtp(ResendOtpDTO dto)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == dto.Email);

                if (user is null)
                    return NotFound("Không tìm thấy tài khoản.");

                if (user.IsEmailVerified)
                    return BadRequest("Tài khoản đã được xác thực rồi.");

                // Chống spam: phải đợi ít nhất 1 phút (kiểm tra expired time)
                if (user.OtpExpiredAt.HasValue &&
                    user.OtpExpiredAt.Value > DateTime.UtcNow.AddMinutes(9))
                {
                    return BadRequest("Vui lòng đợi ít nhất 1 phút trước khi yêu cầu mã mới.");
                }

                var otp = GenerateOtp();
                user.OtpCode = otp;
                user.OtpExpiredAt = DateTime.UtcNow.AddMinutes(10);

                await _context.SaveChangesAsync();

                // Gửi email fire-and-forget
                _ = Task.Run(async () =>
                {
                    try
                    {
                        await _emailService.SendOtpAsync(user.Email, user.FullName, otp);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Lỗi gửi lại OTP | Email: {Email}", user.Email);
                    }
                });

                return Ok(new { message = "Đã gửi lại mã xác thực. Vui lòng kiểm tra email." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi ResendOtp | Email: {Email}", dto.Email);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        private static string GenerateOtp()
        {
            return Random.Shared.Next(100000, 999999).ToString();
        }
    }
}