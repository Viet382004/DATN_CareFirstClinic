using CareFirstClinic.API.Data;
using CareFirstClinic.API.Models;
using CareFirstClinic.API.Repositories;
using CareFirstClinic.API.Repositories.AppoinmentRepo;
using CareFirstClinic.API.Repositories.DoctorRepo;
using CareFirstClinic.API.Repositories.PatientRepo;
using CareFirstClinic.API.Repositories.ScheduleRepo;
using CareFirstClinic.API.Repositories.SpecialtyRepo;
using CareFirstClinic.API.Repositories.StockRepo;
using CareFirstClinic.API.Services;
using CareFirstClinic.API.Services.Background;
using CareFirstClinic.API.Services.ScheduleSeeder;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using dotenv.net;

DotEnv.Load();

if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
{
    DotEnv.Load();
}

var builder = WebApplication.CreateBuilder(args);

var dbHost = builder.Configuration["DB_HOST"];
var dbPort = builder.Configuration["DB_PORT"] ?? "5432";
var dbName = builder.Configuration["DB_NAME"];
var dbUser = builder.Configuration["DB_USER"];
var dbPass = builder.Configuration["DB_PASS"];

Console.WriteLine("=== DATABASE CONFIG DEBUG ===");
Console.WriteLine($"DB_HOST: {(string.IsNullOrEmpty(dbHost) ? "NULL" : dbHost)}");
Console.WriteLine($"DB_PORT: {dbPort}");
Console.WriteLine($"DB_NAME: {(string.IsNullOrEmpty(dbName) ? "NULL" : dbName)}");
Console.WriteLine($"DB_USER: {(string.IsNullOrEmpty(dbUser) ? "NULL" : dbUser)}");
Console.WriteLine($"DB_PASS: {(string.IsNullOrEmpty(dbPass) ? "NULL" : "******")}");
Console.WriteLine("============================");

if (string.IsNullOrEmpty(dbHost) || string.IsNullOrEmpty(dbName) || string.IsNullOrEmpty(dbUser) || string.IsNullOrEmpty(dbPass))
{
    Console.WriteLine("❌ LỖI: Thiếu biến môi trường database!");
}

var connectionString = $"Host={dbHost};Port={dbPort};Database={dbName};Username={dbUser};Password={dbPass};SSL Mode=Require;Trust Server Certificate=true";

builder.Services.AddDbContext<CareFirstClinicDbContext>(options =>
    options.UseNpgsql(connectionString));

var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY")
             ?? builder.Configuration["Jwt:Key"]
             ?? throw new InvalidOperationException("Chưa cấu hình Jwt:Key trong .env hoặc appsettings.json");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? builder.Configuration["Jwt:Issuer"],
            ValidAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", p => p.RequireRole("Admin"));
    options.AddPolicy("DoctorOrAdmin", p => p.RequireRole("Doctor", "Admin"));
    options.AddPolicy("PatientOnly", p => p.RequireRole("Patient"));
});

builder.Services.AddScoped<IPatientRepository, PatientRepository>();
builder.Services.AddScoped<IDoctorRepository, DoctorRepository>();
builder.Services.AddScoped<ISpecialtyRepository, SpecialtyRepository>();
builder.Services.AddScoped<IScheduleRepository, ScheduleRepository>();
builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();
builder.Services.AddScoped<IStockRepository, StockRepository>();
builder.Services.AddScoped<IPrescriptionRepository, PrescriptionRepository>();
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();

builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<IPatientService, PatientService>();
builder.Services.AddScoped<ISpecialtyService, SpecialtyService>();
builder.Services.AddScoped<IDoctorService, DoctorService>();
builder.Services.AddScoped<IScheduleService, ScheduleService>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<IStockService, StockService>();
builder.Services.AddScoped<IPrescriptionService, PrescriptionService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IScheduleSeeder, ScheduleSeeder>();
//builder.Services.AddHostedService<ScheduleBackgroundService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Nhập token theo định dạng: Bearer {token}"
    });
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

//AUTO SEED DATA
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<CareFirstClinicDbContext>();
        var seeder = services.GetRequiredService<IScheduleSeeder>();
        //await DbSeeder.SeedAsync(context);
        //await seeder.SeedAsync();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Đã xảy ra lỗi khi seed dữ liệu.");
    }
}
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<CareFirstClinicDbContext>();
    try
    {
        context.Database.OpenConnection();
        Console.WriteLine("DB CONNECT OK ");
    }
    catch (Exception ex)
    {
        Console.WriteLine("DB CONNECT FAIL : " + ex.Message);
    }
}


app.UseSwagger();
app.UseSwaggerUI();


app.UseCors("AllowFrontend");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();