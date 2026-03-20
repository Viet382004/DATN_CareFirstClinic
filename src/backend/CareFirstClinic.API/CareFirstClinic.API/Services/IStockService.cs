using CareFirstClinic.API.DTOs;

namespace CareFirstClinic.API.Services
{
    public interface IStockService
    {
        Task<List<StockDTO>> GetAllAsync();
        Task<StockDTO?> GetByIdAsync(Guid id);
        Task<List<StockDTO>> GetLowStockAsync();
        Task<StockDTO> CreateAsync(CreateStockDTO dto);
        Task<StockDTO?> UpdateAsync(Guid id, UpdateStockDTO dto);
        Task<StockDTO?> ImportAsync(Guid id, ImportStockDTO dto);
        Task<bool> ToggleActiveAsync(Guid id);
    }
}