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
        private readonly string _jwtKey;
        private readonly string _jwtIssuer;
        private readonly string _jwtAudience;

        public JwtService(IConfiguration config)
        {
            _config = config;

            _jwtKey = Environment.GetEnvironmentVariable("JWT_KEY")
                ?? _config["Jwt:Key"]
                ?? throw new InvalidOperationException("JWT Key chưa được cấu hình.");

            _jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER")
                ?? _config["Jwt:Issuer"]
                ?? "CareFirstClinic";

            _jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE")
                ?? _config["Jwt:Audience"]
                ?? "CareFirstUsers";

            if (string.IsNullOrWhiteSpace(_jwtKey) || Encoding.UTF8.GetByteCount(_jwtKey) < 32)
            {
                throw new InvalidOperationException(
                    $"JWT Key quá ngắn! Hiện tại chỉ có {Encoding.UTF8.GetByteCount(_jwtKey)} bytes.");
            }
        }

        public string GenerateToken(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email ?? ""),
                new Claim(ClaimTypes.Role, user.Role?.Name ?? "User"),
                new Claim("RoleId", user.RoleId.ToString())
            };

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtKey));

            var token = new JwtSecurityToken(
                issuer: _jwtIssuer,
                audience: _jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(60),
                signingCredentials: new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}