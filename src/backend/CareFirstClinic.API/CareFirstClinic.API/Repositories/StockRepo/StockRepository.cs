using CareFirstClinic.API.Data;
using CareFirstClinic.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CareFirstClinic.API.Repositories.StockRepo
{
    public class StockRepository : IStockRepository
    {
        private readonly CareFirstClinicDbContext _context;
        private readonly ILogger<StockRepository> _logger;

        public StockRepository(CareFirstClinicDbContext context, ILogger<StockRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<Stock>> GetAllAsync()
        {
            try
            {
                return await _context.Stocks
                    .Where(s => s.IsActive)
                    .OrderBy(s => s.MedicineName)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetAll Stock.");
                throw;
            }
        }

        public async Task<Stock?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không hợp lệ.", nameof(id));
            try
            {
                return await _context.Stocks
                    .FirstOrDefaultAsync(s => s.Id == id && s.IsActive);
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetById Id: {Id}", id);
                throw;
            }
        }

        public async Task<Stock?> GetByMedicineCodeAsync(string code)
        {
            if (string.IsNullOrWhiteSpace(code))
                throw new ArgumentException("Mã thuốc không được để trống.", nameof(code));
            try
            {
                return await _context.Stocks
                    .FirstOrDefaultAsync(s => s.MedicineCode == code && s.IsActive);
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByMedicineCode: {Code}", code);
                throw;
            }
        }

        // Lấy danh sách thuốc sắp hết hàng
        public async Task<List<Stock>> GetLowStockAsync()
        {
            try
            {
                return await _context.Stocks
                    .Where(s => s.IsActive && s.Quantity <= s.MinQuantity)
                    .OrderBy(s => s.Quantity)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetLowStock.");
                throw;
            }
        }

        public async Task<bool> ExistsByMedicineCodeAsync(string code, Guid? excludeId = null)
        {
            try
            {
                return await _context.Stocks
                    .AnyAsync(s => s.MedicineCode == code
                               && (excludeId == null || s.Id != excludeId));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi ExistsByMedicineCode: {Code}", code);
                throw;
            }
        }

        public async Task<Stock> AddAsync(Stock stock)
        {
            ArgumentNullException.ThrowIfNull(stock);
            try
            {
                _context.Stocks.Add(stock);
                await _context.SaveChangesAsync();
                return stock;
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi DB khi thêm Stock.");
                throw new InvalidOperationException("Không thể thêm thuốc. Vui lòng thử lại.", ex);
            }
        }

        public async Task<Stock> UpdateAsync(Stock stock)
        {
            ArgumentNullException.ThrowIfNull(stock);
            var exists = await _context.Stocks.AnyAsync(s => s.Id == stock.Id);
            if (!exists)
                throw new KeyNotFoundException($"Không tìm thấy thuốc với Id: {stock.Id}");
            try
            {
                _context.Stocks.Update(stock);
                await _context.SaveChangesAsync();
                return stock;
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, "Xung đột dữ liệu khi cập nhật Stock Id: {Id}", stock.Id);
                throw new InvalidOperationException("Dữ liệu đã bị thay đổi. Vui lòng tải lại.", ex);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi DB khi cập nhật Stock Id: {Id}", stock.Id);
                throw new InvalidOperationException("Không thể cập nhật thuốc. Vui lòng thử lại.", ex);
            }
        }

        public async Task<bool> ToggleActiveAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không hợp lệ.", nameof(id));
            try
            {
                var stock = await _context.Stocks.FirstOrDefaultAsync(s => s.Id == id);
                if (stock is null) return false;

                // Không tắt nếu còn đơn thuốc đang dùng
                if (stock.IsActive)
                {
                    var inUse = await _context.PrescriptionDetails
                        .AnyAsync(pd => pd.StockId == id);
                    if (inUse)
                        throw new InvalidOperationException(
                            "Không thể ngừng sử dụng thuốc đang có trong đơn thuốc.");
                }

                stock.IsActive = !stock.IsActive;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (InvalidOperationException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi ToggleActive Stock Id: {Id}", id);
                throw;
            }
        }
    }
}