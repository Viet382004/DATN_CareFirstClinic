using CareFirstClinic.API.Data;
using CareFirstClinic.API.Models;
using Microsoft.EntityFrameworkCore;
using CareFirstClinic.API.Common;

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

        public async Task<bool> ExistsByMedicineNameAsync(string name, Guid? excludeId = null)
        {
            try
            {
                var normalized = name.Trim().ToLower();
                return await _context.Stocks
                    .AnyAsync(s => s.MedicineName.ToLower() == normalized
                               && (excludeId == null || s.Id != excludeId));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi ExistsByMedicineName: {Name}", name);
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
        public async Task<(List<Stock> Items, int Total)> GetPagedAsync(StockQueryParams query)
        {
            var q = _context.Stocks.AsQueryable();

            // lọc mặc định chỉ lấy active
            if (query.IsActive.HasValue)
                q = q.Where(s => s.IsActive == query.IsActive.Value);
            else
                q = q.Where(s => s.IsActive);

            // tìm theo tên thuốc
            if (!string.IsNullOrWhiteSpace(query.Name))
            {
                var name = query.Name.Trim().ToLower();
                q = q.Where(s => s.MedicineName.ToLower().Contains(name));
            }

            // tìm theo mã thuốc
            if (!string.IsNullOrWhiteSpace(query.MedicineCode))
            {
                var code = query.MedicineCode.Trim().ToUpper();
                q = q.Where(s => s.MedicineCode != null && s.MedicineCode.Contains(code));
            }

            // lọc sắp hết hàng
            if (query.IsLowStock == true)
                q = q.Where(s => s.Quantity <= s.MinQuantity);

            var total = await q.CountAsync();

            // sort
            q = query.SortBy switch
            {
                "quantity" => query.IsAscending ? q.OrderBy(s => s.Quantity) : q.OrderByDescending(s => s.Quantity),
                "unitPrice" => query.IsAscending ? q.OrderBy(s => s.UnitPrice) : q.OrderByDescending(s => s.UnitPrice),
                _ => query.IsAscending ? q.OrderBy(s => s.MedicineName) : q.OrderByDescending(s => s.MedicineName)
            };

            var items = await q
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            return (items, total);
        }
    }
}