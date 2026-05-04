using CareFirstClinic.API.Data;
using CareFirstClinic.API.Models;
using CareFirstClinic.API.Repositories;
using CareFirstClinic.API.Repositories.AppoinmentRepo;
using CareFirstClinic.API.Repositories.DoctorRepo;
using CareFirstClinic.API.Repositories.PatientRepo;
using CareFirstClinic.API.Repositories.ScheduleRepo;
using CareFirstClinic.API.Repositories.SpecialtyRepo;
using CareFirstClinic.API.Repositories.StockRepo;
using CareFirstClinic.API.Repositories.TimeSlotRepo;
using CareFirstClinic.API.Repositories.PaymentRepo;
using CareFirstClinic.API.Repositories.MedicalRecordRepo;
using CareFirstClinic.API.Repositories.ClinicalServiceRepo;
using CareFirstClinic.API.Services;
using CareFirstClinic.API.Services.Background;
using CareFirstClinic.API.Services.ScheduleSeeder;
using dotenv.net;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using VNPAY.Extensions;


DotEnv.Load();

if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
{
    DotEnv.Load();
}

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "https://localhost:5173",
            "http://carefirstclinic.site",
            "https://carefirstclinic.site",
            "https://www.carefirstclinic.site",
            "https://carefirstclinic.onrender.com"   
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string not found.");

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

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
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
builder.Services.AddScoped<ITimeSlotRepository, TimeSlotRepository>();
builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();
builder.Services.AddScoped<IStockRepository, StockRepository>();
builder.Services.AddScoped<IMedicalRecordRepository, MedicalRecordRepository>();
builder.Services.AddScoped<IPrescriptionRepository, PrescriptionRepository>();
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IServiceRepository, ServiceRepository>();
builder.Services.AddScoped<IServiceOrderRepository, ServiceOrderRepository>();


builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<IPatientService, PatientService>();
builder.Services.AddScoped<ISpecialtyService, SpecialtyService>();
builder.Services.AddScoped<IDoctorService, DoctorService>();
builder.Services.AddScoped<IScheduleService, ScheduleService>();
builder.Services.AddScoped<ITimeSlotService, TimeSlotService>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<IStockService, StockService>();
builder.Services.AddScoped<IPrescriptionService, PrescriptionService>();
builder.Services.AddScoped<IMedicalRecordService, MedicalRecordService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IServiceOrderService, ServiceOrderService>();
builder.Services.AddScoped<IScheduleSeeder, ScheduleSeeder>();
builder.Services.AddHttpClient<EmailService>();
builder.Services.AddHttpClient<ImageService>();
builder.Services.AddScoped<IEmailService, EmailService>(); 
builder.Services.AddScoped<IImageService, ImageService>();
builder.Services.AddVnpayClient(config =>
{
    config.TmnCode = Environment.GetEnvironmentVariable("VNPAY_TMN_CODE")
        ?? builder.Configuration["VNPay:TmnCode"]
        ?? throw new InvalidOperationException("Thiếu VNPAY_TMN_CODE hoặc VNPay:TmnCode");

    config.HashSecret = Environment.GetEnvironmentVariable("VNPAY_HASH_SECRET")
        ?? builder.Configuration["VNPay:HashSecret"]
        ?? throw new InvalidOperationException("Thiếu VNPAY_HASH_SECRET hoặc VNPay:HashSecret");

    config.CallbackUrl = Environment.GetEnvironmentVariable("VNPAY_RETURN_URL")
        ?? builder.Configuration["VNPay:ReturnUrl"]
        ?? throw new InvalidOperationException("Thiếu VNPAY_RETURN_URL hoặc VNPay:ReturnUrl");

    config.BaseUrl = Environment.GetEnvironmentVariable("VNPAY_BASE_URL")
        ?? builder.Configuration["VNPay:BaseUrl"]
        ?? "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
});
builder.Services.AddScoped<IVNPayService, VNPayService>();
builder.Services.AddHostedService<AppointmentReminderService>();
builder.Services.AddHostedService<AppointmentAutoCancelService>();
//builder.Services.AddHostedService<ScheduleBackgroundService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "CareFirstClinic API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập token: Bearer {token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
var app = builder.Build();

var mutex = new Mutex(true, "CareFirstClinic.API", out bool isNewInstance);

if (!isNewInstance)
{
    Console.WriteLine("App already running!");
    return;
}

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<CareFirstClinicDbContext>();
    try
    {
        // Kiểm tra kết nối
        context.Database.CanConnect();
        context.Database.Migrate();
        Console.WriteLine("DB CONNECT OK - Database connection and migration successful!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"DB CONNECT FAIL: {ex.Message} ");
    }
}

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
app.UseForwardedHeaders(); 
app.UseCors("AllowFrontend");

// Bật Swagger cho cả môi trường Production trên Render
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "CareFirst Clinic API v1");
    c.RoutePrefix = "swagger";
    c.DocumentTitle = "CareFirst Clinic API Documentation";
});
// 
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();