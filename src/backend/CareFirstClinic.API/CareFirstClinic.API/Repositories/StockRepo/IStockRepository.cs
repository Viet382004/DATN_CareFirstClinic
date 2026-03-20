using CareFirstClinic.API.Models;

namespace CareFirstClinic.API.Repositories.StockRepo
{
    public interface IStockRepository
    {
        Task<List<Stock>> GetAllAsync();
        Task<Stock?> GetByIdAsync(Guid id);
        Task<Stock?> GetByMedicineCodeAsync(string code);
        Task<List<Stock>> GetLowStockAsync();
        Task<bool> ExistsByMedicineCodeAsync(string code, Guid? excludeId = null);
        Task<Stock> AddAsync(Stock stock);
        Task<Stock> UpdateAsync(Stock stock);
        Task<bool> ToggleActiveAsync(Guid id);
    }
}