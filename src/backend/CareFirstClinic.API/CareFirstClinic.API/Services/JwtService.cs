using CareFirstClinic.API.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CareFirstClinic.API.Services
{
    public class JwtService
    {
        private readonly IConfiguration _config;

        public JwtService(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateToken(User user)
        {
            // FIX: Kiểm tra null an toàn thay vì crash runtime
            var jwtKey = _config["Jwt:Key"]
                ?? throw new InvalidOperationException("Chưa cấu hình Jwt:Key trong appsettings.");
            var jwtIssuer = _config["Jwt:Issuer"]
                ?? throw new InvalidOperationException("Chưa cấu hình Jwt:Issuer trong appsettings.");
            var jwtAudience = _config["Jwt:Audience"]
                ?? throw new InvalidOperationException("Chưa cấu hình Jwt:Audience trong appsettings.");

            var key = Encoding.UTF8.GetBytes(jwtKey);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.Email, user.Email),
                // FIX: Thêm ClaimTypes.Role để [Authorize(Roles = "...")] hoạt động
                new Claim(ClaimTypes.Role, user.Role?.Name ?? string.Empty),
                new Claim("RoleId", user.RoleId.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(60),
                signingCredentials: new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256
                )
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}