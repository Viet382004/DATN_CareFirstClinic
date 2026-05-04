using CareFirstClinic.API.DTOs.ClinicalService;
using CareFirstClinic.API.Services;
using CareFirstClinic.API.Repositories.DoctorRepo;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CareFirstClinic.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ServiceOrderController : ControllerBase
    {
        private readonly IServiceOrderService _orderService;
        private readonly IDoctorRepository _doctorRepo;

        public ServiceOrderController(IServiceOrderService orderService, IDoctorRepository doctorRepo)
        {
            _orderService = orderService;
            _doctorRepo = doctorRepo;
        }

        [HttpGet("appointment/{appointmentId}")]
        public async Task<IActionResult> GetByAppointment(Guid appointmentId)
        {
            var orders = await _orderService.GetOrdersByAppointmentIdAsync(appointmentId);
            return Ok(orders);
        }

        [HttpGet("queue")]
        public async Task<IActionResult> GetQueue()
        {
            var userId = GetUserId();
            Guid? specialtyId = null;
            
            if (userId != null)
            {
                var doctor = await _doctorRepo.GetByUserIdAsync(userId.Value);
                if (doctor != null)
                {
                    specialtyId = doctor.SpecialtyId;
                }
            }

            var queue = await _orderService.GetQueueAsync(specialtyId);
            return Ok(queue);
        }

        [HttpPost("order/{appointmentId}")]
        public async Task<IActionResult> OrderServices(Guid appointmentId, [FromBody] List<Guid> serviceIds)
        {
            var doctorId = GetUserId();
            if (doctorId == null) return Unauthorized();

            var success = await _orderService.OrderServicesAsync(appointmentId, serviceIds, doctorId.Value);
            if (success) return Ok(new { message = "Đã ra chỉ định thành công." });
            return BadRequest("Không thể tạo chỉ định.");
        }

        [HttpPost("{orderId}/lock")]
        public async Task<IActionResult> LockOrder(Guid orderId)
        {
            var doctorId = GetUserId();
            if (doctorId == null) return Unauthorized();

            var success = await _orderService.LockOrderAsync(orderId, doctorId.Value);
            if (success) return Ok(new { message = "Đã khóa ca khám." });
            return BadRequest("Ca khám đã được người khác thực hiện hoặc không tồn tại.");
        }

        [HttpPost("{orderId}/unlock")]
        public async Task<IActionResult> UnlockOrder(Guid orderId)
        {
            var success = await _orderService.UnlockOrderAsync(orderId);
            if (success) return Ok(new { message = "Đã mở khóa ca khám." });
            return BadRequest();
        }

        [HttpPost("{orderId}/result")]
        public async Task<IActionResult> SaveResult(Guid orderId, [FromBody] UpdateServiceOrderResultDTO dto)
        {
            var success = await _orderService.SaveResultAsync(orderId, dto.ResultData);
            if (success) return Ok(new { message = "Đã lưu kết quả thành công." });
            return BadRequest();
        }

        [HttpGet("services")]
        public async Task<IActionResult> GetServices()
        {
            var services = await _orderService.GetAvailableServicesAsync();
            return Ok(services);
        }

        private Guid? GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(userIdClaim, out Guid userId)) return userId;
            return null;
        }
    }
}
