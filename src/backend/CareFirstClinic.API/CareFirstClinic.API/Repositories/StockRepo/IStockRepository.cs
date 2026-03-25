using CareFirstClinic.API.Common;
using CareFirstClinic.API.Models;

namespace CareFirstClinic.API.Repositories.StockRepo
{
    public interface IStockRepository
    {
        Task<List<Stock>> GetAllAsync();
        Task<Stock?> GetByIdAsync(Guid id);
        Task<Stock?> GetByMedicineCodeAsync(string code);
        Task<List<Stock>> GetLowStockAsync();
        Task<bool> ExistsByMedicineNameAsync(string name, Guid? excludeId = null);            
        Task<Stock> AddAsync(Stock stock);
        Task<Stock> UpdateAsync(Stock stock);
        Task<bool> ToggleActiveAsync(Guid id);
        Task<(List<Stock> Items, int Total)> GetPagedAsync(StockQueryParams query);
    }
}