using CareFirstClinic.API.Common;
using CareFirstClinic.API.DTOs;
using CareFirstClinic.API.Models;
using CareFirstClinic.API.Repositories;
using CareFirstClinic.API.Repositories.StockRepo;

namespace CareFirstClinic.API.Services
{
    public class StockService : IStockService
    {
        private readonly IStockRepository _stockRepo;
        private readonly ILogger<StockService> _logger;

        public StockService(IStockRepository stockRepo, ILogger<StockService> logger)
        {
            _stockRepo = stockRepo;
            _logger = logger;
        }

        public async Task<List<StockDTO>> GetAllAsync()
        {
            try
            {
                var list = await _stockRepo.GetAllAsync();
                return list.Select(MapToDTO).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetAll Stock.");
                throw new ApplicationException("Không thể lấy danh sách thuốc.", ex);
            }
        }

        public async Task<StockDTO?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));
            try
            {
                var s = await _stockRepo.GetByIdAsync(id);
                return s is null ? null : MapToDTO(s);
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetById Id: {Id}", id);
                throw new ApplicationException("Không thể lấy thông tin thuốc.", ex);
            }
        }

        public async Task<List<StockDTO>> GetLowStockAsync()
        {
            try
            {
                var list = await _stockRepo.GetLowStockAsync();
                return list.Select(MapToDTO).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetLowStock.");
                throw new ApplicationException("Không thể lấy danh sách thuốc sắp hết.", ex);
            }
        }

        public async Task<StockDTO> CreateAsync(CreateStockDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            // Kiểm tra mã thuốc trùng
            if (!string.IsNullOrWhiteSpace(dto.MedicineCode))
            {
                var exists = await _stockRepo.ExistsByMedicineNameAsync(dto.MedicineCode);
                if (exists)
                    throw new InvalidOperationException(
                        $"Mã thuốc '{dto.MedicineCode}' đã tồn tại.");
            }

            try
            {
                var stock = new Stock
                {
                    Id = Guid.NewGuid(),
                    MedicineName = dto.MedicineName.Trim(),
                    MedicineCode = dto.MedicineCode?.Trim().ToUpper(),
                    Unit = dto.Unit?.Trim(),
                    Manufacturer = dto.Manufacturer?.Trim(),
                    Quantity = dto.Quantity,
                    MinQuantity = dto.MinQuantity,
                    UnitPrice = dto.UnitPrice,
                    IsActive = true
                };

                var created = await _stockRepo.AddAsync(stock);
                return MapToDTO(created);
            }
            catch (InvalidOperationException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Create Stock.");
                throw new ApplicationException("Không thể thêm thuốc.", ex);
            }
        }

        public async Task<StockDTO?> UpdateAsync(Guid id, UpdateStockDTO dto)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));
            ArgumentNullException.ThrowIfNull(dto);

            // Kiểm tra tên thuốc trùng
            var nameExists = await _stockRepo.ExistsByMedicineNameAsync(dto.MedicineName, excludeId: id);
            if (nameExists)
                throw new InvalidOperationException(
                    $"Thuốc '{dto.MedicineName}' đã tồn tại trong kho.");

            // Kiểm tra mã thuốc trùng (bỏ qua chính nó)
            if (!string.IsNullOrWhiteSpace(dto.MedicineCode))
            {
                var exists = await _stockRepo.ExistsByMedicineNameAsync(dto.MedicineCode, excludeId: id);
                if (exists)
                    throw new InvalidOperationException(
                        $"Mã thuốc '{dto.MedicineCode}' đã tồn tại.");
            }

            try
            {
                var stock = await _stockRepo.GetByIdAsync(id);
                if (stock is null) return null;

                stock.MedicineName = dto.MedicineName.Trim();
                stock.MedicineCode = dto.MedicineCode?.Trim().ToUpper();
                stock.Unit = dto.Unit?.Trim();
                stock.Manufacturer = dto.Manufacturer?.Trim();
                stock.Quantity = dto.Quantity;
                stock.MinQuantity = dto.MinQuantity;
                stock.UnitPrice = dto.UnitPrice;
                stock.IsActive = dto.IsActive;

                var updated = await _stockRepo.UpdateAsync(stock);
                return MapToDTO(updated);
            }
            catch (ArgumentException) { throw; }
            catch (KeyNotFoundException) { throw; }
            catch (InvalidOperationException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Update Stock Id: {Id}", id);
                throw new ApplicationException("Không thể cập nhật thuốc.", ex);
            }
        }

        // Nhập thêm hàng vào kho
        public async Task<StockDTO?> ImportAsync(Guid id, ImportStockDTO dto)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));
            ArgumentNullException.ThrowIfNull(dto);

            try
            {
                var stock = await _stockRepo.GetByIdAsync(id);
                if (stock is null) return null;

                stock.Quantity += dto.Quantity;

                var updated = await _stockRepo.UpdateAsync(stock);
                return MapToDTO(updated);
            }
            catch (ArgumentException) { throw; }
            catch (KeyNotFoundException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Import Stock Id: {Id}", id);
                throw new ApplicationException("Không thể nhập hàng.", ex);
            }
        }

        public async Task<bool> ToggleActiveAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));
            try
            {
                return await _stockRepo.ToggleActiveAsync(id);
            }
            catch (ArgumentException) { throw; }
            catch (InvalidOperationException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi ToggleActive Stock Id: {Id}", id);
                throw new ApplicationException("Không thể thay đổi trạng thái thuốc.", ex);
            }
        }
        public async Task<PagedResult<StockDTO>> GetPagedAsync(StockQueryParams query)
        {
            try
            {
                var (items, total) = await _stockRepo.GetPagedAsync(query);
                return new PagedResult<StockDTO>
                {
                    Items = items.Select(MapToDTO).ToList(),
                    Page = query.Page,
                    PageSize = query.PageSize,
                    TotalItems = total
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetPaged Stock.");
                throw new ApplicationException("Không thể lấy danh sách thuốc.", ex);
            }
        }
        private static StockDTO MapToDTO(Stock s) => new()
        {
            Id = s.Id,
            MedicineName = s.MedicineName,
            MedicineCode = s.MedicineCode,
            Unit = s.Unit,
            Manufacturer = s.Manufacturer,
            Quantity = s.Quantity,
            MinQuantity = s.MinQuantity,
            UnitPrice = s.UnitPrice,
            IsActive = s.IsActive
        };
    }
}