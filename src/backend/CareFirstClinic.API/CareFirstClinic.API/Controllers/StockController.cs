using CareFirstClinic.API.DTOs;
using CareFirstClinic.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CareFirstClinic.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StockController : ControllerBase
    {
        private readonly IStockService _stockService;
        private readonly ILogger<StockController> _logger;

        public StockController(IStockService stockService, ILogger<StockController> logger)
        {
            _stockService = stockService;
            _logger = logger;
        }

        // GET /api/stock — Admin/Doctor xem tất cả
        [HttpGet]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> GetAll()
        {
            try { return Ok(await _stockService.GetAllAsync()); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetAll Stock.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // GET /api/stock/{id}
        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var s = await _stockService.GetByIdAsync(id);
                return s is null ? NotFound($"Không tìm thấy thuốc với Id: {id}") : Ok(s);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetById Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // GET /api/stock/low — Admin xem thuốc sắp hết
        [HttpGet("low")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetLowStock()
        {
            try { return Ok(await _stockService.GetLowStockAsync()); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetLowStock.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // POST /api/stock — Admin thêm thuốc mới
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(CreateStockDTO dto)
        {
            try
            {
                var created = await _stockService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id },
                    new { message = "Thêm thuốc thành công.", data = created });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (InvalidOperationException ex) { return Conflict(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Create Stock.");
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // PUT /api/stock/{id} — Admin cập nhật thông tin thuốc
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(Guid id, UpdateStockDTO dto)
        {
            try
            {
                var updated = await _stockService.UpdateAsync(id, dto);
                if (updated is null) return NotFound($"Không tìm thấy thuốc với Id: {id}");
                return Ok(new { message = "Cập nhật thuốc thành công.", data = updated });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
            catch (InvalidOperationException ex) { return Conflict(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Update Stock Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // PATCH /api/stock/{id}/import — Admin nhập thêm hàng
        [HttpPatch("{id:guid}/import")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Import(Guid id, ImportStockDTO dto)
        {
            try
            {
                var updated = await _stockService.ImportAsync(id, dto);
                if (updated is null) return NotFound($"Không tìm thấy thuốc với Id: {id}");
                return Ok(new { message = $"Nhập thêm {dto.Quantity} đơn vị thành công.", data = updated });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Import Stock Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }

        // PATCH /api/stock/{id}/toggle — Admin bật/tắt thuốc
        [HttpPatch("{id:guid}/toggle")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Toggle(Guid id)
        {
            try
            {
                var result = await _stockService.ToggleActiveAsync(id);
                if (!result) return NotFound($"Không tìm thấy thuốc với Id: {id}");
                return Ok(new { message = "Cập nhật trạng thái thuốc thành công." });
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (InvalidOperationException ex) { return Conflict(ex.Message); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Toggle Stock Id: {Id}", id);
                return StatusCode(500, "Lỗi hệ thống. Vui lòng thử lại sau.");
            }
        }
    }
}